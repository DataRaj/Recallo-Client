# Interaction and state specification

## Navigation

Static header avoids consuming phone height. Anchor links use actual section IDs with `scroll-margin-top: 24px`. A visible-on-focus skip link leads to main. The compact menu button has `aria-expanded`, `aria-controls` and an accessible name; the menu is an inline disclosure, not a modal. Close after link selection and on Escape, returning focus to the trigger. Content remains reachable without hover.

## Creation and account state

Before auth hydration, render a stable registration link and reserve the final control dimensions. Signed out: Create a room → locale registration. Signed in: Create a room opens the existing creation modal. Sign in becomes Dashboard; preserve account/settings access where the existing menu is retained. No arbitrary loading spinner should delay reading the page.

## Joining

Open the actual JoinRoomModal; use existing lookup and navigation. Support ID/link selection, input, validation, pending and failure. A pending submit is disabled and labeled “Joining…” with a text status. Failures keep the dialog open and entered values available. Link parser rules remain the app's source; do not silently accept unsupported routes.

Accessibility contract: labeled dialog, modal semantics, focus enters the dialog, focus stays within it, close button has an accessible name, and focus returns to the activating CTA. Preserve current form-editing Escape behavior unless intentionally improved across all affected uses; a reachable close button is mandatory. Inputs need programmatically associated labels. Existing shared modal lacks parts of this contract; Phase 3 must address them deliberately, preserving local edits. No cosmetic wrapper can substitute for actual focus behavior.

## Product demonstration

Default: meeting and decision are both understandable without interaction. Optional selector: Meeting / Transcript / Summary. Use three ordinary buttons with `aria-pressed` and a named region; avoid adding tab semantics without tab keyboard behavior. Selecting replaces the illustrated view and its concise heading. Do not move focus or announce the entire document repeatedly. No autoplay, camera permissions, live backend requests or fake media controls.

Storyboard:

1. Meeting: Launch Planning grid; chat message introduces the revised draft.
2. Transcript: two timestamped speaker excerpts show the Thursday decision and follow-up.
3. Summary: the same content is organized as discussion, decision and action.

All views must be in server-rendered explanatory content somewhere on the page; the selector adds exploration rather than hiding required understanding. If this interaction becomes disproportionately complex, preserve the static connected composition and omit the selector, not any product information.

## Motion values

State color changes: 140ms ease-out. Preview state change: opacity/translateY up to 6px, 180ms `cubic-bezier(.22,1,.36,1)`. No exit delay; repeated selection interrupts immediately. No full-page reveal choreography. Button hover changes color; pressed state may translate 1px, never scale the whole page link area. Decorative timelines remain still.

`prefers-reduced-motion: reduce`: transitions/animations removed, smooth scrolling disabled. Content is visible by default. CSS focus treatments remain active in reduced motion and forced colors. Existing global active scaling must be reset inside the marketing root.

## Questions

Native `details`/`summary`. Each question operates independently and is keyboard-accessible. Plus/minus indicator is decorative. Answers remain in semantic reading order. No height animation is necessary.
