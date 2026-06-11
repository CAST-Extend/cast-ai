# Skill: build-validate-rollback
# Purpose: Reusable build validation, rollback, and fix-attempt loop for one component.
#          Called after every fix is applied during OSS remediation.
# Requires: COMPONENT_NAME, OLD_VERSION, NEW_VERSION, list of modified files
# Max build runs per component: 3

---

## Step 1 — Run build after fix

Run the workspace build command from the project root.
Detect the build tool automatically if not already known:
- `pom.xml` present → `mvn package -q`
- `package.json` present → `npm run build`
- `build.gradle` present → `./gradlew build -q`
- `requirements.txt` / `pyproject.toml` → `pip install -e . && python -m pytest`
- `*.csproj` present → `dotnet build`
- `Cargo.toml` → `cargo build`
- `go.mod` → `go build ./...`

### Build passes
- Mark component result: ✅ Fixed
- Record: `New version: NEW_VERSION`
- Move to next component — do not run further build steps.

### Build fails → go to Step 2

---

## Step 2 — Rollback the fix

### Strategy A — Git restore (try first)
Check if git is available:
```
git status
```
If git is available and the modified files are tracked:
```
git restore <file1> <file2> ...
```
Run build again to confirm clean rollback (this is build run #2):

- **Rollback build passes** → clean state confirmed, go to Step 3.
- **Rollback build fails** → pre-existing build issue detected.
  Stop immediately. Report to user:
  ```
  ⚠️ Pre-existing build failure detected
  ────────────────────────────────────────
  The build was already failing before this change was applied.
  This is not caused by the COMPONENT_NAME upgrade.
  Error: <build error output>
  ────────────────────────────────────────
  Do you want to continue with the remaining components,
  or stop the remediation session?
  ```
  Wait for user response. Do not proceed until answered.

### Strategy B — Marker-based revert (fallback if git unavailable or fails)
Search all modified files for the AI remediation markers:
```
// AI remediation begin — COMPONENT_NAME OLD_VERSION → NEW_VERSION
...changed lines...
// AI remediation end
```
Remove everything between and including the markers.
Restore the original import/dependency declaration manually.
Run build again to confirm clean rollback (build run #2):

- **Rollback build passes** → clean state confirmed, go to Step 3.
- **Rollback build fails** → pre-existing issue. Report same message as Strategy A above.

---

## Step 3 — Report failure and offer fix attempt

Report to user:
```
❌ Build failed after upgrading COMPONENT_NAME OLD_VERSION → NEW_VERSION
────────────────────────────────────────────────────────────────────────
Error type : <compilation error / missing class / API mismatch / other>
File       : <file:line>
Error      : <exact error message>
Likely cause: <version NEW_VERSION changed API X — usage at file:line is incompatible>
────────────────────────────────────────────────────────────────────────
The change has been rolled back. Build is clean.

Do you want me to attempt to fix this build error?
(I will only fix errors directly caused by this version upgrade — no other changes.)
[Yes / No]
```

Wait for explicit user response.

---

## Step 4a — User says No

- Mark component result: ❌ Failed
- Record reason: `<error type> at <file:line>`
- Record proposed steps: `<what to investigate manually>`
- Move to next component.

---

## Step 4b — User says Yes — attempt build fix (build run #3)

Scope: fix ONLY errors directly caused by the COMPONENT_NAME upgrade.
Do not touch any other code, any other component, or any pre-existing issue.

### Diagnose the error
Identify the root cause from the build output:
- **Missing class / method removed** → find replacement API in NEW_VERSION changelog or docs
- **Method signature changed** → update call sites to new signature
- **Package renamed** → update import statements
- **Configuration change required** → update config files
- **Transitive dependency conflict** → resolve version constraint in dependency file

### Apply targeted fix
Wrap fix changes with markers:
```
// AI remediation begin — build fix COMPONENT_NAME OLD_VERSION → NEW_VERSION
<changed lines>
// AI remediation end
```

### Run build (build run #3)

**Build passes:**
- Mark component result: ✅ Fixed (with build fix)
- Record: `Required additional API fix at <file:line>`
- Move to next component.

**Build fails again:**
- Rollback the fix attempt (git restore or marker-based — same strategy as Step 2)
- Mark component result: ❌ Failed (fix attempt unsuccessful)
- Record reason: `<original error> — fix attempt also failed: <second error>`
- Record proposed steps: `Manual investigation required — see errors above`
- Report to user:
  ```
  ❌ Build fix attempt unsuccessful for COMPONENT_NAME
  The fix attempt has been rolled back. Build is clean.
  Moving to next component.
  ```
- Move to next component. No further retries.

---

## Maximum build runs per component: 3
1. After original fix
2. After rollback (confirm clean state)
3. After fix attempt (if user approves)
