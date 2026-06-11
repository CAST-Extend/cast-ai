---
name: oss-dependency-prescan
description: Imaging dependency risk scan — run after oss-assessment
mode: agent
---
# Step 3 — Dependency Risk Pre-scan

Use IMAGING_APP_NAME already resolved in this conversation.
Do not ask the user to re-enter it.
If missing from context: say so and stop — do not guess.

Input: `oss_remediation_plan.md` (written by Step 2 in workspace root).

Follow `skills/oss-vuln-remediation.md` **Step 3** exactly.

Sub-skills called by this step:
- `skills/highlight-dependency-risk.md` — lightweight blast radius per component
