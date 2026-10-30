---
name: blueprint-target-state
description: Build the Target State Architecture section of a CAST Blueprint — a cloud target (AWS, Azure or GCP) that visibly combines CAST Imaging findings, customer context and the provider's Well-Architected Framework: recommendation, provider-styled diagram with official icons, today → target mapping, pillar rationale weighted by business drivers, ADR decision log and assumptions, with a provider switch. Covers web (Java, .NET), document-database (MongoDB) and mainframe (COBOL/CICS/batch/VSAM/IMS/MQ) targets. Use this skill whenever the user asks for the target state or target architecture of an application analyzed by CAST, a Blueprint target-state page, or how a specific CAST-analyzed app should look in the cloud.
---

# Blueprint — Target State Architecture

CSP knowledge (service catalog per provider, pillar names, decision patterns, mapping of blockers to services) lives in the **`well-architected-target-state`** skill — load it. This skill defines how the Blueprint page uses it.

## Inputs
- Findings: cloud/container blockers and boosters, data stores (engine, table/collection/file count), multi-writer data, sensitive data, coupling, plugins/SDKs, CVEs.
- Customer Context: `PLAN_DEPS.target` fields (hosting, runtime, exposure/channels, regions, target cloud, style or approach, managed vs portable, drivers, availability, compliance, must-keep integrations).

## Model (`tsModel()`)
Derive: runtime kind (managed containers / Kubernetes / VMs) from style + managed-vs-portable + team skills (no Kubernetes skills → managed); pillar weights from ranked drivers (3/2/1); kept vs retired integrations; assumptions for every "Don't know".

## Stack patterns learned
- **Java/Spring + PostgreSQL (Shopizer):** static front ends at the edge, API containers, managed PostgreSQL, shared Redis for sessions/cache (stateful sessions + in-process cache blockers), object storage consolidation, tokenize payments and drop card columns.
- **.NET + MongoDB (GrandNode):** containers; MongoDB-compatible managed DB (DocumentDB / Cosmos DB for MongoDB vCore / Atlas) **with a compatibility test as an explicit assumption**; managed Redis; media to object storage (file-system blockers); admin console moved unchanged first, rebuilt later.
- **Mainframe (CardDemo):** approach choice (replatform COBOL runtime / automated refactor / rewrite); online and batch as separate workloads; VSAM + DB2 + IMS → one relational store (IMS data model is a decision); MQ → managed messaging; sign-on file → platform identity; schedules as code (jobs outside CA-7 must be captured); parallel run through a month-end with file-by-file comparison. Phrase vendor tool names cautiously (verify current names).

## Page anatomy
Provider switch (customer's choice ✓, others for comparison) → Recommendation box (Customer + Extracted + Inferred sentences) → diagram (region box, edge, runtime, data, platform tiles, external services; official icons only where the embedded set has them) → today → target table (Today · what CAST/customer says · target service · why, each "why" tagged F/C/X/I) → pillars ordered by weight → ADR-01… (decision, rejected options, because) → assumptions.

## Output contract
Data: `CSP` (per-provider services), `PILLAR_NAMES`, `DRIVER_PILLAR`, `FW_PRINCIPLE`, `CLOUD_ICONS` (from the cast-blueprint build-icons script). Functions: `F()` + `openFramework()`, `tsModel()`, `tsDiagram()`, `targetState()`, `setTsCloud()`, `TS_FILES()` (target-state.md with Mermaid + ADRs). `tsModel()` is reused by Running Costs, Plan and ROI. Run an SVG text-overflow check for all three providers (long service names overflow tiles).
