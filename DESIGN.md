# Recallo design

The application uses warm ivory, vermilion, mineral blue and charcoal, with Bricolage Grotesque headings and DM Sans body text. The concept remains conversation becoming a useful record. Marketing tells that story; the workspace provides direct access to rooms, conversations and records.

## Root implementation map

| Responsibility | Source |
| --- | --- |
| Semantic colors, light/dark modes, chat palettes, status colors | `src/styles/global.css` |
| Application typography, workspace layouts, auth surfaces, focus and reduced motion | `src/styles/app-system.css` |
| Locally hosted variable fonts, loaded at the locale root | `src/styles/fonts.ts`, `src/app/[locale]/layout.tsx` |
| Shared application navigation and mobile drawer | `src/app/[locale]/(protected)/layout.tsx` |
| Buttons and inputs | `src/components/ui/` |
| Panel entrance and route transitions | `src/components/animations/`, `src/app/[locale]/template.tsx` |
| Live preference changes | `src/hooks/use-media-query.ts`, `use-reduced-motion.ts` |
| Archive entry pages | `src/components/workspace/archive-entry.tsx` |
| Marketing composition and responsive rules | `src/styles/marketing.css` |
| Room creation/join actions | `src/components/marketing/actions.tsx`, `src/components/providers/modal-provider.tsx` |
| Meeting, transcript and summary demonstration | `src/components/marketing/meeting-showcase.tsx`, `product-illustrations.tsx` |
| Dialog focus and dismissal | `src/components/modals/base-modal.tsx` |

Prefer changing semantic tokens and shared components before adding route-specific overrides. Keep chat palette customization; keep live/recording/error meanings distinct from the brand accent. Check public claims against `design/00-product-truth.md`.

## Application rollout: three completed phases

1. **Foundation:** load both local fonts at the root, replace the previous sage/clay default palette, establish readable light/dark text and focus colors, and standardize shared controls.
2. **Screens:** update authentication, the protected shell, Home, meeting history, lobby/live meeting surfaces, chat and insight views. Recompose Home around create/join actions, locally recorded rooms and access to meeting records. Give archive pages useful navigation without inventing a collection endpoint. Settings becomes responsive; chat uses a list/detail pattern on mobile. `/dashboard` remains a locale-aware redirect to the shared Home workspace, including existing OAuth returns.
3. **Interaction:** animate the active navigation marker, route entrances, selected settings panels and insight pipeline changes. Keep the existing meeting sidebar slide, make its closed contents inert, and add mobile navigation focus containment/return. The product example offers a user-started Meeting → Transcript → Summary walkthrough with pause and manual selection. Reduced-motion changes are subscribed to during the session, not just read at mount.

## Visual and motion rules

- Ivory `#f8f4ea`, elevated paper `#fffdf7`, mineral blue `#dbe6ee`, brand vermilion `#ed5a3a`, charcoal `#232722`.
- Use dark ink on vermilion controls. Use deep red `#a83120` for readable accent text on light surfaces and warm peach on dark surfaces.
- Display type belongs to headings; body copy and controls use DM Sans. Shared control corners are 6px; primary content surfaces use 12px.
- Navigation and route transitions take approximately 200ms; panel entrances 180ms; walkthrough steps 2600ms. No artificial processing percentages or continuously running decorative animation.
- Reduced motion removes translation, stops CSS animation and removes the timed walkthrough control. Important content remains available through manual buttons.

## Evidence and limits

The final production build passed, including TypeScript and route generation. Targeted lint reported no errors; the shared button module retains its existing React Refresh export warning. `git diff --check` passed. The browser pass measured 13 route/viewport combinations at 320px and 1440px with no horizontal overflow or runtime exceptions. Local font loading, create-room dialog opening, chat theme persistence, insight progress/completion, mobile menu focus, chat back navigation, walkthrough progression, live reduced-motion changes and the French dashboard redirect passed. This is a bounded Chromium review, not a full accessibility or live-service test suite.

`design/v2/evidence/application-checks.json` records bounded browser checks with local auth, room, chat and insight fixtures. `app-*.png` captures application screens; all names and meeting data in these captures are demonstration fixtures. Earlier `implementation-checks.json` and `implemented-*.png` cover the marketing iteration. The WOFF2 fonts total 78,276 bytes and include their OFL licenses. No new runtime packages or stock photography were added.

Live backend authentication, WebSocket delivery, media connections, recording and generated insight accuracy were not exercised. Existing settings for profile updates, notification delivery and quality controls are not made production-ready by this visual pass. The chat theme selector is connected to the existing provider and persists locally. Archive collection pages still have no dedicated list endpoint; their links lead to individual meeting records. Marketing copy remains English on both locale routes.

Run `pnpm dev` for local preview. For production preview, build, then run `pnpm exec next start --hostname localhost --port 3000`.
