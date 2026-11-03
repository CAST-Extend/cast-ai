---
name: blueprint-technical-diagrams
description: Build eight readable technical diagrams of an application from CAST Imaging analysis — system context, containers, domain dependency map (chord), data ownership matrix, journey sequence, entity lifecycle, blast radius and integration map — each answering one question at the right level of detail, with variant pickers for sequences, lifecycles and blast radius, takeaways labeled extracted vs. inferred, and Mermaid export. Use this skill whenever the user asks for architecture, sequence, flow, dependency, CRUD/data-ownership, lifecycle/state, impact or blast-radius diagrams from code or CAST data, or the Technical Diagrams section of a CAST Blueprint.
---

# Blueprint — Technical Diagrams

**Principle:** collapse the object graph to the right level — one question per diagram, ≤ ~12 boxes, every takeaway traceable, everything exportable as Mermaid. D5–D7 are **generators**, not single examples (user feedback): each has a picker with 3–5 real precomputed variants plus a "generate for another…" box.

## The eight diagrams and how to source them
| # | Diagram | Source (CAST Imaging) |
|---|---|---|
| D1 | System context | actors from entry-point areas; external groups from packages/plugins/data stores |
| D2 | Containers | apps/runtimes (CICS vs batch, storefront vs admin), layers, data stores |
| D3 | Domain dependency map (chord) | Cypher: cross-domain links. Tags → `TAGGED_WITH`; no tags → group by namespace (`Grand.Services.X`) or program→domain mapping. Mark two-way pairs (threshold scaled to the data: ≥100 Shopizer, ≥15 GrandNode) and shared-write pairs in red |
| D4 | Data ownership | SQL CRUD by domain (web/JPA: misses ORM writes — say so); program → VSAM/DB2/IMS/MQ access (mainframe); service → `IRepository<T>` RELY_ON (MongoDB/.NET: "uses", read/write not distinguished). Rows used/written by >1 domain are the split blockers |
| D5 | Journey sequence | entry point → 6–10 participants from code reading; alt/opt frames for reject/failure paths, each frame on its own header row |
| D6 | Lifecycle | status enums + the code that sets them (`nextTransaction`, `CheckOrderStatus`); derived lifecycles when no status field exists (carts, daily transactions, billing cycle, CA-7 job chain) — label "derived" |
| D7 | Blast radius | `IS_IN_TRANSACTION` (entry points) + `CALL*1..3/4` callers grouped by domain; tables/files: direct accessors then callers. **DI codebases: query the interface method** — the implementation alone hides controller callers (GrandNode PlaceOrder: 1 vs 3 entry points) |
| D8 | Integration map | `packages` (version, licence, CVE flags) or, without packages, plugin families / middleware (MQ, DB2, IMS, utilities) |

Choose blast-radius seeds that matter: business-critical methods, objects behind open clarifications, multi-writer data stores — not raw top fan-in (mostly getters).

## Output contract
Data: `DOMS` (id, label, lane, size), `LANES`, `DLINKS`, `CRUD`, `DIAGS`, `SEQS` (P participants, dark, M messages `[from,to,label,kind m|s|r]`, F frames), `LIFES` + `lifeSVG()` + `LIFE_MERMAID`, `BLASTS` (rings `[hop,[[domain,count]]]`, inn/out entry points), `BLAST_COL/LBL`, `SEQ_TAKE/LIFE_TAKE/BLAST_TAKE`. Functions: `techDiagrams()`, `diagTakeaways()`, `DRAW.*`, `MERMAID.*`, `variantPicker()`, `seqSVG/seqMermaid`, `blastSVG/blastMermaid`, `collapseLabel()`. Export (`DIAG_FILES`): one Markdown+Mermaid file per diagram, and one per variant for D5–D7.

## QA
Run a text-overlap check over every SVG (getBBox intersections > 3px, text beyond viewBox) for every diagram and variant before shipping; fix label collisions by giving frames their own rows and shortening labels.
