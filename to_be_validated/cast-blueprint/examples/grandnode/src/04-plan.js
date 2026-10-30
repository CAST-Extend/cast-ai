/* =====================================================================
   TARGET STATE ARCHITECTURE
   ===================================================================== */
const CSP = {
  AWS:{ name:"Amazon Web Services", color:"#E88B00", tint:"#FFF5E6", fw:"AWS Well-Architected Framework", edge:"Amazon CloudFront + AWS WAF", idp:"Amazon Cognito",
    run:{ managed:"Amazon ECS on AWS Fargate", k8s:"Amazon EKS", vm:"EC2 Auto Scaling groups" }, db:"Amazon DocumentDB (MongoDB-compatible)", dbha:"Multi-AZ", cache:"Amazon ElastiCache (Redis OSS)", obj:"Amazon S3",
    secrets:"AWS Secrets Manager", reg:"Amazon ECR", obs:"Amazon CloudWatch", email:"Amazon SES", net:"VPC + private subnets", zone:"Availability Zones" },
  Azure:{ name:"Microsoft Azure", color:"#0078D4", tint:"#EAF3FC", fw:"Azure Well-Architected Framework", edge:"Azure Front Door + WAF", idp:"Microsoft Entra ID",
    run:{ managed:"Azure Container Apps", k8s:"Azure Kubernetes Service (AKS)", vm:"Virtual Machine Scale Sets" }, db:"Azure Cosmos DB for MongoDB (vCore)", dbha:"high availability", cache:"Azure Cache for Redis", obj:"Azure Blob Storage",
    secrets:"Azure Key Vault", reg:"Azure Container Registry", obs:"Azure Monitor", email:"Azure Comm. Services Email", net:"VNet + private endpoints", zone:"availability zones" },
  GCP:{ name:"Google Cloud", color:"#1A73E8", tint:"#EAF1FD", fw:"Google Cloud Well-Architected Framework", edge:"Cloud CDN + Cloud Armor", idp:"Identity-Aware Proxy",
    run:{ managed:"Cloud Run", k8s:"GKE Autopilot", vm:"Managed instance groups" }, db:"MongoDB Atlas on Google Cloud", dbha:"multi-zone", cache:"Memorystore for Redis", obj:"Cloud Storage",
    secrets:"Secret Manager", reg:"Artifact Registry", obs:"Cloud Monitoring", email:"partner email service", net:"VPC + Private Service Connect", zone:"zones" },
};
const PILLAR_NAMES = { AWS:{ ops:"Operational Excellence", sec:"Security", rel:"Reliability", perf:"Performance Efficiency", cost:"Cost Optimization", sus:"Sustainability" }, Azure:{ ops:"Operational Excellence", sec:"Security", rel:"Reliability", perf:"Performance Efficiency", cost:"Cost Optimization" }, GCP:{ ops:"Operational excellence", sec:"Security, privacy and compliance", rel:"Reliability", perf:"Performance optimization", cost:"Cost optimization" } };
const DRIVER_PILLAR = { "Scalability":"perf", "Security & compliance":"sec", "Cost reduction":"cost", "Delivery speed":"ops", "Resilience":"rel", "End of support / skills":"ops" };
const FW_PRINCIPLE = { rel:"Design for failure: stateless instances across zones and a managed database with automatic failover.", sec:"Defense in depth: edge firewall, managed identity, secrets out of code, private data services.", perf:"Scale horizontally, serve static content from the edge, cache what is expensive.", cost:"Prefer managed services and scale in off-peak.", ops:"Infrastructure as code, CI/CD and centralized observability.", sus:"Scale down when idle." };
let tsCloud = null;
function F(text, key){ STMTS.push({k:"fw"}); return `<span class="stmt">${text}<button class="src fw" onclick="openFramework('${key}',this)">▲ Framework</button></span>`; }
function openFramework(key, btn){ highlight(btn); const c = tsCloud; document.getElementById("drawerKind").textContent = "Framework guidance"; document.getElementById("drawerTitle").textContent = `${PILLAR_NAMES[c][key]||PILLAR_NAMES.AWS[key]} — ${CSP[c].fw}`;
  document.getElementById("drawerBody").innerHTML = `<div class="infnote" style="background:#E0F2F5;color:#0B4F5E"><b>Principle.</b> ${FW_PRINCIPLE[key]}</div><p style="font-size:12.5px;color:var(--muted)">Paraphrased from the provider's published framework by the Well-Architected skill.</p>`; showDrawer(); }
function tsModel(){
  const cloud = tsCloud, c = CSP[cloud], v = ctxVal, skills = v("team_skills")||[], managed = v("tgt_managed"), style = v("tgt_style")||"Undecided";
  const runKind = style.startsWith("Rehost") ? "vm" : managed==="Prefer portable (Kubernetes)" ? "k8s" : managed==="Balanced" ? (skills.includes("Kubernetes")?"k8s":"managed") : "managed";
  const drivers = v("drivers")||[], weight = {}; ["ops","sec","rel","perf","cost","sus"].forEach(k=>weight[k]=0); drivers.forEach((d,i)=>{ weight[DRIVER_PILLAR[d]] += 3-i; });
  const regions = v("regions")||[], comp = v("compliance")||[], keep = v("keep_int")||[], as = [];
  if (!v("rto") || v("rto")===DK) as.push("Recovery targets not provided — assumed RTO 4 h / RPO 15 min.");
  as.push("A MongoDB-compatible managed service supports the MongoDB API features GrandNode uses — to be verified with a compatibility test (DocumentDB and Cosmos DB differ from MongoDB in some operators).");
  if (style==="Undecided") as.push("Target style undecided — containers assumed.");
  return { cloud, c, runKind, run:c.run[runKind], style, drivers, weight, regions, comp, keep, assumptions:as, avail:v("availability"), peaks:v("peaks") };
}
function tsDiagram(m){
  const c = m.c, col = c.color, IC = CLOUD_ICONS[m.cloud];
  const icon = (k,x,y,s=28) => IC[k] ? `<image href="${IC[k]}" x="${x}" y="${y}" width="${s}" height="${s}"/>` : "";
  const tile = (x,y,w,h,label,svc,keys=[]) => `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="#fff" stroke="#D9D6E0"/>${keys.map((k,i)=>icon(k,x+10+i*32,y+10)).join("")}<text x="${x+12+keys.length*32}" y="${y+26}" font-size="10.5" font-weight="700" fill="#6D6A71">${label}</text>${svc.match(/.{1,30}(\s|$)/g).slice(0,3).map((l,i)=>`<text x="${x+12}" y="${y+(keys.length?52:44)+i*13}" font-size="11.5" font-weight="600" fill="#0C0613">${esc(l.trim())}</text>`).join("")}</g>`;
  const ext = (x,y,label,svc) => `<g><rect x="${x}" y="${y}" width="170" height="52" rx="8" fill="#fff" stroke="#C7C9E0" stroke-dasharray="4 3"/><text x="${x+12}" y="${y+20}" font-size="10.5" font-weight="700" fill="#6D6A71">${label}</text><text x="${x+12}" y="${y+38}" font-size="11.5" font-weight="600" fill="#0C0613">${esc(svc)}</text></g>`;
  return `<svg viewBox="0 0 1060 600" font-family="Inter,sans-serif"><defs><marker id="tah" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="${col}"/></marker></defs>
    <text x="20" y="26" font-size="13" font-weight="800" fill="${col}">${c.name}</text>${ext(20,70,"Shoppers","browsers")}${ext(20,250,"Store staff","admin · SSO")}${ext(20,420,"API clients","Web API")}
    ${tile(215,150,180,90,"EDGE",c.edge,["edge","waf"])}
    <rect x="420" y="40" width="440" height="540" rx="14" fill="${c.tint}" stroke="${col}" stroke-width="1.5"/><text x="436" y="62" font-size="12" font-weight="800" fill="${col}">Primary region · ${esc((m.regions[0]||"region"))}</text><text x="436" y="78" font-size="10.5" fill="#6D6A71">${esc(c.net)} · across ${esc(c.zone)}</text>
    <rect x="440" y="96" width="402" height="150" rx="10" fill="#fff" stroke="${col}" stroke-dasharray="5 3"/>${icon(m.runKind==="vm"?"vm":"managed",452,104,30)}<text x="490" y="116" font-size="10.5" font-weight="700" fill="#6D6A71">CONTAINER RUNTIME</text><text x="490" y="134" font-size="12.5" font-weight="700" fill="#0C0613">${esc(m.run)}</text>
    <rect x="454" y="150" width="180" height="80" rx="8" fill="${col}"/><text x="544" y="176" text-anchor="middle" font-size="11.5" font-weight="700" fill="#fff">GrandNode</text><text x="544" y="194" text-anchor="middle" font-size="10" fill="#fff">storefront · admin · API</text><text x="544" y="210" text-anchor="middle" font-size="10" fill="#fff">stateless · autoscaled</text>
    <text x="648" y="174" font-size="10.5" fill="#0C0613">phase 2: admin console</text><text x="648" y="190" font-size="10.5" fill="#0C0613">and content services</text><text x="648" y="206" font-size="10.5" fill="#0C0613">split out</text>
    ${tile(440,262,196,100,"DOCUMENT DATABASE",c.db+" · "+c.dbha,["db"])}${tile(646,262,196,100,"CACHE",c.cache,["cache"])}
    ${tile(440,374,196,90,"MEDIA & FILES",c.obj,["obj"])}${tile(646,374,196,90,"SECRETS",c.secrets,["secrets"])}${tile(440,476,196,90,"IMAGES",c.reg,["reg"])}${tile(646,476,196,90,"OBSERVABILITY",c.obs,["obs"])}
    ${ext(880,120,"Payments",(m.keep.filter(k=>["PayPal","Braintree"].includes(k)).join(" · ")||"payment plugin")+" · tokenized")}${ext(880,200,"Shipping","rate plugins")}${ext(880,280,"Email",c.email)}
    <path d="M190,96 C205,96 200,180 213,190" stroke="${col}" stroke-width="2" fill="none" marker-end="url(#tah)"/><path d="M190,276 C205,276 200,210 213,205" stroke="${col}" stroke-width="2" fill="none" marker-end="url(#tah)"/><path d="M190,446 C300,446 380,230 452,200" stroke="${col}" stroke-width="2" fill="none" marker-end="url(#tah)"/>
    <path d="M395,195 L452,190" stroke="${col}" stroke-width="2" marker-end="url(#tah)"/><path d="M540,230 L540,260" stroke="${col}" stroke-width="1.5" marker-end="url(#tah)"/><path d="M600,230 C640,240 700,240 740,260" stroke="${col}" stroke-width="1.5" fill="none" marker-end="url(#tah)"/><path d="M500,230 C480,300 480,350 500,372" stroke="${col}" stroke-width="1.5" fill="none" marker-end="url(#tah)"/>
    <path d="M842,170 C860,170 860,146 878,146" stroke="#9A97A0" stroke-width="1.5" fill="none"/><path d="M842,190 C862,190 862,226 878,226" stroke="#9A97A0" stroke-width="1.5" fill="none"/><path d="M842,210 C866,210 866,306 878,306" stroke="#9A97A0" stroke-width="1.5" fill="none"/></svg>`;
}
function setTsCloud(k){ tsCloud = k; document.getElementById("doc").innerHTML = targetState(); paintGrounding(); }
function targetState(){
  const choice = ctxVal("tgt_cloud"); if (!tsCloud || !CSP[tsCloud]) tsCloud = CSP[choice] ? choice : "AWS";
  STMTS = []; const m = tsModel(), c = m.c, P = PILLAR_NAMES[m.cloud], pillars = Object.keys(P).sort((a,b)=>m.weight[b]-m.weight[a]);
  const rows = [
    ["ASP.NET Core app on VMs", C(esc(ctxVal("cur_runtime")||"—"),"cur_runtime"), m.run, F("Stateless containers scale out and replace freely.","rel")],
    ["Local files and media (TD-06)", X("81 file + 27 directory manipulation objects","cloud"), c.obj, F("No state on the instance's disk.","rel")],
    ["MongoDB · "+(ctxVal("cur_db")||"self-managed"), X("generic IRepository&lt;T&gt; over 100+ entity types","repos"), c.db, C(`Managed and ${c.dbha} for ${esc(m.avail||"")} availability.`,"availability","cur_db")],
    ["Redis cache", X("already used — a cloud booster","stats","cloud"), c.cache, F("Shared cache across instances.","perf")],
    ["AWS S3 storage", X("detected as cloud data storage","cloud"), c.obj, m.cloud==="AWS" ? C("Kept — the customer targets AWS.","tgt_cloud") : F("Consolidate on the target provider's storage.","cost")],
    ["Hard-coded URLs and insecure protocols", X("14 + 8 objects","cloud"), c.secrets, F("Configuration and secrets out of code.","sec")],
    ["Payment plugins", X("PayPal Standard IPN/PDT and others","coTx","ns"), "Kept; tokenized card handling", C(`Required for ${m.comp.join(" and ")||"compliance"}.`,"compliance","keep_int")],
    ["Admin console (1,147 actions)", X("the largest debt concentration","debtDom","tx"), "Same container first; rebuilt later", I("Moving it unchanged first keeps the migration small; rebuilding it is phase 4.","Sequencing judgment.","debtDom")],
  ];
  const decisions = [["Runtime", m.run, m.runKind==="managed"?[c.run.k8s, c.run.vm]:[c.run.managed], C(`Customer chose “${esc(ctxVal("tgt_managed")||"—")}”.`,"tgt_managed","team_skills")],
    ["Database", c.db, ["Self-managed MongoDB on VMs"], I("A managed MongoDB-compatible service removes database operations; compatibility must be tested first.","Trade-off between managed and native MongoDB.","repos")],
    ["Order placement", "Fix C-01/C-07 before migrating", ["Migrate as-is"], X("Payment is taken before the order is saved today.","placeOrder")],
    ["Decomposition", "Containerize first; split admin, content and media later", ["Big-bang microservices"], X("Checkout & Orders calls into 10 other domains.","coupling")]];
  const PB = { rel:()=>[F(`Spread across ${c.zone}; keep instances stateless.`,"rel"), C(`Availability ${esc(m.avail||"—")}.`,"availability")], sec:()=>[F(`${c.edge} at the edge, ${c.secrets} for secrets.`,"sec"), X("Upgrade TinyMCE, jQuery and the MongoDB driver first.","cve")],
    perf:()=>[F("Autoscale; serve media from the edge.","perf"), C(`Designed for ${esc(m.peaks||"—")} peaks.`,"peaks"), X("Fix the 18 queries inside loops.","flaws")], cost:()=>[F("Managed services; scale in off-peak.","cost"), C(`Compared with ${esc(ctxVal("cur_cost")||"—")} today.`,"cur_cost")],
    ops:()=>[F(`CI/CD into ${c.reg}; ${c.obs} for everything.`,"ops")], sus:()=>[F("Scale to baseline when idle.","sus"), X("800 green-IT findings to reduce over time.","green")] };
  const pill = pillars.map(k=>{ const w = m.weight[k]; return `<div class="pillar ${w?"w":""}"><div class="ph"><b>${P[k]}</b>${w?`<span class="wt">weight ${w}</span>`:""}</div><ul>${PB[k]().map(x=>`<li>${x}</li>`).join("")}</ul></div>`; }).join("");
  return `<div class="doc-head"><div><div class="eyebrow">Target State Architecture</div><h1>${APP} on ${c.name}</h1><div class="meta">CAST Imaging findings × customer context × ${c.fw}</div></div>
    <div class="doc-actions"><button class="btn btn-primary btn-sm" onclick="openExport(TS_FILES(),'Target state bundle','ADRs and diagram.')">Export for agents</button></div></div>
  <div class="tsbar"><div class="seg">${Object.keys(CSP).map(k=>`<button class="${k===m.cloud?"on":""}" onclick="setTsCloud('${k}')">${k}${k===choice?" ✓":""}</button>`).join("")}</div><span><a href="#" onclick="go('#/ws/ctx');return false">Edit customer context →</a></span></div>
  <div class="grounding" id="grounding"></div>
  <div class="recbox" style="border-left:4px solid ${c.color}"><div class="eyebrow">Recommendation</div><div class="rtext"><p>${C(`Move ${APP} to <b>${c.name}</b> as containers first, then services, prioritizing ${m.drivers.map(d=>d.toLowerCase()).join(", ")}.`,"tgt_cloud","tgt_style","drivers")}
    ${X("It is already a modern .NET application on MongoDB and Redis, and its cloud blockers are limited to file-system use.","stats","cloud")} ${I(`Run it on <b>${esc(m.run)}</b>, move media to <b>${esc(c.obj)}</b>, use <b>${esc(c.db)}</b> and <b>${esc(c.cache)}</b>.`,"Combines blockers, customer direction and framework patterns.","cloud","repos")}</p></div></div>
  <h2>Target architecture</h2><div class="archfig" style="background:#fff">${tsDiagram(m)}<div class="figcap">Official ${c.name} icons, used unmodified.</div></div>
  <h2>From today to target</h2><div class="tblwrap"><table class="tbl tsmap"><thead><tr><th>Today</th><th>What CAST / the customer says</th><th>Target</th><th>Why</th></tr></thead><tbody>${rows.map(r=>`<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td class="tsvc" style="border-left:3px solid ${c.color}">${esc(r[2])}</td><td>${r[3]}</td></tr>`).join("")}</tbody></table></div>
  <h2>Well-Architected pillars</h2><div class="pillars">${pill}</div>
  <h2>Decision log</h2>${decisions.map((d,i)=>`<div class="adr"><div class="adrh"><code>ADR-${String(i+1).padStart(2,"0")}</code><b>${d[0]}</b></div><div class="adrb"><div><span class="k">Decision</span>${esc(d[1])}</div><div><span class="k">Rejected</span>${d[2].map(esc).join(" · ")}</div><div class="why"><span class="k">Because</span>${d[3]}</div></div></div>`).join("")}
  <h2>Assumptions</h2><div class="clar"><ul style="margin:0;padding-left:18px">${m.assumptions.map(a=>`<li style="margin-bottom:6px">${esc(a)}</li>`).join("")}</ul></div>`;
}
function TS_FILES(){ const m = tsModel(), c = m.c; const mer = () => `flowchart LR\n  users([Shoppers / staff]) --> edge[${c.edge}] --> app[GrandNode · ${m.run}]\n  app --> db[(${c.db})]\n  app --> cache[(${c.cache})]\n  app --> obj[(${c.obj})]`;
  return [[`target-state/${m.cloud.toLowerCase()}/target-state.md`, () => `# Target State — ${APP} on ${c.name}\n\n\`\`\`mermaid\n${mer()}\n\`\`\`\n`]]; }

/* =====================================================================
   ESTIMATED RUNNING COSTS
   ===================================================================== */
const DBX = { AWS:{hr:0.277, name:"DocumentDB db.r6g.large (approx.)"}, Azure:{hr:0.24, name:"Cosmos DB for MongoDB vCore M30 (approx.)"}, GCP:{hr:0.30, name:"MongoDB Atlas M30 (approx.)"} };
function Pr(text, cloud){ STMTS.push({k:"price"}); return `<span class="stmt">${text}<button class="src price" onclick="openPrices('${cloud}',this)">$ Price list</button></span>`; }
function openPrices(cloud, btn){ highlight(btn); const p = PRICES[cloud], d = DBX[cloud]; document.getElementById("drawerKind").textContent = p.live?"Public price list":"Approximate public prices"; document.getElementById("drawerTitle").textContent = `${CSP[cloud].name} · ${p.region}`;
  document.getElementById("drawerBody").innerHTML = `<div class="infnote"><b>${p.live?"Container, cache, storage and log prices pulled live (2026-09-26)":"Approximate list prices"}.</b> The MongoDB-compatible database price is approximate on every cloud.</div><div class="ev"><table>
    <tr><td class="l">Containers — vCPU-hour</td><td>$${(p.vcpuSec*3600).toFixed(4)}</td></tr><tr><td class="l">Containers — GiB-hour</td><td>$${(p.gibSec*3600).toFixed(4)}</td></tr><tr><td class="l">${d.name}</td><td>$${d.hr}/hour per node</td></tr>
    <tr><td class="l">Cache (prod)</td><td>$${p.cacheProd.hr}/hour</td></tr><tr><td class="l">Object storage</td><td>$${p.objGB}/GB-month</td></tr><tr><td class="l">Edge data out</td><td>$${p.edgeGB}/GB</td></tr></table></div>`; showDrawer(); }
function costModel(cloud){
  const p = PRICES[cloud], d = DBX[cloud], v = ctxVal, as = [];
  const pick = (id, map, def, label) => { const x = v(id); if (map[x]!==undefined) return map[x]; as.push(`${label}: assumed ${def.label}`); return def.val; };
  const size = pick("users_peak", {"< 100":{rep:2,cpu:1,mem:2,db:2},"100–1,000":{rep:2,cpu:2,mem:4,db:2},"1,000–10,000":{rep:4,cpu:2,mem:4,db:3},"10,000+":{rep:8,cpu:2,mem:4,db:3}}, {val:{rep:4,cpu:2,mem:4,db:3},label:"1,000–10,000 users"}, "Peak users");
  const peakX = pick("peaks", {"None":1,"2×":2,"5×":5,"10× or more":10}, {val:2,label:"2×"}, "Seasonal peak");
  const dbGB = pick("db_size", {"< 50 GB":50,"50–250 GB":256,"250 GB–1 TB":1024,"> 1 TB":2048}, {val:256,label:"256 GB"}, "Database size");
  const mediaGB = pick("media_size", {"< 100 GB":100,"100–500 GB":500,"500 GB–2 TB":2000,"> 2 TB":4000}, {val:500,label:"500 GB"}, "Media");
  const egressGB = pick("traffic", {"< 500 GB":500,"500 GB–2 TB":2000,"2–10 TB":10000,"> 10 TB":20000}, {val:2000,label:"2 TB"}, "Data served");
  const envs = pick("cur_envs", {"1":1,"2":2,"3":3,"4+":4}, {val:3,label:"3 environments"}, "Environments");
  const replicaMo = (size.cpu*p.vcpuSec + size.mem*p.gibSec) * SECS, L = p.labels;
  const prod = [
    { svc:L.run, basis:`${size.rep} replicas × ${size.cpu} vCPU / ${size.mem} GiB`, m: size.rep*replicaMo + p.envHour*HRS },
    { svc:d.name.replace(" (approx.)",""), basis:`${size.db}-node cluster + ${dbGB} GB storage`, m: size.db*d.hr*HRS + dbGB*0.10 },
    { svc:L.cache, basis:p.cacheProd.name, m: p.cacheProd.hr*HRS },
    { svc:L.obj, basis:`${mediaGB} GB media and files`, m: mediaGB*p.objGB },
    { svc:L.edge, basis:`${(egressGB/1000).toFixed(1)} TB out`, m: p.edgeBase + egressGB*p.edgeGB },
    { svc:L.sec, basis:"secrets", m: 100*p.vaultOps10k + 10 },
    { svc:L.obs, basis:`~${size.rep*50} GB logs`, m: size.rep*50*p.logGB },
  ];
  const npEnv = replicaMo*0.5 + d.hr*HRS*0.5 + p.cacheNP.hr*HRS + 10*p.logGB, nonprodEnvs = Math.max(envs-1,0);
  const prodMo = prod.reduce((a,b)=>a+b.m,0), npMo = npEnv*nonprodEnvs, peakExtra = (Math.min(size.rep*peakX, size.rep*6)-size.rep)*replicaMo;
  const annual = (prodMo+npMo)*12 + peakExtra*1.5;
  const curMap = {"< $50K":[25000,50000],"$50K–150K":[50000,150000],"$150K–500K":[150000,500000],"> $500K":[500000,1000000]};
  return { p, prod, prodMo, npMo, npEnv, nonprodEnvs, peakExtra, annual, current: curMap[v("cur_cost")]||null, assumptions:as, size };
}
function costEstimate(){
  const choice = ctxVal("tgt_cloud"); if (!tsCloud || !CSP[tsCloud]) tsCloud = CSP[choice] ? choice : "AWS";
  STMTS = []; const cloud = tsCloud, m = costModel(cloud), c = CSP[cloud], p = m.p, $ = v => "$"+Math.round(v).toLocaleString("en-US"), $k = v => "$"+Math.round(v/1000)+"K";
  const mo = m.prodMo + m.npMo, low = m.annual*0.8, high = m.annual*1.3, max = Math.max(...m.prod.map(r=>r.m)), cur = m.current;
  return `<div class="doc-head"><div><div class="eyebrow">Estimated Running Costs</div><h1>${APP} on ${c.name}</h1><div class="meta">Target state × customer sizing × ${p.live?"live":"approximate"} public prices · ${p.region}</div></div>
    <div class="doc-actions"><button class="btn btn-primary btn-sm" onclick="openExport(COST_FILES(),'Cost estimate','CSV and Markdown.')">Export for agents</button></div></div>
  <div class="tsbar"><div class="seg">${Object.keys(CSP).map(k=>`<button class="${k===cloud?"on":""}" onclick="tsCloud='${k}';document.getElementById('doc').innerHTML=costEstimate();paintGrounding()">${k}${k===choice?" ✓":""}</button>`).join("")}</div><span>${p.live?"● Live prices (Azure)":"● Approximate prices"}</span></div>
  <div class="grounding" id="grounding"></div>
  <div class="kpis" style="grid-template-columns:repeat(4,1fr);margin-top:22px"><div class="kpi"><div class="v">${$(mo)}</div><div class="l">Expected per month</div></div><div class="kpi"><div class="v">${$(mo+m.peakExtra)}</div><div class="l">Peak month</div></div>
    <div class="kpi"><div class="v">${$k(m.annual)}</div><div class="l">Expected per year</div><div class="s">${$k(low)}–${$k(high)}</div></div><div class="kpi"><div class="v">${cur?$k(cur[0])+"–"+$k(cur[1]):"—"}</div><div class="l">Today, per year</div></div></div>
  <div class="recbox" style="border-left:4px solid ${c.color}"><div class="eyebrow">Estimate</div><div class="rtext"><p>${I(`About <b>${$(mo)} a month</b> and <b>${$k(m.annual)} a year</b>.`,"Sizing heuristics × unit prices.","stats")} ${cur?C(`Today: ${$k(cur[0])}–${$k(cur[1])} a year.`,"cur_cost"):""} ${I("Today's figure likely includes staff and data-center costs this estimate excludes.","Scope difference.","stats")}</p></div></div>
  <h2>Cost by service — production</h2><div class="tblwrap"><table class="tbl costs"><thead><tr><th>Service</th><th>Sized as</th><th style="text-align:right">Per month</th><th style="width:150px"></th></tr></thead><tbody>
    ${m.prod.map(r=>`<tr><td><b>${esc(r.svc)}</b></td><td>${esc(r.basis)}</td><td style="text-align:right;font-weight:700">${$(r.m)}</td><td><div class="cbar" style="width:${Math.max(2,Math.round(r.m/max*140))}px;background:${c.color}"></div></td></tr>`).join("")}
    <tr class="tot"><td><b>Production</b></td><td>${Pr("Unit prices and sources","cloud"===cloud?"AWS":cloud)}</td><td style="text-align:right">${$(m.prodMo)}</td><td></td></tr><tr><td><b>Non-production</b></td><td>${C(`${m.nonprodEnvs} environments`,"cur_envs")}</td><td style="text-align:right;font-weight:700">${$(m.npMo)}</td><td></td></tr></tbody></table></div>
  <h2>Assumptions</h2><div class="clar"><ul style="margin:0;padding-left:18px">${m.assumptions.map(a=>`<li>${esc(a)}</li>`).join("")}<li>The MongoDB-compatible database price is approximate on every cloud; refresh before sharing.</li></ul></div>`;
}
function COST_FILES(){ const cloud = tsCloud||"AWS", m = costModel(cloud); return [[`costs/${cloud.toLowerCase()}/estimate.csv`, () => [["Service","Sized as","Monthly"],...m.prod.map(r=>[r.svc,r.basis,r.m.toFixed(2)])].map(r=>r.map(x=>`"${x}"`).join(",")).join("\n")]]; }

/* =====================================================================
   MODERNIZATION PLAN
   ===================================================================== */
const PLAN_START = new Date(2026,10,2);
const PHASES = [["P0","Decide & prepare","Answer the questions, build the safety net and the cloud foundation.",8,0.9],["P1","Fix & harden","Make order placement safe and close the vulnerabilities.",10,0.65],["P2","Make it cloud-ready","Media to object storage, managed data services, containers.",14,0.65],["P3","Migrate & cut over","Data migration, peak test, cutover.",12,0.85],["P4","Modernize","Rebuild the admin console; separate loosely coupled domains.",40,0.6]];
const WPS = [
  ["WP-01","P0","Resolve the 8 checkout and order clarifications",1,2,1.0,false,{c:["C-01","C-02","C-03","C-04","C-05","C-06","C-07","C-08"]},["8 questions raised by the order code.","placeOrder","cancelSrc"],[]],
  ["WP-02","P0","Cloud foundation — network, identity, infrastructure as code",5,8,0.8,false,{adr:["ADR-01"]},["Containers, managed MongoDB-compatible database, Redis, object storage.","stats"],[]],
  ["WP-03","P0","CI/CD, container registry and dependency-scanning gate",3,5,0.7,true,{},["One deployable; no package inventory today.","pkgNone"],[]],
  ["WP-04","P0","Checkout regression suite (Gherkin + end-to-end)",6,10,0.5,true,{br:[RP+"002",RP+"004",RP+"006",RP+"008",RP+"017",RP+"019",RP+"020",RP+"021",RP+"025"]},["26 checkout entry points; both checkout flows.","coTx"],[]],
  ["WP-05","P0","Cloud skills enablement or partner",2,4,1.0,false,{},["Team skills listed do not include the target cloud.","stats"],[],"skill"],
  ["WP-06","P1","Make order placement and cancellation safe",4,6,0.6,true,{td:["TD-01","TD-02"],c:["C-01","C-02","C-03","C-04","C-07"]},["PlaceOrder and CancelOrder in OrderProcessingService.","placeOrder","cancelSrc"],["WP-01","WP-04"]],
  ["WP-07","P1","Backend security: MongoDB driver, file upload and paths, verify name matches",3,5,0.6,true,{td:["TD-04","TD-05"]},["1 high driver CVE; 8 upload/path objects; 2 likely false matches.","cve","iso"],[]],
  ["WP-08","P1","Front-end libraries: TinyMCE, jQuery, CodeMirror",3,6,0.5,true,{td:["TD-03"]},["35 CVEs in three libraries.","cve"],[]],
  ["WP-09","P1","Queries in loops, empty catches, disposables",2,4,0.5,true,{td:["TD-09","TD-12"]},["18 + 27 + 61 objects.","flaws","iso"],[]],
  ["WP-10","P2","Media and files to object storage",5,8,0.6,true,{td:["TD-06"]},["81 file and 27 directory manipulation objects.","cloud"],["WP-02"]],
  ["WP-11","P2","Configuration, secrets, URLs and protocols",2,3,0.6,true,{td:["TD-07"]},["14 hard-coded URLs, 8 insecure protocols, 1 IP.","cloud"],["WP-02"]],
  ["WP-12","P2","Managed MongoDB-compatible database and managed Redis",4,7,0.8,false,{adr:["ADR-02"]},["Generic repository over 100+ entity types; compatibility test first.","repos"],["WP-02"]],
  ["WP-13","P2","Containerize and observability",3,5,0.7,true,{},["One ASP.NET Core application with plugins.","stats"],["WP-03","WP-10","WP-11"]],
  ["WP-14","P3","Peak load test and performance fixes",3,5,0.7,true,{td:["TD-08"]},["3,881 awaits without ConfigureAwait; peak from customer context.","iso"],["WP-13"]],
  ["WP-15","P3","Data migration, cutover and hypercare",5,8,0.9,false,{},["2,229 entry points to verify.","tx"],["WP-12","WP-14"]],
  ["WP-16","P4","Rebuild the admin console front end",16,28,0.55,true,{td:["TD-10","TD-11"]},["1,147 admin actions; 3,649 admin findings.","tx","debtDom"],["WP-15"]],
  ["WP-17","P4","Separate Content & Community and Media",8,12,0.6,true,{},["The least-coupled domains.","coupling"],["WP-15"]],
  ["WP-18","P4","One owner for Order and Product; then Catalog and Checkout services",20,32,0.65,true,{td:["TD-14"]},["Order used by 4 domains, Product by 5.","repos","coupling"],["WP-17"]],
];
const RATE = 4000, OVERHEAD = 0.35; let planMode = "manual";
const addW = (d,w) => new Date(d.getTime() + w*7*864e5), fmtD = d => d.toLocaleDateString("en-US",{month:"short",year:"numeric"}), fmtDay = d => d.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
function planModel(mode){
  const ai = mode==="ai", skills = ctxVal("team_skills")||[], cloud = ctxVal("tgt_cloud"), gap = CSP[cloud] && !skills.includes(cloud);
  const wps = WPS.filter(w=> w[10]!=="skill" || gap), freeze = ctxVal("peaks") && ctxVal("peaks")!=="None";
  const fr1 = [new Date(2026,10,15), new Date(2027,0,5)], fr2 = [new Date(2027,10,15), new Date(2028,0,5)];
  const dl = { "< 6 months":6, "6–12 months":12, "12–24 months":24 }[ctxVal("deadline")], deadline = dl ? new Date(PLAN_START.getFullYear(), PLAN_START.getMonth()+dl, 0) : null;
  const dur = p => p[3]*(ai?p[4]:1), S = {};
  S.P0 = [PLAN_START, addW(PLAN_START, dur(PHASES[0]))]; S.P1 = [addW(PLAN_START,2), addW(PLAN_START, 2+dur(PHASES[1]))];
  const p2s = new Date(Math.max(S.P0[1], freeze ? fr1[1] : S.P0[1])); S.P2 = [p2s, addW(p2s, dur(PHASES[2]))]; const p3s = addW(S.P2[1],-2); S.P3 = [p3s, addW(p3s, dur(PHASES[3]))];
  const cutover = addW(S.P3[1],-3); const p4s = addW(S.P3[1],2); S.P4 = [p4s, addW(p4s, dur(PHASES[4]))];
  const eff = w => [w[3]*(ai?w[5]:1), w[4]*(ai?w[5]:1)], sum = ph => wps.filter(w=>ph.includes(w[1])).reduce((a,w)=>{ const e=eff(w); return [a[0]+e[0],a[1]+e[1]]; },[0,0]);
  const core = sum(["P0","P1","P2","P3"]), later = sum(["P4"]), coreT = core.map(x=>x*(1+OVERHEAD)), laterT = later.map(x=>x*(1+OVERHEAD)), weeks = (S.P3[1]-S.P0[0])/(7*864e5);
  const budgetMap = {"< $250K":[0,250000],"$250K–1M":[250000,1000000],"$1M–3M":[1000000,3000000],"> $3M":[3000000,6000000]};
  return { ai, wps, S, cutover, freeze, fr1, fr2, deadline, coreT, laterT, fte: coreT.map(x=>x/weeks), gap, cloud, eff, budget: budgetMap[ctxVal("budget")], critical: new Date(2026,10,13) };
}
function planGantt(pm){
  const t0 = new Date(2026,10,1), t1 = new Date(2028,3,1), W = 1000, X0 = 170, x = d => X0 + (Math.min(d,t1)-t0)/(t1-t0)*(W-X0-10), rows = PHASES.map((p,i)=>({p, y:70+i*62})), col = { P0:"#463589", P1:"#C4320A", P2:"#624ABB", P3:"#0C0613", P4:"#9A97A0" };
  let s = `<svg viewBox="0 0 ${W} 420" font-family="Inter,sans-serif">`;
  for (let m = new Date(t0); m < t1; m = new Date(m.getFullYear(), m.getMonth()+1, 1)) { const xx = x(m); s += `<line x1="${xx}" y1="36" x2="${xx}" y2="380" stroke="#F0EEF3"/>`; if (m.getMonth()%3===0) s += `<text x="${xx+3}" y="30" font-size="10.5" fill="#6D6A71">${m.toLocaleDateString("en-US",{month:"short"})} ${String(m.getFullYear()).slice(2)}</text>`; }
  if (pm.freeze) [pm.fr1, pm.fr2].forEach(([a,b])=> s += `<rect x="${x(a)}" y="36" width="${x(b)-x(a)}" height="344" fill="#FEF3F2"/><text x="${(x(a)+x(b))/2}" y="396" text-anchor="middle" font-size="10" font-weight="700" fill="#B42318">peak freeze</text>`);
  rows.forEach(({p,y})=>{ const [a,b] = pm.S[p[0]]; s += `<text x="10" y="${y+17}" font-size="12" font-weight="700" fill="#0C0613">${p[0]} · ${p[1]}</text><rect x="${x(a)}" y="${y}" width="${Math.max(6,x(b)-x(a))}" height="26" rx="6" fill="${col[p[0]]}" opacity="${p[0]==="P4"?.55:1}"/>
    ${x(b)-x(a)>130 ? `<text x="${x(a)+8}" y="${y+17}" font-size="10.5" font-weight="600" fill="#fff">${fmtD(a)} – ${fmtD(b)}</text>` : `<text x="${x(b)+8}" y="${y+17}" font-size="10.5" font-weight="600" fill="#6D6A71">${fmtD(a)} – ${fmtD(b)}</text>`}`; });
  [[pm.S.P0[1],"G1 decisions",0,"#0E7490",-15,"start"],[pm.S.P2[1],"G2 regression green",2,"#0E7490",-15,"end"],[addW(pm.cutover,-4),"G3 peak test",3,"#0E7490",33,"end"],[pm.cutover,"CUTOVER",3,"#067647",33,"start"]].forEach(([d,l,r,c,dy,anc])=>{ const y = rows[r].y+13, xx = x(d);
    s += `<path d="M${xx},${y-9} l9,9 l-9,9 l-9,-9 z" fill="${c}" stroke="#fff" stroke-width="1.5"/><text x="${xx+(anc==="start"?-6:6)}" y="${y+dy}" text-anchor="${anc}" font-size="10" font-weight="700" fill="${c}">${l}</text>`; });
  if (pm.deadline) { const xx = x(pm.deadline); s += `<line x1="${xx}" y1="36" x2="${xx}" y2="380" stroke="#B42318" stroke-dasharray="5 4" stroke-width="1.5"/><text x="${xx+4}" y="48" font-size="10" font-weight="700" fill="#B42318">deadline</text>`; }
  return s + `</svg>`;
}
function openWP(id){
  const w = WPS.find(x=>x[0]===id), pm = planModel(planMode), e = pm.eff(w), L = w[7]||{}, rules = (L.br||[]).map(b=>RULES.find(r=>r[0]===b)).filter(Boolean);
  const gherkin = rules.filter(r=>r[10]).map(r=>`  Scenario: ${r[4]}\n    Given ${r[10][0]}\n    When ${r[10][1]}\n    Then ${r[10][2].replace(/ \(fails today[^)]*\)/,"")}`).join("\n\n");
  document.getElementById("drawerKind").textContent = "Work package"; document.getElementById("drawerTitle").textContent = `${w[0]} · ${w[2]}`;
  document.getElementById("drawerBody").innerHTML = `<div class="ev"><div class="evh"><b>Package contents</b><code class="call">${PHASES.find(p=>p[0]===w[1])[1]} · ${e[0].toFixed(0)}–${e[1].toFixed(0)} person-weeks</code></div><table><tr><td class="l">Scope evidence</td><td style="text-align:left">${esc(w[8][0])}</td></tr>
    ${L.td?`<tr><td class="l">Debt</td><td>${L.td.join(", ")}</td></tr>`:""}${L.c?`<tr><td class="l">Clarifications</td><td>${L.c.join(", ")}</td></tr>`:""}<tr><td class="l">Depends on</td><td>${w[9].join(", ")||"—"}</td></tr></table></div>
    ${gherkin?`<div class="ev"><div class="evh"><b>Acceptance tests</b></div><pre>${esc(gherkin)}</pre></div>`:""}${w[8].slice(1).map(evCard).join("")}`; showDrawer();
}
function setPlanMode(m){ planMode = m; document.getElementById("doc").innerHTML = modPlan(); paintGrounding(); }
function modPlan(){
  STMTS = []; const pm = planModel(planMode), man = planModel("manual"), aim = planModel("ai"), pw = r => `${Math.round(r[0])}–${Math.round(r[1])}`, $k = v => "$"+Math.round(v/1000)+"K", cost = pm.coreT.map(x=>x*RATE), monthsTo = d => Math.round((d-PLAN_START)/(30.4*864e5));
  const phaseCards = PHASES.map(p=>{ const ws = pm.wps.filter(w=>w[1]===p[0]); const [a,b] = pm.S[p[0]];
    return `<div class="phase"><div class="phh"><div><code>${p[0]}</code> <b>${p[1]}</b><span>${p[2]}</span></div><span class="phd">${fmtD(a)} – ${fmtD(b)}</span></div>${ws.map(w=>{ const e = pm.eff(w); return `<div class="wp" onclick="openWP('${w[0]}')"><span class="wid">${w[0]}</span><div><b>${w[2]}</b><div class="wbasis">${w[10]==="skill"?C(esc(w[8][0]),"team_skills","tgt_cloud"):X(esc(w[8][0]),...w[8].slice(1))}</div>
      <div class="wlinks">${[...(w[7].td||[]),...(w[7].c||[])].map(l=>`<span>${l}</span>`).join("")}${w[9].length?`<span class="dep">after ${w[9].join(", ")}</span>`:""}</div></div><div class="wmeta"><span class="pw">${Math.round(e[0])}–${Math.round(e[1])} pw</span></div></div>`; }).join("")}</div>`; }).join("");
  return `<div class="doc-head"><div><div class="eyebrow">Modernization Plan</div><h1>${APP} → ${CSP[pm.cloud]?.name||"target"}</h1><div class="meta">Order of operations from CAST findings, target state and constraints · starts ${fmtDay(PLAN_START)}</div></div>
    <div class="doc-actions"><button class="btn btn-primary btn-sm" onclick="openExport(PLAN_FILES(),'Work packages','One Markdown file per package.')">Export for agents</button></div></div>
  <div class="tsbar"><div class="seg"><button class="${planMode==="manual"?"on":""}" onclick="setPlanMode('manual')">Manual delivery</button><button class="${planMode==="ai"?"on":""}" onclick="setPlanMode('ai')">AI-assisted delivery</button></div></div>
  <div class="grounding" id="grounding"></div>
  <div class="kpis" style="grid-template-columns:repeat(4,1fr);margin-top:22px"><div class="kpi"><div class="v">${fmtD(pm.cutover)}</div><div class="l">Cutover</div><div class="s">${monthsTo(pm.cutover)} months${pm.deadline?` · deadline ${fmtD(pm.deadline)}`:""}</div></div>
    <div class="kpi"><div class="v">${pw(pm.coreT)}</div><div class="l">Person-weeks to cutover</div></div><div class="kpi"><div class="v">${pm.fte[0].toFixed(1)}–${pm.fte[1].toFixed(1)}</div><div class="l">FTE</div></div>
    <div class="kpi"><div class="v">${$k(cost[0])}–${$k(cost[1])}</div><div class="l">Delivery cost to cutover</div><div class="s">${pm.budget?(cost[1]<=pm.budget[1]?"within":"above")+" budget":""}</div></div></div>
  <div class="recbox" style="border-left:4px solid var(--purple)"><div class="eyebrow">The plan in brief</div><div class="rtext"><p>${I(`Make checkout safe and close the vulnerabilities, move media and data to managed services, containerize, cut over by <b>${fmtD(pm.cutover)}</b>; rebuild the admin console and separate domains afterwards.`,"Sequencing from the findings and the coupling.","placeOrder","cloud","coupling")}
    ${pm.freeze?C("The seasonal peak is a change freeze.","peaks","notes"):""} ${pm.gap?C(`No ${pm.cloud} skills listed — enablement in phase 0.`,"team_skills","tgt_cloud"):""}</p></div></div>
  <h2>Timeline</h2><div class="archfig" style="background:#fff">${planGantt(pm)}</div>
  <h2>Manual vs. AI-assisted</h2><div class="tblwrap"><table class="tbl"><thead><tr><th></th><th style="text-align:right">Manual</th><th style="text-align:right">AI-assisted</th></tr></thead><tbody>
    <tr><td><b>Cutover</b></td><td style="text-align:right">${fmtD(man.cutover)}</td><td style="text-align:right">${fmtD(aim.cutover)}</td></tr><tr><td><b>Person-weeks to cutover</b></td><td style="text-align:right">${pw(man.coreT)}</td><td style="text-align:right">${pw(aim.coreT)}</td></tr>
    <tr><td><b>Phase 4 (modernize)</b></td><td style="text-align:right">${pw(man.laterT)}</td><td style="text-align:right">${pw(aim.laterT)}</td></tr></tbody></table></div>
  <p style="font-size:13px;color:var(--muted)">${I("AI factors are planning assumptions per package, not measured results.","Assumption.","tx")}</p>
  <h2>Phases and work packages</h2>${phaseCards}
  <h2>Assumptions</h2><div class="clar"><ul style="margin:0;padding-left:18px"><li>Effort sized from CAST scope counts; +${Math.round(OVERHEAD*100)}% overhead; $${RATE.toLocaleString()} per person-week.</li><li>Run costs during the parallel run are in Return on Investment.</li></ul></div>`;
}
function PLAN_FILES(){ const pm = planModel(planMode); return [["plan/modernization-plan.csv", () => [["Package","Phase","Title","Low","High"],...pm.wps.map(w=>{const e=pm.eff(w); return [w[0],w[1],w[2],Math.round(e[0]),Math.round(e[1])];})].map(r=>r.map(x=>`"${x}"`).join(",")).join("\n")],
  ...pm.wps.map(w=>[`work-packages/${w[0]}.md`, () => `# ${w[0]} — ${w[2]}\n\n${w[8][0]}\n\nDepends on: ${w[9].join(", ")||"—"}\n`])]; }

/* =====================================================================
   RETURN ON INVESTMENT
   ===================================================================== */
const ROI_CUR = {"< $50K":[25000,50000],"$50K–150K":[50000,150000],"$150K–500K":[150000,500000],"> $500K":[500000,1000000]};
function roiModel(mode){
  const cloud = tsCloud || (CSP[ctxVal("tgt_cloud")] ? ctxVal("tgt_cloud") : "AWS"), cm = costModel(cloud), pm = planModel(mode), cur = ROI_CUR[ctxVal("cur_cost")];
  const runMo = cm.prodMo + cm.npMo, run = [cm.annual*0.8, cm.annual, cm.annual*1.3], deliv = [pm.coreT[0]*RATE, (pm.coreT[0]+pm.coreT[1])/2*RATE, pm.coreT[1]*RATE];
  const monthsTo = Math.max(1, Math.round((pm.cutover-PLAN_START)/(30.4*864e5))), parMonths = Math.max(1, Math.round((pm.cutover-pm.S.P3[0])/(30.4*864e5))), parallel = runMo*parMonths;
  const scen = (curA, runA, upfront) => { const saveMo = (curA-runA)/12, curve = []; let c = 0; for (let m = 1; m <= 60; m++) { c += m <= monthsTo ? -upfront/monthsTo : saveMo; curve.push(c); }
    return { curA, runA, upfront, saveYr: curA-runA, pay: saveMo>0 ? monthsTo + Math.ceil(upfront/saveMo) : null, net3: curve[35], net5: curve[59], roi5: curve[59]/upfront, curve }; };
  const mid = cur ? (cur[0]+cur[1])/2 : null;
  return { cloud, cm, pm, cur, parMonths, monthsTo, S: cur ? { conservative: scen(cur[0], run[2], deliv[2]+parallel), expected: scen(mid, run[1], deliv[1]+parallel), optimistic: scen(cur[1], run[0], deliv[0]+parallel) } : null };
}
function setRoiMode(m){ planMode = m; document.getElementById("doc").innerHTML = roiPage(); paintGrounding(); }
function roiPage(){
  STMTS = []; const r = roiModel(planMode), c = CSP[r.cloud]; if (!r.S) return docHead("Plan","Return on Investment","Needs today's annual run cost.");
  const $k = v => (v<0?"−":"")+"$"+(Math.abs(v)>=1e6 ? (Math.abs(v)/1e6).toFixed(2)+"M" : Math.round(Math.abs(v)/1000)+"K"), yrs = m => m==null ? "never" : m > 60 ? "over 5 years" : m < 12 ? `${m} months` : `${(m/12).toFixed(1)} years`;
  const e = r.S.expected, cons = r.S.conservative, opt = r.S.optimistic, col = v => v>=0 ? "var(--good)" : "var(--crit)";
  return `<div class="doc-head"><div><div class="eyebrow">Return on Investment</div><h1>Modernizing ${APP} to ${c.name}</h1><div class="meta">5-year view from ${fmtDay(PLAN_START)}</div></div>
    <div class="doc-actions"><button class="btn btn-primary btn-sm" onclick="openExport(ROI_FILES(),'ROI summary','Markdown and CSV.')">Export for agents</button></div></div>
  <div class="tsbar"><div class="seg"><button class="${planMode==="manual"?"on":""}" onclick="setRoiMode('manual')">Manual delivery</button><button class="${planMode==="ai"?"on":""}" onclick="setRoiMode('ai')">AI-assisted delivery</button></div></div>
  <div class="grounding" id="grounding"></div>
  <div class="roiverdict"><div class="rv-main"><div class="eyebrow" style="color:#B8A9EE">The answer</div><div class="rv-big">Pays back in <b>${yrs(e.pay)}</b></div>
    <div class="rv-sub">${I(`About <b>${$k(e.upfront)}</b> upfront cuts run cost by about <b>${$k(e.saveYr)} a year</b>; 5-year net <b>${$k(e.net5)}</b> (${Math.round(e.roi5*100)}%).`,"Expected scenario: midpoints of today's cost and delivery estimate, plus the parallel run.","stats")}</div></div>
    <div class="rv-range"><div><span>Conservative</span><b>${yrs(cons.pay)}</b></div><div><span>Optimistic</span><b>${yrs(opt.pay)}</b></div><div class="rv-note">payback range</div></div></div>
  <div class="kpis" style="grid-template-columns:repeat(4,1fr);margin-top:14px"><div class="kpi"><div class="v">${$k(e.curA)}</div><div class="l">Run cost today</div><div class="s">${C(`range ${$k(r.cur[0])}–${$k(r.cur[1])}`,"cur_cost")}</div></div>
    <div class="kpi"><div class="v">${$k(e.runA)}</div><div class="l">Run cost on ${r.cloud}</div><div class="s">${Pr("public prices",r.cloud)}</div></div><div class="kpi"><div class="v">${$k(e.upfront)}</div><div class="l">Upfront</div><div class="s">delivery + ${r.parMonths}-month parallel run</div></div>
    <div class="kpi"><div class="v" style="color:${col(e.net5)}">${$k(e.net5)}</div><div class="l">Net over 5 years</div></div></div>
  <h2>Cumulative cash position</h2><div class="archfig" style="background:#fff">${roiCurve(r)}</div>
  <h2>Three scenarios</h2><div class="tblwrap"><table class="tbl"><thead><tr><th></th><th style="text-align:right">Conservative</th><th style="text-align:right">Expected</th><th style="text-align:right">Optimistic</th></tr></thead><tbody>
    ${[["Run cost today","curA"],["Run cost target","runA"],["Upfront","upfront"],["Annual savings","saveYr"],["5-year net","net5"]].map(([l,k])=>`<tr><td>${l}</td>${[cons,e,opt].map(s=>`<td style="text-align:right">${$k(s[k])}</td>`).join("")}</tr>`).join("")}
    <tr><td><b>Payback</b></td>${[cons,e,opt].map(s=>`<td style="text-align:right;font-weight:700">${yrs(s.pay)}</td>`).join("")}</tr></tbody></table></div>
  <h2>Value not in these numbers</h2><ul class="plain"><li>${X("A checkout that cannot charge without an order (C-01, C-07).","placeOrder")}</li><li>${X("44 known vulnerabilities addressed, including the MongoDB driver advisory.","cve")}</li><li>${C("A platform that scales for the seasonal peak.","peaks")}</li></ul>`;
}
function ROI_FILES(){ const r = roiModel(planMode); return [["roi/roi-summary.md", () => Object.entries(r.S).map(([n,s])=>`- ${n}: payback ${s.pay??"never"} months, 5-yr net $${Math.round(s.net5).toLocaleString()}`).join("\n")]]; }

function placeholder(d){ const deps = PLAN_DEPS[d.id];
  return `${docHead(d.group, d.name, d.blurb)}<div class="ph-hero"><span class="gtag ctx">${S_LABEL[statusOf(d)]}</span><h3>Waiting on customer context</h3><p>Complete the missing inputs in Customer Context.</p><button class="btn btn-primary" onclick="go('#/ws/ctx')">Complete customer context</button></div>
  ${deps?`<div class="ph-box" style="margin-top:14px"><h4>Inputs used</h4><div class="tblwrap"><table class="tbl"><tbody>${deps.map(k=>`<tr><td>${fieldLabel(k)}</td><td>${ctxAnswered(k)?esc(fmtVal(ctxVal(k))):"missing"}</td></tr>`).join("")}</tbody></table></div></div>`:""}`; }
