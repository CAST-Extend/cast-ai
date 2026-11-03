# Cost estimation

## Azure — live prices
Run `node scripts/azure-prices.mjs eastus > az.json` (public, read-only Azure Retail Prices API, no account). It returns meters for Container Apps, PostgreSQL, Redis, Blob, Front Door, Static Web Apps, Key Vault, Container Registry and Log Analytics. Pick meters with care:
- Container Apps: `Standard vCPU Active Usage` (per second), `Standard Memory Active Usage` (per GiB-second), `Standard Requests` (per 1M); an `Environment Management Hour` meter appeared effective 2026-09-01.
- PostgreSQL Flexible Server: product `… General Purpose Ddsv5 Series Compute`, skus are whole servers (`4 vCore` = $/hour for 4 vCores → divide for per-vCore). Storage per GB-month was not in the pull (use ≈ $0.115 and label it).
- Redis: `Premium P1 Cache` (zone redundancy), `Standard C1` for non-prod.
- Front Door: `Premium Base Fees` $/month in Zone 1 (ignore US Gov rows), `Premium Data Transfer Out` (tiered; first tier), `Premium Requests` per 10K.
- Blob: `Hot LRS Data Stored` first tier. Log Analytics: `Analytics Logs Data Ingestion` (non-zero row).
Record region and retrieval date on the page.

Snapshot pulled 2026-09-26, East US: Container Apps vCPU $0.000024/s, memory $0.000003/GiB-s, requests $0.40/M, environment $0.10/h · PostgreSQL GP Ddsv5 $0.089/vCore-h · Redis P1 $0.555/h, C1 $0.138/h · Blob Hot LRS $0.0208/GB · Front Door Premium $330/mo + $0.0825/GB + $0.015/10K · Static Web Apps $9/app · Key Vault $0.03/10K ops · ACR Standard $0.6666/day · Log Analytics $2.30/GB.

## AWS / Google Cloud — approximate (label as not live)
AWS: Fargate $0.04048/vCPU-h + $0.004445/GB-h · Aurora PostgreSQL ≈ $0.13/vCPU-h equiv., storage $0.10/GB · ElastiCache r6g.large ≈ $0.206/h per node · S3 $0.023/GB · CloudFront $0.085/GB · CloudWatch Logs $0.50/GB · SES $0.10/1,000.
Google Cloud: Cloud Run $0.000018/vCPU-s + $0.000002/GiB-s · Cloud SQL Enterprise ≈ $0.069/vCPU-h equiv., SSD $0.17/GB · Memorystore Standard 5 GB ≈ $0.27/h · Cloud Storage $0.020/GB · CDN $0.08/GB · Logging $0.50/GB.
Where possible, replace with live pulls (AWS Price List API bulk JSON; Google Cloud Billing Catalog API needs an API key).

## Sizing heuristics (state them on the page)
- Peak users 1,000–10,000 → 3 API replicas × 2 vCPU / 4 GiB, DB 4 vCores; 10,000+ → 6 replicas, 8 vCores; below 1,000 → 2 × 1 vCPU / 2 GiB, 2 vCores.
- Requests ≈ orders/day × 60 page views × 25 requests × 30; logs ≈ 50 GB per replica per month.
- HA (≥ 99.95%) doubles DB compute and storage and selects the zone-redundant cache tier.
- Peak: replicas × peak factor (cap 6×) for ~1.5 months a year.
- Non-prod per environment: 1 small replica at ~50% uptime, 2-vCore DB without HA, basic cache, 10 GB logs.
- Annual range: −20% / +30% around the expected value.

## Present
Monthly (prod + non-prod), peak month, annual range, by service with sizing basis, today vs target bands, sensitivity (traffic ×2, warm standby, 99.99%, reservations, scale non-prod to zero), not-included list, assumptions.
