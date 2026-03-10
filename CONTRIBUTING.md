# Contributing

## Adding a New Skill

To add a new skill to the cast-skills plugin:

### 1. Create Skill Directory

```bash
mkdir plugins/cast-skills/skills/your-skill-name
```

### 2. Create SKILL.md

Create `plugins/cast-skills/skills/your-skill-name/SKILL.md`:

```markdown
---
description: Clear description of what the skill does
---

Your skill workflow here.

1. Step one
2. Step two
3. Step three
```

### 3. Update Version

In `plugins/cast-skills/.claude-plugin/plugin.json`:
- Change version from `0.1.0-alpha` to `0.2.0-alpha` (for new alpha skill)
- Or to `0.1.0` to mark stable release

### 4. Update CHANGELOG

Add entry to `plugins/cast-skills/CHANGELOG.md`

### 5. Test Locally

```bash
/plugin marketplace add ./plugins/cast-skills/
/plugin install cast-skills
/skills  # Verify your skill appears
```

### 6. Commit and Push

```bash
git add .
git commit -m "IMAGSYS-XXXXX: Add your-skill-name skill"
git push
```

## Skill Guidelines

Good skills:
- Have clear, actionable descriptions
- Do one thing well
- Include step-by-step workflows
- Are self-contained

Avoid:
- Vague descriptions
- Trying to do too much
- Undocumented features
