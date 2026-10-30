---
name: well-architected-target-state
description: Recommend a cloud target-state architecture for an existing application on AWS, Azure or Google Cloud, grounded in code-analysis findings (e.g. CAST Imaging cloud blockers, coupling, data ownership) and customer context (target cloud, managed vs portable, team skills, availability, compliance, peaks, regions), reasoned through each provider's Well-Architected Framework pillars — then estimate running costs from public list prices (live Azure Retail Prices API). Produces a recommendation, a provider-styled architecture diagram, a today→target mapping, pillar rationale weighted by business drivers, ADR-style decisions, assumptions, and a cost estimate. Use this skill whenever the user asks for a target architecture, cloud migration design, AWS/Azure/GCP service mapping, Well-Architected review of a modernization, "what should this look like in the cloud", or a cloud run-cost estimate for a proposed design — including as the Target State / Running Costs sections of a CAST Blueprint.
---

# Well-Architected Target State (+ cost)

The goal is a target architecture a real architect would defend: every choice traced to **what the code shows** (findings), **what the customer wants** (context), or **what the framework recommends** (pillar guidance) — and labeled that way. Generic "use Kubernetes and a managed database" answers are what this skill exists to beat.

## Inputs to gather
- **Findings** (from CAST Imaging or similar): cloud blockers (stateful sessions, in-process cache, local file system, env vars / hard-coded URLs, sendmail…), SDKs in use (storage, payment, email), database engine and table count, domain coupling and multi-writer tables, card data or other sensitive data, CVEs.
- **Customer context**: current hosting/runtime/DB, target cloud, target style (rehost / replatform / containers-then-services / microservices), managed vs portable, team skills, exposure (internal/external/both), users & orders, seasonal peak, regions, availability, RTO/RPO, compliance, must-keep integrations, budget, deadline, today's run cost, DB/media/traffic sizes.
- Unanswered items become explicit **assumptions**, never silent defaults.

## Reasoning steps
1. **Map components to services** using `references/csp-catalog.md` (role → service per provider, pillar names per provider).
2. **Map each finding to a target pattern** using `references/patterns-and-decisions.md` (e.g. stateful sessions → managed Redis session store; card columns → tokenization at the payment provider + drop columns).
3. **Make the decisions with the decision rules** in the same file — runtime (managed vs Kubernetes vs VMs from managed-preference + skills + style), database (keep the engine to avoid rewriting the ORM layer), sessions, payments consolidation, decomposition order (least-coupled first; multi-writer tables must get one owner first), email, regions/DR.
4. **Weight the pillars by the customer's ranked drivers** (rank 1 = 3, rank 2 = 2, rank 3 = 1): Scalability→Performance, Security & compliance→Security, Cost reduction→Cost, Delivery speed / end of support→Operational excellence, Resilience→Reliability. Order the pillar section by weight. Azure has 5 pillars, AWS adds Sustainability, Google Cloud names them differently (see catalog).
5. **Write ADRs**: decision, rejected alternatives, because (cite customer answer / finding / pillar).
6. **Draw the diagram** in the provider's style: users → edge (CDN + WAF) → region box (network, zones) with web / application / data / platform tiers → external services; secondary region as a dashed box when multi-region or DR. Use official provider icons if available (download needs user consent; the `cast-blueprint` skill has `assets/build-icons.mjs`).
7. **Estimate cost** with `references/pricing.md` — pull live Azure prices with `scripts/azure-prices.mjs <region>`; AWS/GCP use the approximate table and must be labeled "approximate, not live".

## Output shape
Recommendation paragraph · diagram · today→target table (Today | what CAST/customer says | Target | Why) · pillars · ADR log · assumptions · cost (monthly, peak month, annual range, by service, non-prod, today vs target, sensitivity, not included, assumptions).

## Honesty rules
- Tag framework guidance as such; it is paraphrased from the providers' frameworks — refresh against current docs before customer delivery (services and names change).
- Cost is infrastructure only: exclude migration effort, support plans, negotiated discounts, tax, payment transaction fees. When comparing with today's run cost, say today's figure likely includes staff, data-center and licenses.
- Sizing heuristics are order-of-magnitude; show them.
