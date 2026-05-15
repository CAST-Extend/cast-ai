# Contributing

Thank you for your interest in contributing to cast-claude.

## Concepts

**Skill** — a folder containing a `SKILL.md` file that teaches Claude how to perform one specific task. Works across all Claude products. Write a skill when you need Claude to know how to do one thing well.

**Plugin** — a Claude Code distribution format. Bundles skills, slash commands, subagents, MCP servers, and hooks into a single installable unit. Wrap a skill in a plugin when you want to ship it (and related pieces) as one package someone can install in one step.

---

## Contribution tracks

| Track | Who | Where |
|-------|-----|-------|
| **Official** | CAST product team | `products/<product>/` |
| **Community skill** | Consultants and external contributors | `community/skills/<product>/<skill-name>/` |
| **Community plugin** | Consultants and external contributors | `community/plugins/<product>/<plugin-name>/` |

---

## Community contributions

### Contributing a skill

A skill is a single `SKILL.md` file. Place it under the relevant CAST product:

```
community/skills/
  imaging/
    <skill-name>/
      SKILL.md
  highlight/
    <skill-name>/
      SKILL.md
```

**SKILL.md frontmatter** — declare required MCP permissions so users know what to grant locally:

```markdown
---
name: my-skill
description: One-line description of what the skill does.
permissions:
  - mcp__imaging__applications
  - mcp__imaging__objects
  - Grep
  - Read
---
```

### Contributing a plugin

A plugin bundles skills with commands, hooks, and MCP wiring. Place it under the relevant product:

```
community/plugins/
  imaging/
    <plugin-name>/
      .claude-plugin/
        plugin.json
      skills/
        <skill-name>/
          SKILL.md
      commands/
        <command-name>.md
```

### Rules

- **Only modify files under `community/`.** The CI workflow will reject any PR that touches files outside `community/`.
- **Do not commit `settings.local.json`.** It is gitignored. Declare permissions in the SKILL.md frontmatter instead.
- Skill and plugin names are lowercase, hyphen-separated.
- Skills must be grounded in CAST data — do not rely on raw source code scanning alone.

### Opening a PR

1. Fork the repository and create a branch.
2. Add your skill(s) under `community/skills/<product>/` or your plugin under `community/plugins/<product>/`.
3. Open a PR against `main` with a brief description of each skill/plugin and the CAST product it relies on.

All PRs require approval from a maintainer.

---

## Official plugin contributions (product team)

1. Choose the appropriate product directory under `products/`.
2. Create a new subdirectory under `products/<product>/skills/<skill-name>/`.
3. Add a `SKILL.md` file and register it in `products/<product>/.claude-plugin/plugin.json`.

### Conventions

- Skill names are lowercase, hyphen-separated.
- Workflows must be grounded in CAST data — do not rely on raw source code scanning.
- Keep each skill focused on a single workflow; compose multiple skills for complex pipelines.

### Pull requests

- Open a PR against `main`.
- Include a brief description of the skill and the CAST product it relies on.
- For new plugins, add an entry to the plugin table in `README.md` and `STRUCTURE.md`.
