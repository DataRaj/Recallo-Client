# Recallo visual redesign

Both phases are implemented. The root `DESIGN.md` is the active implementation guide. Final application captures are in `evidence/implemented-desktop.png`, `evidence/implemented-mobile.png` and `evidence/implemented-record.png`. The passing interaction results are in `evidence/implementation-checks.json`.

The selected direction uses a warm ivory page, near-black headings, a mineral blue product frame, and vermilion for the primary action and the conversation section. The screen-share example and the meeting record sit in the same frame so their relationship is visible before a visitor scrolls.

Open [the interactive preview](index.html) in a browser. The top controls compare the three directions using the same content. The product controls switch between a meeting chat, a transcript excerpt, and a summary. The preview’s room actions open a dialog that describes the real entry point.

| | Current page | Selected preview |
| --- | --- | --- |
| Desktop | [1440 px capture](evidence/before-desktop.png) | [1440 px capture](evidence/selected-desktop.png) |
| Mobile | [390 px capture](evidence/before-mobile.png) | [390 px capture](evidence/selected-mobile.png) |
| Conversation and record | | [Desktop capture](evidence/selected-record.png) |

The current desktop page places the oversized serif headline and camera-off tiles in separate columns. On the current mobile page, the illustration starts about 704 px down. The new preview uses two desktop headline lines and a full-width illustration. On mobile, the illustration starts at about 445 px, including the 44 px comparison bar. The shared screen and participant strip provide the live context, and the adjoining panel shows what a visitor can revisit.

## Color and typography decisions

| Direction | What the browser study showed |
| --- | --- |
| [Vermilion](evidence/selected-desktop.png) | The warm page, cool product frame, dark room, and pale document are distinct at a glance. Bricolage Grotesque gives the headline enough weight to sit above a full-width product example. |
| [Cobalt](evidence/blueprint-study.png) | DM Sans and cool blue produce a crisp, technical page. The blue room and blue surround make the room-to-record contrast less pronounced. |
| [Dark](evidence/afterhours-study.png) | Newsreader and apricot provide a quieter tone. The page, shared screen, and meeting record compete at similar lightness levels. |

I selected vermilion from the rendered comparison. `preview.css` contains the working values. The comparison captures for cobalt and dark precede the final tracking adjustment in the interactive preview.

| Role | sRGB | OKLCH lightness / chroma / hue |
| --- | --- | --- |
| Page | `#f8f4ea` | `0.968 / 0.014 / 88.7°` |
| Record surface | `#fffdf7` | `0.994 / 0.008 / 91.5°` |
| Primary ink | `#1b1e1b` | `0.231 / 0.007 / 145.3°` |
| Primary action and conversation section | `#ed5a3a` | `0.656 / 0.188 / 33.9°` |
| Product frame | `#dbe6ee` | `0.919 / 0.016 / 239.1°` |
| Decision highlight | `#f2dfaf` | `0.907 / 0.066 / 89.0°` |
| Meeting surface | `#232722` | `0.267 / 0.011 / 139.4°` |

Keep high chroma concentrated in vermilion. The page and product frame have similar low chroma with different hues, which lets the product region register as a separate surface. The decision highlight uses a quieter warm color inside the record. Use the darker `#a83120` for the decision label.

Calculated contrast for the selected direction is 15.32:1 for ink on ivory, 6.54:1 for secondary text on ivory, 4.91:1 for ink on vermilion, 5.10:1 for the decision label on the highlight, and 13.81:1 for ivory on the meeting surface. Secondary text also reaches 7.07:1 on the record surface and 5.67:1 on the product frame. The control border reaches 4.17:1 on ivory. Phase 2 should check the final focus, hover, error, and disabled states in the application.

Bricolage Grotesque at weight 700 carries display headings, with tighter tracking than body text and enough word spacing to keep the short phrases clear. The heading measured about 89 px at 1440 px and 43 px at 390 px. DM Sans carries body text and controls. Small monospaced labels identify the transcript timestamps and document metadata. Both variable fonts are served locally in the preview. The downloaded files and their OFL licenses are in `fonts/`. [Bricolage Grotesque source](https://github.com/google/fonts/tree/main/ofl/bricolagegrotesque) · [DM Sans source](https://github.com/google/fonts/tree/main/ofl/dmsans)

## Phase 2 handoff

1. Port the selected visual treatment into the existing Next.js marketing page. Use the narrower top copy area above the full-width product example, followed by the vermilion conversation section, the light record section, practical questions, and a dark closing section. Keep the existing product claims grounded in [the product audit](../00-product-truth.md).
2. Use the existing account and room actions in the header, hero, and closing section. Preserve signed-in creation, room lookup and join states, locale paths, settings, and sign-out. Fit the mobile navigation to the final header height and give both create and join actions a direct path.
3. Bring the preview’s product framing and content switches into the real page. Keep the example labeled. Integrate useful meeting capabilities and use cases into the redesigned sections where they clarify the flow. Show the source transcript alongside decisions and next steps without implying that insights are always available.
4. Load the selected fonts locally in the marketing layout. Consider a smaller licensed font format or subset for production. Carry the measured colors into the marketing tokens and derive application control states with matching contrast.
5. Inspect the implemented page at desktop and mobile widths against the current-page captures. Check the example controls and room-action entry points. Run targeted type, lint, and build checks as appropriate. Keep the browser pass limited to the changed experience.

The standalone preview was rendered in Chromium at 1440 and 390 px. The selected fonts loaded at both widths. A narrow-width check at 320 px found no horizontal overflow and verified the transcript switch, palette switch, join preview dialog, and focus return. Those checks cover the preview. The live Next.js integration and real room actions belong to Phase 2.
