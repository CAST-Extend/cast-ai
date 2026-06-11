# AIAssistant Context (AGENTS.md Version)

## Metadata
- `schema`: `cast-highlight-ai-assistant-context`
- `version`: `2.0.0`
- `lastUpdated`: `2026-05-26`
- `scope`: CAST Highlight MCP server context for Codex and other AI agents

## Product
- `name`: CAST Highlight
- `description`: Application portfolio intelligence platform focused on software health, open-source risk, cloud readiness and sustainability indicators.
- `apiBasePathExample`: `https://rpa.casthighlight.com/WS2/`

## Assistant Rules

### Display Policy
- Use labels instead of technical names whenever possible.
- Fallback label rule: if a field label is unknown, derive a readable label from the technical key (`camelCase` -> words).

### Scoring Semantics
- Default rule: lower scores usually indicate higher risk.
- Exception:
  - `technicalDebt` (`Technical Debt`): higher value is worse.

### Risk Definitions
- `shortTermRisk`: Applications with Software Resiliency score below benchmark average AND Software Elegance score below benchmark average.
- `midTermRisk`: Applications with Software Agility score below benchmark average AND Software Elegance score below benchmark average.

### Missing Field Rule
- If a required field is not directly available, check whether an equivalent signal exists inside available segmentations and segmentation details.

### Response Guidance
- Prefer benchmark-aware interpretations when comparing applications.
- State clearly when data is unavailable versus empty.

## Field Dictionary

| Technical Name | Label | Description |
| --- | --- | --- |
| `softwareHealth` | Software Health | Global software score of an application. |
| `softwareResiliency` | Software Resiliency | Resiliency score. |
| `softwareAgility` | Software Agility | Agility score. |
| `softwareElegance` | Software Elegance | Elegance score. |
| `openSourceSafety` | Open Source Safety | Open-source safety score. |
| `numberOfCodeLines` | Number Of Code Lines | Total lines of code. |
| `numberOfFiles` | Number Of Files | Total number of files. |
| `backFiredFP` | BackFired FP | Backfired false-positive related indicator when provided by API payload. |
| `cloudMaturity` | Cloud Maturity | Global cloud score. |
| `cloudReadySurvey` | Cloud Ready Survey | Cloud readiness score computed from survey context. |
| `cloudReadyScan` | Cloud Ready Scan | Cloud readiness score from code scan analysis. |
| `cloudAlertCounter` | Cloud Alert Counter | Cloud-related alert counter. |
| `businessImpact` | Business Impact | Business impact score/indicator. |
| `openSourceLicense` | Open Source License | License compliance-related indicator. |
| `openSourceObsolescence` | Open Source Obsolescence | Open-source obsolescence indicator. |
| `greenIndexSurvey` | Green Index Survey | Environmental index from survey context. |
| `greenImpact` | Green Impact | Global environmental impact score. |
| `greenIndexScan` | Green Index Scan | Environmental index from scan analysis. |
| `greenAlertCounter` | Green Alert Counter | Environmental alert counter. |
| `greenEffort` | Green Effort | Estimated effort linked to environmental improvement actions. |
| `openSourceCVE` | Open Source CVE | Vulnerability exposure indicator based on known CVEs. |
| `technicalDebt` | Technical Debt | Higher score means worse technical debt. |

## Tool Catalog

### Notes
- Tool names are the exact MCP names exposed by `mcp_server_highlight.py`.
- Some scan tools are conditionally available depending on runtime files and `TOOL_DIR` mode.
- Tool list intentionally keeps existing spelling for compatibility (example: `list_techonologies`).

### Configuration
- `get_config`

### Benchmark
- `get_benchmark`
- `get_benchmark_alerts`

### Portfolio Listing
- `list_applications`
- `list_frameworks`
- `list_third_parties`
- `list_survey_questions`
- `list_tags`
- `list_domain_tags`
- `list_licenses`
- `list_platforms`
- `list_techonologies`
- `list_vulnerabilities`
- `list_portfolio_segmentations`
- `list_portfolio_recommendations`
- `list_subdomains`

### Portfolio Details
- `get_framework_info`
- `get_third_party_info`
- `get_survey_or_question_info`
- `get_tag_info`
- `get_license_info`
- `get_platform_info`
- `get_technology_info`
- `get_vulnerability_info`
- `get_segmentation_details`
- `get_segmentation_json_file`
- `get_recommendation_info`

### Vulnerabilities
- `get_domain_vulnerabilities_aggregated`
- `list_vuln_aggr_by_app`
- `get_vuln_aggr_by_app`

### Recommendations
- `get_domain_recommendation_by_app`
- `get_domain_recommendation_catalog`
- `get_cloud_recommendation_by_app`

### Cloud & Green
- `get_cloud_containerization_by_app`
- `get_green_data_by_app`

### Application Analysis
- `get_application_info`
- `get_application_details`
- `get_application_details_json_file`
- `find_applications`

### Cache Maintenance
- `reinitialize_cache`
- `reinitialize_application_results`

### Scan And Monitor
> ⚠️ These tools are **not part of the standard registered MCP tool set**. They are conditionally available only when the server runs in a specific runtime mode (`TOOL_DIR` / jar / docker). Do not call these unless confirmed available via `get_config`.
- `scan_zip_as_existing_application`
- `scan_zip_as_new_application`
- `scan_volume_as_application`
- `monitor_scan_stdout`
- `monitor_scan_by_pid`
- `monitor_scan_by_container_id`

## Recommended Agent Workflow
- Call `get_config` first when troubleshooting or before first heavy analysis.
- Call `get_benchmark` and optionally `get_benchmark_alerts` before risk classification.
- Use `list_applications` to discover candidate names, then `get_application_info`.
- Use `get_application_details` for targeted deep-dive areas instead of requesting everything at once.
- Use `find_applications` for filtered portfolio slicing, then validate details with `get_application_info`.
- If a required metric is missing, inspect `list_portfolio_segmentations` and `get_segmentation_details`.
- For CVE analysis: call `get_vuln_aggr_by_app` for app-level CVE summary (CVSS, KEV, component names), then `get_application_details` (nature=`third_parties`) for component versions, licenses, and safe upgrade versions.
- For cloud readiness: call `get_cloud_recommendation_by_app` for migration guidance and `get_cloud_containerization_by_app` for containerization blockers.
- For green/sustainability data: call `get_green_data_by_app`.
- When scan tools are used, confirm availability via `get_config` first, then follow with `monitor_scan_stdout` or `monitor_scan_by_pid`, then `reinitialize_application_results`.


## Known Compatibility Notes
- Tool name `list_techonologies` contains a spelling typo by design; use exact tool name for MCP calls.
- `get_application_details` default nature is `licences` in code, but valid branch values use `licenses`.
- Some scan/monitor tools are mutually exclusive by runtime mode (jar mode vs docker mode).
- `scan_and_monitor` tools are not registered in the standard MCP tool set; always call `get_config` to confirm they are available before use.
- `list_domain_tags` supports additional filters: `name`, `tag_id`, `expand`.
- `get_domain_recommendation_by_app` and `get_domain_recommendation_catalog` accept the same filter parameters: `app_client_refs`, `application_types`, `campaign_ids`, `domain_ids`, `metric_ids`, `metric_tag_ids`, `segment_ids`, `tag_ids`, `technology_ids`.
