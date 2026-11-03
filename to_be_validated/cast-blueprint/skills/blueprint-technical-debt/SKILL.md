---
name: blueprint-technical-debt
description: Turn CAST Imaging quality findings into a business-facing technical debt assessment — debt density by business domain, a prioritized register (TD-##) with impact/effort/priority and quick wins, an impact × effort view, and an Open-source vulnerabilities tab that groups every CVE by component into go-forward actions (remove, retire through the target state, upgrade in place, rebuild on a supported runtime, verify first) linked to modernization work packages — with Markdown and Jira CSV export. Use this skill whenever the user asks about technical debt, ISO 5055 / quality findings, cloud blockers, CVEs or open-source vulnerabilities and what to do about them, or the Technical Debt section of a CAST Blueprint.
---

# Blueprint — Technical Debt

## Inputs (CAST Imaging)
- `applications_quality_insights` (summary counts; check `cve_comment` — 0 CVEs often means "not configured").
- Cypher: `(object)-[:MANIFESTS]->(Insight)` grouped by `Insight.Type` (Detection Pattern = ISO 5055, CloudReady/Container – Blocker/Booster, Green – Blocker, Structural Flaw, Vulnerability) and by domain (tag, namespace, or program → domain). Also `Insight.Name` with distinct object counts for the rule list (cheaper than `quality_insights` descriptions).
- `quality_insights(nature=cve)` per app (ids, criticality, description) and `packages` (Version, SaferClosestVersion, SafestVersion, UsingObjectCount, licence).
- Upstream: clarifications (C-##) for correctness debt; target-state decisions and plan work packages for the CVE actions.

## Tabs
1. **Where the debt is** — per domain: quality / efficiency / security or structural / cloud, total, **density** (per 100 members, or per program for COBOL), revenue/money-path badge. Boosters are not debt. Report UI layers (admin console, storefront) separately when they dominate.
2. **Debt register** — 14–18 items `TD-##`: `[id, theme, title, what (extracted), why (inferred), impact H/M/L, effort S/M/L, priority P1–P3, quickWin, domains[], evidenceIds[], clarifications[]]`. Themes: Security, Correctness, Reliability, Cloud readiness, Maintainability, Efficiency, Compliance, Architecture, Operations.
3. **Open-source vulnerabilities** — every CVE mapped to its component (packages + CVE descriptions; components missing from the package list are bundled, transitive or runtime). Each component gets **one action**: Remove (not needed / no fix), Retire through the target state (don't upgrade what the target replaces — e.g. in-process cache, self-hosted DB server advisories), Upgrade in place, Rebuild on a supported runtime (OpenSSL, Node, .NET runtime), Verify first (disputed, name matches like "Django"/"healthchecks", advisories for old major versions). Headline: **how many CVEs go away without a library upgrade**. Each action links to the Plan work package that delivers it — no separate CVE project. Close with prevention: dependency-scanning gate in CI, SBOM per release, automated update PRs behind the regression suite, licence policy, re-analyse per release.
4. **Quick wins vs. structural** — impact × effort matrix + quick-win table; structural items feed Target State and the Plan.

## Output contract
Data: `DEBT_DOMS`, `DEBT`, `OSS` (`[component, app, version, cves[[id,sev]], fix, usingObjects|null, action, wp, note]`), `OSS_ACT`, `SEV`. Functions: `techDebt()`, `debtWhere()`, `debtItem()`, `debtRegister()`, `debtOss()`, `debtPlan()`, `mdDebt()`, `csvDebt()`, `mdOss()`. Export (`DEBT_FILES`): `debt/technical-debt-register.md`, `debt/jira-import.csv`, `debt/open-source-remediation.md`. Verify counts by script (e.g. sum of CVEs by severity must equal Imaging's totals).
