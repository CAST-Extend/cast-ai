# Skill: oss-vuln-remediation
# Purpose: End-to-end OSS vulnerability assessment and automated remediation
#          using CAST Highlight (CVE data) and CAST Imaging (dependency blast radius).
# MCP servers required: highlight, imaging
# Steps: 4 (must run in order in a single session)

---

## Overview

This skill drives a four-step workflow:

| Step | Slash command          | Purpose                                                      |
|------|------------------------|--------------------------------------------------------------|
| 1    | `/app-resolver`        | Resolve app identity in Highlight + Imaging once per session |
| 2    | `/oss-assessment`      | Highlight scan → `oss_remediation_plan.md`                   |
| 3    | `/oss-dependency-prescan` | Imaging lightweight blast radius → dep risk + exec order  |
| 4    | `/oss-remediation`     | Full blast radius + fix + build validation per component     |

Steps 2–4 read all context values from Step 1. Never ask the user to re-enter them.

---

## Step 1 — Resolve App Identity

**Input:** `APP_NAME` (string, user supplied)

### Part A — CAST Highlight

Follow `skills/highlight-app-resolver.md` exactly.
Store result as: `HIGHLIGHT_NAME` (string) and `HIGHLIGHT_APP_ID` (integer).

### Part B — CAST Imaging

Follow `skills/imaging-app-resolver.md` exactly.
Use `HIGHLIGHT_NAME` as the candidate name input.
Store result as: `IMAGING_APP_NAME` (string).

### Confirm with user — then store in conversation context

Print and wait for user confirmation:

```
✅ App identity resolved
─────────────────────────────────────────
APP_NAME         : <user input>
HIGHLIGHT_NAME   : <resolved exact name>
HIGHLIGHT_APP_ID : <integer>
IMAGING_APP_NAME : <resolved exact name>
─────────────────────────────────────────
Ready for /oss-assessment
```

Once confirmed, all four values are set for the rest of this conversation.
Do not ask for them again. If a subsequent step needs them and they are
missing from context, say so and stop — do not guess.

---

## Step 2 — OSS Vulnerability Assessment

Use `HIGHLIGHT_NAME` and `HIGHLIGHT_APP_ID` already resolved in this conversation.
Do not ask the user to re-enter them.
If missing from context: say so and stop — do not guess.

Follow `skills/highlight-data-fetch.md` exactly for the data fetch sequence.

### Flag each component (apply all that are true)

- 🔴 CRITICAL — CVSS ≥ 9 or KEV
- 🟠 HIGH — CVSS 7–8.9, no KEV
- 🟡 MEDIUM — CVSS 4–6.9
- ⚠️ LICENSE — GPL, AGPL, LGPL, unknown
- 📅 OUTDATED — newer stable version exists, no CVE

A component can carry multiple flags (e.g. 🔴 CRITICAL + ⚠️ LICENSE).

### Initial prioritization (CVE severity only — dependency risk added in Step 3)

- P1 = any 🔴 CRITICAL
- P2 = any 🟠 HIGH, no CRITICAL
- P3 CVE = any 🟡 MEDIUM CVE
- P3 License = ⚠️ LICENSE risk only, no CVE
- P3 Outdated = 📅 OUTDATED only, no CVE or license flag

`nature=third_parties` returns nearest safe and latest safe versions directly — use them.

### Write oss_remediation_plan.md in workspace root

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

---

## Step 3 — Dependency Risk Pre-scan

Use `IMAGING_APP_NAME` already resolved in this conversation.
Do not ask the user to re-enter it.
If missing from context: say so and stop — do not guess.

**Input:** `oss_remediation_plan.md` from Step 2.

### Scope

Run dependency risk scan for ALL components with a CVE flag:

- 🔴 CRITICAL items → scan
- 🟠 HIGH items → scan
- 🟡 MEDIUM CVE items → scan
- ⚠️ LICENSE only items → skip (no CVE, no build risk from vulnerability)
- 📅 OUTDATED only items → skip

### For each CVE-flagged component

Follow `skills/highlight-dependency-risk.md` exactly.
Inputs: `IMAGING_APP_NAME`, component name, detected version from plan.
Run components in P1 order first, then P2, then P3 CVE.
Collect the output row for each before moving to the next.

### Execution order matrix

After all scans complete, assign final execution order using this two-dimension matrix.
Lower number = execute first.

| CVE Severity      | Dependency Risk | Exec Order Group                    |
|-------------------|-----------------|-------------------------------------|
| 🔴 CRITICAL       | 🟢 Low          | 1 — safe critical fixes first      |
| 🔴 CRITICAL       | 🟡 Medium       | 2                                   |
| 🔴 CRITICAL       | 🔴 High         | 3 — critical but complex, careful  |
| 🟠 HIGH           | 🟢 Low          | 4                                   |
| 🟠 HIGH           | 🟡 Medium       | 5                                   |
| 🟠 HIGH           | 🔴 High         | 6                                   |
| 🟡 MEDIUM CVE     | 🟢 Low          | 7                                   |
| 🟡 MEDIUM CVE     | 🟡 Medium       | 8                                   |
| 🟡 MEDIUM CVE     | 🔴 High         | 9                                   |
| ⚠️ LICENSE only   | N/A             | 10 — after all CVE items            |
| 📅 OUTDATED only  | N/A             | 11                                  |

Within the same exec order group, sequence by CALLER_COUNT ascending
(fewest callers first — safer to fix first within the group).

### Update oss_remediation_plan.md

Update the file header:
```
| Dependency risk | ✅ Complete — <timestamp> |
```

Replace the Consolidated Remediation Action Plan table with the enriched version
(exec order, dep risk, callers, transactions filled in).
Do not change any other section of the file.

### Summary to user after update

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

---

## Step 4 — OSS Remediation

Use `HIGHLIGHT_NAME`, `HIGHLIGHT_APP_ID`, and `IMAGING_APP_NAME` already
resolved in this conversation. Do not ask the user to re-enter them.
If missing from context: say so and stop — do not guess.

**Input:** `oss_remediation_plan.md` from Step 3.

### Pre-flight checks

1. `get_application_info` name=`HIGHLIGHT_NAME` → must return results.
2. `stats` with `application: IMAGING_APP_NAME` → must return non-empty result.
3. Check `oss_remediation_plan.md` header — Dependency risk field must show ✅ Complete.
   If ⏳ Pending: stop, ask user to run `/oss-dependency-prescan` first.

If checks 1 or 2 fail: stop and report to user — do not proceed.

### Per component — work in Exec Order from Consolidated Action Plan

**One component at a time. Never batch.**

#### A — Full Imaging blast radius analysis

Follow `skills/imaging-dependency-analysis.md` exactly.
Inputs: `IMAGING_APP_NAME`, component name, detected version from plan.

#### B — Cross-validate with workspace code

Search import statements and dependency declarations:
`pom.xml` · `package.json` · `requirements.txt` · `build.gradle` · `build.gradle.kts` ·
`*.csproj` · `go.mod` · `Gemfile` · `Cargo.toml`

Check lock files — must be updated as part of any fix:
`package-lock.json` · `yarn.lock` · `poetry.lock` · `Pipfile.lock` ·
`gradle.lockfile` · `Gemfile.lock`

Workspace differs from Imaging → workspace wins, note discrepancy.
Never skip if Imaging returns no results — absence ≠ unused.

#### C — Decision gate (from imaging-dependency-analysis skill)

- Blocker present → stop, present full blast radius report to user,
  await explicit confirmation before proceeding.
- No blocker → proceed to fix.
- Usage not locatable in Imaging AND workspace → skip fix,
  mark ⚠️ Skipped — unable to locate usage, flag for manual investigation.

#### D — Apply fix

Use nearest safe version from plan.
Use latest safe only if nearest safe breaks a confirmed dependency.

Update all affected files:
- Dependency declaration file(s)
- Lock file(s) — run package manager update command if needed
- Any import or API call that changed between versions

Wrap all modified lines:

```
// AI remediation begin — <component> <old_version> → <new_version>
<changed lines>
// AI remediation end
```

#### E — Build validation and rollback

Follow `skills/build-validate-rollback.md` exactly.
Inputs: `COMPONENT_NAME`, `OLD_VERSION`, `NEW_VERSION`, list of all modified files.

### After all components — append Final Remediation Summary to oss_remediation_plan.md

Do not modify any existing section — append only.

```md
---

## Final Remediation Summary — <HIGHLIGHT_NAME>

Completed: <timestamp>

### Results

| Exec Order | Component | Old Ver | New Ver | Dep Risk | Result | Build Runs | Notes |
|------------|-----------|---------|---------|----------|--------|------------|-------|
| 1 | ... | ... | ... | 🟢 Low | ✅ Fixed | 1 | |
| 2 | ... | ... | ... | 🟡 Medium | ✅ Fixed (with build fix) | 3 | Required API update at src/X.java:42 |
| 3 | ... | ... | ... | 🔴 High | ❌ Failed | 3 | Build fix attempt unsuccessful |
| 4 | ... | ... | ... | 🟢 Low | ⚠️ Skipped | 0 | Blocker confirmed by user |
| 5 | ... | ... | ... | 🟡 Medium | ⚠️ Skipped | 0 | Usage not locatable |

### Totals

| Status | Count |
|--------|-------|
| ✅ Fixed | |
| ✅ Fixed (with build fix) | |
| ❌ Failed | |
| ⚠️ Skipped | |
| Total processed | |

### Failed components — proposed next steps

#### <component>@<new_version> — ❌ Failed
- **Error:** <exact build error>
- **Root cause:** <diagnosis>
- **Proposed steps:**
  1. <specific action>
  2. Re-run /oss-remediation after manual fix

### Skipped components — action required

#### <component> — ⚠️ Skipped (blocker confirmed)
- **Blocker:** <description>
- **Proposed steps:**
  1. <specific action to resolve blocker>
  2. Re-run /oss-remediation after blocker is resolved

#### <component> — ⚠️ Skipped (usage not locatable)
- **Proposed steps:**
  1. Manually verify if component is dynamically loaded or declared outside workspace
  2. If confirmed unused: remove from dependency file
  3. If confirmed used: ensure workspace is complete and re-run /oss-remediation
```

### Do not

- Re-ask for any value already in conversation context.
- Fix LICENSE-only or OUTDATED-only items unless explicitly instructed.
- Batch multiple component changes.
- Fix build errors unrelated to the current component upgrade.
- Run more than 3 builds per component.
- Modify any existing section of `oss_remediation_plan.md` — only append the final summary.
