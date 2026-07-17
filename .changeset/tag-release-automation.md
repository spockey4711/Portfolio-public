---
"portfolio": patch
---

Automate the post-merge release chores. A new `tag-release.yml` workflow runs on the `master`
push from the release PR: it tags `vX.Y.Z` from `package.json` (if not already tagged) and opens
a release-log PR into `develop` recording the promotion. Cutting a release is now just merging
the release PR - the deploy, the tag and the release-log entry follow automatically.
