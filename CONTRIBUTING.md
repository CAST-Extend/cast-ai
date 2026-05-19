# Contributing

Thank you for your interest in contributing to cast-claude.

## Concepts

**Skill** — a folder containing a `SKILL.md` file that teaches Claude how to perform one specific task. Works across all Claude products. Write a skill when you need Claude to know how to do one thing well.

**Plugin** — a Claude Code distribution format. Bundles skills, slash commands, subagents, MCP servers, and hooks into a single installable unit. Wrap one or more skills in a plugin when you want to ship them as an installable package.

---

## Contribution tracks

| Track | Who | Where |
|-------|-----|-------|
| **Official** | CAST product team | `products/<product>/` |
| **Community** | Consultants and external contributors | `community/plugins/<product>/<bundle>/` |

---

## How a contribution becomes installable

Both official and community plugins are listed in the repo-root marketplace catalog at [.claude-plugin/marketplace.json](.claude-plugin/marketplace.json). End users add this catalog once and then install whichever plugins they want:

```text
/plugin marketplace add CAST-Extend/cast-claude
/plugin install <plugin-name>@cast-claude
```

Every plugin in the catalog carries a `category` field — `"official"` or `"community"` — so users can tell which is which.

---

## Community contributions

### One community plugin per CAST product

Community contributions for a given CAST product are bundled into a single plugin so the skills compose. For example, all imaging community skills live in **one** plugin named `imaging-community`, installable as:

```text
/plugin install imaging-community@cast-claude
```

This keeps the install surface small (one install gets the full consultant-curated workflow), avoids name collisions with the official `imaging` plugin, and lets skills reference each other by name within the same plugin.

The current community bundles:

| Plugin | Source path | CAST product |
|--------|-------------|--------------|
| `imaging-community` | `community/plugins/imaging/community/` | CAST Imaging |

Bundles for `imaging-express`, `highlight`, and `gatekeeper` will be added when those products have community contributions.

### Layout of a community bundle

```
community/plugins/<product>/community/
├── .claude-plugin/
│   └── plugin.json
└── skills/
    └── <skill-name>/
        └── SKILL.md
```

Each `SKILL.md` declares its own frontmatter:

```yaml
---
name: my-skill
description: One-line description Claude uses to decide when to invoke this skill.
---
```

For full SKILL.md frontmatter options (including `argument-hint`, `allowed-tools`, and `disable-model-invocation`), see the [official skills reference](https://code.claude.com/docs/en/skills#frontmatter-reference).

### The plugin manifest — `plugin.json`

Every plugin must have a `.claude-plugin/plugin.json` manifest. Use only fields documented in the [official manifest schema](https://code.claude.com/docs/en/plugins-reference#plugin-manifest-schema):

```json
{
  "$schema": "https://json.schemastore.org/claude-code-plugin-manifest.json",
  "name": "<product>-community",
  "version": "0.1.0",
  "description": "One-line description of what this bundle contains.",
  "homepage": "https://github.com/CAST-Extend/cast-claude/tree/main/community/plugins/<product>/community",
  "keywords": ["cast", "<product>", "community"]
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `name` | Yes | Must be `<product>-community` (e.g. `imaging-community`). Lowercase, hyphenated. |
| `version` | Recommended | Bump on every PR that adds or changes skills so installed users receive updates via `/plugin marketplace update`. |
| `description` | Recommended | Shown in the `/plugin` Discover tab. |
| `keywords` | Optional | Tags for discovery. |

Skills are auto-discovered from the `skills/` subdirectory; do not declare them in `plugin.json`.

### Adding a NEW community plugin

If your CAST product does not yet have a community bundle (e.g. you're the first to contribute a `highlight` community skill), your PR creates the bundle:

1. Create `community/plugins/<product>/community/.claude-plugin/plugin.json` (use the template above).
2. Add your skill at `community/plugins/<product>/community/skills/<skill-name>/SKILL.md`.
3. Register the new plugin in [.claude-plugin/marketplace.json](.claude-plugin/marketplace.json):

   ```json
   {
     "name": "<product>-community",
     "source": "./community/plugins/<product>/community",
     "category": "community",
     "description": "Community-contributed skills for CAST <Product>.",
     "homepage": "https://github.com/CAST-Extend/cast-claude/tree/main/community/plugins/<product>/community",
     "license": "MIT",
     "keywords": ["cast", "<product>", "community"]
   }
   ```

4. Open a PR. Maintainers review.

### Adding a skill to an EXISTING bundle

If a community bundle for your CAST product already exists (e.g. `imaging-community`), your PR adds your skill to it:

1. Drop your skill at `community/plugins/<product>/community/skills/<skill-name>/SKILL.md`.
2. Bump the bundle's `plugin.json` `version` (patch-level: e.g. `0.1.0` → `0.1.1`) so installed users receive your skill on `/plugin marketplace update`.
3. `marketplace.json` does **not** need to change.
4. Open a PR. Maintainers review.

### Rules

- **Only modify files under `community/`** (or `.claude-plugin/marketplace.json` to register a new bundle). The CI workflow rejects any PR that touches files outside `community/` unless authored by a maintainer.
- **Do not commit `settings.local.json`.** It is gitignored. Declare required tool permissions in the SKILL.md frontmatter via `allowed-tools` instead.
- **Skill, plugin, and directory names** are lowercase, hyphen-separated.
- **Skills must be grounded in CAST data** — do not rely on raw source code scanning alone.

### Opening a PR

1. Fork the repository and create a branch.
2. Make your changes per the "Adding a NEW community plugin" or "Adding a skill to an EXISTING bundle" path above.
3. Open a PR against `main` with a brief description of each skill/plugin and the CAST product it relies on.

All PRs require approval from a maintainer.

---

## Official plugin contributions (product team)

1. Choose the appropriate product directory under `products/`.
2. Create a new subdirectory under `products/<product>/skills/<skill-name>/`.
3. Add a `SKILL.md` file. Skills are auto-discovered; no manifest declaration needed.
4. Register the plugin (if new) in [.claude-plugin/marketplace.json](.claude-plugin/marketplace.json) with `"category": "official"`.

### Conventions

- Skill names are lowercase, hyphen-separated.
- Workflows must be grounded in CAST data — do not rely on raw source code scanning.
- Keep each skill focused on a single workflow; compose multiple skills for complex pipelines.

### Pull requests

- Open a PR against `main`.
- Include a brief description of the skill and the CAST product it relies on.
- For new plugins, add an entry to the plugin table in `README.md` and `STRUCTURE.md`.
