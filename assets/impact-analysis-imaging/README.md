# Impact Analysis — CAST Imaging

## Executive Summary

Produces a complete, risk-scored blast radius report for any code object in a CAST Imaging application. Developers and architects use it to assess the scope and risk of a change before touching code — answering "What breaks if I change X?" with deterministic data from CAST Imaging rather than guesswork or manual tracing.

## CAST Use Case

App maintenance & enhancement

## Target Users

Application developer, Architect, Tech lead

## Benefits

- Instant blast radius: callers, callees, transactions, data flows, and cross-application dependencies surfaced in seconds
- Risk score calculated from CAST data — no subjective assessment
- Prioritized test plan generated automatically alongside the report
- Optional writeback: impacted objects tagged in CAST Imaging for visual blast radius exploration

## Asset Status

Pilot-ready

## Solution Description

The asset queries CAST Imaging via MCP across 8 steps (parallelized where independent): MCP health check → object resolution → internal structure → inward/outward callers → transaction impact → data flow impact → cross-application dependencies. A weighted risk score (coupling + transaction criticality + data flow + cross-app penalty) classifies the change as LOW / MEDIUM / HIGH / CRITICAL.

## Outputs Produced

- Structured impact report (markdown) with blast radius summary, risk level, critical paths, affected objects table, and recommended test plan
- (Optional) Tags applied to all impacted objects in CAST Imaging

## Workflow

Developer prompt → object + application resolution → 8-step MCP query chain → risk score calculation → impact report → (optional) writeback to CAST Imaging

## Pre-requisites

- CAST Imaging instance with MCP server enabled
- AI IDE / coding assistant with MCP support (Claude Code, GitHub Copilot, Cursor, Gemini Code Assist…)
- MCP server registered as `imaging` in your IDE settings (see [CAST MCP setup guide](https://doc.castsoftware.com/mcp-server/windows/))

## Limitations

- Requires a completed CAST Imaging scan of the target application
- Cross-application impact is reported at application level only, not per object
- Writeback of more than 50 objects requires explicit user confirmation

## Assets / Package Contents

| Path | Description |
|------|-------------|
| `skills/impact-analysis.md` | Core workflow — provider-agnostic, all providers reference this |
| `claude/` | Claude Code adapter — copy contents into your project root |
| `copilot/` | GitHub Copilot adapter — copy contents into your project root |
| `cursor/` | Cursor adapter — copy contents into your project root |
| `gemini/` | Gemini Code Assist adapter — copy contents into your project root |
| `kiro/` | Amazon Kiro adapter — copy contents into your project root |
