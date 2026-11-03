# CAST Imaging MCP — query playbook for Blueprint

Tools: `mcp__CAST_MCP_Demo__run_structural_search_function`, `…run_semantic_search_function`, `…run_text2graph_function` (load via ToolSearch). Discover syntax with the matching `get_*_function_syntax` tool before first use. Replace `<APP>` with the Imaging application name (e.g. `Shopizer-Backend`). Large results are saved to a file — parse them with PowerShell `ConvertFrom-Json` or Node (Python may not be installed on the user's Windows machine).

## Contents
1. Discovery (Executive Summary)
2. Showcase domain (Spec, Rules, Stories)
3. Diagrams
4. Technical Debt
5. Customer Context / Plan inputs
6. Text2Graph schema notes

## 1. Discovery
| Need | Call |
|---|---|
| App list | structural `applications` |
| Size, tech, tags, element types | structural `stats {application}` — `custom_tags` often contains business-domain tags |
| Who calls whom | structural `applications_dependencies` |
| Layers | structural `architectural_graph {application, level:"layer"}` |
| Transactions | structural `transactions {application, filters?}` (paginated; `fullSize` = objects reached) and `applications_transactions` for counts |
| Quality summary | structural `applications_quality_insights` (counts per app) |
| Detail | `quality_insights {application, nature}` with nature ∈ `cve`, `cloud-detection-patterns`, `green-detection-patterns`, `structural-flaws`, `iso-5055` |
| Modernization advisors | structural `advisors {application}` |

## 2. Showcase domain
- Endpoints: `transactions {application, filters:"name:contains:<word>"}`
- Tables and columns: `application_database_explorer {application, table_name}`
- AI summary of a transaction: `transaction_details {transaction_id, focus:"summary"}` (lead only — can be wrong)
- Key objects in a transaction: `transaction_details {focus:"complexity_graph", focus_size:25}`
- Code and object purposes: semantic `get_relevant_code_context {application, query, scope:"documents", limit:10-15}` — returns source excerpts; this is where rules and defects are found
- Business entities: semantic `get_entity_types`, `get_entities_by_type {entity_type:"BUSINESS_RULE"}` (may not exist — then derive rules from code)
- Front-end callers: structural `objects {application:<front end>, filters:"type:contains:HttpRequest"}` — compare against backend endpoints to find endpoints with no caller

## 3. Diagrams
**Cross-domain coupling** (domain map):
```cypher
WITH [<leaf domain tag names>] AS doms
MATCH (a:`<APP>`)-[:TAGGED_WITH]->(ta:Tag) WHERE ta.Name IN doms AND (a:Object OR a:SubObject OR a:TableInfo) AND NOT a:Deleted
MATCH (a)-[r]->(b:`<APP>`)-[:TAGGED_WITH]->(tb:Tag)
WHERE tb.Name IN doms AND tb <> ta AND (b:Object OR b:SubObject OR b:TableInfo) AND NOT b:Deleted
  AND type(r) IN ['CALL','USE','INHERIT','IMPLEMENT','SELECT','INSERT','UPDATE','DELETE','RELY_ON','REFER','ACCESS']
RETURN ta.Name AS src, tb.Name AS dst, count(*) AS links, count(DISTINCT a) AS srcObjs ORDER BY links DESC
```
Tags are hierarchical (parent + leaf with identical counts) — pick leaf tags only. Treat pairs with ≥100 links each way as two-way coupling.

**Data ownership (CRUD by domain)**:
```cypher
MATCH (a:`<APP>`)-[:TAGGED_WITH]->(ta:Tag) WHERE ta.Name IN [<doms>] AND (a:Object OR a:SubObject) AND NOT a:Deleted
MATCH (a)-[r]->(t:`<APP>`:Object) WHERE t.Type = 'PostgreSQL Table' AND NOT t:Deleted AND type(r) IN ['SELECT','INSERT','UPDATE','DELETE','USE']
RETURN ta.Name AS domain, t.Name AS tbl, type(r) AS op, count(*) AS n
```
Only direct SQL/JPQL — ORM entity saves are invisible. Tables written by >1 domain are the service-split blockers.

**Blast radius** of a method:
```cypher
MATCH (m:`<APP>`:SubObject) WHERE NOT m:Deleted AND m.Name = '<method>'
MATCH (m)-[r:IS_IN_TRANSACTION]->(t:Transaction) WHERE r.EndDate IS NULL AND NOT t:Deleted
RETURN m.FullName, t.Name
```
and callers by hop: `MATCH p=(c)-[:CALL*1..4]->(m) … WITH c, min(length(p)) AS hops` grouped by domain tag.

**Enum values** (e.g. order status): match object `Name='OrderStatus'`, `Type CONTAINS 'Enum'`, related `Java Enum Item`.

**Lifecycle candidates** — status-like enums with values and usage:
```cypher
MATCH (e:`<APP>`) WHERE (e:Object OR e:SubObject) AND NOT e:Deleted AND e.Type CONTAINS 'Enum' AND NOT e.Type CONTAINS 'Item'
  AND (e.Name ENDS WITH 'Status' OR e.Name ENDS WITH 'State' OR e.Name ENDS WITH 'Type')
OPTIONAL MATCH (i:`<APP>`)-[:BELONG_TO]->(e) WHERE i.Type = 'Java Enum Item'
WITH e, collect(DISTINCT i.Name) AS items
OPTIONAL MATCH (u:`<APP>`)-[r]->(e) WHERE type(r) IN ['USE','RELY_ON','REFER','ACCESS']
RETURN e.Name, items, count(DISTINCT u) AS users ORDER BY users DESC
```
Then find transitions with semantic search on the methods that set the status (look for "next step" logic like `nextTransaction`). Entities without a status field (e.g. carts) can get a derived lifecycle from ownership/link columns — label it derived.

**Blast radius of a table**: table `IS_IN_TRANSACTION` for endpoints; direct accessors via SELECT/INSERT/UPDATE/DELETE, then `(c)-[:CALL*0..3]->(accessor)` with `min(length(p))+1` as the ring, grouped by domain tag. Several methods at once: `UNWIND [<full names>] AS fn MATCH (m {FullName: fn}) …`.

**Integrations**: structural `packages {application}` — version, license compliance, `SaferClosestVersion`, `UsingObjectCount`.

## 4. Technical Debt
Findings attach to objects via `MANIFESTS`:
```cypher
MATCH (o:`<APP>`)-[:TAGGED_WITH]->(t:Tag) WHERE t.Name IN [<doms>] AND (o:Object OR o:SubObject OR o:TableInfo) AND NOT o:Deleted
MATCH (o)-[:MANIFESTS]->(i:Insight)
RETURN t.Name AS domain, i.Type AS insightType, count(*) AS occurrences, count(DISTINCT o) AS objects
```
`Insight.Type` values seen: `Detection Pattern` (ISO 5055), `Vulnerability` (CVE usage), `Green - Blocker`, `CloudReady - Blocker/Booster`, `Container - Blocker`, `Structural Flaw`. Normalize by domain size (findings per 100 tagged members) so the biggest domain doesn't win by default.

## 5. Customer Context / Plan inputs
Pre-fill from: stack (`stats`), DB engine (tables), exposure (public storefront + admin front end → "Both", suggested), compliance (payment code + card columns → PCI DSS, suggested), must-keep integrations (options = detected packages). Everything else is asked.

## 6. Text2Graph schema notes
- Application label is the Imaging app name in backticks: `` `Shopizer-Backend` ``.
- Object scope guard: `(o:Object OR o:SubObject OR o:TableInfo) AND NOT o:Deleted`.
- Useful rels: `TAGGED_WITH` (object→Tag), `MANIFESTS` (object→Insight), `IS_IN_TRANSACTION` (object→Transaction, check `r.EndDate IS NULL`), `CALL`, `BELONG_TO`.
- Always pass `functions_considered`, `gap`, `query_intent` to `run_cypher_query`.
