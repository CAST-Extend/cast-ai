---
name: blueprint-executive-summary
description: Write the Executive Summary section of a CAST Blueprint — a one-page, leadership-ready view of an application built from CAST Imaging analysis: bottom line, KPIs, current-state architecture figure, modernization readiness scorecard, key findings (extracted fact + inferred implication) and time-boxed recommendations, every statement labeled extracted vs. inferred. Use this skill whenever the user asks for an executive summary, leadership one-pager, "what's the state of this application", or the Executive Summary of a Blueprint for any app analyzed by CAST Imaging (Java, .NET, COBOL/mainframe…), even if they don't say "Blueprint".
---

# Blueprint — Executive Summary

The page a CIO reads first. It must stand alone, be short, and be defensible: every number traceable to CAST Imaging, every judgment labeled as interpretation. It is usually written **last** (it summarizes the other sections) but appears first.

## Inputs
- **CAST Imaging** (via the CAST MCP gateway): `stats` (LOC, objects, links, technologies), `architectural_graph(level=layer)`, entry-point counts (`transactions`, or Cypher counts by type/area), `applications_quality_insights` + `quality_insights(nature=cve|iso-5055|cloud-detection-patterns|green|structural-flaws)`, inter-app dependencies if several apps.
- **Upstream sections** (if already built): top clarifications from the Specification, debt hotspots, domain coupling, target direction. Reuse their evidence IDs instead of re-querying.

## Page anatomy (in this order)
1. **Bottom line** — 2 sentences, both Inferred: what kind of modernization this is (replatform / refactor / rewrite, and why) and the single most important thing to fix first.
2. **At a glance** — 5 KPIs: LOC, objects (or programs for mainframe), entry points (split by type), known vulnerabilities (or cloud blockers if CVE scanning wasn't configured — say so), business domains (note "grouped, not tagged" when inferred).
3. **The system** — 3 extracted sentences (what it is, how it's built, where data lives) + a current-state architecture SVG (channels → application layers → data & external).
4. **Modernization readiness** — 4 ratings (Architecture, Cloud readiness, Security posture, Maintainability) with a 5-step meter; one Inferred sentence stating the basis for each.
5. **Key findings** — 4–5 cards, severity tag (Critical/High/Medium/Strength), each = one **extracted** paragraph (the fact, with numbers) + one **inferred** paragraph (the implication). Always include one Strength.
6. **Recommendations** — 5 items with horizons 0–3 / 3–9 / 9–18 months, each Inferred with its basis.
7. **Continue in this Blueprint** — cards linking to the other sections with their status.

## One summary per focus area
The facts (KPIs, system, findings) are the same in every focus area; the framing changes. `execFrame(uc)` returns `{readiness, bottom, recs}` per focus area:
- **Migration & modernization** — readiness heading "Modernization readiness"; bottom line on replatform vs refactor vs rewrite; recommendations toward target state and cutover.
- **Tech debt & risk reduction** — "Risk and readiness"; bottom line on the riskiest defects and CVEs; recommendations on what to fix first and how to fix it safely (tests first).
- **Application management** — "Health at a glance"; bottom line on what the application does and where it is risky to change; recommendations on knowledge capture and change safety.
- **Process & application reimagination** — "Readiness for change"; bottom line on the process to reimagine and its coupling (e.g. its two-way links with neighbouring domains); recommendations toward the To-be Design.
Recommendations link only to deliverables in the current focus area. Never write "use case" on the page — say "focus area".

## Statement rules
- `X(text, ...evidenceIds)` for facts from Imaging; `I(text, basis, ...evidenceIds)` for interpretation (basis is mandatory and specific). See the orchestrator skill `cast-blueprint` for the provenance model and evidence registry (`EV`).
- Headline numbers must be re-checked against raw query results before publishing (past errors: 79 vs 64 CVEs, 46 vs 47 tables, "19,000 links" vs ~13,500).
- "0 CVEs" usually means "not scanned" — check `cve_comment` and say so.

## Patterns that worked
- Lead with the money/revenue-path risk found in code (Shopizer: promo never expires; CardDemo: over-limit test ignores balance; GrandNode: payment taken before order save).
- Mainframe: KPIs are programs + CICS transactions + batch jobs; mention the CA-7 schedule and jobs outside it.
- DI-heavy .NET: mention that the service layer is reached through interfaces.

## Output contract
`execSummary()` returns HTML; it reads `SYSTEM`, `EV`, `DELIV` and helper functions. Evidence entries it typically needs: `stats`, `layers`, `tx`, `cve`, `cloud`, `iso`, `tags`/`ns`, plus the code-level entries behind the top finding. No export bundle (PDF/DOCX buttons are placeholders).
