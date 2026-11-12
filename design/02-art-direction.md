# Art direction: The Conversation Journal

This file records the first iteration. The active design and implementation map are in the root `DESIGN.md`.

Phase 2 specification, 2026-11-11. Selected for implementation; rendered refinement remains part of Phases 3–4. The owner requested deferring expensive browser automation. No rendered font comparison or external-site screenshot inspection is claimed.

## Central idea

One conversation appears in two forms: people speaking in a dark meeting room, then a readable record of what they discussed. The page makes the relationship visible through a continuous Launch Planning example. Topic, decision and follow-up recur deliberately; arbitrary decorative UI does not.

## Visual decisions

- Light paper is the reading environment. Forest ink provides strong text. Sage marks the transition through meeting stages. Dark meeting surfaces establish the live product context. Clay is used for a decision marker or fine editorial rule.
- Newsreader 400 is the display and document-heading face. Its role is to distinguish narrative/document reading from the compact sans-serif controls. Manrope 400/600 provides body and interface typography. Both are locally sourced with OFL licenses. No italic highlight or colored word is required in the hero.
- Keep the existing Recallo name and letter-R mark; refine the mark into a flat clay square with an 8px radius. Do not introduce an untested replacement logo.
- Use a clear horizontal datum across the hero copy and product composition. A narrow index rail can identify the three major chapters: meeting, record, application. Do not add an eyebrow to every heading.
- A fine vertical timeline links conversation excerpts to outcomes. Use real text as visual material, at readable sizes. Lines carry a relationship; they do not fill empty space.
- Product previews have one containing frame and restrained corners. Documents use rules, metadata and type hierarchy rather than nested cards. Use one shadow on the hero product frame; ordinary sections need no shadow.
- No stock photography is needed for v1. Camera-off participant initials are faithful to supported state, with a clear example label. This avoids implying stock models are customers.

## Composition and rhythm

Hero: asymmetric text and meeting/document diptych. Problem: compact editorial passage and transcript-to-decision row. Journey: connected before/during/after sequence. Live section: large dark product field. Insights: a substantial light document next to explanatory text. Use cases: ruled editorial rows. Questions: native disclosures. Closing: restrained forest field with clear actions.

Do not make every section a bordered rectangle or alternate identical text/image splits. The problem passage and journey share a continuous reading flow so the page does not feel like eight disconnected campaigns.

## Decision authority

`00-product-truth.md` governs claims. This file governs visual intent. `specimen/tokens.css` governs concrete visual values; `04-design-tokens.md` governs permitted combinations and type roles. Later critique can adjust a token or composition with a recorded reason, but cannot silently replace this direction with a researched skill's defaults.

## Assumptions

English copy is the source language for this redesign. Preserve `/fr` routing, but do not imply that English marketing prose has been professionally translated. Product screenshots may require authenticated backend state; use explicitly labeled faithful illustrations if that state is unavailable. No data-retention, security or availability promises are inferred.
