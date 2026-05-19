# CAST Imaging — Claude Code plugin

AI-powered impact analysis powered by [CAST Imaging](https://www.castsoftware.com/imaging). Status: alpha.

## Prerequisites

- [Claude Code](https://claude.ai/code) installed
- A running [CAST Imaging](https://www.castsoftware.com/imaging) instance
- The CAST Imaging MCP server registered in your Claude Code config as `imaging` — see the [CAST Imaging MCP setup guide](https://doc.castsoftware.com/mcp-server/windows/)

## Install

Inside Claude Code, add the `cast-claude` marketplace and install the plugin:

```text
/plugin marketplace add CAST-Extend/cast-claude
/plugin install imaging@cast-claude
```

Then activate it for the current session:

```text
/reload-plugins
```

The plugin installs to your **user scope** by default — it stays available across all your Claude Code sessions and projects. To install for a specific project or for yourself only in this repository, run `/plugin` and pick a scope from the interactive UI.

### Verify

```text
/help
```

You should see `/imaging:impact-analysis` listed. Run `/plugin` and check the **Installed** tab to confirm `imaging@cast-claude` is enabled with no errors.

### Update

When a new version of the plugin ships:

```text
/plugin marketplace update cast-claude
/reload-plugins
```

### Uninstall

```text
/plugin uninstall imaging@cast-claude
```

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

## License

MIT
