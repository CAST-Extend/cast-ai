# /oss-remediation — OSS Remediation

This is a Claude slash command adapter.
Full workflow logic lives in: `skills/oss-vuln-remediation.md` Step 4

## Pre-condition

All three prior commands must have run in this session.
`oss_remediation_plan.md` must show Dependency risk ✅ Complete.
If still ⏳ Pending — run `/oss-dependency-prescan` first.

## What this command does

For each component in execution order from `oss_remediation_plan.md`:
1. Runs full Imaging blast radius analysis (`skills/imaging-dependency-analysis.md`)
2. Cross-validates with workspace code
3. Applies fix with AI remediation markers
4. Runs build validation and rollback if needed (`skills/build-validate-rollback.md`)
5. Appends Final Remediation Summary to `oss_remediation_plan.md`

One component at a time. Never batched.

## MCP servers required

- `highlight` — CAST Highlight MCP
- `imaging`   — CAST Imaging MCP
