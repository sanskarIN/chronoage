# GitHub Repository Maintenance

## Recommended branch protection for `main`

Configure in repository settings:

- Require a pull request before merging for collaborative work.
- Require the `Format, lint, types, tests, build` and `Playwright E2E` CI checks.
- Require CodeQL when the repository security configuration exposes it as a required check.
- Require conversation resolution.
- Block force pushes and branch deletion.
- Allow administrators to bypass only for genuine repository recovery.

## Merge strategy

Prefer squash merges for routine pull requests so each PR lands as one coherent change. Preserve direct atomic commits when maintaining the repository as a solo project and the history is already reviewable.

## Labels

Recommended labels:

- `bug`
- `enhancement`
- `documentation`
- `accessibility`
- `security`
- `performance`
- `dependencies`
- `good first issue`
- `help wanted`
- `needs-triage`

## Milestones

Create milestones for `v1.1`, `v1.2`, and `v2.0` only when there are concrete issues to track. Avoid empty/artificial milestones.

## Discussions

If GitHub Discussions is enabled, suggested categories are Announcements, Ideas, Q&A, and Show and Tell. Keep bug reports in Issues so they remain actionable.

## Releases

Use semantic tags (`v1.0.1`, `v1.1.0`, etc.). The release workflow verifies and attaches the static web artifact.
