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

## Manual review checklist

- Navigate every interactive element with keyboard only.
- Verify focus order follows visual order.
- Zoom to 200% without losing core content/actions.
- Test screen-reader labels for dates, toggles, icon buttons, and dialogs.
- Verify dark and light themes at common contrast-sensitive states.
- Verify print output excludes navigation/private form inputs.

## Future automation

Add a browser accessibility engine to CI only when its version and rule configuration are maintained intentionally. Automated checks complement, not replace, manual review.
