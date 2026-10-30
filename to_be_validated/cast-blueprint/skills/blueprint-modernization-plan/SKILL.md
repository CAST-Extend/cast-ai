---
name: blueprint-modernization-plan
description: Build a prescriptive modernization plan for an application from CAST Imaging findings, the target state and customer constraints — phases (decide & prepare, fix & harden, cloud-ready / convert, migrate & cut over, decompose/evolve), 18–22 work packages with scope evidence, links to debt, clarifications, decisions and rules, person-week effort ranges with overhead and a manual vs AI-assisted toggle, a Gantt with gates, freeze windows and deadline, critical path, and per-package Markdown export for delivery teams or AI agents. Use this skill whenever the user asks for a modernization roadmap, migration plan, wave plan, effort estimate or work breakdown for an application, or the Modernization Plan section of a CAST Blueprint.
---

# Blueprint — Modernization Plan

A prescriptive **order of operations**, not a generic roadmap: every package is sized from CAST scope counts and linked to the finding it resolves.

## Phase template (adapt per stack)
- **P0 Decide & prepare** — resolve clarifications; safety net (characterization tests + Gherkin from Business Rules; for batch: **golden files** captured from production runs); cloud foundation; CI/CD + dependency-scanning gate; skills enablement (only if team skills lack the target cloud/Kubernetes); conversion pilot on one program (mainframe).
- **P1 Fix & harden** — money/revenue-path defects (from clarifications), CVE upgrades (from the Debt OSS tab), security flaws, reliability quick wins, dead code. Fix on today's platform where it's cheapest.
- **P2 Cloud-ready / convert** — blockers → managed services (sessions/cache, files → object storage, config/secrets, DB, messaging, identity), containerize; mainframe: convert online, convert batch + schedule as code, data model.
- **P3 Migrate & cut over** — data migration + reconciliation, peak/batch-window test, parallel run (mainframe: through a month-end), cutover, decommission.
- **P4 Decompose / evolve** — least-coupled domains first; shared-write tables/repositories get one owner before the coupled core moves; rebuild large UI (admin console) when it dominates the debt.

## Work package record
`[id, phase, title, lowPW, highPW, aiFactor, _, links{td,c,adr,br,fr}, [scopeBasis, ...evidenceIds], dependsOn[], kind?("skill")]`. Effort: person-weeks from scope counts; +35% overhead; $4,000/pw blended rate (assumption — replace with customer/partner rate). AI factors 0.4–0.6 on coding/testing/docs packages, 0.8–1.0 on decisions, foundations, cutover — planning assumptions, stated as such. The user removed an "agent-ready" badge as confusing — keep packages plain; the value is in the export.

## Schedule (`planModel(mode)`)
Phase start/end from durations (AI factor per phase), overlaps (P1 starts 2–4 weeks into P0; P3 overlaps P2 by 2 weeks), freeze windows from the seasonal peak (skip P2 start into January), cutover = P3 end − 3 weeks, deadline from Customer Context, budget check. Construct dates with `new Date(y, m, d)` (ISO strings shift a day).

## Page anatomy
Manual / AI-assisted switch → KPIs (cutover, person-weeks, FTE, delivery cost vs budget) → plan in brief (Inferred + Customer) → Gantt (phases, gates G1–G4 in teal, freeze, deadline) → manual vs AI table → phase cards with packages (click → drawer with scope, links, Gherkin acceptance tests, evidence) → gates with pass criteria → critical path → assumptions.

## Remediation Plan (Tech debt & risk reduction focus area)
The same engine under the name **Remediation Plan** (`planName`): phases P0 and P1 only (decide & prepare, fix & harden), without cloud packages (`REM_DROP`, e.g. cloud foundation and cloud skills enablement) and with packages re-based on fixing in place where needed (`REM_BASIS`). It does not depend on Customer Context. `remPlan()`, `setRemMode()`, `remWps(pm)`; export `plan/remediation-plan.csv`. Manual and AI-assisted totals are computed separately per mode (`sumOf(mode)`), so the comparison never shows the same number twice. In Process & application reimagination, add packages that build the to-be boundary (facade, new process, retire old path) from `blueprint-to-be-design`.

## Output contract
Data: `PLAN_START`, `PHASES`, `WPS`, `RATE`, `OVERHEAD`. Functions: `planModel()`, `planGantt()`, `openWP()`, `setPlanMode()`, `modPlan()`, `PLAN_FILES()` (`plan/modernization-plan.csv` + `work-packages/WP-##.md`). Work-package IDs are referenced by the Debt OSS tab and ROI — keep them stable. Check Gantt labels for overlap.
