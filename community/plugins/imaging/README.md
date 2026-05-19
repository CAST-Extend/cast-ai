# CAST Imaging Community — Claude Code plugin

Consultant-contributed analysis skills for [CAST Imaging](https://www.castsoftware.com/imaging). Status: alpha.

These skills are grounded in CAST Imaging data and run on top of the same MCP server used by the official `imaging` plugin. They cover architectural reviews, persistence and database analysis, security audits, modernization assessment, and end-to-end report orchestration.

## Prerequisites

- [Claude Code](https://claude.ai/code) installed
- A running [CAST Imaging](https://www.castsoftware.com/imaging) instance
- The CAST Imaging MCP server registered in your Claude Code config as `imaging` — see the [CAST Imaging MCP setup guide](https://doc.castsoftware.com/mcp-server/windows/)

## Install

Inside Claude Code, add the `cast-claude` marketplace and install the plugin:

```text
/plugin marketplace add CAST-Extend/cast-claude
/plugin install imaging-community@cast-claude
```

Then activate it for the current session:

```text
/reload-plugins
```

The plugin installs to your **user scope** by default — it stays available across all your Claude Code sessions and projects. To install for a specific project or for yourself only in this repository, run `/plugin` and pick a scope from the interactive UI.

## What this plugin adds

25 skills bundled together so they can compose. Many auto-invoke from natural language; others are explicit slash commands. Skills are namespaced under `imaging-community`.

### Orchestration

| Skill | Purpose |
|-------|---------|
| `full-review` | Run every analysis skill in sequence against one application; produce a unified HTML report. |
| `archaion-master-orchestrator` | Synthesize a 9-section Technical Assessment Report (.docx) by coordinating the worker skills below. |

### Architecture & modernization

| Skill | Purpose |
|-------|---------|
| `architectural-governance` | Audit layering, circular dependencies, prohibited cross-component calls. |
| `layering` | Detect Controller→Repository direct calls, entity exposure at REST endpoints, Jackson on entities. |
| `modules-analysis` | Module inventory, dependency graph, cycles, orphan modules, coupling metrics, Maven layout. |
| `modernization-analysis` | Find modernization candidates: monolith decoupling, Mono2Micro service boundaries, complex hotspots. |
| `cloud-migration-maturity` | Cloud readiness assessment with blockers, opportunities, and migration roadmap. |
| `technical-debt-analyzer` | Identify and prioritize top-20 ISO-5055 violations across the codebase. |
| `performance-iso5055-review` | Performance and structural-quality review based on ISO-5055 standards. |

### Persistence & database

| Skill | Purpose |
|-------|---------|
| `persistence-layer` | Detect persistence-layer boundary violations and direct controller-to-repository calls. |
| `persistence-jpa-review` | JPA entity mapping audit: ID types, fetch strategies, relationship anti-patterns. |
| `jdbc-review` | Inventory of raw/native JDBC API usage (`java.sql.*`). |
| `jdbcTemplate-review` | Inventory of Spring `JdbcTemplate` / `NamedParameterJdbcTemplate` usage. |
| `transactional-review` | `@Transactional` audit by layer; flags self-invocation anti-patterns. |
| `database-tables` | Table structure analysis: independent tables, FK clusters, table classification. |
| `db-migration-advisor` | Identify hardcoded SQL, table dependencies, data-access patterns for migration planning. |

### APIs, integration, resilience

| Skill | Purpose |
|-------|---------|
| `rest-api-review` | REST URL audit: casing, verbs in URLs, plural/singular, REST best practices. |
| `api-security-review` | Spring input-validation audit: `@Validated`, `@Valid`, bean-validation annotations. |
| `http-client-review` | Inventory of outbound HTTP client usage (`RestTemplate`, `WebClient`, `Feign`, `OkHttp`, etc.). |
| `resilience` | Detect `resilience4j` / Hystrix / Spring Retry usage and 14 anti-patterns. |

### Cross-cutting concerns

| Skill | Purpose |
|-------|---------|
| `error-handling-review` | Exception inventory (custom vs library vs JDK), duplicates, `@ControllerAdvice` audit. |
| `logging-review` | Logging-framework usage audit (SLF4J, Log4j, Logback, JUL, MDC, anti-patterns). |
| `caching-review` | Spring / JCache caching-annotation audit (`@Cacheable`, `@CacheEvict`, etc.). |
| `security-vulnerability-check` | Structural security audit: CVEs, insecure patterns, unprotected endpoints. |
| `superfluous-libs-review` | Find libraries superseded by modern Java / Spring Boot defaults (Gson, Joda Time). |

## How to invoke

Most skills auto-trigger when you ask the right question in plain language. For example, "audit my persistence layer for boundary violations" loads `persistence-layer`; "what's my JPA entity mapping look like?" loads `persistence-jpa-review`.

To invoke explicitly:

```text
/imaging-community:full-review
/imaging-community:architectural-governance
/imaging-community:persistence-jpa-review
... etc.
```

### Composed workflows

- **End-to-end review of one application:** `/imaging-community:full-review` runs every analysis skill in sequence and emits one HTML report.
- **Formal technical assessment for stakeholders:** `/imaging-community:archaion-master-orchestrator` produces a 9-section `.docx` report by coordinating the architectural, modernization, security, and performance worker skills.

## Update

When new skills are added or existing ones improved:

```text
/plugin marketplace update cast-claude
/reload-plugins
```

## Uninstall

```text
/plugin uninstall imaging-community@cast-claude
```

## Contributing

See the [community contributions section of CONTRIBUTING.md](https://github.com/CAST-Extend/cast-claude/blob/main/CONTRIBUTING.md#community-contributions) for how to add a new skill to this bundle.

## License

MIT
