---
name: blueprint-application-specification
description: Generate an as-is Application Specification for one business domain of an application in GitHub Spec Kit format (spec.md, plan.md, data-model.md, contracts/) from CAST Imaging analysis — user stories with Given/When/Then, functional requirements traced to code, key entities, success criteria, numbered clarifications marked [NEEDS CLARIFICATION], and a to-be delta teaser — ready to hand to AI coding agents. Use this skill whenever the user asks to document what an application or domain does, reverse-engineer requirements or a spec from code, produce Spec Kit files, or build the Application Specification section of a CAST Blueprint.
---

# Blueprint — Application Specification

**Decisions already made with the user:** as-is only (tease the to-be delta); readable by anyone but written for the application team; GitHub Spec Kit format; go deep on **one showcase domain**, show the others as "available on request".

## Inputs
- **Showcase domain** — pick the revenue/money path or the domain with the largest entry points (Shopizer: Cart & Checkout; CardDemo: Transactions & Billing; GrandNode: Checkout & Orders).
- **Entry points of the domain** — REST endpoints (`transactions` with `name:contains:`), CICS transactions + JCL/CA-7 jobs (mainframe), or controller actions (.NET). Keep each one's call-graph size (`fullSize`).
- **Who calls them** — front-end HTTP-request objects (web), CA-7 `FIRE` chain (batch), callers through the **service interface** (DI .NET: start from `IService.Method`, not the implementation).
- **Data** — tables/columns (`application_database_explorer`), VSAM/DB2/IMS stores (Cypher on data objects), or entity repositories (`IRepository<T>` RELY_ON links for MongoDB).
- **Code** — semantic `get_relevant_code_context` (scope documents) **if the semantic layer exists**; otherwise `object_details(focus="code", filters="name:contains:<method|paragraph>,filepath:contains:<file>")` or `fullname:contains:Namespace.Class.Method` to fetch exact source. Read the 5–8 methods/paragraphs that carry the rules.

## Tabs and contents
- **Overview** — plain language (3 extracted sentences), flow chevrons, capabilities with counts, who uses it, "what needs a decision" → clarifications.
- **spec.md** — 4–5 user stories (P1–P3) each with description (extracted), why (inferred), independent test, 2–3 Given/When/Then; edge cases; FR-### with `↳ trace` to method/paragraph and `[NEEDS CLARIFICATION: … See C-##]`; key entities; success criteria framed as regression guarantees; assumptions.
- **plan.md** — Technical Context table (unknowns as `[NEEDS CLARIFICATION]`: runtime versions, tests, SLAs), project structure from real file paths (only paths Imaging returned — mark others).
- **data-model.md** — entities with fields/keys from schema or code; relationship sketch.
- **contracts/** — entry-point table: name, purpose, access/flow/schedule column appropriate to the stack, call-graph size.
- **Clarifications** — C-## cards: finding (Inferred, with the code as evidence), impact high/medium/low, affected FR, question for the team.
- **To-be delta** (preview) — a stated change → preserved / changed / new requirements; which clarifications block it.

## Finding clarifications (the most valuable part)
Look for: intent vs. behaviour mismatches (comments that say one thing, code another), swallowed exceptions after money moves, non-atomic multi-step updates, disabled/commented-out rules, values that overwrite each other, "TODO / To be implemented", unawaited async calls, IDs generated as last+1, sign-convention differences between paths. Quote the code in an evidence entry with a `note`. Typical yield: 8–9 per domain.

## Output contract
Data: `CAPS`, `CONTRACTS`, `SPEC = {stories, edge, frs, entities, sc, assumptions, clar}`, `NC_COUNT`; evidence entries for each code excerpt. Functions: `appSpec()` + `specOverview/Main/Plan/Data/Contracts/Clar/Delta`. Export (`EXPORT_FILES`): `specs/001-<domain>/spec.md`, `plan.md`, `data-model.md`, `contracts/<name>.md`. IDs FR-### and C-## are consumed by Business Rules, User Stories, Debt and Plan — keep them stable.
