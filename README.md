# cast-claude

Skills and plugins for using Claude with CAST products.

Each skill encodes a specific AI-assisted engineering workflow — impact analysis, dependency mapping, architectural Q&A — using CAST's Software Intelligence rather than raw code search. This ensures analyses are deterministic, traceable, and grounded in CAST's data model.

## Official plugins

| Plugin | Status | Description |
|--------|--------|-------------|
| [`imaging`](products/imaging/) | Alpha | Impact analysis and code dependency skills powered by CAST Imaging |
| [`imaging-express`](products/imaging-express/) | Alpha | Lightweight skills powered by CAST Imaging Express |
| [`highlight`](products/highlight/) | Planned | Portfolio-level skills powered by CAST Highlight |
| [`gatekeeper`](products/gatekeeper/) | Planned | Gate and policy enforcement skills powered by CAST Gatekeeper |

## Getting started

```bash
# Install a plugin directly from this repository
/plugin install CAST-Extend/cast-claude/products/imaging
```

## Community

Standalone skills and plugins contributed by consultants, organized by CAST product.

- [`community/skills/`](community/skills/) — individual skills, ready to use as-is
- [`community/plugins/`](community/plugins/) — full plugin packages with commands and hooks

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

[MIT](LICENSE)
