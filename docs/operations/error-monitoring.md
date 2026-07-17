# Error & uptime monitoring (self-hosted GlitchTip + Uptime Kuma)

**Purpose:** the runbook to stand up privacy-friendly error tracking and uptime monitoring
for the site (S6-2) and wire the error SDK into the app. The tools are
[GlitchTip](https://glitchtip.com) (Sentry-API compatible error tracking) and
[Uptime Kuma](https://github.com/louislam/uptime-kuma) (uptime checks + a public status
page), both self-hosted on the same Contabo VPS. The decision and its trade-offs live in
[ADR-0009](../architecture/decisions/0009-error-and-uptime-monitoring.md).

Related: [analytics](analytics.md) · [deployment](deployment.md) ·
[server-setup](server-setup.md) · [environment variables](environment-variables.md) ·
[ADR-0002 hosting](../architecture/decisions/0002-hosting.md)

> **Why this exists.** The widget failures already log a greppable `[widget:<name>]` line
> (S6-1), but that is the only signal: no client-error capture, no dashboard, no alert when
> the box goes down. Over the site's multi-year life a broken build or a dead container
> could sit unnoticed until a visitor hits it. GlitchTip captures client and server errors
> in one dashboard; Uptime Kuma pings the app and alerts on downtime and publishes a small
> status page. Both stay self-hosted, cookieless and consent-free - if they stop earning
> their keep, tear them down and revert the Datenschutz section.

## Architecture

```
errors.yannikwuenker.de ──TLS──▶ Nginx ──▶ 127.0.0.1:3003 ──▶ GlitchTip web
                                                                 ├─▶ Postgres (glitchtip-postgres)
                                                                 ├─▶ Redis (glitchtip-redis)
                                                                 └─▶ worker (celery + beat)

status.yannikwuenker.de ──TLS──▶ Nginx ──▶ 127.0.0.1:3004 ──▶ Uptime Kuma

Browser errors ──▶ https://<app>/monitoring (same-origin tunnel) ──▶ GlitchTip ingest
```

- Two **separate** Docker stacks from the app, each with its own datastore and lifecycle,
  **not** built or deployed by the app's CI:
  [`deploy/error-tracking/docker-compose.yml`](../../deploy/error-tracking/docker-compose.yml)
  and [`deploy/uptime/docker-compose.yml`](../../deploy/uptime/docker-compose.yml).
- Both bind to **loopback only** (`127.0.0.1:3003` / `127.0.0.1:3004`); Nginx is the sole
  public entry point, same pattern as the app (`:3000`/`:3002`) and Umami (`:3001`). The
  firewall stays `22/80/443` only.
- The app's browser SDK does **not** talk to GlitchTip directly: it tunnels error envelopes
  through the app's own origin (`/monitoring`, set by `next.config.ts` `tunnelRoute`), so the
  GlitchTip host never appears client-side and ad-blockers do not drop reports.

The steps below assume the box is already provisioned per
[server-setup](server-setup.md) (Docker, Nginx, certbot, ufw, the `yannik` user).

## 1. DNS

At the registrar, point two subdomains at the server (same IP as the app):

| Type   | Name      | Value           | Notes                          |
|--------|-----------|-----------------|--------------------------------|
| `A`    | `errors`  | `<SERVER_IP>`   | GlitchTip dashboard → server   |
| `A`    | `status`  | `<SERVER_IP>`   | Uptime Kuma status page → server |
| `AAAA` | `errors`  | `<SERVER_IPv6>` | optional, if the VPS has IPv6  |
| `AAAA` | `status`  | `<SERVER_IPv6>` | optional, if the VPS has IPv6  |

Wait for propagation before requesting TLS:

```bash
dig +short errors.yannikwuenker.de   # must return <SERVER_IP>
dig +short status.yannikwuenker.de   # must return <SERVER_IP>
```

## 2. Bring up the GlitchTip stack

Place the stack under `/opt/containers/glitchtip` on the box (owned by `yannik`) and copy the
two files from the repo (`deploy/error-tracking/docker-compose.yml` and `.env.example`):

```bash
mkdir -p /opt/containers/glitchtip
cd /opt/containers/glitchtip
# copy docker-compose.yml and .env.example here (scp from your machine, or paste)
cp .env.example .env
```

Fill in `.env` with strong, unique values, then lock it down:

```bash
openssl rand -hex 24   # -> POSTGRES_PASSWORD (hex: URL-safe, see note below)
openssl rand -hex 32   # -> SECRET_KEY
nano .env              # paste both in; set GLITCHTIP_DOMAIN + DEFAULT_FROM_EMAIL
chmod 600 .env
```

> **POSTGRES_PASSWORD must be URL-safe.** It is interpolated raw into `DATABASE_URL`
> (`postgres://glitchtip:<password>@...`), so a `+`, `/` or `=` breaks URL parsing and the
> stack crash-loops. `openssl rand -hex 24` avoids this (hex is `0-9a-f` only). `SECRET_KEY`
> is not in a URL, but keeping it hex is simplest.

Apply migrations once, then start the long-running services and confirm health:

```bash
docker compose up glitchtip-migrate      # runs DB migrations, then exits 0
docker compose up -d                      # web, worker, postgres, redis
docker compose ps                         # all "healthy"/"running" after ~1 min
curl -sSf http://127.0.0.1:3003/_health/ && echo " glitchtip up"
```

## 3. Bring up the Uptime Kuma stack

```bash
mkdir -p /opt/containers/uptime-kuma
cd /opt/containers/uptime-kuma
# copy docker-compose.yml here (the .env is optional; Uptime Kuma is UI-configured)
docker compose up -d
docker compose ps                         # "healthy" after ~40s
```

## 4. Nginx reverse proxy + TLS

Add a server block per subdomain, proxying to the loopback port, then let certbot add TLS
(same approach as [analytics step 3](analytics.md#3-nginx-reverse-proxy--tls) and
[server-setup step 8-9](server-setup.md#8-nginx-reverse-proxy)):

```nginx
# /etc/nginx/sites-available/errors.yannikwuenker.de  → proxy_pass http://127.0.0.1:3003;
# /etc/nginx/sites-available/status.yannikwuenker.de  → proxy_pass http://127.0.0.1:3004;
server {
    listen 80;
    listen [::]:80;
    server_name errors.yannikwuenker.de;   # (and a second block for status.…:3004)

    location / {
        proxy_pass http://127.0.0.1:3003;
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        # Uptime Kuma's live dashboard needs WebSocket upgrade; harmless for GlitchTip.
        proxy_set_header Upgrade           $http_upgrade;
        proxy_set_header Connection        "upgrade";
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/errors.yannikwuenker.de /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/status.yannikwuenker.de /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d errors.yannikwuenker.de -d status.yannikwuenker.de \
  --agree-tos -m mail@yannikwuenker.de --redirect --no-eff-email
```

## 5. GlitchTip first login and the DSN

1. Open `https://errors.yannikwuenker.de` and register the first account. It becomes the
   admin. Registration is closed to everyone else (`ENABLE_OPEN_USER_REGISTRATION=false`).
2. Create an **Organization**, then a **Project** (platform: JavaScript / Next.js). Name it
   e.g. "Portfolio".
3. Open the project's **Settings → Client Keys (DSN)** and copy the **DSN**
   (`https://<public-key>@errors.yannikwuenker.de/<project-id>`). This is a public ingest
   key, not a secret.

## 6. Wire the app

The SDK is off until a build is given the DSN (inlined at build time, like the analytics
vars). Set it as a GitHub Actions **variable** (non-secret) so the deploy workflow bakes it
in:

- `NEXT_PUBLIC_SENTRY_DSN = https://<public-key>@errors.yannikwuenker.de/<project-id>`

Then trigger a deploy (push to `develop`, or re-run the deploy workflow) so a new image is
built with the value inlined. For a **local** check, put the same var in `.env.local` and run
`pnpm build && pnpm start`.

With the DSN unset the app initialises no SDK and makes zero error-tracking requests
(`lib/config/error-tracking.ts`), so this step is the actual on/off switch.

## 7. Uptime Kuma monitors, alerts and status page

In the Uptime Kuma UI (`https://status.yannikwuenker.de`), on first load create the admin
account, then:

1. **Notification** (Settings → Notifications): add an e-mail (SMTP), Telegram or webhook
   channel. Without one, downtime is recorded but not pushed.
2. **Monitors** (+ Add): one HTTP(s) monitor each, all with the notification attached:
   - `https://yannikwuenker.de/api/health` (production liveness)
   - `https://portfolio.yannikwuenker.de/api/health` (dev/preview liveness)
   - `https://analytics.yannikwuenker.de/api/heartbeat` (Umami)
   - `https://errors.yannikwuenker.de/_health/` (GlitchTip)

   Use a 60s interval and "accept 200" so a `200 {"status":"ok"}` is the up condition.
3. **Status page** (Status Pages → New): add the app monitors, publish it. This is the small
   public status signal S6-2 asks for.

## 8. Verify (acceptance)

- **Server error captured:** temporarily throw in a route handler (or hit a known-500 path),
  reload; within a minute the issue appears in the GlitchTip dashboard.
- **Client error captured:** trigger a client-side throw (e.g. a dev-only throwing component);
  the issue appears, and DevTools → Network shows the report going to `/monitoring` on the
  app's own origin, **not** to `errors.…` directly.
- **No cookie / no PII:** DevTools → Application → Cookies: the site sets **no** error-tracking
  cookie; the captured event carries no IP (scrubbed in `lib/observability/sentry.ts`).
- **Uptime alert:** stop the app container (`docker compose stop web`) on the box; within an
  interval Uptime Kuma flips the monitor red and fires the notification. Start it again to
  recover.
- **Loopback only:** `curl http://<SERVER_IP>:3003` and `:3004` from your laptop
  refuse/time out (loopback + ufw).
- Lighthouse performance stays within budget (the SDK is errors-only, no tracing/replay).

## 9. Operations

- **Updates:** `cd /opt/containers/glitchtip && docker compose pull && docker compose up
  glitchtip-migrate && docker compose up -d`; `cd /opt/containers/uptime-kuma && docker
  compose pull && docker compose up -d`.
- **Backup (GlitchTip):** the state is Postgres. Dump it periodically:

  ```bash
  cd /opt/containers/glitchtip
  docker compose exec -T glitchtip-postgres pg_dump -U glitchtip glitchtip | gzip > glitchtip-$(date +%F).sql.gz
  ```

- **Backup (Uptime Kuma):** its state is the `uptime-kuma-data` volume (SQLite); snapshot the
  volume or copy `/app/data` out of the container.
- **Tear-down:** unset the `NEXT_PUBLIC_SENTRY_DSN` Actions variable and redeploy (SDK inert),
  then `docker compose down` both stacks and revert the Datenschutz "Fehler- und
  Verfügbarkeitsüberwachung" section (`content/legal.ts`).

## Same-box blind spot

Uptime Kuma runs on the **same** VPS as the app. A total-host outage (kernel panic, network
loss, the box off) takes the watcher down with it, so no alert fires for exactly that case.
The complement is an **external** vantage point (a free UptimeRobot check, or Uptime Kuma on
a second cheap host) pointed at `https://yannikwuenker.de/api/health`. It is out of scope for
the initial S6-2 delivery but worth adding if total-box outages become a concern.

## Optional: source-map upload

Client stack traces are minified because source-map upload is deliberately off (it would
need a build-time auth token, and the build must succeed with no secrets). To enable later,
create a GlitchTip auth token, pass it and `sentryUrl: https://errors.yannikwuenker.de` to
`withSentryConfig` in `next.config.ts`, and provide the token as a build secret only where a
secret is acceptable (never in a public build arg).

## Troubleshooting

- **No events in the dashboard** — the build did not receive the DSN (check the Actions
  variable and that a fresh image was deployed), or the browser blocked the report (confirm it
  goes to `/monitoring`, not `errors.…`).
- **502 on errors./status.** — the container is down or not on its loopback port; check
  `docker compose ps` and `docker compose logs`.
- **GlitchTip restart-loops / `Invalid URL`** — `POSTGRES_PASSWORD` contains a URL-unsafe
  character (`+`, `/`, `=`). Regenerate with `openssl rand -hex 24`, update `.env`, then
  re-init the DB volume: `docker compose down -v && docker compose up glitchtip-migrate &&
  docker compose up -d` (the `-v` wipes error data, fine on first setup).
- **Uptime Kuma dashboard won't load / disconnects** — the Nginx block is missing the
  WebSocket `Upgrade`/`Connection` headers (see step 4).
- **certbot fails** — DNS has not propagated or ufw blocks `80`; re-check `dig +short` and
  `sudo ufw status`.
