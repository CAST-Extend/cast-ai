# Skill: imaging-app-resolver
# Purpose: Resolve exact app name in CAST Imaging. All downstream Imaging tools accept
#          the app name string as the `application` parameter — no integer ID is used.
# Requires: A candidate name — either APP_NAME (user supplied) or HIGHLIGHT_NAME (already resolved).
# Output: IMAGING_APP_NAME (string)

---

## Resolution steps (stop at first unambiguous match)

### Strategy 1 — Direct validation via stats
Call `stats` with `application: <candidate name>` exactly as supplied by HIGHLIGHT_NAME.

If it returns a non-empty result with a matching `name` field → store the name → go to Confirm.

> Note: the `applications` tool does not support name filtering — do not use it for lookup.

### Strategy 2 — Normalised name via stats
Lowercase the candidate name, strip special characters and extra spaces (keep hyphens/underscores).
Call `stats` with the normalised name.

If it returns a non-empty result → store the returned `name` → go to Confirm.

### Strategy 3 — Name variation via stats
Try common variations of the candidate name:
- Replace hyphens with underscores (and vice versa)
- Try without separators (e.g. `ivratwilioservice`)
Call `stats` with each variation until one returns a non-empty result.

Store the returned `name` → go to Confirm.

### Strategy 4 — Workspace fallback
Scan workspace files for the application identifier:
- `pom.xml` → `<artifactId>` or `<groupId>`
- `package.json` → `"name"`
- `build.gradle` / `settings.gradle` → `rootProject.name`
- `*.csproj` → `<AssemblyName>` or `<RootNamespace>`

Call `stats` with the found value.
If it returns a non-empty result → store the returned `name` → go to Confirm.

### No match
Stop. Report to user:
- Candidate names attempted: [list each]
- Suggest: confirm the exact app name visible in CAST Imaging portal.
Do not proceed. Do not guess an ID.

---

## Confirm

Show the user before proceeding:
```
✅ Imaging app resolved
─────────────────────────────────────────
Candidate name    : <input used>
Resolved name     : <exact name from Imaging>
Resolved via      : Strategy <1/2/3/4>
─────────────────────────────────────────
```

Store resolved `name` as IMAGING_APP_NAME.
IMAGING_APP_NAME (string) must be used as the `application` parameter for all downstream Imaging tool calls.
