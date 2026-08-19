# Accessibility

ChronoAge targets WCAG-oriented inclusive design rather than treating accessibility as a final polish step.

## Implemented baseline

- Semantic native date/time inputs and buttons.
- Visible keyboard focus indicators.
- Skip-to-content link.
- Keyboard-operable primary navigation and quick actions.
- `Ctrl/Cmd + K` quick actions and `Escape` dismissal.
- ARIA live/status regions for calculation/share feedback.
- Errors are communicated with text, not color alone.
- Light/dark/system theme support.
- User setting and system media-query support for reduced motion.
- High-contrast preference that strengthens boundaries.
- Responsive typography and touch targets.
- Dialog labeling for onboarding and quick actions.
- Playwright accessibility smoke checks for primary landmarks, skip navigation, heading structure, accessible control names, input labels, and image alternative text.

## Automated checks

`tests/e2e/accessibility.spec.ts` runs with the normal Playwright suite and catches common regressions such as unnamed buttons, unlabeled form controls, missing image `alt` attributes, or removal of the main navigation/skip-link structure.

These checks are intentionally dependency-light and are **not** a full WCAG conformance audit. A maintained browser accessibility engine can be added later when its rule/version lifecycle is explicitly owned.

## Manual review checklist

- Navigate every interactive element with keyboard only.
- Verify focus order follows visual order.
- Zoom to 200% without losing core content/actions.
- Test screen-reader labels for dates, toggles, icon buttons, and dialogs.
- Verify dark and light themes at common contrast-sensitive states.
- Verify print output excludes navigation/private form inputs.

## Future automation

Add a browser accessibility engine to CI only when its version and rule configuration are maintained intentionally. Automated checks complement, not replace, manual review.
