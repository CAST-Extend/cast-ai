/* =====================================================================
   TARGET STATE ARCHITECTURE — mainframe edition
   CAST findings × customer context × Well-Architected skill (mainframe patterns)
   ===================================================================== */
const CSP = {
  AWS:{ name:"Amazon Web Services", color:"#E88B00", tint:"#FFF5E6", fw:"AWS Well-Architected Framework",
    run:{ managed:"Amazon ECS on AWS Fargate", k8s:"Amazon EKS", vm:"Amazon EC2 Auto Scaling group" },
    db:"Amazon Aurora PostgreSQL", dbha:"Multi-AZ", obj:"Amazon S3", mq:"Amazon MQ", sched:"AWS Step Functions + EventBridge Scheduler",
    secrets:"AWS Secrets Manager + AWS KMS", idp:"AWS IAM Identity Center", obs:"Amazon CloudWatch", edge:"Application Load Balancer + AWS WAF", web:"Amazon S3 + CloudFront", api:"Amazon API Gateway", reg:"Amazon ECR",
    tool:"AWS Transform for mainframe or a partner refactoring tool", cobol:"a partner COBOL runtime (e.g. Rocket Enterprise Server) on EC2", zone:"Availability Zones", net:"VPC + private subnets" },
  Azure:{ name:"Microsoft Azure", color:"#0078D4", tint:"#EAF3FC", fw:"Azure Well-Architected Framework",
    run:{ managed:"Azure Container Apps", k8s:"Azure Kubernetes Service (AKS)", vm:"Virtual Machine Scale Sets" },
    db:"Azure Database for PostgreSQL – Flexible Server", dbha:"zone-redundant HA", obj:"Azure Blob Storage", mq:"Azure Service Bus", sched:"Container Apps jobs + Logic Apps",
    secrets:"Azure Key Vault", idp:"Microsoft Entra ID", obs:"Azure Monitor + Application Insights", edge:"Application Gateway + WAF", web:"Azure Static Web Apps", api:"Azure API Management", reg:"Azure Container Registry",
    tool:"a partner refactoring tool from Azure Marketplace", cobol:"a partner COBOL runtime (e.g. Rocket Enterprise Server) on Azure VMs", zone:"availability zones", net:"VNet + private endpoints" },
  GCP:{ name:"Google Cloud", color:"#1A73E8", tint:"#EAF1FD", fw:"Google Cloud Well-Architected Framework",
    run:{ managed:"Cloud Run", k8s:"GKE Autopilot", vm:"Managed instance groups" },
    db:"Cloud SQL for PostgreSQL", dbha:"regional HA", obj:"Cloud Storage", mq:"Pub/Sub", sched:"Cloud Scheduler + Workflows",
    secrets:"Secret Manager + Cloud KMS", idp:"Cloud Identity + Identity-Aware Proxy", obs:"Cloud Monitoring + Cloud Logging", edge:"Cloud Load Balancing + Cloud Armor", web:"Cloud Storage + Cloud CDN", api:"API Gateway", reg:"Artifact Registry",
    tool:"a partner refactoring tool, validated with Google Cloud Dual Run", cobol:"a partner COBOL runtime (e.g. Rocket Enterprise Server) on Compute Engine", zone:"zones", net:"VPC + Private Service Connect" },
};
const PILLAR_NAMES = {
  AWS:  { ops:"Operational Excellence", sec:"Security", rel:"Reliability", perf:"Performance Efficiency", cost:"Cost Optimization", sus:"Sustainability" },
  Azure:{ ops:"Operational Excellence", sec:"Security", rel:"Reliability", perf:"Performance Efficiency", cost:"Cost Optimization" },
  GCP:  { ops:"Operational excellence", sec:"Security, privacy and compliance", rel:"Reliability", perf:"Performance optimization", cost:"Cost optimization" },
};
const DRIVER_PILLAR = { "Mainframe cost / contract exit":"cost", "Skills & retirement risk":"ops", "Agility / delivery speed":"ops", "Resilience":"rel", "Security & compliance":"sec", "Scalability":"perf" };
const FW_PRINCIPLE = {
  rel:"Design for failure: stateless services spread across zones, a managed database with automatic failover, and batch jobs that can be restarted safely from a checkpoint.",
  sec:"Defense in depth: identity from the platform rather than the application, secrets and keys in a managed vault, data encrypted at rest and in transit, and the least sensitive data possible — tokenize card numbers where you can.",
  perf:"Scale online and batch independently; size batch to the window it must meet, and run it in parallel where the data allows.",
  cost:"Prefer managed services, pay for batch only while it runs, scale in off-peak, and retire duplicate capabilities.",
  ops:"Everything as code — infrastructure, pipelines and job schedules — with centralized logs, metrics and traces, so operations knowledge is no longer tribal.",
  sus:"Run batch only as long as needed and scale to zero when idle.",
};
let tsCloud = null;
function F(text, key){ STMTS.push({k:"fw"}); return `<span class="stmt">${text}<button class="src fw" onclick="openFramework('${key}',this)">▲ Framework</button></span>`; }
function openFramework(key, btn){
  highlight(btn); const c = tsCloud;
  document.getElementById("drawerKind").textContent = "Framework guidance";
  document.getElementById("drawerTitle").textContent = `${PILLAR_NAMES[c][key] || PILLAR_NAMES.AWS[key]} — ${CSP[c].fw}`;
  document.getElementById("drawerBody").innerHTML = `<div class="infnote" style="background:#E0F2F5;color:#0B4F5E"><b>Principle.</b> ${FW_PRINCIPLE[key]}</div>
    <p style="font-size:13.5px;color:var(--muted);margin:0 0 10px">Supplied by the Well-Architected skill: pillars per provider plus a mainframe pattern catalog that maps CAST findings (CICS, batch, VSAM, IMS, MQ) to target services.</p>
    <p style="font-size:12.5px;color:var(--muted)">Prototype note: guidance is paraphrased from the providers' published frameworks; tool and service names should be checked against current provider documentation.</p>`;
  showDrawer();
}

function tsModel(){
  const cloud = tsCloud, c = CSP[cloud], v = ctxVal;
  const approach = v("tgt_approach")||"Undecided", managed = v("tgt_managed"), skills = v("team_skills")||[];
  const replat = approach.startsWith("Replatform"), rewrite = approach.startsWith("Rewrite"), hybrid = approach.startsWith("Hybrid");
  const runKind = replat ? "vm" : managed==="Prefer portable (Kubernetes)" ? "k8s" : "managed";
  const run = c.run[runKind];
  const channels = v("channels")||[], comp = v("compliance")||[], keep = v("keep_int")||[], drivers = v("drivers")||[];
  const weight = {}; ["ops","sec","rel","perf","cost","sus"].forEach(k=>weight[k]=0); drivers.forEach((d,i)=>{ weight[DRIVER_PILLAR[d]] += 3-i; });
  const web = channels.includes("Web UI for staff"), apis = channels.includes("APIs for partners"), selfsvc = channels.includes("Customer self-service");
  const assumptions = [];
  if (approach==="Undecided") assumptions.push("Approach undecided — automated refactor to Java assumed: the code base is small and the blockers are mechanical.");
  if (!v("rto") || v("rto")===DK) assumptions.push("Recovery targets not provided — assumed RTO 4 h / RPO 15 min.");
  if (!web && !apis) assumptions.push("No new channel selected — 3270 screens reproduced as a web UI with the same fields and flow.");
  assumptions.push("IMS pending-authorization data assumed to move to relational tables; an IMS-compatible runtime is the alternative (TD-12).");
  const tool = replat ? c.cobol : rewrite ? "a rewrite guided by this Blueprint's specs and rules" : c.tool;
  return { cloud, c, approach, replat, rewrite, hybrid, runKind, run, channels, web, apis, selfsvc, comp, keep, drivers, weight, assumptions, tool, avail:v("availability"), skills };
}

function tsDiagram(m){
  const c = m.c, col = c.color, IC = CLOUD_ICONS[m.cloud];
  const TAG_ICONS = { CDN:["edge","waf"], WEB:["web"], IDP:["idp"], SQL:["db"], OBJ:["obj"], KEY:["secrets"], REG:["reg"], MON:["obs"], RUN:[m.runKind==="vm"?"vm":"managed"] };
  const icon = (k,x,y,s=28) => IC[k] ? `<image href="${IC[k]}" x="${x}" y="${y}" width="${s}" height="${s}"/>` : "";
  function wrap(t,x,y,wmax){ const words = t.split(" "); const lines=[]; let cur=""; words.forEach(wd=>{ if((cur+" "+wd).trim().length*6.1 > wmax){ lines.push(cur.trim()); cur=wd; } else cur+=" "+wd; }); lines.push(cur.trim());
    return lines.slice(0,4).map((l,i)=>`<text x="${x}" y="${y+i*13}" font-size="11.5" font-weight="600" fill="#0C0613">${esc(l)}</text>`).join(""); }
  const tile = (x,y,w,h,label,svc,tag) => { const ks = TAG_ICONS[tag]||[]; const tx = x+12+ks.length*32; const tall = h>=90;
    return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="#fff" stroke="#D9D6E0"/>${ks.map((k,i)=>icon(k, x+10+i*32, y+10)).join("")}
    <text x="${tx}" y="${y+26}" font-size="10.5" font-weight="700" fill="#6D6A71">${label}</text>${tall ? wrap(svc, x+12, y+56, w-20) : wrap(svc, tx, y+42, w-(tx-x)-8)}</g>`; };
  const ext = (x,y,label,svc) => `<g><rect x="${x}" y="${y}" width="170" height="52" rx="8" fill="#fff" stroke="#C7C9E0" stroke-dasharray="4 3"/><text x="${x+12}" y="${y+20}" font-size="10.5" font-weight="700" fill="#6D6A71">${label}</text><text x="${x+12}" y="${y+38}" font-size="11" font-weight="600" fill="#0C0613">${esc(svc)}</text></g>`;
  const appLabel = m.replat ? "COBOL on a cloud runtime" : m.rewrite ? "New services" : "Refactored Java services";
  return `<svg viewBox="0 0 1060 660" font-family="Inter,sans-serif">
    <defs><marker id="tah" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="${col}"/></marker></defs>
    <text x="20" y="26" font-size="13" font-weight="800" fill="${col}">${c.name}</text>
    ${ext(20,70,"Back-office users", m.web ? "Browser — web UI" : "Terminal emulation")}
    ${ext(20,160,"Administrators","Browser · SSO")}
    ${m.apis ? ext(20,250,"Partners","APIs") : ""}
    ${ext(20,340,"MQ clients","account · date inquiries")}
    ${ext(20,470,"Daily transaction feed","file drop")}
    ${tile(215,150,180,74,"EDGE",c.edge,"CDN")}
    <rect x="420" y="40" width="440" height="580" rx="14" fill="${c.tint}" stroke="${col}" stroke-width="1.5"/>
    <text x="436" y="62" font-size="12" font-weight="800" fill="${col}">Primary region</text><text x="436" y="78" font-size="10.5" fill="#6D6A71">${esc(c.net)} · across ${esc(c.zone)}</text>
    <text x="440" y="102" font-size="10" font-weight="700" fill="#6D6A71" letter-spacing="1">ACCESS</text>
    ${tile(440,108,196,62,"STAFF UI",m.web?c.web:"web terminal",m.web?"WEB":"")}${tile(646,108,196,62,m.apis?"PARTNER APIS":"IDENTITY",m.apis?c.api:c.idp,m.apis?"":"IDP")}
    <text x="440" y="192" font-size="10" font-weight="700" fill="#6D6A71" letter-spacing="1">APPLICATION</text>
    <rect x="440" y="198" width="402" height="150" rx="10" fill="#fff" stroke="${col}" stroke-dasharray="5 3"/>
    ${icon(m.runKind==="vm"?"vm":"managed", 452, 206, 30)}<text x="490" y="218" font-size="10.5" font-weight="700" fill="#6D6A71">RUNTIME</text><text x="490" y="236" font-size="12" font-weight="700" fill="#0C0613">${esc(m.run)}</text>
    <rect x="454" y="250" width="180" height="84" rx="8" fill="${col}"/><text x="544" y="274" text-anchor="middle" font-size="11.5" font-weight="700" fill="#fff">Online</text><text x="544" y="292" text-anchor="middle" font-size="10" fill="#fff">${esc(appLabel)}</text><text x="544" y="308" text-anchor="middle" font-size="10" fill="#fff">25 CICS transactions →</text><text x="544" y="322" text-anchor="middle" font-size="10" fill="#fff">screens + services</text>
    <rect x="648" y="250" width="180" height="84" rx="8" fill="#0C0613"/><text x="738" y="274" text-anchor="middle" font-size="11.5" font-weight="700" fill="#fff">Batch jobs</text><text x="738" y="292" text-anchor="middle" font-size="10" fill="#C7C9E0">posting · interest</text><text x="738" y="308" text-anchor="middle" font-size="10" fill="#C7C9E0">statements · reports</text><text x="738" y="322" text-anchor="middle" font-size="10" fill="#C7C9E0">${esc(c.sched.split(" + ")[0])}</text>
    <text x="440" y="370" font-size="10" font-weight="700" fill="#6D6A71" letter-spacing="1">DATA &amp; MESSAGING</text>
    ${tile(440,376,196,100,"DATABASE",c.db+" · "+c.dbha+" · VSAM, DB2 and IMS data","SQL")}${tile(646,376,196,100,"FILES",c.obj+" · daily feed, statements, reports","OBJ")}
    ${tile(440,484,196,54,"MESSAGING",c.mq,"")}${tile(646,484,196,54,"SECRETS & KEYS",c.secrets,"KEY")}
    ${tile(440,546,196,54,"IMAGES",c.reg,"REG")}${tile(646,546,196,54,"OBSERVABILITY",c.obs,"MON")}
    ${ext(880,120,"Converted with",m.tool.length>26?m.tool.slice(0,26)+"…":m.tool)}
    ${ext(880,200,"Statements","PDF delivery (kept)")}
    ${ext(880,280,"Scheduler",c.sched.split(" + ").pop())}
    <rect x="880" y="420" width="170" height="110" rx="12" fill="none" stroke="#9A97A0" stroke-dasharray="6 4"/><text x="894" y="444" font-size="11.5" font-weight="800" fill="#6D6A71">Mainframe (until cutover)</text><text x="894" y="462" font-size="10.5" fill="#0C0613">parallel run · file compare</text><text x="894" y="478" font-size="10.5" fill="#0C0613">month-end reconciled</text><text x="894" y="496" font-size="10" fill="#8A6D00">decommissioned after</text>
    <path d="M190,96 C205,96 200,170 213,178" stroke="${col}" stroke-width="2" fill="none" marker-end="url(#tah)"/><path d="M190,186 L213,188" stroke="${col}" stroke-width="2" fill="none" marker-end="url(#tah)"/>
    ${m.apis?`<path d="M190,276 C205,276 200,210 213,205" stroke="${col}" stroke-width="2" fill="none" marker-end="url(#tah)"/>`:""}
    <path d="M395,180 C415,180 420,140 438,139" stroke="${col}" stroke-width="2" fill="none" marker-end="url(#tah)"/><path d="M190,366 C300,366 400,510 438,511" stroke="${col}" stroke-width="2" fill="none" marker-end="url(#tah)"/>
    <path d="M190,496 C320,496 560,470 640,426" stroke="#9A97A0" stroke-width="1.5" fill="none" marker-end="url(#tah)"/>
    <path d="M544,334 L544,374" stroke="${col}" stroke-width="1.5" marker-end="url(#tah)"/><path d="M700,334 C700,352 560,356 560,374" stroke="${col}" stroke-width="1.5" fill="none" marker-end="url(#tah)"/><path d="M760,334 L760,374" stroke="${col}" stroke-width="1.5" marker-end="url(#tah)"/>
  </svg>`;
}

function setTsCloud(k){ tsCloud = k; document.getElementById("doc").innerHTML = targetState(); paintGrounding(); }
function targetState(){
  const choice = ctxVal("tgt_cloud");
  if (!tsCloud || !CSP[tsCloud]) tsCloud = CSP[choice] ? choice : "AWS";
  STMTS = [];
  const m = tsModel(), c = m.c, P = PILLAR_NAMES[m.cloud];
  const pillars = Object.keys(P).sort((a,b)=>m.weight[b]-m.weight[a]);
  const how = m.replat ? `keep the COBOL and run it on ${c.cobol}` : m.rewrite ? "rewrite the application against this Blueprint's specifications and rules" : `refactor the COBOL to Java with ${c.tool}`;
  const summary = `
    <p>${C(`Move ${APP} to <b>${c.name}</b> and <b>${esc(how)}</b>, prioritizing ${m.drivers.map(d=>d.toLowerCase()).join(", ")}.`, "tgt_cloud","tgt_approach","drivers")}
       ${X("The code base is small (48,758 lines, 42 programs) and its cloud blockers are mostly mechanical — fall-through code, GOTO, binary fields, REDEFINES — which conversion tools handle.","stats","cloud")}
       ${I(`Run online and batch as separate workloads on <b>${esc(m.run)}</b>, move VSAM, DB2 and IMS data into <b>${esc(c.db)}</b>, keep files on <b>${esc(c.obj)}</b>, replace MQ with <b>${esc(c.mq)}</b>, and take sign-on out of the application into <b>${esc(c.idp)}</b>.`,"Combines CAST's inventory of runtimes and stores with the customer's direction and the framework's mainframe patterns.","data","containersEv","ctxSecurity")}</p>`;
  const rows = [
    ["25 CICS transactions · 26 programs", X("3270 screens via BMS maps","tx","progs"), m.web ? `${c.web} + services on ${m.run}` : `Services on ${m.run} + terminal-style web UI`, C(m.web?"The customer wants a web UI for staff.":"No new channel requested — same screens, new runtime.","channels")],
    ["15 batch programs · 56 jobs", X("CA-7 chain of 17 jobs; 4 jobs outside it","schedule"), `Containerized jobs orchestrated by ${c.sched}`, F("Scheduling as code, restartable jobs, pay only while they run.","ops")],
    ["VSAM files (13 KSDS)", X("accounts, cards, cross-reference, transactions, balances","data"), c.db+" tables", F("A managed relational store gives transactions, backups and failover the file system never had.","rel")],
    ["DB2 tables (3)", X("transaction types, categories, fraud flags","data"), c.db, I("Engine-to-engine move; the duplicate VSAM copy of transaction types is retired.","Consolidation follows the duplicate reference data found in Data ownership.","crud")],
    ["IMS DB (pending authorizations)", X("PAUTSUM0 · 12 objects with DL/I calls","data","cloud"), c.db+" tables (data-model redesign)", I("No like-for-like IMS service exists; relational tables are the usual target — to be confirmed (TD-12).","Standard mainframe target mapping.","cloud")],
    ["IBM MQ (7 queues)", X("inquiries and an error queue","data"), m.keep.includes("MQ account and date inquiries") ? `${c.mq} — interface contracts kept` : c.mq, m.keep.includes("MQ account and date inquiries") ? C("Consumers still depend on the MQ inquiries.","keep_int") : F("Use the provider's managed messaging.","ops")],
    ["Sign-on against USRSEC", X("COSGN00C reads the application's own user file","ctxSecurity"), c.idp, F("Identity from the platform, not the application.","sec")],
    ["Card numbers in files", X("card cross-reference and transaction records","postXref"), `Encrypted columns, keys in ${c.secrets.split(" + ").pop()}; tokenize where possible`, C(`Required for ${m.comp.join(" and ")||"compliance"}.`,"compliance")],
    ["Daily file, statements, reports", X("GDGs, PDF conversion, report job","schedule","crud"), c.obj+" with lifecycle rules", m.keep.includes("Statement PDFs") ? C("Statement PDFs and the daily file stay as interfaces.","keep_int") : F("Durable, cheap object storage for files.","cost")],
    ["IDCAMS · SORT · FTP utilities", X("used across 56 batch jobs","schedule"), "Job steps in the batch runtime; managed file transfer", I("Utility steps become code or managed services; no mainframe utility survives.","Target mapping for the extracted utilities.","schedule")],
  ];
  const decisions = [
    ["Approach", m.replat ? "Replatform — COBOL on a cloud runtime" : m.rewrite ? "Rewrite" : "Automated refactor to Java", m.replat ? ["Refactor to Java","Rewrite"] : ["Replatform (keeps COBOL skills dependency)","Manual rewrite"],
      C(`The customer chose “${esc(m.approach)}”; the ranked drivers are ${m.drivers.map(d=>d.toLowerCase()).join(", ")}.`,"tgt_approach","drivers")],
    ["Runtime", m.run, m.runKind==="managed" ? [c.run.k8s, c.run.vm] : [c.run.managed],
      C(m.replat ? "A COBOL runtime needs virtual machines." : `The customer ${m.skills.includes("Java")?"has Java skills and ":""}prefers managed services.`,"tgt_managed","team_skills")],
    ["Data store", c.db+" for VSAM, DB2 and IMS data", ["Keep VSAM semantics on a file emulator","Separate engines per store"],
      X("Accounts, cards and transactions are read by up to 11 programs each; one relational store gives them transactions and a single owner.","crud","blastXref")],
    ["Batch", "Keep nightly batch, orchestrated as code", ["Real-time posting at cutover"],
      I("Real-time posting changes what balances mean (C-01, C-03, C-04); move the batch first, then evolve it behind the delta spec.","Sequencing judgment from the open clarifications.","postAcct","postUpd","billPay")],
    ["Parallel run", "Mainframe and cloud side by side through at least one month-end", ["Big-bang cutover"],
      X("Posting, interest and statements are file-in, file-out — outputs can be compared byte for byte.","schedule","postMain")],
  ];
  const PB = {
    rel:()=>[F(`Spread online services and the database across ${c.zone}; make batch restartable.`,"rel"), C(`Target availability ${esc(m.avail||"not set")}.`,"availability"), X("Fix the unchecked CICS return codes before converting them (TD-02).","iso")],
    sec:()=>[F(`${c.idp} for staff, ${c.secrets} for secrets and keys, ${c.net} for data.`,"sec"), X("Card numbers sit in the cross-reference and transaction records; sign-on uses an application file.","postXref","ctxSecurity")],
    perf:()=>[F("Scale online and batch separately; size batch to the window.","perf"), C(`Today's batch window: ${esc(ctxVal("batch_window")||"—")}.`,"batch_window")],
    cost:()=>[F("Managed services and batch that runs only while it has work.","cost"), C(`Compared with today's ${esc(ctxVal("cur_cost")||"unknown")} in Estimated Running Costs.`,"cur_cost")],
    ops:()=>[F(`Job schedules, infrastructure and pipelines as code; ${c.obs} for everything.`,"ops"), X("Four jobs run outside CA-7 today — they are scheduled explicitly in the target.","schedule")],
    sus:()=>[F("Batch scales to zero between runs.","sus"), X("4 green-IT findings only.","green")],
  };
  const pill = pillars.map(k=>{ const w = m.weight[k]; const b = PB[k]();
    return `<div class="pillar ${w?"w":""}"><div class="ph"><b>${P[k]}</b>${w?`<span class="wt">weight ${w} · driver</span>`:""}</div><ul>${b.map(x=>`<li>${x}</li>`).join("")}</ul></div>`; }).join("");
  const cloudTabs = Object.keys(CSP).map(k=>`<button class="${k===m.cloud?"on":""}" onclick="setTsCloud('${k}')">${k}${k===choice?" ✓":""}</button>`).join("");
  return `
  <div class="doc-head"><div><div class="eyebrow">Target State Architecture</div><h1>${APP} on ${c.name}</h1>
    <div class="meta">CAST Imaging findings × customer context × ${c.fw} · snapshot ${SYSTEM.snapshot}</div></div>
    <div class="doc-actions"><button class="btn btn-primary btn-sm" onclick="openExport(TS_FILES(),'Target state bundle','Architecture decision records and the target diagram as Mermaid — for review, or as context for an AI agent planning the migration.')">Export for agents</button></div></div>
  <div class="tsbar"><div class="seg">${cloudTabs}</div><span>${m.cloud===choice ? "Showing the customer's choice." : `Customer chose <b>${esc(choice||"—")}</b> — showing ${m.cloud} for comparison.`} <a href="#" onclick="go('#/ws/ctx');return false">Edit customer context →</a></span></div>
  <div class="grounding" id="grounding"></div>
  <div class="recbox" style="border-left:4px solid ${c.color}"><div class="eyebrow">Recommendation</div><div class="rtext">${summary}</div></div>
  <h2>Target architecture</h2>
  <div class="archfig" style="background:#fff">${tsDiagram(m)}<div class="figcap">Official ${c.name} architecture icons, used unmodified. Tiles without an icon use services outside the embedded icon set.</div></div>
  <h2>From today to target</h2>
  <div class="tblwrap"><table class="tbl tsmap"><thead><tr><th>Today</th><th>What CAST / the customer says</th><th>Target on ${m.cloud}</th><th>Why</th></tr></thead><tbody>
    ${rows.map(r=>`<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td class="tsvc" style="border-left:3px solid ${c.color}">${esc(r[2])}</td><td>${r[3]}</td></tr>`).join("")}
  </tbody></table></div>
  <h2>Well-Architected pillars</h2>
  <p style="font-size:14px;color:var(--muted);margin-top:-6px">${C(`Ordered by the customer's drivers — ${m.drivers.map((d,i)=>`${i+1}. ${d}`).join(" · ")}.`,"drivers")}</p>
  <div class="pillars">${pill}</div>
  <h2>Decision log</h2>
  ${decisions.map((d,i)=>`<div class="adr"><div class="adrh"><code>ADR-${String(i+1).padStart(2,"0")}</code><b>${d[0]}</b></div>
    <div class="adrb"><div><span class="k">Decision</span>${esc(d[1])}</div><div><span class="k">Rejected</span>${d[2].map(esc).join(" · ")}</div><div class="why"><span class="k">Because</span>${d[3]}</div></div></div>`).join("")}
  <h2>Assumptions</h2><div class="clar"><ul style="margin:0;padding-left:18px">${m.assumptions.map(a=>`<li style="margin-bottom:6px">${esc(a)}</li>`).join("")}</ul>
    <div class="ask" style="margin-top:12px"><b>To firm these up:</b> answer the open items in <a href="#" onclick="go('#/ws/ctx');return false">Customer Context</a> — the architecture updates immediately.</div></div>`;
}
EV.containersEv = { title:"Runtimes and stores", call:"stats · transactions · data stores", rows:[["Runtimes","CICS online · JCL batch"],["Stores","VSAM · DB2 · IMS DB · MQ"]]};
function TS_FILES(){
  const m = tsModel(), c = m.c;
  const mer = () => `flowchart LR
  users([Back-office users]) --> edge[${c.edge}]
  admins([Administrators]) --> edge
  subgraph region[${c.name} · primary region]
    edge --> ui[Staff UI]
    ui --> online[Online services · ${m.run}]
    sched[${c.sched}] --> batch[Batch jobs · ${m.run}]
    online --> db[(${c.db})]
    batch --> db
    batch --> files[(${c.obj})]
    online --> mq[${c.mq}]
    online -.-> idp[${c.idp}]
  end
  mf[Mainframe · parallel run] -. compare .-> batch`;
  const adr = () => [`# Target State Architecture — ${APP} on ${c.name}`,"",`Generated by CAST ${PRODUCT} from CAST Imaging (snapshot ${SYSTEM.snapshot}), customer context and the ${c.fw}.`,"","## Diagram","","```mermaid",mer(),"```","",
    "## Key choices","",`- Approach: ${m.approach}`,`- Conversion: ${m.tool}`,`- Runtime: ${m.run}`,`- Data: ${c.db} (${c.dbha}) for VSAM, DB2 and IMS data`,`- Files: ${c.obj}`,`- Messaging: ${c.mq}`,`- Identity: ${c.idp}`,`- Batch orchestration: ${c.sched}`,"","## Assumptions","",...m.assumptions.map(a=>`- ${a}`)].join("\n");
  return [[`target-state/${m.cloud.toLowerCase()}/target-state.md`, adr],[`target-state/${m.cloud.toLowerCase()}/diagram.mmd`, mer]];
}

/* =====================================================================
   ESTIMATED RUNNING COSTS
   ===================================================================== */
const XP = { AWS:{mqHr:0.288, apiM:3.50, mqName:"Amazon MQ mq.m5.large"}, Azure:{mqHr:0.0135, apiM:3.50, mqName:"Azure Service Bus Standard"}, GCP:{mqHr:0.03, apiM:3.00, mqName:"Pub/Sub (usage-based)"} };
function Pr(text, cloud){ STMTS.push({k:"price"}); return `<span class="stmt">${text}<button class="src price" onclick="openPrices('${cloud}',this)">$ Price list</button></span>`; }
function openPrices(cloud, btn){
  highlight(btn); const p = PRICES[cloud], x = XP[cloud];
  document.getElementById("drawerKind").textContent = p.live ? "Public price list (live pull)" : "Approximate public prices";
  document.getElementById("drawerTitle").textContent = `${CSP[cloud].name} · ${p.region}`;
  const f = (v,d=4)=>"$"+Number(v).toFixed(d);
  const rows = [[p.labels.run+" — vCPU", f(p.vcpuSec*3600)+" / vCPU-hour"],[p.labels.run+" — memory", f(p.gibSec*3600)+" / GiB-hour"],[p.labels.db+" — compute", f(p.dbVcoreHr,3)+" / vCore-hour"],[p.labels.db+" — storage", f(p.dbStorGB,3)+" / GB-month"],
    [p.labels.obj, f(p.objGB)+" / GB-month"],[p.labels.obs+" — ingestion", f(p.logGB,2)+" / GB"],[x.mqName, f(x.mqHr,4)+" / hour (approximate)"],["API management", f(x.apiM,2)+" / million calls (approximate)"]];
  document.getElementById("drawerBody").innerHTML = `<div class="infnote"><b>${p.live?"Container, database, storage and log prices pulled live":"Not live"}.</b> ${p.src}${p.live?` · retrieved ${p.date} (reused from the Shopizer run)`:""}. Messaging and API prices are approximate. List prices, before discounts and tax.</div>
    <div class="ev"><div class="evh"><b>Unit prices used</b><code class="call">${p.live?"prices.azure.com — "+p.region:"approximate reference table"}</code></div><table>${rows.map(r=>`<tr><td class="l">${r[0]}</td><td>${r[1]}</td></tr>`).join("")}</table></div>`;
  showDrawer();
}
function costModel(cloud){
  const p = PRICES[cloud], x = XP[cloud], v = ctxVal, as = [];
  const pick = (id, map, def, label) => { const val = v(id); if (map[val]!==undefined) return map[val]; as.push(`${label}: assumed ${def.label}`); return def.val; };
  const on = pick("users_peak", {"< 50":{rep:2,cpu:1,mem:2},"50–250":{rep:2,cpu:2,mem:4},"250–1,000":{rep:4,cpu:2,mem:4},"> 1,000":{rep:8,cpu:2,mem:4}}, {val:{rep:2,cpu:2,mem:4},label:"50–250 users"}, "Online users");
  const bt = pick("tx_day", {"< 100K":{h:1,cpu:2,db:2},"100K–1M":{h:2,cpu:4,db:4},"1M–10M":{h:3,cpu:8,db:8},"> 10M":{h:4,cpu:16,db:16}}, {val:{h:2,cpu:4,db:4},label:"100K–1M a day"}, "Daily transactions");
  const dbGB = pick("db_size", {"< 50 GB":50,"50–250 GB":256,"250 GB–1 TB":1024,"> 1 TB":2048}, {val:256,label:"256 GB"}, "Data volume");
  const envs = pick("cur_envs", {"1":1,"2":2,"3":3,"4+":4}, {val:3,label:"3 environments"}, "Environments");
  const ha = ["99.95%","99.99%"].includes(v("availability")); if (!v("availability")||v("availability")===DK) as.push("Availability: assumed 99.95% (zone-redundant)");
  const apis = (v("channels")||[]).includes("APIs for partners");
  const replat = (v("tgt_approach")||"").startsWith("Replatform");
  const cpuMo = (cpu,mem,hrs) => (cpu*p.vcpuSec + mem*p.gibSec) * 3600 * hrs;
  const L = p.labels, filesGB = Math.max(100, dbGB*2), logGB = 60 + on.rep*20;
  const prod = [
    { svc:(replat?"COBOL runtime hosts · ":"")+L.run+" — online", basis:`${on.rep} replicas × ${on.cpu} vCPU / ${on.mem} GiB, always on`, m: on.rep*cpuMo(on.cpu,on.mem,HRS) },
    { svc:L.run+" — batch", basis:`${bt.cpu} vCPU for ~${bt.h} h a night (+ month-end)`, m: cpuMo(bt.cpu,bt.cpu*2,bt.h*32) },
    { svc:L.db, basis:`${bt.db} vCores${ha?" · HA standby (×2)":""} + ${dbGB} GB`, m: bt.db*p.dbVcoreHr*HRS*(ha?2:1) + dbGB*p.dbStorGB*(ha?2:1) + dbGB*0.5*p.backupGB },
    { svc:L.obj, basis:`${filesGB} GB — daily files, statements, reports`, m: filesGB*p.objGB },
    { svc:x.mqName, basis:"inquiry and error queues", m: x.mqHr*HRS },
    { svc:L.edge, basis:"staff access and web firewall", m: p.edgeBase*0.6 },
    ...(apis ? [{ svc:"API management", basis:"~5M partner calls a month", m: 5*x.apiM + 50 }] : []),
    { svc:L.sec, basis:"secrets and encryption keys", m: 100*p.vaultOps10k + 20 },
    { svc:L.obs, basis:`~${logGB} GB logs and metrics a month`, m: logGB*p.logGB },
  ];
  const npEnv = cpuMo(1,2,HRS)*0.5 + cpuMo(2,4,bt.h*8) + 2*p.dbVcoreHr*HRS + 64*p.dbStorGB + 20*p.logGB;
  const nonprodEnvs = Math.max(envs-1,0), prodMo = prod.reduce((a,b)=>a+b.m,0), npMo = npEnv*nonprodEnvs;
  const annual = (prodMo+npMo)*12;
  if (replat) as.push("COBOL runtime licenses are not included — they need a vendor quote");
  const curMap = {"< $250K":[150000,250000],"$250K–1M":[250000,1000000],"$1M–3M":[1000000,3000000],"> $3M":[3000000,5000000]};
  return { p, prod, prodMo, npMo, npEnv, nonprodEnvs, annual, current: curMap[v("cur_cost")]||null, assumptions:as, on, bt, dbGB, ha, replat };
}
function costEstimate(){
  const choice = ctxVal("tgt_cloud");
  if (!tsCloud || !CSP[tsCloud]) tsCloud = CSP[choice] ? choice : "AWS";
  STMTS = [];
  const cloud = tsCloud, m = costModel(cloud), c = CSP[cloud], p = m.p;
  const $ = v => "$"+Math.round(v).toLocaleString("en-US"), $k = v => v>=1000 ? "$"+(v/1000).toFixed(v>=100000?0:1)+"K" : $(v);
  const mo = m.prodMo + m.npMo, low = m.annual*0.8, high = m.annual*1.4;
  const cloudTabs = Object.keys(CSP).map(k=>`<button class="${k===cloud?"on":""}" onclick="tsCloud='${k}';document.getElementById('doc').innerHTML=costEstimate();paintGrounding()">${k}${k===choice?" ✓":""}</button>`).join("");
  const max = Math.max(...m.prod.map(r=>r.m)), cur = m.current, scale = cur ? Math.max(cur[1], high) : high;
  const sens = [["Daily volume ×10", (m.prod[1].m*4 + m.prod[2].m*0.8)],["Warm standby in a second region", m.prodMo*0.45],["1-year reserved database capacity", -m.prod[2].m*0.3],["Non-production scaled to zero overnight", -m.npMo*0.4]];
  return `
  <div class="doc-head"><div><div class="eyebrow">Estimated Running Costs</div><h1>${APP} on ${c.name}</h1>
    <div class="meta">Target State Architecture × customer volumes × ${p.live ? "public list prices ("+p.date+")" : "approximate public list prices"} · ${p.region}</div></div>
    <div class="doc-actions"><button class="btn btn-primary btn-sm" onclick="openExport(COST_FILES(),'Cost estimate','The estimate as CSV and as Markdown with every assumption listed.')">Export for agents</button></div></div>
  <div class="tsbar"><div class="seg">${cloudTabs}</div><span>${p.live ? `<b style="color:var(--good)">● Live prices</b> (Azure Retail Prices API)` : `<b style="color:var(--inferred)">● Approximate prices</b> — not pulled live`} · <a href="#" onclick="go('#/ws/ctx');return false">Edit volumes →</a></span></div>
  <div class="grounding" id="grounding"></div>
  <div class="kpis" style="grid-template-columns:repeat(4,1fr);margin-top:22px">
    <div class="kpi"><div class="v">${$(mo)}</div><div class="l">Expected per month</div><div class="s" style="color:var(--muted)">prod ${$(m.prodMo)} · non-prod ${$(m.npMo)}</div></div>
    <div class="kpi"><div class="v">${$k(m.annual)}</div><div class="l">Expected per year</div><div class="s" style="color:var(--muted)">range ${$k(low)}–${$k(high)}</div></div>
    <div class="kpi"><div class="v">${cur?$k(cur[0])+"–"+$k(cur[1]):"—"}</div><div class="l">Today, per year</div><div class="s" style="color:var(--muted)">customer estimate</div></div>
    <div class="kpi"><div class="v" style="color:var(--good)">${cur ? "−"+Math.round((1-m.annual/((cur[0]+cur[1])/2))*100)+"%" : "—"}</div><div class="l">vs. today's midpoint</div><div class="s" style="color:var(--muted)">infrastructure only</div></div>
  </div>
  <div class="recbox" style="border-left:4px solid ${c.color}"><div class="eyebrow">Estimate</div><div class="rtext"><p>
    ${I(`Running ${APP} on ${c.name} as designed is estimated at <b>${$(mo)} a month</b> — about <b>${$k(m.annual)} a year</b>, within ${$k(low)}–${$k(high)}.`,"Sizing heuristics applied to the customer's volumes, multiplied by the unit prices shown.","stats")}
    ${cur ? C(`Today's share of the mainframe is ${$k(cur[0])}–${$k(cur[1])} a year.`,"cur_cost") : ""}
    ${I("Mainframe run cost usually bundles MIPS-based software licenses, hardware and operations; the cloud figure is infrastructure only, so the gap overstates savings until conversion-tool or runtime licenses and operations are added.","Scope difference between the two figures.","stats")}</p></div></div>
  <h2>Cost by service — production</h2>
  <div class="tblwrap"><table class="tbl costs"><thead><tr><th>Service</th><th>Sized as</th><th style="text-align:right">Per month</th><th style="width:150px"></th></tr></thead><tbody>
    ${m.prod.map(r=>`<tr><td><b>${esc(r.svc)}</b></td><td>${esc(r.basis)}</td><td style="text-align:right;font-weight:700">${$(r.m)}</td><td><div class="cbar" style="width:${Math.max(2,Math.round(r.m/max*140))}px;background:${c.color}"></div></td></tr>`).join("")}
    <tr class="tot"><td><b>Production</b></td><td>${Pr(`Unit prices: ${p.live?"list prices, "+p.region+", "+p.date:"approximate list prices"}.`,cloud)}</td><td style="text-align:right">${$(m.prodMo)}</td><td></td></tr>
    <tr><td><b>Non-production</b></td><td>${C(`${m.nonprodEnvs} environment${m.nonprodEnvs===1?"":"s"} at ~${$(m.npEnv)} each.`,"cur_envs")}</td><td style="text-align:right;font-weight:700">${$(m.npMo)}</td><td></td></tr>
    <tr class="tot"><td><b>Total per month</b></td><td></td><td style="text-align:right">${$(mo)}</td><td></td></tr>
  </tbody></table></div>
  <h2>Today vs. target</h2>
  ${cur ? `<div class="vsband"><div class="vsrow"><span class="lbl">Today</span><div class="track"><i class="cur" style="left:${cur[0]/scale*100}%;width:${(cur[1]-cur[0])/scale*100}%"></i></div><span class="val">${$k(cur[0])}–${$k(cur[1])}</span></div>
    <div class="vsrow"><span class="lbl">Target</span><div class="track"><i style="left:${low/scale*100}%;width:${Math.max(0.8,(high-low)/scale*100)}%;background:${c.color}"></i></div><span class="val">${$k(low)}–${$k(high)}</span></div></div>` : `<p>${C("Add today's annual run cost in Customer Context to compare.","cur_cost")}</p>`}
  <h2>What moves the number</h2>
  <div class="tblwrap"><table class="tbl"><thead><tr><th>Scenario</th><th style="text-align:right">Per month</th><th style="text-align:right">Per year</th></tr></thead><tbody>
    ${sens.map(([l,d])=>`<tr><td>${l}</td><td style="text-align:right;font-weight:700;color:${d<0?"var(--good)":"var(--crit)"}">${d<0?"−":"+"}${$(Math.abs(d))}</td><td style="text-align:right;color:var(--muted)">${d<0?"−":"+"}${$k(Math.abs(d)*12)}</td></tr>`).join("")}
  </tbody></table></div>
  <h2>Not included</h2>
  <ul class="plain"><li>Conversion tooling, COBOL runtime or refactoring-tool licenses — vendor quotes.</li><li>Keeping the mainframe running during the parallel run — see Return on Investment.</li><li>Support plans, negotiated discounts and tax.</li><li>Network links to the data center during the transition.</li></ul>
  <h2>Assumptions</h2>
  <div class="clar"><ul style="margin:0;padding-left:18px">${m.assumptions.map(a=>`<li style="margin-bottom:6px">${esc(a)}.</li>`).join("")}
    <li style="margin-bottom:6px">Batch sized from daily volume: vCPU-hours per night, 32 runs a month to cover month-end.</li>
    <li>${p.live ? `Container, database, storage and log prices are ${p.region} list prices pulled on ${p.date}; messaging and API prices are approximate.` : `${c.name} prices are approximate public list prices — refresh before sharing externally.`}</li></ul></div>`;
}
function COST_FILES(){
  const cloud = tsCloud || "AWS", m = costModel(cloud);
  const csv = () => [["Service","Sized as","Monthly USD"], ...m.prod.map(r=>[r.svc,r.basis,r.m.toFixed(2)]), ["Non-production",`${m.nonprodEnvs} environments`,m.npMo.toFixed(2)], ["Total","",(m.prodMo+m.npMo).toFixed(2)]].map(r=>r.map(x=>`"${String(x).replace(/"/g,'""')}"`).join(",")).join("\n");
  const md = () => [`# Estimated Running Costs — ${APP} on ${CSP[cloud].name}`,"",`- Expected per month: $${Math.round(m.prodMo+m.npMo).toLocaleString()}`,`- Expected per year: $${Math.round(m.annual).toLocaleString()}`,"","| Service | Sized as | Monthly |","|---|---|---|",...m.prod.map(r=>`| ${r.svc} | ${r.basis} | $${Math.round(r.m).toLocaleString()} |`),"","## Assumptions","",...m.assumptions.map(a=>`- ${a}`),"- Excludes conversion tooling and runtime licenses, parallel-run mainframe cost, support, discounts and tax."].join("\n");
  return [[`costs/${cloud.toLowerCase()}/estimate.csv`, csv],[`costs/${cloud.toLowerCase()}/estimate.md`, md]];
}

/* =====================================================================
   MODERNIZATION PLAN
   ===================================================================== */
const PLAN_START = new Date(2026,9,5);
const PHASES = [
  ["P0","Decide & prepare","Answer the money questions, capture golden files, stand up the landing zone, prove the conversion on one program.",8,0.85],
  ["P1","Fix & harden on the mainframe","Correct the agreed defects and reliability gaps where they are cheapest to fix — before conversion.",12,0.7],
  ["P2","Convert & build","Convert online and batch, move the data model, replace MQ, identity and utilities.",20,0.6],
  ["P3","Parallel run & cutover","Run both platforms through month-end, reconcile file by file, switch over, decommission.",14,0.9],
  ["P4","Evolve","Give balances one owner, open APIs, move posting toward real time.",24,0.65],
];
/* [id, phase, title, low pw, high pw, AI factor, _, links{td,c,adr,br,fr}, [basis, ...ev], deps, kind?] */
const WPS = [
  ["WP-01","P0","Resolve the 9 money and batch clarifications",1,2,1.0,false,{c:["C-01","C-02","C-03","C-04","C-05","C-06","C-07","C-08","C-09"]},["9 questions raised by the posting, interest and bill-pay paragraphs.","postAcct","billPay","intFees"],[]],
  ["WP-02","P0","Golden files and characterization tests",4,6,0.5,true,{br:[RP+"001",RP+"003",RP+"011",RP+"021"]},["Posting, interest and statements are file-in, file-out; 5 online screens.","schedule","postMain"],[]],
  ["WP-03","P0","Cloud landing zone, network and identity",4,6,0.8,false,{adr:["ADR-02"]},["Target runtime, database, files, messaging and identity.","data"],[]],
  ["WP-04","P0","Conversion pilot on one program (CBACT04C)",3,5,0.6,true,{adr:["ADR-01"]},["Interest: 1 program, 5 files, 39-object call graph.","intMain","tx"],[]],
  ["WP-05","P0","Cloud skills enablement or delivery partner",2,4,1.0,false,{},["Team skills listed do not include the target cloud.","stats"],[],"skill"],
  ["WP-06","P1","Fix the agreed money-logic defects",3,5,0.6,true,{td:["TD-01"],c:["C-01","C-03","C-04","C-09"],br:[RP+"003",RP+"009",RP+"017"]},["Posting and interest defects in CBTRN02C, CBACT04C and COBIL00C.","postAcct","postUpd","billPay"],["WP-01","WP-02"]],
  ["WP-07","P1","Return codes, truncation and initialization",3,5,0.5,true,{td:["TD-02","TD-03","TD-05"]},["25 unchecked CICS return codes, 33 truncating MOVEs, 22 uninitialized reads, 11 overflow flaws.","iso","flaws"],[]],
  ["WP-08","P1","Schedule INTCALC and COMBTRAN; document operations",1,2,0.8,false,{td:["TD-09"],c:["C-08"]},["4 jobs and 9 scripts outside the CA-7 chain.","schedule"],["WP-01"]],
  ["WP-09","P1","Remove dead logic, fix ID generation, retire duplicate reference data",1,2,0.5,true,{td:["TD-07","TD-14"],c:["C-07"]},["13 unreferenced paragraphs, last+1 IDs, transaction types in VSAM and DB2.","iso","addTran","crud"],[]],
  ["WP-10","P2","Convert online: 26 programs, 25 transactions, screens",10,16,0.55,true,{td:["TD-10","TD-11"],adr:["ADR-01","ADR-02"]},["26 CICS programs, BMS maps, 5 CICS files per screen on average.","progs","tx"],["WP-04","WP-06","WP-07"]],
  ["WP-11","P2","Convert batch: 15 programs, 56 jobs, schedule as code",8,12,0.55,true,{td:["TD-10","TD-11"],adr:["ADR-04"]},["15 batch programs, 17 CA-7 jobs, IDCAMS/SORT/FTP steps.","schedule","progs"],["WP-04","WP-08"]],
  ["WP-12","P2","Data model: VSAM, DB2 and IMS into one relational store",6,10,0.7,true,{td:["TD-08","TD-12"],adr:["ADR-03"]},["13 KSDS files, 3 DB2 tables, IMS segments with 12 DL/I call sites.","data","cloud"],["WP-03"]],
  ["WP-13","P2","Messaging and kept interfaces",2,4,0.7,true,{},["7 MQ queues; daily file, statements and report interfaces.","data"],["WP-03"]],
  ["WP-14","P2","Identity: sign-on and user admin to the platform",2,3,0.7,true,{td:["TD-06"]},["Sign-on and 4 user-admin programs use the USRSEC file.","ctxSecurity"],["WP-03"]],
  ["WP-15","P2","PCI controls: encryption, keys, middleware and vulnerability review",3,5,0.8,false,{td:["TD-04"]},["Card numbers in cross-reference and transaction records; CVE scan not configured.","postXref","cve"],["WP-12"]],
  ["WP-16","P3","Data migration and reconciliation tooling",4,6,0.7,true,{},["27 data stores to migrate and reconcile.","data"],["WP-12"]],
  ["WP-17","P3","Parallel run through month-end — compare every output file",6,9,0.9,false,{br:[RP+"011",RP+"015",RP+"031"]},["Posting, interest, statements and reports compared against golden files.","schedule"],["WP-10","WP-11","WP-16"]],
  ["WP-18","P3","Batch window and online performance",3,5,0.7,true,{},["Nightly chain of 15 jobs must fit the batch window.","schedule"],["WP-11"]],
  ["WP-19","P3","Cutover and mainframe decommission",3,5,0.9,false,{},["90 entry points switched; CICS region and batch retired.","tx"],["WP-17","WP-18"]],
  ["WP-20","P4","One owner for account balances (ledger service)",8,12,0.6,true,{td:["TD-08"]},["ACCTDATA written by 4 programs in 2 domains.","crud","blastAcct"],["WP-19"]],
  ["WP-21","P4","Partner APIs and staff web experience",6,10,0.55,true,{},["No API or web channel exists today.","tx"],["WP-19"]],
  ["WP-22","P4","Real-time posting (delta spec 002)",10,16,0.6,true,{c:["C-01","C-03","C-04"]},["Posting is a nightly file job today.","postMain"],["WP-20"]],
];
const RATE = 4000, OVERHEAD = 0.35;
let planMode = "manual";
const addW = (d,w) => new Date(d.getTime() + w*7*864e5);
const fmtD = d => d.toLocaleDateString("en-US",{month:"short",year:"numeric"});
const fmtDay = d => d.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});

function planModel(mode){
  const ai = mode==="ai";
  const skills = ctxVal("team_skills")||[], cloud = ctxVal("tgt_cloud");
  const gap = CSP[cloud] && !skills.includes(cloud);
  const wps = WPS.filter(w=> w[10]!=="skill" || gap);
  const dl = { "< 6 months":6, "6–12 months":12, "12–24 months":24 }[ctxVal("deadline")];
  const deadline = dl ? new Date(PLAN_START.getFullYear(), PLAN_START.getMonth()+dl, 0) : null;
  const dur = p => p[3] * (ai ? p[4] : 1);
  const S = {};
  S.P0 = [PLAN_START, addW(PLAN_START, dur(PHASES[0]))];
  S.P1 = [addW(PLAN_START,4), addW(PLAN_START, 4+dur(PHASES[1]))];
  S.P2 = [S.P0[1], addW(S.P0[1], dur(PHASES[2]))];
  const p3s = addW(S.P2[1], -2); S.P3 = [p3s, addW(p3s, dur(PHASES[3]))];
  const cutover = addW(S.P3[1], -3);
  const p4s = addW(S.P3[1], 2); S.P4 = [p4s, addW(p4s, dur(PHASES[4]))];
  const eff = w => [w[3]*(ai?w[5]:1), w[4]*(ai?w[5]:1)];
  const sum = ph => wps.filter(w=>ph.includes(w[1])).reduce((a,w)=>{ const e=eff(w); return [a[0]+e[0], a[1]+e[1]]; },[0,0]);
  const core = sum(["P0","P1","P2","P3"]), later = sum(["P4"]);
  const coreT = core.map(x=>x*(1+OVERHEAD)), laterT = later.map(x=>x*(1+OVERHEAD));
  const weeks = (S.P3[1]-S.P0[0])/(7*864e5), fte = coreT.map(x=>x/weeks);
  const budgetMap = {"< $250K":[0,250000],"$250K–1M":[250000,1000000],"$1M–3M":[1000000,3000000],"> $3M":[3000000,6000000]};
  return { ai, wps, S, cutover, deadline, core, coreT, laterT, fte, weeks, gap, cloud, eff, budget: budgetMap[ctxVal("budget")], golden: addW(PLAN_START,6), freeze:false };
}
function planGantt(pm){
  const t0 = new Date(2026,9,1), t1 = new Date(2028,9,1), W = 1000, X0 = 200, span = t1-t0;
  const x = d => X0 + (Math.min(d,t1)-t0)/span*(W-X0-10);
  const rows = PHASES.map((p,i)=>({p, y: 70 + i*62}));
  const col = { P0:"#463589", P1:"#C4320A", P2:"#624ABB", P3:"#0C0613", P4:"#9A97A0" };
  let s = `<svg viewBox="0 0 ${W} 420" font-family="Inter,sans-serif">`;
  for (let m = new Date(t0); m < t1; m = new Date(m.getFullYear(), m.getMonth()+1, 1)) { const xx = x(m);
    s += `<line x1="${xx}" y1="36" x2="${xx}" y2="380" stroke="${m.getMonth()===11?"#E6E4EA":"#F5F3F7"}"/>`;
    if (m.getMonth()%3===0) s += `<text x="${xx+3}" y="30" font-size="10.5" fill="#6D6A71">${m.toLocaleDateString("en-US",{month:"short"})} ${String(m.getFullYear()).slice(2)}</text>`; }
  rows.forEach(({p,y})=>{ const [a,b] = pm.S[p[0]];
    s += `<text x="10" y="${y+17}" font-size="12" font-weight="700" fill="#0C0613">${p[0]} · ${p[1].replace("&","&amp;").slice(0,26)}</text>
      <rect x="${x(a)}" y="${y}" width="${Math.max(6,x(b)-x(a))}" height="26" rx="6" fill="${col[p[0]]}" opacity="${p[0]==="P4"?.55:1}"/>
      ${x(b)-x(a)>130 ? `<text x="${x(a)+8}" y="${y+17}" font-size="10.5" font-weight="600" fill="#fff">${fmtD(a)} – ${fmtD(b)}</text>` : `<text x="${x(b)+8}" y="${y+17}" font-size="10.5" font-weight="600" fill="#6D6A71">${fmtD(a)} – ${fmtD(b)}</text>`}`; });
  const ms = [[pm.golden,"golden files captured",0,"#C4320A",33,"start"],[pm.S.P0[1],"G1 decisions + pilot",0,"#0E7490",-15,"start"],[pm.S.P2[1],"G2 converted build passes golden files",2,"#0E7490",-15,"end"],[addW(pm.cutover,-4),"G3 month-end reconciled",3,"#0E7490",33,"end"],[addW(pm.cutover,-1),"G4 rehearsal",3,"#0E7490",-15,"end"],[pm.cutover,"CUTOVER",3,"#067647",33,"start"]];
  ms.forEach(([d,l,r,c,dy,anc])=>{ const y = rows[r].y + 13, xx = x(d);
    s += `<path d="M${xx},${y-9} l9,9 l-9,9 l-9,-9 z" fill="${c}" stroke="#fff" stroke-width="1.5"/><text x="${xx+(anc==="start"?-6:anc==="end"?6:0)}" y="${y+dy}" text-anchor="${anc}" font-size="10" font-weight="700" fill="${c}">${l}</text>`; });
  if (pm.deadline) { const xx = x(pm.deadline); s += `<line x1="${xx}" y1="36" x2="${xx}" y2="380" stroke="#B42318" stroke-dasharray="5 4" stroke-width="1.5"/><text x="${xx-4}" y="48" text-anchor="end" font-size="10" font-weight="700" fill="#B42318">deadline · contract renewal</text>`; }
  return s + `</svg>`;
}
function openWP(id){
  const w = WPS.find(x=>x[0]===id), pm = planModel(planMode), e = pm.eff(w), L = w[7] || {};
  const rules = (L.br||[]).map(b=>RULES.find(r=>r[0]===b)).filter(Boolean);
  const gherkin = rules.filter(r=>r[10]).map(r=>`  @${r[0]}\n  Scenario: ${r[4]}\n    Given ${r[10][0]}\n    When ${r[10][1]}\n    Then ${r[10][2].replace(/ \(fails today[^)]*\)/,"")}`).join("\n\n");
  document.getElementById("drawerKind").textContent = "Work package";
  document.getElementById("drawerTitle").textContent = `${w[0]} · ${w[2]}`;
  document.getElementById("drawerBody").innerHTML = `
    <div class="ev"><div class="evh"><b>Package contents</b><code class="call">${PHASES.find(p=>p[0]===w[1])[1]} · effort ${e[0].toFixed(0)}–${e[1].toFixed(0)} person-weeks (${planMode==="ai"?"AI-assisted":"manual"})</code></div><table>
      <tr><td class="l">Scope evidence</td><td style="text-align:left;font-weight:500">${esc(w[8][0])}</td></tr>
      ${L.td?`<tr><td class="l">Debt items</td><td>${L.td.join(", ")}</td></tr>`:""}${L.c?`<tr><td class="l">Clarifications</td><td>${L.c.join(", ")}</td></tr>`:""}${L.adr?`<tr><td class="l">Decisions</td><td>${L.adr.join(", ")}</td></tr>`:""}
      ${L.br?`<tr><td class="l">Business rules</td><td>${L.br.join(", ")}</td></tr>`:""}<tr><td class="l">Depends on</td><td>${w[9].join(", ")||"—"}</td></tr></table></div>
    ${gherkin?`<div class="ev"><div class="evh"><b>Acceptance tests included</b><code class="call">transactions-billing.feature (excerpt)</code></div><pre>${esc(gherkin)}</pre></div>`:""}
    <div class="ev"><div class="evh"><b>Evidence</b></div></div>${w[8].slice(1).map(evCard).join("")}`;
  showDrawer();
}
function setPlanMode(m){ planMode = m; document.getElementById("doc").innerHTML = modPlan(); paintGrounding(); }
function modPlan(){
  STMTS = [];
  const pm = planModel(planMode), man = planModel("manual"), aim = planModel("ai");
  const pw = r => `${Math.round(r[0])}–${Math.round(r[1])}`, $k = v => "$"+Math.round(v/1000)+"K";
  const cost = pm.coreT.map(x=>x*RATE), inBudget = pm.budget ? cost[1] <= pm.budget[1] : null;
  const monthsTo = d => Math.round((d-PLAN_START)/(30.4*864e5));
  const phaseCards = PHASES.map(p=>{ const ws = pm.wps.filter(w=>w[1]===p[0]); const [a,b] = pm.S[p[0]];
    return `<div class="phase"><div class="phh"><div><code>${p[0]}</code> <b>${p[1]}</b><span>${p[2]}</span></div><span class="phd">${fmtD(a)} – ${fmtD(b)}</span></div>
      ${ws.map(w=>{ const e = pm.eff(w); return `<div class="wp" onclick="openWP('${w[0]}')"><span class="wid">${w[0]}</span><div><b>${w[2]}</b><div class="wbasis">${w[10]==="skill" ? C(esc(w[8][0]),"team_skills","tgt_cloud") : X(esc(w[8][0]), ...w[8].slice(1))}</div>
        <div class="wlinks">${[...(w[7].td||[]),...(w[7].c||[]),...(w[7].adr||[])].map(l=>`<span>${l}</span>`).join("")}${w[9].length?`<span class="dep">after ${w[9].join(", ")}</span>`:""}</div></div>
        <div class="wmeta"><span class="pw">${Math.round(e[0])}–${Math.round(e[1])} pw</span></div></div>`; }).join("")}</div>`; }).join("");
  const gates = [
    ["G1","Decisions made, pilot converted", fmtDay(pm.S.P0[1]), "All 9 clarifications answered; the converted CBACT04C reproduces the golden interest files exactly."],
    ["G2","Converted build passes golden files", fmtDay(pm.S.P2[1]), "Every batch output matches the golden files; online screens pass the recorded scripts; the 13 Gherkin scenarios pass."],
    ["G3","Month-end reconciled", fmtDay(addW(pm.cutover,-4)), "A full month-end — posting, interest, merge, statements — reconciles to the cent on both platforms."],
    ["G4","Cutover rehearsed", fmtDay(addW(pm.cutover,-1)), `Full rehearsal including rollback, inside the ${ctxVal("batch_window")||"agreed"} batch window.`],
  ];
  return `
  <div class="doc-head"><div><div class="eyebrow">Modernization Plan</div><h1>${APP} → ${CSP[pm.cloud]?.name||"target platform"}</h1>
    <div class="meta">Order of operations built from CAST findings, the target state and customer constraints · plan starts ${fmtDay(PLAN_START)}</div></div>
    <div class="doc-actions"><button class="btn btn-primary btn-sm" onclick="openExport(PLAN_FILES(),'Plan and work packages','One Markdown file per work package — scope, evidence, rules and acceptance tests — for a delivery team or an AI coding agent, plus the plan as CSV.')">Export for agents</button></div></div>
  <div class="tsbar"><div class="seg"><button class="${planMode==="manual"?"on":""}" onclick="setPlanMode('manual')">Manual delivery</button><button class="${planMode==="ai"?"on":""}" onclick="setPlanMode('ai')">AI-assisted delivery</button></div>
    <span>${planMode==="ai" ? "Showing the effect of AI agents on conversion review, test writing and documentation." : "Estimates assume people do the work with conventional conversion tooling, without AI assistance."}</span></div>
  <div class="grounding" id="grounding"></div>
  <div class="kpis" style="grid-template-columns:repeat(4,1fr);margin-top:22px">
    <div class="kpi"><div class="v">${fmtD(pm.cutover)}</div><div class="l">Cutover</div><div class="s" style="color:var(--muted)">${monthsTo(pm.cutover)} months from start${pm.deadline?` · deadline ${fmtD(pm.deadline)}`:""}</div></div>
    <div class="kpi"><div class="v">${pw(pm.coreT)}</div><div class="l">Person-weeks to cutover</div><div class="s" style="color:var(--muted)">incl. ${Math.round(OVERHEAD*100)}% program overhead</div></div>
    <div class="kpi"><div class="v">${pm.fte[0].toFixed(1)}–${pm.fte[1].toFixed(1)}</div><div class="l">Dedicated people (FTE)</div><div class="s" style="color:var(--muted)">team today: ${esc(ctxVal("team_size")||"—")}</div></div>
    <div class="kpi"><div class="v">${$k(cost[0])}–${$k(cost[1])}</div><div class="l">Delivery cost to cutover</div><div class="s" style="color:${inBudget===false?"var(--crit)":"var(--good)"}">${pm.budget?(inBudget?"within":"above")+" budget "+esc(ctxVal("budget")):"budget not provided"}</div></div>
  </div>
  <div class="recbox" style="border-left:4px solid var(--purple)"><div class="eyebrow">The plan in brief</div><div class="rtext"><p>
    ${I(`Decide the money questions and capture golden files first, fix the defects on the mainframe where it is cheapest, convert online and batch against those golden files, then run both platforms through a month-end before cutting over in <b>${fmtD(pm.cutover)}</b>.`,"Sequencing derived from the clarifications, the file-based batch and the shared account file.","schedule","postAcct","crud")}
    ${pm.deadline ? C(`That lands ${pm.cutover<pm.deadline?"before":"after"} the ${fmtD(pm.deadline)} deadline the customer tied to the mainframe contract.`,"deadline","contract","notes") : ""}
    ${pm.gap ? C(`The team lists no ${pm.cloud} skills, so enablement or a partner is in phase 0.`,"team_skills","tgt_cloud") : ""}</p></div></div>
  <h2>Timeline</h2>
  <div class="archfig" style="background:#fff">${planGantt(pm)}<div class="figcap">Phases, go/no-go gates (teal), golden-file capture and cutover. ${pm.deadline?"Dashed line: the customer's deadline. ":""}Month-end boundaries are shaded lightly — the parallel run must include at least one.</div></div>
  <h2>Manual vs. AI-assisted</h2>
  <div class="tblwrap"><table class="tbl"><thead><tr><th></th><th style="text-align:right">Manual</th><th style="text-align:right">AI-assisted</th><th style="text-align:right">Difference</th></tr></thead><tbody>
    <tr><td><b>Cutover</b></td><td style="text-align:right">${fmtD(man.cutover)}</td><td style="text-align:right">${fmtD(aim.cutover)}</td><td style="text-align:right;color:var(--good);font-weight:700">${Math.round((man.cutover-aim.cutover)/(30.4*864e5))} months earlier</td></tr>
    <tr><td><b>Person-weeks to cutover</b></td><td style="text-align:right">${pw(man.coreT)}</td><td style="text-align:right">${pw(aim.coreT)}</td><td style="text-align:right;color:var(--good);font-weight:700">−${Math.round((1-aim.coreT[1]/man.coreT[1])*100)}%</td></tr>
    <tr><td><b>Delivery cost to cutover</b></td><td style="text-align:right">${$k(man.coreT[0]*RATE)}–${$k(man.coreT[1]*RATE)}</td><td style="text-align:right">${$k(aim.coreT[0]*RATE)}–${$k(aim.coreT[1]*RATE)}</td><td style="text-align:right;color:var(--good);font-weight:700">−${$k((man.coreT[1]-aim.coreT[1])*RATE)}</td></tr>
  </tbody></table></div>
  <p style="font-size:13px;color:var(--muted);margin-top:8px">${I("AI assistance mostly shortens conversion review, test writing and documentation; decisions, the landing zone, the parallel run and cutover change little. Golden files are what make AI-assisted conversion safe: every output can be checked, not just reviewed.","Reduction factors are planning assumptions per work package, not measured results.","schedule")}</p>
  <h2>Phases and work packages</h2>
  <p style="font-size:13.5px;color:var(--muted);margin-top:-6px">Click a package to see its scope, evidence and acceptance tests.</p>
  ${phaseCards}
  <h2>Go / no-go gates</h2>
  <div class="tblwrap"><table class="tbl"><thead><tr><th>Gate</th><th>When</th><th>Pass criteria</th></tr></thead><tbody>${gates.map(g=>`<tr><td><b style="color:#0E7490">${g[0]}</b> ${g[1]}</td><td style="white-space:nowrap">${g[2]}</td><td>${g[3]}</td></tr>`).join("")}</tbody></table></div>
  <h2>Critical path</h2>
  <ul class="plain">
    <li>${X("Clarifications (WP-01) → money-logic fixes (WP-06) → golden files are regenerated from the corrected mainframe before conversion.","postAcct","billPay")}</li>
    <li>${I("Landing zone (WP-03) → data model (WP-12) → migration tooling (WP-16) → parallel run (WP-17) → cutover (WP-19).","Dependency chain implied by the data stores and the file-based batch.","data","schedule")}</li>
    <li>${X("INTCALC and COMBTRAN must be scheduled (WP-08) before the parallel run can compare a month-end.","schedule")}</li>
    <li>${X("Balances get a single owner (WP-20) only after cutover — four programs in two domains write the account master today.","crud","blastAcct")}</li>
  </ul>
  <h2>Assumptions</h2>
  <div class="clar"><ul style="margin:0;padding-left:18px">
    <li style="margin-bottom:6px">Effort in person-weeks, sized from CAST scope counts (programs, jobs, files, findings) per package; +${Math.round(OVERHEAD*100)}% program overhead.</li>
    <li style="margin-bottom:6px">Blended rate of $${RATE.toLocaleString()} per person-week. Conversion-tool or runtime licenses are extra.</li>
    <li>The mainframe keeps running until cutover; its cost during the parallel run is counted in Return on Investment.</li></ul></div>`;
}
function PLAN_FILES(){
  const pm = planModel(planMode);
  const files = pm.wps.map(w=>[`work-packages/${w[0]}.md`, () => { const e = pm.eff(w), L = w[7]||{}; const rules = (L.br||[]).map(b=>RULES.find(r=>r[0]===b)).filter(Boolean);
    return [`# ${w[0]} — ${w[2]}`,"",`**Phase**: ${PHASES.find(p=>p[0]===w[1])[1]}  `,`**Effort**: ${Math.round(e[0])}–${Math.round(e[1])} person-weeks (${planMode==="ai"?"AI-assisted":"manual"})  `,`**Depends on**: ${w[9].join(", ")||"—"}`,"","## Scope (from CAST Imaging)","",w[8][0],"","## Links","",
      L.td?`- Debt: ${L.td.join(", ")}`:"",L.c?`- Clarifications: ${L.c.join(", ")}`:"",L.adr?`- Decisions: ${L.adr.join(", ")}`:"","",
      rules.filter(r=>r[10]).length?"## Acceptance tests\n\n```gherkin\n"+rules.filter(r=>r[10]).map(r=>`Scenario: ${r[4]}\n  Given ${r[10][0]}\n  When ${r[10][1]}\n  Then ${r[10][2].replace(/ \(fails today[^)]*\)/,"")}`).join("\n\n")+"\n```":"",
      "","_Context for agents: see specs/001-transactions-billing, rules/transactions-billing and target-state/ in this export._"].join("\n"); }]);
  files.unshift(["plan/modernization-plan.csv", () => [["Package","Phase","Title","Effort low (pw)","Effort high (pw)","Depends on"], ...pm.wps.map(w=>{const e=pm.eff(w); return [w[0],w[1],w[2],Math.round(e[0]),Math.round(e[1]),w[9].join(" ")];})].map(r=>r.map(x=>`"${String(x).replace(/"/g,'""')}"`).join(",")).join("\n")]);
  return files;
}

/* =====================================================================
   RETURN ON INVESTMENT
   ===================================================================== */
const ROI_CUR = {"< $250K":[150000,250000],"$250K–1M":[250000,1000000],"$1M–3M":[1000000,3000000],"> $3M":[3000000,5000000]};
function roiModel(mode){
  const cloud = tsCloud || (CSP[ctxVal("tgt_cloud")] ? ctxVal("tgt_cloud") : "AWS");
  const cm = costModel(cloud), pm = planModel(mode), cur = ROI_CUR[ctxVal("cur_cost")];
  const OPS = 75000; // ~0.5 FTE cloud operations for the new platform — planning assumption
  const runMo = cm.prodMo + cm.npMo + OPS/12, run = [cm.annual*0.8+OPS, cm.annual+OPS, cm.annual*1.4+OPS];
  const deliv = [pm.coreT[0]*RATE, (pm.coreT[0]+pm.coreT[1])/2*RATE, pm.coreT[1]*RATE];
  const monthsTo = Math.max(1, Math.round((pm.cutover - PLAN_START)/(30.4*864e5)));
  const parMonths = Math.max(1, Math.round((pm.cutover - pm.S.P3[0])/(30.4*864e5)));
  const parallel = runMo * parMonths;
  const scen = (curA, runA, upfront) => { const saveMo = (curA - runA)/12, curve = []; let c = 0;
    for (let m = 1; m <= 60; m++) { c += m <= monthsTo ? -upfront/monthsTo : saveMo; curve.push(c); }
    const pay = saveMo > 0 ? monthsTo + Math.ceil(upfront/saveMo) : null;
    return { curA, runA, upfront, saveYr: curA-runA, pay: pay && pay<=60 ? pay : (pay ? pay : null), net3: curve[35], net5: curve[59], roi5: curve[59]/upfront, curve }; };
  const mid = cur ? (cur[0]+cur[1])/2 : null;
  const S = cur ? { conservative: scen(cur[0], run[2], deliv[2]+parallel), expected: scen(mid, run[1], deliv[1]+parallel), optimistic: scen(cur[1], run[0], deliv[0]+parallel) } : null;
  return { cloud, cm, pm, cur, run, deliv, parallel, parMonths, monthsTo, S };
}
function setRoiMode(m){ planMode = m; document.getElementById("doc").innerHTML = roiPage(); paintGrounding(); }
function roiPage(){
  STMTS = [];
  const r = roiModel(planMode), c = CSP[r.cloud];
  if (!r.S) return docHead("Plan","Return on Investment","Needs today's annual run cost from Customer Context.");
  const $k = v => (v<0?"−":"")+"$"+(Math.abs(v)>=1e6 ? (Math.abs(v)/1e6).toFixed(2)+"M" : Math.round(Math.abs(v)/1000)+"K");
  const yrs = m => m==null ? "never" : m > 60 ? "over 5 years" : m < 12 ? `${m} months` : `${(m/12).toFixed(1)} years`;
  const e = r.S.expected, cons = r.S.conservative, opt = r.S.optimistic, col = v => v>=0 ? "var(--good)" : "var(--crit)";
  return `
  <div class="doc-head"><div><div class="eyebrow">Return on Investment</div><h1>Moving ${APP} off the mainframe to ${c.name}</h1>
    <div class="meta">Today's run cost vs. target run cost and the upfront investment · 5-year view from ${fmtDay(PLAN_START)}</div></div>
    <div class="doc-actions"><button class="btn btn-primary btn-sm" onclick="openExport(ROI_FILES(),'ROI summary','The business case as Markdown and CSV — for a steering committee pack, or as context for an agent drafting the investment memo.')">Export for agents</button></div></div>
  <div class="tsbar"><div class="seg"><button class="${planMode==="manual"?"on":""}" onclick="setRoiMode('manual')">Manual delivery</button><button class="${planMode==="ai"?"on":""}" onclick="setRoiMode('ai')">AI-assisted delivery</button></div>
    <span>Same switch as the Modernization Plan — AI assistance lowers the upfront investment.</span></div>
  <div class="grounding" id="grounding"></div>
  <div class="roiverdict">
    <div class="rv-main"><div class="eyebrow" style="color:#B8A9EE">The answer</div>
      <div class="rv-big">Pays back in <b>${yrs(e.pay)}</b></div>
      <div class="rv-sub">${I(`An investment of about <b>${$k(e.upfront)}</b> cuts run cost by about <b>${$k(e.saveYr)} a year</b>, for a 5-year net benefit of <b>${$k(e.net5)}</b> (${Math.round(e.roi5*100)}% return).`,"Expected scenario: midpoint of today's cost, expected target run cost, midpoint of the delivery estimate plus the parallel run.","stats")}</div></div>
    <div class="rv-range"><div><span>Conservative</span><b>${yrs(cons.pay)}</b></div><div><span>Optimistic</span><b>${yrs(opt.pay)}</b></div><div class="rv-note">payback range</div></div>
  </div>
  <div class="kpis" style="grid-template-columns:repeat(4,1fr);margin-top:14px">
    <div class="kpi"><div class="v">${$k(e.curA)}</div><div class="l">Mainframe run cost, per year</div><div class="s" style="color:var(--muted)">${C(`customer range ${$k(r.cur[0])}–${$k(r.cur[1])}`,"cur_cost")}</div></div>
    <div class="kpi"><div class="v">${$k(e.runA)}</div><div class="l">Run cost on ${r.cloud}, per year</div><div class="s" style="color:var(--muted)">${Pr("infrastructure",r.cloud)} + ~0.5 FTE operations</div></div>
    <div class="kpi"><div class="v">${$k(e.upfront)}</div><div class="l">Upfront investment</div><div class="s" style="color:var(--muted)">delivery + ${r.parMonths}-month parallel run</div></div>
    <div class="kpi"><div class="v" style="color:${col(e.net5)}">${$k(e.net5)}</div><div class="l">Net benefit over 5 years</div><div class="s" style="color:var(--muted)">3 years: ${$k(e.net3)}</div></div>
  </div>
  <h2>Cumulative cash position</h2>
  <div class="archfig" style="background:#fff">${roiCurve(r)}<div class="figcap">Solid: expected. Dashed: conservative and optimistic. Spend during modernization, then monthly savings from cutover (${fmtD(r.pm.cutover)}).</div></div>
  <h2>Three scenarios</h2>
  <div class="tblwrap"><table class="tbl"><thead><tr><th></th><th style="text-align:right">Conservative</th><th style="text-align:right">Expected</th><th style="text-align:right">Optimistic</th></tr></thead><tbody>
    <tr><td>Mainframe run cost, per year</td>${[cons,e,opt].map(s=>`<td style="text-align:right">${$k(s.curA)}</td>`).join("")}</tr>
    <tr><td>Run cost on ${r.cloud}, per year</td>${[cons,e,opt].map(s=>`<td style="text-align:right">${$k(s.runA)}</td>`).join("")}</tr>
    <tr><td>Upfront investment</td>${[cons,e,opt].map(s=>`<td style="text-align:right">${$k(s.upfront)}</td>`).join("")}</tr>
    <tr><td><b>Annual savings</b></td>${[cons,e,opt].map(s=>`<td style="text-align:right;font-weight:700">${$k(s.saveYr)}</td>`).join("")}</tr>
    <tr><td><b>Payback</b></td>${[cons,e,opt].map(s=>`<td style="text-align:right;font-weight:700">${yrs(s.pay)}</td>`).join("")}</tr>
    <tr><td><b>5-year net benefit</b></td>${[cons,e,opt].map(s=>`<td style="text-align:right;font-weight:800;color:${col(s.net5)}">${$k(s.net5)}</td>`).join("")}</tr>
  </tbody></table></div>
  <h2>What decides the answer</h2>
  <ul class="plain">
    <li>${I(`<b>What the mainframe really costs for this application.</b> The customer gave ${$k(r.cur[0])}–${$k(r.cur[1])}; MIPS-based licenses often do not fall until the capacity is actually released, so confirm what stops at cutover.`,"Mainframe cost allocation and license mechanics.","stats")}</li>
    <li>${I("<b>Conversion and runtime licenses.</b> Refactoring tools and COBOL runtimes are licensed separately and are not in these numbers.","Excluded from both the plan and the run-cost estimate.","stats")}</li>
    <li>${I(`<b>How the work is delivered.</b> AI-assisted delivery lowers the upfront investment to about ${$k(roiModel("ai").S.expected.upfront)} (expected).`,"From the Modernization Plan's AI-assisted estimate.","tx")}</li>
  </ul>
  <h2>Value not in these numbers</h2>
  <ul class="plain">
    <li>${X("Money-logic defects fixed before they are migrated — over-limit test, posting without rollback, interest on paid balances, missing fees.","postAcct","postUpd","billPay","intFees")}</li>
    <li>${C("Retirement risk of COBOL and mainframe-operations skills removed.","drivers","team_skills")}</li>
    <li>${X("Operations knowledge captured: four jobs and nine scripts that run outside the scheduler become code.","schedule")}</li>
  </ul>
  <p style="font-size:12.5px;color:var(--muted);margin-top:14px">Assumptions: delivery at $${RATE.toLocaleString()} per person-week plus ${Math.round(OVERHEAD*100)}% overhead; target run cost includes about 5K a year (half an FTE) to operate the new platform; cloud and mainframe run side by side for ${r.parMonths} months before cutover; mainframe costs for this application stop at cutover; no discounting, tax or financing.</p>`;
}
function ROI_FILES(){
  const r = roiModel(planMode), k = v => "$"+Math.round(v).toLocaleString(), e = r.S.expected;
  const rows = [["Scenario","Run cost today / yr","Run cost target / yr","Upfront","Annual savings","Payback (months)","3-yr net","5-yr net"], ...Object.entries(r.S).map(([n,s])=>[n,Math.round(s.curA),Math.round(s.runA),Math.round(s.upfront),Math.round(s.saveYr),s.pay??"never",Math.round(s.net3),Math.round(s.net5)])];
  return [["roi/roi-summary.md", () => [`# Return on Investment — ${APP} to ${CSP[r.cloud].name}`,"",`**Expected:** pays back in ${e.pay} months; ${k(e.upfront)} upfront; ${k(e.saveYr)} saved per year; 5-year net ${k(e.net5)}.`,"","| Scenario | Upfront | Annual savings | Payback (months) | 5-yr net |","|---|---|---|---|---|",...Object.entries(r.S).map(([n,s])=>`| ${n} | ${k(s.upfront)} | ${k(s.saveYr)} | ${s.pay??"never"} | ${k(s.net5)} |`)].join("\n")],["roi/roi-scenarios.csv", () => rows.map(x=>x.join(",")).join("\n")]];
}

function placeholder(d){
  const st = statusOf(d), deps = PLAN_DEPS[d.id];
  const ctxBox = deps ? `<div class="ph-box" style="margin-top:14px"><h4>Customer context used (${deps.filter(ctxAnswered).length} of ${deps.length})</h4>
      <div class="tblwrap"><table class="tbl"><tbody>${deps.map(k=>`<tr><td style="width:40%">${fieldLabel(k)}</td><td>${ctxAnswered(k)?esc(fmtVal(ctxVal(k))):'<span style="color:var(--inferred);font-weight:600">missing</span>'}</td></tr>`).join("")}</tbody></table></div></div>` : "";
  return `${docHead(d.group, d.name, d.blurb)}
  <div class="ph-hero"><span class="gtag ${st==="ctx"?"ctx":"ext"}">${S_LABEL[st]}</span>
    <h3>${st==="ctx" ? "Waiting on customer context" : "Ready to generate"}</h3>
    <p>This deliverable combines CAST's current-state analysis with information the code can't tell us. Complete the missing inputs in Customer Context.</p>
    <button class="btn btn-primary" onclick="go('#/ws/ctx')">Complete customer context</button></div>
  ${ctxBox}
  ${d.sources?`<div class="ph-cols"><div class="ph-box"><h4>Built from</h4><ul>${d.sources.map(s=>`<li>${s}</li>`).join("")}</ul></div><div class="ph-box"><h4>What you get</h4><ul>${d.output.map(s=>`<li>${s}</li>`).join("")}</ul></div></div>`:""}`;
}
