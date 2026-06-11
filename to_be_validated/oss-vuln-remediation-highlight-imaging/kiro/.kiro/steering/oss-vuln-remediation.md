# CAST OSS Vulnerability Remediation — Kiro Steering

This steering file instructs Kiro to follow the CAST OSS remediation workflow
when working in this repository. Full workflow logic is in `skills/oss-vuln-remediation.md`.

## Activation

This steering applies whenever the user invokes any of the four workflow steps below,
or when Kiro detects files such as `oss_remediation_plan.md`, `pom.xml`, `package.json`,
`build.gradle`, `requirements.txt`, `*.csproj`, `go.mod`, `Cargo.toml`, or `Gemfile`.

## Workflow steps

| Step | Command | Purpose |
|------|---------|---------|
| 1 | "resolve app identity: <AppName>" | Highlight + Imaging name resolution |
| 2 | "run oss assessment" | CVE scan → `oss_remediation_plan.md` |
| 3 | "run dependency prescan" | Imaging blast radius + execution order |
| 4 | "run oss remediation" | Fix + build + rollback + summary |

Run all steps in the **same Kiro session** in order. Context is retained automatically.

## Skills to follow exactly

| Skill file | When to use |
|------------|-------------|
| `skills/highlight-app-resolver.md` | Step 1 Part A |
| `skills/imaging-app-resolver.md` | Step 1 Part B |
| `skills/highlight-data-fetch.md` | Step 2 |
| `skills/highlight-dependency-risk.md` | Step 3 per component |
| `skills/imaging-dependency-analysis.md` | Step 4 per component |
| `skills/build-validate-rollback.md` | Step 4 after every fix |

## MCP configuration

Fill in your values directly in `.kiro/settings/mcp.json`:
- `<your-highlight-mcp-host>` — hostname or IP of your Highlight MCP server
- `<your-domain-id>` — your Highlight domain ID (integer)
- `<your-highlight-api-key>` — your Highlight API key
- `<your-imaging-host>:<port>` — hostname and port of your Imaging MCP server
- `<your-imaging-api-key>` — your Imaging API key

## Constraints (always enforced)

- One component per remediation cycle — never batch.
- Build validation is mandatory after every fix.
- Maximum 3 build attempts per component.
- Workspace code is ground truth when Imaging returns no data.
- Do not fix LICENSE-only or OUTDATED-only items unless the user explicitly requests it.
- Do not ask for context values already resolved in Step 1.
