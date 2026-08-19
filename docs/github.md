# GitHub Repository Operations

ChronoAge keeps repository settings conservative so the public project stays reviewable, secure, and easy to contribute to. Some controls live in GitHub settings rather than version-controlled files, so this document records the intended configuration and distinguishes recommendations from settings that have actually been verified.

## Default branch

Use `main` as the default branch.

### Current protection status

As verified through the GitHub repository API on 2026-08-19, `main` is the default branch but is currently reported as **unprotected**, with required status-check enforcement off. The rules below are therefore the intended production configuration, not a claim that GitHub is already enforcing them.

Before treating `main` as a protected release branch, enable an equivalent branch ruleset/protection policy in repository settings and verify the effective rule state from GitHub. Once enabled, normal feature work should flow through pull requests rather than relying on direct pushes.

Recommended branch protection/ruleset for `main`:

- require a pull request before merging for normal contributor changes;
- require at least one approving review when more than one maintainer is available;
- dismiss stale approvals after material new commits when practical;
- require conversation resolution before merge;
- require the CI quality and Playwright E2E checks to pass;
- require CodeQL/security checks when GitHub exposes them as required checks;
- block force pushes and branch deletion;
- require branches to be up to date when doing so does not create excessive merge churn;
- allow repository administrators to bypass only for genuine incident/recovery situations;
- do not weaken required checks merely to merge a failing change.

For a solo-maintained repository, GitHub may make review-count requirements inconvenient. Keep required automated checks and force-push protection even if the human-review requirement must temporarily remain optional.

## Merge strategy

Prefer squash merge for contributor pull requests when a PR contains noisy fix-up commits. Preserve deliberately atomic commits when their history is useful. Conventional Commit-style subjects are encouraged for repository history and release-note clarity.

Do not enable automatic merging unless required checks and review rules are configured first.

## Suggested labels

Use a small maintainable label set rather than dozens of overlapping categories:

- `bug` — confirmed defect;
- `feature` — user-visible capability;
- `enhancement` — improvement to existing behavior;
- `accessibility` — keyboard, assistive technology, contrast, motion, or semantic UI work;
- `security` — security hardening or coordinated remediation; do not put undisclosed vulnerability details in public issues;
- `privacy` — local-data/privacy behavior;
- `date-math` — calendar, timezone, DST, leap-year, or milestone logic;
- `pwa` — service worker, install, offline, or update lifecycle;
- `testing` — unit/component/E2E/benchmark work;
- `documentation` — docs-only changes;
- `dependencies` — dependency maintenance, including Dependabot work;
- `good first issue` — narrow contribution with clear acceptance criteria;
- `help wanted` — maintainers welcome assistance;
- `blocked` — cannot progress until a named dependency/decision is resolved.

Use one primary type label plus relevant domain labels. Avoid labels that merely duplicate issue status text.

## Milestones

Create GitHub milestones only for a real release or bounded body of work. Recommended examples:

- `v1.x maintenance` for compatible fixes/polish;
- a specific future minor release when scope is accepted;
- a native-wrapper milestone only after ADR-0006's adoption gate is actually met.

Every milestone should have a short outcome statement and should be closed rather than left indefinitely open after the associated release is complete.

## GitHub Discussions

If Discussions is enabled, suggested categories are:

- **Announcements** — maintainer release/project notices;
- **Ideas** — early product proposals that are not yet implementation-ready issues;
- **Q&A** — setup, usage, contribution, and date-semantics questions;
- **Show and tell** — community demos or integrations.

Security reports must never be routed through public Discussions. Use the process in `SECURITY.md`.

## Issues and pull requests

Version-controlled issue forms and the pull-request template live under `.github/`.

Before accepting an issue as a bug, request a reproducible input and expected result when date semantics are involved. Avoid asking users to post private profile backup data publicly; use minimal fictional dates when a reproduction can be expressed without personal information.

Pull requests should:

- keep one coherent purpose;
- include regression coverage for behavior changes;
- run the documented quality commands;
- update user/developer documentation when semantics change;
- avoid generated secrets, personal backup files, browser profiles, screenshots with private data, and unrelated build output.

## Dependabot and supply chain

Dependabot configuration is checked into `.github/dependabot.yml`. Dependency-review and CodeQL workflows are kept separate from normal CI so their permissions remain explicit.

Review automated updates instead of merging solely because they are generated by a bot. Pay special attention to build tooling, browser automation, service-worker behavior, and accessibility-engine rule changes.

## Releases

Release tags use `vMAJOR.MINOR.PATCH`. The tag workflow reruns the full non-E2E suite, runtime dependency audit, Chromium journeys, and accessibility checks before creating a GitHub Release.

Do not advertise a release as verified when its required workflow is failing or unavailable. See [release.md](release.md).

## Repository secrets and environments

The current web/PWA build requires no production application secret. Keep that property unless a future feature has a documented need.

If signing/deployment credentials are introduced later:

- use GitHub Actions secrets or environment-scoped secrets;
- grant least-privilege access;
- protect production environments with review rules where suitable;
- never echo secrets in scripts/logs;
- document rotation/revocation;
- never commit signing keys or generated credentials.
