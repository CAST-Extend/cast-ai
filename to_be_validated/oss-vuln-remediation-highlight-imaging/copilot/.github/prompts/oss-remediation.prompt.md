---
name: oss-remediation
description: Full blast radius + fix + build validation per component
mode: agent
---
# Step 4 — OSS Remediation

Use HIGHLIGHT_NAME, HIGHLIGHT_APP_ID, and IMAGING_APP_NAME already
resolved in this conversation. Do not ask the user to re-enter them.
If missing from context: say so and stop — do not guess.

Input: `oss_remediation_plan.md` — must show Dependency risk ✅ Complete.
If still ⏳ Pending: stop and ask user to run `/oss-dependency-prescan` first.

Follow `skills/oss-vuln-remediation.md` **Step 4** exactly.

Sub-skills called by this step:
- `skills/imaging-dependency-analysis.md` — full blast radius + decision gate
- `skills/build-validate-rollback.md`     — build · rollback · fix attempt loop
