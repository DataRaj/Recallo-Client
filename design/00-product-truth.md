# Product truth and marketing claims

Audit date: 2026-11-11. Evidence is the current client implementation, not a production/backend verification. A service function proves that the client requests something; it does not prove server availability, permissions or data quality.

## Core proposition

Browser meetings connected to useful meeting context afterward. Working positioning: **Have the conversation. Keep the context.** Audience focus supplied by the owner: small teams, independent professionals, consultants and distributed collaborators. This audience has not been validated through customer research in this task.

## Evidence ledger

| Area | Evidence in repository | Allowed representation | Boundary |
| --- | --- | --- | --- |
| Create entry | Marketing page links to `/register`; creation UI lives in `components/modals/create-room-modal.tsx` | Create a room, with account setup in the actual path | Do not imply that the hero creates a room immediately |
| Room creation | `hooks/use-room.ts` calls `services/room-service.ts` with title and host identity | A titled meeting room | Description, scheduling and specialized room settings are not sent in that call |
| Join entry | `components/marketing/join-room-cta.tsx` opens existing join modal; `useRoom.joinRoom` retrieves room and navigates | Join by room ID or invitation | Lookup and connection require backend; no claim of guaranteed success |
| Account requirement | `components/meeting/meeting-gate.tsx` redirects signed-out users to login with return URL | Sign in may be required before entering a meeting | Guest identifiers/types and public route declarations do not override this guard; do not promise account-free participation |
| Pre-join | `components/meeting/pre-join-lobby.tsx` enumerates devices, previews camera, selects inputs/outputs, collects display name | Check camera, microphone and available devices before joining | Permissions, device availability and browser support vary; no promise that every output selector works everywhere |
| Live meeting | `live-room.tsx`, `meeting-stage.tsx`, `video-grid.tsx`, `focus-view.tsx`, `controls-dock.tsx`, media and hand-raise hooks | Video/audio, sharing, participants, chat, hand raising; grid and screen focus | Runtime quality, capacity and latency unverified |
| End of meeting | Meeting gate routes a departed session to `/meetings/{name}/insights` | There is a path from meeting to insights | Do not imply results are immediate |
| Insights processing | `services/insights-service.ts`; insights page polls every four seconds | Live/processing/completed/failed states; transcripts and summaries when available | Eligibility, recording policy, model accuracy and processing times unresolved |
| Summary | `services/summary-service.ts`, `components/insights/summary-view.tsx` | Executive summary, key points, decisions, action items, tags | Assignee/deadline are generated data fields, not proof of task management or notifications |
| Action completion | Summary checkboxes have no persistence handler in the view | Display an example follow-up task | Do not promise synchronized task tracking, assignments or reminder automation |
| Transcript | `services/transcript-service.ts`, `components/insights/transcript-view.tsx` | Text, grouped utterances and timestamps where supplied | Speaker labels are numbered; do not claim automatic identification of named people or clickable audio playback |
| History | `services/room-service.ts` has `listRooms`; protected meetings page uses it, including transcript/summary availability flags | A meetings history interface exists | Home transcript/summary arrays remain empty; do not claim a complete universal knowledge archive or full-text search |
| Webinar | Creation option, route and meeting gate mode exist | Adjacent product direction | API mapping returns type `meeting`; no verified specialized broadcast, registration, Q&A, capacity or analytics service |
| Privacy | Analytics provider initializes PostHog if configured | Only specific, independently confirmed policy statements | Zero-tracking wording conflicts with optional analytics integration; actual deployment configuration not inspected |

## CTA contract to preserve

1. Signed-out create entry must reach real registration, with clear account-setup context.
2. Preserve signed-in account access and provide a useful dashboard/create route in Phase 2's specification.
3. Joining must open the existing modal, preserve room lookup, errors and navigation, and handle the auth redirect honestly.
4. Use existing route definitions and locale navigation conventions. The app supports `en` and `fr`, default English, locale prefix as needed. Existing hardcoded Next links and `useRoom` navigation differ; check both locales rather than assuming preservation.
5. Meeting creation currently opens a new tab; marketing changes must not silently rewrite that behavior.

## Claims excluded until evidenced

- “2,400+ teams,” customer logos, testimonials and ratings.
- Public beta status and any free/paid commercial promise.
- End-to-end encryption, zero tracking, zero ads, compliance or retention guarantees.
- HD quality, instant/ultra-low-latency or uptime guarantees.
- Rich chat attachments, threads or reactions without further implementation evidence.
- Specialized webinar analytics, Q&A and audience scale.
- Automatic results for every meeting, real-time transcription, named-speaker attribution and transcript-to-audio links.
- Calendar integrations, automated task dispatch, enterprise administration or universal archive search.

## Safe demonstration content

Use a single fictional Launch Planning meeting throughout. Example decision: move the launch review to Thursday. Example action: Priya will share the revised draft before the review. Label the content as an illustrative example; do not imply a real customer, production recording or guaranteed output. A marketing document can summarize supported data fields while remaining visibly distinct from a captured application screenshot.

## Unresolved product information

Recording initiation/consent, eligibility for insights, access permissions, retention/deletion policy, plan limits, commercial availability, webinar specialization and production reliability. Omit unsupported answers from public copy. These unknowns do not block a faithful demonstration or the rest of the redesign.
