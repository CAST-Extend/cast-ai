# cast-claude

Skills and plugins for using Claude with [CAST](https://www.castsoftware.com/) products.

Each skill encodes a specific AI-assisted engineering workflow — impact analysis, dependency mapping, architectural review, persistence audits — grounded in CAST's Software Intelligence rather than raw code search. Analyses are deterministic, traceable, and tied to CAST's data model.

## Install

Inside Claude Code, add the `cast-claude` marketplace once:

```text
/plugin marketplace add CAST-Extend/cast-claude
```

Then install whichever plugins you want:

```text
/plugin install imaging@cast-claude
/plugin install imaging-community@cast-claude
/reload-plugins
```

Plugins install to your **user scope** by default — they stay available across all Claude Code sessions and projects.

## Plugins

| Plugin | Category | Description |
|--------|----------|-------------|
| [`imaging`](products/imaging/) | official | Impact analysis: callers, callees, transactions, data flows, and cross-app reach for any code object. |
| [`imaging-community`](community/plugins/imaging/) | community | 25 consultant-curated skills for CAST Imaging: architectural reviews, persistence and database analysis, security audits, modernization assessment, and orchestrated reports. |

Plugins install side by side with no name collision; install whichever you need.

## Roadmap

Plugins for the other CAST products will land here as they're built:

- `imaging-express` — lightweight skills powered by CAST Imaging Express
- `highlight` — portfolio-level skills powered by CAST Highlight
- `gatekeeper` — gate and policy enforcement skills powered by CAST Gatekeeper

## Contributing

Community contributions are welcome under [`community/plugins/<product>/`](community/plugins/). See [CONTRIBUTING.md](CONTRIBUTING.md) for the layout, naming convention, and PR workflow.

## License

[MIT](LICENSE)
