# imaging

AI-powered analysis skills for [CAST Imaging](https://www.castsoftware.com/imaging).

## Skills

| Skill | Trigger | Description |
|-------|---------|-------------|
| `impact-analysis` | `/impact-analysis` | Evaluate the scope and risk of code changes across your application landscape |

## Prerequisites

- [Claude Code](https://claude.ai/code) CLI installed
- A running [CAST Imaging](https://www.castsoftware.com/imaging) instance
- The CAST Imaging MCP server installed and registered in your Claude Code settings as **`imaging`** (see [official setup guide](https://doc.castsoftware.com/mcp-server/windows/))

## Installation

```bash
/plugin install CAST-Extend/cast-claude/products/imaging
```

## Usage

**Run explicitly:**
```
/impact-analysis [application] [object_name]
```

**Or trigger automatically by asking:**
- "What breaks if I change X?"
- "Is it safe to remove X?"
- "What depends on X?"
- "Blast radius of X?"

## License

MIT
