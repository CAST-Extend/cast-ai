---
name: blueprint-user-stories
description: Produce detailed as-is user stories for one business domain from CAST Imaging analysis — epics derived from the specification's stories, 14–20 stories in As a / I want / So that form with the screen or job, entry point and call-graph size, acceptance criteria pulled from extracted business rules, status (works / known issue / not implemented), a story map, and Jira-ready CSV export. Use this skill whenever the user asks for user stories, a backlog, epics, a story map or Jira import from existing code, or the User Stories section of a CAST Blueprint.
---

# Blueprint — User Stories

**Decision made with the user:** stories are **as-is** (what the system does today), more detailed than the Specification. The Specification keeps 4–5 broad stories; each becomes an **epic** here with 2–6 detailed stories beneath. Not a to-be backlog.

## Inputs
- Specification: `SPEC.stories` (→ epics), FR-###, C-##.
- Business Rules: `RULES` (acceptance criteria are taken from rules — their Gherkin if present, else their statement).
- Entry points with call-graph sizes; screens (front-end components, BMS maps, views) for the "Screen" field.

## Story record
`[id, epic, title, actor, want, soThat, screen, entryPoint, callGraph|null, acRuleIds[], extraAC[[g,w,t]], fr, clar|null, status, evidenceIds[]]`
- **actor / want** come from the entry point and code path; **so that** is always inferred (code never says why) — the whole sentence is rendered as Inferred.
- **status**: `ok` works as described · `issue` known issue (linked C-##) · `idle` not in use / not implemented (e.g. endpoints with no caller, empty fee paragraph, cancel-without-refund).
- Use `null` callGraph when unknown (render "—"; don't call `fmt(null)`).
- Actors per stack: shopper/guest/customer/store owner (commerce), back-office user/operations/cardholder/finance (mainframe card platform).

## Page
KPIs (stories, epics, with known issue, not in use) → **story map** (epic columns, story cards coloured by status, click to scroll) → epic headers with stories (story card: As a/I want/So that, screen, entry point, reaches N objects, acceptance criteria list, clarification link).

## Output contract
Data: `EPICS`, `STORIES`, `S_STAT`. Functions: `userStories()`, `storyCard()`, `ruleAC()`, `acText()`, `mdStories()`, `csvStories()`. Export (`STORY_FILES`): `stories/<domain>/user-stories.md`, `jira-import.csv` (Issue Type, key, Summary, Epic Link, Description, Acceptance Criteria, Labels incl. `known-issue`/`not-in-use`).
