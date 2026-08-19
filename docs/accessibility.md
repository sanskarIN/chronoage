# Accessibility

ChronoAge targets WCAG-oriented inclusive design rather than treating accessibility as a final polish step.

## Implemented baseline

- Semantic native date/time inputs and buttons.
- Visible keyboard focus indicators.
- Skip-to-content link.
- Keyboard-operable primary navigation and quick actions.
- `Ctrl/Cmd + K` quick actions and `Escape` dismissal after onboarding is complete.
- Quick-actions focus moves into the modal on open, wraps within its actions, and returns to the prior control on close.
- First-run onboarding focuses its start action, contains Tab/Shift+Tab focus, and blocks background quick-action shortcuts while the modal is active.
- Background application regions are marked `inert` while onboarding or quick actions are blocking interaction, preventing keyboard and assistive-technology traversal into obscured controls.
- The main content is `inert` while the mobile navigation drawer is open so keyboard focus remains with the active navigation layer.
- The skip link is removed from the tab sequence while a blocking overlay prevents access to its destination.
- ARIA live/status regions for calculation/share feedback.
- Errors are communicated with text, not color alone.
- Light/dark/system theme support.
- User setting and system media-query support for reduced motion.
- High-contrast preference that strengthens boundaries.
- Responsive typography and touch targets.
- Dialog labeling for onboarding and quick actions.
- Accessible text alternative for the calendar-duration visualization.
- Free-form timezone fields preserve visible labels, inline error descriptions, and `aria-invalid` state.
- Playwright smoke checks for primary landmarks, skip navigation, heading structure, accessible control names, input labels, and image alternative text.
- Maintained axe-core browser audits for WCAG 2.x A/AA rule tags across every core application page.

## Automated checks

`tests/e2e/accessibility.spec.ts` runs with the normal Playwright suite.

The first layer contains product-specific structural checks that make failures easy to diagnose, such as unnamed buttons, unlabeled form controls, missing image `alt` attributes, or removal of the main navigation/skip-link structure.

The second layer uses `@axe-core/playwright` and scans Age, Difference, Interval, Milestones, Profiles, Settings, and About using WCAG A/AA tags. Any reported violation fails the E2E suite and the CI job.

Component tests additionally protect modal focus and background isolation: `tests/App.test.tsx` covers quick-actions focus entry, wrap, restoration, shortcut toggling, onboarding shortcut isolation, and `inert` application regions; `tests/Onboarding.test.tsx` covers first-run focus containment. Calculator/Settings tests protect accessible invalid-timezone feedback.

The axe dependency is pinned intentionally. Dependency updates should be reviewed like other test-engine changes because rule behavior can change as standards support evolves.

Automated checks cannot prove complete accessibility or standards conformance. They complement, rather than replace, keyboard, zoom, contrast, screen-reader, reduced-motion, and platform assistive-technology review.

## Manual review checklist

- Navigate every interactive element with keyboard only.
- Verify focus order follows visual order.
- Open and dismiss quick actions with keyboard only; verify focus enters, wraps, background controls cannot be reached, and focus returns to the trigger.
- Exercise onboarding with Tab and Shift+Tab and confirm background shortcuts/actions cannot take focus or appear in the active assistive-technology interaction layer.
- Verify mobile navigation can be opened, traversed, and dismissed without a pointer while main-page controls remain unavailable behind the drawer.
- Enter both valid and invalid IANA timezone identifiers and verify labels, help text, validation state, and screen-reader announcements remain understandable.
- Zoom to 200% without losing core content/actions.
- Test screen-reader labels for dates, toggles, icon buttons, dialogs, the crash-recovery alert, and the duration visualization.
- Verify errors/status updates are announced at sensible times and do not repeatedly interrupt reading.
- Verify dark and light themes at common contrast-sensitive states.
- Verify reduced-motion mode removes nonessential animated transitions.
- Verify print output excludes navigation/private form inputs.

## Release gate

A release candidate should not be described as accessibility-reviewed unless:

1. the automated accessibility E2E suite passes on the release candidate;
2. the manual checklist has been exercised against the relevant visual changes;
3. newly introduced exceptions, if any, are documented with a concrete remediation plan instead of silently disabling rules.
