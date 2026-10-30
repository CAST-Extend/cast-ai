/* =====================================================================
   TECHNICAL DIAGRAMS
   ===================================================================== */
Object.assign(EV, {
  domEv: { title:"Links between domains", call:"run_cypher_query — program → data store access and program → program links, grouped by domain", rows:[
    ["Transactions & Billing → Cards (card cross-reference reads)","7"],["Transactions & Billing → Accounts (account and customer file)","5 (3 writes)"],
    ["Pending Authorizations → Accounts","4"],["Online programs → Sign-on & Menus (return / XCTL)","29"],["Account ↔ Transactions & Billing","both write ACCTDATA"]],
    note:"Domains are groupings of programs (see Business domains). Counts are distinct program → store or program → program links." },
  blastAcct: { title:"Blast radius — ACCTDATA (account master)", call:"run_cypher_query — accessors + (object)-[:IS_IN_TRANSACTION]->(Transaction)", rows:[
    ["Programs that read or write it","10 — 4 Transactions & Billing · 3 Accounts · 2 Authorizations · 1 MQ"],["Entry points","12 — POSTTRAN · INTCALC · CB00 · CREASTMT · CAVW · CAUP · READACCT · ACCTFILE · CP00 · CPVS · CPVD · CDRA"]]},
  blastXref: { title:"Blast radius — CARDXREF (card cross-reference)", call:"run_cypher_query — accessors of the KSDS and its CICS paths (CXACAIX, CCXREF) + IS_IN_TRANSACTION", rows:[
    ["Programs","11 — 6 Transactions & Billing · 2 Accounts · 2 Authorizations · 1 Cards"],["Entry points","14"]]},
  blastTcat: { title:"Blast radius — TCATBALF (category balances)", call:"run_cypher_query — accessors + IS_IN_TRANSACTION", rows:[["Programs","CBTRN02C (write) · CBACT04C (read)"],["Entry points","POSTTRAN · INTCALC · TCATBALF (reload) · PRTCATBL (print)"]]},
  blastTran: { title:"Blast radius — TRANSACT (transaction history)", call:"run_cypher_query — accessors + IS_IN_TRANSACTION", rows:[["Programs","COTRN00C · COTRN01C · COTRN02C · COBIL00C · CBTRN02C"],["Entry points","12 — 10 in Transactions & Billing, plus REPROC and REPRTEST"]]},
  blastDate: { title:"Blast radius — CSUTLDTC (date validation)", call:"run_cypher_query — callers + IS_IN_TRANSACTION", rows:[["Callers","COTRN02C · CORPT00C · COACTUPC"],["Entry points","CT02 · CR00 · CAUP"]]},
});

const DOMS = [ // id, label, lane, programs
  ["TRAN","Transactions & Billing","mp",11],["ACCT","Accounts & Customers","mp",4],["CARD","Cards","mp",5],
  ["AUTH","Pending Authorizations","sv",8],["TTYP","Transaction Types","sv",3],["MQ","MQ Services","sv",2],
  ["SIGN","Sign-on & Menus","ac",3],["USER","User Admin","ac",4],["UTIL","Shared utilities","sh",2],
];
const LANES = { mp:["Money path","#624ABB"], sv:["Services & reference","#CE6FCE"], ac:["Access & admin","#6D6A71"], sh:["Shared","#0C0613"] };
const DLINKS = [
  ["TRAN","CARD",7],["TRAN","ACCT",5],["TRAN","TTYP",2],["TRAN","SIGN",10],["TRAN","UTIL",2],
  ["ACCT","CARD",2],["ACCT","SIGN",2],["ACCT","UTIL",1],["CARD","SIGN",3],
  ["AUTH","ACCT",4],["AUTH","CARD",2],["AUTH","SIGN",2],["MQ","ACCT",1],
  ["USER","SIGN",8],["SIGN","USER",1],["TTYP","SIGN",2],
];
const SHARED_W = new Set(["ACCT|TRAN"]);
const CRUD = [ // store, {domain: 'r'|'w'}
  ["ACCTDATA · accounts",{TRAN:"w",ACCT:"w",AUTH:"r",MQ:"r"}],["CUSTDATA · customers",{ACCT:"w",AUTH:"r",TRAN:"r"}],
  ["CARDXREF · card → account",{TRAN:"r",ACCT:"r",CARD:"r",AUTH:"r"}],["USRSEC · users",{USER:"w",SIGN:"r"}],
  ["CARDDATA · cards",{CARD:"w"}],["TRANSACT · transactions",{TRAN:"w"}],["TCATBALF · category balances",{TRAN:"w"}],
  ["DISCGRP · interest rates",{TRAN:"r"}],["TRANTYPE · TRANCATG (VSAM)",{TRAN:"r"}],["TRANSACTION_TYPE (DB2)",{TTYP:"w"}],
  ["TRANSACTION_TYPE_CATEGORY (DB2)",{TTYP:"r"}],["PAUTSUM0 (IMS)",{AUTH:"w"}],["AUTHFRDS (DB2)",{AUTH:"w"}],
  ["CARD.DEMO.ERROR (MQ)",{MQ:"w"}],["Authorization reply queue (MQ)",{AUTH:"w"}],
];

let diagId = "context", diagView = "diagram", chordFocus = "TRAN", crudAll = false;
const DIAGS = [
  ["context","System context","Who and what does CardDemo interact with?","System","3 actor groups · 4 data and messaging platforms"],
  ["containers","Containers","What are the runtime pieces and how do they talk?","System","1,573 objects → 8 boxes"],
  ["domains","Domain dependency map","How tangled are the business domains?","System","42 programs → 9 domains"],
  ["crud","Data ownership","Which domain reads and writes which file, table or queue?","System","15 data stores × 9 domains"],
  ["sequence","Job & screen flow","What happens, in order, in a batch job or a screen?",SHOW,""],
  ["lifecycle","Lifecycle","What states does a record or process move through?",SHOW,""],
  ["blast","Blast radius","What is affected if a given file or program changes?",SHOW,""],
  ["integrations","Integration map","Which platforms and interfaces does it depend on?","System","MQ · DB2 · IMS · scheduler · utilities"],
];
function setDiag(id){ diagId = id; diagView = "diagram"; redrawDiag(); }
function setDiagView(v){ diagView = v; redrawDiag(); }
function redrawDiag(){ document.getElementById("doc").innerHTML = techDiagrams(); paintGrounding(); }

function techDiagrams(){
  STMTS = []; diagTakeaways(diagId); const all = STMTS; STMTS = [];
  const d = DIAGS.find(x=>x[0]===diagId);
  const cards = DIAGS.map((x,i)=>`<div class="dcard ${x[0]===diagId?"on":""}" onclick="setDiag('${x[0]}')"><span class="num">D${i+1}</span><b>${x[1]}</b><span>${x[2]}</span><span class="scope">${x[3].replace("&","&amp;")}</span></div>`).join("");
  const body = diagView==="mermaid" ? `<pre class="mermaid-src">${esc(MERMAID[diagId]())}</pre>` : `<div class="dbody">${DRAW[diagId]()}</div>`;
  STMTS = []; const take = diagTakeaways(diagId); STMTS = all;
  return `
  <div class="doc-head"><div><div class="eyebrow">Technical Diagrams · as-is</div><h1>${APP}</h1>
    <div class="meta">8 diagrams condensed from the CAST Imaging analysis · system-wide and ${SHOW_H} · snapshot ${SYSTEM.snapshot}</div></div>
    <div class="doc-actions"><button class="btn btn-primary btn-sm" onclick="openExport(DIAG_FILES,'Diagrams as code','Every diagram as Mermaid inside Markdown — renders in GitHub, GitLab, Confluence and most IDEs, and reads cleanly for AI agents.')">Export for agents</button>
    <button class="btn btn-ghost btn-sm" onclick="toast('Export is not wired up in this prototype')">Export PNG</button></div></div>
  <div class="grounding" id="grounding"></div>
  <div class="dgrid">${cards}</div>
  <div class="dpanel">
    <div class="dh"><div><div class="eyebrow">${d[3].replace("&","&amp;")}</div><h2>${d[1]}</h2><div class="q"><b>Question:</b> ${d[2]}</div></div>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><span class="collapse">${collapseLabel(d)}</span>
      <div class="seg"><button class="${diagView==="diagram"?"on":""}" onclick="setDiagView('diagram')">Diagram</button><button class="${diagView==="mermaid"?"on":""}" onclick="setDiagView('mermaid')">Mermaid</button></div></div></div>
    ${variantPicker()}
    ${body}
    <div class="takeaways"><h4>What this shows</h4><ul>${take}</ul></div>
  </div>`;
}

function diagTakeaways(id){
  const T = {
    context: [
      X("Two kinds of people use CardDemo through 3270 screens — regular back-office users and administrators, who alone reach user and transaction-type maintenance.","nav","tx"),
      X("Operations run it through a 17-job CA-7 schedule, JCL jobs outside it and 9 shell scripts; other systems reach it through MQ request and reply queues.","schedule","data"),
      I("There is no customer-facing channel: cardholders see CardDemo only through statements — so a new digital channel is a to-be decision, not a migration requirement.","No web, API or mobile entry point exists among the 90 entry points.","tx"),
    ],
    containers: [
      X("Two runtimes share one set of data: CICS online (25 transactions, 26 programs) and batch (56 jobs, 15 programs).","tx","progs"),
      X("Data lives in four different stores: VSAM files for the core records, DB2 for transaction types and fraud flags, IMS for pending authorizations and MQ for inquiries.","data"),
      I("Each store needs its own target: VSAM usually becomes relational tables, DB2 moves engine-to-engine, IMS needs a data-model decision and MQ a managed queue.","Standard mainframe target mapping applied to the extracted stores.","data","cloud"),
    ],
    domains: [
      X("Transactions &amp; Billing depends on the most other domains: it reads the card cross-reference (7 links) and reads and writes the account and customer files (5).","domEv","crud"),
      X("Accounts and Transactions &amp; Billing both write the account master — the only file with two owning domains among the core records.","crud","domEv"),
      X("Every online domain returns to Sign-on &amp; Menus; the menu's own links to each option are resolved at run time, so Imaging sees them only one way.","nav"),
      I("User Admin, Transaction Types and MQ Services touch no core record except to read it — they can move first.","Coupling judgment from the link and data-access counts.","domEv","crud"),
    ],
    crud: [
      X("15 data stores; the account master is written by two domains and read by two more.","crud","data"),
      X("The card cross-reference is read by four domains but written by none of the programs — it is loaded by batch utility jobs.","crud","blastXref"),
      X("Transaction types exist twice: as VSAM files read by the nightly report and as DB2 tables maintained online.","crud","data"),
      I("Two copies of the transaction-type reference can drift apart; the migration should keep one.","Duplication inferred from two stores with the same business content; how they are synchronized is not visible in code.","data"),
    ],
    sequence: SEQ_TAKE[seqSel](),
    lifecycle: LIFE_TAKE[lifeSel](),
    blast: BLAST_TAKE[blastSel](),
    integrations: [
      X("MQ carries account and date inquiries and an error queue; the other queue names are resolved at run time.","data"),
      X("DB2 connections (27 objects) and IMS/MQ connections (25) are rated as boosters; the 12 DL/I calls to IMS are rated as blockers.","cloud"),
      X("Batch relies on IBM utilities — IDCAMS, SORT, IEFBR14, SDSF, the IMS region controller DFSRRC00 and FTP — and on Assembler helpers in two jobs.","schedule","stats"),
      I("Every utility needs an equivalent in the target: file definitions, sorts and data loads usually become scripts or data-pipeline steps.","Target mapping for the extracted utilities.","schedule"),
    ],
  };
  return T[id].map(t=>`<li>${t}</li>`).join("");
}

const svgBox = (x,y,w,h,title,sub,fill="#fff",stroke="#E6E4EA",tc="#0C0613",sc="#6D6A71") =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${fill}" stroke="${stroke}"/>
   <text x="${x+w/2}" y="${y+h/2-(sub?4:-4)}" text-anchor="middle" font-size="13" font-weight="700" fill="${tc}">${title}</text>
   ${sub?`<text x="${x+w/2}" y="${y+h/2+13}" text-anchor="middle" font-size="11" fill="${sc}">${sub}</text>`:""}`;
const ARROW = `<defs><marker id="dah" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#624ABB"/></marker>
  <marker id="dahg" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#9A97A0"/></marker></defs>`;

const DRAW = {
  context(){
    const ext = [["IBM MQ","account · date inquiries · errors"],["DB2","transaction types · fraud"],["IMS DB","pending authorizations"],["Batch utilities","IDCAMS · SORT · FTP"],["Statements","text · HTML · PDF"]];
    return `<svg viewBox="0 0 900 430" font-family="Inter,sans-serif">${ARROW}
      ${svgBox(30,40,180,64,"Back-office users","3270 · CICS")}
      ${svgBox(30,150,180,64,"Administrators","users · transaction types")}
      ${svgBox(30,260,180,64,"Operations","CA-7 · JCL · scripts")}
      ${svgBox(340,150,220,130,"CardDemo","credit card platform","#624ABB","#624ABB","#fff","#E7E1F8")}
      <text x="450" y="258" text-anchor="middle" font-size="10.5" fill="#E7E1F8">1 application · 90 entry points</text>
      <path d="M210,72 C280,72 280,180 338,190" stroke="#624ABB" stroke-width="2" fill="none" marker-end="url(#dah)"/>
      <path d="M210,182 L338,210" stroke="#624ABB" stroke-width="2" fill="none" marker-end="url(#dah)"/>
      <path d="M210,292 C280,292 280,250 338,240" stroke="#624ABB" stroke-width="2" fill="none" marker-end="url(#dah)"/>
      <text x="236" y="112" font-size="11" fill="#463589" font-weight="600">accounts · cards · billing</text><text x="232" y="300" font-size="11" fill="#463589" font-weight="600">nightly batch</text>
      ${ext.map((e,i)=>{const y=12+i*82; return svgBox(680,y,200,62,e[0],e[1]) + `<path d="M560,215 C620,215 620,${y+31} 678,${y+31}" stroke="#9A97A0" stroke-width="1.5" fill="none" marker-end="url(#dahg)"/>`}).join("")}
      <text x="30" y="400" font-size="11" fill="#6D6A71">Cardholders appear only as data and as statement recipients — no customer channel exists.</text>
    </svg>`;
  },
  containers(){
    return `<svg viewBox="0 0 900 430" font-family="Inter,sans-serif">${ARROW}
      ${svgBox(20,50,200,64,"3270 terminals","BMS maps · 21 UI objects")}
      ${svgBox(20,170,200,64,"CA-7 scheduler","17 jobs")}
      ${svgBox(20,290,200,64,"MQ clients","request / reply")}
      <rect x="290" y="30" width="330" height="370" rx="14" fill="#F4F1FC" stroke="#E7E1F8"/>
      <text x="455" y="56" text-anchor="middle" font-size="14" font-weight="700" fill="#0C0613">CardDemo · z/OS</text>
      <text x="455" y="74" text-anchor="middle" font-size="11" fill="#6D6A71">COBOL · 48,758 LOC · 1,573 objects</text>
      ${svgBox(310,90,290,70,"CICS region","25 transactions · 26 programs","#624ABB","#624ABB","#fff","#E7E1F8")}
      ${svgBox(310,172,290,70,"Batch (JCL)","56 jobs · 15 programs · utilities","#0C0613","#0C0613","#fff","#C7C9E0")}
      ${svgBox(310,254,140,56,"Copybooks","shared records","#fff","#E7E1F8")}
      ${svgBox(460,254,140,56,"CSUTLDTC","date validation","#fff","#E7E1F8")}
      ${svgBox(310,322,290,56,"Transient data JOBS","online → internal reader","#fff","#E7E1F8")}
      ${svgBox(700,40,180,64,"VSAM","13 KSDS files","#0C0613","#0C0613","#fff","#C7C9E0")}
      ${svgBox(700,130,180,56,"DB2","3 tables")}
      ${svgBox(700,210,180,56,"IMS DB","PAUTSUM0 · PAUTINDX")}
      ${svgBox(700,290,180,56,"IBM MQ","7 queues")}
      <path d="M220,82 C260,82 270,120 308,122" stroke="#624ABB" stroke-width="2" fill="none" marker-end="url(#dah)"/>
      <path d="M220,202 L308,205" stroke="#624ABB" stroke-width="2" fill="none" marker-end="url(#dah)"/>
      <path d="M220,322 C260,322 270,140 308,138" stroke="#624ABB" stroke-width="2" fill="none" marker-end="url(#dah)"/>
      <path d="M600,120 C650,120 650,72 698,72" stroke="#9A97A0" stroke-width="1.5" fill="none" marker-end="url(#dahg)"/>
      <path d="M600,205 C650,205 650,80 698,80" stroke="#9A97A0" stroke-width="1.5" fill="none" marker-end="url(#dahg)"/>
      <path d="M600,130 C650,130 650,158 698,158" stroke="#9A97A0" stroke-width="1.5" fill="none" marker-end="url(#dahg)"/>
      <path d="M600,140 C650,140 650,238 698,238" stroke="#9A97A0" stroke-width="1.5" fill="none" marker-end="url(#dahg)"/>
      <path d="M600,150 C650,150 650,318 698,318" stroke="#9A97A0" stroke-width="1.5" fill="none" marker-end="url(#dahg)"/>
      <path d="M455,322 L455,244" stroke="#624ABB" stroke-width="1.5" stroke-dasharray="4 3" marker-end="url(#dah)"/>
      <text x="640" y="190" font-size="10.5" fill="#B42318" font-weight="700">same files</text>
    </svg>`;
  },
  domains(){
    const cx=330, cy=290, R=205, n=DOMS.length;
    const pos = {}; DOMS.forEach((d,i)=>{ const a = -Math.PI/2 + i*2*Math.PI/n; pos[d[0]] = [cx+R*Math.cos(a), cy+R*Math.sin(a), a]; });
    const pairs = {}; DLINKS.forEach(([s,t,w])=>{ const k=[s,t].sort().join("|"); pairs[k] = pairs[k]||{a:[s,t].sort()[0],b:[s,t].sort()[1],ab:0,ba:0,k}; if(s===pairs[k].a) pairs[k].ab+=w; else pairs[k].ba+=w; });
    const edges = Object.values(pairs).map(p=>({...p, w:p.ab+p.ba, two: SHARED_W.has(p.k)}));
    const f = chordFocus;
    const paths = edges.sort((x,y)=>x.w-y.w).map(e=>{ const [x1,y1]=pos[e.a], [x2,y2]=pos[e.b]; const mx=(x1+x2)/2, my=(y1+y2)/2; const qx=cx+(mx-cx)*0.2, qy=cy+(my-cy)*0.2;
      const on = !f || e.a===f || e.b===f;
      return `<path d="M${x1.toFixed(1)},${y1.toFixed(1)} Q${qx.toFixed(1)},${qy.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}" fill="none" stroke="${e.two?"#C4320A":"#624ABB"}" stroke-width="${Math.min(14,1.5+e.w*1.1).toFixed(1)}" stroke-opacity="${on?(e.two?.8:.5):.06}" stroke-linecap="round"><title>${e.a} ↔ ${e.b}: ${e.ab} / ${e.ba} links</title></path>`; }).join("");
    const nodes = DOMS.map(([id,label,lane,sz])=>{ const [x,y,a] = pos[id]; const r = 9 + sz*1.8; const lx = cx+(R+r+14)*Math.cos(a), ly = cy+(R+r+14)*Math.sin(a);
      const anchor = Math.abs(Math.cos(a))<0.2 ? "middle" : Math.cos(a)>0 ? "start" : "end";
      const on = !f || f===id || edges.some(e=>(e.a===f&&e.b===id)||(e.b===f&&e.a===id));
      return `<g style="cursor:pointer" onclick="chordFocus=chordFocus==='${id}'?null:'${id}';redrawDiag()" opacity="${on?1:.3}">
        <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${LANES[lane][1]}" stroke="#fff" stroke-width="${f===id?4:2}"/>
        <text x="${lx.toFixed(1)}" y="${(ly+4).toFixed(1)}" text-anchor="${anchor}" font-size="12.5" font-weight="${f===id?800:600}" fill="#0C0613">${label.replace("&","&amp;")}</text></g>`; }).join("");
    let side = `<h5>Click a domain</h5><div class="sub">to see what it depends on and what depends on it</div>`;
    if (f) { const lab = id => DOMS.find(d=>d[0]===id)[1].replace("&","&amp;");
      const out = DLINKS.filter(l=>l[0]===f).sort((a,b)=>b[2]-a[2]), inn = DLINKS.filter(l=>l[1]===f).sort((a,b)=>b[2]-a[2]);
      const two = new Set(edges.filter(e=>e.two && (e.a===f||e.b===f)).map(e=>e.a===f?e.b:e.a));
      side = `<h5>${lab(f)}</h5><div class="sub">${DOMS.find(d=>d[0]===f)[3]} programs</div>
        <div style="font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--muted)">Depends on</div>
        <table>${out.map(l=>`<tr><td class="${two.has(l[1])?"two":""}">${lab(l[1])}${two.has(l[1])?" ⇄ shared writes":""}</td><td>${l[2]}</td></tr>`).join("")||"<tr><td>—</td></tr>"}</table>
        <div style="font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--muted);margin-top:10px">Used by</div>
        <table>${inn.map(l=>`<tr><td class="${two.has(l[0])?"two":""}">${lab(l[0])}${two.has(l[0])?" ⇄ shared writes":""}</td><td>${l[2]}</td></tr>`).join("")||"<tr><td>—</td></tr>"}</table>`; }
    return `<div class="chordwrap"><div><svg viewBox="-80 0 820 580" font-family="Inter,sans-serif">${paths}${nodes}</svg>
      <div class="clegend">${Object.values(LANES).map(l=>`<span><i style="background:${l[1]}"></i>${l[0]}</span>`).join("")}
        <span><i class="line" style="background:#624ABB"></i>reads or calls</span><span><i class="line" style="background:#C4320A"></i>both write the same file</span>
        <span>circle size = programs · line width = links</span></div></div>
      <div class="chordside">${side}</div></div>`;
  },
  crud(){
    const doms = DOMS.map(d=>d[0]);
    const rows = CRUD.filter(r => crudAll || Object.keys(r[1]).length>1);
    const writers = r => Object.values(r[1]).filter(v=>v==="w").length;
    return `<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:12px">
      <div class="clegend" style="margin:0"><span><i style="border-radius:3px;background:var(--purple-50);border:1px solid var(--purple-100)"></i>reads</span><span><i style="border-radius:3px;background:var(--purple)"></i>writes</span><span><i style="border-radius:3px;background:var(--crit)"></i>written by more than one domain</span></div>
      <div class="seg"><button class="${crudAll?"":"on"}" onclick="crudAll=false;redrawDiag()">Shared stores (${CRUD.filter(r=>Object.keys(r[1]).length>1).length})</button><button class="${crudAll?"on":""}" onclick="crudAll=true;redrawDiag()">All stores (${CRUD.length})</button></div></div>
      <div class="tblwrap"><table class="tbl crud"><thead><tr><th>Data store</th>${doms.map(d=>`<th class="v">${DOMS.find(x=>x[0]===d)[1].replace("&","&amp;")}</th>`).join("")}</tr></thead><tbody>
      ${rows.map(r=>`<tr class="${writers(r)>1?"multi":""}"><td class="tn">${r[0]}</td>${doms.map(d=>{const v=r[1][d]; return `<td class="c ${v||""}">${v==="w"?"W":v==="r"?"R":""}</td>`}).join("")}</tr>`).join("")}
      </tbody></table></div>
      <p style="font-size:12.5px;color:var(--muted);margin:10px 0 0">W = writes, rewrites, inserts, updates, deletes or publishes (reads implied). Program-level access only; batch utility steps (IDCAMS loads) are not attributed to a domain.</p>`;
  },
  sequence(){ return seqSVG(SEQS[seqSel]); },
  lifecycle(){ return lifeSVG(lifeSel); },
  blast(){ return blastSVG(BLASTS[blastSel]); },
  integrations(){
    const G = [
      ["IBM MQ",[["CARD.DEMO.ERROR","error queue","4 programs"],["Request / reply queues","names resolved at run time","6 queues"],["IMS/MQ connection","CloudReady booster","25 objects"]]],
      ["DB2",[["TRANSACTION_TYPE","maintained online (CTLI, CTTU)","16 accessors"],["TRANSACTION_TYPE_CATEGORY","reference","2"],["AUTHFRDS","fraud flags","3"],["SYSIBM.SYSDUMMY1","cloud blocker","2 objects","B"]]],
      ["IMS DB",[["PAUTSUM0","pending authorization summary","10 accessors"],["PAUTINDX","index segment","—"],["DL/I calls","cloud blocker","12 objects","B"]]],
      ["Scheduler",[["CA-7","nightly chain","17 jobs"],["Shell scripts","run_full_batch · run_interest_calc · remote_submit …","9"]]],
      ["Batch utilities",[["IDCAMS","define · repro · backup","many jobs"],["SORT","COMBTRAN merge","—"],["IEFBR14 · SDSF","allocation · output","—"],["FTP","FTPJCLS","—"]]],
      ["CICS services",[["BMS maps","3270 screens","21 UI objects"],["Transient data JOBS","online job submission","CR00"],["File control","VSAM access from online","14 datasets"]]],
      ["Other code",[["Assembler","used by READACCT and WAITSTEP jobs","—"],["CSUTLDTC","shared date validation","3 callers"]]],
    ];
    return `<div class="igrid">${G.map(([g,libs])=>`<div class="igroup"><h5>${g}<span>${libs.length}</span></h5>
      ${libs.map(l=>`<div class="lib"><div><b style="font-size:13px">${l[0]}</b><br><code>${l[1]}</code></div><div style="text-align:right">${l[3]?`<span class="flag">Blocker</span><br>`:""}<span style="font-size:11px;color:var(--muted)">${l[2]}</span></div></div>`).join("")}</div>`).join("")}</div>
      <p style="font-size:12.5px;color:var(--muted);margin:12px 0 0">No third-party packages: CardDemo depends on IBM middleware and utilities, which is why the CVE scan (not configured) matters less here than a middleware version review.</p>`;
  },
};

const MERMAID = {
  context: () => `flowchart LR
  users([Back-office users<br/>3270 · CICS])
  admins([Administrators])
  ops([Operations<br/>CA-7 · JCL · scripts])
  cd[[CardDemo credit card platform<br/>90 entry points]]
  mq[IBM MQ]
  db2[(DB2)]
  ims[(IMS DB)]
  util[Batch utilities<br/>IDCAMS · SORT · FTP]
  stmt[Statements<br/>text · HTML · PDF]
  users --> cd
  admins --> cd
  ops --> cd
  cd --> mq & db2 & ims & util & stmt`,
  containers: () => `flowchart LR
  term[3270 terminals]
  ca7[CA-7 · 17 jobs]
  mqc[MQ clients]
  subgraph zos[CardDemo · z/OS]
    cics[CICS · 25 transactions · 26 programs]
    batch[Batch · 56 jobs · 15 programs]
    tdq[TDQ JOBS] --> batch
    cics --> tdq
  end
  vsam[(VSAM · 13 KSDS)]
  db2[(DB2 · 3 tables)]
  ims[(IMS DB)]
  mq[IBM MQ · 7 queues]
  term --> cics
  ca7 --> batch
  mqc --> cics
  cics --> vsam & db2 & ims & mq
  batch --> vsam & db2 & ims`,
  domains: () => { const lab = id => DOMS.find(d=>d[0]===id)[1]; const L = ["flowchart LR"];
    Object.entries(LANES).forEach(([k,[n]])=>{ L.push(`  subgraph ${k}[${n}]`); DOMS.filter(d=>d[2]===k).forEach(d=>L.push(`    ${d[0]}[${lab(d[0])}]`)); L.push("  end"); });
    DLINKS.forEach(l=>L.push(`  ${l[0]} -- ${l[2]} --> ${l[1]}`)); L.push("  ACCT <== both write ACCTDATA ==> TRAN"); return L.join("\n"); },
  crud: () => { const L = ["%% Data ownership — stores used by more than one domain", "flowchart LR"];
    CRUD.filter(r=>Object.keys(r[1]).length>1).forEach((r,i)=>{ L.push(`  s${i}[(${r[0]})]`); Object.entries(r[1]).forEach(([d,v])=>L.push(`  ${d} -- ${v==="w"?"writes":"reads"} --> s${i}`)); }); return L.join("\n"); },
  sequence: () => seqMermaid(SEQS[seqSel]),
  lifecycle: () => LIFE_MERMAID[lifeSel](),
  blast: () => blastMermaid(BLASTS[blastSel]),
  integrations: () => `flowchart LR
  cd[CardDemo]
  cd --> mq[IBM MQ: CARD.DEMO.ERROR + request/reply]
  cd --> db2[DB2: TRANSACTION_TYPE · CATEGORY · AUTHFRDS]
  cd --> ims[IMS DB: PAUTSUM0 · DL/I ⚠]
  cd --> sch[CA-7 · 17 jobs · 9 shell scripts]
  cd --> util[IDCAMS · SORT · IEFBR14 · SDSF · FTP]
  cd --> cics[CICS: BMS · TDQ JOBS · file control]`,
};

/* ---------- D5–D7 generators ---------- */
const SEQS = {
  posting: { name:"Nightly posting", endpoint:"POSTTRAN → CBTRN02C", size:46,
    P:["CA-7","POSTTRAN","CBTRN02C","Daily file","CARDXREF","ACCTDATA","TCATBALF","TRANSACT","DALYREJS"], dark:[3,4,5,6,7,8],
    M:[[0,1,"fire after CBPAUP0J","m"],[1,2,"EXEC CBTRN02C","m"],[2,3,"read next daily txn","m"],[2,4,"READ card → account","m"],[2,5,"READ account","m"],[2,2,"limit · expiration checks","s"],
       [2,8,"WRITE reject + reason","m"],[2,6,"READ / create / REWRITE","m"],[2,5,"REWRITE balance + cycle","m"],[2,7,"WRITE transaction","m"],[2,1,"return code 4 if rejects","r"],[1,0,"fire WAITSTEP","r"]],
    F:[{at:6,p:[2,8],c:"#C4320A",bg:"#FFF4ED",l:"alt [reason 100–103] → reject, skip posting",end:true},{at:7,p:[2,7],c:"#B42318",bg:"#FEF3F2",l:"no rollback across these three writes (C-03)"}] },
  billpay: { name:"Online bill payment", endpoint:"CB00 → COBIL00C", size:70,
    P:["User (3270)","CICS CB00","COBIL00C","ACCTDAT","CXACAIX","TRANSACT"], dark:[3,4,5],
    M:[[0,1,"account ID + confirm","m"],[1,2,"start COBIL00C","m"],[2,3,"READ account","m"],[2,2,"balance > 0 and confirm = Y?","s"],[2,4,"READ card for account","m"],
       [2,5,"STARTBR / READPREV last ID","m"],[2,5,"WRITE payment (ID + 1)","m"],[2,3,"REWRITE balance − amount","m"],[2,0,"payment confirmed","r"]],
    F:[{at:3,p:[2,5],c:"#C4320A",bg:"#FFF4ED",l:"alt [nothing to pay / not confirmed] → message only",end:true},{at:5,p:[2,5],c:"#8A6D00",bg:"#FFF8DB",l:"two users can read the same last ID (C-07)"}] },
  interest: { name:"Interest calculation", endpoint:"INTCALC → CBACT04C", size:39,
    P:["Operator","INTCALC","CBACT04C","TCATBALF","ACCTDATA","CARDXREF","DISCGRP","SYSTRAN"], dark:[3,4,5,6,7],
    M:[[0,1,"submit (not in CA-7)","m"],[1,2,"EXEC CBACT04C","m"],[2,3,"read next category balance","m"],[2,4,"READ account (new account)","m"],[2,5,"READ card for account","m"],
       [2,6,"READ rate · DEFAULT if missing","m"],[2,2,"balance × rate ÷ 1200","s"],[2,7,"WRITE interest txn 01/05","m"],[2,2,"fees — empty paragraph","s"],[2,4,"REWRITE + interest, cycle → 0","m"],[1,0,"COMBTRAN merges SYSTRAN later","r"]],
    F:[{at:6,p:[2,7],c:"#8A6D00",bg:"#FFF8DB",l:"opt [rate ≠ 0]"}] },
};
const LIFES = { daily:{name:"Daily transaction", sub:"received → posted or rejected"}, cycle:{name:"Account billing cycle", sub:"cycle totals · interest · statement"}, batch:{name:"Nightly batch chain", sub:"CA-7 · 15 jobs in order"} };
const BLASTS = {
  acctdata:{ name:"ACCTDATA — account master", short:["ACCT","DATA"], ev:"blastAcct", table:true,
    rings:[[1,[["TRAN",4],["ACCT",3],["AUTH",2],["MQ",1]]],[2,[["TRAN",4],["ACCT",4],["AUTH",3],["MQ",1]]]],
    inn:["POSTTRAN (posting)","INTCALC (interest)","CB00 (bill payment)","CREASTMT (statements)"], out:["CAVW · CAUP (account view / update)","READACCT · ACCTFILE (batch utilities)","CP00 · CPVS · CPVD (authorizations)","CDRA (MQ account inquiry)"] },
  cardxref:{ name:"CARDXREF — card cross-reference", short:["CARD","XREF"], ev:"blastXref", table:true,
    rings:[[1,[["TRAN",6],["ACCT",2],["AUTH",2],["CARD",1]]],[2,[["TRAN",6],["ACCT",2],["AUTH",3],["CARD",2],["Other",1]]]],
    inn:["POSTTRAN","INTCALC","TRANREPT","CREASTMT","CB00","CT02"], out:["CAVW · CAUP","CP00 · CPVS · CPVD","XREFFILE · READXREF","REPROC"] },
  tcatbalf:{ name:"TCATBALF — category balances", short:["TCAT","BALF"], ev:"blastTcat", table:true,
    rings:[[1,[["TRAN",2]]],[2,[["TRAN",2],["Other",2]]]],
    inn:["POSTTRAN (writes)","INTCALC (reads)"], out:["TCATBALF (reload job)","PRTCATBL (print job)"] },
  transact:{ name:"TRANSACT — transaction history", short:["TRAN","SACT"], ev:"blastTran", table:true,
    rings:[[1,[["TRAN",5]]],[2,[["TRAN",10],["Other",2]]]],
    inn:["POSTTRAN","CT00 · CT01 · CT02","CB00","CREASTMT","TRANREPT","COMBTRAN","TRANBKP","TRANFILE"], out:["REPROC","REPRTEST"] },
  csutldtc:{ name:"CSUTLDTC — date validation", short:["CSUT","LDTC"], ev:"blastDate",
    rings:[[1,[["TRAN",2],["ACCT",1]]],[2,[["TRAN",2],["ACCT",1]]]],
    inn:["CT02 (add transaction)","CR00 (report request)"], out:["CAUP (account update)"] },
};
const BLAST_COL = { TRAN:"#624ABB", ACCT:"#0C0613", CARD:"#0E7490", AUTH:"#CE6FCE", MQ:"#B54708", Other:"#C7C9E0" };
const BLAST_LBL = { TRAN:"Transactions & Billing", ACCT:"Accounts & Customers", CARD:"Cards", AUTH:"Pending Authorizations", MQ:"MQ Services", Other:"utility / test jobs" };
let seqSel = "posting", lifeSel = "daily", blastSel = "acctdata";
function setVariant(kind, key){ if(kind==="seq") seqSel=key; if(kind==="life") lifeSel=key; if(kind==="blast") blastSel=key; redrawDiag(); }
const blastTotal = b => b.rings.reduce((a,[,p])=>a+p.reduce((s,x)=>s+x[1],0),0);
const blastLabel = b => `${b.rings[0][1].reduce((s,x)=>s+x[1],0)} programs · ${b.inn.length+b.out.length} entry-point groups`;

function variantPicker(){
  const chips = (kind, entries, sel) => entries.map(([k,l,sub])=>`<button class="vchip ${k===sel?"on":""}" onclick="setVariant('${kind}','${k}')"><b>${esc(l)}</b><span>${esc(sub)}</span></button>`).join("");
  let label, list, ph;
  if (diagId==="sequence") { label="Flow"; ph="Generate for another job or transaction…"; list = chips("seq", Object.entries(SEQS).map(([k,s])=>[k,s.name,`${s.endpoint} · ${fmt(s.size)} objects`]), seqSel); }
  else if (diagId==="lifecycle") { label="Subject"; ph="Generate for another record, status field or job chain…"; list = chips("life", Object.entries(LIFES).map(([k,s])=>[k,s.name,s.sub]), lifeSel); }
  else if (diagId==="blast") { label="Object"; ph="Search any file, table, program or paragraph…"; list = chips("blast", Object.entries(BLASTS).map(([k,b])=>[k,b.name,blastLabel(b)]), blastSel); }
  else return "";
  return `<div class="vpick"><div class="vrow"><span class="vl">${label}</span>${list}</div>
    <div class="vrow2"><input class="vgen" placeholder="${ph}" onkeydown="if(event.key==='Enter')toast('On-demand generation from CAST Imaging is not wired up in this prototype')"><span class="vdom">Domain: <b>${SHOW_H}</b> · other domains on request</span></div></div>`;
}

function lifeSVG(key){
  const st = (x,y,l,c="#624ABB",w=150) => `<rect x="${x}" y="${y}" width="${w}" height="44" rx="22" fill="${c}"/><text x="${x+w/2}" y="${y+27}" text-anchor="middle" font-size="12" font-weight="700" fill="#fff">${l}</text>`;
  const head = `<defs><marker id="dak" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#0C0613"/></marker></defs>`;
  const arr = (d,c="#624ABB",dash) => `<path d="${d}" stroke="${c}" stroke-width="2" fill="none" ${dash?'stroke-dasharray="6 4"':""} marker-end="url(#${c==="#9A97A0"?"dahg":"dah"})"/>`;
  const lbl = (x,y,t,c="#463589",a="middle") => `<text x="${x}" y="${y}" text-anchor="${a}" font-size="10.5" font-weight="600" fill="${c}">${t}</text>`;
  if (key==="daily") return `<svg viewBox="0 0 880 360" font-family="Inter,sans-serif">${ARROW}${head}
      <circle cx="40" cy="120" r="9" fill="#0C0613"/><path d="M50,120 H88" stroke="#0C0613" stroke-width="2" marker-end="url(#dak)"/>
      ${st(90,98,"In daily file","#6D6A71",140)}${st(290,98,"Validated","#463589",140)}${st(500,40,"Posted","#067647",140)}${st(500,160,"Rejected","#C4320A",140)}${st(700,40,"In history","#624ABB",140)}
      ${arr("M230,120 H288")}${lbl(259,110,"POSTTRAN")}
      ${arr("M430,112 C470,90 470,64 498,62","#067647")}${lbl(462,70,"all checks pass","#067647")}
      ${arr("M430,128 C470,150 470,178 498,182","#C4320A")}${lbl(462,200,"100 · 101 · 102 · 103","#C4320A")}
      ${arr("M640,62 H698","#067647")}${lbl(669,52,"TRANSACT","#067647")}
      ${arr("M570,206 C570,250 180,250 160,146","#9A97A0",true)}${lbl(360,264,"fixed and resubmitted? (not in code)","#6D6A71")}
      ${st(90,290,"Keyed online (CT02)","#8A6D00",180)}${arr("M270,312 C600,312 760,200 770,86","#8A6D00",true)}${lbl(560,300,"straight into history — no validation (C-05)","#8A6D00")}
      ${st(290,290,"Interest (SYSTRAN)","#0E7490",170)}
      <text x="30" y="350" font-size="11" fill="#6D6A71">Interest transactions reach the history only when COMBTRAN merges SYSTRAN — a job outside the schedule (C-08).</text></svg>`;
  if (key==="cycle") return `<svg viewBox="0 0 880 360" font-family="Inter,sans-serif">${ARROW}${head}
      ${st(60,60,"Cycle open","#624ABB",150)}${st(330,60,"Interest charged","#463589",170)}${st(620,60,"Cycle closed","#0C0613",150)}${st(620,200,"Statement","#067647",150)}${st(60,200,"Balance paid","#C4320A",150)}
      ${arr("M210,82 H328")}${lbl(269,72,"INTCALC · monthly")}${lbl(269,106,"not in CA-7 (C-08)","#B42318")}
      ${arr("M500,82 H618")}${lbl(559,72,"cycle credit, debit → 0")}
      ${arr("M695,104 V198","#067647")}${lbl(705,160,"CREASTMT → PDF","#067647","start")}
      ${arr("M620,230 C400,300 200,300 140,106","#9A97A0",true)}${lbl(380,300,"next cycle","#6D6A71")}
      ${arr("M135,104 V198","#C4320A")}${lbl(145,160,"CB00 — full balance","#C4320A","start")}
      ${arr("M210,222 C280,230 300,120 330,104","#C4320A",true)}${lbl(300,250,"category balances unchanged — interest still charged? (C-04)","#C4320A","start")}
      <text x="60" y="30" font-size="11" fill="#6D6A71">During the cycle, posting adds charges to cycle credit and credits to cycle debit; the limit check reads these totals (C-01).</text></svg>`;
  const jobs = ["CLOSEFIL","CBPAUP0J","POSTTRAN","WAITSTEP","CLOSEFIL1","CLOSEFIL2","TRANCATG","TCATBALF","READACCT","READCARD","READCUST","READXREF","CREASTMT","TXT2PDF1","PRTCATBL","OPENFIL"];
  const hot = { CBPAUP0J:"#CE6FCE", POSTTRAN:"#624ABB", CREASTMT:"#067647", TXT2PDF1:"#067647" };
  let s = `<svg viewBox="0 0 900 330" font-family="Inter,sans-serif">${ARROW}`;
  jobs.forEach((j,i)=>{ const row = i<8?0:1, col = row ? 15-i : i, x = 20+col*110, y = 40+row*130;
    s += `<rect x="${x}" y="${y}" width="96" height="40" rx="20" fill="${hot[j]||"#fff"}" stroke="${hot[j]||"#C7C9E0"}"/><text x="${x+48}" y="${y+25}" text-anchor="middle" font-size="10.5" font-weight="700" fill="${hot[j]?"#fff":"#0C0613"}">${j}</text>`;
    if (i<jobs.length-1 && i!==7) s += row ? arr(`M${x},${y+20} H${x-12}`) : arr(`M${x+96},${y+20} H${x+108}`);
  });
  s += arr("M838,80 C880,110 880,150 838,170") + `<text x="20" y="250" font-size="11" fill="#6D6A71">Purple: posting · pink: purge of expired authorizations · green: statements. Files are closed to CICS before the batch and reopened after.</text>
    <rect x="20" y="268" width="860" height="44" rx="10" fill="#FEF3F2" stroke="#B42318" stroke-dasharray="5 3"/><text x="36" y="295" font-size="11.5" font-weight="700" fill="#B42318">Not in this chain: INTCALC (interest) · COMBTRAN (merge interest into history) · TRANREPT (report) · TRANBKP (backup)</text></svg>`;
  return s;
}
const LIFE_MERMAID = {
  daily: () => `stateDiagram-v2
  [*] --> InDailyFile
  InDailyFile --> Validated: POSTTRAN
  Validated --> Posted: all checks pass
  Validated --> Rejected: 100 / 101 / 102 / 103
  Posted --> InHistory: WRITE TRANSACT
  [*] --> KeyedOnline: CT02
  KeyedOnline --> InHistory: no validation (C-05)
  [*] --> InterestTxn: INTCALC
  InterestTxn --> InHistory: COMBTRAN (not scheduled, C-08)`,
  cycle: () => `stateDiagram-v2
  [*] --> CycleOpen
  CycleOpen --> InterestCharged: INTCALC (not in CA-7)
  InterestCharged --> CycleClosed: cycle credit/debit reset to 0
  CycleClosed --> Statement: CREASTMT -> TXT2PDF1
  Statement --> CycleOpen: next cycle
  CycleOpen --> BalancePaid: CB00 full balance
  note right of BalancePaid
    category balances unchanged (C-04)
  end note`,
  batch: () => `flowchart LR
  CLOSEFIL --> CBPAUP0J --> POSTTRAN --> WAITSTEP --> CLOSEFIL1 --> CLOSEFIL2 --> TRANCATG --> TCATBALF
  TCATBALF --> READACCT --> READCARD --> READCUST --> READXREF --> CREASTMT --> TXT2PDF1 --> PRTCATBL --> OPENFIL
  %% not scheduled: INTCALC, COMBTRAN, TRANREPT, TRANBKP`,
};

function blastSVG(b){
  const cx=220, cy=220, RS=78; let s = `<svg viewBox="0 0 440 440" font-family="Inter,sans-serif">`;
  b.rings.forEach(([h])=> s += `<circle cx="${cx}" cy="${cy}" r="${h*RS}" fill="none" stroke="#E6E4EA"/><text x="${cx+h*RS-4}" y="${cy-4}" text-anchor="end" font-size="10" fill="#9A97A0">${h===1?"programs":"entry points"}</text>`);
  b.rings.forEach(([h,parts])=>{ const n = parts.reduce((a,x)=>a+x[1],0); let k=0;
    parts.forEach(([d,c])=>{ for(let j=0;j<c;j++){ const a = -Math.PI/2 + (k++ + 0.5)*2*Math.PI/n + h*0.3; s += `<circle cx="${(cx+h*RS*Math.cos(a)).toFixed(1)}" cy="${(cy+h*RS*Math.sin(a)).toFixed(1)}" r="8" fill="${BLAST_COL[d]}" stroke="#fff" stroke-width="1.5"><title>${BLAST_LBL[d]}</title></circle>`; } }); });
  s += `<circle cx="${cx}" cy="${cy}" r="34" fill="#C4320A"/><text x="${cx}" y="${cy-2}" text-anchor="middle" font-size="10" font-weight="700" fill="#fff">${b.short[0]}</text><text x="${cx}" y="${cy+11}" text-anchor="middle" font-size="10" font-weight="700" fill="#fff">${b.short[1]}</text></svg>`;
  const used = [...new Set(b.rings.flatMap(([,p])=>p.map(x=>x[0])))];
  return `<div class="blastwrap"><div>${s}
    <div class="clegend">${used.map(d=>`<span><i style="background:${BLAST_COL[d]}"></i>${BLAST_LBL[d].replace("&","&amp;")}</span>`).join("")}<span>inner ring = ${b.table?"programs that read or write it":"programs that call it"} · outer ring = entry points</span></div>
    <p style="font-size:12.5px;color:var(--muted)">Focus: <code>${esc(b.name)}</code></p></div>
    <div class="txlist"><h5>Entry points in ${SHOW_H} (${b.inn.length})</h5><ul>${b.inn.map(t=>`<li>${t}</li>`).join("")}</ul>
    ${b.out.length?`<h5 style="color:var(--high)">Outside ${SHOW_H} (${b.out.length})</h5><ul class="out">${b.out.map(t=>`<li>${t}</li>`).join("")}</ul>`:`<h5 style="color:var(--good)">No entry points outside ${SHOW_H}</h5>`}</div></div>`;
}
function blastMermaid(b){
  const L = ["flowchart RL", `  target((${b.name}))`];
  b.rings.forEach(([h,p],i)=>{ const n = p.reduce((a,x)=>a+x[1],0); L.push(`  h${h}[${h===1?"programs":"entry points"} · ${n}<br/>${p.map(x=>BLAST_LBL[x[0]]+" "+x[1]).join(" · ")}] --> ${i?"h"+(h-1):"target"}`); });
  L.push(`  subgraph eps[entry points]`, `    inD[${b.inn.join(" · ")}]`, `    outD[${b.out.join(" · ")||"none outside the domain"}]`, "  end", "  target -.-> eps");
  return L.join("\n");
}
function collapseLabel(d){
  if (d[0]==="sequence") { const S = SEQS[seqSel]; return `${fmt(S.size)} objects → ${S.P.length} participants`; }
  if (d[0]==="lifecycle") return LIFES[lifeSel].sub;
  if (d[0]==="blast") return blastLabel(BLASTS[blastSel]);
  return d[4];
}
const SEQ_TAKE = {
  posting: () => [
    X("Posting reads the daily file one record at a time, checks the card and the account, and either writes a reject with a reason or posts to three files.","postMain","postParas"),
    X("The three posting writes — category balance, account, transaction — happen one after another with no rollback; a failed account rewrite still ends in a written transaction.","postTran","postUpd"),
    X("The job is fired by CA-7 after the authorization purge (CBPAUP0J) and ends with return code 4 when anything was rejected.","schedule","postMain"),
    I("Because the unit of work is the whole file, a restart after an abend needs care: part of the file may already be posted.","No checkpoint or restart logic appears in the posting paragraphs; operations may handle it outside the code.","postMain")],
  billpay: () => [
    X("A payment reads the account, checks there is something to pay and that the user confirmed, then writes a payment transaction and rewrites the balance.","billPay"),
    X("The new transaction ID comes from reading the highest ID in the file and adding 1.","billPay"),
    I("Two users paying at the same moment can collide on the same ID, and the category balances that interest uses are left unchanged (C-07, C-04).","Reading of the ID logic and of the files the program writes.","billPay","crud")],
  interest: () => [
    X("Interest walks the category-balance file account by account, looks up the rate by group, type and category, and writes one interest transaction per category.","intMain","intRate","intWrite"),
    X("When it moves to the next account it adds the interest to the balance and resets the cycle totals — that is the cycle close.","intUpd"),
    X("The fee step runs every time but does nothing, and the job is not in the CA-7 schedule.","intFees","schedule")],
};
const LIFE_TAKE = {
  daily: () => [
    X("A daily transaction is either posted into the history or rejected with one of four reason codes.","postMain","postXref","postAcct"),
    X("Transactions keyed online on CT02 reach the same history without any of the posting checks.","addTran"),
    I("Nothing in the code resubmits a rejected transaction — correcting rejects is a manual or external process to capture.","No program reads the rejects file back.","crud","postMain")],
  cycle: () => [
    X("Posting accumulates charges and credits in the account's cycle totals; interest adds the charge to the balance and resets both totals to zero.","postUpd","intUpd"),
    X("Statements follow each night in the CA-7 chain; interest runs outside it.","schedule"),
    I("A payment settles the balance but not the category balances, so the next interest run can still charge interest on money already paid (C-04).","Comparison of the files written by COBIL00C and read by CBACT04C.","billPay","intCalc")],
  batch: () => [
    X("The CA-7 chain runs 15 jobs in order: close files to CICS, purge expired authorizations, post, reload reference files, read-back checks, statements, PDF, category-balance print, reopen files.","schedule"),
    X("Interest, its merge into the history, the transaction report and the backup are not in the chain.","schedule"),
    I("Online is unavailable between CLOSEFIL and OPENFIL — the batch window the target must still meet or remove.","Implied by jobs that close and reopen the CICS files around the batch.","schedule")],
};
const BLAST_TAKE = {
  acctdata: () => [
    X("10 programs read or write the account master, in four domains, and 12 entry points reach it.","blastAcct","crud"),
    X("It is written online by account update and bill payment, and in batch by posting and interest.","crud"),
    I("Any change to the account record layout or its balance rules touches authorizations and MQ inquiries too — and concurrent online and batch writers make it the hardest file to migrate.","Scope and concurrency implication of the extracted accessor list.","blastAcct")],
  cardxref: () => [
    X("11 programs read the card cross-reference and 14 entry points reach it — the most-read file in the application.","blastXref"),
    I("A read-mostly file loaded by batch utilities is a good candidate for an early move to a shared lookup service or table.","Access pattern (reads only) inferred as low-risk to relocate.","blastXref","crud")],
  tcatbalf: () => [
    X("Only posting (writes) and interest (reads) use the category-balance file, plus a reload and a print job.","blastTcat"),
    I("The file is small in blast radius but large in consequence: it is what interest is charged on, and bill payment never updates it (C-04).","Link between the extracted accessors and the payment behaviour.","blastTcat","billPay")],
  transact: () => [
    X("Five programs use the transaction history directly; 12 entry points reach it, all but two inside the domain.","blastTran"),
    I("The history is the domain's own file — it can move with Transactions &amp; Billing as a unit.","Most accessors and entry points are inside the domain.","blastTran")],
  csutldtc: () => [
    X("The date-validation routine is called from add-transaction, the report request and account update.","blastDate","nav"),
    I("A shared utility with three callers in two domains — convert it once, as a library, before either domain moves.","Reuse implication of the caller list.","blastDate")],
};
const DIAG_FILES = DIAGS.map((d,i)=>[`diagrams/${String(i+1).padStart(2,"0")}-${d[0]}.md`, () =>
  `# ${d[1]}\n\n**Question:** ${d[2]}  \n**Scope:** ${d[3]} · ${d[4]}  \n_Generated by CAST ${PRODUCT} from CAST Imaging · ${APP} · snapshot ${SYSTEM.snapshot}_\n\n\`\`\`mermaid\n${MERMAID[d[0]]()}\n\`\`\`\n`]);
DIAG_FILES.splice(4, 3,
  ...Object.entries(SEQS).map(([k,S])=>[`diagrams/05-flow-${k}.md`, () => `# Job & screen flow — ${S.name}\n\n**Entry point:** ${S.endpoint} · ${fmt(S.size)} objects → ${S.P.length} participants\n\n\`\`\`mermaid\n${seqMermaid(S)}\n\`\`\`\n`]),
  ...Object.entries(LIFES).map(([k,L])=>[`diagrams/06-lifecycle-${k}.md`, () => `# Lifecycle — ${L.name}\n\n${L.sub}\n\n\`\`\`mermaid\n${LIFE_MERMAID[k]()}\n\`\`\`\n`]),
  ...Object.entries(BLASTS).map(([k,b])=>[`diagrams/07-blast-${k}.md`, () => `# Blast radius — ${b.name}\n\n${blastLabel(b)}\n\n\`\`\`mermaid\n${blastMermaid(b)}\n\`\`\`\n`]));
