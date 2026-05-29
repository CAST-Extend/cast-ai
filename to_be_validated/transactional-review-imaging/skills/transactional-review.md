# @Transactional Usage Review

Detect and report all `@Transactional` annotation usage in a Java application using CAST Imaging. Classifies annotated classes and methods by architectural layer (API, service, repository, ambiguous) and reports self-invocation anti-patterns that silently bypass Spring's AOP proxy.

## Steps

### Step 1: Identify the Application

If the user hasn't specified one, call `mcp__imaging__applications` to list available applications and ask which one to review.

### Step 2: Resolve Source File Paths

Establish the local codebase root, then use it to translate imaging file paths for all `Read` and `Grep` operations.

**A. Establish `local_root`** — resolve in this order, stopping at the first success:
1. **Memory:** check memory for a known local root mapped to this application. If found, use it.
2. **Current directory:** run `Glob **/*.java` from the current working directory. If Java source files are found, treat the current directory as `local_root`.
3. **Ask the user:** if neither memory nor the current directory contains the codebase, ask: *"Please provide the local filesystem path to the source code root for **\<ApplicationName\>** (e.g. `C:\Users\...\shopizer-main`)."* Confirm with `Glob <path>/**/*.java`. Save the confirmed path to memory under this application name.

**B. Translate `filePath` values** — for every imaging object path that needs local access:

| `filePath` format | Action |
|-------------------|--------|
| `§{main_sources}§/<relative>` | Replace `§{main_sources}§` with `local_root`. |
| `§<LISA>§Scr.../<file>` | Decompiled dependency JAR — server-only. **Skip** `Read`/`Grep`; exclude from "File" columns in the report. |
| Absolute path (`/opt/...`, `C:\...`) | Try `Read` directly. If it fails, join with `local_root` as a fallback. |
| `null` | No source — skip. |

> **Test exclusion:** Never read or analyze files under `src/test`, `**/test/**`, or any path containing `/test/`. When using `Grep` or `Glob`, exclude test directories (e.g., `--glob '!**/src/test/**'`). When an MCP result returns a `filePath` containing `/src/test/` or `/test/`, skip it.

### Large Result Caching

When any MCP call returns more than **200 items** (`metadata.total_items > 200`), do **not** keep the full result in the conversation context. Instead:

1. Extract only the fields needed for analysis from each item (at minimum: `id`, `name`, `fullname`, `annotations`, `filePath`, `type`).
2. Write the processed data to a JSON cache file in the current working directory:
   **Filename:** `<app>-transactional-review-<YYYY-MM-DD_HH-mm-ss>.json`
   **Structure:**
   ```json
   {
     "skill": "transactional-review",
     "application": "<app-name>",
     "timestamp": "<YYYY-MM-DDTHH:mm:ss>",
     "queries": {
       "<query-label>": {
         "filter": "<filter-string-used>",
         "total_items": N,
         "items": [
           { "id": "...", "name": "...", "fullname": "...", "annotations": ["..."], "filePath": "...", "type": "..." }
         ]
       }
     }
   }
   ```
3. For subsequent analysis steps, read the cache file with the `Read` tool (using `offset`/`limit` to process in chunks if needed) instead of re-querying the MCP or holding all data in context.
4. At the end of the report, note: `Data cached to: <filename>`.

This applies to all paginated MCP calls. If a result has `metadata.has_next: true`, fetch all pages, merge items, then write the combined result to the cache file.

### Step 3: Fetch all @Transactional Objects

Run the following two queries **in parallel**, reading full content (not count-only):

- All annotated classes: `filters="annotation:contains:Transactional,type:contains:class"`
- All annotated methods: `filters="annotation:contains:Transactional,type:contains:method"`

Paginate if `metadata.has_next: true`.

> **False-positive caveat:** `annotation:contains:Transactional` is a substring match and will also hit `@EnableTransactionManagement` and `@TransactionalEventListener`. After receiving results, post-filter: only keep objects whose `annotations` array contains an entry that is exactly (or starts with) one of:
> - `@Transactional`
> - `@org.springframework.transaction.annotation.Transactional`
> - `@javax.transaction.Transactional`
> - `@jakarta.transaction.Transactional`
>
> Discard everything else as a false positive.

### Step 4: Classify Each Object by Layer

For each class or method retained after step 3, determine its layer using the following rules **in priority order** (first match wins):

**API layer** — any of:
- Class has `@RestController` or `@Controller` in its `annotations`
- Class name contains `Controller` or `Resource` (case-insensitive)

**Service / Business layer** — any of:
- Class has `@Service` or `@Component` in its `annotations` AND name does NOT match Repository/DAO patterns
- Class name contains `Service`, `Business`, `Manager`, `Facade`, `Processor`, `Handler` (case-insensitive)

**Repository / DAO layer** — any of:
- Class has `@Repository` in its `annotations`
- Class name contains `Repository`, `Dao`, `Persistence`, `Store` (case-insensitive)

**Ambiguous** — does not match any of the above rules.

For **methods**: classify based on the parent class (strip the method name suffix from `fullName` to get the class name, then apply the same rules).

### Step 5: Collect Class Names per Layer

For each layer, build the list of distinct class names (or `className.methodName` for method-level annotations) and a count.

### Step 6: Check for Self-Invocation Anti-Pattern

For each confirmed `@Transactional` **method**, call `mcp__imaging__object_details` with `focus=inward` (in parallel for all methods) to get `incoming_calls`. For each caller, check whether the caller belongs to the **same class** as the callee (compare the class prefix of the caller's `fullName` against the callee's class name).

A same-class call is a **self-invocation anti-pattern**: Spring's AOP proxy is bypassed and the `@Transactional` annotation on the called method is silently ignored — it runs within whatever transaction context the caller already has, without applying the callee's own transaction settings (propagation, isolation, `noRollbackFor`, `readOnly`, etc.).

> **How to determine caller class:** strip the method name suffix from the caller's `fullName` (last dot-separated segment) to get the fully-qualified class name, then compare with the callee's class.
>
> If the caller's `fullName` is not available from `incoming_calls`, use `mcp__imaging__object_details` with `focus=intra` on the caller ID to resolve its `fullName`.

Build the list of self-invocation violations: each entry is `callerMethod → calleeMethod` within the same class, plus which `@Transactional` attributes on the callee are bypassed.

### Step 7: Produce the Report

```
## @Transactional Usage Report

### Overview
| Scope | Count |
|-------|-------|
| Classes annotated @Transactional | N |
| Methods annotated @Transactional | N |
| Total @Transactional occurrences | N |
| False positives discarded (@EnableTransactionManagement etc.) | N |

---

### API Layer (Controller / Resource)
[If none:] No @Transactional found on API layer classes or methods — ✓

[If found — this is an anti-pattern:]
| Class | Scope | Occurrences |
|-------|-------|-------------|
| SomeController | Class-level | 1 |
| OtherController.someMethod | Method-level | 1 |

**Total: N occurrences across N classes**

> ⚠ **Anti-pattern:** `@Transactional` on a controller couples the HTTP layer to the transaction
> boundary. Controllers should delegate to service methods that own the transaction. A controller-level
> transaction holds a DB connection open for the full duration of the HTTP request including
> serialization, network I/O, and any pre/post-processing — leading to connection pool exhaustion
> under load.

---

### Service / Business Layer
[If none:] No @Transactional found on service layer — ✓

[If found:]
| Class | Scope | Occurrences |
|-------|-------|-------------|
| SomeService | Class-level | 1 |
| SomeService.saveOrder | Method-level | 1 |

**Total: N occurrences across N classes**

> ✓ Correct placement. Service/business classes are the appropriate owners of transaction
> boundaries in a layered architecture.

---

### Repository / DAO Layer
[If none:] No @Transactional found on repository layer — ✓

[If found:]
| Class | Scope | Occurrences |
|-------|-------|-------------|
| SomeRepository | Class-level | 1 |

**Total: N occurrences across N classes**

> Acceptable if the repository contains custom query methods that require explicit transaction
> control (e.g., bulk deletes, native queries). However, if Spring Data JPA repositories are used,
> `@Transactional` is already applied by the framework — explicit annotation is redundant and
> potentially misleading.

---

### Ambiguous (layer not identified)
[If none:] No ambiguous occurrences — ✓

[If found:]
| Class | Annotations present | Scope | Occurrences |
|-------|---------------------|-------|-------------|
| SomeClass | @Component, @Qualifier | Class-level | 1 |

**Total: N occurrences across N classes**

> These classes could not be classified by annotation or name pattern. Review manually to
> determine whether the transaction boundary is placed correctly.

---

### Self-Invocation Anti-Pattern
[If none:] No self-invocation of @Transactional methods detected — ✓

[If found:]
| Caller | Callee | Bypassed @Transactional attributes |
|--------|--------|-----------------------------------|
| ClassName.callerMethod | ClassName.calleeMethod | noRollbackFor / readOnly / propagation / (all) |

**Total: N self-invocation(s) across N classes**

> ⚠ **Anti-pattern:** When a Spring bean calls its own method directly (not through the Spring AOP proxy),
> the `@Transactional` annotation on the called method is **silently ignored**. The call executes within
> the caller's existing transaction context, ignoring the callee's declared propagation, isolation,
> `noRollbackFor`, and `readOnly` settings — with no error or warning at runtime.
>
> **Fix:** Extract the called method into a separate Spring bean and inject it. All calls to that bean go
> through the proxy, restoring the intended transactional semantics.

---

### Summary
| Category | Count | Assessment |
|----------|-------|------------|
| API (Controller) occurrences | N | ⚠ Anti-pattern / ✓ None |
| Service / Business occurrences | N | ✓ Correct placement |
| Repository / DAO occurrences | N | ✓ Acceptable / ⚠ Review |
| Ambiguous occurrences | N | Manual review needed |
| Self-invocations (proxy bypass) | N | ⚠ Anti-pattern / ✓ None |
| **Total @Transactional occurrences** | **N** | |

---

### Problem Summary

| # | Check | Issues found | Severity |
|---|-------|--------------|---------|
| 1 | @Transactional on API layer (Controller) | N occurrence(s) | ⚠ Anti-pattern / ✓ None |
| 2 | @Transactional on Service layer | N occurrence(s) | ✓ Correct placement |
| 3 | @Transactional on Repository / DAO layer | N occurrence(s) | ℹ Acceptable / ✓ None |
| 4 | @Transactional — ambiguous layer | N occurrence(s) | ℹ Manual review / ✓ None |
| 5 | Self-invocation (AOP proxy bypass) | N occurrence(s) | ⚠ Anti-pattern / ✓ None |

| Priority | Issue | Detail | Recommendation |
|----------|-------|--------|----------------|
| 1 | Self-invocation (proxy bypass) | N method(s) — @Transactional silently ignored | Extract the called method into a separate Spring bean |
| 2 | @Transactional on Controller | N occurrence(s) — transaction held open for full HTTP cycle | Move transactional logic into the service layer |
| 3 | @Transactional on Repository with Spring Data JPA | N occurrence(s) — redundant annotation | Remove redundant annotations |
| 4 | @Transactional on ambiguous class | N occurrence(s) — class role not identifiable | Clarify architecture and class positioning |

> Remove rows where count is 0 and severity is ✓.
```

Always report all five sections. A section with no occurrences must say "— ✓" rather than be omitted.

> **Usage note:** When invoked via `/full-review`, the Problem Summary section is omitted — a consolidated summary covering all sections is produced at the end of the global report.

## Optional — Create a Saved View

After producing the report, if any violations were found, offer to create a CAST Imaging saved view for each finding group. Object IDs were already collected during the analysis — no extra queries needed.

Present the offer:
```
Would you like me to create a saved view in CAST Imaging with the violating objects?
- API layer @Transactional: N objects
- Self-invocations: N objects
Type yes or specify which group(s) to include.
```

For each group confirmed:
1. Call `mcp__imaging__views` with `focus=create`, `name="Transactional — <GroupName>"`, and `object_ids` set to the IDs of the violating objects.
2. Return the direct URL from the response so the user can open the view immediately in CAST Imaging.
