# Analytics (self-hosted Umami)

**Purpose:** the runbook to stand up privacy-friendly, cookieless web analytics for the
site (S2-5) and wire the tracking tag into the app. The tool is
[Umami](https://umami.is), self-hosted on the same Contabo VPS. The decision and its
trade-offs live in [ADR-0008](../../private-docs/docs/architecture/decisions/0008-analytics.md).

Related: [deployment](../../private-docs/docs/operations/deployment.md) · [server-setup](../../private-docs/docs/operations/server-setup.md) ·
[environment variables](../../private-docs/docs/operations/environment-variables.md) ·
[ADR-0002 hosting](../../private-docs/docs/architecture/decisions/0002-hosting.md)

> **Why this exists.** Server logfiles answer "is the box up", not "which projects do
> people actually open". Umami gives that in aggregate - cookieless, no personal profiles,
> data on my own server - so the backlog can be groomed on evidence (S6-6) instead of
> guesswork. Add it only while it earns its keep; if it stops driving decisions, tear it
> down and revert the Datenschutz section.

## Architecture

```
analytics.yannikwuenker.de ──TLS──▶ Nginx ──▶ 127.0.0.1:3001 ──▶ Umami container
                                                                     └─▶ Postgres (umami-db)
```

- A **separate** Docker stack from the app ([`deploy/analytics/docker-compose.yml`](../../deploy/analytics/docker-compose.yml)):
  its own datastore and lifecycle, **not** built or deployed by the app's CI.
- Umami binds to **loopback only** (`127.0.0.1:3001`); Nginx is the sole public entry
  point, same pattern as the app (`:3000`). The firewall stays `22/80/443` only.
- The app loads Umami's tracking script from `analytics.yannikwuenker.de`. The script is
  cookieless and stores no IP; see the Datenschutz section (`content/legal.ts`).

The steps below assume the box is already provisioned per
[server-setup](../../private-docs/docs/operations/server-setup.md) (Docker, Nginx, certbot, ufw, the `yannik` user).

## 1. DNS

At the registrar, point an `analytics` subdomain at the server (same IP as the app):

| Type   | Name        | Value           | Notes                       |
|--------|-------------|-----------------|-----------------------------|
| `A`    | `analytics` | `<SERVER_IP>`   | analytics subdomain → server |
| `AAAA` | `analytics` | `<SERVER_IPv6>` | optional, if the VPS has IPv6 |

Wait for propagation before requesting TLS:

```bash
dig +short analytics.yannikwuenker.de   # must return <SERVER_IP>
```

## 2. Bring up the Umami stack

Place the stack under `/opt/containers/umami` on the box (owned by `yannik`) and copy the
two files from the repo (`deploy/analytics/docker-compose.yml` and `.env.example`):

```bash
mkdir -p /opt/containers/umami
cd /opt/containers/umami
# copy docker-compose.yml and .env.example here (scp from your machine, or paste)
cp .env.example .env
```

Fill in `.env` with strong, unique values, then lock it down:

```bash
# POSTGRES_PASSWORD and APP_SECRET - generate fresh values:
openssl rand -hex 24       # -> POSTGRES_PASSWORD (hex: URL-safe, see note below)
openssl rand -base64 36    # -> APP_SECRET
nano .env                  # paste both in
chmod 600 .env
```

> **POSTGRES_PASSWORD must be URL-safe.** It is interpolated raw into
> `DATABASE_URL` (`postgresql://umami:<password>@umami-db:5432/umami`), so a `+`,
> `/` or `=` - all of which `openssl rand -base64` emits - breaks URL parsing and
> Umami crash-loops with `TypeError: Invalid URL` in `check-db`. `openssl rand
> -hex 24` avoids this (hex is `0-9a-f` only). `APP_SECRET` is not in a URL, so
> base64 is fine there.

Start it and confirm health:

```bash
docker compose up -d
docker compose ps                                   # both services "healthy" after ~40s
curl -sSf http://127.0.0.1:3001/api/heartbeat && echo " umami up"
```

## 3. Nginx reverse proxy + TLS

Add a server block that proxies the subdomain to the container, then let certbot add TLS
(same approach as the app in [server-setup step 8-9](../../private-docs/docs/operations/server-setup.md#8-nginx-reverse-proxy)):

```bash
sudo nano /etc/nginx/sites-available/analytics.yannikwuenker.de
```

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name analytics.yannikwuenker.de;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/analytics.yannikwuenker.de /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d analytics.yannikwuenker.de \
  --agree-tos -m mail@yannikwuenker.de --redirect --no-eff-email
```

## 4. First login and the website id

1. Open `https://analytics.yannikwuenker.de` and sign in with Umami's default admin
   (`admin` / `umami`). **Change the password immediately** (Settings → Profile).
2. Settings → **Websites** → **Add website**. Name it (e.g. "Portfolio") and set the
   domain to the app's domain (`portfolio.yannikwuenker.de` during development, later
   `yannikwuenker.de`).
3. Open the website's **Edit** view: copy the **Website ID** (a UUID) and note the script
   URL, which is `https://analytics.yannikwuenker.de/script.js`.

## 5. Wire the app

The tag is off until a build is given both values (they are inlined at build time, like
`NEXT_PUBLIC_SITE_URL`). Set them as GitHub Actions **variables** (non-secret) so the
deploy workflow bakes them in:

- `NEXT_PUBLIC_ANALYTICS_SRC = https://analytics.yannikwuenker.de/script.js`
- `NEXT_PUBLIC_ANALYTICS_WEBSITE_ID = <the UUID from step 4>`

Then trigger a deploy (push to `develop`, or re-run the deploy workflow) so a new image is
built with the values inlined. For a **local** check, put the same two vars in `.env.local`
and run `pnpm build && pnpm start`.

With either value unset the app renders no tag and makes zero analytics requests
(`lib/config/analytics.ts`), so this step is the actual on/off switch.

## 6. Verify (acceptance)

- Load the site, then reload; within a minute the visit appears on the Umami dashboard.
- DevTools → Application → Cookies: **no** analytics cookie is set by the site.
- DevTools → Network: `script.js` loads from `analytics.yannikwuenker.de` and the tracking
  request returns `200`.
- Lighthouse performance stays within budget (the tag is a small, deferred script).
- `curl http://<SERVER_IP>:3001` from your laptop refuses/times out (loopback + ufw).

## 7. Operations

- **Updates:** `cd /opt/containers/umami && docker compose pull && docker compose up -d`.
- **Backup:** the only state is Postgres. Dump it periodically:

  ```bash
  cd /opt/containers/umami
  docker compose exec -T umami-db pg_dump -U umami umami | gzip > umami-$(date +%F).sql.gz
  ```

- **Restore:** `gunzip -c umami-YYYY-MM-DD.sql.gz | docker compose exec -T umami-db psql -U umami -d umami`.
- **Tear-down:** to remove analytics, unset the two Actions variables and redeploy (tag
  gone), then `docker compose down` the stack and revert the Datenschutz "Webanalyse mit
  Umami" section (`content/legal.ts`).

## Troubleshooting

- **No data in the dashboard** — the build did not receive the two vars (check the Actions
  variables and that a fresh image was deployed), or the website domain in Umami does not
  match the site's host.
- **502 on the analytics subdomain** — the container is down or not on `127.0.0.1:3001`;
  check `docker compose ps` and `docker compose logs umami`.
- **Umami restart-loops / `TypeError: Invalid URL` in `check-db`** (heartbeat resets the
  connection, `docker compose ps` shows `Restarting`) — `POSTGRES_PASSWORD` contains a URL-
  unsafe character (`+`, `/`, `=`) that breaks `DATABASE_URL`. Regenerate it with `openssl
  rand -hex 24`, update `.env`, then re-init the DB volume so Postgres picks up the new
  password: `docker compose down -v && docker compose up -d` (the `-v` wipes analytics data,
  fine on first setup).
- **certbot fails** — DNS has not propagated or ufw blocks `80`; re-check
  `dig +short analytics.yannikwuenker.de` and `sudo ufw status`.
