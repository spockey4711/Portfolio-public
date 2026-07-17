#!/usr/bin/env bash
# Deploy the portfolio container on the Contabo VPS from a GHCR image.
#
# Run over SSH by .github/workflows/deploy.yml from the compose project dir
# (/opt/containers/portfolio for preview, /opt/containers/portfolio-prod for
# production, where the deploy step first copies the compose files and this
# script). Expects:
#   IMAGE_TAG  - the immutable image tag to deploy (e.g. dev-sha-abc1234)
#   HOST_PORT  - the loopback port this environment binds (3000 preview, 3002
#                production); defaults to 3000.
#
# The box must already be logged in to GHCR (one-time `docker login ghcr.io`
# with a read:packages token) so the private image can be pulled. The runtime
# .env (mode 600, holding NEXT_PUBLIC_SITE_URL) stays on the server and is read
# by the base compose file's env_file.
set -euo pipefail

: "${IMAGE_TAG:?IMAGE_TAG is required}"
export IMAGE_TAG
HOST_PORT="${HOST_PORT:-3000}"
export HOST_PORT

compose() {
  docker compose -f docker-compose.yml -f docker-compose.prod.yml "$@"
}

echo "Deploying ghcr.io/spockey4711/portfolio2:${IMAGE_TAG}"
compose pull
compose up -d --remove-orphans

# Health check: wait for the app to answer on loopback before declaring success.
echo "Waiting for the container to become healthy on 127.0.0.1:${HOST_PORT}..."
for _ in $(seq 1 30); do
  if curl -fsS --max-time 5 "http://127.0.0.1:${HOST_PORT}/" >/dev/null 2>&1; then
    echo "App is healthy."
    # Reclaim disk from dangling layers only; keep prior tags for rollback.
    docker image prune -f >/dev/null
    exit 0
  fi
  sleep 2
done

echo "Health check failed after deploy (no 200 on 127.0.0.1:${HOST_PORT} within 60s)." >&2
compose logs --tail=50 web >&2 || true
exit 1
