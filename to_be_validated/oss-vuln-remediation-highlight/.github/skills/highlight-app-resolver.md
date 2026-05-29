# Skill: highlight-app-resolver
# Purpose: Resolve exact app name and integer ID in CAST Highlight using
#          find_applications filter syntax. Use before any tool that needs app id (int).
# Requires: APP_NAME (string supplied by user)

## Resolution steps (stop at first unambiguous match)

### Strategy 1 — Exact name filter
Call `find_applications` with:
`filters: "name:contains:{{APP_NAME}}"`

If exactly one result → store `name` and integer `id` → go to Confirm.

### Strategy 2 — Normalised filter
Lowercase APP_NAME, strip special characters and extra spaces.
Call `find_applications` with:
`filters: "name:contains:<normalised_name>"`

If exactly one result → store → go to Confirm.

### Strategy 3 — Token search
Split APP_NAME into individual words (tokens).
For each token call `find_applications`:
`filters: "name:contains:<token>"`
Intersect results across all tokens.
If exactly one result → store → go to Confirm.

### Strategy 4 — Workspace fallback
Scan workspace files for the app identifier:
- `pom.xml` → `<artifactId>`
- `package.json` → `"name"`
- `build.gradle` / `settings.gradle` → `rootProject.name`
- `*.csproj` → `<AssemblyName>` or `<RootNamespace>`

Call `find_applications` with found value as filter.
If exactly one result → store → go to Confirm.

### No match
Stop. Report to user:
- Values attempted: [list each]
- Suggest: check exact name in CAST Highlight portal or try `list_applications`
  and search visually.
Do not proceed.

## Confirm
Show the user before proceeding:
```
✅ Highlight app resolved
─────────────────────────────────────────
Supplied name  : {{APP_NAME}}
Resolved name  : <exact name>
App ID (int)   : <integer id>
Resolved via   : Strategy <1/2/3/4>
─────────────────────────────────────────
```
Store resolved `name` as APP_NAME_EXACT and integer `id` as APP_ID.
Both are required for subsequent Highlight tool calls.
