---
name: oss-remediation
description: Execute P1–P3 remediation with build validation.
mode: agent
---
# Step 4 — OSS Remediation

Use HIGHLIGHT_NAME, HIGHLIGHT_APP_ID, and IMAGING_APP_NAME already
resolved in this conversation. Do not ask the user to re-enter them.
If missing from context: say so and stop — do not guess.

Input: #file:oss_remediation_plan.md

---

## Pre-flight checks

1. `get_application_info` name=HIGHLIGHT_NAME → must return results.
2. `stats` with `application: IMAGING_APP_NAME` → must return non-empty result.
3. Check oss_remediation_plan.md header — Dependency risk field must show ✅ Complete.
   If ⏳ Pending: stop, ask user to run /oss-dependency-prescan first.

If checks 1 or 2 fail: stop and report to user — do not proceed.

---

## Per component — work in Exec Order from Consolidated Action Plan

One component at a time. Never batch.

### A — Full Imaging blast radius analysis

Follow #file:.github/skills/imaging-dependency-analysis.md exactly.
Inputs: IMAGING_APP_NAME, component name, detected version from plan.

### B — Cross-validate with workspace code

Search import statements and dependency declarations:
pom.xml · package.json · requirements.txt · build.gradle · build.gradle.kts ·
*.csproj · go.mod · Gemfile · Cargo.toml

Check lock files — must be updated as part of any fix:
package-lock.json · yarn.lock · poetry.lock · Pipfile.lock ·
gradle.lockfile · Gemfile.lock

Workspace differs from Imaging → workspace wins, note discrepancy.
Never skip if Imaging returns no results — absence ≠ unused.

### C — Decision gate (from imaging-dependency-analysis skill)

- Blocker present → stop, present full blast radius report to user,
  await explicit confirmation before proceeding.
- No blocker → proceed to fix.
- Usage not locatable in Imaging AND workspace → skip fix,
  mark ⚠️ Skipped — unable to locate usage, flag for manual investigation.

### D — Apply fix

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

### E — Build validation and rollback

Follow #file:.github/skills/build-validate-rollback.md exactly.
Inputs: COMPONENT_NAME, OLD_VERSION, NEW_VERSION, list of all modified files.

The skill handles:

- Build run after fix
- Rollback (git restore first, marker-based fallback)
- Pre-existing failure detection
- User prompt for fix attempt
- Fix attempt (upgrade-caused errors only)
- Maximum 3 build runs — no infinite loops

---

## After all components are processed — update oss_remediation_plan.md

Append a final section to the file. Do not modify any existing section.

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
  1. <specific action — e.g. "Manually update API call at src/X.java:42 from methodA() to methodB(result)">
  2. <next step>
  3. Re-run /oss-remediation after manual fix

### Skipped components — action required

#### <component> — ⚠️ Skipped (blocker confirmed)
- **Blocker:** <description from blast radius report>
- **Proposed steps:**
  1. <specific action to resolve blocker>
  2. Re-run /oss-remediation after blocker is resolved

#### <component> — ⚠️ Skipped (usage not locatable)
- **Proposed steps:**
  1. Manually verify if component is dynamically loaded or declared outside workspace
  2. If confirmed unused: remove from dependency file
  3. If confirmed used: ensure workspace is complete and re-run /oss-remediation
```

---

## Do not

- Re-ask for any value already in conversation context.
- Fix LICENSE-only or OUTDATED-only items unless explicitly instructed.
- Batch multiple component changes.
- Fix build errors unrelated to the current component upgrade.
- Run more than 3 builds per component.
- Modify any existing section of oss_remediation_plan.md — only append the final summary.
