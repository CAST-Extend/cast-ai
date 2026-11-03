/* =====================================================================
   TECHNICAL DEBT
   ===================================================================== */
Object.assign(EV, {
  debtDom: { title:"Findings by program, grouped by domain", call:"run_cypher_query — (object)-[:MANIFESTS]->(Insight) rolled up to its COBOL program, grouped by Insight.Type", rows:[
    ["Highest programs","COACTUPC 50 · COTRTLIC 44 · CBSTM03A 40 · CBTRN02C 31 · CBACT04C 31 · CBTRN03C 30 · COTRTUPC 28"],
    ["Transactions & Billing (11 programs)","55 quality · 4 structural · 166 cloud"],["Accounts & Customers (4)","29 quality · 74 cloud"],["Transaction Types (3 + 2 tables)","42 quality · 1 structural · 41 cloud"],
    ["Pending Authorizations (8)","35 quality · 5 structural · 72 cloud"],["Cards (5)","35 quality · 1 structural · 54 cloud"]],
    note:"Density = findings per program in the domain. Cloud boosters (DB2, IMS/MQ connections) are not counted as debt." },
  ctxSecurity: { title:"Sign-on and user data", call:"run_cypher_query — COSGN00C and COUSR0xC access to USRSEC · stats(data sensitivity)", rows:[
    ["COSGN00C (sign-on)","reads USRSEC"],["COUSR01C–03C (user admin)","write USRSEC"],["RACFCMDS","sample JCL job present"],["Data sensitivity level reported","Sensitive Data"]]},
});

const DEBT_DOMS = [ // id, quality, green, security (structural flaws), cloud blockers, money path
  ["TRAN",55,0,4,166,true],["ACCT",29,0,0,74,true],["CARD",35,0,1,54,true],["AUTH",35,0,5,72,false],["TTYP",42,0,1,41,false],
  ["MQ",12,0,0,11,false],["SIGN",16,8,0,6,false],["USER",16,0,0,18,false],["UTIL",1,0,0,4,false],
];
/* [id, theme, title, what (extracted), why (inferred), impact H|M|L, effort S|M|L, priority, quickWin, domains[], ev[], clar[] ] */
const DEBT = [
  ["TD-01","Correctness","Defects in the money logic","Over-limit test on cycle totals; posting without rollback; payments not reflected in category balances; fees never implemented; payments stored with the charge sign.","These change what customers are charged. A like-for-like migration would carry every one of them into the new platform.","H","M","P1",false,["TRAN"],["postAcct","postUpd","billPay","intFees"],["C-01","C-03","C-04","C-06","C-09"]],
  ["TD-02","Reliability","Unchecked return codes and file conditions","25 objects do not check CICS return codes; 10 READs have no AT END or INVALID KEY; one file has no FILE STATUS; one opened file is never closed.","Failures pass silently — the program carries on with stale or empty data.","H","S","P1",true,["TRAN","ACCT","CARD","USER"],["iso"],[]],
  ["TD-03","Reliability","Truncation and overflow in money fields","33 objects truncate data in MOVE statements, 22 build strings without an overflow check and 11 do arithmetic in loops without ON SIZE ERROR — including posting, interest, the report and statements.","Amounts and identifiers can be cut or wrap without an error, exactly where money is calculated.","H","M","P1",false,["TRAN","AUTH"],["iso","flaws"],[]],
  ["TD-04","Security","Vulnerability and middleware review not done","The CVE scan returned 0 findings because it was not configured; CardDemo runs on CICS, DB2, IMS and MQ levels that were not assessed.","Zero means “not looked at”. Middleware levels and their patches belong in the risk picture before a migration decision.","H","S","P1",true,["TRAN","AUTH","MQ"],["cve"],[]],
  ["TD-05","Reliability","Working storage read before it is set","22 objects read WORKING-STORAGE variables that were never initialized.","Results depend on leftover memory — a classic source of “works on the mainframe, fails after conversion”.","M","S","P2",true,["TRAN","ACCT","AUTH"],["iso"],[]],
  ["TD-06","Security","Application-managed sign-on","Sign-on (COSGN00C) validates users against the application's own USRSEC file, which the user-admin screens maintain.","Identity lives inside the application rather than in the platform's security manager — it has to move to the target's identity service.","M","M","P2",false,["SIGN","USER"],["ctxSecurity","crud"],[]],
  ["TD-07","Correctness","Transaction IDs from “last + 1”","Bill payment and add-transaction read the highest ID in the file and add 1.","Collides under concurrency today, and collides more once the online layer scales out.","M","S","P2",true,["TRAN"],["billPay","addTran"],["C-07"]],
  ["TD-08","Architecture","One account file, two owning domains","ACCTDATA is written by account update (online), bill payment (online), posting and interest (batch) — 10 programs and 12 entry points.","Blocks both online/batch concurrency in the target and any split into services until balances have a single owner.","H","L","P2",false,["TRAN","ACCT"],["crud","blastAcct"],[]],
  ["TD-09","Operations","Batch outside the scheduler","INTCALC, COMBTRAN, TRANREPT and TRANBKP are not in the CA-7 chain; 9 shell scripts exist beside it.","Month-end depends on undocumented operational steps that must be captured before the batch moves.","M","S","P2",true,["TRAN"],["schedule"],["C-08"]],
  ["TD-10","Cloud readiness","Control-flow blockers","Code that can be skipped by fall-through (235 objects), GOTO (97), GOTO out of a PERFORM range (3), cyclic PERFORM (3) and ALTER (2).","Refactoring tools restructure most of this automatically; ALTER and cyclic PERFORMs need a person to confirm intent.","M","M","P2",false,["TRAN","ACCT","CARD","AUTH"],["cloud","iso"],[]],
  ["TD-11","Cloud readiness","Mainframe data representations","Binary fields (81 objects), REDEFINES (51), OCCURS (28), packed decimal (7).","Decimal and overlay semantics must be reproduced exactly — the most common source of penny differences after conversion.","M","M","P2",false,["TRAN","ACCT","CARD","AUTH","TTYP"],["cloud"],[]],
  ["TD-12","Cloud readiness","IMS DL/I calls","12 objects issue DL/I calls to the pending-authorization database; 2 use SYSIBM.SYSDUMMY1.","IMS has no like-for-like cloud equivalent — the authorization data model needs a decision.","H","M","P2",false,["AUTH","TTYP"],["cloud","data"],[]],
  ["TD-13","Maintainability","Complex and oversized code","31 objects with high cyclomatic complexity, 14 large paragraphs, 5 large programs, 8 EVALUATEs without WHEN OTHER, high fan-out (6) and fan-in (3).","Concentrated in a handful of programs (COACTUPC, COTRTLIC, CBSTM03A) — the ones to test hardest.","M","M","P3",false,["ACCT","TTYP","TRAN"],["iso","debtDom"],[]],
  ["TD-14","Maintainability","Dead and duplicated logic","13 unreferenced sections or paragraphs; an empty fee paragraph; transaction types kept both in VSAM files and in DB2 tables.","Removing or consolidating it before conversion shrinks what has to be converted and tested.","M","S","P2",true,["TRAN","TTYP"],["iso","intFees","crud"],["C-06"]],
  ["TD-15","Efficiency","DB2 access hygiene","3 redundant indexes; TRANSACTION_TYPE inserted, updated and deleted from several programs.","Minor today; worth fixing as part of the DB2 migration.","L","S","P3",true,["TTYP"],["iso"],[]],
  ["TD-16","Efficiency","String building in loops","4 objects in the menu programs concatenate strings inside loops.","Negligible cost on its own; fixed for free during conversion.","L","S","P3",true,["SIGN"],["green"],[]],
];
let debtView = "where", debtTheme = "All";
function setDebt(v,t){ if(v) debtView=v; if(t!==undefined) debtTheme=t; document.getElementById("doc").innerHTML = techDebt(); paintGrounding(); }
const domLabel = id => ((DOMS.find(d=>d[0]===id)||[id,id])[1]).replace("&","&amp;");

function techDebt(){
  STMTS = []; debtWhere(); debtRegister(true); const all = STMTS; STMTS = [];
  const body = { where:debtWhere, register:()=>debtRegister(false), plan:debtPlan }[debtView]();
  STMTS = all;
  const p1 = DEBT.filter(d=>d[7]==="P1").length, qw = DEBT.filter(d=>d[8]).length;
  return `
  <div class="doc-head"><div><div class="eyebrow">Technical Debt · as-is</div><h1>${APP}</h1>
    <div class="meta">ISO 5055, cloud-readiness, green-IT and structural findings, mapped to 9 business domains · snapshot ${SYSTEM.snapshot}</div></div>
    <div class="doc-actions"><button class="btn btn-primary btn-sm" onclick="openExport(DEBT_FILES,'Debt register','Import the register into Jira or Azure DevOps, or hand the Markdown to an AI agent to plan remediation.')">Export for agents</button>
    <button class="btn btn-ghost btn-sm" onclick="toast('Export is not wired up in this prototype')">Export PDF</button></div></div>
  <div class="rkpis">
    <div class="kpi" onclick="openEvidence(['iso'])"><div class="v">242</div><div class="l">ISO 5055 occurrences</div><div class="s">23 rules · 58 objects</div></div>
    <div class="kpi" onclick="setDebt('register','Cloud readiness')"><div class="v">515</div><div class="l">Cloud-blocker occurrences</div><div class="s">368 objects</div></div>
    <div class="kpi" onclick="openEvidence(['cve'])"><div class="v">—</div><div class="l">Known vulnerabilities</div><div class="s" style="color:var(--inferred)">CVE scan not configured</div></div>
    <div class="kpi" onclick="setDebt('plan')"><div class="v">${qw}</div><div class="l">Quick wins</div><div class="s" style="color:var(--good)">${p1} items are priority 1</div></div>
  </div>
  <div class="grounding" id="grounding"></div>
  <div class="tabs">
    <button class="tab ${debtView==="where"?"on":""}" onclick="setDebt('where')">Where the debt is</button>
    <button class="tab ${debtView==="register"?"on":""}" onclick="setDebt('register')">Debt register <span class="cnt" style="background:#F2F0F5;color:#4B4652">${DEBT.length}</span></button>
    <button class="tab ${debtView==="plan"?"on":""}" onclick="setDebt('plan')">Quick wins vs. structural</button>
  </div>
  ${body}`;
}
function debtWhere(){
  const rows = DEBT_DOMS.map(d=>{ const sz = DOMS.find(x=>x[0]===d[0])[3]; const tot = d[1]+d[2]+d[3]+d[4]; return {id:d[0], q:d[1], g:d[2], s:d[3], c:d[4], rev:d[5], tot, dens: Math.round(tot/sz*10)/10}; }).sort((a,b)=>b.dens-a.dens);
  const max = rows[0].dens;
  return `
  <p style="margin-top:22px">${X("Every finding CAST reports is attached to the paragraph, section or program that carries it; rolling those up to programs and programs to domains shows where the debt sits.","debtDom","insights")}
     ${I("Density — findings per program — is fairer than raw counts because it does not simply reward the biggest domain.","A normalization choice; raw counts are shown alongside.","debtDom")}</p>
  <div class="tblwrap"><table class="tbl heat"><thead><tr><th>Domain</th><th style="text-align:right">Quality</th><th style="text-align:right">Efficiency</th><th style="text-align:right">Structural</th><th style="text-align:right">Cloud</th><th style="text-align:right">Total</th><th>Per program</th></tr></thead><tbody>
  ${rows.map(r=>`<tr><td><b>${domLabel(r.id)}</b>${r.rev?'<span class="rev">MONEY PATH</span>':""}</td><td class="h">${r.q}</td><td class="h">${r.g}</td><td class="h" style="${r.s>=4?"color:var(--crit);font-weight:700":""}">${r.s}</td><td class="h">${r.c}</td><td class="h"><b>${r.tot}</b></td>
    <td class="d"><div class="dbar"><b>${r.dens}</b><i class="${r.rev&&r.dens>=20?"hot":""}" style="width:${Math.round(r.dens/max*120)}px"></i></div></td></tr>`).join("")}
  </tbody></table></div>
  <p style="font-size:12.5px;color:var(--muted);margin-top:8px">Quality = ISO 5055 weaknesses · Efficiency = green-IT patterns · Structural = structural flaws · Cloud = cloud-readiness blockers. Copybooks, maps and utility jobs are not attributed to a domain.</p>
  <div class="takeaways" style="border:1px solid var(--line);border-radius:var(--radius);margin-top:16px"><h4>What this shows</h4><ul>
    <li>${X("Transaction Types and Accounts &amp; Customers are the densest domains — about 28 and 26 findings per program — driven by two programs: COTRTLIC (44) and COACTUPC (50).","debtDom")}</li>
    <li>${X("Transactions &amp; Billing carries the most findings in absolute terms (225) and 4 of the 11 structural flaws, in posting, interest, the report and statements.","debtDom","flaws")}</li>
    <li>${X("Cloud blockers make up two-thirds of all debt: 515 of 777 occurrences.","insights")}</li>
    <li>${I("Most of that cloud debt is mechanical and handled by conversion tools; the debt that needs people is in the money path — correctness, truncation and unchecked return codes.","Prioritization judgment built on the type of finding, not just its count.","debtDom","iso")}</li>
  </ul></div>`;
}
function debtPlan(){
  const cell = (imp,eff) => DEBT.filter(d=>d[5]===imp&&d[6]===eff).map(d=>`<span class="mdot ${d[7]}" title="${d[2]}" onclick="debtTheme='All';setDebt('register');setTimeout(()=>document.getElementById('td-${d[0]}')?.scrollIntoView({block:'center'}),50)">${d[0]}</span>`).join("");
  const lbl = { "H,S":"Do first", "H,M":"Plan now", "H,L":"Structural programme", "M,S":"Quick wins", "M,M":"Schedule", "L,S":"Opportunistic" };
  const cls = { "H,S":"best", "M,S":"best", "H,M":"plan", "H,L":"plan" };
  const rows = ["H","M","L"].map(imp=>`<div class="ax">${{H:"High",M:"Medium",L:"Low"}[imp]}</div>` + ["S","M","L"].map(eff=>`<div class="mcell ${cls[imp+","+eff]||""}"><span class="lbl">${lbl[imp+","+eff]||""}</span>${cell(imp,eff)}</div>`).join("")).join("");
  const qw = DEBT.filter(d=>d[8]);
  return `
  <p style="margin-top:22px">${I("Placing each item by business impact and remediation effort separates what a team can fix before conversion from what the conversion itself should absorb.","Impact and effort are assessments of the extracted findings.","iso","cloud")}</p>
  <div class="matrix">${rows}<div></div><div class="ax">Small effort</div><div class="ax">Medium effort</div><div class="ax">Large effort</div></div>
  <h2>Quick wins (${qw.length})</h2>
  <div class="tblwrap"><table class="tbl"><thead><tr><th>ID</th><th>Item</th><th>Priority</th><th>Why now</th></tr></thead><tbody>
    ${qw.map(d=>`<tr><td class="m">${d[0]}</td><td><b>${d[2]}</b></td><td><span class="pr ${d[7]}">${d[7]}</span></td><td style="font-size:13.5px">${esc(d[4])}</td></tr>`).join("")}
  </tbody></table></div>
  <p style="font-size:13px;color:var(--muted);margin-top:10px">Cloud-readiness items TD-10 and TD-11 are absorbed by the conversion approach chosen in the Target State Architecture; TD-08 and TD-12 are design decisions, not sprint work.</p>`;
}
function mdDebt(){
  const lvl = {H:"High",M:"Medium",L:"Low"}, efl = {S:"Small",M:"Medium",L:"Large"}, dl = id => (DOMS.find(d=>d[0]===id)||[id,id])[1];
  const L = [`# Technical Debt Register — ${APP} (as-is)`,"",`Generated by CAST ${PRODUCT} from CAST Imaging · snapshot ${SYSTEM.snapshot}`,"","Findings are extracted from CAST Imaging. Impact, effort and priority are an assessment for the team to adjust.",""];
  [...new Set(DEBT.map(d=>d[1]))].forEach(t=>{ L.push(`## ${t}`,"");
    DEBT.filter(d=>d[1]===t).forEach(d=>L.push(`### ${d[0]} — ${d[2]}`,"",`- **Finding**: ${d[3]}`,`- **Why it matters**: ${d[4]}`,`- **Priority**: ${d[7]}${d[8]?" · quick win":""} · Impact ${lvl[d[5]]} · Effort ${efl[d[6]]}`,`- **Domains**: ${d[9].map(dl).join(", ")}${d[11].length?` · **Clarifications**: ${d[11].join(", ")}`:""}`,"")); });
  return L.join("\n");
}
function csvDebt(){
  const q = v => `"${String(v).replace(/"/g,'""')}"`, dl = id => (DOMS.find(d=>d[0]===id)||[id,id])[1];
  const rows = [["Issue Type","Issue key","Summary","Description","Priority","Labels"]];
  DEBT.forEach(d=>rows.push(["Task",d[0],d[2],`${d[3]}\n\nWhy it matters: ${d[4]}\nImpact: ${d[5]} · Effort: ${d[6]}\nDomains: ${d[9].map(dl).join(", ")}`,{P1:"Highest",P2:"High",P3:"Medium"}[d[7]],["tech-debt",d[1].toLowerCase().replace(/ /g,"-"),d[8]?"quick-win":""].filter(Boolean).join(" ")]));
  return rows.map(r=>r.map(q).join(",")).join("\n");
}
const DEBT_FILES = [["debt/technical-debt-register.md", mdDebt],["debt/jira-import.csv", csvDebt]];

/* =====================================================================
   CUSTOMER CONTEXT — inputs the code can't provide (mainframe edition)
   ===================================================================== */
const DK = "Don't know";
const CTX_GROUPS = [
  ["current","Current state","How and where the application runs today."],
  ["usage","Volumes & usage","Who uses it and how much it processes."],
  ["target","Target direction","Where the customer wants to go, and how."],
  ["drivers","Business drivers","Why modernize — ranked. Weights the Well-Architected pillars."],
  ["nfr","Non-functional targets","Service levels the target must meet."],
  ["constraints","Constraints","Limits the plan has to respect."],
];
const CTX_FIELDS = [
  ["stack","current","Application stack","Detected by CAST — confirm it is complete.","info",[], {v:"COBOL · CICS · JCL / CA-7 · VSAM · DB2 · IMS DB · IBM MQ · Assembler", src:"detected", ev:["stats","data"]}],
  ["cur_platform","current","Platform today","","one",["IBM z/OS on-premises","Outsourced mainframe","Already rehosted off the mainframe",DK]],
  ["mips","current","Capacity used (MIPS)","Share of the mainframe this application consumes.","one",["< 100","100–500","500–2,000","> 2,000",DK]],
  ["batch_window","current","Batch window","CAST found a nightly CA-7 chain that closes the online files while it runs.","one",["< 2 h","2–4 h","4–8 h","> 8 h",DK]],
  ["cur_envs","current","Environments","","one",["1","2","3","4+",DK]],
  ["cur_cost","current","Annual run cost of this application","Share of mainframe hardware, software licenses, operations and outsourcing.","one",["< $250K","$250K–1M","$1M–3M","> $3M",DK]],
  ["contract","current","Mainframe contract renewal","","one",["< 12 months","12–24 months","> 24 months","No contract pressure",DK]],

  ["users_peak","usage","Concurrent online users","","one",["< 50","50–250","250–1,000","> 1,000",DK]],
  ["accounts","usage","Card accounts","","one",["< 100K","100K–1M","1M–10M","> 10M",DK]],
  ["tx_day","usage","Transactions posted per day","","one",["< 100K","100K–1M","1M–10M","> 10M",DK]],
  ["db_size","usage","Data volume (VSAM + DB2 + IMS)","27 data stores detected — size is not visible in code.","one",["< 50 GB","50–250 GB","250 GB–1 TB","> 1 TB",DK]],
  ["peaks","usage","Month-end or seasonal peak","","one",["None","2×","5×","10× or more",DK]],
  ["regions","usage","Regions served","","many",["North America","Europe","APAC","LATAM"]],
  ["channels","usage","Channels needed in the target","Today only 3270 screens, batch files and MQ exist.","many",["3270 screens only","Web UI for staff","APIs for partners","Customer self-service"]],

  ["tgt_cloud","target","Target cloud","CardDemo is AWS's public mainframe-modernization sample, but any provider applies.","one",["AWS","Azure","GCP","Stay on the mainframe","Undecided"]],
  ["tgt_approach","target","Modernization approach","","one",["Replatform — keep COBOL on a cloud runtime","Automated refactor to Java","Rewrite / re-architect","Hybrid — move online, keep batch","Undecided"]],
  ["tgt_managed","target","Managed vs. portable","","one",["Prefer managed cloud services","Balanced","Prefer portable (Kubernetes)",DK]],

  ["drivers","drivers","Top 3 drivers","Click in order of importance.","rank",["Mainframe cost / contract exit","Skills & retirement risk","Agility / delivery speed","Resilience","Security & compliance","Scalability"]],

  ["availability","nfr","Availability target","","one",["99.5%","99.9%","99.95%","99.99%",DK]],
  ["rto","nfr","Recovery targets (RTO / RPO)","","one",["4 h / 1 h","1 h / 15 min","15 min / near zero",DK]],
  ["perf","nfr","Online response time","","one",["< 1 s","< 2 s","< 5 s",DK]],

  ["compliance","constraints","Compliance","Card numbers are stored in the cross-reference and transaction files; Imaging classifies the data as sensitive.","many",["PCI DSS","SOX","GDPR","Data residency","None"], {v:["PCI DSS"], src:"suggested", why:"Card numbers in CARDXREF and TRANSACT records; data sensitivity reported as “Sensitive Data”.", ev:["stats","postXref"]}],
  ["budget","constraints","Budget range","","one",["< $250K","$250K–1M","$1M–3M","> $3M",DK]],
  ["deadline","constraints","Deadline","","one",["< 6 months","6–12 months","12–24 months","No fixed date"]],
  ["team_size","constraints","Team size","","one",["1–5","6–15","16–40","40+",DK]],
  ["team_skills","constraints","Team skills","","many",["COBOL / CICS","Mainframe operations","Java","AWS","Azure","GCP","DevOps / CI-CD"]],
  ["keep_int","constraints","Interfaces that must stay","Detected in code — select the ones consumers still depend on.","many",["MQ account and date inquiries","Daily transaction file","Statement PDFs","Transaction report","FTP transfers"], {v:[], src:"detected", ev:["data","schedule"]}],
  ["notes","constraints","Anything else","Free text — goes into every Plan section as context.","text",[]],
];
const CTX_DEMO = {
  cur_platform:"IBM z/OS on-premises", mips:"100–500", batch_window:"2–4 h", cur_envs:"3", cur_cost:"$250K–1M", contract:"12–24 months",
  users_peak:"50–250", accounts:"1M–10M", tx_day:"100K–1M", db_size:"50–250 GB", peaks:"2×", regions:["North America"], channels:["Web UI for staff","APIs for partners"],
  tgt_cloud:"AWS", tgt_approach:"Automated refactor to Java", tgt_managed:"Prefer managed cloud services",
  drivers:["Mainframe cost / contract exit","Skills & retirement risk","Resilience"],
  availability:"99.95%", rto:"1 h / 15 min", perf:"< 2 s",
  compliance:["PCI DSS","SOX"], budget:"$250K–1M", deadline:"12–24 months", team_size:"6–15", team_skills:["COBOL / CICS","Mainframe operations","Java","DevOps / CI-CD"],
  keep_int:["MQ account and date inquiries","Daily transaction file","Statement PDFs"], notes:"The mainframe contract renews in about 20 months. Month-end interest and statements must keep running without interruption during the migration.",
};
const PLAN_DEPS = {
  target:["cur_platform","channels","tgt_cloud","tgt_approach","tgt_managed","drivers","availability","compliance","keep_int"],
  cost:["tgt_cloud","tgt_managed","tgt_approach","users_peak","tx_day","db_size","cur_envs","availability"],
  plan:["tgt_approach","drivers","deadline","budget","team_size","team_skills","keep_int","batch_window"],
  roi:["cur_cost","tgt_cloud","tgt_approach","cur_envs","team_size","deadline"],
};
const WAF = { "Mainframe cost / contract exit":"Cost optimization", "Skills & retirement risk":"Operational excellence", "Agility / delivery speed":"Operational excellence", "Resilience":"Reliability", "Security & compliance":"Security", "Scalability":"Performance efficiency" };

function customerContext(){
  return `
  <div class="doc-head"><div><div class="eyebrow">Input · Customer Context</div><h1>${APP}</h1>
    <div class="meta">What the code can't tell us. Pre-filled from CAST where possible — every answer is optional, and “Don't know” becomes a labeled assumption.</div></div></div>
  <div class="ctxwrap">
    <div>${CTX_GROUPS.map(([g,t,s])=>`<section class="cgroup"><div class="cgh"><h3>${t}</h3><span>${s}</span></div><div class="cgrid">${CTX_FIELDS.filter(f=>f[1]===g).map(ctxField).join("")}</div></section>`).join("")}</div>
    <aside class="ctxsum" id="ctxsum">${ctxSummary()}</aside>
  </div>`;
}
