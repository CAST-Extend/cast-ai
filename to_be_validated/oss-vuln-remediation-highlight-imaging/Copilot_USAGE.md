# CAST OSS Remediation Copilot

---

## What's included

```
.github/
├── copilot-instructions.md       ← agent behaviour (auto-loaded by Copilot)
├── agent.md                      ← AI assistant context: field dictionary & tool catalog
├── AIAssistant-context.json      ← machine-readable version of agent.md
├── skills/
│   ├── highlight-data-fetch.md        ← reusable Highlight fetch sequence
│   ├── highlight-app-resolver.md      ← Highlight app ID resolution (4 strategies)
│   ├── imaging-app-resolver.md        ← Imaging app ID resolution (4 strategies)
│   └── imaging-dependency-analysis.md ← full blast radius lookup for one OSS component
└── prompts/
    ├── app-resolver.prompt       ← Step 1: resolve app IDs once per session
    ├── oss-assessment.prompt     ← Step 2: scan → oss_remediation_plan.md
    └── oss-remediation.prompt    ← Step 3: fix P1 items one by one
.vscode/
├── mcp.json                      ← MCP server connections
└── tasks.json                    ← command palette shortcuts (optional)
```

---

## Setup

### Prerequisites

- VS Code with GitHub Copilot and Copilot Chat extensions (latest)
- Copilot agent mode enabled: VS Code Settings → search `github.copilot.chat.agent` → enable
- CAST Highlight API key and MCP server URL
- CAST Imaging API key and imaging-services host URL (port 8090 default)
- CAST Imaging 3.5.3-funcrel or later · MCP Server 1.2.0-funcrel or later

### 1. Copy files into your project

Copy the `.github/` and `.vscode/` folders into your project root and commit.
Every team member gets the toolset on `git pull`.

> **If you already have these files in your workspace**, do not overwrite them blindly:
>
> | File | Action if it already exists |
> |------|-----------------------------|
> | `.github/copilot-instructions.md` | **Append** the CAST sections to your existing file — do not replace it |
> | `.github/agent.md` | **Append** or merge the CAST tool catalog into your existing file |
> | `.vscode/mcp.json` | **Add** the `cast-highlight` and `imaging` server entries to your existing JSON object |
> | `.vscode/tasks.json` | **Add** the three CAST task entries to your existing `tasks` array |
> | `.github/skills/` and `.github/prompts/` | These are new folders — copy freely if they do not exist yet |

### 2. Set your Imaging URL in mcp.json

Open `.vscode/mcp.json` and replace:

```
http://<your-imaging-services-host>:8090/mcp/
```

with your actual CAST Imaging host and port. Commit this change.

### 3. Set your Highlight MCP URL in mcp.json

```
CAST_HIGHLIGHT_MCP_URL=https://your-highlight-mcp-server/mcp
```

### 4. Connect MCP servers in VS Code

Open Copilot Chat → switch to **Agent** mode → click the tools icon → confirm
`cast-highlight` and `imaging` are listed. You will be prompted for API keys
on first use each session.

---

## Prompts

Run all three steps in a **single Copilot Chat session in Agent mode**.
Only change `YourAppName` in Step 1 — Steps 2 and 3 need no changes.

> Steps 2 and 3 read the app name and IDs from conversation context set by Step 1.
> If you open a new chat session, run Step 1 again before continuing.

---

### Option 1 — Reference prompt files (quickest)

Paste each line directly into Copilot Chat. The agent loads the full prompt from the file automatically.

**Step 1** — change `YourAppName`, then send:
```
#file:.github/prompts/app-resolver.prompt
APP_NAME: "YourAppName"
```

Confirm the values shown, then send Step 2.

**Step 2** — paste as-is:
```
#file:.github/prompts/oss-assessment.prompt
```

When `oss_remediation_plan.md` appears in the workspace, send Step 3.

**Step 3** — paste as-is:
```
#file:.github/prompts/oss-remediation.prompt
```

---

### Option 2 — Paste full prompts manually

Use this if you cannot reference files from chat, or want to inspect/edit the prompt before sending.

#### Step 1 — Resolve app identity
*Change `YourAppName` to your app. Paste into Copilot Chat.*

```
# Step 1 — Resolve App Identity
APP_NAME: "YourAppName"

## Part A — CAST Highlight
Follow #file:.github/skills/highlight-app-resolver.md exactly.
Store result as: HIGHLIGHT_NAME (string) and HIGHLIGHT_APP_ID (integer).

## Part B — CAST Imaging
Call `applications` filtered by HIGHLIGHT_NAME.
If no match: try normalised → token search → workspace fallback
(pom.xml artifactId / package.json name / build.gradle rootProject.name / *.csproj AssemblyName).
Store result as: IMAGING_APP_ID.

## Confirm with user — then store in conversation context
Print and wait for confirmation:
  APP_NAME         : YourAppName
  HIGHLIGHT_NAME   : <resolved>
  HIGHLIGHT_APP_ID : <integer>
  IMAGING_APP_ID   : <id>

Once confirmed, these values are set for the rest of this conversation.
Do not ask for them again. If a subsequent prompt needs them and they are
missing, say so and stop — do not guess.
```

Confirm the values shown, then paste Step 2.

#### Step 2 — OSS Assessment
*Paste as-is — no changes needed.*

```
# Step 2 — OSS Assessment

Use APP_NAME, HIGHLIGHT_NAME, and HIGHLIGHT_APP_ID already resolved
in this conversation. Do not ask the user to re-enter them.
If any are missing from context, say so and stop — do not guess.

Follow #file:.github/skills/highlight-data-fetch.md exactly for Steps 0 and 1.

Flag each component:
- 🔴 CRITICAL — CVSS >= 9 or KEV
- 🟠 HIGH — CVSS 7–8.9
- 🟡 MEDIUM — CVSS 4–6.9
- ⚠️ LICENSE — GPL, AGPL, LGPL, unknown
- 📅 OUTDATED — newer stable version exists, no CVE

Prioritise: P1 = CRITICAL · P2 = HIGH · P3 = rest
nature=third_parties returns safe versions directly — use them.

Write oss_remediation_plan.md:
Header: snapshot date · snapshot label · report generated · source: live scan
Sections: Summary table · P1 · P2 · P3 · Clean components
Per component: flags · CVEs + CVSS · nearest safe · latest safe · action.
```

When `oss_remediation_plan.md` appears in the workspace, paste Step 3.

#### Step 3 — P1 Remediation
*Paste as-is — no changes needed.*

```
# Step 3 — OSS Remediation — P1 only

Use APP_NAME, HIGHLIGHT_NAME, HIGHLIGHT_APP_ID, and IMAGING_APP_ID
already resolved in this conversation. Do not ask the user to re-enter them.
If any are missing from context, say so and stop — do not guess.

Input: #file:oss_remediation_plan.md

Pre-flight:
- mcp_highlight_get_application_info name=HIGHLIGHT_NAME — must return results.
- Imaging applications filtered by IMAGING_APP_ID — must match.
If either fails: stop and report — do not proceed.

Per P1 item (one at a time, P1.1 then P1.2 etc.):
1. Query Imaging with IMAGING_APP_ID:
   packages · objects (name filter) · object_details inward + outward
   transactions_using_object · quality_insights focus cve
2. Cross-validate with workspace: pom.xml / package.json / build.gradle / *.csproj
   Workspace differs from Imaging — workspace wins, note discrepancy.
   Never skip if Imaging returns no results.
3. Break risk found — note, propose resolution, confirm before proceeding.
4. Apply fix (nearest safe). Use latest safe only if nearest breaks a dependency.
5. Wrap changes:
   // AI remediation begin — <component> <old_version> to <new_version>
   // AI remediation end
6. Run build. Pass — next. Fail — revert, log reason, skip.
7. Output completion summary table after all P1 items.

Never: re-ask for IDs · fix P2/P3 · batch changes · skip revert on fail.
Begin with P1.1.
```

---

### Option 3 — VS Code tasks

Run from the command palette in the **same Copilot Chat session**. Only Step 1 asks for the app name.

```
Ctrl+Shift+P  →  Tasks: Run Task  →  CAST: 1 — Resolve App Identity   (enter app name here only)
Ctrl+Shift+P  →  Tasks: Run Task  →  CAST: 2 — OSS Assessment
Ctrl+Shift+P  →  Tasks: Run Task  →  CAST: 3 — OSS Remediation (P1)
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| App not found in Step 1 | Run `mcp_highlight_list_applications` in chat to browse and find the exact name |
| Imaging app not found | Check app name in CAST Imaging portal. Verify tenant/domain in mcp.json |
| Step 2 or 3 says values missing from context | Session was reset — run Step 1 again in the current chat |
| MCP server shows red in tools panel | Check URL in mcp.json and .env file. Re-enter API key when prompted |
| oss_remediation_plan.md not created | Check chat for errors — usually an MCP connection or auth issue |
| Report shows old data | Check Highlight snapshot date in report header — trigger a new Highlight scan if stale |
| Build not running in Step 3 | Confirm a build script exists at workspace root (mvn package, npm run build, etc.) |
| Single-tenant Imaging | Remove the x-user-tenant line from .vscode/mcp.json headers |
