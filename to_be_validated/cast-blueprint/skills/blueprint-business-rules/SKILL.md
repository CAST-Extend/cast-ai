---
name: blueprint-business-rules
description: Extract the business rules embedded in an application's code for one domain from CAST Imaging analysis — a numbered rule catalog (BR-XX-###) with plain-language statements, type, status (Enforced / Inconsistent / Not enforced / Disabled), where each is enforced, links to requirements and clarifications, decision tables for interacting rules, and exports as Markdown, Gherkin (.feature with @fails-today) and JSON. Use this skill whenever the user asks for business rules extraction, rule catalogs, decision tables, Gherkin/BDD scenarios from code, or the Business Rules section of a CAST Blueprint — for Java, .NET or COBOL applications.
---

# Blueprint — Business Rules

Same showcase domain as the Specification; other domains "on request".

## Inputs
- `get_entities_by_type(entity_type="BUSINESS_RULE")` (semantic) — use if populated; it was empty for CardDemo and GrandNode.
- Otherwise read the code that the Specification identified (validation, calculation, status, cancellation paths) via `object_details(focus="code")` — every `throw`, reject code, `IF/EVALUATE` branch with a message, setting check and computed amount is a rule candidate.
- The Specification's FR-### and C-## (rules link to both).

## Rule record
`[id, category, type, status, title, statement, where, evidenceIds[], fr, clarification|null, gherkin[given,when,then]|null, inferred?]`
- **type**: calc · val(idation) · con(straint) · trig(ger) · def(ault).
- **status**: `ok` Enforced · `inc` Inconsistent (two paths disagree, or the result is partly wrong) · `ne` Not enforced (intent exists, code doesn't do it) · `off` Disabled (code present but switched off/commented/empty). Explain these four to sales audiences in plain words.
- **inferred = true** when the statement comes from an AI object description or spans several programs; otherwise it's extracted from code.
- 25–35 rules in 6–9 categories; ~40% with Gherkin; flagged rules link to a C-##.

## Page
KPIs (rules, categories, need a decision, test scenarios) → filter chips per category + "Needs decision" → rule cards. Second tab: **decision tables** for 2–3 places where rules interact (e.g. how a total is built; tax by location; posting validation outcomes; order status by payment × shipping; bill-payment screen states). Highlight rows that show a defect.

## Gherkin conventions
`Feature: <Domain> business rules (<App>, as-is)`; tags `@BR-XX-### @FR-### @C-##`; scenarios for non-`ok` rules describe the **intended** behaviour and are tagged `@fails-today` (strip "(fails today)" from the Then line).

## Output contract
Data: `R_CATS`, `R_TYPES`, `R_STAT`, `RULES`, `R_FLAGGED`. Functions: `bizRules()`, `ruleCard()`, `rulesCatalog()`, `rulesTables()`, `mdRules()`, `featureRules()`, `jsonRules()`. Export (`RULE_FILES`): `rules/<domain>/business-rules.md`, `<domain>.feature`, `business-rules.json`. Rule IDs feed User Stories (acceptance criteria) and the Modernization Plan (work-package acceptance tests).
