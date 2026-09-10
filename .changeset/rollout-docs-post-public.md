---
"portfolio": patch
---

Correct the deploy story in the docs after the public split: `deploy.yml` only builds and
publishes the per-environment image to GHCR (`ghcr.io/spockey4711/portfolio-public`,
`dev-/prod-sha-<sha>` plus moving `-latest`); this public repo holds no deploy credentials,
so rolling an image onto the server is a manual SSH step (`deploy-remote.sh` in the
environment's compose project). Updates the release runbook (step 6 is now "roll out and
verify"), the git-workflow branching/lifecycle notes, CLAUDE.md, CONTRIBUTING.md and the
dependency-updates note, which all still claimed merges deploy automatically.
