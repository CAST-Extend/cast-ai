# CAST OSS Vulnerability Remediation — Gemini CLI Style Guide

This file activates the CAST OSS remediation workflow when using Gemini CLI.
Full workflow logic is defined in `skills/oss-vuln-remediation.md`.

## Workflow

Run the following four steps in order in a single Gemini CLI session.
All context values resolved in Step 1 are retained automatically — do not re-enter them.

### Step 1 — Resolve app identity

```
> Follow skills/oss-vuln-remediation.md Step 1.
  APP_NAME: <your application name>
```

### Step 2 — OSS vulnerability assessment

```
> Follow skills/oss-vuln-remediation.md Step 2.
```

### Step 3 — Dependency risk pre-scan

```
> Follow skills/oss-vuln-remediation.md Step 3.
```

### Step 4 — OSS remediation

```
> Follow skills/oss-vuln-remediation.md Step 4.
```

## MCP server configuration

Fill in your values directly in `.gemini/settings.json`:
- `<your-highlight-mcp-host>` — hostname or IP of your Highlight MCP server
- `<your-domain-id>` — your Highlight domain ID (integer)
- `<your-highlight-api-key>` — your Highlight API key
- `<your-imaging-host>:<port>` — hostname and port of your Imaging MCP server
- `<your-imaging-api-key>` — your Imaging API key

## Behavioural rules

- Always follow the sub-skills exactly — do not invent tool call sequences.
- One component at a time during remediation — never batch.
- Build must run after every fix — never skip.
- Maximum 3 builds per component.
- Workspace code overrides Imaging when the two conflict.
- Never fix LICENSE-only or OUTDATED-only items unless explicitly requested.

## Sub-skill index

| File | Purpose |
|------|---------|
| `skills/highlight-app-resolver.md` | Highlight name + integer ID resolution |
| `skills/highlight-data-fetch.md` | Data freshness + CVE-first fetch |
| `skills/imaging-dependency-risk.md` | Quick blast radius score |
| `skills/imaging-app-resolver.md` | Imaging name resolution |
| `skills/imaging-dependency-analysis.md` | Full blast radius report |
| `skills/build-validate-rollback.md` | Build · rollback · fix-attempt loop |
