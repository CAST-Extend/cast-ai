# Skill: imaging-dependency-risk
# Purpose: Lightweight Imaging blast radius scan for one OSS component.
#          Produces a Dependency Risk score (Low / Medium / High) used to
#          reorder the Consolidated Action Plan execution sequence.
#          This is a QUICK scan — full detail analysis runs later in Step 4.
# Requires: IMAGING_APP_NAME (string), COMPONENT_NAME (string),
#           COMPONENT_VERSION (string)
# Called by: oss-vuln-remediation Step 3 — once per CVE-flagged component.

---

## Step 1 — Confirm package is indexed

Call `packages` with `application: IMAGING_APP_NAME`.
Filter results for COMPONENT_NAME.

- Match found → proceed to Step 2.
- No match → record caller_count=0, tx_count=0, indexed=false.
  Do NOT treat absence as unused — workspace is ground truth.
  Assign Risk: Low (unconfirmed — flag for manual check in Step 4).

---

## Step 2 — Get call sites (quick count only)

Call `package_interactions` with:
- `application: IMAGING_APP_NAME`
- `component: COMPONENT_NAME`
- `version: COMPONENT_VERSION`

Store count of returned objects as CALL_SITE_COUNT.

- If empty → CALL_SITE_COUNT = 0. Workspace fallback note only — no deep scan here.

---

## Step 3 — Caller count (upstream break risk)

For each object returned in Step 2 (max first 5 objects to keep scan fast):
Call `object_details` with:
- `application: IMAGING_APP_NAME`
- `filters: "id:eq:<object_id>"`
- `focus: inward`

Sum all unique callers across all objects. Store as CALLER_COUNT.

---

## Step 4 — Transaction count (impact scope)

For each object returned in Step 2 (same max 5):
Call `transactions_using_object` with:
- `application: IMAGING_APP_NAME`
- object identifier

Count unique transactions. Store as TX_COUNT.
Flag BOUNDARY_CROSSING = true if any transaction crosses a module or service boundary.

---

## Step 5 — Assign Dependency Risk score

Apply thresholds in order (stop at first match):

| Condition | Risk |
|-----------|------|
| CALLER_COUNT > 20 OR TX_COUNT ≥ 4 OR BOUNDARY_CROSSING = true | 🔴 High |
| CALLER_COUNT 5–20 OR TX_COUNT 1–3 | 🟡 Medium |
| CALLER_COUNT < 5 AND TX_COUNT = 0 | 🟢 Low |
| Not indexed in Imaging AND no workspace match | 🟢 Low (unconfirmed — flag) |

---

## Output (one row per component — feeds Consolidated Action Plan)

```
COMPONENT_NAME   : <name>
VERSION          : <current_version>
Indexed          : yes / no
Call sites       : <CALL_SITE_COUNT>
Callers          : <CALLER_COUNT>
Transactions     : <TX_COUNT>
Boundary cross   : yes / no
Dependency Risk  : 🔴 High / 🟡 Medium / 🟢 Low
```
