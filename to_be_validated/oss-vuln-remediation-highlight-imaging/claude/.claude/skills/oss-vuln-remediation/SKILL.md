# Skill: oss-vuln-remediation (Claude adapter)

This file wires the CAST OSS vulnerability remediation workflow into Claude Code.

## Full workflow

See `skills/oss-vuln-remediation.md` for the complete four-step workflow logic.

## Slash commands

| Command | Step | Purpose |
|---------|------|---------|
| `/app-resolver` | 1 | Resolve app identity in Highlight + Imaging |
| `/oss-assessment` | 2 | Scan → `oss_remediation_plan.md` |
| `/oss-dependency-prescan` | 3 | Dep risk + execution order |
| `/oss-remediation` | 4 | Fix + build validation |

Run all four commands in the **same Claude session** in order.

## MCP server configuration

Add the following to your Claude MCP configuration file
(`~/.claude/settings.json` or project `.claude/settings.json`):

```json
{
  "mcpServers": {
    "highlight": {
      "type": "http",
      "url": "https://<your-highlight-mcp-host>/mcp",
      "headers": {
        "highlight_domain": "<your-domain-id>",
        "highlight_api_key": "<your-highlight-api-key>"
      }
    },
    "imaging": {
      "type": "http",
      "url": "https://<your-imaging-host>:<port>/mcp",
      "headers": {
        "x-api-key": "<your-imaging-api-key>"
      }
    }
  }
}
```

Replace each `<placeholder>` with your actual values before starting Claude.

## Behavioural rules (always active)

See `skills/oss-vuln-remediation.md` for the full rule set.
Key rules:
- Work one component at a time — never batch.
- Run build after every fix — never skip.
- Build fails → rollback, log reason, offer fix attempt, move on if declined.
- Maximum 3 build runs per component.
- Never fix LICENSE-only or OUTDATED-only items unless explicitly instructed.
