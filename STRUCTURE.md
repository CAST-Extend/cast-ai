# cast-claude — Repository Structure

```
cast-claude/
├── .claude-plugin/
│   └── marketplace.json              # Marketplace catalog (lists all installable plugins)
├── .github/
│   ├── ISSUE_TEMPLATE/
│   └── workflows/
│       └── validate-contributor-scope.yml
├── products/                          # Official CAST plugins (product team)
│   ├── imaging/                       # CAST Imaging plugin (Alpha)
│   │   ├── .claude-plugin/
│   │   │   └── plugin.json
│   │   ├── skills/
│   │   │   └── impact-analysis/
│   │   │       └── SKILL.md
│   │   └── README.md
│   ├── imaging-express/               # CAST Imaging Express plugin (Planned)
│   ├── highlight/                     # CAST Highlight plugin (Planned)
│   └── gatekeeper/                    # CAST Gatekeeper plugin (Planned)
├── community/                         # Consultant-contributed plugins
│   └── plugins/
│       └── <product>/                 # One bundled community plugin per CAST product
│           ├── .claude-plugin/
│           │   └── plugin.json
│           ├── skills/
│           │   └── <skill-name>/
│           │       └── SKILL.md
│           └── README.md
├── CODEOWNERS
├── CONTRIBUTING.md
├── CHANGELOG.md
├── LICENSE
└── README.md
```

## Concepts

**Skill** — a folder containing a `SKILL.md` file that teaches Claude how to perform a specific task. Claude loads skills on-demand: it scans name/description tokens and pulls the full content into context when relevant. Skills work across all Claude products.

**Plugin** — a distribution format specific to Claude Code. A plugin bundles skills, slash commands, subagents, MCP servers, and hooks into a single installable unit (`/plugin install`). Plugins contain skills, not the other way around.

**Marketplace** — a catalog of plugins distributed via the [`.claude-plugin/marketplace.json`](./.claude-plugin/marketplace.json) at the repo root. Users add the marketplace once (`/plugin marketplace add CAST-Extend/cast-claude`) and then install whichever plugins they want.

## Plugins

| Plugin | Category | Status | Description |
|--------|----------|--------|-------------|
| `imaging` | official | Alpha | Impact analysis and dependency skills powered by CAST Imaging |
| `imaging-community` | community | Alpha | 25 consultant-contributed skills for CAST Imaging |
| `imaging-express` | official | Planned | Lightweight skills powered by CAST Imaging Express |
| `highlight` | official | Planned | Portfolio skills powered by CAST Highlight |
| `gatekeeper` | official | Planned | Gate and policy skills powered by CAST Gatekeeper |

## Contribution tracks

| Track | Path | What lives here |
|-------|------|------------------|
| Official | `products/<product>/` | Plugins maintained by the CAST product team |
| Community | `community/plugins/<product>/` | One bundled plugin per CAST product, curated by consultants |

For the community contribution workflow (layout, naming convention, marketplace-entry step), see [CONTRIBUTING.md](CONTRIBUTING.md).
