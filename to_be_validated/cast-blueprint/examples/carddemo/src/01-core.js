/* =====================================================================
   CONFIG
   ===================================================================== */
const PRODUCT = "Blueprint";   // working name — change here
const APP = "CardDemo";
const SHOW = "Transactions & Billing";           // showcase domain
const SHOW_H = "Transactions &amp; Billing";
const CTX_KEY = "blueprint-ctx-carddemo";

/* =====================================================================
   DATA — pulled from the CAST Imaging MCP gateway (snapshot)
   ===================================================================== */
const SYSTEM = {
  name: "CardDemo credit card platform",
  snapshot: "Dec 4, 2025",
  apps: [
    { id:"cd", name:"CardDemo-Cobol", role:"Credit card accounts, transactions, billing and authorizations", tech:"COBOL · CICS · JCL / CA-7 · VSAM · DB2 · IMS · MQ · Assembler", loc:48758, objects:1573, links:3544, tx:90, cves:0 },
  ],
  domains: ["Transactions & Billing","Accounts & Customers","Cards","Pending Authorizations","Transaction Types","User Admin","Sign-on & Menus","MQ Services"]
};
const DOMAIN_BAR = SYSTEM.domains;

/* Evidence registry: every extracted statement points at one or more of these */
const EV = {
  stats: { title:"Application statistics", call:"stats(application=CardDemo-Cobol)", rows:[
      ["Lines of code","48,758"],["Objects / links","1,573 / 3,544"],
      ["Technologies","Assembler · CA-7 · COBOL · CICS · IMS · MQ Series · z/OS JCL · shell · SQL"],
      ["CRUD interactions","select · insert · update · delete"],["Data sensitivity levels","Sensitive Data"]]},
  layers: { title:"Architecture layers", call:"architectural_graph(CardDemo-Cobol, level=layer)", rows:[
      ["Services","374 objects"],["Data Services","148 objects"],["System Interaction","106 objects"],["User Interaction","21 objects"]]},
  progs: { title:"COBOL programs", call:"run_cypher_query — objects of type Cobol Program / Batch / Transactional", rows:[
      ["COBOL programs","42"],["Online (CICS transactional)","26"],["Batch","15"],["Other (CBTRN01C)","1"]]},
  tx: { title:"Transactions (entry points)", call:"transactions(CardDemo-Cobol)", rows:[
      ["Entry points in total","90"],["CICS transactions","25"],["JCL jobs + 1 procedure","39"],["CA-7 scheduled jobs","17"],["Shell scripts","9"],
      ["Largest online: CC00 sign-on · CCLI card list","170 objects each"],["CAUP account update","162"],["CTLI transaction-type list (DB2)","190"],
      ["POSTTRAN nightly posting","46"],["INTCALC interest","39"],["CREASTMT statements","50"],["TRANREPT report","56"]]},
  schedule: { title:"Nightly batch schedule (CA-7)", call:"run_cypher_query — (CA7 Job)-[:FIRE]->(CA7 Job) · (JCL Job)-[:CALL]->(program)", rows:[
      ["CA-7 jobs","17"],["Chain","CLOSEFIL → CBPAUP0J → POSTTRAN → WAITSTEP → CLOSEFIL1/2 → TRANCATG → TCATBALF → READACCT → READCARD → READCUST → READXREF → CREASTMT → TXT2PDF1 → PRTCATBL → OPENFIL"],
      ["POSTTRAN","runs CBTRN02C (posting)"],["CREASTMT","runs CBSTM03A → CBSTM03B (statements)"],
      ["Not in the CA-7 schedule","INTCALC (interest) · TRANREPT (report) · COMBTRAN (merge) · TRANBKP (backup)"],
      ["Shell scripts present","run_interest_calc.sh · run_posting.sh · run_full_batch.sh"]]},
  data: { title:"Data stores and their accessors", call:"run_cypher_query — data objects (VSAM, DB2, IMS, MQ, GDG) with READ/WRITE/SELECT/INSERT/UPDATE/DELETE links", rows:[
      ["VSAM KSDS files","13 (+1 ESDS, 1 RRDS)"],["DB2 tables","TRANSACTION_TYPE · TRANSACTION_TYPE_CATEGORY · AUTHFRDS"],["IMS DB segments","PAUTSUM0 · PAUTINDX"],
      ["MQ queues","CARD.DEMO.ERROR + 3 request/3 reply queues (names resolved at run time)"],
      ["CARDXREF (card ↔ account)","19 accessors"],["ACCTDATA (account master)","17 accessors"],["TRANSACT (CICS)","17 accessors"],["TRANSACTION_TYPE (DB2)","16 accessors"]]},
  crud: { title:"Program → data store access", call:"run_cypher_query — program sub-objects -[READ|WRITE|SELECT|INSERT|UPDATE|DELETE|OPEN]-> data store", rows:[
      ["ACCTDATA written by","COACTUPC (account update) · COBIL00C (bill pay) · CBTRN02C (posting) · CBACT04C (interest)"],
      ["ACCTDATA read by","COACTVWC · COPAUA0C · COPAUS0C · COACCT01 · CBSTM03B · CBACT01C"],
      ["TRANSACT written by","CBTRN02C · COBIL00C · COTRN02C"],["TCATBALF written by","CBTRN02C (read by CBACT04C)"],
      ["CUSTDATA written by","COACTUPC"],["CARDDATA written by","COCRDUPC"],["USRSEC written by","COUSR01C–03C"],["PAUTSUM0 (IMS) written by","COPAUA0C · COPAUS1C · CBPAUP0C"]]},
  nav: { title:"Program-to-program links", call:"run_cypher_query — CALL · EXEC_TRAN (XCTL) · FIRE between programs and CICS transactions", rows:[
      ["Online programs returning to menu / sign-on","21"],["CBSTM03A → CBSTM03B","13 calls (statement subroutine)"],["CSUTLDTC (date validation) called by","COTRN02C · CORPT00C · COACTUPC"],
      ["Main menu → options","resolved at run time from a table (not a static link)"]]},
  iso: { title:"ISO 5055 weaknesses", call:"quality_insights(CardDemo-Cobol, nature=iso-5055)", rows:[
      ["Rules with findings","23"],["Never truncate data in MOVE statements","33 objects"],["High cyclomatic complexity","31"],["CICS return code not checked","25"],
      ["Working-storage read before initialized","22"],["STRING without overflow check","22"],["Large paragraphs","14"],["Unreferenced sections / paragraphs","13"],
      ["Buffer overrun in arithmetic loops","11"],["GOTO statements","10"],["READ without AT END / INVALID KEY","10"],["EVALUATE without WHEN OTHER","8"]]},
  cloud: { title:"Cloud readiness patterns", call:"quality_insights(CardDemo-Cobol, nature=cloud-detection-patterns)", rows:[
      ["Patterns detected","11 (9 blockers · 2 boosters)"],["Blocker occurrences","515 in 368 objects"],
      ["Code that can accidentally get skipped","235 objects"],["GOTO statements","97"],["Binary data types","81"],["REDEFINES","51"],["OCCURS","28"],
      ["DL/I calls (IMS)","12"],["Packed decimal","7"],["ALTER","2"],["SYSIBM.SYSDUMMY1","2"],["Boosters: DB2 · IMS/MQ connections","27 · 25"]]},
  green: { title:"Green-IT patterns", call:"quality_insights(CardDemo-Cobol, nature=green-detection-patterns)", rows:[["String concatenation in loops","4 objects (COMEN01C, COADM01C)"]]},
  flaws: { title:"Structural flaws", call:"quality_insights(CardDemo-Cobol, nature=structural-flaws)", rows:[["Buffer overrun: arithmetic without ON SIZE ERROR inside loops","11 objects — incl. CBTRN02C, CBACT04C, CBTRN03C, CBSTM03A"]]},
  cve: { title:"Open-source vulnerabilities (CVE)", call:"applications_quality_insights()", rows:[["CVE findings","0"],["Imaging comment","No CVE insights — the scanning for such issues was likely not configured"]],
      note:"Zero here means “not scanned”, not “no risk”. Mainframe applications rarely carry open-source packages, but vendor products (CICS, IMS, DB2, MQ levels) still need a patch review." },
  insights: { title:"All findings by type", call:"run_cypher_query — (object)-[:MANIFESTS]->(Insight) grouped by Insight.Type", rows:[
      ["CloudReady — blocker","515 occurrences · 368 objects"],["Detection pattern (ISO 5055)","242 · 58 objects"],["CloudReady — booster","52 · 52 objects"],["Structural flaw","11 · 11"],["Green — blocker","8 · 4"]]},
  tags: { title:"Business domains", call:"stats(CardDemo-Cobol).custom_tags · transactions · program names", rows:[
      ["Custom tags on this application","demo tags (MMR_DMN_*, NFR_DMN_*, MyTAG001…) — not a business-domain taxonomy"],
      ["Domains used here","8, grouped from CICS transactions, programs and the data they own"]],
      note:"Unlike Shopizer, CardDemo has no business-domain tags in Imaging. The grouping is an interpretation; tagging it back into Imaging (manage_object_tags) would make it deterministic for the next run." },
};

/* Statement helpers: X = extracted (grounded in Imaging evidence), I = inferred (LLM interpretation) */
let STMTS = [];
function X(text, ...ev){ STMTS.push({k:"ext"}); return `<span class="stmt">${text}<button class="src ext" onclick="openEvidence(${JSON.stringify(ev).replace(/"/g,"&quot;")},this)">◆ Imaging</button></span>`; }
function I(text, basis, ...ev){ STMTS.push({k:"inf"}); return `<span class="stmt">${text}<button class="src inf" onclick="openInferred(${JSON.stringify(basis).replace(/"/g,"&quot;")},${JSON.stringify(ev).replace(/"/g,"&quot;")},this)">◇ Inferred</button></span>`; }
const fmt = n => n.toLocaleString("en-US");
const TOTAL = { loc:48758, objects:1573, tx:90, cves:0 };

/* Deliverables */
const DELIV = [
  { id:"exec", group:"Understand", name:"Executive Summary", status:"done", g:"mix",
    blurb:"One-page view of the system, its risks and what to do next — for leadership." },
  { id:"spec", group:"Understand", name:"Application Specification", status:"done", g:"ext",
    blurb:"As-is specification per business domain in GitHub Spec Kit format — readable by people, ready for AI coding agents." },
  { id:"rules", group:"Understand", name:"Business Rules", status:"done", g:"mix",
    blurb:"Rules buried in COBOL paragraphs — posting validation, interest, payments — each linked to the paragraph that enforces it, with the inconsistent ones flagged." },
  { id:"stories", group:"Understand", name:"User Stories", status:"done", g:"mix",
    blurb:"Detailed as-is stories per domain — who does what, on which CICS screen or batch job — with acceptance criteria taken from the business rules." },
  { id:"seq", group:"Understand", name:"Technical Diagrams", status:"done", g:"ext",
    blurb:"Eight diagrams — context, containers, domain coupling, data ownership, job and screen flows, lifecycles, blast radius, integrations — condensed from CAST Imaging and exported as Mermaid." },
  { id:"debt", group:"Assess", name:"Technical Debt", status:"done", g:"ext",
    blurb:"Where the debt sits by business domain, a prioritized register, and quick wins separated from structural work." },
  { id:"ctx", group:"Plan", name:"Customer Context", status:"done", g:"cust",
    blurb:"What the code can't tell us — MIPS, batch window, volumes, target direction, drivers, constraints." },
  { id:"target", group:"Plan", name:"Target State Architecture", status:"ctx", g:"ctx",
    blurb:"Target architecture guided by the AWS, Azure and GCP Well-Architected Frameworks and their mainframe modernization patterns.",
    sources:["Current-state analysis — online, batch, data stores","Cloud readiness blockers and boosters","Well-Architected skill","Customer context"], output:["Target diagram","Current → target mapping","Pillar rationale","Decision log"] },
  { id:"cost", group:"Plan", name:"Estimated Running Costs", status:"ctx", g:"ctx",
    blurb:"Run-cost estimate for the target state, by service and environment.",
    sources:["Target State Architecture","Customer context — volumes, environments","Cloud provider pricing"], output:["Monthly run cost by service","Prod / non-prod","Sensitivity","Today vs. target"] },
  { id:"plan", group:"Plan", name:"Modernization Plan", status:"ctx", g:"ctx",
    blurb:"Sequenced roadmap from today to target state — phases, work packages, gates and effort.",
    sources:["All deliverables above","Data ownership from CAST Imaging","Customer context"], output:["Phase plan","Critical path","Gates","Effort"] },
  { id:"roi", group:"Plan", name:"Return on Investment", status:"ctx", g:"ctx",
    blurb:"Today's run cost vs. the target run cost and the upfront investment — payback, net benefit and what drives it.",
    sources:["Customer context — today's cost","Estimated Running Costs","Modernization Plan"], output:["Payback","5-year net","Scenarios","Cash curve"] },
];
const G_LABEL = { ext:"Grounded in Imaging", mix:"Grounded + interpreted", ctx:"Needs customer context", cust:"Customer-provided" };
const S_LABEL = { done:"Generated", ready:"Ready to generate", ctx:"Needs customer context" };

/* =====================================================================
   ROUTER
   ===================================================================== */
let generated = false;
let route = "#/";
function go(h){ route = h; try { if (location.hash !== h) history.pushState(null, "", h); } catch(e) {} render(); }
window.addEventListener("popstate", ()=>{ route = location.hash || "#/"; render(); });
function render(){
  closeDrawer(true);
  document.getElementById("productName").textContent = PRODUCT;
  document.title = `CAST ${PRODUCT} — ${APP}`;
  const m = route.match(/^#\/ws\/(\w+)/);
  if (m && generated) renderWorkspace(m[1]); else renderHome();
  window.scrollTo(0,0);
}

/* =====================================================================
   HOME
   ===================================================================== */
function renderHome(){
  document.getElementById("crumb").innerHTML = "";
  const a = SYSTEM.apps[0];
  const dgrid = DELIV.filter(d=>d.id!=="ctx").map(d=>`<div class="deliv"><span class="gtag ${d.g}">${G_LABEL[d.g]}</span><h4>${d.name}</h4><p>${d.blurb}</p></div>`).join("");
  document.getElementById("view").innerHTML = `
  <div class="home">
    <div class="hero">
      <div class="eyebrow">From analysis to action</div>
      <h1>CAST intelligence, delivered as the <em>outputs your teams act on.</em></h1>
      <p>${PRODUCT} turns CAST's deterministic understanding of your software into executive summaries, specifications, business rules, target architectures and modernization plans — every statement traceable to the code.</p>
    </div>
    <div class="steps">
      <div class="step"><div class="n">1</div><h4>Analyze</h4><p>CAST Imaging deterministically analyzes the application's code base — every object, every link, every transaction — with the same answer every time.</p></div>
      <div class="step"><div class="n">2</div><h4>Ground</h4><p>${PRODUCT} takes the insights generated by CAST Imaging and builds each deliverable on them, clearly labeling what comes from the code and what is interpreted.</p></div>
      <div class="step"><div class="n">3</div><h4>Deliver</h4><p>Reports, specs and plans ready for leadership, architects and delivery teams — the discovery phase, completed.</p></div>
    </div>
    <div class="syscard">
      <div class="syscard-head">
        <div><div class="eyebrow">System analyzed</div><h2>${SYSTEM.name}</h2>
          <div class="meta">1 application · ${fmt(TOTAL.loc)} lines of code · ${fmt(TOTAL.objects)} objects · analyzed by CAST Imaging ${SYSTEM.snapshot}</div></div>
        <button class="btn btn-primary" onclick="startGenerate()">Generate ${PRODUCT} →</button>
      </div>
      <div class="syscard-body">
        <div class="apps"><h5>Application</h5>
          <div class="app"><div class="name">${a.name}</div><div class="tech">${a.role} · ${a.tech}</div>
          <div class="nums"><div><b>${fmt(a.loc)}</b>LOC</div><div><b>${fmt(a.objects)}</b>objects</div><div><b>${a.tx}</b>transactions</div></div></div>
          <div class="app"><div class="name">42 COBOL programs</div><div class="tech">26 online (CICS) · 15 batch · 1 other — plus JCL, CA-7 schedule, BMS maps and copybooks</div></div></div>
        <div class="depgraph"><h5>How it is built</h5>${depSVG()}</div>
      </div>
    </div>
    <div class="section-title"><div><div class="eyebrow">What ${PRODUCT} produces</div><h3>Ten deliverables, one analysis</h3></div></div>
    <div class="deliv-grid">${dgrid}</div>
  </div>`;
}
function depSVG(){
  return `<svg viewBox="0 0 420 250" role="img" aria-label="Online and batch share VSAM, DB2, IMS and MQ">
    <defs><marker id="ah" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#624ABB"/></marker></defs>
    <g font-family="Inter,sans-serif">
      <rect x="10" y="20" width="170" height="54" rx="10" fill="#fff" stroke="#E6E4EA"/><text x="95" y="43" text-anchor="middle" font-size="13" font-weight="700" fill="#0C0613">Online · CICS</text><text x="95" y="61" text-anchor="middle" font-size="11" fill="#6D6A71">25 transactions · 26 programs</text>
      <rect x="240" y="20" width="170" height="54" rx="10" fill="#fff" stroke="#E6E4EA"/><text x="325" y="43" text-anchor="middle" font-size="13" font-weight="700" fill="#0C0613">Batch · JCL / CA-7</text><text x="325" y="61" text-anchor="middle" font-size="11" fill="#6D6A71">56 jobs · 15 programs</text>
      <rect x="90" y="140" width="240" height="58" rx="10" fill="#624ABB"/><text x="210" y="165" text-anchor="middle" font-size="13" font-weight="700" fill="#fff">Shared data</text><text x="210" y="183" text-anchor="middle" font-size="11" fill="#E7E1F8">VSAM · DB2 · IMS DB · MQ</text>
      <path d="M95,74 L160,138" stroke="#624ABB" stroke-width="2" fill="none" marker-end="url(#ah)"/><path d="M325,74 L260,138" stroke="#624ABB" stroke-width="2" fill="none" marker-end="url(#ah)"/>
      <text x="70" y="112" font-size="11.5" font-weight="600" fill="#463589">read / write</text><text x="282" y="112" font-size="11.5" font-weight="600" fill="#463589">read / write</text>
      <text x="210" y="232" text-anchor="middle" font-size="11" font-weight="600" fill="#463589">same account file written by both</text>
    </g></svg>`;
}
function startGenerate(){
  const steps = [
    ["Connecting to CAST Imaging","CardDemo-Cobol · snapshot "+SYSTEM.snapshot],
    ["Reading the CAST Imaging analysis","1,573 objects · 3,544 links"],
    ["Resolving transactions, jobs and data access","90 entry points · 42 programs · 27 data stores"],
    ["Collecting quality and cloud findings","23 ISO 5055 rules · 11 cloud patterns · 829 findings"],
    ["Reading the paragraphs behind posting, interest and bill pay","source returned by Imaging"],
    ["Labeling extracted vs. inferred content","Grounding check complete"],
  ];
  const box = document.getElementById("gsteps");
  box.innerHTML = steps.map(s=>`<div class="gstep"><span class="ic"></span><div>${s[0]}<small>${s[1]}</small></div></div>`).join("");
  document.getElementById("modalBg").classList.add("open");
  const els = [...box.children]; let i = 0; const prog = document.getElementById("gprog"); prog.style.width = "0";
  const tick = () => {
    if (i>0){ els[i-1].classList.remove("active"); els[i-1].classList.add("done"); els[i-1].querySelector(".ic").textContent="✓"; }
    prog.style.width = (i/steps.length*100)+"%";
    if (i<els.length){ els[i].classList.add("active"); i++; setTimeout(tick, 650+Math.random()*350); }
    else setTimeout(()=>{ document.getElementById("modalBg").classList.remove("open"); generated = true; go("#/ws/exec"); }, 450);
  };
  tick();
}

/* =====================================================================
   WORKSPACE
   ===================================================================== */
function renderWorkspace(id){
  const d = DELIV.find(x=>x.id===id) || DELIV[0];
  document.getElementById("crumb").innerHTML = `${APP} · <b>${d.name}</b>`;
  const OUT = DELIV.filter(x=>x.id!=="ctx");
  const groups = [...new Set(OUT.map(x=>x.group))];
  const ctxAll = CTX_FIELDS.filter(f=>f[4]!=="info"&&f[4]!=="text"), ctxPct = Math.round(ctxAll.filter(f=>ctxAnswered(f[0])).length/ctxAll.length*100);
  const plansReady = Object.keys(PLAN_DEPS).filter(k=>planStatus(k)==="ready").length;
  const inputs = `<div class="inlbl">Inputs</div>
      <div class="incard" onclick="go('#/')" title="Back to the system overview">
        <div class="inh"><b>CAST Imaging analysis</b><span class="pv det">Complete</span></div>
        <span class="insub">${APP} · 1 app · ${SYSTEM.snapshot}</span>
        <div class="chips">${["CICS","Batch","VSAM","DB2","IMS","MQ"].map(c=>`<span class="chip">${c}</span>`).join("")}</div></div>
      <div class="incard cust ${d.id==="ctx"?"active":""}" onclick="go('#/ws/ctx')">
        <div class="inh"><b>Customer context</b><span class="pv ${ctxPct===100?"cus":"sug"}">${ctxPct}%</span></div>
        <div class="inbar"><i style="width:${ctxPct}%"></i></div>
        <span class="insub">${plansReady} of ${Object.keys(PLAN_DEPS).length} Plan sections ready · edit answers →</span></div>
      <div class="inlbl" style="margin-top:18px">Deliverables</div>`;
  const nav = groups.map(g=>`<div class="navgroup">${g}</div>` + OUT.filter(x=>x.group===g).map(x=>`
      <div class="navitem ${x.id===d.id?"active":""}" onclick="go('#/ws/${x.id}')"><span>${x.name}</span><span class="status ${statusOf(x)}" title="${S_LABEL[statusOf(x)]}"></span></div>`).join("")).join("");
  const body = d.id==="exec" ? execSummary() : d.id==="spec" ? appSpec() : d.id==="rules" ? bizRules() : d.id==="stories" ? userStories() : d.id==="seq" ? techDiagrams() : d.id==="debt" ? techDebt() : d.id==="ctx" ? customerContext()
    : d.id==="target" && planStatus("target")==="ready" ? targetState() : d.id==="cost" && planStatus("cost")==="ready" ? costEstimate() : d.id==="plan" && planStatus("plan")==="ready" ? modPlan() : d.id==="roi" && planStatus("roi")==="ready" ? roiPage() : placeholder(d);
  document.getElementById("view").innerHTML = `
  <div class="ws"><nav class="side">${inputs}${nav}
      <div class="legend"><div><span class="status done"></span>Generated</div><div><span class="status ready"></span>Ready to generate</div><div><span class="status ctx"></span>Needs customer context</div></div></nav>
    <main class="main"><div class="doc" id="doc">${body}</div></main></div>`;
  if (["exec","spec","rules","stories","seq","debt"].includes(d.id) || (["target","cost","plan","roi"].includes(d.id) && planStatus(d.id)==="ready")) paintGrounding();
}
function domainBar(kind){
  return `<div class="domainbar"><span class="lbl">Domain</span>${DOMAIN_BAR.map((d,i)=>`<span class="dchip ${i===0?"on":""}" onclick="${i===0?"":`toast('${d}: ${kind} can be generated on request')`}">${d.replace("&","&amp;")}${i?'<span class="plus">+</span>':""}</span>`).join("")}</div>`;
}

/* ---------------- Executive Summary ---------------- */
function execSummary(){
  STMTS = [];
  const meter = n => `<div class="meter">${[1,2,3,4,5].map(i=>`<i class="${i<=n?"on":""}"></i>`).join("")}</div>`;
  return `
  ${docHead("Executive Summary", SYSTEM.name, `Generated from CAST Imaging · CardDemo-Cobol · snapshot ${SYSTEM.snapshot} · version 1`)}
  <div class="grounding" id="grounding"></div>
  <div class="bottomline"><div class="eyebrow">Bottom line</div>
    <p>${I("CardDemo is small and well bounded — 49K lines of COBOL in 42 programs — so it is a candidate for automated refactoring or replatforming, not a manual rewrite.",
        "Size and structure are extracted; the choice of approach weighs them against the mechanical nature of most cloud blockers (GOTO, binary fields, REDEFINES).","stats","progs","cloud")}
       ${I("The real risk is not code volume but the money logic in the nightly batch: posting and interest carry defects that a like-for-like migration would faithfully reproduce. Decide them first.",
        "Drawn from the source of the posting (CBTRN02C), interest (CBACT04C) and bill-pay (COBIL00C) paragraphs returned by Imaging.","postAcct","intMain","billPay")}</p></div>

  <h2>At a glance</h2>
  <div class="kpis">
    <div class="kpi" onclick="openEvidence(['stats'])"><div class="v">49K</div><div class="l">Lines of code</div></div>
    <div class="kpi" onclick="openEvidence(['progs'])"><div class="v">42</div><div class="l">COBOL programs</div><div class="s">26 online · 15 batch</div></div>
    <div class="kpi" onclick="openEvidence(['tx'])"><div class="v">90</div><div class="l">Entry points</div><div class="s">25 CICS · 56 batch · 9 scripts</div></div>
    <div class="kpi" onclick="openEvidence(['cloud'])"><div class="v">515</div><div class="l">Cloud-blocker occurrences</div><div class="s">in 368 objects</div></div>
    <div class="kpi" onclick="openEvidence(['tags'])"><div class="v">8</div><div class="l">Business domains</div><div class="s">grouped — not tagged</div></div>
  </div>

  <h2>The system</h2>
  <p>${X("CardDemo manages credit card accounts, cards, customers and their transactions on the mainframe: 48,758 lines of COBOL, CICS, JCL and Assembler, with data in VSAM files, DB2 tables, an IMS database and MQ queues.","stats","data")}
     ${X("Back-office users work through 25 CICS transactions — sign-on, accounts, cards, transactions, bill payment, reports and user administration — while 56 batch jobs, 17 of them in a CA-7 schedule, post the day's transactions, calculate interest and produce statements.","tx","schedule")}
     ${X("Online and batch programs read and write the same VSAM files: the account master alone is reached from 12 entry points.","crud","blastAcct")}</p>
  <div class="archfig">${currentArchSVG()}<div class="figcap">Current-state architecture, generated from CAST Imaging layers, entry points and data access.</div></div>

  <h2>Modernization readiness</h2>
  <div class="score">
    <div class="cell"><div class="t">Architecture</div><div class="r">Moderate</div>${meter(3)}</div>
    <div class="cell"><div class="t">Cloud readiness</div><div class="r">Moderate</div>${meter(3)}</div>
    <div class="cell"><div class="t">Security posture</div><div class="r">Not assessed</div>${meter(2)}</div>
    <div class="cell"><div class="t">Maintainability</div><div class="r">Favorable</div>${meter(4)}</div>
  </div>
  <p style="margin-top:10px;font-size:13.5px;color:var(--muted)">${I("Ratings are an assessment built on the findings below.","Architecture: one program per screen is clean, but online and batch share writable files. Cloud: 515 blocker occurrences, almost all mechanical. Security: no CVE scan was configured, and 25 objects ignore CICS return codes. Maintainability: small code base, 242 ISO 5055 occurrences in 58 objects.","crud","cloud","cve","iso")}</p>

  <h2>Key findings</h2>
  <div class="findings">
    <div class="finding"><span class="sev critical">Critical</span><div>
      <h3>The nightly money logic has defects a migration would copy</h3>
      <p>${X("The over-limit check in posting uses the current cycle's credits and debits instead of the account balance; posting updates balances and writes the transaction without rolling back when the account update fails; and fee calculation is an empty paragraph marked “To be implemented”.","postAcct","postUpd","intFees")}</p>
      <p>${I("Online bill payment reduces the account balance but not the category balances that interest is calculated from — so interest may be charged on money already paid.","Reading of COBIL00C (updates ACCTDAT and TRANSACT only) against CBACT04C (interest from TCATBALF).","billPay","intCalc","crud")}</p>
    </div></div>
    <div class="finding"><span class="sev high">High</span><div>
      <h3>One account file, two owners</h3>
      <p>${X("The account master (ACCTDATA) is written by account maintenance (COACTUPC) and by three Transactions &amp; Billing programs — online bill pay, nightly posting and interest — and read by authorizations and MQ services: 10 programs and 12 entry points.","crud","blastAcct")}</p>
      <p>${I("Shared writable files are what make online/batch concurrency and any service split hard; they need a single owner before domains can move independently.","Standard data-ownership reasoning applied to the extracted access map.","crud")}</p>
    </div></div>
    <div class="finding"><span class="sev high">High</span><div>
      <h3>Part of the batch runs outside the scheduler</h3>
      <p>${X("The CA-7 schedule chains 17 jobs — posting, reference reloads, statements — but interest calculation (INTCALC), the transaction report (TRANREPT) and the job that merges interest transactions into the history (COMBTRAN) are not in it; shell scripts such as run_interest_calc.sh exist beside it.","schedule")}</p>
      <p>${I("Month-end interest depends on someone or something outside the schedule. That operational knowledge has to be captured before the batch moves.","Absence from the extracted CA-7 chain; how the jobs are actually run is a question for operations.","schedule")}</p>
    </div></div>
    <div class="finding"><span class="sev medium">Medium</span><div>
      <h3>Cloud blockers are many but mechanical</h3>
      <p>${X("CAST detects 515 blocker occurrences in 368 objects: code that can be skipped by fall-through (235 objects), GOTO (97), binary fields (81), REDEFINES (51), OCCURS (28), DL/I calls (12), packed decimal (7) and ALTER (2). DB2 and IMS/MQ connections count as boosters.","cloud")}</p>
      <p>${I("Almost all of these are handled by automated COBOL-to-Java refactoring or by a COBOL runtime on the cloud; only ALTER and the DL/I calls need design attention.","Maps each pattern to what refactoring and replatforming tools handle routinely.","cloud")}</p>
    </div></div>
    <div class="finding"><span class="sev strength">Strength</span><div>
      <h3>Small, readable and cleanly separated</h3>
      <p>${X("Each online function is one program behind one CICS transaction, the batch programs are single-purpose, and ISO 5055 findings are concentrated in 58 objects.","nav","progs","iso")}</p>
      <p>${I("The whole application can be covered by characterization tests — files in, files out for batch; screen in, screen out for online — which makes an automated migration verifiable.","Follows from the size and the file-based interfaces.","progs","schedule")}</p>
    </div></div>
  </div>

  <h2>Recommendations</h2>
  <div class="recs">
    <div class="rec"><div><h4>Decide the money questions</h4><p>${I("Answer the 9 clarifications on posting, interest, fees and bill pay before any conversion — the migrated system should implement the intended rules, not today's accidents.","Each clarification quotes the paragraph that raised it.","postAcct","billPay","intFees")}</p></div><span class="horizon now">0–3 months</span></div>
    <div class="rec"><div><h4>Capture the batch as golden files</h4><p>${I("Record input and output files for POSTTRAN, INTCALC and CREASTMT over a few business days; they become the regression oracle for any migration.","Batch programs communicate through files, which makes before/after comparison exact.","schedule","crud")}</p></div><span class="horizon now">0–3 months</span></div>
    <div class="rec"><div><h4>Scan what Imaging was not configured to scan</h4><p>${I("Run the vulnerability and middleware-level review that the CVE scan did not cover, and fix the 25 unchecked CICS return codes.","CVE scanning returned nothing because it was not configured.","cve","iso")}</p></div><span class="horizon now">0–3 months</span></div>
    <div class="rec"><div><h4>Give the account file one owner</h4><p>${I("Route every balance change through one module, bring INTCALC and COMBTRAN into the schedule, and then choose replatform or refactor in the Target State Architecture.","Sequencing uses the extracted access map and schedule.","crud","schedule")}</p></div><span class="horizon">3–9 months</span></div>
    <div class="rec"><div><h4>Move domain by domain</h4><p>${I("Start with User Admin, Transaction Types and MQ Services, which touch the fewest shared files; move Transactions &amp; Billing last, behind the golden-file tests.","Ordering follows the domain map and data ownership.","crud","nav")}</p></div><span class="horizon">9–18 months</span></div>
  </div>

  <h2>Continue in this ${PRODUCT}</h2>
  <div class="next-grid">${DELIV.filter(x=>x.id!=="exec"&&x.id!=="ctx").map(x=>`
    <div class="deliv" onclick="go('#/ws/${x.id}')"><span class="gtag ${x.g}">${S_LABEL[statusOf(x)]}</span><h4>${x.name}</h4><p>${x.blurb}</p></div>`).join("")}</div>`;
}

function currentArchSVG(){
  const t = (x,y,s,w=700,c="#6D6A71") => `<text x="${x}" y="${y}" font-size="${s}" font-weight="${w}" fill="${c}">`;
  return `<svg viewBox="0 0 840 300" role="img" aria-label="Current state architecture">
    <defs><marker id="a2" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#624ABB"/></marker></defs>
    <g font-family="Inter,sans-serif">
      ${t(20,22,11)}CHANNELS</text>
      <rect x="20" y="34" width="190" height="56" rx="10" fill="#fff" stroke="#E6E4EA"/><text x="115" y="58" text-anchor="middle" font-size="13" font-weight="700" fill="#0C0613">3270 terminals</text><text x="115" y="76" text-anchor="middle" font-size="11" fill="#6D6A71">users and admins · BMS maps</text>
      <rect x="20" y="104" width="190" height="56" rx="10" fill="#fff" stroke="#E6E4EA"/><text x="115" y="128" text-anchor="middle" font-size="13" font-weight="700" fill="#0C0613">CA-7 scheduler</text><text x="115" y="146" text-anchor="middle" font-size="11" fill="#6D6A71">17 jobs · nightly chain</text>
      <rect x="20" y="174" width="190" height="56" rx="10" fill="#fff" stroke="#E6E4EA"/><text x="115" y="198" text-anchor="middle" font-size="13" font-weight="700" fill="#0C0613">MQ clients</text><text x="115" y="216" text-anchor="middle" font-size="11" fill="#6D6A71">account · date inquiries</text>
      ${t(270,22,11)}CARDDEMO · z/OS</text>
      <rect x="270" y="34" width="330" height="236" rx="12" fill="#F4F1FC" stroke="#E7E1F8"/>
      <rect x="286" y="48" width="145" height="100" rx="8" fill="#624ABB"/><text x="358" y="70" text-anchor="middle" font-size="12" font-weight="700" fill="#fff">CICS online</text><text x="358" y="88" text-anchor="middle" font-size="10.5" fill="#E7E1F8">25 transactions</text><text x="358" y="104" text-anchor="middle" font-size="10.5" fill="#E7E1F8">26 programs</text><text x="358" y="126" text-anchor="middle" font-size="10" fill="#E7E1F8">accounts · cards · billing</text>
      <rect x="439" y="48" width="145" height="100" rx="8" fill="#0C0613"/><text x="511" y="70" text-anchor="middle" font-size="12" font-weight="700" fill="#fff">Batch</text><text x="511" y="88" text-anchor="middle" font-size="10.5" fill="#C7C9E0">56 JCL / CA-7 jobs</text><text x="511" y="104" text-anchor="middle" font-size="10.5" fill="#C7C9E0">15 programs</text><text x="511" y="126" text-anchor="middle" font-size="10" fill="#C7C9E0">posting · interest · statements</text>
      <rect x="286" y="158" width="298" height="40" rx="8" fill="#fff" stroke="#E7E1F8"/><text x="435" y="183" text-anchor="middle" font-size="11.5" font-weight="600" fill="#463589">Services 374 · Data services 148 · System 106 objects</text>
      <rect x="286" y="208" width="298" height="48" rx="8" fill="#fff" stroke="#E7E1F8"/><text x="435" y="228" text-anchor="middle" font-size="11.5" font-weight="600" fill="#463589">Shared copybooks · CSUTLDTC date utility</text><text x="435" y="244" text-anchor="middle" font-size="10.5" fill="#6D6A71">Assembler helpers · 9 shell scripts</text>
      ${t(660,22,11)}DATA &amp; MESSAGING</text>
      <rect x="660" y="34" width="160" height="56" rx="10" fill="#0C0613"/><text x="740" y="58" text-anchor="middle" font-size="13" font-weight="700" fill="#fff">VSAM</text><text x="740" y="76" text-anchor="middle" font-size="11" fill="#C7C9E0">13 KSDS · accounts, cards, txns</text>
      <rect x="660" y="100" width="160" height="50" rx="10" fill="#fff" stroke="#E6E4EA"/><text x="740" y="121" text-anchor="middle" font-size="12" font-weight="700" fill="#0C0613">DB2</text><text x="740" y="138" text-anchor="middle" font-size="10.5" fill="#6D6A71">transaction types · fraud</text>
      <rect x="660" y="160" width="160" height="50" rx="10" fill="#fff" stroke="#E6E4EA"/><text x="740" y="181" text-anchor="middle" font-size="12" font-weight="700" fill="#0C0613">IMS DB</text><text x="740" y="198" text-anchor="middle" font-size="10.5" fill="#6D6A71">pending authorizations</text>
      <rect x="660" y="220" width="160" height="50" rx="10" fill="#fff" stroke="#E6E4EA"/><text x="740" y="241" text-anchor="middle" font-size="12" font-weight="700" fill="#0C0613">MQ</text><text x="740" y="258" text-anchor="middle" font-size="10.5" fill="#6D6A71">requests · replies · errors</text>
      <path d="M210,62 L284,90" stroke="#624ABB" stroke-width="2" marker-end="url(#a2)"/><path d="M210,132 L437,120" stroke="#624ABB" stroke-width="2" marker-end="url(#a2)"/><path d="M210,202 C250,202 260,140 284,130" stroke="#624ABB" stroke-width="2" fill="none" marker-end="url(#a2)"/>
      <path d="M600,62 L658,62" stroke="#C7C9E0" stroke-width="2"/><path d="M600,125 L658,125" stroke="#C7C9E0" stroke-width="2"/><path d="M600,185 L658,185" stroke="#C7C9E0" stroke-width="2"/><path d="M600,245 L658,245" stroke="#C7C9E0" stroke-width="2"/>
    </g></svg>`;
}
