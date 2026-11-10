# Section and component layouts

Spec values are implementation targets, not rendered measurements. Container: `min(1280px, 100% - 2*gutter)`; gutter 20px at 320, 24px at 390–767, 40px at 768–1199, 64px at 1200+. Use 12 columns/24px gap on desktop; four columns/12px gap on compact widths. Sections grow with content.

| Area | Desktop composition | Compact composition | Geometry |
| --- | --- | --- | --- |
| Header | Brand left, three anchors center, account/actions right | Brand and Join/Menu; account actions in disclosure | 80px target height desktop, 68px compact; static header initially |
| Hero | Copy 5 columns, visual 7. Meeting frame with aligned summary slip at its lower edge; purposeful overlap <=48px | Copy, actions, then meeting and summary in normal flow | 80px top/112px bottom desktop; 48px/72px compact. At 1024 use stacked visual if copy becomes cramped |
| Problem | Heading 5 columns, prose 6 columns offset one; transcript → decision across a ruled band below | Heading, prose, then vertical source/outcome relationship | 80px vertical; no surrounding card |
| Journey | Continuous 3-stop line with unequal text measures and small index numbers | Vertical line and three ordered steps | 112px desktop / 72px compact. No three equal bordered cards |
| Live | Heading and intro above dark product field. Grid/focus example 9 columns; chat 3 | 2-column participant grid then chat excerpt; explanatory labels outside frame | 32px frame padding desktop / 16px compact; section 112px/72px |
| Insights | Editorial introduction 4 columns; readable summary document 7 columns offset one | Intro then full-width document with stacked metadata | 40px document padding desktop / 20px compact; section 144px/80px |
| Use cases | Heading above 4 ruled rows; label 4 columns / explanation 8 | Label then description within each row | 24–32px per row; no repeated icon tiles |
| Questions | Heading 4 columns / disclosure list 7 columns offset one | Heading then full-width disclosures | 24px row padding; 48px minimum summary target |
| Closing/footer | Forest field, headline 7 columns, actions below; footer on paper | Stacked headline/actions; two-column link list | 80px/64px closing padding; footer 32px |

## Product composition

Use one realistic meeting identity throughout, “Launch Planning.” Tile labels Priya, Alex, You. Camera-off initials are acceptable; no camera access is requested on marketing. A paper summary slip is anchored to the meeting frame's bottom alignment, not arbitrarily floating. Its decision repeats in the larger record section.

Preview controls are illustrative. Render them as non-focusable visual marks, not inactive buttons with hover cues. Provide the explanatory caption outside the frame. The optional demonstration switch changes actual preview content and must be implemented as a real control.

The summary is a single document: title/metadata, discussion, key point, decision, follow-up, transcript excerpts. Do not add checkboxes because the product does not persist completion. Transcript rows have speaker number and time; timestamps have no link affordance.

## Implementation boundaries

Keep server page/layout for content. Candidate components: marketing navigation/actions (client), hero, meeting illustration, journey, record illustration, use-case rows, questions and closing. Put data for the fictional example in a shared module so decisions/names stay consistent. Component separation follows complexity; avoid one component for every paragraph.

Use a marketing account-aware action component for creation and join. Existing creation/join hooks and dialogs remain the functional source. Shared modal accessibility improvements, if necessary, must preserve the owner's pre-existing edits and improve semantics/focus without changing room APIs.

Illustrated product surfaces can simplify the interface, but captions must identify them as illustrations. Native disclosures work without a client bundle. No server request to the meeting backend is required to render marketing.
