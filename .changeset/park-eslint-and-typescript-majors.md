---
"portfolio": patch
---

Park the `eslint` 10 and `typescript` 7 majors in `.github/dependabot.yml` instead of
leaving two permanently red PRs open. Both are blocked by the same upstream thing and by
nothing in this repo: ESLint 10 removed `context.getFilename()`, which `eslint-plugin-react`
still calls, and the latest releases of the react, jsx-a11y and import plugins all still cap
at `eslint ^9`; `typescript-eslint` refuses TS 7 outright and peers `typescript <6.1.0` up
to and including its latest release. All three plugins arrive through `eslint-config-next`,
which is already current, so neither bump can be taken by editing anything here. Worth
recording: `tsc --noEmit` already passes cleanly on TS 7, so the app code is ready and only
the lint step blocks. The ignore entries are declarative rather than
`@dependabot ignore` comments so the reason stays visible in the repo, and the docs gain a
"parked majors" section naming the condition for lifting each one.
