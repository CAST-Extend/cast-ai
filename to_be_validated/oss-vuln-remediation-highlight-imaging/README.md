# CAST OSS Remediation Copilot

## Executive Summary

This asset helps developers accelerate OSS vulnerability remediation at scale by using CAST to identify vulnerabilities, recommend safe upgrade versions, and ground AI-generated fixes with deterministic dependency and architectural context.

## CAST Use Case

Risk reduction

## Target Users

Application developer

## Benefits

- Improved accuracy
- Faster remediation
- Effort reduction

## Asset Status

Production-tested

## Solution Description

This solution is a skills package imported into an AI IDE. It allows developers to identify upgrade paths, assess downstream impact, and leverage an LLM to safely remediate OSS risk within an application. Changes are automatically validated through a background build, with failed changes rolled back.

## Outputs Produced

- Remediated code
- Detailed report of changes made, rollback actions, and suggested next steps

## Workflow

Developer prompt → AI request → CAST vulnerability discovery, version recommendation, and dependency/context retrieval → generated remediation → background validation/build → human review

## Pre-requisites

- CAST Imaging
- CAST Highlight
- CAST MCP enabled
- AI IDE/coding assistant (GitHub Copilot, Cursor, Claude Code, Gemini Code Assist, Amazon Kiro, etc.)
- Access to an LLM/provider model (GPT, Claude, Gemini, etc.)

## Limitations

- Human required to issue prompts and code commit/review
- Requires CAST scan completeness
- Dependent on technology support coverage

## Assets / Package Contents

| Path | Description |
|------|-------------|
| `skills/` | Provider-agnostic prompt definitions |
| `copilot/` | GitHub Copilot adapter — copy contents into your project root |
| `USAGE.md` | Detailed setup, prompt instructions, and troubleshooting |
