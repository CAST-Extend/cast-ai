# cast-ai

Reusable AI assets for CAST product users — compatible with GitHub Copilot, Cursor, Claude Code, Gemini Code Assist, and other AI coding assistants.

Each asset encodes a specific AI-assisted engineering workflow grounded in CAST Software Intelligence (Imaging, Highlight, Gatekeeper). Assets are provider-agnostic: the same workflow can be wired into different AI IDEs using the provider adapter bundled with each asset.

## Repository structure

```
assets/       validated, reviewed assets ready to use
to_be_validated/     submitted assets pending review
```

### Asset layout

```
<asset-name>/
  README.md           standardized description (see template in CONTRIBUTING.md)
  skills/             provider-agnostic prompt definitions
  copilot/            GitHub Copilot adapter (.github/, .vscode/)
  claude/             Claude Code adapter (.claude/)
  cursor/             Cursor adapter (.cursor/)
  gemini/             Gemini Code Assist adapter
```

Not every asset supports every provider. Check the asset's README for the list of available adapters.

## Using an asset

1. Browse `assets/` and pick the asset that fits your use case.
2. Check its README for prerequisites (CAST products, MCP config, LLM access).
3. Copy the provider adapter folder contents into the root of your project repository.

## Assets

See [`assets/`](assets/) for the full catalog of validated assets.

See [`to_be_validated/`](to_be_validated/) for assets currently under review.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)
