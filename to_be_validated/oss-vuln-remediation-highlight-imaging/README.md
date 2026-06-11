# OSS Vulnerability Remediation — Highlight + Imaging

## Executive Summary

This asset helps developers accelerate OSS vulnerability remediation at scale by using CAST in AI-assisted four-step workflow that detects, prioritizes, and auto-remediates OSS vulnerabilities in application codebases using CAST Highlight for CVE intelligence and CAST Imaging for dependency blast radius analysis. The agent works one component at a time, validates each fix with a real build, and rolls back automatically on failure.

## CAST Use Case

Risk reduction

## Target Users

- Application security engineers triaging OSS CVEs across a portfolio
- Development teams responsible for patching vulnerable dependencies
- DevSecOps teams embedding automated remediation into sprint workflows
- CAST practitioners demonstrating AI-assisted remediation to customers

## Benefits

- Improved accuracy
- Faster remediation
- Effort reduction

## Asset Status

Production-tested for Copilot, pilot-ready for the rest

## Version

1.0.1 - Added support for various AI IDE/coding assistant

## Solution Description

This solution is a skills package imported into an AI IDE. It allows developers to identify upgrade paths, assess downstream impact, and leverage an LLM to safely remediate OSS risk within an application. Changes are automatically validated through a background build, with failed changes rolled back.

The workflow is driven by two CAST MCP servers:

- **CAST Highlight MCP** — provides live CVE scan results, CVSS scores, KEV flags,
  license compliance data, and safe version recommendations for all OSS components.
- **CAST Imaging MCP** — provides structural dependency analysis: call sites,
  upstream callers, downstream callees, impacted transactions, and source file chains.

The four steps are:

1. **App resolver** — resolves the exact application name and integer ID in Highlight,
   and the exact name in Imaging, using a multi-strategy fallback approach.
   All downstream steps read these values from session context.
2. **OSS assessment** — forces a fresh Highlight scan, fetches CVEs and component data,
   flags each component (CRITICAL / HIGH / MEDIUM / LICENSE / OUTDATED), and writes a
   prioritized `oss_remediation_plan.md` to the workspace root.
3. **Dependency pre-scan** — runs a lightweight Imaging blast radius scan for every
   CVE-flagged component (caller count, transaction count, boundary crossing).
   Assigns Dependency Risk (Low/Medium/High) and rewrites the plan with a two-dimension
   execution order matrix (CVE severity × dependency risk).
4. **OSS remediation** — processes each component in execution order:
   full blast radius analysis → workspace cross-validation → decision gate
   (stops for user confirmation if a blocker is detected) → applies fix with
   AI remediation markers → build validation → rollback on failure → optional
   fix attempt for upgrade-caused API changes → appends Final Remediation Summary.

## Outputs Produced

- Remediated code
- Detailed report of changes made, rollback actions, and suggested next steps

| Output | Description |
|--------|-------------|
| `oss_remediation_plan.md` | Assessment report with CVE flags, priorities, dep risk scores, execution order, and Final Remediation Summary |
| Modified dependency files | `pom.xml`, `package.json`, `build.gradle`, `*.csproj`, `go.mod`, etc. updated to safe versions |
| Modified lock files | `package-lock.json`, `yarn.lock`, `poetry.lock`, etc. updated in sync |
| AI remediation markers | Every changed line wrapped in `// AI remediation begin/end` for traceability |

## Workflow

```
Step 1  app-resolver              Resolve app identity in Highlight + Imaging
           │
           ▼
Step 2  oss-assessment            Highlight scan → oss_remediation_plan.md
           │
           ▼
Step 3  oss-dependency-prescan    Imaging blast radius → dep risk + execution order
           │
           ▼
Step 4  oss-remediation           Fix · build · rollback · retry · final report
```

All steps run in a **single AI session**. Context from Step 1 is used automatically
by Steps 2–4 — the app name is entered only once.

## Pre-requisites

- CAST Imaging
- CAST Highlight
- CAST MCP enabled
- AI IDE/coding assistant (GitHub Copilot, Cursor, Claude Code, Gemini Code Assist, Amazon Kiro, etc.)
- Access to an LLM/provider model (GPT, Claude, Gemini, etc.)

## Limitations

- Human required to issue prompts and code commit/review
- Requires CAST scan completeness
- Dependent on technology support coverage

## Assets / Package Contents

```
skills/
├── oss-vuln-remediation.md         Core four-step workflow (provider-agnostic)
├── highlight-app-resolver.md       Highlight name + integer ID resolution
├── highlight-data-fetch.md         Data freshness + CVE-first fetch sequence
├── highlight-dependency-risk.md    Lightweight blast radius → risk score
├── imaging-app-resolver.md         Imaging name resolution via stats
├── imaging-dependency-analysis.md  Full blast radius + decision gate
└── build-validate-rollback.md      Build · rollback · fix-attempt loop

copilot/
├── .github/
│   ├── agent.md                    Highlight field dictionary + tool catalog
│   ├── copilot-instructions.md     Workspace-level agent instructions
│   └── prompts/
│       ├── app-resolver.prompt.md      Step 1 prompt
│       ├── oss-assessment.prompt.md    Step 2 prompt
│       ├── oss-dependency-prescan.prompt.md  Step 3 prompt
│       └── oss-remediation.prompt.md   Step 4 prompt
claude/
└── .claude/
    ├── commands/
    │   ├── app-resolver.md
    │   ├── oss-assessment.md
    │   ├── oss-dependency-prescan.md
    │   └── oss-remediation.md
    └── skills/oss-vuln-remediation/
        └── SKILL.md                MCP config + behavioural rules

cursor/
└── .cursor/rules/
    └── oss-vuln-remediation.mdc    Project rule with MCP config

gemini/
└── .gemini/
    ├── settings.json               MCP server config
    └── styleguide.md               Workflow instructions for Gemini CLI

kiro/
└── .kiro/
    ├── settings/mcp.json           MCP server config
    └── steering/oss-vuln-remediation.md  Steering instructions

Copilot_USAGE.md                    Copilot-specific setup, prompt instructions, and troubleshooting

README.md                           This file
