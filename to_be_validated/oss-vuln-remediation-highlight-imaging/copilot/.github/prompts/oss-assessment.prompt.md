---
name: oss-assessment
description: OSS vulnerability scan → oss_remediation_plan.md
mode: agent
---
# Step 2 — OSS Vulnerability Assessment

Use HIGHLIGHT_NAME and HIGHLIGHT_APP_ID already resolved in this conversation.
Do not ask the user to re-enter them.
If missing from context: say so and stop — do not guess.

Follow #file:.github/skills/highlight-data-fetch.md exactly for Steps 1 and 2.

---

## Flag each component (apply all that are true)

- 🔴 CRITICAL — CVSS ≥ 9 or KEV
- 🟠 HIGH — CVSS 7–8.9, no KEV
- 🟡 MEDIUM — CVSS 4–6.9
- ⚠️ LICENSE — GPL, AGPL, LGPL, unknown
- 📅 OUTDATED — newer stable version exists, no CVE

A component can carry multiple flags (e.g. 🔴 CRITICAL + ⚠️ LICENSE).

---

## Initial prioritization (CVE severity only — dependency risk added in Step 3)

- P1 = any 🔴 CRITICAL
- P2 = any 🟠 HIGH, no CRITICAL
- P3 CVE = any 🟡 MEDIUM CVE
- P3 License = ⚠️ LICENSE risk only, no CVE
- P3 Outdated = 📅 OUTDATED only, no CVE or license flag

`nature=third_parties` returns nearest safe and latest safe versions directly — use them.

---

## Write oss_remediation_plan.md in workspace root

```md
# OSS Remediation Plan — <HIGHLIGHT_NAME>

| | |
|---|---|
| Highlight snapshot date | <lastAnalysisDate> |
| Snapshot label | <snapshotLabel> |
| Report generated | <now> |
| Source | CAST Highlight MCP — live scan, no cache |
| Dependency risk | ⏳ Pending — run /oss-dependency-prescan |

---

## Summary

| Severity | Count |
|----------|-------|
| 🔴 Critical | |
| 🟠 High | |
| 🟡 Medium CVE | |
| ⚠️ License risk | |
| 📅 Outdated | |
| ✅ Clean | |
| Total OSS components | |

| Priority tier | Count |
|---|---|
| P1 (CRITICAL) | |
| P2 (HIGH) | |
| P3 CVE (MEDIUM) | |
| P3 License | |
| P3 Outdated | |

---

## P1 — Critical (act immediately)

### P1.1 — <component>@<current_version>
**Flags:** 🔴 CRITICAL
- License: ...
- CVEs: CVE-XXXX-XXXX · CVSS X.X · KEV: yes/no
- Nearest safe version: x.y.z
- Latest safe version: x.y.z
- Remediation: upgrade | replace | isolate

[Repeat for each P1 item]

---

## P2 — High
[Same structure as P1]

---

## P3 — Medium CVE
[Same structure]

---

## P3 — License risk only
[Component · License · Risk reason · Action]

---

## P3 — Outdated only
[Component · Current · Latest stable · Action]

---

## Clean components

| Component | Version | License |
|-----------|---------|---------|

---

## Consolidated Remediation Action Plan

> ⚠️ Execution order below is based on CVE severity only.
> Run /oss-dependency-prescan to enrich with dependency risk and get final execution order.

| Exec Order | Priority | Component | Current Ver | Target Ver | CVE Severity | Dep Risk | Callers | Transactions | Action |
|------------|----------|-----------|-------------|------------|--------------|----------|---------|--------------|--------|
| TBD | P1.1 | ... | ... | ... | 🔴 CRITICAL | ⏳ Pending | — | — | Upgrade |
| TBD | P2.1 | ... | ... | ... | 🟠 HIGH | ⏳ Pending | — | — | Upgrade |
| TBD | P3.1 | ... | ... | ... | 🟡 MEDIUM | ⏳ Pending | — | — | Upgrade |
| — | P3.x | ... | ... | N/A | ⚠️ LICENSE | N/A | — | — | Review license |
| — | P3.x | ... | ... | ... | 📅 OUTDATED | N/A | — | — | Upgrade |
```
