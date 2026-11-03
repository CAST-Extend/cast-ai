/* =====================================================================
   CONFIG + DATA — GrandNode (CAST Imaging snapshot)
   ===================================================================== */
const PRODUCT = "Blueprint";
const APP = "GrandNode";
const SHOW = "Checkout & Orders", SHOW_H = "Checkout &amp; Orders";
const CTX_KEY = "blueprint-ctx-grandnode";
const SYSTEM = { name:"GrandNode e-commerce platform", snapshot:"Jun 17, 2025",
  apps:[{ id:"gn", name:"GrandNode", role:"Storefront, admin console, Web API and plugins (v4.60)", tech:"C# · ASP.NET Core MVC · MediatR · MongoDB · Redis · AWS S3 · jQuery", loc:350442, objects:44941, links:179954, tx:2229, cves:44 }] };
const DOMAIN_BAR = ["Checkout & Orders","Catalog","Customers","Payments","Shipping","Discounts","Tax","Messaging","Content & Community","Media","Security","Localization","Platform"];
const fmt = n => n.toLocaleString("en-US");
const TOTAL = { loc:350442, objects:44941, tx:2229, cves:44 };

const EV = {
  stats:{ title:"Application statistics", call:"stats(application=GrandNode)", rows:[["Lines of code","350,442"],["Objects / links","44,941 / 179,954"],["Technologies",".NET · C# · VB.NET · ASP.NET MVC · MediatR · MongoDB · Redis · AWS S3 · HTML · JavaScript · jQuery"],["Source version","grandnode-4.60"]]},
  layers:{ title:"Architecture layers", call:"architectural_graph(GrandNode, level=layer)", rows:[["Services","3,180 objects"],["User Interaction","1,168"],["System Interaction","115"],["Data Services","4"]]},
  tx:{ title:"Transactions (entry points)", call:"transactions(GrandNode) · run_cypher_query (count, by area)", rows:[["Transactions","2,229"],["Admin controller actions","1,147"],["Storefront controller actions","278"],["Plugin controller actions","82"],["Storefront jQuery/JS calls","125"],["Admin jQuery/JS calls","59"],
    ["Largest checkout: Checkout/OpcSaveBilling","985 objects"],["Checkout/OpcSaveShipping","974"],["Checkout/OnePageCheckout","763"],["Checkout/ConfirmOrder","244"]]},
  ns:{ title:"Service namespaces", call:"run_cypher_query — classes and members per Grand.Services.* namespace", rows:[["Service namespaces","36"],["Largest (members)","Messages 668 · Catalog 529 · Customers 383 · Orders 363 · Payments 148 · Shipping 129"],["Custom tags","none — domains are grouped from namespaces"]],
    note:"GrandNode has no business-domain tags in Imaging; its Grand.Services.* namespaces are a clean proxy. The grouping of 36 namespaces into 13 domains is an interpretation." },
  coupling:{ title:"Calls between service domains", call:"run_cypher_query — (Grand.Services.X method)-[:CALL]->(Grand.Services.Y method), X ≠ Y", rows:[["Orders → Catalog","151 calls"],["Catalog → Events","92"],["Messages → Customers","82"],["Messages → Stores","61"],["Orders → Customers","56"],["Orders → Payments","55"],["Orders → Messages / Localization","44 / 44"],["Orders → Shipping","33"]]},
  repos:{ title:"Repositories by domain", call:"run_cypher_query — service members -[RELY_ON]-> IRepository<T>", rows:[["IRepository<Order>","Orders · Customers · Courses · Affiliates"],["IRepository<Product>","Catalog · Orders · Shipping · Tax · Discounts"],["IRepository<Customer>","Customers · Catalog · Messages"],["IRepository<Category> / <Manufacturer>","Catalog · Discounts"],["IRepository<ProductDeleted>","Catalog · Orders"]],
    note:"MongoDB collections are reached through a generic repository; Imaging resolves which class depends on which IRepository<T>, not whether it reads or writes. The Installation namespace (seeding) is excluded." },
  iso:{ title:"ISO 5055 / quality findings", call:"run_cypher_query — (object)-[:MANIFESTS]->(Insight {Type:'Detection Pattern'})", rows:[["Rules with findings","44"],["Object findings","9,681"],["Await without ConfigureAwait(false)","3,881 objects"],["High fan-out","3,224"],["High fan-in","560"],["Copy-pasted artifacts","473"],["Returned objects not cached","416"],["Large artifacts","413"],["Large methods","105"],["Empty catch blocks","27"],["Database queries inside loops","18"],["Dangerous file upload · path manipulation via API","4 · 4"]]},
  cloud:{ title:"Cloud and container readiness", call:"quality_insights(GrandNode, nature=cloud-detection-patterns)", rows:[["Patterns","14"],["File manipulation","81 objects"],["Directory manipulation","27"],["Hard-coded HTTP URLs","14"],["Unsecure protocols (HTTP, FTP)","8"],["Local file system","4"],["Hard-coded IP address","1"],["Boosters","cloud data storage (S3) · correct logging"]]},
  green:{ title:"Green-IT patterns", call:"quality_insights(GrandNode, nature=green-detection-patterns)", rows:[["Instantiations inside loops","422 objects"],["Nested loops","147"],["Comparison-to-0","97"],["String concatenation in loops","75"],["Empty catches","28"]]},
  flaws:{ title:"Structural flaws", call:"quality_insights(GrandNode, nature=structural-flaws)", rows:[["Database queries inside a loop","18 objects"],["querySelectorAll","1"]]},
  cve:{ title:"Open-source vulnerabilities", call:"quality_insights(GrandNode, nature=cve)", rows:[["CVEs","44 — 0 critical · 2 high · 33 medium · 9 unrated"],["TinyMCE","22"],["jQuery","12"],["MongoDB (server advisories)","5"],["MongoDB C# driver","1 high"],["CodeMirror · ASP.NET Core · Django · healthchecks","1 each"]]},
  pkgNone:{ title:"Package inventory", call:"packages(GrandNode)", rows:[["Result","No packages in this application"]], note:"CVEs were matched by the library scan, but no NuGet/npm inventory was resolved — versions and using-object counts are not available." },
};
let STMTS = [];
function X(text, ...ev){ STMTS.push({k:"ext"}); return `<span class="stmt">${text}<button class="src ext" onclick="openEvidence(${JSON.stringify(ev).replace(/"/g,"&quot;")},this)">◆ Imaging</button></span>`; }
function I(text, basis, ...ev){ STMTS.push({k:"inf"}); return `<span class="stmt">${text}<button class="src inf" onclick="openInferred(${JSON.stringify(basis).replace(/"/g,"&quot;")},${JSON.stringify(ev).replace(/"/g,"&quot;")},this)">◇ Inferred</button></span>`; }

const DELIV = [
  { id:"exec", group:"Understand", name:"Executive Summary", status:"done", g:"mix", blurb:"One-page view of the system, its risks and what to do next — for leadership." },
  { id:"spec", group:"Understand", name:"Application Specification", status:"done", g:"ext", blurb:"As-is specification per business domain in GitHub Spec Kit format — readable by people, ready for AI coding agents." },
  { id:"rules", group:"Understand", name:"Business Rules", status:"done", g:"mix", blurb:"Rules embedded in the checkout and order services, each linked to the method that enforces it, with the risky ones flagged." },
  { id:"stories", group:"Understand", name:"User Stories", status:"done", g:"mix", blurb:"Detailed as-is stories per domain, with acceptance criteria taken from the business rules." },
  { id:"seq", group:"Understand", name:"Technical Diagrams", status:"done", g:"ext", blurb:"Eight diagrams — context, containers, domain coupling, data ownership, flows, lifecycles, blast radius, integrations — exported as Mermaid." },
  { id:"debt", group:"Assess", name:"Technical Debt", status:"done", g:"ext", blurb:"Where the debt sits by domain, a prioritized register, open-source vulnerabilities and quick wins." },
  { id:"ctx", group:"Plan", name:"Customer Context", status:"done", g:"cust", blurb:"What the code can't tell us — hosting, usage, target direction, drivers, constraints." },
  { id:"target", group:"Plan", name:"Target State Architecture", status:"ctx", g:"ctx", blurb:"Target architecture guided by the AWS, Azure and GCP Well-Architected Frameworks.", sources:["Current-state analysis","Cloud blockers","Well-Architected skill","Customer context"], output:["Diagram","Mapping","Pillars","Decisions"] },
  { id:"cost", group:"Plan", name:"Estimated Running Costs", status:"ctx", g:"ctx", blurb:"Run-cost estimate for the target state, by service and environment.", sources:["Target state","Customer sizing","Public prices"], output:["Monthly cost","Prod / non-prod","Sensitivity"] },
  { id:"plan", group:"Plan", name:"Modernization Plan", status:"ctx", g:"ctx", blurb:"Sequenced roadmap — phases, work packages, gates and effort.", sources:["All deliverables","Coupling","Customer context"], output:["Phases","Gates","Effort"] },
  { id:"roi", group:"Plan", name:"Return on Investment", status:"ctx", g:"ctx", blurb:"Today's run cost vs. target run cost and the upfront investment.", sources:["Customer context","Running costs","Plan"], output:["Payback","5-year net","Scenarios"] },
];
const G_LABEL = { ext:"Grounded in Imaging", mix:"Grounded + interpreted", ctx:"Needs customer context", cust:"Customer-provided" };
const S_LABEL = { done:"Generated", ready:"Ready to generate", ctx:"Needs customer context" };

let generated = false, route = "#/";
function go(h){ route = h; try { if (location.hash !== h) history.pushState(null, "", h); } catch(e) {} render(); }
window.addEventListener("popstate", ()=>{ route = location.hash || "#/"; render(); });
function render(){ closeDrawer(true); document.getElementById("productName").textContent = PRODUCT; document.title = `CAST ${PRODUCT} — ${APP}`;
  const m = route.match(/^#\/ws\/(\w+)/); if (m && generated) renderWorkspace(m[1]); else renderHome(); window.scrollTo(0,0); }

function renderHome(){
  document.getElementById("crumb").innerHTML = ""; const a = SYSTEM.apps[0];
  const dgrid = DELIV.filter(d=>d.id!=="ctx").map(d=>`<div class="deliv"><span class="gtag ${d.g}">${G_LABEL[d.g]}</span><h4>${d.name}</h4><p>${d.blurb}</p></div>`).join("");
  document.getElementById("view").innerHTML = `<div class="home">
    <div class="hero"><div class="eyebrow">From analysis to action</div><h1>CAST intelligence, delivered as the <em>outputs your teams act on.</em></h1>
      <p>${PRODUCT} turns CAST's deterministic understanding of your software into executive summaries, specifications, business rules, target architectures and modernization plans — every statement traceable to the code.</p></div>
    <div class="steps"><div class="step"><div class="n">1</div><h4>Analyze</h4><p>CAST Imaging deterministically analyzes the application's code base — every object, every link, every transaction — with the same answer every time.</p></div>
      <div class="step"><div class="n">2</div><h4>Ground</h4><p>${PRODUCT} takes the insights generated by CAST Imaging and builds each deliverable on them, clearly labeling what comes from the code and what is interpreted.</p></div>
      <div class="step"><div class="n">3</div><h4>Deliver</h4><p>Reports, specs and plans ready for leadership, architects and delivery teams — the discovery phase, completed.</p></div></div>
    <div class="syscard"><div class="syscard-head"><div><div class="eyebrow">System analyzed</div><h2>${SYSTEM.name}</h2>
      <div class="meta">1 application · ${fmt(TOTAL.loc)} lines of code · ${fmt(TOTAL.objects)} objects · analyzed by CAST Imaging ${SYSTEM.snapshot}</div></div>
      <button class="btn btn-primary" onclick="startGenerate()">Generate ${PRODUCT} →</button></div>
      <div class="syscard-body"><div class="apps"><h5>Application</h5><div class="app"><div class="name">${a.name}</div><div class="tech">${a.role} · ${a.tech}</div>
        <div class="nums"><div><b>${fmt(a.loc)}</b>LOC</div><div><b>${fmt(a.objects)}</b>objects</div><div><b>${fmt(a.tx)}</b>transactions</div></div></div>
        <div class="app"><div class="name">One deployable, four faces</div><div class="tech">Storefront · admin console · Web API · 9 plugin families (payments, shipping, tax, auth…)</div></div></div>
      <div class="depgraph"><h5>How it is built</h5>${depSVG()}</div></div></div>
    <div class="section-title"><div><div class="eyebrow">What ${PRODUCT} produces</div><h3>Ten deliverables, one analysis</h3></div></div>
    <div class="deliv-grid">${dgrid}</div></div>`;
}
function depSVG(){
  return `<svg viewBox="0 0 420 250" role="img" aria-label="Storefront, admin and plugins on one ASP.NET Core application over MongoDB"><defs><marker id="ah" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#624ABB"/></marker></defs>
    <g font-family="Inter,sans-serif"><rect x="10" y="20" width="125" height="50" rx="10" fill="#fff" stroke="#E6E4EA"/><text x="72" y="42" text-anchor="middle" font-size="12.5" font-weight="700" fill="#0C0613">Storefront</text><text x="72" y="58" text-anchor="middle" font-size="10.5" fill="#6D6A71">278 actions</text>
    <rect x="148" y="20" width="125" height="50" rx="10" fill="#fff" stroke="#E6E4EA"/><text x="210" y="42" text-anchor="middle" font-size="12.5" font-weight="700" fill="#0C0613">Admin</text><text x="210" y="58" text-anchor="middle" font-size="10.5" fill="#6D6A71">1,147 actions</text>
    <rect x="286" y="20" width="125" height="50" rx="10" fill="#fff" stroke="#E6E4EA"/><text x="348" y="42" text-anchor="middle" font-size="12.5" font-weight="700" fill="#0C0613">Plugins</text><text x="348" y="58" text-anchor="middle" font-size="10.5" fill="#6D6A71">82 actions</text>
    <rect x="80" y="120" width="260" height="56" rx="10" fill="#624ABB"/><text x="210" y="144" text-anchor="middle" font-size="13" font-weight="700" fill="#fff">Grand.Services</text><text x="210" y="162" text-anchor="middle" font-size="11" fill="#E7E1F8">36 service namespaces · MediatR</text>
    <path d="M72,70 L150,118" stroke="#624ABB" stroke-width="2" marker-end="url(#ah)"/><path d="M210,70 L210,118" stroke="#624ABB" stroke-width="2" marker-end="url(#ah)"/><path d="M348,70 L270,118" stroke="#624ABB" stroke-width="2" marker-end="url(#ah)"/>
    <rect x="60" y="205" width="90" height="26" rx="6" fill="#0C0613"/><text x="105" y="222" text-anchor="middle" font-size="11" font-weight="600" fill="#fff">MongoDB</text>
    <rect x="165" y="205" width="90" height="26" rx="6" fill="#F4F1FC"/><text x="210" y="222" text-anchor="middle" font-size="11" font-weight="600" fill="#463589">Redis</text>
    <rect x="270" y="205" width="90" height="26" rx="6" fill="#F4F1FC"/><text x="315" y="222" text-anchor="middle" font-size="11" font-weight="600" fill="#463589">AWS S3</text>
    <path d="M210,176 L105,203 M210,176 L210,203 M210,176 L315,203" stroke="#C7C9E0" stroke-width="2"/></g></svg>`;
}
function startGenerate(){
  const steps = [["Connecting to CAST Imaging","GrandNode · snapshot "+SYSTEM.snapshot],["Reading the CAST Imaging analysis","44,941 objects · 179,954 links"],["Resolving transactions and service structure","2,229 entry points · 36 service namespaces"],
    ["Collecting quality, security and cloud findings","44 CVEs · 44 ISO 5055 rules · 14 cloud patterns"],["Reading the checkout and order-processing code","source returned by Imaging"],["Labeling extracted vs. inferred content","Grounding check complete"]];
  const box = document.getElementById("gsteps"); box.innerHTML = steps.map(s=>`<div class="gstep"><span class="ic"></span><div>${s[0]}<small>${s[1]}</small></div></div>`).join("");
  document.getElementById("modalBg").classList.add("open"); const els = [...box.children]; let i = 0; const prog = document.getElementById("gprog"); prog.style.width = "0";
  const tick = () => { if (i>0){ els[i-1].classList.remove("active"); els[i-1].classList.add("done"); els[i-1].querySelector(".ic").textContent="✓"; } prog.style.width = (i/steps.length*100)+"%";
    if (i<els.length){ els[i].classList.add("active"); i++; setTimeout(tick, 650+Math.random()*350); } else setTimeout(()=>{ document.getElementById("modalBg").classList.remove("open"); generated = true; go("#/ws/exec"); }, 450); };
  tick();
}
function renderWorkspace(id){
  const d = DELIV.find(x=>x.id===id) || DELIV[0];
  document.getElementById("crumb").innerHTML = `${APP} · <b>${d.name}</b>`;
  const OUT = DELIV.filter(x=>x.id!=="ctx"), groups = [...new Set(OUT.map(x=>x.group))];
  const ctxAll = CTX_FIELDS.filter(f=>f[4]!=="info"&&f[4]!=="text"), ctxPct = Math.round(ctxAll.filter(f=>ctxAnswered(f[0])).length/ctxAll.length*100);
  const plansReady = Object.keys(PLAN_DEPS).filter(k=>planStatus(k)==="ready").length;
  const inputs = `<div class="inlbl">Inputs</div><div class="incard" onclick="go('#/')"><div class="inh"><b>CAST Imaging analysis</b><span class="pv det">Complete</span></div>
      <span class="insub">${APP} · 1 app · ${SYSTEM.snapshot}</span><div class="chips">${["Storefront","Admin","API","Plugins"].map(c=>`<span class="chip">${c}</span>`).join("")}</div></div>
    <div class="incard cust ${d.id==="ctx"?"active":""}" onclick="go('#/ws/ctx')"><div class="inh"><b>Customer context</b><span class="pv ${ctxPct===100?"cus":"sug"}">${ctxPct}%</span></div>
      <div class="inbar"><i style="width:${ctxPct}%"></i></div><span class="insub">${plansReady} of ${Object.keys(PLAN_DEPS).length} Plan sections ready · edit answers →</span></div>
    <div class="inlbl" style="margin-top:18px">Deliverables</div>`;
  const nav = groups.map(g=>`<div class="navgroup">${g}</div>` + OUT.filter(x=>x.group===g).map(x=>`<div class="navitem ${x.id===d.id?"active":""}" onclick="go('#/ws/${x.id}')"><span>${x.name}</span><span class="status ${statusOf(x)}" title="${S_LABEL[statusOf(x)]}"></span></div>`).join("")).join("");
  const body = d.id==="exec" ? execSummary() : d.id==="spec" ? appSpec() : d.id==="rules" ? bizRules() : d.id==="stories" ? userStories() : d.id==="seq" ? techDiagrams() : d.id==="debt" ? techDebt() : d.id==="ctx" ? customerContext()
    : d.id==="target" && planStatus("target")==="ready" ? targetState() : d.id==="cost" && planStatus("cost")==="ready" ? costEstimate() : d.id==="plan" && planStatus("plan")==="ready" ? modPlan() : d.id==="roi" && planStatus("roi")==="ready" ? roiPage() : placeholder(d);
  document.getElementById("view").innerHTML = `<div class="ws"><nav class="side">${inputs}${nav}<div class="legend"><div><span class="status done"></span>Generated</div><div><span class="status ready"></span>Ready to generate</div><div><span class="status ctx"></span>Needs customer context</div></div></nav>
    <main class="main"><div class="doc" id="doc">${body}</div></main></div>`;
  if (["exec","spec","rules","stories","seq","debt"].includes(d.id) || (["target","cost","plan","roi"].includes(d.id) && planStatus(d.id)==="ready")) paintGrounding();
}
function domainBar(kind){ return `<div class="domainbar"><span class="lbl">Domain</span>${DOMAIN_BAR.map((d,i)=>`<span class="dchip ${i===0?"on":""}" onclick="${i===0?"":`toast('${d}: ${kind} can be generated on request')`}">${d.replace("&","&amp;")}${i?'<span class="plus">+</span>':""}</span>`).join("")}</div>`; }

function execSummary(){
  STMTS = []; const meter = n => `<div class="meter">${[1,2,3,4,5].map(i=>`<i class="${i<=n?"on":""}"></i>`).join("")}</div>`;
  return `${docHead("Executive Summary", SYSTEM.name, `Generated from CAST Imaging · GrandNode 4.60 · snapshot ${SYSTEM.snapshot} · version 1`)}
  <div class="grounding" id="grounding"></div>
  <div class="bottomline"><div class="eyebrow">Bottom line</div><p>
    ${I("GrandNode is already a modern .NET application on a document database — the move to the cloud is a replatforming exercise, not a rewrite. Its real cost driver is size: 350K lines in one deployable, with an admin console four times larger than the storefront.","Derived from the technology stack, the small number of cloud blockers (all file-system related) and the entry-point counts per area.","stats","cloud","tx")}
    ${I("Before moving it, fix the order-placement path: payment is taken before the order is saved, and failures after that point are reported to the shopper as a failed checkout.","Reading of PlaceOrder returned by Imaging.","placeOrder")}</p></div>
  <h2>At a glance</h2>
  <div class="kpis">
    <div class="kpi" onclick="openEvidence(['stats'])"><div class="v">350K</div><div class="l">Lines of code</div></div>
    <div class="kpi" onclick="openEvidence(['stats'])"><div class="v">44,941</div><div class="l">Objects analyzed</div></div>
    <div class="kpi" onclick="openEvidence(['tx'])"><div class="v">2,229</div><div class="l">Entry points</div><div class="s">1,147 admin · 278 storefront</div></div>
    <div class="kpi" onclick="openEvidence(['cve'])"><div class="v">44</div><div class="l">Known vulnerabilities</div><div class="s">0 critical · 2 high</div></div>
    <div class="kpi" onclick="openEvidence(['ns'])"><div class="v">13</div><div class="l">Business domains</div><div class="s">from 36 service namespaces</div></div>
  </div>
  <h2>The system</h2>
  <p>${X("GrandNode is an open-source e-commerce platform built as one ASP.NET Core application: a storefront, an admin console, a Web API and plugins for payments, shipping, tax and authentication, on top of 36 service namespaces.","stats","ns","tx")}
     ${X("Data lives in MongoDB through a generic repository; Redis is used for caching and AWS S3 is detected as cloud storage. Services talk to each other directly and through MediatR events.","stats","repos")}
     ${X("The admin console is the largest surface by far — 1,147 controller actions against 278 in the storefront.","tx")}</p>
  <div class="archfig">${currentArchSVG()}<div class="figcap">Current-state architecture, generated from CAST Imaging layers, entry points and service structure.</div></div>
  <h2>Modernization readiness</h2>
  <div class="score"><div class="cell"><div class="t">Architecture</div><div class="r">Moderate</div>${meter(3)}</div><div class="cell"><div class="t">Cloud readiness</div><div class="r">Favorable</div>${meter(4)}</div>
    <div class="cell"><div class="t">Security posture</div><div class="r">Moderate</div>${meter(3)}</div><div class="cell"><div class="t">Maintainability</div><div class="r">Needs attention</div>${meter(2)}</div></div>
  <p style="margin-top:10px;font-size:13.5px;color:var(--muted)">${I("Ratings are an assessment built on the findings below.","Architecture: clean service layer, but one deployable and Orders depends on 10 other domains. Cloud: blockers are file-system only. Security: 44 CVEs, none critical, mostly front-end editors. Maintainability: 3,224 high fan-out and 473 copy-pasted artifacts.","coupling","cloud","cve","iso")}</p>
  <h2>Key findings</h2>
  <div class="findings">
    <div class="finding"><span class="sev high">High</span><div><h3>Order placement can charge without an order</h3>
      <p>${X("PlaceOrder processes the payment first, then builds and saves the order, deducts reward points and sends notifications. Any exception in those later steps is caught, logged and returned to the shopper as a checkout error.","placeOrder")}</p>
      <p>${I("A shopper can be charged and told the checkout failed — and may pay again. There is no void or refund in the error path.","Reading of the ordering of steps and the single catch block.","placeOrder")}</p></div></div>
    <div class="finding"><span class="sev high">High</span><div><h3>Checkout & Orders is the hub of the system</h3>
      <p>${X("The Orders services call into 10 of the 12 other domains — Catalog alone 151 times, then Localization, Platform, Customers (56) and Payments (55) — and the order repository is used by four domains.","coupling","repos")}</p>
      <p>${I("Orders cannot be split out first; it is the last domain to separate, after Catalog, Customers and Payments have clear interfaces.","Coupling judgment from the extracted call counts.","coupling")}</p></div></div>
    <div class="finding"><span class="sev medium">Medium</span><div><h3>Vulnerabilities sit mostly in the admin editors</h3>
      <p>${X("44 CVEs, none critical: 22 in the TinyMCE editor and 12 in jQuery, plus one high-severity advisory in the MongoDB C# driver.","cve")}</p>
      <p>${I("Two library upgrades remove 34 of the 44; five MongoDB server advisories go away with a managed database.","Grouping of the CVE list by component.","cve")}</p></div></div>
    <div class="finding"><span class="sev medium">Medium</span><div><h3>Maintainability debt comes from size and duplication</h3>
      <p>${X("9,681 quality findings across 44 rules: 3,881 awaited tasks without ConfigureAwait, 3,224 high fan-out artifacts, 473 copy-pasted artifacts and 413 oversized artifacts — two-thirds of them in the admin console.","iso","debtDom")}</p>
      <p>${I("The admin console is the biggest modernization cost and the best candidate to rebuild on a modern front end rather than migrate screen by screen.","Size and debt concentration of Grand.Web.Areas.Admin.","debtDom","tx")}</p></div></div>
    <div class="finding"><span class="sev strength">Strength</span><div><h3>Close to cloud-ready already</h3>
      <p>${X("Cloud blockers are limited to file and directory manipulation (81 and 27 objects), a few hard-coded URLs and insecure protocols; cloud storage and logging are already rated as boosters.","cloud")}</p>
      <p>${I("Moving media and files to object storage is most of the work to run GrandNode in containers.","Standard remediation for file-system blockers.","cloud")}</p></div></div>
  </div>
  <h2>Recommendations</h2>
  <div class="recs">
    <div class="rec"><div><h4>Make order placement safe</h4><p>${I("Save the order before charging, or void the payment when anything after it fails, and make checkout idempotent per cart.","Answers C-01 and C-07.","placeOrder")}</p></div><span class="horizon now">0–3 months</span></div>
    <div class="rec"><div><h4>Upgrade TinyMCE, jQuery and the MongoDB driver</h4><p>${I("Three upgrades close 35 of the 44 CVEs, including both high ones.","Grouping of the CVE list.","cve")}</p></div><span class="horizon now">0–3 months</span></div>
    <div class="rec"><div><h4>Move files and media to object storage</h4><p>${I("Removes almost all cloud and container blockers and makes the app stateless.","Maps the blockers to their remediation.","cloud")}</p></div><span class="horizon">3–9 months</span></div>
    <div class="rec"><div><h4>Containerize on a managed MongoDB-compatible database</h4><p>${I("Keep the code, change the platform: containers, managed Redis, managed document database.","Replatforming fits a modern .NET stack with few blockers.","stats","cloud")}</p></div><span class="horizon">3–9 months</span></div>
    <div class="rec"><div><h4>Rebuild the admin console, then separate domains</h4><p>${I("Start with Content & Community and Media, which are loosely coupled; leave Checkout & Orders last.","Ordering from the domain map.","coupling","debtDom")}</p></div><span class="horizon">9–18 months</span></div>
  </div>
  <h2>Continue in this ${PRODUCT}</h2>
  <div class="next-grid">${DELIV.filter(x=>x.id!=="exec"&&x.id!=="ctx").map(x=>`<div class="deliv" onclick="go('#/ws/${x.id}')"><span class="gtag ${x.g}">${S_LABEL[statusOf(x)]}</span><h4>${x.name}</h4><p>${x.blurb}</p></div>`).join("")}</div>`;
}
function currentArchSVG(){
  return `<svg viewBox="0 0 840 300" role="img" aria-label="Current state architecture"><defs><marker id="a2" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#624ABB"/></marker></defs><g font-family="Inter,sans-serif">
    <text x="20" y="22" font-size="11" font-weight="700" fill="#6D6A71">CHANNELS</text>
    <rect x="20" y="34" width="190" height="56" rx="10" fill="#fff" stroke="#E6E4EA"/><text x="115" y="58" text-anchor="middle" font-size="13" font-weight="700" fill="#0C0613">Shoppers</text><text x="115" y="76" text-anchor="middle" font-size="11" fill="#6D6A71">storefront · 278 actions</text>
    <rect x="20" y="104" width="190" height="56" rx="10" fill="#fff" stroke="#E6E4EA"/><text x="115" y="128" text-anchor="middle" font-size="13" font-weight="700" fill="#0C0613">Store staff</text><text x="115" y="146" text-anchor="middle" font-size="11" fill="#6D6A71">admin · 1,147 actions</text>
    <rect x="20" y="174" width="190" height="56" rx="10" fill="#fff" stroke="#E6E4EA"/><text x="115" y="198" text-anchor="middle" font-size="13" font-weight="700" fill="#0C0613">Integrations</text><text x="115" y="216" text-anchor="middle" font-size="11" fill="#6D6A71">Web API · payment callbacks</text>
    <text x="270" y="22" font-size="11" font-weight="700" fill="#6D6A71">GRANDNODE · ASP.NET CORE</text>
    <rect x="270" y="34" width="330" height="236" rx="12" fill="#F4F1FC" stroke="#E7E1F8"/>
    <rect x="286" y="48" width="298" height="34" rx="8" fill="#fff" stroke="#E7E1F8"/><text x="435" y="70" text-anchor="middle" font-size="12" font-weight="600" fill="#463589">MVC controllers · views · 1,168 UI objects</text>
    <rect x="286" y="92" width="298" height="104" rx="8" fill="#624ABB"/><text x="435" y="112" text-anchor="middle" font-size="12" font-weight="700" fill="#fff">Grand.Services · 3,180 objects</text>
    ${["Orders","Catalog","Customers","Payments","Shipping","Discounts","Tax","Messages","Content","Media"].map((n,i)=>{const c=i%5,r=Math.floor(i/5);return `<rect x="${296+c*57}" y="${124+r*32}" width="52" height="24" rx="5" fill="rgba(255,255,255,.14)"/><text x="${322+c*57}" y="${140+r*32}" text-anchor="middle" font-size="9.5" fill="#fff">${n}</text>`}).join("")}
    <rect x="286" y="206" width="145" height="50" rx="8" fill="#fff" stroke="#E7E1F8"/><text x="358" y="227" text-anchor="middle" font-size="11.5" font-weight="600" fill="#463589">Plugins</text><text x="358" y="243" text-anchor="middle" font-size="10.5" fill="#6D6A71">payments · shipping · tax</text>
    <rect x="439" y="206" width="145" height="50" rx="8" fill="#fff" stroke="#E7E1F8"/><text x="511" y="227" text-anchor="middle" font-size="11.5" font-weight="600" fill="#463589">MediatR events</text><text x="511" y="243" text-anchor="middle" font-size="10.5" fill="#6D6A71">in-process</text>
    <text x="660" y="22" font-size="11" font-weight="700" fill="#6D6A71">DATA &amp; EXTERNAL</text>
    <rect x="660" y="34" width="160" height="56" rx="10" fill="#0C0613"/><text x="740" y="58" text-anchor="middle" font-size="13" font-weight="700" fill="#fff">MongoDB</text><text x="740" y="76" text-anchor="middle" font-size="11" fill="#C7C9E0">generic repository</text>
    <rect x="660" y="104" width="160" height="50" rx="10" fill="#fff" stroke="#E6E4EA"/><text x="740" y="134" text-anchor="middle" font-size="12" font-weight="700" fill="#0C0613">Redis cache</text>
    <rect x="660" y="164" width="160" height="50" rx="10" fill="#fff" stroke="#E6E4EA"/><text x="740" y="194" text-anchor="middle" font-size="12" font-weight="700" fill="#0C0613">AWS S3 · local files</text>
    <rect x="660" y="224" width="160" height="42" rx="10" fill="#fff" stroke="#E6E4EA"/><text x="740" y="250" text-anchor="middle" font-size="11.5" fill="#6D6A71">payment / shipping APIs</text>
    <path d="M210,62 L284,62" stroke="#624ABB" stroke-width="2" marker-end="url(#a2)"/><path d="M210,132 C245,132 250,70 284,68" stroke="#624ABB" stroke-width="2" fill="none" marker-end="url(#a2)"/><path d="M210,202 C245,202 250,76 284,74" stroke="#624ABB" stroke-width="2" fill="none" marker-end="url(#a2)"/>
    <path d="M600,120 L658,62" stroke="#C7C9E0" stroke-width="2"/><path d="M600,140 L658,129" stroke="#C7C9E0" stroke-width="2"/><path d="M600,170 L658,189" stroke="#C7C9E0" stroke-width="2"/><path d="M600,235 L658,245" stroke="#C7C9E0" stroke-width="2"/></g></svg>`;
}
