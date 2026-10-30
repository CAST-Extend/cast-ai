---
name: cast-blueprint
description: Orchestrate a full "CAST Blueprint" for an application — customer-ready outputs generated from CAST Imaging analysis (via the CAST MCP gateway) plus AI, organized by four focus areas (Migration & modernization, Tech debt & risk reduction, Application management, Process & application reimagination): Executive Summary, Application Specification, Business Rules, User Stories, Technical Diagrams, Technical Debt, Customer Context, To-be Design, Target State, Running Costs, Modernization (or Remediation) Plan and ROI, plus an "Ask this Blueprint" chat, all with an evidence trail separating extracted facts from inference. This skill holds the shared contracts (provenance, evidence registry, IDs, focus areas, build pattern) and sequences the twelve blueprint-* section skills. Use it whenever the user wants to run the Blueprint on a new application ("do the same for CardDemo"), rebuild or extend the Blueprint prototype as a whole, demo it, or asks "what do I do with this CAST data?" — even if they don't say "Blueprint". For a single section, the matching blueprint-<section> skill is enough.
---

# CAST Blueprint — orchestrator

**Positioning (2026-10):** Blueprint is an **asset for prospect and customer conversations and demos** — an example of the outputs you get by combining CAST insights (incl. GraphRAG) with AI. It is not a product offering, a set of deliverables, or canned reports. Keep that framing in anything customer-facing.

`assets/blueprint-template.html` is the Shopizer snapshot (Java/Spring) to copy for a new Blueprint page. It includes the focus-area splash, the To-be Design and the chat. CardDemo (COBOL/CICS) and GrandNode (.NET + MongoDB) are the other stacks this was validated against, built before focus areas existed. Keep Blueprint pages local — don't publish them as Artifacts (CAST branding) unless the user asks.

**Customer-facing wording:** the page says "focus area", never "use case", "conversation", "prototype" or "product". "Use case" stays internal (code: `USE_CASES`, `useCase`). Placeholders say "not available in this example" or "available on request".

## Focus areas (the splash)
The splash asks the viewer to **choose a focus area** (hero: "What CAST insights and AI can produce for this application"); there is no fake "Generate" step. The four focus areas are CAST's core use cases, and each shows its own deliverables — core in their groups, plus an "Also available" group; everything else is hidden.

| Focus area (`id`) | Core | Also available |
|---|---|---|
| Migration & modernization (`mm`) | Exec, Spec, Rules, Diagrams, Debt, Target, Costs, Plan, ROI | Stories |
| Tech debt & risk reduction (`debt`) | Exec, Rules, Diagrams, Debt, **Remediation Plan** | Spec, ROI |
| Application management (`am`) | Exec, Spec, Rules, Stories, Diagrams, Debt | — |
| Process & application reimagination (`reimag`) | Exec, Spec, Rules, Stories, Diagrams, **To-be Design**, Target, Plan, ROI | Debt, Costs |

- Data: `USE_CASES [{id, name, icon, ask, core[], also[], planName?}]`; the choice persists in `sessionStorage` (`bp_uc`). Helpers: `setUseCase()`, `ucHas()`, `ucNeedsCtx()`, `delivName()`. The router keeps a `#/ws/<id>` deep link only when a focus area is set.
- Customer Context shows in the Inputs block only when a deliverable needs it (`CTX_USERS = tobe, target, cost, plan, roi`; the Remediation Plan doesn't).
- The facts never change between focus areas; the Executive Summary's readiness heading, bottom line and recommendations do (`execFrame(uc)`, see `blueprint-executive-summary`).

## Ask this Blueprint (chat)
A docked right-hand panel on every page, splash included; open state and conversation persist in `sessionStorage` (`bp_ask`). Today it answers **only from the page's own data** — keyword intents plus a search index over rules, FRs, clarifications, debt, CVEs, work packages, stories and to-be decisions, and it calls the cost / ROI / plan / target models for numbers. No LLM is involved, so say so. Call-graph questions ("who calls X") answer that they need live CAST Imaging.
- Answers go through a source adapter: `ASK_SOURCES = { blueprint: {ready:true, answer}, imaging: {ready:false} }` with the contract `answer(q, ctx) → Promise<{lead, items, follow, miss?}>`. The `imaging` source is the place to plug a backend that holds an LLM and the CAST MCP gateway.
- Per app, rebuild `bpAnswer()` intents and `askSuggest()` chips from that app's data; links to a deliverable outside the current focus area switch focus area (`askHome()`).

## Section skills (one per left-panel entry)

| Nav | Skill | Depends on |
|---|---|---|
| Input · CAST Imaging analysis | this skill + `references/imaging-queries.md` | — |
| Input · Customer Context | `blueprint-customer-context` | discovery |
| Executive Summary | `blueprint-executive-summary` | all findings (write last) |
| Application Specification | `blueprint-application-specification` | discovery, showcase domain |
| Business Rules | `blueprint-business-rules` | spec (FR, C-##) |
| User Stories | `blueprint-user-stories` | spec, rules |
| Technical Diagrams | `blueprint-technical-diagrams` | discovery, spec |
| Technical Debt | `blueprint-technical-debt` | discovery, C-##; WP-## for the CVE tab |
| To-be Design (reimagination only) | `blueprint-to-be-design` | spec, rules, diagrams, context |
| Target State | `blueprint-target-state` (+ `well-architected-target-state`) | debt, context (to-be design in reimagination) |
| Estimated Running Costs | `blueprint-running-costs` | target state, context |
| Modernization Plan (Remediation Plan in tech debt) | `blueprint-modernization-plan` | debt, rules, target state, context |
| Return on Investment | `blueprint-roi` | costs, plan, context |

## Workflow for a new application
1. **Discover** (`imaging-queries.md` §1): applications, stats, layers, transactions, quality summary, packages, CVEs. Confirm the application set with the user (front ends and back end usually belong together). Check whether the semantic layer exists; if it doesn't, plan on `object_details` with `focus:"code"`.
2. **Pick the showcase domain.** Go deep on one domain (the revenue path or the one with the largest transactions) and list the others as "available on request". If there are no domain tags, group by namespace, URL or program and label the grouping Inferred.
3. **Read the code that matters.** Mismatches between intent and behaviour become clarifications C-## with the source excerpt.
4. **Build the sections in dependency order:** Spec → Rules → Stories → Diagrams → Debt → Context → To-be Design → Target State → Costs → Plan (and its remediation variant) → ROI → Executive Summary (with the four `execFrame` variants) → chat intents. Then go back to the Debt CVE tab to link its WP-## IDs.
5. **Verify** every headline number against the raw results. Past errors: 79 vs 64 CVEs, 46 vs 47 tables, "19,000 links" vs ~13,500.
6. **Test in the browser pane:** in each of the four focus areas, every page renders, every export works, no SVG text overflows, no console errors, no horizontal scroll at phone width; ask the chat a few questions per focus area.

## Shared contracts (all section skills rely on these)

**Provenance.** Every rendered statement carries one tag. This discipline is what separates Blueprint from "an LLM read my code".

| Tag | Meaning | Helper |
|---|---|---|
| ◆ Extracted | CAST Imaging data or source returned by the MCP | `X(text, ...evIds)` |
| ◇ Inferred | LLM interpretation; always states its basis | `I(text, basis, ...evIds)` |
| ● Customer | Customer Context answer | `C(text, ...fieldIds)` |
| ▲ Framework | Well-Architected guidance | `F(text, pillarKey)` |
| $ Price list | Public cloud list prices | `Pr(text, cloud)` |

- Each tag opens the evidence drawer. A grounding bar per page (`paintGrounding()`) counts statements by type. Build statement lists once, because repeated `X()`/`I()` calls inflate the counts.
- Anything you conclude from reading source yourself is **Inferred**, and the page shows the code.

**Evidence registry.** `EV[id] = { t: title, q: MCP call or Cypher, r: returned values or code excerpt }`. Every `X()` references at least one EV id.

**IDs** (stable across sections, since the cross-links are much of the value): FR-### functional requirement · FR-N## new (to-be) requirement · BR-XX-### rule · BR-TB-N## new (to-be) rule · C-## clarification · XX-US-## story · TD-## debt · ADR-## decision · WP-## work package · G1–G4 gates.

**Shared UI.**
- Inputs block above Deliverables in the nav.
- Every page has an **Export for agents** button that writes Spec Kit files, Gherkin, Mermaid, ADRs, Jira CSV and per-WP Markdown.
- Brand: purple `#624ABB`, deep `#463589`, ink `#0C0613`, Inter font, CAST logo.
- Dates: use `new Date(y,m,d)`.

## Build pattern for a new app
Copy `assets/blueprint-template.html` and replace the Shopizer data and page content. Keep the shared pieces already in that file: head and CSS, focus-area splash and nav filtering, provenance helpers, export modal, rule and story cards, sequence SVG/Mermaid, debt register, customer-context engine (`CTX_KEY` per app), cloud icons, prices, ROI curve, evidence drawer, chat panel and its search index.
- **Effort reference:** a full app took ~16–30 min and ~200–500K context.

## Pitfalls learned the hard way
- **Imaging AI summaries can restate intent rather than behaviour.** Treat them as leads, label them Inferred, and prefer the source.
- **CRUD via SQL links misses ORM writes** (Hibernate/JPA, MongoDB repositories). Say so on the page.
- **Dependency-injection .NET:** start blast radius and call chains from the service interface method. The concrete class has few direct callers.
- **Mainframe:**
  - Entry points are CICS transactions plus JCL/CA-7 jobs. The CA-7 `FIRE` chain gives the schedule, so look for jobs missing from it.
  - Program → VSAM/DB2/IMS/MQ access replaces REST contracts.
  - List paragraphs via `SubObject -[:BELONG_TO*1..2]-> program`.
- **"0 CVEs" may mean SCA isn't configured.** Say so rather than claiming the app is clean.
- **javascript_tool can't see script-level `let`.** Test through setter functions.
- **Preview pane:** edits made by scripts don't reload the page, so make a small Edit to refresh.
- **Official cloud icons:** ask before downloading icon packs. `assets/build-icons.mjs` embeds only the icons used, unmodified.

## References
- `references/imaging-queries.md`: shared MCP/Cypher cookbook for every section.
- `references/deliverables.md`: index pointing to the section skills (the design notes now live there).
- `assets/blueprint-template.html`: Shopizer snapshot. `assets/build-icons.mjs`: icon embedder.
