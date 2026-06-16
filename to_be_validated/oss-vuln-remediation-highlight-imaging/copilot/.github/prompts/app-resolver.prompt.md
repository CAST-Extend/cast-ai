---
name: app-resolver
description: Enter applicaiton Name to resolve identity in CAST — run this first
mode: agent
variables:
  - name: APP_NAME
    description: "Exact or partial application name to resolve"
    required: true
---
# Step 1 — Resolve App Identity

APP_NAME: "{{APP_NAME}}"

## Part A — CAST Highlight

Follow #file:.github/skills/highlight-app-resolver.md exactly.
Store result as: HIGHLIGHT_NAME (string) and HIGHLIGHT_APP_ID (integer).

## Part B — CAST Imaging

Follow #file:.github/skills/imaging-app-resolver.md exactly.
Use HIGHLIGHT_NAME as the candidate name input.
Store result as: IMAGING_APP_NAME (string).

## Confirm with user — then store in conversation context

Print and wait for user confirmation:

```
✅ App identity resolved
─────────────────────────────────────────
APP_NAME         : {{APP_NAME}}
HIGHLIGHT_NAME   : <resolved exact name>
HIGHLIGHT_APP_ID : <integer>
IMAGING_APP_NAME : <resolved exact name>
─────────────────────────────────────────
Ready for /oss-assessment
```

Once confirmed, all four values are set for the rest of this conversation.
Do not ask for them again. If a subsequent step needs them and they are
missing from context, say so and stop — do not guess.
