# Deployment

**Purpose:** what this public repository does when code lands on `master` or
`develop`. It does not describe how an image is rolled onto a server.

Related: [environment variables](environment-variables.md) ·
[releases](../engineering/releases.md) · [`.github/workflows/deploy.yml`](../../.github/workflows/deploy.yml)

## What the workflow does

[`.github/workflows/deploy.yml`](../../.github/workflows/deploy.yml) runs on push to
`master` and `develop`. It builds a production Docker image and publishes it to
the GitHub Container Registry (GHCR). The workflow comments state why the branches
do not share an image: `NEXT_PUBLIC_SITE_URL` is inlined at build time.

- `master` is the production image (apex domain, as the workflow comment describes).
- `develop` is the preview image (preview subdomain, as the workflow comment describes).

Optional build-time variables, named in the workflow and left unset if absent:
`NEXT_PUBLIC_ANALYTICS_SRC`, `NEXT_PUBLIC_ANALYTICS_WEBSITE_ID`,
`NEXT_PUBLIC_SENTRY_DSN`. See [environment variables](environment-variables.md).

## What the workflow does not do

It does not SSH, restart a process, or change DNS. The workflow header says rollout
is handled outside this public repo so that deploy credentials are not stored here.
This checkout has no host, no SSH user, and no proof that https://yannikwuenker.de
serves the image built from the current commit.

Do not add server paths, keys, or a guessed rollout procedure to this file.

## Local image

Building the same Dockerfile locally is described in
[local development](local-development.md). That is not a production deploy.
