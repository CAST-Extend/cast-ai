# CAST Imaging — Claude Code plugin

AI-powered impact analysis powered by [CAST Imaging](https://www.castsoftware.com/imaging). Status: alpha.

## What this plugin adds

| Skill | Description |
|-------|-------------|
| `impact-analysis` | Risk-scored impact report for a code object: callers, callees, transactions, data flows, and cross-app reach. |

Claude invokes the skill automatically when you ask things like:
- "What breaks if I change X?"
- "Is it safe to remove X?"
- "Blast radius of X?"

Or trigger it explicitly:

```text
/imaging:impact-analysis [application] [object_name]
```

## Prerequisites

- [Claude Code](https://claude.ai/code) installed
- A running [CAST Imaging](https://www.castsoftware.com/imaging) instance
- The CAST Imaging MCP server registered in your Claude Code config as `imaging` — see the [CAST Imaging MCP setup guide](https://doc.castsoftware.com/mcp-server/windows/)

## Install

Clone the repo and load the plugin directly:

```bash
git clone https://github.com/CAST-Extend/cast-claude.git
claude --plugin-dir ./cast-claude/products/imaging
```

> A marketplace-based install (`/plugin install imaging@cast-claude`) will be available once the repo ships its `.claude-plugin/marketplace.json`.

## License

MIT
