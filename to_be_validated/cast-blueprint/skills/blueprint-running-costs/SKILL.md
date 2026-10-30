---
name: blueprint-running-costs
description: Estimate the monthly and annual cloud running cost of a CAST Blueprint target state from public list prices (live Azure Retail Prices API, approximate AWS/GCP) and customer sizing — cost by service for production and non-production, peak month, range, today vs. target comparison, sensitivity scenarios, exclusions and assumptions, with CSV/Markdown export. Use this skill whenever the user asks for estimated running costs, cloud cost, TCO input or run-cost comparison for an application's target architecture, or the Estimated Running Costs section of a Blueprint.
---

# Blueprint — Estimated Running Costs

Pricing method, unit-price tables and the live Azure price script (`scripts/azure-prices.mjs <region>`) live in **`well-architected-target-state`** (`references/pricing.md`). This skill defines the Blueprint page.

## Inputs
- Target State: `tsModel()` → services per provider (runtime, database, cache, object storage, edge, secrets, registry, observability, messaging, API management, batch).
- Customer Context: users/peak, orders or transactions per day, DB size, media size, data served, environments, availability, today's annual cost.

## Model (`costModel(cloud)`)
- Sizing heuristics from answers (replicas × vCPU/GiB; DB vCores or nodes; cache tier by availability; storage GB; egress GB; logs per replica); every unanswered field becomes an assumption line.
- Production line items + non-production environments (small, no HA, scaled down) + peak extra (replicas × peak factor for ~6 weeks).
- Range: −20% / +30% (mainframe refactor +40%).
- Mainframe: add a batch line (vCPU-hours per night × 32 runs/month); COBOL runtime / refactoring-tool licences are **not included** — say so.
- MongoDB-compatible DB prices are approximate on every cloud — label them.

## Page anatomy
Provider switch with live/approximate badge → KPIs (per month, peak month or per year, range, vs today's midpoint "infrastructure only") → estimate box (Inferred + Customer + caveat that today's figure includes staff/DC/licences) → cost-by-service table with bars, production total (`Pr()` price-list provenance), non-production → today vs target bands → sensitivity table (traffic ×2 or volume ×10, warm standby, reserved capacity, non-prod to zero) → not included → assumptions.

## Output contract
Data: `HRS`, `SECS`, `PRICES` (per provider: live flag, region, date, unit prices, labels), extra per-app tables (e.g. `DBX`, `XP`). Functions: `Pr()`, `openPrices()`, `costModel()`, `costEstimate()`, `COST_FILES()` (`costs/<cloud>/estimate.csv`, `estimate.md`). `costModel()` is reused by ROI. Re-pull Azure prices before external use; note the pull date on the page.
