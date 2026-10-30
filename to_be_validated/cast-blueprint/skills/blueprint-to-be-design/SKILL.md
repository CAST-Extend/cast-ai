---
name: blueprint-to-be-design
description: Build the To-be Design section of a CAST Blueprint — what one business process should become, designed from what the code does today (CAST Imaging analysis) and what the business wants (Customer Context) — an as-is → to-be process flow, a keep / change / retire decision for every extracted business rule plus new rules, a Spec Kit delta spec (new FRs) against the as-is spec, and the boundary & API view showing how the new process goes live beside the old one (strangler fig). Use this skill whenever the user asks how a process should be redesigned or reimagined, a to-be process or to-be spec, which business rules to keep or retire, or the To-be Design page of a Blueprint (Process & application reimagination focus area).
---

# Blueprint — To-be Design

Answers **"what should the application do?"** for one business process. It is not the Target State: Target State answers *where it runs* (cloud, services, Well-Architected); To-be Design comes first and answers *what the process does*. Only shown in the **Process & application reimagination** focus area.

## Inputs
- **As-is, from upstream sections:** the showcase domain's spec (FR-###, C-##), business rules (BR-XX-### with status), journey sequence and domain coupling (Technical Diagrams), CRUD ownership.
- **Customer Context, group "Process redesign"** (only in scope when this section is): `tobe_process` (which process — suggested: the domain with the largest transactions and most clarifications), `tobe_goals` (many: what the business wants), `tobe_change` (keep & fix / redesign steps / rethink end to end), `tobe_release` (side by side routed step by step — suggested when front ends reach the back end only through its API — or one release). Add the fields to `PLAN_DEPS.tobe`. When adding fields to an existing app, back-fill suggestions into saved answers (`ctxUpgrade()`).

## Build only one process
Go deep on the showcase process (`TB_BUILT`); every other `tobe_process` option shows an **"Available on request"** panel via process chips (`tobeView`). Use `tbAnswer()` for the title so a "Don't know" answer reads sensibly.

## Tabs
1. **Overview** — intent (Inferred + Customer), KPIs (steps kept/changed/new, rules keep/change/retire/new, new FRs), compact as-is → to-be flow, clarifications that block the redesign.
2. **Process** — as-is steps (Extracted, each with evidence and its clarification) beside to-be steps tagged kept / changed / new. To-be steps are **Inferred**, never Extracted, even when "kept".
3. **Rule decisions** — every extracted rule gets keep / change / retire with the new statement, the reason and the clarification it resolves; then new rules `BR-TB-N##` with Gherkin. Steps and rules tied to a goal the customer did not select are dimmed as optional.
4. **spec.md** — a Spec Kit **delta** feature (e.g. `002-<process>-reimagined`) against the as-is `001-…` spec: changed FRs and new `FR-N##`, each with its rule IDs; open decisions as `[NEEDS DECISION: …]`.
5. **Boundary & API** — which neighbouring domains the process has two-way links with (from the domain map), what each becomes (API, event, inside the boundary), the API list (kept / new / retired), and strangler-fig go-live steps (facade → route step by step → retire old path).

## Data and output contract
Data: `TB_GOAL`, `TB_ASIS [title, what code does, ev[], C-##]`, `TB_TOBE [title, text, kind, goal, rules[]]`, `TB_DEC {BR-id: [decision, new statement, reason, C-##, goal]}`, `TB_NEW`, `TB_FR`, `TB_FR_NEW`, `TB_NEIGH`, `TB_API`, `TB_BUILT`. Functions: `tobeDesign()`, `tobeOverview/Process/Rules/Spec/Boundary()`, `tbFlow()`, `tbFeature()`, `tbCounts()`, `tbRuleRows()`, `TOBE_FILES()`. Export: `specs/002-…-reimagined/spec.md`, `rules/to-be/*.feature` + decisions, `tobe/boundary.md`.

## Rules
- Provenance as in `cast-blueprint`: the as-is side is Extracted, every to-be statement is Inferred with its basis, goals are Customer.
- Every changed or retired rule must cite its current status and evidence; every new rule cites the goal or clarification that motivates it.
- The Target State, Plan and ROI in this focus area should reference the to-be boundary (e.g. Plan packages that build the facade and the new process).
