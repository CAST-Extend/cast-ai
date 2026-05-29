# CAST Imaging — Impact Analysis

Produce complete, risk-scored impact reports by chaining CAST Imaging MCP tools.

**Data source: CAST Imaging MCP only.** Local tools (`Grep`, `Glob`, `Read`, `Bash`, `Agent`) must not be used during this analysis — even to "verify" MCP results. The CAST Imaging server is the single source of truth. If MCP data shows 0 callers, 0 transactions, or 0 data graphs, that IS the answer.

## Workflow

### Step 0: Verify CAST Imaging MCP Server

Before any analysis, confirm the CAST Imaging MCP server is available.

**Check:** Call `mcp__imaging__applications` to verify the MCP tools are accessible.

**Success (returns application list):** The MCP server is connected. Proceed to Step 1.

**Failure (tool not found or connection error):** Stop and inform the user:
```
The CAST Imaging MCP server is not configured. To use impact analysis:

1. Add the CAST Imaging MCP server to your AI IDE settings
2. Ensure you have valid credentials and the server URL is correct
3. Restart your IDE and try again

See https://doc.castsoftware.com for setup instructions.
```
**Do NOT proceed without a working MCP connection.**

### Step 1: Collect Parameters

Parse the user's message to extract `object_name`, `object_type`, and `application`.

**If `application` is missing:**
1. Call `mcp__imaging__applications` to list available applications.
2. Present the list and ask the user to pick one. Never guess.

**If `object_name` is missing:**
Ask: "Which object do you want to analyze? Provide a name (e.g., CUSTOMERS, CustomerService, OrderProcessor)."

**If both are provided**, proceed to Step 2.

### Step 2: Find the Target Object

Call `mcp__imaging__objects` with `application` and `filters="name:contains:{object_name}"`. Append `,type:contains:{object_type}` if `object_type` was provided.

Extract: `id`, `name`, `type`, `fullName`, `filePath` for each match.

- **Zero matches** — inform the user. Suggest refining the name or checking spelling.
- **Multiple matches** — **HARD STOP.** Present a numbered list of ALL matching objects and ask the user to select one before proceeding. Never auto-select. Format the list as:
  ```
  I found multiple objects matching "{object_name}":

  1. **{name}** (ID: {id})
     - Type: {type}
     - Full Name: {fullName}
     - File: {filePath}

  2. **{name}** (ID: {id})
     - Type: {type}
     - Full Name: {fullName}
     - File: {filePath}

  ...

  Which object do you want to analyze? Reply with the number or ID.
  ```
  **Do NOT proceed to Step 3 until the user has explicitly selected an object.**
- **Single match** — proceed automatically.

Store the chosen object as `TARGET_ID`.

### Step 3: Internal Structure

Call `mcp__imaging__object_details` with `application`, `filters="id:eq:{TARGET_ID}"`, `focus="intra"`.

Extract:
- `metrics.cyclomaticComplexity`
- `defines[]` — child functions, methods, constructors
- `misc_properties` — file path, LOC, status

Record: `child_count = len(defines)`

**On failure:** Report "Internal structure unavailable" in the Target Object section, set `child_count = 0`, and continue.

### Step 4: Direct Dependencies (parallel)

Run 4a and 4b **in parallel**.

**4a — Inward (callers):**
Call `mcp__imaging__object_details` with `focus="inward"`, `filters="id:eq:{TARGET_ID}"`.
Extract `incoming_calls[]` — each with `id`, `name`, `type`, `linkType`.
Record: `inward_count`

**4b — Outward (callees):**
Call `mcp__imaging__object_details` with `focus="outward"`, `filters="id:eq:{TARGET_ID}"`.
Extract `outgoing_calls[]` — each with `id`, `name`, `type`, `linkType`.
Record: `outward_count`

### Step 5: Coupling Classification

```
inward_count > 20  -> coupling = "HIGH"
inward_count > 5   -> coupling = "MEDIUM"
inward_count <= 5  -> coupling = "LOW"
```

### Step 6: Transaction Impact (parallel with Step 7)

Call `mcp__imaging__transactions_using_object` with `application`, `filters="id:eq:{TARGET_ID}"`.
Extract transaction list (`name`, `id`). Record: `transaction_count`.

For each transaction (up to top 5), call `mcp__imaging__transaction_details` with `application`, `id="{transaction_id}"`, `focus="complexity"`.

The `complexity` focus returns a list of complex objects in the transaction call graph. Derive the complexity score as: `complexity_score = number of complex objects returned`. If the list is empty, `complexity_score = 0`.

Classify each:
```
complexity_score >= 50 -> criticality = "HIGH"
complexity_score >= 20 -> criticality = "MEDIUM"
complexity_score < 20  -> criticality = "LOW"
```

Sort transactions by criticality descending.

**On failure:** Report "Transaction analysis unavailable" in the Critical Paths section, set `transaction_count = 0`, and continue.

### Step 7: Data Flow Impact (parallel with Step 6)

Call `mcp__imaging__data_graphs_involving_object` with `application`, `filters="id:eq:{TARGET_ID}"`.
Extract data graph list (`name`, `id`). Record: `data_graph_count`.

For critical data graphs (top 3), call `mcp__imaging__data_graph_details` with `application`, `id="{data_graph_id}"`, `focus="nodes"`.

**On failure:** Report "Data flow analysis unavailable" in the Data Flow Impact section, set `data_graph_count = 0`, and continue.

### Step 8: Cross-Application Impact

Call `mcp__imaging__inter_applications_dependencies` with `application`.
Extract inward and outward application-level dependency counts.

This tool reports which external applications depend on (or are depended upon by) this application at the **application level** — it does not resolve to individual objects. Record: `cross_app_inward_count` and `cross_app_outward_count`. Set `cross_app_impact = true` if `cross_app_inward_count > 0`.

**On failure:** Report "Cross-application analysis unavailable" in the output, set `cross_app_impact = false`, and continue.

## Risk Score Calculation

```
COUPLING_SCORE    = inward_count
TRANSACTION_SCORE = sum of criticality weights (HIGH=3, MEDIUM=2, LOW=1)
DATA_FLOW_SCORE   = data_graph_count * 2
CHILD_SCORE       = child_count
CROSS_APP_PENALTY = 10 if cross_app_impact else 0

TOTAL = COUPLING_SCORE + TRANSACTION_SCORE + DATA_FLOW_SCORE
        + CHILD_SCORE + CROSS_APP_PENALTY

Risk Level:
  TOTAL >= 50  -> CRITICAL
  TOTAL >= 25  -> HIGH
  TOTAL >= 10  -> MEDIUM
  TOTAL < 10   -> LOW
```

## Output Format

Always produce the report in this exact structure. Include ALL sections even if empty ("None detected").

```markdown
## Impact Analysis: {object_name} ({object_type}) in {application}

### Target Object
- **Name:** {name}
- **Type:** {type}
- **File:** {filePath}
- **Cyclomatic Complexity:** {complexity}
- **Children (owned functions/methods):** {child_count}

### Blast Radius Summary
- **{inward_count} objects** directly depend on this (callers)
- **{outward_count} dependencies** this object calls (callees)
- **{transaction_count} business transactions** flow through it
- **{data_graph_count} data flows** are affected
- **{cross_app_count} external applications** impacted

### Risk Level: {RISK_LEVEL}
- Coupling: {coupling} ({inward_count} direct dependents)
- Transaction criticality: {highest_criticality}
- Cross-app impact: {YES/NO}

### Critical Paths (ordered by risk)
{Numbered list: transaction name, complexity, object count, what could break}

### Affected Objects (Direct Callers)
| Object | Type | Link Type |
|--------|------|-----------|
{Each inward caller as a row}

### Outward Dependencies (Callees)
| Object | Type | Link Type |
|--------|------|-----------|
{Each outward call}

### Children Lost if Removed
| Function/Method | Type |
|-----------------|------|
{Each child define}

### Data Flow Impact
{Each data graph name and key nodes, or "None detected"}

### Recommended Test Plan (prioritized)
{Numbered checklist: regression tests for transactions first, data flow integrity, compile/unit tests for dependents}

### Recommendation
{1-3 sentence actionable recommendation: proceed/caution/stop, and what to address first}
```

## Writeback (Optional)

If the user asks to persist findings, tag all impacted objects in a single call.

Collect all object IDs from the analysis — target (Step 2), callers (Step 4a), and callees (Step 4b). If the total exceeds 50, confirm with the user before proceeding.

Call `mcp__imaging__manage_object_tags` with:
- `application`
- `add_tags=["Impact: {object_name} Change"]`
- `nodes_for_add=["{TARGET_ID}", "{caller_id_1}", ..., "{callee_id_1}", ...]`

## Important Rules

1. **ALL data comes from `mcp__imaging__*` MCP tools.** Do not use local tools during this analysis.
2. **Always collect parameters first** — never assume application or object name.
3. **Always resolve the object by ID first** (Step 2) before any detail queries.
4. **Parallelize independent steps** (4a+4b, 6+7) for faster execution.
5. **Disambiguate** if multiple objects match — never assume.
6. **Paginate** — if any tool returns `has_next: true`, fetch subsequent pages. For steps with >20 results, show the top 20 and summarize the rest.
7. **Include all output sections** even if empty ("None detected").
8. **Calculate risk score** using the formula — never eyeball it.
9. **Handle errors gracefully** — report the error in the corresponding section and continue.
