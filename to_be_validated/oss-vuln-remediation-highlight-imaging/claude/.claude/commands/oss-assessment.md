# /oss-assessment — OSS Vulnerability Assessment

This is a Claude slash command adapter.
Full workflow logic lives in: `skills/oss-vuln-remediation.md` Step 2

## Pre-condition

Run `/app-resolver` first in the same session.
HIGHLIGHT_NAME and HIGHLIGHT_APP_ID must be in context — this command reads them automatically.

## What this command does

Calls CAST Highlight MCP to fetch the latest CVE scan for the resolved application,
flags and prioritizes all vulnerable OSS components, and writes `oss_remediation_plan.md`
to the workspace root.

Sub-skills used:
- `skills/highlight-data-fetch.md`

## MCP servers required

- `highlight` — CAST Highlight MCP
