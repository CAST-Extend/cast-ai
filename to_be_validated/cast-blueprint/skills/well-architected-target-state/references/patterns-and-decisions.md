# Finding → target pattern, and decision rules

## Finding → pattern
| Finding (from code analysis) | Target pattern | Pillar |
|---|---|---|
| Stateful servlet / in-memory sessions | External session store in managed Redis | Reliability, Performance |
| In-process caches (Infinispan, Ehcache…) | Shared managed Redis cache | Performance |
| Local file system / temp files | Object storage | Reliability |
| Several storage SDKs (S3 + GCS + Azure…) | One provider-native object store | Cost |
| Env-var reads, hard-coded URLs, insecure protocols | Secrets store + config service; TLS at edge; private endpoints | Security |
| Self-managed DB on a VM | Managed engine-compatible DB with HA matching the availability target | Reliability, Cost |
| Card data columns (cc_number, cvv…) | Tokenization at the payment provider; drop the columns before migration (PCI) | Security |
| Several payment SDKs | Keep the customer's must-keep provider(s); retire the rest | Security, Cost |
| sendmail / SMTP from the app | Managed email service (or keep the customer's existing one — flag cross-cloud) | Operational excellence |
| In-process rules engine (e.g. Drools) | Unchanged, moves inside the container | — |
| Front end SPA(s) served by app servers | Static hosting + CDN | Performance |
| Admin console with app passwords | Provider identity / SSO in front of the admin | Security |
| High coupling, two-way domain dependencies | Containerize first; decompose later in coupling order | Operational excellence |
| Tables written by several domains | Give each table one owner before extracting services | Reliability |

## Decision rules
- **Runtime**: style = rehost → VMs. Else managed-vs-portable: "Prefer portable (Kubernetes)" → Kubernetes; "Balanced" → Kubernetes only if the team has Kubernetes skills, otherwise managed containers; "Prefer managed" or unknown → managed containers. Cite the answers in the ADR.
- **Database**: keep the engine (PostgreSQL → managed PostgreSQL) to avoid rewriting the ORM layer and queries; HA / zone-redundant when availability ≥ 99.95%.
- **Sessions**: external store, not sticky sessions — sticky sessions pin users to instances and break when autoscaling scales in after a peak.
- **Payments**: single tokenized provider; this shrinks PCI scope and attack surface.
- **Decomposition**: "containers first, then services" → extract lowest-coupling domains first (e.g. Reviews, Content, Catalog); revenue-core domains (Product, Checkout, Payment) last, after multi-writer tables have one owner.
- **Regions**: primary region = main user base, zone-redundant. Second region: CDN edge for remote users + DR/standby (state it as an assumption if RTO/RPO unknown). If "data residency" is selected → separate data store per geography.
- **Skills gap**: if team skills lack the target cloud (or Kubernetes when chosen) → add enablement or a delivery partner on the critical path.
- **Must-keep integrations** that belong to another cloud (e.g. SES on Azure) → honor, flag as cross-cloud dependency.
