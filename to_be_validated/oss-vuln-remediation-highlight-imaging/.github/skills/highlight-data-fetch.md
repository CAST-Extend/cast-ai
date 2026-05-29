# Skill: highlight-data-fetch
# Purpose: Reusable Step 0 + Step 1 sequence for any Highlight OSS/CVE fetch.
# Include in any prompt that reads from CAST Highlight MCP.
# Requires: APP_NAME (string) and APP_ID (int) resolved before calling.

## Step 0 — Force latest scan (mandatory, run before any data read)

Call in sequence. Wait for each to complete before the next.
Stop and report to user if any call fails.

1. `reinitialize_application_results` with `id: {{APP_ID}}`
   — integer app ID, not name — refreshes this app's results in cache.

2. `get_application_info` with `name: {{APP_NAME}}`
   — extract and store `lastAnalysisDate` and `snapshotLabel`.
   — if `lastAnalysisDate` is unavailable: stop, report, do not proceed.

## Step 1 — Fetch CVEs first, then components

Call in this order. Each result anchors the next to the same snapshot.

1. `get_vuln_aggr_by_app` with `name: {{APP_NAME}}`
   — app-level CVE summary with CVSS scores, KEV flags, and component names.

2. `get_application_details` with `name: {{APP_NAME}}`, `nature: third_parties`
   — OSS components with detected version, CVEs, licenses, and safe upgrade versions.
   — safe upgrade versions are returned here directly — no separate resolution needed.

## Output to carry forward
- `lastAnalysisDate` and `snapshotLabel` → stamp into report header
- Per component: name, detected version, CVEs, CVSS, KEV flag, license, nearest safe version, latest safe version
