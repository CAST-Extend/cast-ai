---
name: blueprint-roi
description: Build the Return on Investment page of a CAST Blueprint — the CIO page: today's run cost vs target run cost and the upfront investment (delivery + parallel run), payback, 3- and 5-year net benefit, conservative / expected / optimistic scenarios, cumulative cash curve, what decides the answer and value not in the numbers, with a manual vs AI-assisted switch. Use this skill whenever the user asks for ROI, payback, business case, 5-year net benefit or a CIO summary of a modernization, or the ROI section of a Blueprint.
---

# Blueprint — Return on Investment

**Decision made with the user:** simple and concise — the one page a CIO pays attention to. Be honest when the conservative case doesn't pay back in 5 years: that's the prompt to pin down today's true cost.

## Inputs
- Customer Context: today's annual run cost range (`cur_cost`) — required; without it show a "needs today's cost" placeholder.
- Running Costs: `costModel(cloud)` → annual target run cost (and monthly for the parallel run).
- Modernization Plan: `planModel(mode)` → delivery person-weeks (with overhead) × rate, cutover date, P3 start (parallel-run months).

## Model (`roiModel(mode)`)
Scenarios: conservative = low current cost / high run cost / high delivery; optimistic = the reverse; expected = midpoints. Upfront = delivery + target run cost × parallel-run months. Cash curve: spend spread evenly to cutover, then monthly savings; payback = months to cutover + upfront / monthly saving (`never` if savings ≤ 0, "over 5 years" if > 60). 5-year horizon, no discounting/tax/financing (state it).
- Mainframe: add an explicit operations allowance to the target run cost (e.g. ~0.5 FTE ≈ $75K/yr) — infra-only cloud vs all-in mainframe cost otherwise overstates savings; note MIPS-based licences may not fall until capacity is released, and conversion/runtime licences are excluded.

## Page anatomy
Manual / AI-assisted switch → dark verdict box ("Pays back in N years", upfront, annual savings, 5-year net and %; conservative/optimistic payback beside it) → 4 KPIs (run cost today [Customer], target [Price list], upfront, 5-year net) → cumulative cash curve (expected solid, other two dashed, modernization band, break-even marker) → three-scenario table → what decides the answer (today's true cost, like-for-like scope, delivery mode) → value not in these numbers (CVEs, revenue defects fixed, elasticity for peaks, skills risk) → one-line assumptions.

## Output contract
Data: `ROI_CUR` (cost band → range). Functions: `roiModel()`, `roiCurve()`, `setRoiMode()`, `roiPage()`, `ROI_FILES()` (`roi/roi-summary.md`, `roi/roi-scenarios.csv`). Shares `planMode` with the Plan page.
