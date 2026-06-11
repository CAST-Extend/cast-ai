# Skill: imaging-dependency-analysis
# Purpose: Reusable Imaging lookup sequence for a single OSS component identified by Highlight.
#          Produces a structured blast radius report that drives the fix decision.
# Requires: IMAGING_APP_NAME (string), COMPONENT_NAME (string), COMPONENT_VERSION (string)
# Called by: oss-vuln-remediation Step 4 — once per component before any code change.

---

## Step 1 — Confirm package is indexed in Imaging

Call `packages` with `application: IMAGING_APP_NAME`.
Filter results for COMPONENT_NAME.

- Match found → proceed to Step 2.
- No match → record "not indexed in Imaging", proceed to workspace fallback (Step 1b).
  Do NOT treat absence as "unused" — workspace code is ground truth.

### Step 1b — Workspace fallback (if not indexed)
Search workspace files for COMPONENT_NAME:
- `pom.xml` → `<artifactId>` or `<groupId>`
- `package.json` / `package-lock.json` → dependency name
- `requirements.txt` / `pyproject.toml` → package name
- `build.gradle` → dependency string
- `*.csproj` → `<PackageReference Include="...">`

Record every file path found. These are the files that must be modified for remediation.
Note discrepancy: "Imaging not indexed — workspace used as ground truth."

---

## Step 2 — Find all call sites in Imaging

> **Note:** Imaging does NOT index external library JARs or third-party packages at the class level.
> `package_interactions` and `object_details` may return empty for library namespaces (e.g. `org.springframework`, `com.fasterxml`).
> This is expected behaviour — absence does not mean unused. Use workspace code search for library call sites if no results returned from Imaging.

Call `package_interactions` with:
- `application: IMAGING_APP_NAME`
- `component: COMPONENT_NAME`
- `version: COMPONENT_VERSION`

Collect all returned objects (call site objects). Store as CALL_SITE_OBJECTS list.

- If empty → record "no call sites found in Imaging", proceed with workspace fallback files from Step 1b.

---

## Step 3 — Caller and callee analysis (per call site object)

For each object in CALL_SITE_OBJECTS:

### 3a — Callers (upstream break risk)
Call `object_details` with:
- `application: IMAGING_APP_NAME`
- `filters: "id:eq:<object_id>"`
- `focus: inward`

Record all callers: object name, type, filepath.
Flag any caller that is a transaction entry point or API endpoint — these are high-impact.

### 3b — Callees (downstream break risk)
Call `object_details` with:
- `application: IMAGING_APP_NAME`
- `filters: "id:eq:<object_id>"`
- `focus: outward`

Record all callees. Flag any callee that crosses a module or service boundary.

### 3c — Code snippet (confirm actual usage)
Call `object_details` with:
- `application: IMAGING_APP_NAME`
- `filters: "id:eq:<object_id>"`
- `focus: code`

Record snippet. Confirm the specific API / class / method from the vulnerable component
that is being used — this determines whether the safe version's API is compatible.

---

## Step 4 — Transaction impact

For each object in CALL_SITE_OBJECTS:
Call `transactions_using_object` with:
- `application: IMAGING_APP_NAME`
- object identifier

Collect all unique impacted transactions. Store as IMPACTED_TRANSACTIONS list.
If a transaction carries user-facing or payment-critical context, flag as HIGH_IMPACT.

---

## Step 5 — Source file impact

### 5a — Find source files that reference the component
Call `source_files` with:
- `application: IMAGING_APP_NAME`
- `file_path: COMPONENT_NAME` (partial match)

### 5b — File-level dependency chain
For each matched source file:
Call `source_file_details` with:
- `application: IMAGING_APP_NAME`
- `focus: inward`   ← files that import this file

Record inward file dependencies. These files may also need review if APIs change.

---

## Step 6 — CVE cross-check in Imaging

Call `quality_insights` with:
- `application: IMAGING_APP_NAME`
- `nature: cve`

Search results for COMPONENT_NAME.
- Matched → record Imaging CVE confirmation alongside Highlight CVE data.
- Not matched → note "CVE not surfaced in Imaging — Highlight is authoritative source."

---

## Output — Blast Radius Report for COMPONENT_NAME@COMPONENT_VERSION

Produce the following structured block before any fix decision:

```
## Blast Radius — <COMPONENT_NAME>@<COMPONENT_VERSION>

### Imaging indexing
- Package indexed: yes / no
- Source: Imaging / workspace fallback

### Call sites (<count>)
| Object | Type | File |
|--------|------|------|
| ...    | ...  | ...  |

### Upstream callers (break risk)
| Caller | Type | File | Entry point? |
|--------|------|------|--------------|

### Downstream callees
| Callee | Type | File | Crosses boundary? |
|--------|------|------|-------------------|

### Impacted transactions (<count>)
| Transaction | High impact? |
|-------------|--------------|

### Affected source files
| File | Role |
|------|------|

### CVE confirmation
- Imaging CVE match: yes / no / not indexed

### Fix recommendation
- API compatibility: compatible / breaking change suspected / unknown
- Recommended action: upgrade to <nearest_safe> / replace / isolate / manual review
- Blocker: <describe any break risk that requires user confirmation>
```

---

## Decision gate (mandatory — do not skip)

After producing the blast radius report:

- If `Fix recommendation.Blocker` is non-empty → **stop, present to user, await confirmation** before proceeding.
- If no blocker → proceed directly to applying the fix.
- If Imaging returned no data AND workspace fallback found no files → flag component as
  "unable to locate usage — skip fix, manual investigation required."
