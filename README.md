# CAST Plugin Marketplace

A Claude Code plugin marketplace featuring CAST analysis skills.

## Installation

Add the marketplace to Claude Code:

```bash
/plugin marketplace add cast/cast-plugins
```

Then install the cast-skills plugin:

```bash
/plugin install cast-skills
```

## Available Skills

- **impact-analysis** - Analyze code changes for impact on applications and dependencies (alpha)

More skills coming soon!

## Getting Started

Once installed, you'll have access to CAST skills in Claude Code. Use `/skills` to see available skills.

### Example: Impact Analysis

```
/impact-analysis
Analyze the impact of this code change on our applications.
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to add new skills.

## License

MIT
