# cast-claude — Repository Structure

```
cast-claude/
├── .github/
│   └── ISSUE_TEMPLATE/
│       ├── bug_report.md
│       └── feature_request.md
├── plugins/
│   ├── imaging/               # CAST Imaging skills (Alpha)
│   │   ├── .claude-plugin/
│   │   │   └── plugin.json
│   │   └── skills/
│   │       └── impact-analysis/
│   │           └── SKILL.md
│   ├── imaging-express/       # CAST Imaging Express skills (Alpha)
│   │   ├── .claude-plugin/
│   │   │   └── plugin.json
│   │   └── skills/
│   ├── highlight/             # CAST Highlight skills (Planned)
│   │   ├── .claude-plugin/
│   │   │   └── plugin.json
│   │   └── skills/
│   └── gatekeeper/            # CAST Gatekeeper skills (Planned)
│       ├── .claude-plugin/
│       │   └── plugin.json
│       └── skills/
├── .gitignore
├── CHANGELOG.md
├── CODEOWNERS
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```

## Plugins

| Plugin | Status | Description |
|--------|--------|-------------|
| `imaging` | Alpha (0.1.0) | Impact analysis and code dependency skills powered by CAST Imaging |
| `imaging-express` | Alpha (0.1.0) | Lightweight skills powered by CAST Imaging Express |
| `highlight` | Planned | Portfolio-level skills powered by CAST Highlight |
| `gatekeeper` | Planned | Gate and policy enforcement skills powered by CAST Gatekeeper |

## Skill anatomy

Each skill lives in its own subdirectory under `plugins/<plugin>/skills/<skill-name>/` and contains a single `SKILL.md` file that defines:

- **Trigger** — the slash command that invokes the skill
- **Description** — what the skill does and when to use it
- **Inputs** — parameters the skill expects
- **Workflow** — step-by-step instructions Claude follows
- **Output** — the format of the result

## Installation

```bash
# Install a plugin directly from this repository
/plugin install CAST-Extend/cast-claude/plugins/imaging
```
