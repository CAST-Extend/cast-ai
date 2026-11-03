---
name: blueprint-customer-context
description: Design and pre-fill the Customer Context input of a CAST Blueprint — the questions code can't answer (hosting, runtime, usage volumes, peaks, regions, target cloud and style, ranked business drivers, availability/RTO, compliance, budget, deadline, team skills, must-keep integrations), pre-filled from CAST Imaging where possible with provenance (detected / suggested / customer / not answered), "Don't know" turned into labeled assumptions, and readiness tracking for the Plan sections. Use this skill whenever the user wants a discovery questionnaire, customer intake form, modernization context capture, or the Customer Context page of a Blueprint — including mainframe variants (MIPS, batch window, contract renewal).
---

# Blueprint — Customer Context (an input, not a deliverable)

**Decision made with the user:** it lives in an **Inputs** block at the top of the navigation, next to "CAST Imaging analysis", above the deliverables — so it's clearly customer input, not analysis output. It is dynamic: options and pre-fills come from what Imaging found (e.g. must-keep integrations = detected payment/shipping plugins).

## Field record
`[id, group, label, help, type(info|one|many|rank|text), options[], prefill?{v, src: detected|suggested, why, ev[]}]` in 6 groups: Current state · Exposure & usage · Target direction · Business drivers (rank top 3 → Well-Architected pillar weights) · Non-functional targets · Constraints. Every closed question offers **"Don't know"**, which becomes a labeled assumption downstream.

## Question sets by stack
- **Web / Java / .NET:** hosting, provider, runtime, DB hosting, environments, today's annual run cost; exposure, peak users, orders/day, regions, seasonal peak, DB size, media size, monthly data served; target cloud, style (rehost / replatform / containers-then-services / microservices), managed vs portable; drivers; availability, RTO/RPO, response time; compliance (PCI DSS suggested when payment code or card data exists), budget, deadline, team size & skills, integrations to keep, notes.
- **Mainframe:** platform, MIPS used, batch window, environments, application share of mainframe cost, contract renewal; concurrent users, accounts, transactions/day, data volume, month-end peak, channels needed in target (3270 only / staff web UI / partner APIs / self-service); target cloud, approach (replatform COBOL / automated refactor to Java / rewrite / hybrid), managed vs portable; drivers incl. "mainframe cost / contract exit" and "skills & retirement risk"; interfaces to keep (MQ inquiries, daily file, statement PDFs…).

## Scope by focus area
Customer Context appears in the Inputs block only when the chosen focus area has a deliverable that needs it (To-be Design, Target State, Running Costs, Modernization Plan, ROI; not the Remediation Plan, and not Application management). Groups that serve one deliverable only show when it is in scope (`ctxInScope`):
- **Process redesign** (only with To-be Design, see `blueprint-to-be-design`): `tobe_process` (suggested: the domain with the largest transactions and most clarifications), `tobe_goals` (many), `tobe_change`, `tobe_release` (suggested "side by side" when front ends reach the back end only through its API). Listed in `PLAN_DEPS.tobe`.
- When new fields are added to an app whose answers are already saved, back-fill their suggestions (`ctxUpgrade()`).

## Pre-fills (provenance)
Detected: stack, DB engine, plugin/integration list. Suggested (needs Confirm): exposure "Both" when storefront + admin exist; compliance from payment code / card fields / Imaging data-sensitivity level.

## Plan readiness
`PLAN_DEPS = { tobe:[…], target:[…], cost:[…], plan:[…], roi:[…] }` — a Plan section is "ready" when all its fields are answered. Summary panel: completion ring, provenance counts, per-section readiness, list of fields that will become assumptions, "Load demo scenario" / "Clear answers". Answers persist in `localStorage` under a per-app key (`CTX_KEY`). Demo scenarios are invented — always say so.

## Output contract
Data: `CTX_GROUPS`, `CTX_FIELDS`, `CTX_DEMO`, `PLAN_DEPS`, `WAF` (driver → pillar). Engine (generic, reused as-is): `ctxLoad/Save/Prefill/Demo/Clear`, `ctxSet`, `ctxAnswered`, `planStatus`, `statusOf`, `C()` (Customer provenance helper), `ctxField()`, `ctxSummary()`; page `customerContext()`.
