# Validation record

The latest two-phase iteration is complete. The root `DESIGN.md` records the active system and final checks. Rendered application captures and browser results are in `design/v2/evidence/`. This iteration includes actual desktop/mobile inspection and mocked account/room-lookup interaction checks, including the corrected dialog focus behavior.

## Phase 1 — baseline, 2026-11-11

- Inspected marketing, locale layout, global stylesheet, route definitions, user menu, room creation/joining hooks and services, meeting gate, lobby, meeting controls and stage, transcript/summary views, insights page, analytics provider and public assets.
- Confirmed working-tree modifications predated this work in protected layout and shared base modal; preserved them.
- External research: instruction/source text and first-party page content; see source ledger for successful and unsuccessful fetches.
- Application implementation, dependencies and routes unchanged in this phase.
- Baseline type check: `pnpm run check:types` completed successfully (exit 0).
- Browser screenshots, keyboard/touch testing, measured color contrast, lint, build, live backend calls, performance and accessibility scans: not performed in Phase 1. No visual or runtime pass is claimed.

## Required later evidence

This was the original verification plan. The owner's later instruction limits expensive testing; the Phase 4 record below identifies what was actually completed and what remains unverified.

Phase 2: rendered visual references, font specimen, measured palette pairings, copy/claim check, all main component states and responsive specification.

Phase 3: working complete page, real links and join behavior, explicit asset provenance, minimum source checks.

Phase 4: actual 320/390/768/1024/1440px page inspection; navigation and modal keyboard/focus checks; reduced motion; appropriate type/lint/build checks; console and performance inspection where available. Record exact failures and distinguish baseline issues from changes.

## Phase 2 — design foundation

- Created concrete copy, art direction, type/color/spacing tokens, section layouts, asset provenance, interaction states, responsive rules and review criteria.
- Downloaded three font files and the Manrope/Newsreader OFL licenses; no application package installation or dependency changes.
- Added an offline HTML specimen with local fonts, working typography comparison, state toggle and native disclosure. Source review only; it has not been visually inspected in a rendered browser.
- Lightweight artifact checks passed: specimen local stylesheet/anchor destinations exist, embedded JavaScript passes `node --check`, and downloaded font files have valid TrueType/OpenType file signatures. This is not a full font or browser validation.
- Calculated WCAG relative luminance for seven solid foreground/background pairs using a short Python calculation. Ratios are recorded in `04-design-tokens.md`; all specified normal-text pairs exceed 4.5:1. Control boundary exceeds 3:1. This does not establish whole-page accessibility compliance.
- Browser attempts before owner steering: original Chromium launch was sandbox-blocked, escalated launch started; a subsequent interrupted attempt encountered a locked temporary profile. Local HTTP server was sandbox-blocked; a retry was interrupted. No screenshots, reference-site visual measurements or rendered font-fit results were produced.
- Owner explicitly requested skipping excessive memory/time-consuming testing at this stage while preserving design and functional scope. Browser automation is deferred; do not install a browser-test suite or run repeated screenshots as a prerequisite to implementation.
- No application source or owner's pre-existing changes modified in Phase 2. Baseline application type check from Phase 1 remains the latest application check; unchanged app source does not justify repeating it here.

## Phase 3 — implementation

- Implemented the complete narrative in the existing marketing page and layout, with a dedicated scoped stylesheet and locally loaded fonts. Server/client separation is retained. No new dependencies.
- Header/account/create/join interactions use the existing auth and room hooks. The title-only marketing creation variant avoids unsupported settings. Existing dashboard creation options are preserved.
- Grid/screen-focus/transcript selection changes real rendered example content. All illustrative content is labeled; the summary remains readable without using the selector.
- Shared modal now uses native dialog modality, a labeled title, named close control and scroll locking. Form labels are associated with inputs; loading/error states are exposed. The owner's Escape behavior while typing is retained. Protected-layout edits are untouched.
- Room-hook navigation uses next-intl's router to preserve the current locale. Marketing copy is English, explicitly marked `lang="en"` within the locale layout; no claim of translated French copy.
- `pnpm run check:types` passed after the component and behavior changes.
- Targeted ESLint passed with zero errors/warnings across the changed marketing components, routes, shared dialogs, room hook, locale exports and stylesheet. The lint configuration recognizes the marketing CSS namespace. Unsupported legacy border-opacity utility names were removed from touched dialog options.
- Lightweight source checks passed for marketing CSS class definitions, static section anchors, a single page h1, removal of excluded claims and byte-identical font/license copies. `git diff --check` passed. A final CSS-only lint pass also returned zero errors/warnings after the dialog-heading and touch-target refinements.
- Browser automation, live backend operations, production build, runtime hydration checks, rendered viewport inspection and performance profiling were not executed in this phase, following the owner's request for lightweight verification. They remain verification limits, not proven passes.
- Phase 4 must give particular attention to native-dialog focus/return behavior, signed-in actions, 320px layout, locale paths and any inherited root-provider runtime issues. Use bounded checks instead of a large browser suite.

## Phase 4 — bounded final validation

### Corrections

- Removed `async` from the existing client-side PostHog provider. It uses hooks and has no awaited work; it now returns a React element on both branches. Explicit key checks also satisfy the repository's strict lint rules. Analytics configuration and initialization behavior are retained.
- Corrected the transcript and shared-screen illustration headings to h3 so the product demonstration follows its enclosing h2. Added a named group role to the noninteractive illustrated controls.
- Retained prior refinements for dialog heading sizes, link touch targets, visible input labels, locale-aware room navigation and removal of unsupported claims.
- The protected-layout changes that predated this task remain untouched. The shared modal retains the owner's Escape-while-editing behavior in its native dialog cancel handler.

### Executed checks

- Production build: `NODE_OPTIONS='--max-old-space-size=1536' pnpm run build` succeeds on installed Next.js 16.2.9. Compilation, built-in TypeScript checking and generation of 32 static pages completed. The heap option limits individual Node heaps, not total process-tree memory. Builds were repeated only after concrete source corrections.
- Node-only tests: `pnpm exec vitest run --project unit --maxWorkers 1 --reporter dot` passed: 1 test file / 2 locale-helper tests, 256ms. These are existing utility tests, not coverage of meeting/backend behavior. The UI/browser project was not run. Vite emitted an advisory about the existing tsconfig-paths plugin; configuration was left unchanged.
- HTTP smoke check of the built application: `/`, `/fr`, `/login`, `/register`, `/fr/login`, `/fr/register` returned 200. Both marketing pages had one h1, valid static anchor/label targets, the expected locale-specific login/registration links and no detected server-render error templates. Six referenced local CSS/font assets returned 200.
- HTTP checks ran before the final heading/analytics-return refinements. The final build and generated-artifact checks cover the updated source; no claim of full browser behavior follows from HTTP success.
- Targeted ESLint: changed marketing files, dialogs, locale exports, room hook and stylesheet passed with zero errors and zero warnings. Analytics was checked separately after its final correction and also passed with zero errors and zero warnings.
- The final corrected source was rebuilt successfully: compilation 7.4s, built-in TypeScript 7.4s, 32 static pages generated. Final generated English/French HTML also passed checks for heading order, one h1, anchor/ARIA label targets, locale-specific account links and existence of referenced local assets.
- `git diff --check` passed. Temporary production preview servers started for this task were stopped. No screenshots or browser process were started in Phase 4.
- No package additions, browser installations, visual-regression suite, repeated screenshot loop, live meeting creation or deployment.

### Production preview hostname finding

The first production preview bound to `127.0.0.1` returned a 307 loop for default-locale rewrites; `/fr` served normally. Binding the server to `localhost` matched Next.js's internal rewrite hostname and made the smoke checks pass. No middleware workaround, security-rule change or dependency downgrade was introduced. This observation is consistent with a [reported Next.js rewrite/bind-host issue](https://github.com/vercel/next.js/issues/94342), which was closed for missing reproduction rather than confirmed fixed. Production deployments with other bind-host arrangements need their own routing check.

### Deliberately unperformed

No rendered screenshot inspection at 320/390/768/1024/1440px, browser hydration/console check, keyboard/touch exercise, screen-reader audit, performance benchmark, signed-in browser session or live backend/recording/insights test. Responsive, focus, motion and dialog behavior are implemented and source-reviewed; they are not claimed as browser-verified. This is the owner's requested resource tradeoff.

Outstanding product facts remain in `00-product-truth.md`: insight eligibility, permissions, recording/consent, retention, pricing, capacity and privacy guarantees. None were invented to complete the page. Marketing copy remains English on both locale paths, with English language metadata on its subtree.

## Application-wide follow-up

The active implementation now shares typography, color tokens, controls and motion across the application. See root `DESIGN.md` for the three-phase rollout, component ownership and known product limits. Browser evidence is stored in `design/v2/evidence/application-checks.json` and `app-*.png`. These checks use local fixtures; they do not establish backend or live media readiness.
