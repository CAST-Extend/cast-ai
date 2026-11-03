# Provider service catalog (web/e-commerce workload archetype)

| Role | Azure | AWS | Google Cloud |
|---|---|---|---|
| Edge / CDN + WAF | Azure Front Door (Premium) + WAF | Amazon CloudFront + AWS WAF (+ Shield) | Cloud Load Balancing + Cloud CDN + Cloud Armor |
| Static front ends | Azure Static Web Apps | Amazon S3 + CloudFront | Cloud Storage + Cloud CDN |
| Staff identity / SSO | Microsoft Entra ID | Amazon Cognito (or IAM Identity Center) | Identity-Aware Proxy |
| Containers — managed | Azure Container Apps | Amazon ECS on AWS Fargate | Cloud Run |
| Containers — Kubernetes | Azure Kubernetes Service (AKS) | Amazon EKS | GKE Autopilot |
| VMs (rehost) | Virtual Machine Scale Sets | EC2 Auto Scaling groups | Managed instance groups |
| PostgreSQL (HA) | Azure Database for PostgreSQL – Flexible Server (zone-redundant HA) | Amazon Aurora PostgreSQL (Multi-AZ) | Cloud SQL for PostgreSQL (regional HA) |
| Sessions + cache | Azure Cache for Redis (Premium for zone redundancy) / Azure Managed Redis | Amazon ElastiCache (Redis OSS / Valkey) | Memorystore for Redis |
| Object storage | Azure Blob Storage | Amazon S3 | Cloud Storage |
| Secrets / config | Azure Key Vault + App Configuration | AWS Secrets Manager + SSM Parameter Store | Secret Manager |
| Image registry | Azure Container Registry | Amazon ECR | Artifact Registry |
| Observability | Azure Monitor + Application Insights (Log Analytics) | Amazon CloudWatch + AWS X-Ray | Cloud Monitoring + Cloud Logging |
| Email | Azure Communication Services Email | Amazon SES | no native service — partner (e.g. SendGrid) or keep SES |
| Private networking | VNet + private endpoints | VPC + private subnets | VPC + Private Service Connect |

## Framework and pillar names
- **Azure Well-Architected Framework** — Reliability, Security, Cost Optimization, Operational Excellence, Performance Efficiency (5).
- **AWS Well-Architected Framework** — Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, Sustainability (6).
- **Google Cloud Well-Architected Framework** — Operational excellence; Security, privacy and compliance; Reliability; Cost optimization; Performance optimization (plus system design as foundation).

## Pillar principles (paraphrased)
- Reliability: remove single points of failure, stateless replaceable instances, spread across zones to meet the availability target.
- Security: defense in depth — edge protection, secrets out of code, managed identity, private data services, minimize stored sensitive data.
- Performance: scale horizontally with demand, serve static content from the edge, cache expensive work.
- Cost: prefer managed services, scale in off-peak, remove duplicate capabilities, reserve steady-state capacity.
- Operational excellence: infrastructure as code, CI/CD, centralized logs/metrics/traces.
- Sustainability: maximize utilization, scale down when idle, remove wasteful processing.

## Brand colors used for diagrams
Azure `#0078D4` (tint `#EAF3FC`) · AWS `#E88B00` (tint `#FFF5E6`) · Google Cloud `#1A73E8` (tint `#EAF1FD`).
