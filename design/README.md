# Recallo marketing redesign

Working record started 2026-11-11. Repository baseline: `cdbebe1`.

## Four-phase delivery

The owner requested four bounded phases, with a pause after each phase until they type **continue**. Do not proceed across that boundary automatically. This is a pacing instruction, not a requirement for repeated design approvals.

| Phase | Work | Reviewable result | Status |
| --- | --- | --- | --- |
| 1 | Inspect product, audit current marketing, research methods and references | Product truth, audit, source ledger, implementation constraints | Complete at source-inspection level; browser observations explicitly pending |
| 2 | Establish narrative, copy, art direction, tokens, layouts, assets, motion, responsive rules | Concrete design foundation, including typography specimen and component/state specification | Complete specification; rendered inspection deferred per owner request |
| 3 | Implement in the existing Next.js application | Complete marketing page, working navigation and existing join flow | Implemented; source/type/lint checks performed, runtime inspection deferred |
| 4 | Review integration, critique, refine and validate within agreed resource limits | Production build, HTTP/source checks, unit results and explicit verification limits | Complete bounded validation; visual/keyboard browser QA remains unperformed |

## Reading order

1. `00-product-truth.md`: claims and behavior must follow this evidence.
2. `00-existing-design-audit.md`: priorities and technical boundaries.
3. `01-reference-research.md`: sources, applicability and research limits.
4. `02-art-direction.md` through `09-anti-slop-criteria.md`: selected visual direction and implementation specifications.
5. `10-validation-report.md`: checks actually performed and outstanding work.

Avoid empty placeholder specification files. Create each when it contains project decisions.

## Scope

Redesign the marketing route and its own components/styles within this repository. No separate hosted Site, deployment, authentication rewrite, meeting redesign or API changes are needed for this task. Use the existing server-rendered page and layout, adding client components only for behavior. Keep the existing global providers.

Two files had local modifications before this work: `src/app/[locale]/(protected)/layout.tsx` and `src/components/modals/base-modal.tsx`. Preserve those edits. No application source was changed in Phase 1. No external skill packages were installed.

## Phase 2 entry requirements

- Recheck the working tree and changed product behavior before freezing copy.
- Review actual visual references in a rendered browser if available. Source extraction alone does not establish typography, grid, motion or responsive quality.
- Set one visual authority for marketing. New marketing tokens must be scoped so account, chat and meeting themes do not change accidentally.
- Specify signed-out and signed-in CTA behavior, locale behavior and join-modal states.
- Prefer real screenshots; if authenticated/live state is unavailable, identify faithful illustrative compositions and staged data explicitly in the asset manifest.
- The selected direction is the Conversation Journal. Phase 2 selects typography, color roles and composition; the implemented render remains subject to refinement.

## Phase 2 review

Open `specimen/index.html` directly in a browser: it loads local fonts, compares the selected serif/sans direction with sans-only, shows the document language and palette, and includes working sample states. It is an offline design artifact, not the marketing implementation. The owner requested deferring expensive browser automation; no screenshot or rendered-fit validation is claimed.

Phase 3 implements this foundation in the actual marketing route. Preserve full functional scope and accessibility despite the lighter verification process.

## Phase 3 handoff

The marketing page/layout now use local Newsreader and Manrope, a scoped stylesheet, server-rendered editorial sections, shared fictional content and small client components for navigation, account/create/join actions and a working three-view product example. The footer and navigation have real section destinations. Unsupported marketing claims and placeholder policy links are removed.

Existing room APIs/hooks remain in use. Marketing creation uses a title-only variant of the existing form; other creation entry points retain their existing options. Room navigation now uses the locale-aware router. Account settings, appearance and sign-out remain available. Native dialog handling improves focus containment and labeling while preserving the owner's Escape-while-editing behavior.

Protected-layout edits remain untouched. The shared base modal was intentionally enhanced, preserving the behavior of the pre-existing edit rather than discarding it. No new application dependencies or browser suite were installed. Product visuals are labeled original HTML/CSS illustrations, not screenshots.

Next: Phase 4 performs bounded validation and refinement. Respect the request to avoid expensive automation: prefer a small targeted inspection when available, source/technical checks and a clearly stated limitation for anything not executed. Pause for **continue** before starting. Production build and runtime/browser inspection have not yet been performed.

## Final handoff

All four phases have been delivered within the owner's revised verification scope. Production compilation, HTML routing/assets and source checks are documented in `10-validation-report.md`. Browser screenshots, client hydration/interaction checks and real meeting operations are not verified; do not describe this work as a completed visual or accessibility certification.

Preview with `pnpm dev`. For a local production preview, build and run `pnpm exec next start --hostname localhost --port 3000`; the explicit localhost binding avoids the hostname mismatch observed with the production locale rewrite during this validation. No deployment or commit was requested or performed.

The design artifacts remain the handoff for a senior designer. Further refinement should start from the implemented page and the existing token system, with concrete observations, rather than regenerating a new visual direction.
