# @Transactional Usage Review — CAST Imaging

## Executive Summary

Detects and reports all `@Transactional` annotation usage in a Java/Spring application using CAST Imaging. Classifies every annotated class and method by architectural layer (API, service, repository, ambiguous), flags misplacements, and identifies self-invocation anti-patterns where Spring's AOP proxy is silently bypassed — a runtime bug that produces no error but breaks transaction semantics.

## CAST Use Case

Tech debt reduction

## Target Users

Application developer, Java architect, Tech lead

## Benefits

- Instantly locates all `@Transactional` usage across the entire application — no manual grep
- Identifies misplaced annotations on controllers that cause connection pool exhaustion under load
- Detects self-invocation proxy bypass — a silent runtime bug with no error thrown at runtime
- Provides per-layer assessment with prioritized, actionable remediation recommendations
- Creates CAST Imaging saved views for immediate visual exploration of violation groups

## Asset Status

Pilot-ready

## Solution Description

The asset queries CAST Imaging via MCP to fetch all objects annotated with `@Transactional` (classes and methods in parallel), filters out false positives (`@EnableTransactionManagement`, `@TransactionalEventListener`), classifies each result by architectural layer using annotation and naming-convention rules, then runs parallel inward-call queries to detect self-invocation within the same class. Large result sets (>200 items) are cached to a local JSON file to avoid context overload. An optional final step creates CAST Imaging saved views for each violation group.

## Outputs Produced

- Structured `@Transactional` usage report (markdown) broken down by architectural layer
- Self-invocation violation list with details of which transaction attributes are bypassed
- Prioritized problem summary with remediation recommendations
- (Optional) CAST Imaging saved views for each violation group with direct URLs

## Workflow

Developer prompt → application selection → parallel fetch of annotated classes and methods → false-positive filtering → layer classification → parallel self-invocation detection → report → (optional) saved view creation in CAST Imaging

## Pre-requisites

- CAST Imaging instance with MCP server enabled, Java application scanned
- AI IDE / coding assistant with MCP support (Claude Code, GitHub Copilot, Cursor, Gemini Code Assist, Kiro…)
- MCP server registered as `imaging` in your IDE settings
- Spring-based Java application (`@Transactional` from Spring, JEE, or Jakarta)

## Limitations

- Java / Spring only — does not cover other transaction frameworks or languages
- Layer classification is based on annotations and class naming conventions — unconventionally named classes may land in "Ambiguous"
- Self-invocation detection requires that callers are indexed in CAST Imaging
- Large applications (>200 annotated objects) write a cache file to the working directory

## Assets / Package Contents

| Path | Description |
|------|-------------|
| `skills/transactional-review.md` | Core workflow — provider-agnostic, all adapters reference this |
| `claude/` | Claude Code adapter — copy contents into your project root |
| `copilot/` | GitHub Copilot adapter — copy contents into your project root |
| `cursor/` | Cursor adapter — copy contents into your project root |
| `gemini/` | Gemini Code Assist adapter — copy contents into your project root |
| `kiro/` | Amazon Kiro adapter — copy contents into your project root |
