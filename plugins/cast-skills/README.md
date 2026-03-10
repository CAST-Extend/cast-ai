# CAST Skills Plugin

AI-powered analysis and automation skills from CAST.

## Skills Included

### impact-analysis (0.1.0-alpha)

Analyze code changes for impact on applications and dependencies.

**Description:** Evaluate the scope and risk of code changes across your application landscape.

**Use when:**
- You need to understand the impact of a code change
- You want to assess risk before deployment
- You need to validate affected systems

## Installation

Once the marketplace is added, install with:

```bash
/plugin install cast-skills
```

## Usage

After installation, skills are available in Claude Code via `/skills` command.

### Example

```
You: Use the impact-analysis skill to evaluate this code change.

Claude: I'll analyze the impact...
1. Identifying scope
2. Checking dependencies
3. Assessing quality risk
4. Recommending validation steps
```

## Version History

See [CHANGELOG.md](CHANGELOG.md)

## License

MIT
