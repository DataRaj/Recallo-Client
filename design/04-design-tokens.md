# Token and typography specification

This file records the first iteration. Active production values are in `src/styles/marketing.css`, with the implementation map in the root `DESIGN.md`.

`specimen/tokens.css` is the concrete value source. Copy its scoped system into the marketing implementation in Phase 3; do not import specimen files into production. All tokens use `--mk-` to avoid accidental application theme changes.

## Color roles and measured pairs

WCAG relative luminance calculations on solid sRGB colors, measured during Phase 2:

| Foreground / background | Ratio | Permitted use |
| --- | --- | --- |
| Forest `#2c3e2d` / paper `#f3f8ef` | 10.62:1 | All text |
| Secondary `#52604f` / paper | 6.20:1 | Body, metadata, captions |
| Secondary / sage `#e6f2dd` | 5.76:1 | Body, metadata, captions |
| Paper / forest | 10.62:1 | Primary button and closing copy |
| Paper / charcoal `#171d1a` | 15.88:1 | Product headings and labels |
| Clay ink `#9d4544` / paper | 5.78:1 | Links, decision labels, error text |
| Control edge `#778471` / paper | 3.66:1 | Essential control boundary, never small text |

Original clay `#ba5a5a` and moss `#8a9478` are decorative colors; never assume their contrast is suitable for small text. A faint separator is not a control boundary. Disabled text remains readable and is accompanied by disabled semantics. Success is forest on sage; error is clay ink on paper, with an explicit text label.

Hover primary background is charcoal with paper text; secondary hover uses sage with forest text. Selected controls use forest with paper text and `aria-pressed` or `aria-selected` as appropriate. Focus is a 2px forest outline at 4px offset on light surfaces, paper on dark; never use shadow alone.

OKLCH values may be derived for future palette expansion, but these hex values are the validated v1 source. Do not introduce runtime color mixing or uncontrolled opacity that changes measured text contrast.

## Type roles

Newsreader: display/document headings, normal 400. Manrope: body/UI 400, headings/controls 600. System monospace is restricted to timestamps and chapter indexes. No synthetic italic or bold in Newsreader.

| Role | Family / weight | Size compact → desktop | Line height | Tracking | Measure |
| --- | --- | --- | --- | --- | --- |
| Display XL | Newsreader 400 | 44 → 84px, fluid | 1.03 | -0.035em | 12–14ch |
| Display L | Newsreader 400 | 38 → 64px | 1.08 | -0.025em | 16ch |
| H1 | Alias Display XL | same | same | same | one page h1 |
| H2 | Newsreader 400 | 34 → 52px | 1.12 | -0.02em | 20ch |
| H3 | Manrope 600 | 20 → 24px | 1.3 | -0.025em | 28ch |
| Section eyebrow | Manrope 600 | 12px | 1.5 | 0.04em | sentence case |
| Lead | Manrope 400 | 17 → 19px | 1.65 | -0.01em | 46ch |
| Body | Manrope 400 | 16px | 1.7 | 0 | 62ch |
| Small body | Manrope 400 | 14px | 1.6 | 0 | 60ch |
| Caption | Manrope 400 | 12px | 1.6 | 0 | 70ch |
| Metadata | Manrope 400 | 12px | 1.5 | 0.01em | concise |
| UI label / button | Manrope 600 | 14px | 1.4 | -0.01em | no forced wrap |
| Data value | system mono 400 | 12px | 1.5 | 0 | timestamps only |

Use natural wraps; no fixed-height heading boxes. `text-wrap: balance` is progressive enhancement. At 320px reduce hero to 42px if needed; never use nowrap on whole headings. Use fallback Georgia for Newsreader and Arial/system sans for Manrope. Both selected families must support accented French text; specimen includes it, with rendered checking deferred.

## Spacing, geometry and depth

Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 112, 144px. 2px is reserved for optical icon/rule adjustments. Controls: 48px minimum height; touch targets 44px minimum. Radius: 6px small controls, 8px buttons/mark, 16px product frame; documents 0–4px. Borders 1px. Main max width 1280px. Reading measure 62ch.

Shadow: `0 20px 60px rgb(23 29 26 / 0.10)` for the main product composition only. Overlays may use an independent shadow for separation. No glow.

## Font delivery

Downloaded specimen TTF files and OFL licenses are in `specimen/fonts`. Phase 3 should self-host the same faces with `next/font/local` scoped to marketing. Keep 400/600 Manrope and 400 Newsreader only. No browser Google Fonts requests are needed for the new marketing typography. Existing global Inter loading is a separate legacy dependency; do not silently rewrite all application typography.
