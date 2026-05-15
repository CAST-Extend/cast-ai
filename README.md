# cast-claude

Skills and connectors for using Claude with CAST Imaging and CAST Highlight.

Each skill encodes a specific AI-assisted engineering workflow — impact analysis, dependency mapping, architectural Q&A — using CAST's Software Intelligence rather than raw code search. This ensures analyses are deterministic, traceable, and grounded in CAST's data model.

Use this repository to plug proven agent capabilities into your own Claude setup and extend them for your context.

## Plugins

| Plugin | Status | Description |
|--------|--------|-------------|
| [`imaging`](plugins/imaging/) | Alpha | Impact analysis and code dependency skills powered by CAST Imaging |
| [`imaging-express`](plugins/imaging-express/) | Alpha | Lightweight skills powered by CAST Imaging Express |
| [`highlight`](plugins/highlight/) | Planned | Portfolio-level skills powered by CAST Highlight |
| [`gatekeeper`](plugins/gatekeeper/) | Planned | Gate and policy enforcement skills powered by CAST Gatekeeper |

## Getting started

```bash
# Install a plugin directly from this repository
/plugin install CAST-Extend/cast-claude/plugins/imaging
```

## Community skills

Skills contributed by consultants, organized by topic. Browse the [`community/`](community/) folder — each contributor describes their skills in their own README.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on adding or extending skills.

## License

[MIT](LICENSE)
