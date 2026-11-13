# Recallo / Paired Line

This revision puts the complete name first. The compact mark is an extract for places where seven letters cannot fit, such as browser tabs. Never prepend the compact mark to the wordmark: it repeats the double l and weakens the name.

## Lettering

All seven letters are drawn outlines, independent of a font installation. Cap height: 120 units. Lowercase height: 85 units, with curved overshoot. Main vertical strokes: 17–19 units. R has a broad counter and diagonal leg; e/c share curve rhythm; a uses a double-storey construction. The two l letters have separate cut feet. Joining them was tested and rejected because the result read as a U.

Use the supplied artwork. Do not type the name in a substitute font, re-space individual letters, stretch the wordmark, or recreate it with a text effect. There is no licensed font dependency in the logo. The review page uses the existing project's OFL DM Sans for explanatory text only.

## Color roles

| Role | Value | Use |
|---|---|---|
| Deep ink | #243C36 | Primary wordmark and text on light fields |
| Terracotta | #B74830 | Double-l accent, single-color artwork, brand emphasis |
| Warm paper | #FAF5EC | Main reading and presentation field |
| Soft sage | #D6E2D6 | Secondary field; not text |
| Peach | #F1D4BF | Warm editorial field with ink or large terracotta lettering |
| Night | #152A26 | Reverse artwork field |
| Reverse accent | #F29374 | Double-l accent on dark fields |

The accent is visible within the name, not distributed arbitrarily across seven letters. Use the reverse drawing on dark surfaces; do not reuse dark terracotta there. Use white or ink monochrome artwork for restricted printing, engraving, or backgrounds that cannot support two colors. Text, controls and background combinations still need their own contrast checks; logo colors do not establish application accessibility.

## Sizing and placement

- Minimum full-name display width: 140 CSS px. Keep its natural aspect ratio and at least one stem-width of clear space (18/529 of the visible name's width).
- Suggested navigation width: 142–160px. Login/title placement: 170–220px. Presentation artwork may be much larger.
- At 16px and 32px, use the provided pixel-aligned double-l favicon. It is not a resized wordmark. The compact mark may resemble paired brackets or a pause-like shape; long-term recognition has not been tested.
- The app icon is 512×512 with a rounded field and centered compact lettering. Platform-specific adaptive-icon masks and store exports are not included.
- On photographs or busy content, place the logo on an opaque paper/night field with the required clear space.
- Do not outline, rotate, animate individual letters, add shadows/glows, or detach the colored letters from the name.

## Application handoff

`src/components/recallo-wordmark.tsx` provides the same paths as the SVG artwork. It is used in the marketing navigation and footer, authentication header, and desktop and mobile application navigation.

```tsx
<RecalloWordmark className="brand-signature" />
```

```css
.brand-signature { width: 142px; height: auto; color: #243C36; }
.dark-surface .brand-signature {
  color: #FAF5EC;
  --recallo-logo-accent: #F29374;
}
.monochrome .brand-signature { --recallo-logo-accent: currentColor; }
```

The component supplies one accessible name, “Recallo.” When embedding it inside a link that already has `aria-label="Recallo home"`, pass `aria-hidden="true"`. Never use color alone to communicate product state. The paired l is a brand detail, not a recording or status indicator.

Browser metadata uses the new icon paths; the earlier originals remain available. Do not change meeting controls, authentication behavior, routes, product claims or application-wide theme colors as part of the logo swap.

## Files and reproduction

`primary`, `dark`, `monochrome`, `white` and `terracotta` exports have transparent backgrounds. `on-paper` and `on-dark` include their presentation fields. `identity-board` and `placements` document the system; their text labels are live SVG text, while production wordmarks remain outlined. `social-banner` is a 1200×630 share-card asset, not connected to Open Graph metadata.

Run `python3 design/brand/wordmark_system.py`, then `python3 design/brand/build_wordmark_review.py` from the repository root. Requires Python 3 and ImageMagick. The generator is the source of truth for geometry and the React component. No new application dependency is required.

This is a revised design proposal, not evidence of trademark clearance or tested brand recognition. Earlier candidate exports remain available for comparison.
