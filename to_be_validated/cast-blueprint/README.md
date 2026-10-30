# CAST Blueprint

## Executive Summary
CAST Blueprint turns CAST Imaging analysis (including semantic search) plus AI into the outputs customers ask for when they plan work on an application: an executive summary, an application specification in GitHub Spec Kit format, business rules, user stories, technical diagrams, a technical debt assessment, a to-be process design, a cloud target state, running costs, a modernization or remediation plan, and ROI. The result is a single interactive HTML page. It opens on a choice of **four focus areas** (Migration & modernization, Tech debt & risk reduction, Application management, Process & application reimagination), and each focus area shows the deliverables that matter for that conversation. Every statement on the page is labeled with where it came from: extracted from CAST, inferred by AI, customer input, framework guidance or price list. Blueprint is an asset for prospect and customer conversations and demos, not a product offering.

## CAST Use Case
Modernization acceleration
<!-- Also covers: Tech debt reduction, App maintenance & enhancement, Business rule extraction (one focus area each). -->

## Target Users
- CAST presales and solution engineers preparing customer conversations and demos
- Architects and modernization leads assessing an application
- Delivery teams and AI coding agents consuming the exported specs, rules and work packages

## Benefits
- **From analysis to outputs in under an hour:** a full Blueprint for one application took about 16–30 minutes of agent time on the three validation apps.
- **Grounded and traceable:** every statement carries a provenance tag that opens its evidence (the MCP call or source excerpt behind it), so the page separates what CAST found from what AI inferred.
- **One analysis, four conversations:** the same facts are reframed per focus area instead of rebuilding the page.
- **Ready for agents:** every page exports Spec Kit files, Gherkin, Mermaid, ADRs, Jira CSV and per-work-package Markdown.
- **Ask this Blueprint:** a chat on every page answers questions from the Blueprint's content, built to connect to CAST Imaging over MCP later.

## Asset Status
Demonstration only

## Version
0.2.0
- 0.2.0 — four focus areas on the splash, To-be Design section (`blueprint-to-be-design`), Remediation Plan variant, "Ask this Blueprint" chat, customer-facing wording
- 0.1.0 — orchestrator and eleven section skills, validated on Shopizer, CardDemo and GrandNode

## Solution Description
- **CAST data:** the skills query the CAST Imaging MCP gateway: structural functions (applications, stats, architecture, transactions, data graphs, quality insights, CVEs, packages, objects and call graphs), semantic search where available, and read-only Cypher for counts such as domain coupling. `skills/cast-blueprint/references/imaging-queries.md` is the query cookbook.
- **What the AI does:** it picks a showcase business domain, reads the code behind the key transactions, and writes each section from the CAST results. Where the code and its apparent intent disagree, it raises a numbered clarification (C-##) with the source excerpt.
- **Provenance and evidence:** a shared contract defined in the `cast-blueprint` orchestrator skill. Five tags (Extracted, Inferred, Customer, Framework, Price list), an evidence registry, and stable IDs (FR, BR, C, US, TD, ADR, WP) that cross-link the sections.
- **Customer Context:** an intake page pre-filled from what Imaging detected. It collects the inputs code can't answer, such as hosting, volumes, target cloud, drivers, budget, deadline and the process to redesign. "Don't know" answers become labeled assumptions.
- **Page build:** each section skill fills a part of one HTML page, using `skills/cast-blueprint/assets/blueprint-template.html` (the Shopizer Blueprint) as the shell and engine. Running costs use public list prices: live from the Azure Retail Prices API, approximate for AWS and GCP.
- **Validation:** the AI re-checks headline numbers against the raw query results, then tests every page and export in a browser.

## Outputs Produced
- One interactive HTML Blueprint per application, organized by four focus areas:

| Focus area | Deliverables |
|---|---|
| Migration & modernization | Executive Summary, Specification, Business Rules, Technical Diagrams, Technical Debt, Target State, Running Costs, Modernization Plan, ROI (also: User Stories) |
| Tech debt & risk reduction | Executive Summary, Business Rules, Technical Diagrams, Technical Debt, Remediation Plan (also: Specification, ROI) |
| Application management | Executive Summary, Specification, Business Rules, User Stories, Technical Diagrams, Technical Debt |
| Process & application reimagination | Executive Summary, Specification, Business Rules, User Stories, Technical Diagrams, To-be Design, Target State, Modernization Plan, ROI (also: Technical Debt, Running Costs) |

- **Exports** from each page:
  - Spec Kit feature folders (`spec.md`, `plan.md`, `data-model.md`, `contracts/`)
  - Gherkin `.feature` files
  - Mermaid diagrams
  - ADRs
  - Jira-ready CSV
  - Per-work-package Markdown
  - To-be delta spec and rule decisions

## Workflow
User prompt ("Build the CAST Blueprint for <app>") → discovery through the CAST Imaging MCP → confirm the application set and showcase domain → read the code behind key transactions → build the sections in dependency order (Spec → Rules → Stories → Diagrams → Debt → Customer Context → To-be Design → Target State → Costs → Plan → ROI → Executive Summary) → verify the numbers against the raw results → test in a browser → human review of the page before it is shown to a customer.

## Pre-requisites
- **CAST Imaging:** the target application analyzed in CAST Imaging, with the CAST Imaging MCP gateway configured in the AI IDE. Use a placeholder URL and your own API key; none are included here. Semantic search improves results but isn't required.
- **AI IDE:** Claude Code (this folder is a Claude Code plugin: `.claude-plugin/plugin.json` + `skills/`). The skills are plain Markdown and can be adapted to other assistants.
- **Tools:** a browser to view the page, and Node.js for the icon embedder and the example build scripts.
- **Network:** internet access to pull live Azure list prices (optional; `references/pricing.md` holds a dated snapshot).

## Limitations
- **Not tuned per customer:** this is a demonstration asset; outputs need expert review before they reach a customer.
- **One domain in depth:** only the showcase domain is built in depth (specification, rules, stories, to-be design); other domains are listed as "available on request".
- **No live chat backend:** "Ask this Blueprint" answers only from the page's own data, with no LLM and no live Imaging. The CAST Imaging source is a placeholder adapter (`ASK_SOURCES.imaging`) for a future backend.
- **CRUD gaps:** CRUD from SQL links misses ORM writes (Hibernate/JPA, MongoDB repositories). The page says so.
- **Price and plan assumptions:** cloud prices are list prices and the plan rate is an assumption. Demo customer-context scenarios are invented and labeled as such.
- **Older examples:** the CardDemo and GrandNode examples were built before focus areas, the To-be Design and the chat existed. They still open with the earlier "Generate" step.
- **Missing adapters:** there are no Copilot, Cursor, Gemini or Kiro adapters yet.
<!-- TODO: provider adapters for Copilot / Cursor / Gemini / Kiro -->

## Assets / Package Contents

| Path | What it is |
|---|---|
| `.claude-plugin/plugin.json` | Claude Code plugin manifest (the folder installs as a plugin) |
| `skills/cast-blueprint/` | Orchestrator: shared contracts (provenance, evidence, IDs), focus areas, chat, build order. `assets/blueprint-template.html` is the page shell and engine; `assets/build-icons.mjs` embeds the official cloud icons used; `references/imaging-queries.md` is the MCP and Cypher cookbook |
| `skills/blueprint-executive-summary/` | One-page leadership summary, framed per focus area |
| `skills/blueprint-application-specification/` | As-is specification in GitHub Spec Kit format |
| `skills/blueprint-business-rules/` | Rule catalog with status, decision tables, Gherkin |
| `skills/blueprint-user-stories/` | As-is user stories, story map, Jira CSV |
| `skills/blueprint-technical-diagrams/` | Context, containers, domain map, CRUD, sequence, lifecycle, blast radius, integrations |
| `skills/blueprint-technical-debt/` | Debt by domain, register, quick wins, open-source CVE remediation |
| `skills/blueprint-customer-context/` | Customer intake pre-filled from Imaging |
| `skills/blueprint-to-be-design/` | What one process should become: to-be flow, rule decisions, delta spec, boundary & API |
| `skills/blueprint-target-state/` | Cloud target (AWS / Azure / GCP) with ADRs |
| `skills/well-architected-target-state/` | CSP catalog, patterns, pricing; `scripts/azure-prices.mjs` calls the public Azure Retail Prices API |
| `skills/blueprint-running-costs/` | Monthly and annual run cost from list prices |
| `skills/blueprint-modernization-plan/` | Phases, work packages, effort, Gantt, manual vs AI-assisted; Remediation Plan variant |
| `skills/blueprint-roi/` | Payback, 3- and 5-year net, three scenarios |
| `examples/shopizer/index.html` | Shopizer (Java/Spring) Blueprint with all four focus areas, To-be Design and chat. Open it in a browser |
| `examples/carddemo/` | CardDemo (COBOL/CICS) Blueprint: `index.html`, plus `build.mjs`, `src/` and `engine-template.html` to rebuild it |
| `examples/grandnode/` | GrandNode (.NET + MongoDB) Blueprint: `index.html`, plus `build.mjs` and `src/` (it uses the CardDemo engine template) |
