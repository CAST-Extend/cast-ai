# /app-resolver — Resolve App Identity

This is a Claude slash command adapter.
Full workflow logic lives in: `skills/oss-vuln-remediation.md` Step 1

## Required input

Provide the application name when invoking this command:
```
/app-resolver MyApplicationName
```

## What this command does

Resolves the exact application identity in both CAST Highlight and CAST Imaging
using the strategies defined in:
- `skills/highlight-app-resolver.md`
- `skills/imaging-app-resolver.md`

Stores `HIGHLIGHT_NAME`, `HIGHLIGHT_APP_ID`, and `IMAGING_APP_NAME` in session context.
These values are read automatically by subsequent commands — do not re-enter them.

## MCP servers required

- `highlight` — CAST Highlight MCP
- `imaging`   — CAST Imaging MCP

See `.claude/skills/oss-vuln-remediation/SKILL.md` for MCP configuration.
