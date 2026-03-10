# Setup Guide

## Installation

### Step 1: Add Marketplace

In Claude Code, run:

```bash
/plugin marketplace add cast/cast-plugins
```

### Step 2: Install cast-skills Plugin

```bash
/plugin install cast-skills
```

### Step 3: Verify Installation

Run `/skills` in Claude Code to see available skills.

## Using Skills

Once installed, reference skills in your conversations:

```
Please use the impact-analysis skill to evaluate this code change.
```

Claude will invoke the skill and guide you through the analysis.

## Troubleshooting

### Marketplace not found

Make sure you're using the correct repository:
```bash
/plugin marketplace add cast/cast-plugins
```

### Skills not appearing

Try updating the marketplace:
```bash
/plugin marketplace update
```

Then reinstall the plugin:
```bash
/plugin install cast-skills
```

### Still having issues?

Check that:
1. Claude Code is up to date
2. Repository is accessible
3. Run `/plugin validate` to check for errors
