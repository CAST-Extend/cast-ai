/* =====================================================================
   BUSINESS RULES — Transactions & Billing
   ===================================================================== */
Object.assign(EV, {
  postParas: { title:"Posting — paragraph structure", call:"run_cypher_query — CBTRN02C paragraphs", rows:[
    ["Validate","1500-VALIDATE-TRAN → 1500-A-LOOKUP-XREF → 1500-B-LOOKUP-ACCT"],["Post","2000-POST-TRANSACTION → 2700-UPDATE-TCATBAL (A-CREATE / B-UPDATE) → 2800-UPDATE-ACCOUNT-REC → 2900-WRITE-TRANSACTION-FILE"],
    ["Reject","2500-WRITE-REJECT-REC → DALYREJS"],["Timestamp","Z-GET-DB2-FORMAT-TIMESTAMP"]]},
});
const R_CATS = ["Posting validation","Posting updates","Interest & fees","Bill payment","Online transaction entry","Statements & reports"];
const R_TYPES = { calc:"Calculation", val:"Validation", con:"Constraint", trig:"Trigger", def:"Default" };
const R_STAT = { ok:["ok","Enforced"], inc:["inc","Inconsistent"], ne:["ne","Not enforced"], off:["off","Disabled"] };
const RP = "BR-TB-";
/* [id, category, type, status, title, statement, where, ev[], fr, clar, gherkin[given,when,then] | null, inferred?] */
const RULES = [
  [RP+"001","Posting validation","val","ok","Card must be known","A daily transaction is rejected with reason 100 “INVALID CARD NUMBER FOUND” when its card number is not in the card cross-reference.","CBTRN02C · 1500-A-LOOKUP-XREF",["postXref"],"FR-001",null,["a daily transaction for card 4111000000000000 that is not in the cross-reference","posting runs","it is rejected with reason 100"]],
  [RP+"002","Posting validation","val","ok","Account must exist","A daily transaction is rejected with reason 101 “ACCOUNT RECORD NOT FOUND” when the account linked to the card does not exist.","CBTRN02C · 1500-B-LOOKUP-ACCT",["postAcct"],"FR-002",null,["a card whose cross-referenced account is missing","posting runs","the transaction is rejected with reason 101"]],
  [RP+"003","Posting validation","val","inc","Stay within the credit limit","A transaction is rejected with reason 102 “OVERLIMIT TRANSACTION” when cycle credit − cycle debit + amount exceeds the credit limit. The test ignores the balance carried from earlier cycles and adds payments back.","CBTRN02C · 1500-B-LOOKUP-ACCT",["postAcct","postUpd","intUpd"],"FR-003","C-01",["an account with limit 1,000.00, balance 950.00 carried from last cycle and zero cycle totals","a 200.00 purchase is posted","it is rejected as over limit (fails today — it is posted)"]],
  [RP+"004","Posting validation","val","ok","No transactions after expiration","A transaction is rejected with reason 103 “TRANSACTION RECEIVED AFTER ACCT EXPIRATION” when its origin date is later than the account's expiration date.","CBTRN02C · 1500-B-LOOKUP-ACCT",["postAcct"],"FR-004",null,["an account that expired on 2026-06-30","a transaction originated on 2026-07-02 is posted","it is rejected with reason 103"]],
  [RP+"005","Posting validation","con","inc","One reject reason per transaction","When several checks fail, only the last reason is kept: expiration (103) overwrites over-limit (102).","CBTRN02C · 1500-B-LOOKUP-ACCT",["postAcct"],"FR-005","C-02",["a transaction that is both over the limit and after expiration","posting runs","both reasons are recorded (fails today — only 103)"]],
  [RP+"006","Posting validation","trig","ok","Rejects are written and flagged","Every rejected transaction is written to the daily rejects file with its reason; if any were rejected the job ends with return code 4.","CBTRN02C · main loop · 2500-WRITE-REJECT-REC",["postMain","postParas"],"FR-005",null,["a daily file with one rejected transaction","posting finishes","the rejects file holds it with its reason and the job returns code 4"]],
  [RP+"007","Posting updates","calc","ok","Balance and cycle totals","A posted amount is added to the current balance; positive amounts to the cycle credit total and negative amounts to the cycle debit total.","CBTRN02C · 2800-UPDATE-ACCOUNT-REC",["postUpd"],"FR-006",null,["an account with balance 100.00","a 40.00 purchase is posted","the balance is 140.00 and the cycle credit total rises by 40.00"]],
  [RP+"008","Posting updates","calc","ok","Category balance maintained","Each posted amount updates the balance for its account, transaction type and category; the record is created on first use.","CBTRN02C · 2700-UPDATE-TCATBAL",["postTcat"],"FR-006",null,null],
  [RP+"009","Posting updates","con","inc","Posting is all-or-nothing","A transaction should update category balance, account and history together. A failed account rewrite sets reason 109 but the transaction is still written and not counted as rejected.","CBTRN02C · 2000-POST-TRANSACTION · 2800",["postTran","postUpd"],"FR-006","C-03",["an account rewrite that fails during posting","posting continues","the transaction is not written (fails today — it is written)"]],
  [RP+"010","Posting updates","def","ok","Processing timestamp","The processing timestamp of a posted transaction is set at posting time, in DB2 timestamp format.","CBTRN02C · 2000 · Z-GET-DB2-FORMAT-TIMESTAMP",["postTran"],"FR-006",null,null],
  [RP+"011","Interest & fees","calc","ok","Monthly interest","Monthly interest for each category balance = balance × annual rate ÷ 1200.","CBACT04C · 1300-COMPUTE-INTEREST",["intCalc"],"FR-007",null,["a category balance of 1,200.00 and an annual rate of 18","interest runs","monthly interest of 18.00 is calculated"]],
  [RP+"012","Interest & fees","def","ok","Rate by group, type and category","The rate is looked up by the account's disclosure group, the transaction type and the category; if the group has no record the DEFAULT group is used.","CBACT04C · 1200-GET-INTEREST-RATE",["intRate"],"FR-007",null,["an account in group GOLD with no GOLD record for its type and category","interest runs","the DEFAULT group's rate is used"]],
  [RP+"013","Interest & fees","con","ok","No interest at zero rate","Interest (and fees) are skipped for a category whose rate is zero.","CBACT04C · main loop",["intMain"],"FR-007",null,null],
  [RP+"014","Interest & fees","trig","ok","Interest is a transaction","Each interest amount is written as a system transaction: type 01, category 05, source “System”, description “Int. for a/c …”.","CBACT04C · 1300-B-WRITE-TX",["intWrite"],"FR-008",null,null],
  [RP+"015","Interest & fees","calc","ok","Cycle close","After an account's categories are processed, the total interest is added to the balance and the cycle credit and debit totals are reset to zero.","CBACT04C · 1050-UPDATE-ACCOUNT",["intUpd"],"FR-008",null,["an account with cycle totals of 300.00 credit and −100.00 debit and 18.00 interest due","interest runs","the balance rises by 18.00 and both cycle totals are 0"]],
  [RP+"016","Interest & fees","calc","off","Fees","Fee calculation is called on every interest calculation but the paragraph is empty — “To be implemented”.","CBACT04C · 1400-COMPUTE-FEES",["intFees"],"FR-009","C-06",null],
  [RP+"017","Interest & fees","con","inc","Interest on what is owed","Interest is charged on category balances; online bill payment does not reduce them, so paid amounts can still attract interest.","CBACT04C · COBIL00C",["intCalc","billPay","crud"],"FR-010","C-04",["an account that paid its full balance online after posting","interest runs","no interest is charged (fails today — category balances are unchanged)"],true],
  [RP+"018","Bill payment","val","ok","Account required","The bill-payment screen requires an account ID — “Acct ID can NOT be empty...”.","COBIL00C · PROCESS-ENTER-KEY",["billPay"],"FR-010",null,["an empty account ID on the bill-payment screen","the user presses Enter","the screen shows “Acct ID can NOT be empty...”"]],
  [RP+"019","Bill payment","con","ok","Nothing to pay","No payment is possible when the current balance is zero or negative — “You have nothing to pay...”.","COBIL00C · PROCESS-ENTER-KEY",["billPay"],"FR-010",null,["an account with a balance of 0.00","the user asks to pay","the screen shows “You have nothing to pay...”"]],
  [RP+"020","Bill payment","val","ok","Explicit confirmation","A payment is made only when the user confirms with Y; N clears the screen and any other value is refused.","COBIL00C · PROCESS-ENTER-KEY",["billPay"],"FR-010",null,["a confirmation value of X","the user submits","the screen shows “Invalid value. Valid values are (Y/N)...”"]],
  [RP+"021","Bill payment","calc","ok","Full balance only","A payment is always for the full current balance, which is then reduced to zero; partial payments are not possible.","COBIL00C · PROCESS-ENTER-KEY",["billPay"],"FR-010",null,["an account with a balance of 250.00","the user confirms payment","a 250.00 payment is recorded and the balance becomes 0.00"]],
  [RP+"022","Bill payment","def","ok","How a payment is recorded","A payment is a transaction of type 02, category 2, source “POS TERM”, description “BILL PAYMENT - ONLINE”, merchant 999999999 “BILL PAYMENT”.","COBIL00C · PROCESS-ENTER-KEY",["billPay"],"FR-010",null,null],
  [RP+"023","Bill payment","con","inc","One sign convention","Payments are stored as positive amounts, while posting treats positive amounts as charges.","COBIL00C · CBTRN02C 2800",["billPay","postUpd"],"FR-010","C-09",null,true],
  [RP+"024","Online transaction entry","val","ok","All fields required","Type, category, source, description, amount, origin and processing dates and merchant ID, name, city and ZIP are all mandatory.","COTRN02C · VALIDATE-INPUT-DATA-FIELDS",["addVal"],"FR-011",null,["an add-transaction screen with no amount","the user submits","the screen shows “Amount can NOT be empty...”"]],
  [RP+"025","Online transaction entry","val","ok","Numeric codes","Type code, category code and merchant ID must be numeric.","COTRN02C · VALIDATE-INPUT-DATA-FIELDS",["addVal"],"FR-011",null,null],
  [RP+"026","Online transaction entry","val","ok","Amount format","The amount must be keyed as a sign, eight digits, a decimal point and two decimals: -99999999.99.","COTRN02C · VALIDATE-INPUT-DATA-FIELDS",["addVal"],"FR-011",null,["an amount keyed as 12.5","the user submits","the screen shows “Amount should be in format -99999999.99”"]],
  [RP+"027","Online transaction entry","val","ok","Valid dates","Origin and processing dates must be YYYY-MM-DD and pass the CSUTLDTC date check (one result code, 2513, is tolerated).","COTRN02C · CSUTLDTC",["addVal"],"FR-011",null,null],
  [RP+"028","Online transaction entry","con","ne","Online entries follow posting rules","A transaction keyed online should pass the same card, account, limit and expiration checks as posting and update the balances; today it is written straight to the history.","COTRN02C · ADD-TRANSACTION",["addTran"],"FR-011","C-05",["an over-limit transaction keyed online","the user submits","it is refused (fails today — it is written)"]],
  [RP+"029","Online transaction entry","calc","inc","Next transaction ID","A new online transaction or payment takes the highest ID in the file plus 1 — two users at the same moment can get the same ID.","COTRN02C · COBIL00C",["addTran","billPay"],"FR-012","C-07",null],
  [RP+"030","Statements & reports","calc","ok","Report totals","The transaction report adds type and category descriptions to each transaction and prints totals per page, per account and overall.","CBTRN03C",["rptEv"],"FR-014",null,null],
  [RP+"031","Statements & reports","trig","ok","Statements every night","Statements are produced per card from customer, account and transaction data, in text and HTML, then converted to PDF by the next job in the schedule.","CBSTM03A · CBSTM03B · CREASTMT → TXT2PDF1",["stmtEv","schedule"],"FR-013",null,null],
];
const R_FLAGGED = RULES.filter(r=>r[3]!=="ok").length;

let rulesView = "catalog", rulesFilter = "All";
function setRules(v,f){ if(v) rulesView=v; if(f!==undefined) rulesFilter=f; document.getElementById("doc").innerHTML = bizRules(); paintGrounding(); }
function goClar(){ specTab="clar"; go("#/ws/spec"); }
function goSpec(){ specTab="spec"; go("#/ws/spec"); }

function bizRules(){
  STMTS = []; RULES.forEach(ruleCard); rulesTables(); const all = STMTS;
  STMTS = [];
  const body = rulesView==="catalog" ? rulesCatalog() : rulesTables();
  STMTS = all;
  return `
  <div class="doc-head"><div><div class="eyebrow">Business Rules · as-is</div><h1>${SHOW_H}</h1>
    <div class="meta">Extracted from the CardDemo paragraphs returned by CAST Imaging · ${RULES.length} rules · snapshot ${SYSTEM.snapshot}</div></div>
    <div class="doc-actions"><button class="btn btn-primary btn-sm" onclick="openExport(RULE_FILES,'Business rules bundle','Rules as Markdown for people, Gherkin scenarios for test automation and AI agents, and JSON for tooling.')">Export for agents</button>
    <button class="btn btn-ghost btn-sm" onclick="toast('Export is not wired up in this prototype')">Export PDF</button></div></div>
  ${domainBar("business rules")}
  <div class="rkpis">
    <div class="kpi" onclick="setRules('catalog','All')"><div class="v">${RULES.length}</div><div class="l">Rules extracted</div></div>
    <div class="kpi" onclick="setRules('catalog','All')"><div class="v">${R_CATS.length}</div><div class="l">Rule categories</div></div>
    <div class="kpi" onclick="setRules('catalog','flag')"><div class="v">${R_FLAGGED}</div><div class="l">Need a decision</div><div class="s">inconsistent, not enforced or disabled</div></div>
    <div class="kpi" onclick="setRules('catalog','All')"><div class="v">${RULES.filter(r=>r[10]).length}</div><div class="l">Ready-made test scenarios</div></div>
  </div>
  <div class="grounding" id="grounding"></div>
  <div class="tabs"><button class="tab ${rulesView==="catalog"?"on":""}" onclick="setRules('catalog')">Rule catalog</button><button class="tab ${rulesView==="tables"?"on":""}" onclick="setRules('tables')">Decision tables</button></div>
  ${body}`;
}

function rulesTables(){
  return `
  <p style="margin-top:22px">${I("The rules that interact most are easier to read as decision tables. Each row is one combination of conditions and the outcome the code produces today.","Tables are assembled from the individual rules; row outcomes are traced to the same source.","postAcct","intRate","billPay")}</p>
  <div class="dtable"><h3>What happens to a daily transaction?</h3><p class="sub">${RP}001 – 006 · checks run in this order; later reasons overwrite earlier ones</p>
  <div class="tblwrap"><table class="tbl"><thead><tr><th>Card in cross-reference?</th><th>Account found?</th><th>Within limit test?</th><th>Before expiration?</th><th>Outcome</th></tr></thead><tbody>
    <tr><td>No</td><td>—</td><td>—</td><td>—</td><td class="out">${X("Rejected · 100","postXref")}</td></tr>
    <tr><td>Yes</td><td>No</td><td>—</td><td>—</td><td class="out">${X("Rejected · 101","postAcct")}</td></tr>
    <tr><td>Yes</td><td>Yes</td><td>No</td><td>Yes</td><td class="out">${X("Rejected · 102","postAcct")}</td></tr>
    <tr class="hl"><td>Yes</td><td>Yes</td><td>No</td><td>No</td><td class="out">${X("Rejected · 103 only — 102 is lost (C-02)","postAcct")}</td></tr>
    <tr><td>Yes</td><td>Yes</td><td>Yes</td><td>No</td><td class="out">${X("Rejected · 103","postAcct")}</td></tr>
    <tr><td>Yes</td><td>Yes</td><td>Yes</td><td>Yes</td><td class="out">${X("Posted — category balance, account, history","postTran")}</td></tr>
    <tr class="hl"><td colspan="4">Posted, but the account rewrite fails</td><td class="out">${X("Reason 109 set, transaction still written (C-03)","postUpd")}</td></tr>
  </tbody></table></div>
  <p style="font-size:13px;color:var(--muted);margin-top:8px">“Within limit test” = cycle credit − cycle debit + amount ≤ credit limit — not the account balance (C-01).</p></div>

  <div class="dtable"><h3>Which interest rate applies?</h3><p class="sub">${RP}011 – 013</p>
  <div class="tblwrap"><table class="tbl"><thead><tr><th>Group record for type + category</th><th>Rate found</th><th>Outcome</th></tr></thead><tbody>
    <tr><td>Found</td><td>&gt; 0</td><td class="out">${X("balance × rate ÷ 1200, written as a type 01 / category 05 transaction","intCalc","intWrite")}</td></tr>
    <tr><td>Missing</td><td>DEFAULT &gt; 0</td><td class="out">${X("DEFAULT group's rate is used","intRate")}</td></tr>
    <tr><td>Found or DEFAULT</td><td>0</td><td class="out">${X("No interest, no fees","intMain")}</td></tr>
    <tr class="hl"><td>any</td><td>any</td><td class="out">${X("Fees — never charged (empty paragraph)","intFees")}</td></tr>
  </tbody></table></div></div>

  <div class="dtable"><h3>What does the bill-payment screen do?</h3><p class="sub">${RP}018 – 022</p>
  <div class="tblwrap"><table class="tbl"><thead><tr><th>Account ID</th><th>Balance</th><th>Confirm</th><th>Outcome</th></tr></thead><tbody>
    <tr><td>empty</td><td>—</td><td>—</td><td class="out">${X("“Acct ID can NOT be empty...”","billPay")}</td></tr>
    <tr><td>given</td><td>≤ 0</td><td>any</td><td class="out">${X("“You have nothing to pay...”","billPay")}</td></tr>
    <tr><td>given</td><td>&gt; 0</td><td>blank</td><td class="out">${X("Balance shown · “Confirm to make a bill payment...”","billPay")}</td></tr>
    <tr><td>given</td><td>&gt; 0</td><td>N</td><td class="out">${X("Screen cleared","billPay")}</td></tr>
    <tr class="hl"><td>given</td><td>&gt; 0</td><td>Y</td><td class="out">${X("Full balance paid · balance 0 · category balances unchanged (C-04)","billPay")}</td></tr>
    <tr><td>given</td><td>any</td><td>other</td><td class="out">${X("“Invalid value. Valid values are (Y/N)...”","billPay")}</td></tr>
  </tbody></table></div></div>`;
}

/* ---------------- Rules export ---------------- */
function mdRules(){
  const L = [`# Business Rules: ${SHOW} (as-is)`,"",`Generated by CAST ${PRODUCT} from CAST Imaging · ${APP} · snapshot ${SYSTEM.snapshot}  `,
    `${RULES.length} rules · ${R_FLAGGED} need a decision. Status: Enforced · Inconsistent · Not enforced · Disabled.`,""];
  R_CATS.forEach(c=>{ L.push(`## ${c}`,"");
    RULES.filter(r=>r[1]===c).forEach(r=>L.push(`### ${r[0]} — ${r[4]}`,"",r[5],"",`- **Type**: ${R_TYPES[r[2]]}`,`- **Status**: ${R_STAT[r[3]][1]}`,`- **Enforced in**: \`${r[6]}\``,
      `- **Spec**: ${r[8]}${r[9]?` · **Clarification**: ${r[9]}`:""}`, r[11]?"- **Source**: interpretation across programs":"- **Source**: extracted from code","")); });
  return L.join("\n");
}
function featureRules(){
  const L = ["# Generated by CAST "+PRODUCT+" — business rules as executable scenarios","# Scenarios tagged @fails-today describe intended behaviour the current code does not meet.","",`Feature: ${SHOW} business rules (${APP}, as-is)`,""];
  RULES.filter(r=>r[10]).forEach(r=>{ const [g,w,t] = r[10];
    const tags = [`@${r[0]}`, `@${r[8]!=="—"?r[8]:"no-fr"}`]; if (r[3]!=="ok") tags.push("@fails-today"); if (r[9]) tags.push(`@${r[9]}`);
    L.push(`  ${tags.join(" ")}`,`  Scenario: ${r[4]}`,`    Given ${g}`,`    When ${w}`,`    Then ${t.replace(/ \(fails today[^)]*\)/,"")}`,""); });
  return L.join("\n");
}
function jsonRules(){
  return JSON.stringify({ domain:"transactions-billing", application:APP, snapshot:SYSTEM.snapshot, generatedBy:"CAST "+PRODUCT,
    rules: RULES.map(r=>({ id:r[0], category:r[1], type:R_TYPES[r[2]], status:R_STAT[r[3]][1], title:r[4], statement:r[5], enforcedIn:r[6], spec:r[8], clarification:r[9]||null, source:r[11]?"interpretation":"code" })) }, null, 2);
}
const RULE_FILES = [["rules/transactions-billing/business-rules.md", mdRules],["rules/transactions-billing/transactions-billing.feature", featureRules],["rules/transactions-billing/business-rules.json", jsonRules]];

/* =====================================================================
   USER STORIES
   ===================================================================== */
const EPICS = [
  ["EP-01","Post the day's transactions","User Story 1"],
  ["EP-02","Charge monthly interest","User Story 2"],
  ["EP-03","Pay the balance online","User Story 3"],
  ["EP-04","Look up and add transactions","User Story 4"],
  ["EP-05","Statements and reports","User Story 5"],
];
/* [id, epic, title, actor, want, soThat, screen, entry, callGraph, acRuleIds[], extraAC[[g,w,t]], fr, clar, status(ok|issue|idle), ev[] ] */
const STORIES = [
  ["TB-US-01","EP-01","Post valid transactions overnight","operations team","the day's card transactions posted to the accounts every night","balances are current each morning","CA-7 nightly chain","POSTTRAN → CBTRN02C",46,[RP+"007",RP+"008",RP+"010"],[],"FR-006",null,"ok",["postMain","postTran","schedule"]],
  ["TB-US-02","EP-01","Reject transactions for unknown cards or accounts","card issuer","transactions for cards or accounts we don't know to be refused","nothing is posted to the wrong account",  "— batch","POSTTRAN → CBTRN02C",46,[RP+"001",RP+"002"],[],"FR-001",null,"ok",["postXref","postAcct"]],
  ["TB-US-03","EP-01","Refuse over-limit transactions","card issuer","transactions that would take an account over its credit limit to be refused","credit exposure stays within what we agreed","— batch","POSTTRAN → CBTRN02C",46,[RP+"003"],[],"FR-003","C-01","issue",["postAcct"]],
  ["TB-US-04","EP-01","Refuse transactions after expiration","card issuer","transactions received after an account expired to be refused","closed accounts are not charged","— batch","POSTTRAN → CBTRN02C",46,[RP+"004",RP+"005"],[],"FR-004","C-02","issue",["postAcct"]],
  ["TB-US-05","EP-01","Review the day's rejects","operations team","every rejected transaction listed with its reason, and the job flagged","we can fix and resubmit them","— batch output","DALYREJS (rejects file)",46,[RP+"006"],[],"FR-005",null,"ok",["postMain"]],
  ["TB-US-06","EP-01","Keep balances and history consistent","finance","a transaction to be posted everywhere or nowhere","balances always reconcile with the history","— batch","POSTTRAN → CBTRN02C",46,[RP+"009"],[],"FR-006","C-03","issue",["postTran","postUpd"]],

  ["TB-US-07","EP-02","Calculate interest per category","card issuer","interest calculated monthly on each category balance at its disclosed rate","customers pay the rate they were told","— batch","INTCALC → CBACT04C",39,[RP+"011",RP+"012",RP+"013"],[],"FR-007","C-08","issue",["intMain","intCalc","intRate","schedule"]],
  ["TB-US-08","EP-02","Record interest and close the cycle","finance","interest recorded as transactions and the cycle closed","statements and balances show it","— batch","INTCALC → CBACT04C · COMBTRAN",39,[RP+"014",RP+"015"],[],"FR-008",null,"ok",["intWrite","intUpd"]],
  ["TB-US-09","EP-02","Don't charge interest on paid balances","cardholder","interest only on what I still owe","paying my bill actually stops interest","— batch","INTCALC → CBACT04C",39,[RP+"017"],[],"FR-010","C-04","issue",["intCalc","billPay"]],
  ["TB-US-10","EP-02","Charge fees","card issuer","late, over-limit and other fees charged at cycle end","fee income is collected","— batch (empty paragraph)","INTCALC → CBACT04C",39,[RP+"016"],[],"FR-009","C-06","idle",["intFees"]],

  ["TB-US-11","EP-03","Pay an account's balance online","back-office user","to pay an account's full balance from the bill-payment screen","the account is settled immediately","COBIL00 map","CB00 → COBIL00C",70,[RP+"018",RP+"019",RP+"020",RP+"021",RP+"022"],[],"FR-010",null,"ok",["billPay"]],
  ["TB-US-12","EP-03","Record payments consistently","finance","payments recorded with one sign convention across online and batch","reports and reprocessing don't count payments as charges","COBIL00 map","CB00 → COBIL00C",70,[RP+"023"],[],"FR-010","C-09","issue",["billPay","postUpd"]],

  ["TB-US-13","EP-04","Browse the transaction history","back-office user","to page forward and back through transactions","I can answer a cardholder's question","COTRN00 map","CT00 → COTRN00C",76,[],[["the transaction list screen","the user presses PF8","the next page of transactions is shown"]],"FR-006",null,"ok",["domTx","crud"]],
  ["TB-US-14","EP-04","View one transaction","back-office user","to open a transaction and see all its details","I can explain a charge","COTRN01 map","CT01 → COTRN01C",76,[],[["a transaction ID from the list","the user opens it","all fields of the transaction are displayed"]],"FR-006",null,"ok",["domTx","crud"]],
  ["TB-US-15","EP-04","Key in a transaction","back-office user","to enter a transaction with merchant details","corrections and manual items reach the history","COTRN02 map","CT02 → COTRN02C",77,[RP+"024",RP+"025",RP+"026",RP+"027",RP+"028",RP+"029"],[],"FR-011","C-05","issue",["addVal","addTran"]],

  ["TB-US-16","EP-05","Send monthly statements","cardholder","a statement of my account and transactions, as a PDF","I know what I owe","— batch","CREASTMT → CBSTM03A · TXT2PDF1",50,[RP+"031"],[],"FR-013",null,"ok",["stmtEv","schedule"]],
  ["TB-US-17","EP-05","Request a transaction report","back-office user","to request a transaction report for a date range from a screen","I get totals without calling operations","CORPT00 map","CR00 → CORPT00C → TRANREPT",62,[RP+"030"],[["a valid date range on the report screen","the user submits","a report job is submitted through the JOBS queue"]],"FR-014",null,"ok",["rptSub","rptEv"]],
];
const S_STAT = { ok:["ok","Works as described"], issue:["issue","Known issue"], idle:["idle","Not implemented"] };

function userStories(){
  STMTS = [];
  const list = EPICS.map(([eid,et,src])=>{ const ss = STORIES.filter(s=>s[1]===eid);
    return `<div class="epichead" id="ep-${eid}"><code>${eid}</code><h3>${et}</h3><span style="font-size:13px;color:var(--muted)">${ss.length} stories · expands ${src} of the Application Specification</span></div>` + ss.map(storyCard).join(""); }).join("");
  const issues = STORIES.filter(s=>s[13]==="issue").length, idle = STORIES.filter(s=>s[13]==="idle").length;
  const map = EPICS.map(([eid,et])=>`<div><div class="epic" onclick="document.getElementById('ep-${eid}').scrollIntoView({behavior:'smooth'})"><small>${eid}</small>${et}<span class="n">${STORIES.filter(s=>s[1]===eid).length} stories</span></div>
      ${STORIES.filter(s=>s[1]===eid).map(s=>`<div class="scard ${s[13]==="ok"?"":s[13]}" onclick="focusStory('${s[0]}')"><code>${s[0]}</code>${s[2]}</div>`).join("")}</div>`).join("");
  return `
  <div class="doc-head"><div><div class="eyebrow">User Stories · as-is</div><h1>${SHOW_H}</h1>
    <div class="meta">${STORIES.length} stories in ${EPICS.length} epics · each epic expands one story of the Application Specification · snapshot ${SYSTEM.snapshot}</div></div>
    <div class="doc-actions"><button class="btn btn-primary btn-sm" onclick="openExport(STORY_FILES,'User stories bundle','Import into Jira or Azure DevOps, or hand the Markdown to an AI agent as context.')">Export for agents</button>
    <button class="btn btn-ghost btn-sm" onclick="toast('Export is not wired up in this prototype')">Export PDF</button></div></div>
  ${domainBar("user stories")}
  <div class="rkpis">
    <div class="kpi"><div class="v">${STORIES.length}</div><div class="l">Stories</div></div>
    <div class="kpi"><div class="v">${EPICS.length}</div><div class="l">Epics (from the spec)</div></div>
    <div class="kpi"><div class="v">${issues}</div><div class="l">With a known issue</div><div class="s">linked to a clarification</div></div>
    <div class="kpi"><div class="v">${idle}</div><div class="l">Called but not implemented</div></div>
  </div>
  <div class="grounding" id="grounding"></div>
  <h2>Story map</h2>
  <div class="smap">${map}</div>
  <div class="slegend"><span><i style="background:var(--good)"></i>Works as described</span><span><i style="background:#E5B700"></i>Known issue</span><span><i style="background:var(--lavender)"></i>Not implemented</span></div>
  ${list}`;
}
function mdStories(){
  const L = [`# User Stories: ${SHOW} (as-is)`,"",`Generated by CAST ${PRODUCT} from CAST Imaging · ${APP} · snapshot ${SYSTEM.snapshot}`,""];
  EPICS.forEach(([eid,et,src])=>{ L.push(`## ${eid} — ${et}`,"",`_Expands ${src} of the Application Specification._`,"");
    STORIES.filter(s=>s[1]===eid).forEach(s=>{ L.push(`### ${s[0]} — ${s[2]}`,"",`**As a** ${s[3]}, **I want** ${s[4]}, **so that** ${s[5]}.`,"",
      `- **Status**: ${S_STAT[s[13]][1]}${s[12]?` (${s[12]})`:""}`,`- **Screen**: ${s[6]}`,`- **Entry point**: \`${s[7]}\` — reaches ${s[8]} objects`,`- **Spec**: ${s[11]}`,"","**Acceptance criteria**","");
      acText(s).forEach((a,i)=>L.push(`${i+1}. ${a}`)); L.push(""); }); });
  return L.join("\n");
}
function csvStories(){
  const q = v => `"${String(v).replace(/"/g,'""')}"`;
  const rows = [["Issue Type","Issue key","Summary","Epic Link","Description","Acceptance Criteria","Labels"]];
  EPICS.forEach(([eid,et])=>rows.push(["Epic",eid,et,"",`${SHOW} — ${et}`,"","cast-blueprint transactions-billing as-is"]));
  STORIES.forEach(s=>rows.push(["Story",s[0],s[2],s[1],`As a ${s[3]}, I want ${s[4]}, so that ${s[5]}.\nScreen: ${s[6]}\nEntry point: ${s[7]} (reaches ${s[8]} objects)\nSpec: ${s[11]}${s[12]?`\nOpen question: ${s[12]}`:""}`,
    acText(s).map((a,i)=>`${i+1}. ${a}`).join("\n"), ["cast-blueprint","transactions-billing","as-is", s[13]==="issue"?"known-issue":"", s[13]==="idle"?"not-implemented":""].filter(Boolean).join(" ")]));
  return rows.map(r=>r.map(q).join(",")).join("\n");
}
const STORY_FILES = [["stories/transactions-billing/user-stories.md", mdStories],["stories/transactions-billing/jira-import.csv", csvStories]];
