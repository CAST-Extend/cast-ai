# Contributing

Thank you for your interest in contributing to cast-claude.

There are two contribution tracks depending on your role:

| Track | Who | Where |
|-------|-----|-------|
| **Official** | CAST product team | `plugins/<product>/skills/` |
| **Community** | Consultants and external contributors | `community/<github-username>/<product>/skills/` |

---

## Community contributions

If you are a consultant or external contributor, your skills live under your own folder in `community/`. This keeps product-owned skills and community skills clearly separated, and lets you work independently without waiting on the product team.

### Folder structure

Mirror the product structure inside your folder:

```
community/
  <your-github-username>/
    README.md                       ← describe yourself and your skills
    imaging/
      skills/
        <skill-name>/
          SKILL.md
    highlight/
      skills/
        ...
```

### SKILL.md frontmatter

Declare required MCP permissions in the frontmatter so users know what to grant in their local `settings.local.json`:

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

### Rules

- **Only modify files under `community/<your-github-username>/`.** The CI workflow will reject any PR that touches files outside your folder.
- **Do not commit `settings.local.json`.** It is gitignored. Declare permissions in the SKILL.md frontmatter instead.
- Skill names are lowercase, hyphen-separated.
- Skills must be grounded in CAST data — do not rely on raw source code scanning alone.

### Opening a PR

1. Fork the repository and create a branch.
2. Add your skills under `community/<your-github-username>/<product>/skills/`.
3. Add or update `community/<your-github-username>/README.md` with a short description of your skills.
4. Open a PR against `main` with a brief description of each skill and the CAST product it relies on.

All PRs require approval from the `cast-claude-maintainers` team.

---

## Official plugin contributions (product team)

1. Choose the appropriate plugin directory under `plugins/`.
2. Create a new subdirectory under `plugins/<plugin>/skills/<skill-name>/`.
3. Add a `SKILL.md` file following the structure below.
4. Register the skill in `plugins/<plugin>/.claude-plugin/plugin.json`.

### SKILL.md structure

```markdown
# Skill Name

## Trigger
`/your-command`

## Description
What the skill does and when to use it.

## Inputs
| Parameter | Required | Description |
|-----------|----------|-------------|
| `param`   | Yes/No   | Description |

## Workflow
Step-by-step instructions Claude follows.

## Output
Description of the result format.
```

### Conventions

- Skill names are lowercase, hyphen-separated.
- Triggers match the skill directory name (e.g., `skills/impact-analysis/` → `/impact-analysis`).
- Workflows must be grounded in CAST data — do not rely on raw source code scanning.
- Keep each skill focused on a single workflow; compose multiple skills for complex pipelines.

### Pull requests

- Open a PR against `main`.
- Include a brief description of the skill and the CAST product it relies on.
- For new plugins, add an entry to the plugin table in `README.md` and `STRUCTURE.md`.
