---
name: impact-analysis
description: Analyze code change impact on applications. Use when the user asks about the blast radius, risk, safety, or downstream effects of changing, removing, or refactoring code objects. Triggers on phrases like "What breaks if I change X?", "Is it safe to remove X?", "What depends on X?", "Who calls X?", "Impact of changing X", or any question about the consequences of modifying code. Works best with CAST Imaging applications.
---

# Impact Analysis Skill

Produce complete, risk-scored impact reports by analyzing how code changes affect your applications.

## What This Skill Does

When you modify, remove, or refactor a code object (function, class, service, etc.), this skill:

1. **Maps the blast radius** — finds everything that depends on the code
2. **Quantifies the risk** — calculates a risk score based on coupling, transactions, and quality
3. **Identifies critical paths** — shows which business transactions are affected
4. **Recommends validation** — suggests tests and checks before deployment
5. **Detects orphaned code** — finds objects that would become dead code if removed

## How to Use

Tell the skill what you want to change:

> "What's the impact of removing the validatePayment function in the OrderProcessor app?"

Or ask about downstream effects:

> "I want to refactor the UserService class. Who depends on it? What could break?"

The skill will:
- Ask for clarification if needed (which application, which object)
- Analyze the code structure and dependencies
- Return a detailed impact report with risk level and recommendations

## What You'll Get

### Impact Analysis Report

**Target Object**
- Name, type, file location, complexity, number of child functions

**Blast Radius Summary**
- Number of direct dependents (callers)
- Number of external dependencies (callees)
- Business transactions affected
- Data flows involved
- Cross-application impact
- Objects that would become orphaned if removed

**Risk Level**
- CRITICAL, HIGH, MEDIUM, or LOW
- Based on coupling, transaction criticality, quality issues, and cross-app impact

**Critical Paths**
- Business transactions most affected, ranked by risk
- What could break in each transaction

**Affected Objects**
- Direct callers (things that depend on this code)
- Outward dependencies (things this code depends on)

**Orphaned Objects**
- Code that would become dead code if this is removed

**Data Flow Impact**
- Data entities and flows affected by the change

**Quality Issues**
- Existing quality problems in the blast radius

**Test Plan**
- Prioritized checklist of what to test before deploying

**Recommendation**
- Actionable guidance: proceed with caution, or what to address first

## Example

**You ask:**
> "I want to refactor the PaymentProcessor class in the BillingApp. What's the blast radius?"

**The skill analyzes and returns:**
```
## Impact Analysis: PaymentProcessor (Class) in BillingApp

### Target Object
- Name: PaymentProcessor
- Type: Class
- File: /services/billing/PaymentProcessor.java
- Cyclomatic Complexity: 8
- Children (owned methods): 12

### Blast Radius Summary
- 23 objects directly depend on this (callers)
- 8 dependencies this object calls (callees)
- 5 business transactions flow through it
- 2 data flows are affected
- 1 external application impacted
- 0 objects would become orphaned if removed

### Risk Level: HIGH
- Coupling: HIGH (23 direct dependents)
- Transaction criticality: HIGH (PaymentComplete, RefundRequest are critical)
- Quality amplifier: YES (2 code quality violations)
- Cross-app impact: YES (ReportingService depends on this)

### Critical Paths (ordered by risk)
1. PaymentComplete - Critical complexity (score: 68)
   - 12 objects involved, payment gateway timeout handling
2. RefundRequest - High complexity (score: 45)
   - 8 objects involved, refund state tracking

### Affected Objects (Direct Callers)
| Object | Type | Link Type | Risk |
|--------|------|-----------|------|
| BillingController | Class | calls | MEDIUM |
| InvoiceService | Service | depends on | MEDIUM |
| ReconciliationJob | Service | calls | HIGH |
[... more objects ...]

### Recommendation
⚠️ **Proceed with Caution** — PaymentProcessor has high coupling and participates in 2 critical transactions. Before refactoring:
1. Run regression tests on PaymentComplete and RefundRequest transactions
2. Verify ReportingService integration tests pass
3. Address the 2 code quality issues to reduce risk
```

## Important Details

- **Data source**: All analysis comes from CAST Imaging's application intelligence. The skill uses CAST MCP tools to gather real, production-accurate data about your code.
- **Accuracy**: Results are based on actual code analysis, not approximations or pattern matching.
- **Scope**: Works best with applications that have been analyzed by CAST Imaging.

## What Information You Need

To get the most accurate analysis:
1. **Application name** — which application contains the code you want to change
2. **Object name** — the code object (function, class, service, etc.) you're analyzing
3. **Object type** (optional) — helps disambiguate if multiple objects share the same name

If you don't know these, the skill will ask you to list available applications and help you identify the right object.

## Limitations

- Requires the code to be analyzed in CAST Imaging
- Works best with mature applications that have established transaction and data flow patterns
- Doesn't predict performance impact — focus is on structural dependencies and risk
