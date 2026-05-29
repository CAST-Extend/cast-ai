# Skill: workspace-dependency-analysis
# Purpose: Reusable workspace code search sequence for a single OSS component identified by Highlight.
#          Produces a structured blast radius report that drives the fix decision.
# Requires: COMPONENT_NAME (string), COMPONENT_VERSION (string)
# Called by: oss-remediation.prompt — once per P1 component before any code change.

---

## Step 1 — Locate component in manifest files

Search workspace manifest files for COMPONENT_NAME:
- `pom.xml` → search for `<artifactId>` matching COMPONENT_NAME inside a `<dependency>` block
- `package.json` / `package-lock.json` → search dependencies/devDependencies for COMPONENT_NAME
- `requirements.txt` / `pyproject.toml` / `setup.py` → search for COMPONENT_NAME
- `build.gradle` / `build.gradle.kts` → search dependency strings for COMPONENT_NAME
- `*.csproj` → search `<PackageReference Include="COMPONENT_NAME">`

Record every manifest file path that declares this component and the declared version.
These are the files to modify for remediation.

If not found in any manifest:
- Search all source files for the component name as a string.
- Record "component not found in manifests — may be a transitive dependency".
- Do NOT treat absence as "unused" — transitive dependencies are still real attack surface.

---

## Step 2 — Find import statements and usages in source code

Search source files for import/usage patterns of COMPONENT_NAME.

**Java / Kotlin** — grep for the component's base package prefix:
- `import <group_package>` (e.g. `import org.springframework.cloud.config` for spring-cloud-starter-config)
- Map component artifact name → known base package if not obvious

**JavaScript / TypeScript:**
- `require('COMPONENT_NAME')` or `import ... from 'COMPONENT_NAME'`

**Python:**
- `import COMPONENT_NAME` or `from COMPONENT_NAME import`

**C#:**
- `using COMPONENT_NAMESPACE;`

Record all files containing import/usage statements. Store as SOURCE_FILES_AFFECTED list.

---

## Step 3 — Identify specific APIs and classes used

For each file in SOURCE_FILES_AFFECTED, scan for:
- Class names instantiated from the component
- Method calls on component objects
- Annotations or decorators sourced from the component
- Configuration keys, property names, or bean names tied to the component

Record each unique API element in the form `ClassName.methodName()` or annotation `@AnnotationName`.
This determines whether the target safe version's API is backward-compatible.

---

## Step 4 — Assess caller impact (break risk)

For each SOURCE_FILE_AFFECTED:
- Count how many locations use the component (import count + call site count)
- Flag files that are entry points: controllers, REST endpoints, message listeners, scheduled jobs
- Flag files that cross module boundaries: shared utility classes, API contracts, public interfaces

Classify overall break risk:

| Risk | Condition |
|------|-----------|
| HIGH | Entry point files affected, or known API-breaking change between current → target version |
| MEDIUM | Internal implementation files only, no entry point exposure |
| LOW | Only manifest/config files affected; no runtime code usage found |

---

## Step 5 — Produce blast radius report

Output the following before proceeding to fix:

```
## Blast Radius — COMPONENT_NAME COMPONENT_VERSION

### Manifest files to modify
- <file path> (line <N>) — declared version: <x.y.z>

### Source files affected
- <file path> — imports: <package> — call sites: <count>

### APIs in use from this component
- <ClassName.method()> used in <file>

### Break risk: HIGH / MEDIUM / LOW
<Justification — e.g., "2 REST controllers import XyzClient; target version renames to XyzV2Client">

### Decision
- No blocker → proceed to fix.
- Blocker present → stop, present report to user, await explicit confirmation.
- Usage not locatable → skip fix, flag for manual investigation, move to next P1 item.
```

---

## Decision gate

- **Blocker present** (HIGH risk with confirmed API-breaking change) → stop, show blast radius report to user, await explicit confirmation before applying any change.
- **No blocker** → proceed to apply fix.
- **Usage not locatable in workspace** → skip fix, record "manual investigation required", move to next P1 item.
