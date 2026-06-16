---
name: oss-dependency-prescan
description: Dependency risk scan — run after assessment.
mode: agent
---
# Step 3 — Dependency Risk Pre-scan

Use IMAGING_APP_NAME already resolved in this conversation.
Do not ask the user to re-enter it.
If missing from context: say so and stop — do not guess.

Input: #file:oss_remediation_plan.md

---

## Scope

Run dependency risk scan for ALL components with a CVE flag:

- 🔴 CRITICAL items → scan
- 🟠 HIGH items → scan
- 🟡 MEDIUM CVE items → scan
- ⚠️ LICENSE only items → skip (no CVE, no build risk from vulnerability)
- 📅 OUTDATED only items → skip

---

## For each CVE-flagged component

Follow #file:.github/skills/imaging-dependency-risk.md exactly.
Inputs: IMAGING_APP_NAME, component name, detected version from oss_remediation_plan.md.

Run components in P1 order first, then P2, then P3 CVE.
Collect the output row for each before moving to the next.

---

## Execution order matrix

After all scans complete, assign final execution order using this two-dimension matrix.
Lower number = execute first.

| CVE Severity      | Dependency Risk | Exec Order Group                   |
| ----------------- | --------------- | ---------------------------------- |
| 🔴 CRITICAL       | 🟢 Low          | 1 — safe critical fixes first     |
| 🔴 CRITICAL       | 🟡 Medium       | 2                                  |
| 🔴 CRITICAL       | 🔴 High         | 3 — critical but complex, careful |
| 🟠 HIGH           | 🟢 Low          | 4                                  |
| 🟠 HIGH           | 🟡 Medium       | 5                                  |
| 🟠 HIGH           | 🔴 High         | 6                                  |
| 🟡 MEDIUM CVE     | 🟢 Low          | 7                                  |
| 🟡 MEDIUM CVE     | 🟡 Medium       | 8                                  |
| 🟡 MEDIUM CVE     | 🔴 High         | 9                                  |
| ⚠️ LICENSE only | N/A             | 10 — after all CVE items          |
| 📅 OUTDATED only  | N/A             | 11                                 |

Within the same exec order group, sequence by CALLER_COUNT ascending
(fewest callers first — safer to fix first within the group).

---

## Overwrite oss_remediation_plan.md

Update the file header:

```
| Dependency risk | ✅ Complete — <timestamp> |
```

Replace the Consolidated Remediation Action Plan table with the enriched version:

```
| Exec Order | Priority | Component | Current Ver | Target Ver | CVE Severity | Dep Risk | Callers | Transactions | Action |
|------------|----------|-----------|-------------|------------|--------------|----------|---------|--------------|--------|
| 1 | P1.x | ... | ... | ... | 🔴 CRITICAL | 🟢 Low | 2 | 0 | Upgrade to x.y.z |
| 2 | P1.x | ... | ... | ... | 🔴 CRITICAL | 🟡 Medium | 11 | 2 | Upgrade to x.y.z |
| 3 | P1.x | ... | ... | ... | 🔴 CRITICAL | 🔴 High | 34 | 7 | Upgrade — confirm blockers in Step 4 |
...
```

Do not change any other section of the file — only the header status line
and the Consolidated Action Plan table.

---

## Summary to user after overwrite

```
✅ Dependency pre-scan complete
─────────────────────────────────────────────────
Components scanned  : <count>
🔴 High dep risk    : <count>
🟡 Medium dep risk  : <count>
🟢 Low dep risk     : <count>
Skipped (no CVE)    : <count>
─────────────────────────────────────────────────
oss_remediation_plan.md updated with final execution order.
Ready for /oss-remediation
```
