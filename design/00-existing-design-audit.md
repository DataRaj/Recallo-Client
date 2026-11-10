# Existing design audit

Source inspection, 2026-11-11. Findings below are code-backed observations and design assessments. They are not screenshots, measured usability results or a completed accessibility audit.

## Architecture and boundaries

- Next.js 16.2.7, React 19.2.7, TypeScript, App Router; Tailwind 4.3, next-intl, Zustand, TanStack Query, LiveKit and Lucide. Framer Motion is already installed; a new animation package is unnecessary.
- Public marketing: `src/app/[locale]/(marketing)/page.tsx` and `layout.tsx`. Both server components; joining is isolated in a client wrapper. Preserve that split.
- Locale root owns query, translation, theme, analytics and persistent meeting providers. Marketing must continue to coexist with active meetings and auth state.
- `src/styles/global.css` owns global tokens, animation, chat palettes and app feature overrides. Add a scoped marketing layer rather than changing the app's palette globally.
- Existing font is Inter through an external CSS import. No local font files or marketing imagery were found in `public`; only favicon assets. Phase 2 must specify font sourcing, licensing and fallback behavior.
- No applicable ancestor `AGENTS.md` was found in the inspected path. Preserve existing working-tree changes listed in the project README.

## Strengths to carry forward

The warm paper/sage and muted clay cues give the brand a useful starting identity. The darker live meeting surfaces provide a meaningful contrast with a readable marketing site. Actual meeting, lobby, transcript and summary components provide credible visual material. Joining already has a reusable modal entry point. The meeting-to-insights route transition supports the intended narrative directly.

## Findings ordered by impact

| Priority | Finding and evidence | User consequence | Required correction and verification |
| --- | --- | --- | --- |
| P1 | Hero communicates general video calling; no transcript/summary story in current page | Visitor misses the reason to consider Recallo | Connect a meeting and its structured outcome in hero; assess comprehension from rendered first viewport |
| P1 | Hardcoded adoption, privacy and availability claims; see product truth ledger | Misleading expectations and loss of trust | Remove unsupported claims; review final copy against ledger |
| P1 | Layout has `#pricing`, `#docs`, `#blog`; final CTA has `#demo`; footer uses `#` | Navigation offers destinations that do not exist | Use implemented section anchors and actual routes only; exercise all links |
| P1 | Marketing nav links are hidden below `md`; no mobile menu replacement; sign-in hidden below `sm` in UserMenu | Smaller screens lose navigation and explicit sign-in access | Specify accessible mobile navigation and account actions; keyboard/touch checks at 320/390px |
| P1 | `.recallo-focus` uses nonstandard `ring` declarations; no reduced-motion override in audited stylesheet | Focus utility does not establish a valid CSS outline; animation preferences are unaddressed there | Valid scoped `:focus-visible` treatment and reduced-motion rules; actual keyboard and preference tests |
| P2 | Hero mockup uses generic initial tiles, a fictitious `/room/...` address, and square placeholders for controls | Product looks abstract and differs from actual routing/interface | Use real captures or clearly marked faithful demonstration; no fake clickable controls |
| P2 | Global active scaling applies to links/buttons; many controls suppress outline | Feedback may move content or leave unclear focus | Define intentional marketing interaction states; inspect inherited behavior and modal focus |
| P2 | One equal feature-card grid carries most product explanation | Gives unequal features equal importance; weak narrative | Use meeting-to-context sequence and substantial insights document composition |
| P2 | Inline colors, radii, shadows and font sizes repeat across page/layout | Refinement is hard to keep consistent | Named marketing type, space, surface, geometry and motion tokens |
| P2 | Existing body secondary color `#8d7a7a`, muted moss and clay are used on pale surfaces | Some combinations may not satisfy contrast requirements | Measure actual role/background/state pairs in Phase 2; distinguish decorative and text colors |
| P2 | Metadata translation still contains starter text | Search preview fails to explain the product | Marketing-specific title/description grounded in final copy; verify locale behavior |
| P2 | Marketing uses fixed `px-10` navigation gutters and large final CTA padding | Risk of cramped mobile composition | Explicit compact layout; screenshot evidence required before calling this a measured overflow defect |

## Product UI responsive observations

Meeting controls include a small-screen overflow menu, room padding changes at `sm`, and screen focus responds to active sharing. These are existing behaviors to represent faithfully. The marketing mockup must not imply every desktop control remains simultaneously visible on a phone. Lobby uses device availability and permission-dependent state; do not mount live media access on the marketing page merely to create a preview.

## Implementation approach for later phases

Use a scoped marketing stylesheet/token namespace, server-rendered section content and small client islands for the join flow, mobile navigation and any meaningful product-demo interaction. Preserve the existing join modal's behavior and the account-aware menu functionality. If its shared styling is unsuitable, use a marketing-specific wrapper/variant instead of changing protected screens. Avoid importing LiveKit's connected components into a static marketing preview.

Browser review is still required for actual typography, wrap quality, contrast in context, focus visibility, overflow and motion. No production readiness verdict is implied by this audit.
