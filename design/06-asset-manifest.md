# Asset manifest

No stock photos, generated imagery or customer assets are required. Approval status below means selected for implementation by design judgment, not external stakeholder approval. Product captures remain preferred if readily available; unavailable live data must not block the page.

Phase 3 implementation: all three font files and OFL licenses are copied without modification to `src/components/marketing/fonts/`, loaded through `next/font/local`. Original React illustrations are in `product-illustrations.tsx` with fictional content in `example.ts`. The interactive showcase changes the actual illustration among grid, screen focus and transcript. No external imagery or application screenshots were introduced.

| ID | Placement / purpose | Source and rights | Dimensions / ratio | Alt or accessible equivalent | Mobile behavior | Status |
| --- | --- | --- | --- | --- | --- | --- |
| brand-r | Header/footer identity | Existing Recallo letter mark; project asset | 32×32, square | Decorative beside visible Recallo name | Same | Selected |
| meeting-example | Hero/live section; explain actual meeting layout | Original HTML/CSS based on `meeting-stage`, `video-grid`, `controls-dock`; fictional data | Fluid; target 680×420 hero, 1120×560 showcase | Caption: Illustrative Launch Planning meeting with participant grid and chat | Recompose to two tile columns; chat follows | Selected illustrative composition, not screenshot |
| record-example | Hero and insights; connect decision to source | Original HTML/CSS using supported SummaryData and TranscriptData fields | Target 640px readable document width; content-driven height | Semantic headings, paragraphs and transcript list; no redundant image alt | Full-width, stacked metadata | Selected illustrative composition, not screenshot |
| conversation-line | Problem/journey; communicate continuity | Original CSS rules and ordered list | Fluid | Ordered textual sequence conveys all information; rules decorative | Vertical | Selected |
| manrope-400 | Body/UI type | Google Fonts CDN; OFL license in `specimen/fonts/Manrope-OFL.txt` | TTF, approx 94KB | Not applicable | Same | Downloaded |
| manrope-600 | Interface/section headings | Same license; approx 95KB | TTF | Not applicable | Same | Downloaded |
| newsreader-400 | Editorial display/document headings | Google Fonts CDN; OFL in `specimen/fonts/Newsreader-OFL.txt` | TTF, approx 107KB | Not applicable | Same | Downloaded |

## Exact downloaded font sources

- Manrope 400: https://fonts.gstatic.com/s/manrope/v23/xn7_YHE41ni1AdIRqAuZuw1Bx9mbZk79FO_F.ttf
- Manrope 600: https://fonts.gstatic.com/s/manrope/v23/xn7_YHE41ni1AdIRqAuZuw1Bx9mbZk4jE-_F.ttf
- Newsreader 400: https://fonts.gstatic.com/s/newsreader/v26/cY9qfjOCX1hbuyalUrK49dLac06G1ZGsZBtoBCzBDXXD9JVF438weI_ADA.ttf
- License sources: https://github.com/google/fonts/tree/main/ofl/manrope and https://github.com/google/fonts/tree/main/ofl/newsreader

## If real screenshots are added later

Record route, commit/version, viewport, device scale factor, date, staged-data flag, account permissions and capture state. Remove tokens, emails and personal content. Set intrinsic dimensions, crop and meaningful alt text. Do not call a reconstructed composition an application capture. No screenshot has been captured in Phase 2.
