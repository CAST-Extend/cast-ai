# Contributing

## How it works

- `to_be_validated/` — open to all contributors. Create a folder, add your asset, open a PR.
- `assets/` — reviewers move assets here after testing and validation.

## Transforming a skill into an asset

If you already have a working skill — a prompt file, a SKILL.md, a Copilot prompt, or any workflow definition — you can use your AI IDE to package it as a proper asset. Paste the prompt below into your AI assistant with your skill file open.

```
I have a skill file that implements an AI-assisted workflow using CAST products.
Help me turn it into a cast-ai asset following the repository conventions.

Do the following steps:

1. **Extract the core workflow** into `skills/<skill-name>.md`.
   Remove any provider-specific frontmatter (model, mode, tools declarations).
   Keep the full prompt logic, MCP tool calls, output format, and rules.

2. **Create provider adapter stubs** for each AI IDE the skill is compatible with.
   Use only the adapters that make sense given the skill's MCP requirements:
   - `copilot/`  → `.github/prompts/<skill-name>.prompt` + `.vscode/mcp.json`
   - `claude/`   → `.claude/commands/<skill-name>.md` + `.claude/skills/<skill-name>/SKILL.md`
   - `cursor/`   → `.cursor/rules/<skill-name>.mdc`
   - `gemini/`   → `.gemini/settings.json` + `.gemini/styleguide.md`
   - `kiro/`     → `.kiro/settings/mcp.json` + `.kiro/steering/<skill-name>.md`
   Each adapter must reference `skills/<skill-name>.md` rather than duplicating the workflow.
   MCP server URLs and API keys must use placeholders — never hardcode credentials.

3. **Write `README.md`** using this exact section order:
   # <Asset name>
   ## Executive Summary
   ## CAST Use Case
   <!-- One of: Tech debt reduction | Risk reduction | Technology upgrades |
        App maintenance & enhancement | Modernization acceleration |
        Business rule extraction | Other -->
   ## Target Users
   ## Benefits
   ## Asset Status
   <!-- One of: Demonstration only | Pilot-ready | Production-tested -->
   ## Asset Status
   <!-- One of: Demonstration only | Pilot-ready | Production-tested -->
   ## Version
   <!-- Semantic version, e.g. 1.0.0 for an initial release -->
   ## Solution Description
   ## Outputs Produced
   ## Workflow
   ## Pre-requisites
   ## Limitations
   ## Assets / Package Contents

   Derive each field from the skill content. Do not invent information —
   if a field cannot be determined from the skill, leave a <!-- TODO --> comment.

4. **Name the asset folder** in lowercase, hyphen-separated, descriptive of the workflow
   (e.g. `oss-vuln-remediation-highlight`, `impact-analysis-imaging`).
   Do not encode the provider name in the folder name.

5. **Check for secrets**: scan all generated files for hardcoded API keys, tokens,
   domain IDs, UUIDs, or URLs that look like real endpoints. Replace with placeholders.

Place the result under `to_be_validated/<asset-name>/` and open a PR.
```

---

## Submitting an asset

1. Create a folder under `to_be_validated/<your-asset-name>/` (lowercase, hyphen-separated).
2. Add a `README.md` using the template below.
3. Add your asset files (skills, provider adapters).
4. Open a PR against `main`. CI will check that your changes stay within `to_be_validated/`.

A reviewer will test the asset and either request changes or move it to `assets/`. To revise an asset that has already been validated, see
[Updating a validated asset](#updating-a-validated-asset).


---

## Updating a validated asset

Already-validated assets live in `assets/` and cannot be edited directly — CI rejects any PR that touches `assets/`. To submit a new version, route it back through validation:

1. Copy the validated asset from `assets/<asset-name>/` into `to_be_validated/<asset-name>/`. **Keep the same folder name** — this is
   how reviewers know it's an update, not a new asset.
3. Make your changes. Bump the `Version` in `README.md`,  and update `Asset Status` if the maturity level changed (e.g. Pilot-ready → Production-tested)
4. Open a PR against `main`. In the description, note that this is an update to an existing asset and summarize what changed. 

A reviewer diffs your version against the current `assets/<asset-name>/`, re-validates it end-to-end, and a maintainer overwrites the `assets/` copy. Versioning is tracked through git history — do not encode version numbers in the folder name.

---

## Asset README template

```markdown
# <Asset name>

## Executive Summary
<!-- One paragraph: what problem this solves, how it works, who it's for. -->

## CAST Use Case
<!-- One of: Tech debt reduction | Risk reduction | Technology upgrades |
     App maintenance & enhancement | Modernization acceleration |
     Business rule extraction | Other -->

## Target Users
<!-- e.g. Application developer, Architect, Tech lead -->

## Benefits
<!-- Bullet list: what the user gains (accuracy, speed, effort reduction…) -->

## Asset Status
<!-- One of: Demonstration only | Pilot-ready | Production-tested -->

## Version
<!-- Semantic version, e.g. 1.2.0. Bump on each validated update:
     patch = fixes/docs, minor = new capability, major = breaking change.
     Optionally list recent changes:
     - 1.2.0 — added Cursor adapter
     - 1.1.0 — improved fix validation step
     - 1.0.0 — initial validated release -->

## Solution Description
<!-- How the asset works technically: which CAST products are queried,
     what the AI does with the data, how fixes or outputs are validated. -->

## Outputs Produced
<!-- What the user gets at the end: remediated code, reports, diagrams… -->

## Workflow
<!-- Linear sequence, e.g.:
     Developer prompt → AI request → CAST data retrieval → generated fix → validation → human review -->

## Pre-requisites
<!-- CAST products required, MCP configuration, AI IDE / LLM provider. -->

## Limitations
<!-- Known gaps: manual steps required, unsupported technologies,
     dependency on scan completeness, etc. -->

## Assets / Package Contents
<!-- Table of files/folders in this asset and what each one does. -->
```

## Asset folder layout

```
to_be_validated/<asset-name>/
  README.md
  skills/             provider-agnostic prompts and workflow definitions
  copilot/            GitHub Copilot adapter (drop into project root)
    .github/
    .vscode/
  claude/             Claude Code adapter (drop into project root)
    .claude/
  cursor/             Cursor adapter (drop into project root)
    .cursor/
  gemini/             Gemini Code Assist adapter (drop into project root)
    .gemini/
  kiro/               Amazon Kiro adapter (drop into project root)
    .kiro/
```

Provider adapters are optional — submit what you have. Other contributors can add adapters later.

## Rules

- Only modify files under `to_be_validated/`. The CI workflow rejects PRs that touch `assets/`.
- Asset names are lowercase, hyphen-separated.
- Workflows must be grounded in CAST data — do not rely on raw source code scanning alone.
- Do not commit secrets, API keys, or personal credentials.

## Review process

Reviewers validate that the asset:
- Works end-to-end with the declared prerequisites
- Follows the README template
- Does not duplicate an existing validated asset, *unless it is submitted under
  the same folder name as an existing asset, in which case it is treated as an
  update and replaces that asset*


Approved assets are moved from `to_be_validated/` to `assets/` by a maintainer.
