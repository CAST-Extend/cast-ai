/* =====================================================================
   TECHNICAL DIAGRAMS
   ===================================================================== */
Object.assign(EV, {
  blastTotal:{ title:"Blast radius — IOrderTotalCalculationService.GetShoppingCartTotal", call:"run_cypher_query — IS_IN_TRANSACTION + CALL*1..3 grouped by namespace", rows:[["Entry points","13 — 12 checkout and cart actions + PayPal IPN"],["Callers within 3 hops","38 (storefront 18 · Orders 4 · plugins 1 · other 15)"]]},
  blastWarn:{ title:"Blast radius — IShoppingCartService.GetShoppingCartWarnings", call:"run_cypher_query — IS_IN_TRANSACTION + CALL*1..3", rows:[["Entry points","12 — cart page, update, delete, coupons, gift cards, wishlist, checkout"],["Callers within 3 hops","31"]]},
  blastCancel:{ title:"Blast radius — IOrderProcessingService.CancelOrder", call:"run_cypher_query — IS_IN_TRANSACTION + CALL*1..3", rows:[["Entry points","22 — admin Order actions (cancel, capture, refund, void, edit…)"],["Callers within 3 hops","61 (admin 29 · storefront 1 · other 31)"]]},
  blastPlace:{ title:"Blast radius — IOrderProcessingService.PlaceOrder", call:"run_cypher_query — IS_IN_TRANSACTION + CALL*1..3", rows:[["Entry points","3 — ConfirmOrder · OpcConfirmOrder · PayPal IPN"],["Callers within 3 hops","4"]]},
});
const DOMS = [ ["ORD","Checkout & Orders","cm",363],["CAT","Catalog","cm",529],["PAY","Payments","cm",148],["SHP","Shipping","cm",129],["DSC","Discounts","cm",88],["TAX","Tax","cm",78],
  ["CUS","Customers","cy",383],["MSG","Messaging","cy",668],["CNT","Content & Community","cy",361],["SEC","Security","cy",123],["LOC","Localization","fd",234],["MED","Media","fd",87],["PLT","Platform","fd",618] ];
const LANES = { cm:["Commerce","#624ABB"], cy:["Customer & community","#CE6FCE"], fd:["Foundation","#6D6A71"] };
const DLINKS = [["ORD","CAT",151],["CAT","PLT",92],["MSG","CUS",82],["ORD","LOC",74],["ORD","PLT",74],["CUS","PLT",96],["PLT","CAT",78],["PLT","LOC",87],["MSG","PLT",40],["PLT","MED",56],["ORD","CUS",56],["ORD","PAY",55],
  ["CNT","PLT",53],["ORD","MSG",44],["MSG","LOC",44],["CUS","MSG",38],["CAT","LOC",34],["ORD","SHP",33],["PLT","MSG",31],["MSG","CAT",30],["CAT","DSC",29],["ORD","DSC",26],["CUS","LOC",25],["CUS","SEC",20],["SEC","CUS",19],
  ["PLT","CUS",18],["LOC","PLT",18],["ORD","TAX",16],["CNT","CUS",16],["SHP","PLT",15],["CAT","MED",14],["CAT","CUS",13],["SHP","CAT",13],["PLT","SEC",12],["MSG","ORD",12],["MSG","MED",11],["CUS","CAT",10],["CAT","MSG",10],["PLT","ORD",9],["TAX","LOC",8],["ORD","SEC",7]];
const CRUD = [["Order",{ORD:"u",CUS:"u",CNT:"u",PLT:"u"}],["Product",{CAT:"u",ORD:"u",SHP:"u",TAX:"u",DSC:"u"}],["Customer",{CUS:"u",CAT:"u",MSG:"u"}],["CustomerProduct · RoleProduct · TagProduct",{CUS:"u",CAT:"u"}],
  ["Category · Manufacturer",{CAT:"u",DSC:"u"}],["ProductDeleted",{CAT:"u",ORD:"u"}],["ActivityLog",{CUS:"u",PLT:"u"}],["Banner · InteractiveForm",{MSG:"u",CUS:"u"}],["Course",{CNT:"u",CAT:"u"}],
  ["GiftCard · CheckoutAttribute · RewardPointsHistory",{ORD:"u"}],["RecurringPayment · ReturnRequest · OrderNote",{ORD:"u"}],["Shipment · ShippingMethod · PickupPoint",{SHP:"u"}],["Discount · DiscountCoupon · UsageHistory",{DSC:"u"}],
  ["QueuedEmail · MessageTemplate · Campaign",{MSG:"u"}],["Picture · Download",{MED:"u"}],["PermissionRecord · AclRecord",{SEC:"u"}],["Country · Currency · Language",{LOC:"u"}],["Setting · ScheduleTask",{PLT:"u"}]];
let diagId = "context", diagView = "diagram", chordFocus = "ORD", crudAll = false;
const DIAGS = [["context","System context","Who and what does GrandNode interact with?","System","3 actor groups · 5 external groups"],["containers","Containers","What are the runtime pieces?","System","44,941 objects → 9 boxes"],
  ["domains","Domain dependency map","How tangled are the business domains?","System","36 namespaces → 13 domains"],["crud","Data ownership","Which domain depends on which entity repository?","System","repositories × 13 domains"],
  ["sequence","Journey sequence","What happens, in order, during a journey?",SHOW,""],["lifecycle","Lifecycle","What states does an order move through?",SHOW,""],["blast","Blast radius","What is affected if this changes?",SHOW,""],["integrations","Integration map","Which external services and platforms?","System","plugins · data stores"]];
function setDiag(id){ diagId = id; diagView = "diagram"; redrawDiag(); }
function setDiagView(v){ diagView = v; redrawDiag(); }
function redrawDiag(){ document.getElementById("doc").innerHTML = techDiagrams(); paintGrounding(); }
function techDiagrams(){
  STMTS = []; diagTakeaways(diagId); const all = STMTS; STMTS = []; const d = DIAGS.find(x=>x[0]===diagId);
  const cards = DIAGS.map((x,i)=>`<div class="dcard ${x[0]===diagId?"on":""}" onclick="setDiag('${x[0]}')"><span class="num">D${i+1}</span><b>${x[1]}</b><span>${x[2]}</span><span class="scope">${x[3].replace("&","&amp;")}</span></div>`).join("");
  const body = diagView==="mermaid" ? `<pre class="mermaid-src">${esc(MERMAID[diagId]())}</pre>` : `<div class="dbody">${DRAW[diagId]()}</div>`;
  STMTS = []; const take = diagTakeaways(diagId); STMTS = all;
  return `<div class="doc-head"><div><div class="eyebrow">Technical Diagrams · as-is</div><h1>${APP}</h1><div class="meta">8 diagrams condensed from the CAST Imaging analysis · snapshot ${SYSTEM.snapshot}</div></div>
    <div class="doc-actions"><button class="btn btn-primary btn-sm" onclick="openExport(DIAG_FILES,'Diagrams as code','Mermaid inside Markdown.')">Export for agents</button></div></div>
  <div class="grounding" id="grounding"></div><div class="dgrid">${cards}</div><div class="dpanel"><div class="dh"><div><div class="eyebrow">${d[3].replace("&","&amp;")}</div><h2>${d[1]}</h2><div class="q"><b>Question:</b> ${d[2]}</div></div>
    <div style="display:flex;gap:10px;align-items:center"><span class="collapse">${collapseLabel(d)}</span><div class="seg"><button class="${diagView==="diagram"?"on":""}" onclick="setDiagView('diagram')">Diagram</button><button class="${diagView==="mermaid"?"on":""}" onclick="setDiagView('mermaid')">Mermaid</button></div></div></div>
    ${variantPicker()}${body}<div class="takeaways"><h4>What this shows</h4><ul>${take}</ul></div></div>`;
}
function diagTakeaways(id){
  const T = {
    context:[X("Shoppers use the storefront, store staff the admin console, and integrations the Web API; payment providers call back into the application.","tx","coTx"),X("Behind it sit MongoDB, Redis, AWS S3 storage, and payment, shipping, tax and authentication plugins.","stats","ns"),I("Every plugin is a contract with an outside service that a migration has to keep or retire on purpose.","Implication of the plugin families.","ns")],
    containers:[X("One ASP.NET Core application hosts the storefront, the admin console, the API and the plugins; 3,180 objects form the service layer.","stats","layers","tx"),X("Services share MongoDB through a generic repository and talk through MediatR events in-process.","repos","stats"),I("In-process events and one database mean the domains scale and deploy together today.","Architecture implication.","layers")],
    domains:[X("Checkout &amp; Orders calls into 10 of the 12 other domains — Catalog 151 times, Localization 74, Customers 56, Payments 55.","coupling"),X("Platform services (events, stores, settings, export/import) are the most depended-on layer; Customers and Messaging depend on each other in both directions.","coupling"),I("Content &amp; Community and Media have the fewest dependencies and are the natural first candidates to separate.","Coupling judgment from call counts.","coupling")],
    crud:[X("The Order repository is used by four domains and the Product repository by five.","repos"),X("Customer documents also carry the shopping cart, so Catalog and Messaging depend on the Customer repository too.","repos","prepSrc"),I("Order and Product need a single owner before any service split; other entities already have one domain.","Data-ownership reasoning.","repos")],
    sequence: SEQ_TAKE[seqSel](), lifecycle: LIFE_TAKE[lifeSel](), blast: BLAST_TAKE[blastSel](),
    integrations:[X("Plugin families cover payments, shipping, tax, external authentication, discount requirements, exchange rates, feeds and widgets.","ns"),X("Data platforms: MongoDB, Redis and AWS S3.","stats"),I("No package inventory was resolved, so library versions come from the CVE scan only — an SBOM would fill the gap.","Package call returned no packages.","pkgNone")],
  };
  return T[id].map(t=>`<li>${t}</li>`).join("");
}
const svgBox = (x,y,w,h,title,sub,fill="#fff",stroke="#E6E4EA",tc="#0C0613",sc="#6D6A71") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${fill}" stroke="${stroke}"/><text x="${x+w/2}" y="${y+h/2-(sub?4:-4)}" text-anchor="middle" font-size="13" font-weight="700" fill="${tc}">${title}</text>${sub?`<text x="${x+w/2}" y="${y+h/2+13}" text-anchor="middle" font-size="11" fill="${sc}">${sub}</text>`:""}`;
const ARROW = `<defs><marker id="dah" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#624ABB"/></marker><marker id="dahg" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#9A97A0"/></marker></defs>`;
const DRAW = {
  context(){ const ext = [["Payment providers","PayPal · Braintree · others"],["Shipping & tax","rate and tax plugins"],["Identity","external auth plugins"],["Data","MongoDB · Redis · S3"],["Email & push","queued email · push"]];
    return `<svg viewBox="0 0 900 430" font-family="Inter,sans-serif">${ARROW}${svgBox(30,40,180,64,"Shoppers","storefront")}${svgBox(30,150,180,64,"Store staff","admin console")}${svgBox(30,260,180,64,"Integrations","Web API")}
      ${svgBox(340,150,220,130,"GrandNode","e-commerce platform","#624ABB","#624ABB","#fff","#E7E1F8")}<text x="450" y="258" text-anchor="middle" font-size="10.5" fill="#E7E1F8">2,229 entry points</text>
      <path d="M210,72 C280,72 280,180 338,190" stroke="#624ABB" stroke-width="2" fill="none" marker-end="url(#dah)"/><path d="M210,182 L338,210" stroke="#624ABB" stroke-width="2" marker-end="url(#dah)"/><path d="M210,292 C280,292 280,250 338,240" stroke="#624ABB" stroke-width="2" fill="none" marker-end="url(#dah)"/>
      ${ext.map((e,i)=>{const y=12+i*82; return svgBox(680,y,200,62,e[0],e[1]) + `<path d="M560,215 C620,215 620,${y+31} 678,${y+31}" stroke="#9A97A0" stroke-width="1.5" fill="none" marker-end="url(#dahg)"/>`}).join("")}</svg>`; },
  containers(){ return `<svg viewBox="0 0 900 430" font-family="Inter,sans-serif">${ARROW}${svgBox(20,50,200,64,"Browser · shoppers","jQuery · 125 calls")}${svgBox(20,180,200,64,"Browser · staff","jQuery · 59 calls")}${svgBox(20,310,200,64,"API clients","Grand.Api")}
      <rect x="290" y="30" width="330" height="370" rx="14" fill="#F4F1FC" stroke="#E7E1F8"/><text x="455" y="56" text-anchor="middle" font-size="14" font-weight="700" fill="#0C0613">GrandNode · ASP.NET Core</text><text x="455" y="74" text-anchor="middle" font-size="11" fill="#6D6A71">C# · 350K LOC · one deployable</text>
      ${svgBox(310,90,140,56,"Storefront","278 actions","#fff","#E7E1F8")}${svgBox(460,90,140,56,"Admin","1,147 actions","#fff","#E7E1F8")}${svgBox(310,156,290,64,"Grand.Services","36 namespaces · 3,180 objects","#624ABB","#624ABB","#fff","#E7E1F8")}
      ${svgBox(310,230,140,56,"MediatR","in-process events","#fff","#E7E1F8")}${svgBox(460,230,140,56,"Plugins","82 actions","#fff","#E7E1F8")}${svgBox(310,296,290,56,"IRepository<T>","generic MongoDB access","#fff","#E7E1F8")}
      ${svgBox(700,60,180,64,"MongoDB","documents","#0C0613","#0C0613","#fff","#C7C9E0")}${svgBox(700,170,180,64,"Redis","cache")}${svgBox(700,280,180,64,"AWS S3 · disk","media and files")}
      <path d="M220,82 L308,110" stroke="#624ABB" stroke-width="2" marker-end="url(#dah)"/><path d="M220,212 C270,212 270,130 458,120" stroke="#624ABB" stroke-width="2" fill="none" marker-end="url(#dah)"/><path d="M220,342 C270,342 270,190 308,188" stroke="#624ABB" stroke-width="2" fill="none" marker-end="url(#dah)"/>
      <path d="M600,324 C650,324 650,92 698,92" stroke="#9A97A0" stroke-width="1.5" fill="none" marker-end="url(#dahg)"/><path d="M600,188 L698,202" stroke="#9A97A0" stroke-width="1.5" marker-end="url(#dahg)"/><path d="M600,258 C650,258 650,312 698,312" stroke="#9A97A0" stroke-width="1.5" fill="none" marker-end="url(#dahg)"/></svg>`; },
  domains(){
    const cx=330, cy=290, R=205, n=DOMS.length, pos = {}; DOMS.forEach((d,i)=>{ const a = -Math.PI/2 + i*2*Math.PI/n; pos[d[0]] = [cx+R*Math.cos(a), cy+R*Math.sin(a), a]; });
    const pairs = {}; DLINKS.forEach(([s,t,w])=>{ const k=[s,t].sort().join("|"); pairs[k] = pairs[k]||{a:[s,t].sort()[0],b:[s,t].sort()[1],ab:0,ba:0}; if(s===pairs[k].a) pairs[k].ab+=w; else pairs[k].ba+=w; });
    const edges = Object.values(pairs).map(p=>({...p, w:p.ab+p.ba, two: p.ab>=15 && p.ba>=15})), f = chordFocus;
    const paths = edges.sort((x,y)=>x.w-y.w).map(e=>{ const [x1,y1]=pos[e.a], [x2,y2]=pos[e.b]; const qx=cx+((x1+x2)/2-cx)*0.2, qy=cy+((y1+y2)/2-cy)*0.2; const on = !f || e.a===f || e.b===f;
      return `<path d="M${x1.toFixed(1)},${y1.toFixed(1)} Q${qx.toFixed(1)},${qy.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}" fill="none" stroke="${e.two?"#C4320A":"#624ABB"}" stroke-width="${Math.min(14,1+e.w/14).toFixed(1)}" stroke-opacity="${on?(e.two?.75:.5):.05}" stroke-linecap="round"><title>${e.a} ↔ ${e.b}: ${e.ab} / ${e.ba}</title></path>`; }).join("");
    const nodes = DOMS.map(([id,label,lane,sz])=>{ const [x,y,a] = pos[id]; const r = 8 + Math.sqrt(sz)/2.2; const lx = cx+(R+r+14)*Math.cos(a), ly = cy+(R+r+14)*Math.sin(a);
      const anchor = Math.abs(Math.cos(a))<0.2 ? "middle" : Math.cos(a)>0 ? "start" : "end"; const on = !f || f===id || edges.some(e=>(e.a===f&&e.b===id)||(e.b===f&&e.a===id));
      return `<g style="cursor:pointer" onclick="chordFocus=chordFocus==='${id}'?null:'${id}';redrawDiag()" opacity="${on?1:.3}"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${LANES[lane][1]}" stroke="#fff" stroke-width="${f===id?4:2}"/>
        <text x="${lx.toFixed(1)}" y="${(ly+4).toFixed(1)}" text-anchor="${anchor}" font-size="12.5" font-weight="${f===id?800:600}" fill="#0C0613">${label.replace("&","&amp;")}</text></g>`; }).join("");
    let side = `<h5>Click a domain</h5>`;
    if (f) { const lab = id => DOMS.find(d=>d[0]===id)[1].replace("&","&amp;"); const out = DLINKS.filter(l=>l[0]===f).sort((a,b)=>b[2]-a[2]), inn = DLINKS.filter(l=>l[1]===f).sort((a,b)=>b[2]-a[2]);
      side = `<h5>${lab(f)}</h5><div class="sub">${DOMS.find(d=>d[0]===f)[3]} service members</div><div style="font-size:11px;font-weight:700;text-transform:uppercase;color:var(--muted)">Calls into</div><table>${out.map(l=>`<tr><td>${lab(l[1])}</td><td>${l[2]}</td></tr>`).join("")||"<tr><td>—</td></tr>"}</table>
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:var(--muted);margin-top:10px">Called by</div><table>${inn.map(l=>`<tr><td>${lab(l[0])}</td><td>${l[2]}</td></tr>`).join("")||"<tr><td>—</td></tr>"}</table>`; }
    return `<div class="chordwrap"><div><svg viewBox="-80 0 820 580" font-family="Inter,sans-serif">${paths}${nodes}</svg><div class="clegend">${Object.values(LANES).map(l=>`<span><i style="background:${l[1]}"></i>${l[0]}</span>`).join("")}<span><i class="line" style="background:#C4320A"></i>two-way (≥15 calls each way)</span><span>pairs under 7 calls hidden</span></div></div><div class="chordside">${side}</div></div>`;
  },
  crud(){ const doms = DOMS.map(d=>d[0]), rows = CRUD.filter(r=>crudAll || Object.keys(r[1]).length>1);
    return `<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:12px"><div class="clegend" style="margin:0"><span><i style="border-radius:3px;background:var(--purple)"></i>depends on the repository</span><span><i style="border-radius:3px;background:var(--crit)"></i>more than one domain</span></div>
      <div class="seg"><button class="${crudAll?"":"on"}" onclick="crudAll=false;redrawDiag()">Shared (${CRUD.filter(r=>Object.keys(r[1]).length>1).length})</button><button class="${crudAll?"on":""}" onclick="crudAll=true;redrawDiag()">All (${CRUD.length})</button></div></div>
      <div class="tblwrap"><table class="tbl crud"><thead><tr><th>Entity repository</th>${doms.map(d=>`<th class="v">${DOMS.find(x=>x[0]===d)[1].replace("&","&amp;")}</th>`).join("")}</tr></thead><tbody>
      ${rows.map(r=>`<tr class="${Object.keys(r[1]).length>1?"multi":""}"><td class="tn">${r[0]}</td>${doms.map(d=>`<td class="c ${r[1][d]?"w":""}">${r[1][d]?"U":""}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
      <p style="font-size:12.5px;color:var(--muted);margin:10px 0 0">U = the domain's services depend on IRepository&lt;Entity&gt;; read vs. write is not distinguished. Installation (seeding) excluded.</p>`; },
  sequence(){ return seqSVG(SEQS[seqSel]); }, lifecycle(){ return lifeSVG(lifeSel); }, blast(){ return blastSVG(BLASTS[blastSel]); },
  integrations(){ const G = [["Payments",["PayPal Standard (IPN, PDT)","Braintree","other payment plugins"]],["Shipping",["rate plugins","pickup points"]],["Tax",["tax plugins"]],["Identity",["external authentication plugins"]],["Data",["MongoDB","Redis","AWS S3"]],["Messaging",["queued email","push notifications"]]];
    return `<div class="igrid">${G.map(([g,l])=>`<div class="igroup"><h5>${g}<span>${l.length}</span></h5>${l.map(x=>`<div class="lib"><div><b style="font-size:13px">${x}</b></div></div>`).join("")}</div>`).join("")}</div>`; },
};
const MERMAID = {
  context:()=>`flowchart LR\n  shoppers([Shoppers]) --> gn[[GrandNode]]\n  staff([Store staff]) --> gn\n  api([API clients]) --> gn\n  gn --> pay[Payment providers] & ship[Shipping & tax] & idp[Identity] & data[(MongoDB · Redis · S3)]`,
  containers:()=>`flowchart LR\n  sf[Storefront] --> svc[Grand.Services · 36 namespaces]\n  ad[Admin] --> svc\n  api[Web API] --> svc\n  svc --> med[MediatR events]\n  svc --> repo[IRepository<T>] --> db[(MongoDB)]\n  svc --> cache[(Redis)]\n  svc --> files[(S3 · disk)]`,
  domains:()=>["flowchart LR",...DLINKS.filter(l=>l[2]>=30).map(l=>`  ${l[0]} -- ${l[2]} --> ${l[1]}`)].join("\n"),
  crud:()=>["flowchart LR",...CRUD.filter(r=>Object.keys(r[1]).length>1).flatMap((r,i)=>[`  r${i}[(${r[0]})]`,...Object.keys(r[1]).map(d=>`  ${d} --> r${i}`)])].join("\n"),
  sequence:()=>seqMermaid(SEQS[seqSel]), lifecycle:()=>LIFE_MERMAID[lifeSel](), blast:()=>blastMermaid(BLASTS[blastSel]),
  integrations:()=>`flowchart LR\n  gn[GrandNode] --> p[Payments plugins] & s[Shipping plugins] & t[Tax plugins] & a[Auth plugins] & d[(MongoDB · Redis · S3)]`,
};
const SEQS = {
  place:{ name:"Place an order", endpoint:"Checkout/ConfirmOrder", size:244, P:["Browser","CheckoutController","OrderProcessing","ShoppingCart","OrderTotals","Payment plugin","MongoDB","MediatR"], dark:[5,6],
    M:[[0,1,"POST ConfirmOrder","m"],[1,2,"PlaceOrder(request)","m"],[2,2,"guest · addresses · countries","s"],[2,3,"cart + item warnings","m"],[2,4,"subtotal · shipping · tax · total","m"],[2,5,"process payment","m"],[2,6,"save order","m"],[2,6,"reward points · customer","m"],[2,7,"OrderPlacedEvent","m"],[1,0,"Completed / errors","r"]],
    F:[{at:5,p:[2,6],c:"#B42318",bg:"#FEF3F2",l:"payment before save — no void on failure (C-01)"}] },
  opc:{ name:"One-page checkout: save billing", endpoint:"Checkout/OpcSaveBilling", size:985, P:["Browser","CheckoutController","Customer service","Address rules","ShoppingCart","Shipping","MongoDB"], dark:[6],
    M:[[0,1,"POST OpcSaveBilling","m"],[1,2,"set billing address","m"],[2,3,"country allows billing?","m"],[2,6,"update customer","m"],[1,4,"cart requires shipping?","m"],[1,5,"load shipping options","m"],[1,0,"next step HTML","r"]], F:[] },
  cancel:{ name:"Cancel an order", endpoint:"Admin Order/CancelOrder", size:null, P:["Admin UI","OrderController","OrderProcessing","Reward points","Recurring payments","Inventory","Discounts"], dark:[],
    M:[[0,1,"POST CancelOrder","m"],[1,2,"CancelOrder(order)","m"],[2,2,"CanCancelOrder?","s"],[2,3,"return redeemed points","m"],[2,4,"cancel each (not awaited)","m"],[2,5,"reverse shipped + adjust all","m"],[2,6,"cancel discount usage","m"],[1,0,"order cancelled","r"]],
    F:[{at:4,p:[2,4],c:"#B42318",bg:"#FEF3F2",l:"result ignored (C-02)"},{at:5,p:[2,5],c:"#8A6D00",bg:"#FFF8DB",l:"shipped items adjusted twice? (C-03)"}] },
};
const LIFES = { order:{name:"Order status", sub:"Pending · Processing · Complete · Cancelled"}, payment:{name:"Payment status", sub:"drives order status"}, shipping:{name:"Shipping status", sub:"set at order time, updated by shipments"} };
const BLASTS = {
  total:{ name:"GetShoppingCartTotal", short:["Cart","Total"], ev:"blastTotal", rings:[[1,[["ORD",2],["Storefront",2],["Plugins",1]]],[2,[["Storefront",11],["ORD",1]]],[3,[["Storefront",5],["ORD",1],["Other",8]]]],
    inn:["Checkout/PaymentMethod · SelectPaymentMethod","Checkout/PaymentInfo · EnterPaymentInfo","Checkout/ConfirmOrder","Checkout/OnePageCheckout","OpcSaveBilling · OpcSaveShipping · OpcSaveShippingMethod · OpcSavePaymentMethod · OpcConfirmOrder"], out:["ShoppingCart/CheckoutAttributeChange","PaymentPayPalStandard/IPNHandler"] },
  warnings:{ name:"GetShoppingCartWarnings", short:["Cart","Warnings"], ev:"blastWarn", rings:[[1,[["Storefront",4],["ORD",1]]],[2,[["Storefront",11],["ORD",1],["Other",2]]],[3,[["ORD",1],["Other",10]]]],
    inn:["Checkout/Index"], out:["ShoppingCart/Cart · UpdateCart · DeleteCartItem · StartCheckout","Apply/Remove DiscountCoupon · GiftCard","UpdateWishlist · AddItemsToCartFromWishlist","PaymentPayPalStandard/IPNHandler"] },
  cancel:{ name:"CancelOrder", short:["Cancel","Order"], ev:"blastCancel", rings:[[1,[["Admin",1],["Storefront",1]]],[2,[["Admin",28],["Other",2]]],[3,[["Other",29]]]],
    inn:[], out:["Admin Order/CancelOrder · CaptureOrder · MarkOrderAsPaid","Refund · RefundOffline · Void · VoidOffline · PartiallyRefund","ChangeOrderStatus · Delete · Edit… (22 in total)"] },
  place:{ name:"PlaceOrder (interface)", short:["Place","Order"], ev:"blastPlace", rings:[[1,[["Storefront",2]]],[2,[["Other",2]]]], inn:["Checkout/ConfirmOrder","Checkout/OpcConfirmOrder"], out:["PaymentPayPalStandard/IPNHandler"] },
};
const BLAST_COL = { ORD:"#624ABB", Storefront:"#0E7490", Admin:"#0C0613", Plugins:"#CE6FCE", Other:"#C7C9E0" };
const BLAST_LBL = { ORD:"Checkout & Orders services", Storefront:"Storefront", Admin:"Admin console", Plugins:"Plugins", Other:"other / framework" };
let seqSel = "place", lifeSel = "order", blastSel = "total";
function setVariant(kind, key){ if(kind==="seq") seqSel=key; if(kind==="life") lifeSel=key; if(kind==="blast") blastSel=key; redrawDiag(); }
const blastTotal = b => b.rings.reduce((a,[,p])=>a+p.reduce((s,x)=>s+x[1],0),0);
function variantPicker(){
  const chips = (kind, entries, sel) => entries.map(([k,l,sub])=>`<button class="vchip ${k===sel?"on":""}" onclick="setVariant('${kind}','${k}')"><b>${esc(l)}</b><span>${esc(sub)}</span></button>`).join("");
  let label, list;
  if (diagId==="sequence") { label="Journey"; list = chips("seq", Object.entries(SEQS).map(([k,s])=>[k,s.name,`${s.endpoint}${s.size?" · "+fmt(s.size)+" objects":""}`]), seqSel); }
  else if (diagId==="lifecycle") { label="Status"; list = chips("life", Object.entries(LIFES).map(([k,s])=>[k,s.name,s.sub]), lifeSel); }
  else if (diagId==="blast") { label="Method"; list = chips("blast", Object.entries(BLASTS).map(([k,b])=>[k,b.name,`${blastTotal(b)} callers · ${b.inn.length+b.out.length} entry groups`]), blastSel); }
  else return "";
  return `<div class="vpick"><div class="vrow"><span class="vl">${label}</span>${list}</div><div class="vrow2"><input class="vgen" placeholder="Generate for another…" onkeydown="if(event.key==='Enter')toast('On-demand generation is not wired up in this prototype')"><span class="vdom">Domain: <b>${SHOW_H}</b></span></div></div>`;
}
function lifeSVG(key){
  const st = (x,y,l,c="#624ABB",w=150) => `<rect x="${x}" y="${y}" width="${w}" height="44" rx="22" fill="${c}"/><text x="${x+w/2}" y="${y+27}" text-anchor="middle" font-size="12" font-weight="700" fill="#fff">${l}</text>`;
  const arr = (d,c="#624ABB") => `<path d="${d}" stroke="${c}" stroke-width="2" fill="none" marker-end="url(#dah)"/>`, lbl = (x,y,t,c="#463589") => `<text x="${x}" y="${y}" text-anchor="middle" font-size="10.5" font-weight="600" fill="${c}">${t}</text>`;
  if (key==="order") return `<svg viewBox="0 0 880 330" font-family="Inter,sans-serif">${ARROW}${st(40,120,"Pending","#6D6A71")}${st(300,120,"Processing")}${st(600,40,"Complete","#067647")}${st(600,200,"Cancelled","#C4320A")}
    ${arr("M190,142 H298")}${lbl(244,112,"paid · authorized · shipped")}${arr("M450,132 C520,100 540,70 598,62","#067647")}${lbl(530,74,"paid + shipped (or delivered)","#067647")}${arr("M450,152 C520,190 540,215 598,222","#C4320A")}${lbl(530,250,"CancelOrder · if CanCancelOrder","#C4320A")}
    ${arr("M190,152 C300,300 500,300 598,232","#C4320A")}<text x="40" y="310" font-size="11" fill="#6D6A71">Transitions from CheckOrderStatus and CancelOrder. CompleteOrderWhenDelivered decides whether “shipped” is enough.</text></svg>`;
  if (key==="payment") return `<svg viewBox="0 0 880 260" font-family="Inter,sans-serif">${ARROW}${st(30,100,"Pending","#6D6A71")}${st(230,40,"Authorized")}${st(230,160,"Paid","#067647")}${st(480,100,"Refunded / Voided","#C4320A",180)}
    ${arr("M180,112 C200,80 210,64 228,62")}${arr("M180,132 C200,160 210,180 228,182","#067647")}${arr("M380,62 C430,70 450,95 478,112")}${arr("M380,182 C430,175 450,140 478,130","#C4320A")}
    <text x="30" y="240" font-size="11" fill="#6D6A71">Paid or authorized moves the order to Processing; paid stamps the paid date (BR-CO-021, 023). Cancellation does not change it (C-04).</text></svg>`;
  return `<svg viewBox="0 0 880 220" font-family="Inter,sans-serif">${ARROW}${st(20,40,"Not required","#6D6A71")}${st(20,120,"Not yet shipped")}${st(240,120,"Partially shipped")}${st(460,120,"Shipped")}${st(680,120,"Delivered","#067647")}
    ${arr("M170,142 H238")}${arr("M390,142 H458")}${arr("M610,142 H678")}<text x="20" y="200" font-size="11" fill="#6D6A71">Set at order time from whether the cart needs shipping (BR-CO-012); shipments move it forward.</text></svg>`;
}
const LIFE_MERMAID = { order:()=>`stateDiagram-v2\n  [*] --> Pending\n  Pending --> Processing: paid / authorized / shipped\n  Processing --> Complete: paid and shipped (or delivered)\n  Pending --> Cancelled: CancelOrder\n  Processing --> Cancelled: CancelOrder`,
  payment:()=>`stateDiagram-v2\n  [*] --> Pending\n  Pending --> Authorized\n  Pending --> Paid\n  Authorized --> Paid: capture\n  Paid --> Refunded\n  Authorized --> Voided`,
  shipping:()=>`stateDiagram-v2\n  [*] --> NotRequired\n  [*] --> NotYetShipped\n  NotYetShipped --> PartiallyShipped\n  PartiallyShipped --> Shipped\n  NotYetShipped --> Shipped\n  Shipped --> Delivered` };
function blastSVG(b){
  const cx=220, cy=220, RS=62; let s = `<svg viewBox="0 0 440 440" font-family="Inter,sans-serif">`;
  b.rings.forEach(([h])=> s += `<circle cx="${cx}" cy="${cy}" r="${h*RS}" fill="none" stroke="#E6E4EA"/><text x="${cx+h*RS-4}" y="${cy-4}" text-anchor="end" font-size="10" fill="#9A97A0">${h}</text>`);
  b.rings.forEach(([h,parts])=>{ const n = parts.reduce((a,x)=>a+x[1],0); let k=0; parts.forEach(([d,c])=>{ for(let j=0;j<c;j++){ const a = -Math.PI/2 + (k++ + 0.5)*2*Math.PI/n + h*0.3; s += `<circle cx="${(cx+h*RS*Math.cos(a)).toFixed(1)}" cy="${(cy+h*RS*Math.sin(a)).toFixed(1)}" r="${n>26?4.5:6}" fill="${BLAST_COL[d]}" stroke="#fff" stroke-width="1.2"><title>${BLAST_LBL[d]}</title></circle>`; } }); });
  s += `<circle cx="${cx}" cy="${cy}" r="32" fill="#C4320A"/><text x="${cx}" y="${cy-2}" text-anchor="middle" font-size="10" font-weight="700" fill="#fff">${b.short[0]}</text><text x="${cx}" y="${cy+11}" text-anchor="middle" font-size="10" font-weight="700" fill="#fff">${b.short[1]}</text></svg>`;
  const used = [...new Set(b.rings.flatMap(([,p])=>p.map(x=>x[0])))];
  return `<div class="blastwrap"><div>${s}<div class="clegend">${used.map(d=>`<span><i style="background:${BLAST_COL[d]}"></i>${BLAST_LBL[d].replace("&","&amp;")}</span>`).join("")}<span>rings = call distance through the service interface</span></div></div>
    <div class="txlist"><h5>Entry points in ${SHOW_H} (${b.inn.length})</h5><ul>${b.inn.map(t=>`<li>${t}</li>`).join("")||"<li>—</li>"}</ul>${b.out.length?`<h5 style="color:var(--high)">Other entry points (${b.out.length} groups)</h5><ul class="out">${b.out.map(t=>`<li>${t}</li>`).join("")}</ul>`:""}</div></div>`;
}
function blastMermaid(b){ return ["flowchart RL",`  t((${b.name}))`,...b.rings.map(([h,p],i)=>`  h${h}[${h} hop · ${p.map(x=>BLAST_LBL[x[0]]+" "+x[1]).join(" · ")}] --> ${i?"h"+(h-1):"t"}`)].join("\n"); }
function collapseLabel(d){ if (d[0]==="sequence") { const S = SEQS[seqSel]; return `${S.size?fmt(S.size)+" objects → ":""}${S.P.length} participants`; } if (d[0]==="lifecycle") return LIFES[lifeSel].sub; if (d[0]==="blast") return `${blastTotal(BLASTS[blastSel])} callers`; return d[4]; }
const SEQ_TAKE = {
  place:()=>[X("Placing an order validates the customer, addresses and cart, calculates every total, takes the payment and only then saves the order.","placeOrder","prepSrc"),X("Reward points, notifications, status and events follow in the same request.","placeOrder"),I("Because payment precedes the save and all errors share one catch, a payment can succeed without an order (C-01, C-07).","Ordering of steps in the source.","placeOrder")],
  opc:()=>[X("Saving the billing address on one-page checkout reaches 985 objects — the largest checkout call graph.","coTx"),I("One-page steps re-render whole sections server-side; they are the slowest and most fragile part to migrate.","Inference from call-graph size.","coTx")],
  cancel:()=>[X("Cancelling returns points, reverses inventory, reservations, bids and discount usage, and starts recurring-payment cancellation.","cancelSrc"),I("It does not refund, does not wait for recurring payments to stop, and may restock shipped items twice (C-02, C-03, C-04).","Reading of the cancellation source.","cancelSrc")],
};
const LIFE_TAKE = {
  order:()=>[X("Orders start Pending, become Processing when paid, authorized or shipped, and Complete when paid and fulfilled.","statusSrc"),X("Cancelled is reachable from any cancellable status.","cancelSrc"),I("Unlike Shopizer, GrandNode derives order status from payment and shipping instead of letting staff set any value freely.","Comparison with the status logic in code.","statusSrc")],
  payment:()=>[X("Payment status feeds order status: authorized or paid moves the order on and paid stamps the paid date.","statusSrc"),I("Refund and void live in separate admin actions; cancellation does not touch payment status.","From the cancellation source.","cancelSrc")],
  shipping:()=>[X("Shipping status starts as NotYetShipped or ShippingNotRequired depending on the cart.","prepSrc"),X("Shipped or delivered completes a paid order, depending on CompleteOrderWhenDelivered.","statusSrc")],
};
const BLAST_TAKE = {
  total:()=>[X("The cart-total calculation is reached by 13 entry points — every payment and one-page step, plus the PayPal callback.","blastTotal"),I("A change to totals needs regression tests across the whole checkout, both flows.","Test-scope implication.","blastTotal")],
  warnings:()=>[X("Cart warnings are evaluated from 12 entry points: cart page, updates, coupons, gift cards, wishlist and checkout.","blastWarn"),I("Stock and attribute rules live here; changes surface well beyond checkout.","Scope implication.","blastWarn")],
  cancel:()=>[X("CancelOrder sits behind 22 admin order actions.","blastCancel"),I("Fixing C-02/C-03 needs testing across the admin order screens, not just the cancel button.","Scope implication.","blastCancel")],
  place:()=>[X("Through its interface, PlaceOrder is reached from the two confirm actions and the PayPal IPN handler.","blastPlace","di"),X("The implementation alone shows only the PayPal caller — controllers depend on the interface, resolved by dependency injection.","di"),I("Impact analysis on GrandNode should start from service interfaces.","Lesson from the two queries.","di")],
};
const DIAG_FILES = DIAGS.map((d,i)=>[`diagrams/${String(i+1).padStart(2,"0")}-${d[0]}.md`, () => `# ${d[1]}\n\n\`\`\`mermaid\n${MERMAID[d[0]]()}\n\`\`\`\n`]);

/* =====================================================================
   TECHNICAL DEBT (+ open-source vulnerabilities)
   ===================================================================== */
EV.debtDom = { title:"Findings by domain", call:"run_cypher_query — (object)-[:MANIFESTS]->(Insight) grouped by Grand.* namespace", rows:[["Admin console (Grand.Web.Areas.Admin)","3,649"],["Storefront (Grand.Web)","1,617"],["Catalog","486"],["Customers","384"],["Checkout & Orders","369"],["Messaging","301"]], note:"Density = findings per 100 service members. Admin and storefront are UI layers, reported separately." };
const DEBT_DOMS = [["ORD",310,58,1,0,true],["CAT",455,26,5,0,true],["CUS",363,21,0,0,false],["MSG",285,14,0,2,false],["PAY",66,3,0,0,true],["SHP",76,4,0,0,true],["DSC",55,1,0,0,true],["TAX",34,0,0,0,true],["LOC",208,4,0,0,false],["CNT",220,6,0,0,false],["MED",76,3,0,26,false],["SEC",76,5,0,2,false],["PLT",474,51,2,19,false]];
const DEBT = [
  ["TD-01","Correctness","Order placement can charge without an order","Payment before save; one catch for everything after; no void or refund.","Lost money and duplicate orders on the revenue path.","H","M","P1",false,["ORD"],["placeOrder"],["C-01","C-07"]],
  ["TD-02","Correctness","Cancellation side effects","Recurring-payment cancellation not awaited; shipped items possibly restocked twice; no refund.","Customers charged after cancelling; wrong stock.","H","S","P1",true,["ORD"],["cancelSrc"],["C-02","C-03","C-04"]],
  ["TD-03","Security","Vulnerable editors and jQuery","22 TinyMCE and 12 jQuery CVEs, mostly cross-site scripting.","XSS in the admin console exposes store administrators.","H","S","P1",true,["PLT"],["cve"],[]],
  ["TD-04","Security","MongoDB C# driver advisory","CVE-2022-48282 (high) affects the MongoDB .NET driver up to 2.18.0.","A driver upgrade; low effort, high value.","H","S","P1",true,["PLT"],["cve"],[]],
  ["TD-05","Security","File upload and path manipulation","4 objects allow dangerous file upload, 4 build file paths from API requests.","Classic routes to remote code execution or data exposure.","H","S","P1",true,["MED","PLT"],["iso"],[]],
  ["TD-06","Cloud readiness","Local file and directory access","81 objects manipulate files, 27 directories, 4 use the local file system.","Blocks stateless containers; media must move to object storage.","H","M","P2",false,["MED","PLT"],["cloud"],[]],
  ["TD-07","Cloud readiness","Hard-coded URLs, IPs and insecure protocols","14 hard-coded HTTP URLs, 8 insecure protocols, 1 hard-coded IP.","Breaks across environments; small mechanical fixes.","M","S","P2",true,["PLT"],["cloud"],[]],
  ["TD-08","Efficiency","Async and caching patterns","3,881 awaited tasks without ConfigureAwait(false); 416 repeated lookups not cached.","Thread-pool pressure and wasted calls under load.","M","M","P3",false,["PLT","CAT","ORD"],["iso"],[]],
  ["TD-09","Efficiency","Database queries inside loops","18 objects run MongoDB queries inside loops (structural flaw).","Response times degrade with catalog and order volume.","M","S","P2",true,["CAT","ORD"],["flaws"],[]],
  ["TD-10","Maintainability","Coupling and size","3,224 high fan-out, 560 high fan-in, 413 large artifacts, 105 large methods; Orders depends on 10 domains.","The main modernization cost driver.","H","L","P2",false,["ORD","CAT","PLT"],["iso","coupling"],[]],
  ["TD-11","Maintainability","Duplication and commented-out code","473 copy-pasted artifacts; 92 with high commented-out code.","Fixes applied in several places; noise for any conversion.","M","M","P3",false,["PLT"],["iso"],[]],
  ["TD-12","Reliability","Empty catches and disposables","27 empty catch blocks; 61 types own disposable fields without being disposable.","Silent failures and resource leaks.","M","S","P2",true,["ORD","PLT"],["iso"],[]],
  ["TD-13","Efficiency","Loop inefficiencies","422 instantiations in loops, 147 nested loops, 75 string concatenations in loops.","CPU cost on a pay-per-use cloud.","L","M","P3",false,["PLT"],["green"],[]],
  ["TD-14","Architecture","Shared entity repositories","Order used by 4 domains, Product by 5, Customer by 3.","Blocks service separation until ownership is clear.","H","L","P2",false,["ORD","CAT","CUS"],["repos"],[]],
];
let debtView = "where", debtTheme = "All";
function setDebt(v,t){ if(v) debtView=v; if(t!==undefined) debtTheme=t; document.getElementById("doc").innerHTML = techDebt(); paintGrounding(); }
const domLabel = id => ((DOMS.find(d=>d[0]===id)||[id,id])[1]).replace("&","&amp;");
function techDebt(){
  STMTS = []; debtWhere(); debtRegister(true); debtOss(); const all = STMTS; STMTS = [];
  const body = { where:debtWhere, register:()=>debtRegister(false), oss:debtOss, plan:debtPlan }[debtView](); STMTS = all;
  return `<div class="doc-head"><div><div class="eyebrow">Technical Debt · as-is</div><h1>${APP}</h1><div class="meta">ISO 5055, CVE, cloud, green-IT and structural findings, mapped to 13 domains · snapshot ${SYSTEM.snapshot}</div></div>
    <div class="doc-actions"><button class="btn btn-primary btn-sm" onclick="openExport(DEBT_FILES,'Debt register','Markdown and Jira CSV.')">Export for agents</button></div></div>
  <div class="rkpis"><div class="kpi" onclick="setDebt('oss')"><div class="v">44</div><div class="l">Known vulnerabilities</div><div class="s">0 critical · 2 high</div></div><div class="kpi"><div class="v">9,681</div><div class="l">Quality findings</div><div class="s">44 ISO 5055 rules</div></div>
    <div class="kpi"><div class="v">14</div><div class="l">Cloud & container patterns</div></div><div class="kpi" onclick="setDebt('plan')"><div class="v">${DEBT.filter(d=>d[8]).length}</div><div class="l">Quick wins</div></div></div>
  <div class="grounding" id="grounding"></div><div class="tabs"><button class="tab ${debtView==="where"?"on":""}" onclick="setDebt('where')">Where the debt is</button><button class="tab ${debtView==="register"?"on":""}" onclick="setDebt('register')">Debt register <span class="cnt" style="background:#F2F0F5;color:#4B4652">${DEBT.length}</span></button>
    <button class="tab ${debtView==="oss"?"on":""}" onclick="setDebt('oss')">Open-source vulnerabilities <span class="cnt">44</span></button><button class="tab ${debtView==="plan"?"on":""}" onclick="setDebt('plan')">Quick wins vs. structural</button></div>${body}`;
}
function debtWhere(){
  const rows = DEBT_DOMS.map(d=>{ const sz = DOMS.find(x=>x[0]===d[0])[3]; const tot = d[1]+d[2]+d[3]+d[4]; return {id:d[0],q:d[1],g:d[2],s:d[3],c:d[4],rev:d[5],tot,dens:Math.round(tot/sz*100)}; }).sort((a,b)=>b.dens-a.dens), max = rows[0].dens;
  return `<p style="margin-top:22px">${X("Findings are attached to the objects that carry them; grouping those by namespace shows where the debt sits. The admin console (3,649) and storefront (1,617) carry the most in absolute terms.","debtDom")}</p>
  <div class="tblwrap"><table class="tbl heat"><thead><tr><th>Domain</th><th style="text-align:right">Quality</th><th style="text-align:right">Efficiency</th><th style="text-align:right">Structural</th><th style="text-align:right">Cloud</th><th style="text-align:right">Total</th><th>Per 100 members</th></tr></thead><tbody>
  ${rows.map(r=>`<tr><td><b>${domLabel(r.id)}</b>${r.rev?'<span class="rev">REVENUE PATH</span>':""}</td><td class="h">${r.q}</td><td class="h">${r.g}</td><td class="h">${r.s}</td><td class="h">${r.c}</td><td class="h"><b>${r.tot}</b></td><td class="d"><div class="dbar"><b>${r.dens}</b><i class="${r.rev&&r.dens>=90?"hot":""}" style="width:${Math.round(r.dens/max*120)}px"></i></div></td></tr>`).join("")}</tbody></table></div>
  <div class="takeaways" style="border:1px solid var(--line);border-radius:var(--radius);margin-top:16px"><h4>What this shows</h4><ul>
    <li>${X("Media is the densest service domain (121 per 100 members), driven by file-system cloud blockers.","debtDom","cloud")}</li><li>${X("Checkout &amp; Orders (102) and Customers (100) follow; Orders also carries 58 green-IT findings and a structural flaw.","debtDom")}</li>
    <li>${I("Debt follows the revenue path and the media pipeline — the two places to invest first.","Prioritization from the density ranking.","debtDom")}</li></ul></div>`;
}
function debtPlan(){ const qw = DEBT.filter(d=>d[8]);
  return `<h2>Quick wins (${qw.length})</h2><div class="tblwrap"><table class="tbl"><thead><tr><th>ID</th><th>Item</th><th>Priority</th><th>Why now</th></tr></thead><tbody>${qw.map(d=>`<tr><td class="m">${d[0]}</td><td><b>${d[2]}</b></td><td><span class="pr ${d[7]}">${d[7]}</span></td><td style="font-size:13.5px">${esc(d[4])}</td></tr>`).join("")}</tbody></table></div>
  <p style="font-size:13px;color:var(--muted);margin-top:10px">${I("Structural items — TD-01, TD-10 and TD-14 — feed the target state and the plan rather than a sprint backlog.","Effort and impact are assessments.","iso")}</p>`; }
function mdDebt(){ return [`# Technical Debt Register — ${APP}`,"",...DEBT.map(d=>`- **${d[0]} ${d[2]}** (${d[7]}): ${d[3]} — ${d[4]}`)].join("\n"); }
function csvDebt(){ const q = v => `"${String(v).replace(/"/g,'""')}"`; return [["Issue Type","Issue key","Summary","Description","Priority"],...DEBT.map(d=>["Task",d[0],d[2],`${d[3]}\n${d[4]}`,d[7]])].map(r=>r.map(q).join(",")).join("\n"); }
const DEBT_FILES = [["debt/technical-debt-register.md", mdDebt],["debt/jira-import.csv", csvDebt],["debt/open-source-remediation.md", () => mdOss()]];

/* ---------------- Open-source vulnerabilities ---------------- */
const OSS = [
  ["TinyMCE","Admin console","4.x / 5.x",[["CVE-2019-1010091","M"],["CVE-2020-12648","M"],["CVE-2020-17480","M"],["CVE-2022-23494","M"],["CVE-2023-45818","M"],["CVE-2023-45819","M"],["CVE-2023-48219","M"],["CVE-2024-21908","M"],["CVE-2024-21910","M"],["CVE-2024-21911","M"],["CVE-2024-29203","M"],["CVE-2024-29881","M"],["CVE-2024-38356","M"],["CVE-2024-38357","M"],["GHSA-9hcv-j9pv-qmph","M"],["GHSA-w9jx-4g6g-rp7x","M"],["GMS-2020-789","U"],["GMS-2021-189","U"],["GMS-2021-190","U"],["GMS-2021-191","U"],["GMS-2021-192","U"],["GMS-2021-193","U"]],"7.2.0 (or 6.8.4)","upgrade","WP-08","The admin's rich-text editor; one upgrade closes 22 findings."],
  ["jQuery","Storefront + admin","< 3.5.0",[["CVE-2020-11022","M"],["CVE-2020-11023","M"],["CVE-2020-23064","M"],["CVE-2019-11358","M"],["CVE-2015-9251","M"],["CVE-2012-6708","M"],["CVE-2011-4969","M"],["CVE-2020-7656","M"],["CVE-2007-2379","M"],["CVE-2019-5428","U"],["GMS-2016-33","U"],["GMS-2017-122","U"]],"3.7.x","upgrade","WP-08","Check plugins and themes that rely on removed jQuery APIs (18 deprecated-method findings)."],
  ["MongoDB C# driver","Backend","≤ 2.18.0",[["CVE-2022-48282","H"]],"2.19.0 or later","upgrade","WP-07","The only high-severity library advisory with a code-side fix."],
  ["CodeMirror","Admin console","< 5.58.2",[["CVE-2020-7760","M"]],"5.58.2 or later","upgrade","WP-08",""],
  ["MongoDB server","Database","3.x (advisories)",[["CVE-2015-7882","H"],["CVE-2014-8180","M"],["CVE-2016-6494","M"],["CVE-2017-2665","M"],["CVE-2021-32036","M"]],"managed, supported version","retire","WP-12","Server and tooling advisories, not application code — they go away with a managed, patched database."],
  ["ASP.NET Core runtime","Backend","—",[["CVE-2021-34532","M"]],"supported .NET runtime","rebuild","WP-03","Runtime component — fixed by building on a supported .NET image."],
  ["Django (matched name)","—","—",[["CVE-2009-2659","M"]],"—","verify","WP-07","GrandNode has no Python code — almost certainly a name match; dismiss after checking."],
  ["healthchecks (matched name)","—","—",[["CVE-2023-0440","M"]],"—","verify","WP-07","Advisory for a Python project of the same name; GrandNode likely uses the .NET health-check library."],
];
const OSS_ACT = { upgrade:["Upgrade in place","A fixed version exists.","#067647","#ECFDF3"], retire:["Retire through the target state","Replaced by a managed service in the target.","#463589","#F4F1FC"], rebuild:["Rebuild on a supported runtime","Not in the code — in the runtime image.","#0E7490","#E0F2F5"], verify:["Verify first","Probably a false match — confirm and dismiss.","#8A6D00","#FFF8DB"] };
const SEV = { C:["Critical","var(--crit)","var(--crit-bg)"], H:["High","var(--high)","#FFF4ED"], M:["Medium","var(--med)","var(--med-bg)"], L:["Low","#4B4652","#F2F0F5"], U:["Unrated","#4B4652","#F2F0F5"] };
const ossCount = (rows, s) => rows.reduce((a,r)=>a + r[3].filter(c=>!s || c[1]===s).length, 0);
function debtOss(){
  const total = ossCount(OSS), high = ossCount(OSS,"H"), acts = Object.keys(OSS_ACT).map(k=>{ const rows = OSS.filter(r=>r[5]===k); return {k, rows, n: ossCount(rows), wps:[...new Set(rows.map(r=>r[6]))]}; });
  const chip = ([id,s]) => `<span title="${SEV[s][0]}" style="display:inline-block;margin:1px 3px 1px 0;padding:1px 6px;border-radius:5px;font-size:11px;font-weight:600;font-family:'JetBrains Mono',monospace;color:${SEV[s][1]};background:${SEV[s][2]}">${id}</span>`;
  const tag = k => `<span style="display:inline-block;padding:2px 8px;border-radius:99px;font-size:11.5px;font-weight:700;color:${OSS_ACT[k][2]};background:${OSS_ACT[k][3]}">${OSS_ACT[k][0]}</span>`;
  return `<p style="margin-top:22px">${X(`CAST reports <b>${total} known vulnerabilities</b> — no critical, <b>${high} high</b> — in ${OSS.length} components.`,"cve")} ${I("Two front-end upgrades (TinyMCE and jQuery) close 34 of them; five MongoDB server advisories disappear with a managed database; two look like name matches.","Grouping of the CVE list by component and action.","cve")}</p>
  <h2>The go-forward</h2><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px">${acts.map(a=>`<div style="border:1px solid var(--line);border-top:4px solid ${OSS_ACT[a.k][2]};border-radius:12px;padding:14px;background:#fff"><div style="font-size:12px;font-weight:700;color:${OSS_ACT[a.k][2]}">${OSS_ACT[a.k][0]}</div><div style="font-size:26px;font-weight:800;margin:6px 0 2px">${a.n} <span style="font-size:13px;color:var(--muted)">CVEs</span></div><p style="font-size:12.5px;margin:6px 0">${OSS_ACT[a.k][1]}</p><div style="font-size:11.5px">${a.wps.map(w=>`<a style="cursor:pointer;font-weight:700;margin-right:6px" onclick="openWP('${w}')">${w} →</a>`).join("")}</div></div>`).join("")}</div>
  <h2>Component by component</h2><div class="tblwrap"><table class="tbl"><thead><tr><th>Component</th><th>CVEs</th><th>Fixed in</th><th>Action</th></tr></thead><tbody>
  ${OSS.map(r=>`<tr><td><b>${r[0]}</b><div style="font-size:11.5px;color:var(--muted)">${r[1]} · ${esc(r[2])}</div></td><td>${X(r[3].map(chip).join(""),"cve")}</td><td style="font-size:13px">${esc(r[4])}</td><td>${tag(r[5])} <a style="cursor:pointer;font-size:11.5px;font-weight:700" onclick="openWP('${r[6]}')">${r[6]}</a><div style="font-size:12.5px;color:var(--muted);margin-top:4px;max-width:330px">${I(esc(r[7]),"Recommendation from the advisory text and the target state.","cve")}</div></td></tr>`).join("")}</tbody></table></div>
  <h2>Keep it from coming back</h2><ul class="plain"><li><b>An SBOM per release</b> — ${X("Imaging resolved no package inventory for GrandNode, so versions and usage counts are unknown.","pkgNone")}</li><li><b>Dependency scanning in the pipeline</b> — ${I("fail the build on new high findings (WP-03).","Standard practice.","cve")}</li><li><b>Re-analyse each release</b> — ${I("so name-matched findings like Django are dismissed once, with a reason.","Process recommendation.","cve")}</li></ul>`;
}
function mdOss(){ return ["# Open-source vulnerabilities — GrandNode","",...OSS.map(r=>`- **${r[0]}** (${r[3].length} CVEs) → ${OSS_ACT[r[5]][0]}: ${r[4]} · ${r[6]}`)].join("\n"); }

/* =====================================================================
   CUSTOMER CONTEXT
   ===================================================================== */
const DK = "Don't know";
const CTX_GROUPS = [["current","Current state","How and where it runs today."],["usage","Exposure & usage","Who uses it and how much."],["target","Target direction","Where the customer wants to go."],["drivers","Business drivers","Ranked — weights the Well-Architected pillars."],["nfr","Non-functional targets","Service levels."],["constraints","Constraints","Limits the plan must respect."]];
const CTX_FIELDS = [
  ["stack","current","Application stack","Detected by CAST.","info",[],{v:"C# · ASP.NET Core · MediatR · MongoDB · Redis · AWS S3 · jQuery", src:"detected", ev:["stats"]}],
  ["cur_hosting","current","Hosting today","","one",["On-premises","Public cloud","Hybrid","Colocation",DK]],["cur_provider","current","Current provider","","one",["Own data center","AWS","Azure","GCP","Other",DK]],
  ["cur_runtime","current","Runtime","CAST found local file and directory use — typical of VM deployments.","one",["Virtual machines","Containers","Kubernetes","PaaS",DK]],
  ["cur_db","current","MongoDB hosting","Engine detected: MongoDB.","one",["Self-managed on VM","MongoDB Atlas","Managed cloud service",DK]],["cur_envs","current","Environments","","one",["1","2","3","4+",DK]],
  ["cur_cost","current","Current annual run cost","","one",["< $50K","$50K–150K","$150K–500K","> $500K",DK]],
  ["exposure","usage","Exposure","","one",["External","Internal","Both",DK],{v:"Both", src:"suggested", why:"A public storefront and a staff admin console.", ev:["tx"]}],
  ["users_peak","usage","Peak concurrent users","","one",["< 100","100–1,000","1,000–10,000","10,000+",DK]],["orders_day","usage","Orders per day","","one",["< 100","100–1,000","1,000–10,000","10,000+",DK]],
  ["regions","usage","Regions served","","many",["North America","Europe","APAC","LATAM"]],["peaks","usage","Seasonal peak vs. normal","","one",["None","2×","5×","10× or more",DK]],
  ["db_size","usage","Database size","","one",["< 50 GB","50–250 GB","250 GB–1 TB","> 1 TB",DK]],["media_size","usage","Media volume","","one",["< 100 GB","100–500 GB","500 GB–2 TB","> 2 TB",DK]],["traffic","usage","Monthly data served","","one",["< 500 GB","500 GB–2 TB","2–10 TB","> 10 TB",DK]],
  ["tgt_cloud","target","Target cloud","AWS S3 is already integrated.","one",["AWS","Azure","GCP","Stay on-premises","Undecided"]],
  ["tgt_style","target","Target architecture style","","one",["Rehost (lift & shift)","Replatform to containers","Containers first, then services","Microservices","Undecided"]],
  ["tgt_managed","target","Managed vs. portable","","one",["Prefer managed cloud services","Balanced","Prefer portable (Kubernetes)",DK]],
  ["drivers","drivers","Top 3 drivers","Click in order of importance.","rank",["Scalability","Security & compliance","Cost reduction","Delivery speed","Resilience","End of support / skills"]],
  ["availability","nfr","Availability target","","one",["99.5%","99.9%","99.95%","99.99%",DK]],["rto","nfr","Recovery targets (RTO / RPO)","","one",["4 h / 1 h","1 h / 15 min","15 min / near zero",DK]],["perf","nfr","Checkout response time","","one",["< 1 s","< 2 s","< 5 s",DK]],
  ["compliance","constraints","Compliance","Payment plugins in code point to PCI DSS.","many",["PCI DSS","GDPR","SOC 2","Data residency","None"],{v:["PCI DSS"], src:"suggested", why:"Payment processing through payment plugins.", ev:["coTx"]}],
  ["budget","constraints","Budget range","","one",["< $250K","$250K–1M","$1M–3M","> $3M",DK]],["deadline","constraints","Deadline","","one",["< 6 months","6–12 months","12–24 months","No fixed date"]],
  ["team_size","constraints","Team size","","one",["1–5","6–15","16–40","40+",DK]],["team_skills","constraints","Team skills","","many",[".NET / C#","JavaScript","MongoDB","Kubernetes","AWS","Azure","GCP","DevOps / CI-CD"]],
  ["keep_int","constraints","Integrations that must stay","Plugin families detected in code.","many",["PayPal","Braintree","Shipping rate plugins","External login","Push notifications"],{v:[], src:"detected", ev:["ns"]}],
  ["notes","constraints","Anything else","","text",[]],
];
const CTX_DEMO = { cur_hosting:"On-premises", cur_provider:"Own data center", cur_runtime:"Virtual machines", cur_db:"Self-managed on VM", cur_envs:"3", cur_cost:"$150K–500K",
  users_peak:"1,000–10,000", orders_day:"1,000–10,000", regions:["Europe","North America"], peaks:"5×", db_size:"50–250 GB", media_size:"500 GB–2 TB", traffic:"2–10 TB",
  tgt_cloud:"AWS", tgt_style:"Containers first, then services", tgt_managed:"Prefer managed cloud services", drivers:["Scalability","Cost reduction","Security & compliance"],
  availability:"99.95%", rto:"1 h / 15 min", perf:"< 2 s", compliance:["PCI DSS","GDPR"], budget:"$250K–1M", deadline:"6–12 months", team_size:"6–15", team_skills:[".NET / C#","JavaScript","MongoDB","DevOps / CI-CD"],
  keep_int:["PayPal","Shipping rate plugins"], notes:"Black Friday and December drive about 5× normal traffic." };
const PLAN_DEPS = { target:["cur_hosting","cur_runtime","exposure","regions","tgt_cloud","tgt_style","tgt_managed","drivers","availability","compliance"], cost:["tgt_cloud","tgt_managed","users_peak","orders_day","peaks","regions","cur_envs","availability","cur_cost"],
  plan:["tgt_style","drivers","deadline","budget","team_size","team_skills","keep_int","compliance"], roi:["cur_cost","tgt_cloud","users_peak","cur_envs","tgt_style","team_size","deadline"] };
const WAF = { "Scalability":"Performance efficiency", "Security & compliance":"Security", "Cost reduction":"Cost optimization", "Delivery speed":"Operational excellence", "Resilience":"Reliability", "End of support / skills":"Operational excellence" };
function customerContext(){
  return `<div class="doc-head"><div><div class="eyebrow">Input · Customer Context</div><h1>${APP}</h1><div class="meta">What the code can't tell us. Pre-filled from CAST where possible; “Don't know” becomes a labeled assumption.</div></div></div>
  <div class="ctxwrap"><div>${CTX_GROUPS.map(([g,t,s])=>`<section class="cgroup"><div class="cgh"><h3>${t}</h3><span>${s}</span></div><div class="cgrid">${CTX_FIELDS.filter(f=>f[1]===g).map(ctxField).join("")}</div></section>`).join("")}</div><aside class="ctxsum" id="ctxsum">${ctxSummary()}</aside></div>`;
}
