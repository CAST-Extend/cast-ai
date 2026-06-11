---
name: oss-assessment
description: OSS vulnerability scan → oss_remediation_plan.md
mode: agent
---
# Step 2 — OSS Vulnerability Assessment

Use HIGHLIGHT_NAME and HIGHLIGHT_APP_ID already resolved in this conversation.
Do not ask the user to re-enter them.
If missing from context: say so and stop — do not guess.

Follow `skills/oss-vuln-remediation.md` **Step 2** exactly.

Sub-skills called by this step:
- `skills/highlight-data-fetch.md` — freshness enforcement + CVE-first fetch sequence
