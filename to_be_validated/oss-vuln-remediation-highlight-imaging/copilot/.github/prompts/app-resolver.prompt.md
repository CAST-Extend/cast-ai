---
name: app-resolver
description: Resolve app identity in CAST Highlight + Imaging — run this first
mode: agent
variables:
  - name: APP_NAME
    description: "Exact or partial application name to resolve"
    required: true
---
# Step 1 — Resolve App Identity

APP_NAME: "{{APP_NAME}}"

Follow `skills/oss-vuln-remediation.md` **Step 1** exactly.

Sub-skills called by this step:
- `skills/highlight-app-resolver.md` — Highlight name + integer ID resolution
- `skills/imaging-app-resolver.md`   — Imaging name resolution

Store results as HIGHLIGHT_NAME, HIGHLIGHT_APP_ID, and IMAGING_APP_NAME
in conversation context. All subsequent steps read from context — do not ask again.
