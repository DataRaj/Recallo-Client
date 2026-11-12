# Responsive and accessible behavior

Targets are CSS viewport widths, not device models. No fixed section heights or viewport-locked scenes. `min-width:0` on grid/flex children; `overflow-wrap:anywhere` only for URLs/IDs, not all prose.

| Width | Grid / gutters | Main behavior |
| --- | --- | --- |
| 320px | 4 / 20px | Hero 42–44px; stacked 48px actions; simplified 2-column participant grid; document metadata wraps; compact menu |
| 390px | 4 / 24px | Hero 44–48px; actions may remain stacked; chat follows participant grid; all labels readable |
| 768px | 8 / 40px | Hero remains stacked, wider product field; use cases can form label/body columns; compact menu until header genuinely fits |
| 1024px | 12 / 40px | Split hero only when copy + preview fit; otherwise stacked. Header may retain compact navigation; full chat inside showcase |
| 1440px | 12 / 64px, max 1280 | 5/7 hero; full document and dark showcase compositions; 84px maximum headline |
| Larger | same max width | Outer margins grow; reading columns and headline do not expand indefinitely |

Breakpoint selection is content-driven. Start full navigation at 1200px; never shrink labels just to fit. On phones the order is heading, explanation, primary action, join, helper line, meeting example, summary example. Overlap is removed. Product text remains at least 12px; explanatory body remains 16px.

Use `clamp` for display scale, with rem-based limits. Support zoom/reflow through natural wrapping and content-driven height. Do not hide decisions, disclaimers, CTAs or navigation to create a cleaner screenshot. No accidental horizontal document scrolling; a product frame must recompose rather than become a tiny desktop image.

Accessibility acceptance:

- One h1, section h2, subsection h3; visual typography never sets heading semantics.
- Tested token pairings for normal text; 44×44px minimum touch targets and 48px primary controls.
- Visible focus on all links/buttons/disclosures; no focus-outline suppression without replacement.
- Named preview region, meaningful dialog semantics, associated field labels, keyboard-operable menu/join flow.
- Example labels remain visible. Participant initials are adjacent to names; icons do not carry meaning alone.
- Source reading order matches the visual narrative. No CSS reordering that moves controls away from their explanation.
- Reduced-motion and forced-color behavior are explicit. Content does not depend on animation or color alone.

Rendered viewport and keyboard testing is deferred at the owner's request to avoid excessive work during foundation design. These rules remain required implementation behavior; deferred testing is not a waiver.
