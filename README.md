# CAST Claude

A Claude Code plugin featuring CAST analysis skills.

## Prerequisites

- [Claude Code](https://claude.ai/code) CLI installed
- A running [CAST Imaging](https://www.castsoftware.com/imaging) instance
- [CAST Imaging MCP server](https://www.castsoftware.com/mcp) installed and configured in your Claude Code settings

## Installation

Add the plugin to Claude Code:

```bash
/plugin marketplace add CAST-Extend/cast-claude
```

Then install the CASTImaging plugin:

```bash
/plugin install CASTImaging
```

## Available Skills

### Impact Analysis (0.1.0-alpha)

Evaluate the scope and risk of code changes across your application landscape.

**Run explicitly:**
```bash
/impact-analysis
```

**Or trigger automatically by asking:**
- "What breaks if I change X?"
- "Is it safe to remove X?"
- "What depends on X?"
- "Blast radius of X?"

**Use when:**
- You need to understand the impact of a code change
- You want to assess risk before deployment
- You need to validate affected systems

**Example:**
```
What's the impact of refactoring the OrderProcessor class in BillingApp?
```

## Version History

See [CHANGELOG.md](CHANGELOG.md)

## License

MIT
