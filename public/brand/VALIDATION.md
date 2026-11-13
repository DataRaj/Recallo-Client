# Identity review — November 12, 2026

## Executed checks

- Parsed all 65 production SVG exports across five kits. No embedded images, live text, scripts, filters or external references occur in these logo exports.
- Rendered and checked 50 light/dark symbol PNGs at exactly 16, 24, 32, 64 and 512px. Every render has visible artwork with unclipped alpha bounds.
- Inspected the rendered comparison board, enlarged 16px contact sheet, application-icon contact sheet, individual sheet and placement mockups. The comparison page provides the complete native-size set for further review.
- Checked the static comparison page in local Chromium at 1440×1000 and 390×844. Both layouts have no horizontal overflow. Five identity sections render; the light/dark toggle updates its pressed state and image sources. See `browser-checks.json` for image-load and runtime results, and the two browser PNGs for captured layouts.
- Compared the existing favicon.ico, favicon-16x16.png, favicon-32x32.png and apple-touch-icon.png against HEAD using SHA-256: all unchanged.

## Refinements made after rendering

Corrected the serif wordmark's a–l collision, expanded the fifth wordmark's export canvas, adjusted identity-sheet placement, separated the 16px and 32px favicon drawings, and corrected the 24px preview to use the intended master. Reverse lockups receive a small optical size adjustment. The mockup's small red Leave control uses #9D4545 rather than the lighter clay seed.

## Measured contrast

| Pair | Ratio | Use |
|---|---:|---|
| Forest / paper | 10.62:1 | Primary lettering and reading text |
| Paper / charcoal | 15.88:1 | Reverse lettering and dark surfaces |
| Clay / paper | 4.15:1 | Large accents; unsuitable for normal-size text |
| Moss / paper | 2.96:1 | Decorative swatch; unsuitable for text or essential control boundaries |

Contrast ratios use sRGB relative luminance. These measurements do not establish whole-application accessibility conformance.

## Limits and selection judgment

Return R leads because name recognition, silhouette and custom lettering work together. Retrace is the alternative because its compact geometry survives reduction well; the numeral-2 reading remains a real compromise. Held quotation occupies familiar punctuation territory. Margin ligature is stronger as a wordmark than as a favicon. Binding fold can read as a K or flag and has a more fragile diagonal seam.

Scores use the requested 30/20/20/15/15 weighting. They are editorial judgments after rendering, not usability-study results. The competitor review was a limited visual screen, not trademark clearance. Recognition over time has not been tested. Mockups demonstrate placement only; no candidate has replaced production branding.

No application build or broad end-to-end suite was run: changes are isolated static artwork, review files and generation tools. The targeted checks above cover the delivered assets and comparison page.
