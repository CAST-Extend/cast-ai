# cast-claude — Repository Structure

```
cast-claude/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   └── workflows/
│       └── validate-contributor-scope.yml
├── products/                          # Official CAST plugins (product team)
│   ├── imaging/                       # CAST Imaging plugin (Alpha)
│   │   ├── .claude-plugin/
│   │   │   └── plugin.json
│   │   ├── commands/
│   │   │   └── impact-analysis.md
│   │   └── skills/
│   │       └── impact-analysis/
│   │           └── SKILL.md
│   ├── imaging-express/               # CAST Imaging Express plugin (Alpha)
│   ├── highlight/                     # CAST Highlight plugin (Planned)
│   └── gatekeeper/                    # CAST Gatekeeper plugin (Planned)
├── community/                         # Consultant contributions
│   ├── skills/                        # Standalone skills by product
│   │   └── <product>/
│   │       └── <skill-name>/
│   │           └── SKILL.md
│   └── plugins/                       # Full plugin packages by product
│       └── <product>/
│           └── <plugin-name>/
│               ├── .claude-plugin/
│               │   └── plugin.json
│               ├── skills/
│               └── commands/
├── CODEOWNERS
├── CONTRIBUTING.md
├── CHANGELOG.md
├── LICENSE
└── README.md
```

## Concepts

**Skill** — a folder containing a `SKILL.md` file that teaches Claude how to perform a specific task. Claude loads skills on-demand: it scans name/description tokens and pulls the full content into context when relevant. Skills work across all Claude products.

**Plugin** — a distribution format specific to Claude Code. A plugin bundles skills, slash commands, subagents, MCP servers, and hooks into a single installable unit (`/plugin install`). Plugins contain skills, not the other way around.

## Official products

| Plugin | Status | Description |
|--------|--------|-------------|
| `imaging` | Alpha | Impact analysis and dependency skills powered by CAST Imaging |
| `imaging-express` | Alpha | Lightweight skills powered by CAST Imaging Express |
| `highlight` | Planned | Portfolio skills powered by CAST Highlight |
| `gatekeeper` | Planned | Gate and policy skills powered by CAST Gatekeeper |

## Community

| Area | Path | What goes here |
|------|------|----------------|
| Skills | `community/skills/<product>/<skill-name>/` | A single `SKILL.md` teaching Claude one workflow |
| Plugins | `community/plugins/<product>/<plugin-name>/` | A full plugin package with `.claude-plugin/`, commands, hooks |
