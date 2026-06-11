# Skill: highlight-data-fetch
# Purpose: Reusable freshness + data fetch sequence for any Highlight OSS/CVE read.
# Include in any prompt that reads from CAST Highlight MCP.
# Requires: HIGHLIGHT_NAME (string) and HIGHLIGHT_APP_ID (int) from conversation context.

---

## Step 1 — Force latest data (mandatory, run before any data read)

Call in sequence. Wait for each to complete. Stop and report if any call fails.

1. `reinitialize_application_results` with `id: HIGHLIGHT_APP_ID`
   — integer app ID, not name — refreshes this app's results from Highlight backend.

2. `get_application_info` with `name: HIGHLIGHT_NAME`
   — extract and store `lastAnalysisDate` and `snapshotLabel`.
   — if `lastAnalysisDate` is unavailable: stop, report to user, do not proceed.

---

## Step 2 — Fetch CVEs first, then components

Call in this order. Each result anchors the next to the same snapshot.

1. `get_vuln_aggr_by_app` with `name: HIGHLIGHT_NAME`
   — app-level CVE summary with CVSS scores, KEV flags, and component names.

2. `get_application_details` with `name: HIGHLIGHT_NAME`, `nature: third_parties`
   — OSS components with detected version, CVEs, licenses, nearest safe version,
     and latest safe version. Safe versions are returned directly — no separate
     resolution step needed.

3. `get_application_details` with `name: HIGHLIGHT_NAME`, `nature: licenses`
   — license compliance details for all components.

---

## Output to carry forward

- `lastAnalysisDate` and `snapshotLabel` → stamp into report header
- Per component: name · detected version · CVEs · CVSS · KEV flag ·
  license · nearest safe version · latest safe version
