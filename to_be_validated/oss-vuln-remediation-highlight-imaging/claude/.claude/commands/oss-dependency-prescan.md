# /oss-dependency-prescan — Dependency Risk Pre-scan

This is a Claude slash command adapter.
Full workflow logic lives in: `skills/oss-vuln-remediation.md` Step 3

## Pre-condition

Run `/oss-assessment` first. `oss_remediation_plan.md` must exist in workspace root.
IMAGING_APP_NAME must be in context from `/app-resolver`.

## What this command does

Runs a lightweight Imaging blast radius scan for every CVE-flagged component in the plan,
assigns a Dependency Risk score (Low/Medium/High), and rewrites the Consolidated Action Plan
table in `oss_remediation_plan.md` with the final execution order.

Sub-skills used:
- `skills/highlight-dependency-risk.md`

## MCP servers required

- `imaging` — CAST Imaging MCP
