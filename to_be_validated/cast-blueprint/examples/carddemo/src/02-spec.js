/* =====================================================================
   APPLICATION SPECIFICATION — Transactions & Billing (Spec Kit format)
   ===================================================================== */
Object.assign(EV, {
  domTx: { title:"Transactions & Billing entry points", call:"transactions(CardDemo-Cobol) · run_cypher_query (CA-7 FIRE / JCL CALL)", rows:[
      ["Online (CICS)","CT00 · CT01 · CT02 · CB00 · CR00"],["Batch","POSTTRAN · INTCALC · COMBTRAN · CREASTMT · TXT2PDF1 · TRANREPT · TCATBALF · TRANBKP"],
      ["Programs","COTRN00C · COTRN01C · COTRN02C · COBIL00C · CORPT00C · CBTRN01C · CBTRN02C · CBTRN03C · CBACT04C · CBSTM03A · CBSTM03B"],
      ["Call graph: CT02 add transaction","77 objects"],["CB00 bill payment","70"],["TRANREPT report","56"],["CREASTMT statements","50"],["POSTTRAN posting","46"],["INTCALC interest","39"]]},
  postMain: { title:"Nightly posting — main loop", call:"object_details(CBTRN02C <BEGINNING-OF-PROCEDURE-DIVISION>, focus=code) · lines 194–234",
    code:`PERFORM UNTIL END-OF-FILE = 'Y'
    PERFORM 1000-DALYTRAN-GET-NEXT
    IF END-OF-FILE = 'N'
      ADD 1 TO WS-TRANSACTION-COUNT
      MOVE 0 TO WS-VALIDATION-FAIL-REASON
      PERFORM 1500-VALIDATE-TRAN
      IF WS-VALIDATION-FAIL-REASON = 0
        PERFORM 2000-POST-TRANSACTION
      ELSE
        ADD 1 TO WS-REJECT-COUNT
        PERFORM 2500-WRITE-REJECT-REC
...
IF WS-REJECT-COUNT > 0
   MOVE 4 TO RETURN-CODE` },
  postXref: { title:"Card lookup — source", call:"object_details(CBTRN02C 1500-A-LOOKUP-XREF, focus=code) · lines 380–392",
    code:`MOVE DALYTRAN-CARD-NUM TO FD-XREF-CARD-NUM
READ XREF-FILE INTO CARD-XREF-RECORD
   INVALID KEY
     MOVE 100 TO WS-VALIDATION-FAIL-REASON
     MOVE 'INVALID CARD NUMBER FOUND'
       TO WS-VALIDATION-FAIL-REASON-DESC` },
  postAcct: { title:"Account lookup, credit limit and expiration — source", call:"object_details(CBTRN02C 1500-B-LOOKUP-ACCT, focus=code) · lines 393–422",
    code:`READ ACCOUNT-FILE INTO ACCOUNT-RECORD
   INVALID KEY
     MOVE 101 TO WS-VALIDATION-FAIL-REASON
     MOVE 'ACCOUNT RECORD NOT FOUND' ...
   NOT INVALID KEY
     COMPUTE WS-TEMP-BAL = ACCT-CURR-CYC-CREDIT
                         - ACCT-CURR-CYC-DEBIT
                         + DALYTRAN-AMT
     IF ACCT-CREDIT-LIMIT >= WS-TEMP-BAL
       CONTINUE
     ELSE
       MOVE 102 TO WS-VALIDATION-FAIL-REASON
       MOVE 'OVERLIMIT TRANSACTION' ...
     END-IF
     IF ACCT-EXPIRAION-DATE >= DALYTRAN-ORIG-TS (1:10)
       CONTINUE
     ELSE
       MOVE 103 TO WS-VALIDATION-FAIL-REASON
       MOVE 'TRANSACTION RECEIVED AFTER ACCT EXPIRATION' ...`,
    note:"The limit test uses the current cycle's credit and debit totals, not ACCT-CURR-BAL. Debits are stored as negative amounts (see 2800-UPDATE-ACCOUNT-REC), so subtracting them adds them back. When both checks fail, reason 103 overwrites 102." },
  postTran: { title:"Posting a transaction — source", call:"object_details(CBTRN02C 2000-POST-TRANSACTION, focus=code) · lines 423–444",
    code:`MOVE DALYTRAN-ID TO TRAN-ID
... (type, category, source, description, amount, merchant, card, origin timestamp)
PERFORM Z-GET-DB2-FORMAT-TIMESTAMP
MOVE DB2-FORMAT-TS TO TRAN-PROC-TS
PERFORM 2700-UPDATE-TCATBAL
PERFORM 2800-UPDATE-ACCOUNT-REC
PERFORM 2900-WRITE-TRANSACTION-FILE` },
  postUpd: { title:"Account update during posting — source", call:"object_details(CBTRN02C 2800-UPDATE-ACCOUNT-REC, focus=code) · lines 544–560",
    code:`ADD DALYTRAN-AMT TO ACCT-CURR-BAL
IF DALYTRAN-AMT >= 0
   ADD DALYTRAN-AMT TO ACCT-CURR-CYC-CREDIT
ELSE
   ADD DALYTRAN-AMT TO ACCT-CURR-CYC-DEBIT
END-IF
REWRITE FD-ACCTFILE-REC FROM ACCOUNT-RECORD
   INVALID KEY
     MOVE 109 TO WS-VALIDATION-FAIL-REASON
     MOVE 'ACCOUNT RECORD NOT FOUND' ...`,
    note:"Reason 109 is set after the category balance was already updated, and 2000-POST-TRANSACTION goes on to write the transaction — nothing is rolled back and the reject counter is not incremented." },
  postTcat: { title:"Category balance update — source", call:"object_details(CBTRN02C 2700-UPDATE-TCATBAL, focus=code) · lines 466–501",
    code:`MOVE XREF-ACCT-ID TO FD-TRANCAT-ACCT-ID
MOVE DALYTRAN-TYPE-CD TO FD-TRANCAT-TYPE-CD
MOVE DALYTRAN-CAT-CD TO FD-TRANCAT-CD
READ TCATBAL-FILE INTO TRAN-CAT-BAL-RECORD
   INVALID KEY
     DISPLAY 'TCATBAL record not found for key : ' FD-TRAN-CAT-KEY '.. Creating.'
     MOVE 'Y' TO WS-CREATE-TRANCAT-REC
...
IF WS-CREATE-TRANCAT-REC = 'Y'
   PERFORM 2700-A-CREATE-TCATBAL-REC
ELSE
   PERFORM 2700-B-UPDATE-TCATBAL-REC` },
  intMain: { title:"Interest calculation — main loop", call:"object_details(CBACT04C <BEGINNING-OF-PROCEDURE-DIVISION>, focus=code) · lines 181–232",
    code:`PERFORM 1000-TCATBALF-GET-NEXT
IF TRANCAT-ACCT-ID NOT= WS-LAST-ACCT-NUM
   IF WS-FIRST-TIME NOT = 'Y'
      PERFORM 1050-UPDATE-ACCOUNT
   ...
   PERFORM 1100-GET-ACCT-DATA
   PERFORM 1110-GET-XREF-DATA
END-IF
MOVE ACCT-GROUP-ID TO FD-DIS-ACCT-GROUP-ID
MOVE TRANCAT-CD TO FD-DIS-TRAN-CAT-CD
MOVE TRANCAT-TYPE-CD TO FD-DIS-TRAN-TYPE-CD
PERFORM 1200-GET-INTEREST-RATE
IF DIS-INT-RATE NOT = 0
  PERFORM 1300-COMPUTE-INTEREST
  PERFORM 1400-COMPUTE-FEES
END-IF` },
  intCalc: { title:"Monthly interest — source", call:"object_details(CBACT04C 1300-COMPUTE-INTEREST, focus=code) · lines 461–470",
    code:`COMPUTE WS-MONTHLY-INT
 = ( TRAN-CAT-BAL * DIS-INT-RATE) / 1200
ADD WS-MONTHLY-INT TO WS-TOTAL-INT
PERFORM 1300-B-WRITE-TX.` },
  intRate: { title:"Interest rate lookup — source", call:"object_details(CBACT04C 1200-GET-INTEREST-RATE, focus=code) · lines 414–440",
    code:`READ DISCGRP-FILE INTO DIS-GROUP-RECORD
     INVALID KEY
        DISPLAY 'DISCLOSURE GROUP RECORD MISSING'
        DISPLAY 'TRY WITH DEFAULT GROUP CODE'
...
IF DISCGRP-STATUS = '23'
   MOVE 'DEFAULT' TO FD-DIS-ACCT-GROUP-ID
   PERFORM 1200-A-GET-DEFAULT-INT-RATE
END-IF` },
  intWrite: { title:"Interest transaction — source", call:"object_details(CBACT04C 1300-B-WRITE-TX, focus=code) · lines 472–515",
    code:`STRING PARM-DATE, WS-TRANID-SUFFIX DELIMITED BY SIZE INTO TRAN-ID
MOVE '01'     TO TRAN-TYPE-CD
MOVE '05'     TO TRAN-CAT-CD
MOVE 'System' TO TRAN-SOURCE
STRING 'Int. for a/c ', ACCT-ID DELIMITED BY SIZE INTO TRAN-DESC
MOVE WS-MONTHLY-INT TO TRAN-AMT
...
WRITE FD-TRANFILE-REC FROM TRAN-RECORD` },
  intFees: { title:"Fees — source", call:"object_details(CBACT04C 1400-COMPUTE-FEES, focus=code) · lines 517–520",
    code:`1400-COMPUTE-FEES.
* To be implemented
     EXIT.` },
  intUpd: { title:"Account update after interest — source", call:"object_details(CBACT04C 1050-UPDATE-ACCOUNT, focus=code) · lines 349–370",
    code:`ADD WS-TOTAL-INT TO ACCT-CURR-BAL
MOVE 0 TO ACCT-CURR-CYC-CREDIT
MOVE 0 TO ACCT-CURR-CYC-DEBIT
REWRITE FD-ACCTFILE-REC FROM ACCOUNT-RECORD` },
  billPay: { title:"Online bill payment — source", call:"object_details(COBIL00C PROCESS-ENTER-KEY, focus=code) · lines 151–244",
    code:`WHEN ACTIDINI OF COBIL0AI = SPACES OR LOW-VALUES
    MOVE 'Acct ID can NOT be empty...' TO WS-MESSAGE
...
EVALUATE CONFIRMI OF COBIL0AI
    WHEN 'Y' WHEN 'y'  SET CONF-PAY-YES TO TRUE ...
    WHEN 'N' WHEN 'n'  PERFORM CLEAR-CURRENT-SCREEN ...
    WHEN OTHER  MOVE 'Invalid value. Valid values are (Y/N)...'
...
IF ACCT-CURR-BAL <= ZEROS ...
    MOVE 'You have nothing to pay...' TO WS-MESSAGE
...
MOVE HIGH-VALUES TO TRAN-ID
PERFORM STARTBR-TRANSACT-FILE
PERFORM READPREV-TRANSACT-FILE
MOVE TRAN-ID TO WS-TRAN-ID-NUM
ADD 1 TO WS-TRAN-ID-NUM
MOVE '02'   TO TRAN-TYPE-CD
MOVE 2      TO TRAN-CAT-CD
MOVE 'POS TERM' TO TRAN-SOURCE
MOVE 'BILL PAYMENT - ONLINE' TO TRAN-DESC
MOVE ACCT-CURR-BAL TO TRAN-AMT
MOVE 999999999 TO TRAN-MERCHANT-ID
PERFORM WRITE-TRANSACT-FILE
COMPUTE ACCT-CURR-BAL = ACCT-CURR-BAL - TRAN-AMT
PERFORM UPDATE-ACCTDAT-FILE`,
    note:"Writes TRANSACT and ACCTDAT only — the category balances (TCATBALF) and the cycle totals are not touched." },
  addVal: { title:"Online add transaction — validation source", call:"object_details(COTRN02C VALIDATE-INPUT-DATA-FIELDS, focus=code) · lines 232–437",
    code:`WHEN TRNAMTI OF COTRN2AI = SPACES OR LOW-VALUES
    MOVE 'Amount can NOT be empty...' TO WS-MESSAGE
... (type, category, source, description, dates, merchant id/name/city/zip)
WHEN TTYPCDI OF COTRN2AI NOT NUMERIC
    MOVE 'Type CD must be Numeric...' TO WS-MESSAGE
WHEN TRNAMTI OF COTRN2AI(1:1) NOT EQUAL '-' AND '+'
WHEN TRNAMTI OF COTRN2AI(2:8) NOT NUMERIC
WHEN TRNAMTI OF COTRN2AI(10:1) NOT = '.'
    MOVE 'Amount should be in format -99999999.99' TO WS-MESSAGE
...
CALL 'CSUTLDTC' USING CSUTLDTC-DATE CSUTLDTC-DATE-FORMAT CSUTLDTC-RESULT
IF CSUTLDTC-RESULT-SEV-CD = '0000' CONTINUE
ELSE IF CSUTLDTC-RESULT-MSG-NUM NOT = '2513'
    MOVE 'Orig Date - Not a valid date...' ...` },
  addTran: { title:"Online add transaction — write source", call:"object_details(COTRN02C ADD-TRANSACTION, focus=code) · lines 439–466",
    code:`MOVE HIGH-VALUES TO TRAN-ID
PERFORM STARTBR-TRANSACT-FILE
PERFORM READPREV-TRANSACT-FILE
PERFORM ENDBR-TRANSACT-FILE
MOVE TRAN-ID TO WS-TRAN-ID-N
ADD 1 TO WS-TRAN-ID-N
... MOVE fields from the screen ...
MOVE TORIGDTI OF COTRN2AI TO TRAN-ORIG-TS
MOVE TPROCDTI OF COTRN2AI TO TRAN-PROC-TS
PERFORM WRITE-TRANSACT-FILE.`,
    note:"No account read, no limit or expiration check, no balance update — the transaction goes straight into the history with a processing date typed by the user." },
  rptSub: { title:"Report request — structure", call:"run_cypher_query — CORPT00C paragraphs and transient-data links", rows:[
      ["Paragraphs","PROCESS-ENTER-KEY · SUBMIT-JOB-TO-INTRDR · WIRTE-JOBSUB-TDQ · SEND/RECEIVE-TRNRPT-SCREEN"],["Writes to","JOBS transient data queue"],["Calls","CSUTLDTC (date validation)"]]},
  stmtEv: { title:"Statements — structure", call:"run_cypher_query — CBSTM03A/B paragraphs · CA-7 chain", rows:[
      ["CBSTM03A","1000-XREFFILE-GET-NEXT · 2000-CUSTFILE-GET · 3000-ACCTFILE-GET · 4000-TRNXFILE-GET · 5000-CREATE-STATEMENT · 5100-WRITE-HTML-HEADER · 6000-WRITE-TRANS"],
      ["CBSTM03B","file handler called 13 times by CBSTM03A"],["Reads","TRXFL · ACCTDATA · CUSTDATA · CARDXREF"],["Next job","CREASTMT → TXT2PDF1 (PDF)"]]},
  rptEv: { title:"Transaction report — structure", call:"run_cypher_query — CBTRN03C paragraphs · data access", rows:[
      ["Lookups","1500-A-LOOKUP-XREF · 1500-B-LOOKUP-TRANTYPE · 1500-C-LOOKUP-TRANCATG"],["Totals","1110-WRITE-PAGE-TOTALS · 1120-WRITE-ACCOUNT-TOTALS · 1110-WRITE-GRAND-TOTALS"],
      ["Reads","TRANSACT.DALY · TRANTYPE · TRANCATG · CARDXREF · date parameter"],["Writes","TRANREPT (GDG)"]]},
});

const CAPS = [
  ["Post transactions","Validate the daily file and post it to balances and history",3],
  ["Interest & fees","Monthly interest per category; merge into history",2],
  ["Bill payment","Pay the full balance online",1],
  ["Look up transactions","List and view the history online",2],
  ["Enter transactions","Key in a transaction online",1],
  ["Reports & statements","Statements, PDF conversion, transaction report",4],
];
/* [kind, id, program, mode, purpose, scheduled, call graph, capability] */
const CONTRACTS = [
  ["CA-7","POSTTRAN","CBTRN02C","Batch","Validate and post the daily transaction file","scheduled",46,"Post transactions"],
  ["CA-7","TCATBALF","IDCAMS","Batch","Reload the category-balance file","scheduled",12,"Post transactions"],
  ["JCL","TRANBKP","IDCAMS","Batch","Back up the transaction file","not in CA-7",16,"Post transactions"],
  ["JCL","INTCALC","CBACT04C","Batch","Calculate monthly interest","not in CA-7",39,"Interest & fees"],
  ["JCL","COMBTRAN","SORT · IDCAMS","Batch","Merge system (interest) transactions into the history","not in CA-7",9,"Interest & fees"],
  ["CICS","CB00","COBIL00C","Online","Pay the account balance in full","—",70,"Bill payment"],
  ["CICS","CT00","COTRN00C","Online","List transactions, page forward and back","—",76,"Look up transactions"],
  ["CICS","CT01","COTRN01C","Online","View one transaction","—",76,"Look up transactions"],
  ["CICS","CT02","COTRN02C","Online","Add a transaction","—",77,"Enter transactions"],
  ["CA-7","CREASTMT","CBSTM03A → CBSTM03B","Batch","Produce account statements (text and HTML)","scheduled",50,"Reports & statements"],
  ["CA-7","TXT2PDF1","utility","Batch","Convert statements to PDF","scheduled",12,"Reports & statements"],
  ["JCL","TRANREPT","CBTRN03C","Batch","Transaction report with page, account and grand totals","not in CA-7",56,"Reports & statements"],
  ["CICS","CR00","CORPT00C","Online","Request a transaction report — submits a batch job","—",62,"Reports & statements"],
];

const SPEC = {
  stories: [
    { t:"Post the day's card transactions", p:"P1", ev:["postMain","postXref","postAcct"],
      d:"Every night the posting job validates each transaction in the daily file against the card cross-reference and the account, posts the valid ones — updating the category balance, the account and the transaction history — and writes the rest to a rejects file with a reason code.",
      why:"This is the ledger: every balance, interest charge and statement is built on it.",
      test:"Run POSTTRAN on a daily file holding one valid, one unknown-card, one over-limit and one late transaction; compare the transaction, account, category-balance and reject files with expected outputs.",
      ac:[["a daily transaction for a known card on an open account within its limit","posting runs","it is written to the transaction file with a processing timestamp, and the category balance and account balance are updated"],
          ["a daily transaction whose card number is not in the cross-reference","posting runs","it is written to the rejects file with reason 100 “INVALID CARD NUMBER FOUND”"],
          ["at least one rejected transaction","posting finishes","the job ends with return code 4"]] },
    { t:"Charge monthly interest", p:"P1", ev:["intMain","intCalc","intRate"],
      d:"The interest job reads every category balance, looks up the rate for the account's disclosure group, transaction type and category, writes an interest transaction and adds the total to the account, closing the cycle.",
      why:"Interest is the product's revenue and feeds every statement.",
      test:"Run INTCALC over known category-balance and disclosure-group files; compare the interest transactions and account balances.",
      ac:[["a category balance of 1,200.00 with an annual rate of 18","interest runs","an interest transaction of 18.00 is written with type 01, category 05, source “System”"],
          ["an account group with no disclosure-group record","interest runs","the DEFAULT group's rate is used"],
          ["an account after interest has run","it is read back","its cycle credit and cycle debit are zero and its balance includes the interest"]] },
    { t:"Pay the balance online", p:"P2", ev:["billPay"],
      d:"A back-office user pays an account's full current balance from the bill-payment screen; the payment is recorded as a transaction and the balance drops to zero.",
      why:"The only online money movement — and it interacts with interest (C-04).",
      test:"Pay an account with a positive balance and confirmation Y; read back the account and the new transaction.",
      ac:[["an account with a balance of zero or less","the user asks to pay","the screen shows “You have nothing to pay...”"],
          ["an account with a positive balance","the user confirms with Y","a transaction of type 02, category 2, for the full balance is written and the balance becomes zero"],
          ["a confirmation value other than Y or N","the user submits","the screen shows “Invalid value. Valid values are (Y/N)...”"]] },
    { t:"Look up and add transactions online", p:"P2", ev:["addVal","addTran","crud"],
      d:"Users page through the transaction history, open a single transaction, and key in new transactions with merchant details.",
      why:"The online window on the ledger; the add function bypasses the posting rules (C-05).",
      test:"Add a transaction with valid fields, then list and view it.",
      ac:[["an add-transaction screen with no amount","the user submits","the screen shows “Amount can NOT be empty...”"],
          ["an amount not in the form -99999999.99","the user submits","the screen shows “Amount should be in format -99999999.99”"],
          ["valid input","the user submits","the transaction is written with an ID one higher than the last one in the file"]] },
    { t:"Produce statements and reports", p:"P3", ev:["stmtEv","rptEv","rptSub","schedule"],
      d:"Each night statements are produced per card from customer, account and transaction data and converted to PDF; on request, a transaction report with page, account and grand totals is submitted from the CR00 screen.",
      why:"Customer-facing output, produced entirely in batch.",
      test:"Run CREASTMT on a known dataset and compare the statement output; request a report from CR00 and check that a job is submitted.",
      ac:[["a card with transactions in the statement file","statements run","its statement lists the customer, the account and each transaction"],
          ["a valid date range on the report screen","the user submits","a report job is written to the JOBS queue for the internal reader"]] },
  ],
  edge: [
    ["What happens when a transaction is both over the limit and after the account's expiration?","Only reason 103 is recorded — the second check overwrites the first (C-02).","postAcct"],
    ["What happens if the account cannot be rewritten after the category balance was updated?","Reason 109 is set, but the transaction is still written and not counted as a reject (C-03).","postUpd","postTran"],
    ["What happens when an account's disclosure group has no rate record?","The DEFAULT group's rate is used.","intRate"],
    ["What happens when two users add a transaction or a payment at the same moment?","Both read the same last ID and add 1 — the second write collides (C-07).","addTran","billPay"],
    ["How are fees charged?","They are not — the fee paragraph is empty (C-06).","intFees"],
  ],
  frs: [
    ["FR-001","System MUST reject a daily transaction whose card number is not in the card cross-reference, with reason 100.","CBTRN02C · 1500-A-LOOKUP-XREF",["postXref"]],
    ["FR-002","System MUST reject a daily transaction whose account does not exist, with reason 101.","CBTRN02C · 1500-B-LOOKUP-ACCT",["postAcct"]],
    ["FR-003","System MUST reject a transaction that would exceed the account's credit limit, with reason 102. [NEEDS CLARIFICATION: the test uses cycle credit − cycle debit + amount, not the account balance. See C-01]","CBTRN02C · 1500-B-LOOKUP-ACCT",["postAcct"]],
    ["FR-004","System MUST reject a transaction originated after the account's expiration date, with reason 103.","CBTRN02C · 1500-B-LOOKUP-ACCT",["postAcct"]],
    ["FR-005","System MUST write every rejected transaction with its reason to the daily rejects file and end the job with return code 4. [NEEDS CLARIFICATION: only one reason is kept when several apply. See C-02]","CBTRN02C · 2500-WRITE-REJECT-REC · DALYREJS",["postMain","postAcct"]],
    ["FR-006","System MUST post a valid transaction by updating (or creating) its category balance, adding it to the account balance and cycle totals, and writing it to the transaction file with a processing timestamp. [NEEDS CLARIFICATION: the three updates are not atomic. See C-03]","CBTRN02C · 2000-POST-TRANSACTION",["postTran","postTcat","postUpd"]],
    ["FR-007","System MUST calculate monthly interest per account, transaction type and category as balance × annual rate ÷ 1200, using the DEFAULT disclosure group when the account's group has no rate, and skipping zero rates.","CBACT04C · 1200 / 1300",["intMain","intCalc","intRate"]],
    ["FR-008","System MUST write each interest amount as a system transaction (type 01, category 05) and add the account's total interest to its balance, resetting cycle credit and debit to zero.","CBACT04C · 1300-B-WRITE-TX · 1050-UPDATE-ACCOUNT",["intWrite","intUpd"]],
    ["FR-009","System MUST calculate fees during the interest run. [NEEDS CLARIFICATION: the paragraph is empty — “To be implemented”. See C-06]","CBACT04C · 1400-COMPUTE-FEES",["intFees"]],
    ["FR-010","System MUST let a user pay an account's full balance online after confirmation, recording a type 02 / category 2 transaction and reducing the balance by the amount. [NEEDS CLARIFICATION: category balances are not reduced (C-04) and the payment is stored as a positive amount (C-09)]","COBIL00C · CB00",["billPay"]],
    ["FR-011","System MUST validate an online transaction: all fields present, numeric type, category and merchant ID, amount in the form -99999999.99, dates in YYYY-MM-DD form and valid. [NEEDS CLARIFICATION: no limit, expiration or balance update. See C-05]","COTRN02C · VALIDATE-INPUT-DATA-FIELDS",["addVal"]],
    ["FR-012","System MUST give each new online transaction the next ID after the highest in the file. [NEEDS CLARIFICATION: not safe for concurrent users. See C-07]","COTRN02C · COBIL00C",["addTran","billPay"]],
    ["FR-013","System MUST produce a statement per card from customer, account and transaction data, in text and HTML, and convert it to PDF in the following job.","CBSTM03A · CBSTM03B · TXT2PDF1",["stmtEv","schedule"]],
    ["FR-014","System MUST produce a transaction report enriched with type and category descriptions, with page, account and grand totals, and let users request it online.","CBTRN03C · CORPT00C · CR00",["rptEv","rptSub"]],
    ["FR-015","System MUST run interest calculation once per cycle. [NEEDS CLARIFICATION: INTCALC is not in the CA-7 schedule. See C-08]","INTCALC · schedule",["schedule"]],
  ],
  entities: [
    ["DailyTransaction","DALYTRAN-RECORD","The day's input feed: id, type, category, source, description, amount, merchant id/name/city/zip, card number, origin timestamp."],
    ["Transaction","TRAN-RECORD · TRANSACT (VSAM KSDS)","A posted or entered transaction — the daily fields plus a processing timestamp."],
    ["Account","ACCOUNT-RECORD · ACCTDATA (VSAM KSDS)","Current balance, credit limit, current-cycle credit and debit, expiration date, disclosure group."],
    ["CardCrossReference","CARD-XREF-RECORD · CARDXREF (VSAM KSDS)","Maps a card number to its account."],
    ["CategoryBalance","TRAN-CAT-BAL-RECORD · TCATBALF (VSAM KSDS)","Balance per account, transaction type and category — the base for interest."],
    ["DisclosureGroup","DIS-GROUP-RECORD · DISCGRP (VSAM KSDS)","Interest rate per account group, transaction type and category; a DEFAULT group exists."],
    ["Reject","DALYREJS (GDG)","A rejected daily transaction with its reason code and description."],
  ],
  sc: [
    ["SC-001","Every daily transaction ends up either posted or rejected with a reason — never both, never neither."],
    ["SC-002","For every account, the change in balance equals posted amounts plus interest minus payments."],
    ["SC-003","For the same input files, posting, interest and statement outputs are identical before and after any migration."],
    ["SC-004","All 13 entry points keep their file layouts and screen fields until a delta spec changes them."],
  ],
  assumptions: [
    "Amounts are signed; positive daily amounts are charges and negative amounts are credits, as the posting code treats them.",
    "Interest rates in the disclosure-group file are annual percentages (divided by 1200 for a monthly rate).",
    "Pending authorizations (IMS/DB2/MQ) are a separate domain and are specified separately.",
    "This is an as-is baseline: it describes observed behaviour, including behaviour that may be unintended.",
  ],
  clar: [
    { id:"C-01", t:"The over-limit check does not use the balance", impact:"high", ev:["postAcct","postUpd","intUpd"], fr:"FR-003",
      found:"The limit test computes cycle credit − cycle debit + amount. Debits are stored as negative numbers, so subtracting them adds payments back; and the interest job resets both cycle totals to zero, so balances carried from earlier cycles are ignored.",
      ask:"Should the limit be tested against the current balance (ACCT-CURR-BAL) plus the new amount?" },
    { id:"C-02", t:"Only the last reject reason is kept", impact:"low", ev:["postAcct"], fr:"FR-005",
      found:"When a transaction is both over the limit and after expiration, reason 103 overwrites 102.",
      ask:"Should all failing reasons be recorded, or is one — in a defined order of precedence — enough?" },
    { id:"C-03", t:"Posting is not atomic", impact:"high", ev:["postTran","postUpd"], fr:"FR-006",
      found:"Posting updates the category balance, then rewrites the account, then writes the transaction. If the account rewrite fails (reason 109) the transaction is still written and not counted as a reject — balances and history disagree.",
      ask:"Should a failed account update stop the transaction, reject it, or abend the job?" },
    { id:"C-04", t:"Online payments do not reduce the balances interest is charged on", impact:"high", ev:["billPay","intCalc","crud"], fr:"FR-010",
      found:"Bill payment updates the account balance and writes a transaction, but not the category-balance file. Interest is calculated from that file, so a paid balance can still attract interest.",
      ask:"Should a payment reduce category balances, and in which order of categories?" },
    { id:"C-05", t:"Online add-transaction bypasses posting", impact:"medium", ev:["addTran","addVal"], fr:"FR-011",
      found:"CT02 writes directly to the transaction history with a user-typed processing date: no card or account lookup, no limit or expiration check, no balance update.",
      ask:"Is CT02 a data-entry tool for tests and corrections, or should it feed the posting run?" },
    { id:"C-06", t:"Fees are not implemented", impact:"medium", ev:["intFees"], fr:"FR-009",
      found:"1400-COMPUTE-FEES is performed on every interest calculation but contains only the comment “To be implemented”.",
      ask:"Which fees exist (late, over-limit, annual), and should the target system implement them?" },
    { id:"C-07", t:"Transaction IDs can collide", impact:"medium", ev:["addTran","billPay"], fr:"FR-012",
      found:"Bill payment and add-transaction both read the highest ID in the file and add 1. Two users at the same moment get the same ID, and the second write fails on a duplicate key.",
      ask:"What should generate transaction IDs — a sequence, a timestamp, the posting run?" },
    { id:"C-08", t:"Interest runs outside the schedule", impact:"medium", ev:["schedule"], fr:"FR-015",
      found:"INTCALC, and COMBTRAN which merges the interest transactions into the history, are not in the CA-7 chain; a run_interest_calc.sh script exists.",
      ask:"Who runs interest, when, and what happens if it is missed or run twice?" },
    { id:"C-09", t:"Payments are stored as positive amounts", impact:"medium", ev:["billPay","postUpd"], fr:"FR-010",
      found:"Posting treats positive amounts as charges (added to the balance). Online bill payment stores the payment as a positive amount and subtracts it itself. Any later process that re-reads the transaction file would count the payment as a charge.",
      ask:"Confirm the sign convention for payments and credits across online and batch." },
  ],
};
const NC_COUNT = SPEC.clar.length;

let specTab = "overview";
const SPEC_TABS = [["overview","Overview",false],["spec","spec.md",true],["plan","plan.md",true],["data","data-model.md",true],["contracts","contracts/",true],["clar","Clarifications",false],["delta","To-be delta",false]];
function setSpecTab(t){ specTab = t; STMTS = []; document.getElementById("doc").innerHTML = appSpec(); paintGrounding(); document.querySelector(".tabs")?.scrollIntoView({block:"nearest"}); }
function ncMark(text){ return esc(text).replace(/\[NEEDS CLARIFICATION: ([^\]]+)\]/g, '<mark class="nc">[NEEDS CLARIFICATION: $1]</mark>'); }

function appSpec(){
  STMTS = [];
  const tabs = SPEC_TABS.map(([id,label,file])=>`<button class="tab ${file?"file":""} ${specTab===id?"on":""}" onclick="setSpecTab('${id}')">${label}${id==="clar"?`<span class="cnt">${NC_COUNT}</span>`:""}</button>`).join("");
  const fns = { overview:specOverview, spec:specMain, plan:specPlan, data:specData, contracts:specContracts, clar:specClar, delta:specDelta };
  const body = fns[specTab]();
  const all = []; for (const k in fns) { if (k==="delta") continue; STMTS = []; fns[k](); all.push(...STMTS); }
  STMTS = all;
  return `
  <div class="doc-head"><div><div class="eyebrow">Application Specification · as-is</div><h1>${SHOW_H}</h1>
    <div class="meta">CardDemo-Cobol · 13 entry points (5 online, 8 batch) · 11 programs · 7 files · GitHub Spec Kit format · snapshot ${SYSTEM.snapshot}</div></div>
    <div class="doc-actions"><button class="btn btn-primary btn-sm" onclick="openExport()">Export for agents</button>
    <button class="btn btn-ghost btn-sm" onclick="toast('Export is not wired up in this prototype')">Export PDF</button></div></div>
  ${domainBar("specification")}
  <div class="grounding" id="grounding"></div>
  <div class="tabs">${tabs}</div>
  ${body}`;
}
function fileHead(path, note){ return `<div class="filehead"><span><code>specs/001-transactions-billing/${path}</code></span><span>${note}</span></div>`; }

function specOverview(){
  const flow = ["Daily file","Validate","Post","Rejects","Interest","Merge","Statements","Pay online"];
  const w = 118, gap = 10;
  const svg = `<svg viewBox="0 0 ${flow.length*(w+gap)} 92" role="img" aria-label="Transactions and billing flow"><g font-family="Inter,sans-serif">${flow.map((f,i)=>{
      const x=i*(w+gap), hot = i===2||i===4;
      return `<path d="M${x},14 h${w-12} l12,24 l-12,24 h-${w-12} l${i?12:0},-24 z" fill="${hot?"#624ABB":i===3?"#FFF4ED":"#fff"}" stroke="${hot?"#624ABB":i===3?"#C4320A":"#C7C9E0"}"/>
      <text x="${x+w/2+(i?4:-2)}" y="42" text-anchor="middle" font-size="12" font-weight="600" fill="${hot?"#fff":"#0C0613"}">${f}</text>`}).join("")}
      <text x="${2*(w+gap)}" y="84" font-size="11" fill="#463589" font-weight="600">nightly: POSTTRAN · monthly: INTCALC → COMBTRAN · nightly: CREASTMT → PDF · online: CB00</text></g></svg>`;
  return `
  <h2>In plain language</h2>
  <p>${X("Transactions &amp; Billing is how CardDemo turns card activity into balances, interest and statements. Every night a batch job posts the day's transactions to the accounts; once a cycle, another job charges interest; statements are then produced and turned into PDFs.","domTx","schedule")}
     ${X("During the day, back-office users can look up the transaction history, key in a transaction, pay an account's balance and request a transaction report — five CICS transactions.","domTx")}
     ${X("All of it works on the same VSAM files: the transaction history, the accounts, the card cross-reference and a category-balance file that interest is calculated from.","crud")}</p>
  <div class="flowfig">${svg}</div>
  <h2>Capabilities</h2>
  <div class="caps">${CAPS.map(c=>`<div class="cap"><span class="n">${c[2]}</span><b>${c[0]}</b><span>${c[1]}</span></div>`).join("")}</div>
  <p style="font-size:13px;color:var(--muted);margin-top:8px">${X("Numbers are entry points per capability — 13 in total: 5 CICS transactions and 8 batch jobs.","domTx")}</p>
  <h2>Who uses it</h2>
  <ul class="plain">
    <li><b>Back-office user</b> — ${X("signs on to CICS and uses the transaction list, view, add, bill-payment and report screens.","domTx","nav")}</li>
    <li><b>Operations</b> — ${X("runs the nightly CA-7 chain (posting, statements) and the jobs outside it (interest, merge, report).","schedule")}</li>
    <li><b>Cardholder</b> — ${I("never touches the system, but receives the statement and pays the interest it calculates.","The cardholder appears only as data (customer, account, card) and as the statement recipient.","stmtEv")}</li>
  </ul>
  <h2>What needs a decision</h2>
  <p>${I(`Reading the paragraphs surfaced ${NC_COUNT} points where behaviour is ambiguous or likely unintended — from an over-limit test that ignores the balance to fees that were never implemented. They are marked [NEEDS CLARIFICATION] so no one migrates a guess.`,
      "Each clarification quotes the paragraph that raised it. Whether it is a defect is the application team's call.","postAcct","intFees","billPay")}</p>
  <button class="btn btn-ghost btn-sm" onclick="setSpecTab('clar')">Review ${NC_COUNT} clarifications →</button>`;
}

function specMain(){
  const s = SPEC;
  return `${fileHead("spec.md","What the system does and why — technology-agnostic")}
  <div class="specmeta"><b>Feature Specification:</b> Transactions &amp; Billing (as-is baseline)<br>
    <b>Feature Branch:</b> <code>001-transactions-billing</code> · <b>Created:</b> 2026-09-28 · <b>Status:</b> As-is — generated from CAST Imaging<br>
    <b>Input:</b> Deterministic analysis of CardDemo-Cobol, snapshot ${SYSTEM.snapshot}</div>
  <h2>User Scenarios &amp; Testing</h2>
  ${s.stories.map((st,i)=>`<div class="story">
    <h3>User Story ${i+1} — ${st.t} <span class="prio">Priority: ${st.p}</span>
      <a style="font-size:12px;font-weight:600;cursor:pointer" onclick="go('#/ws/stories')">EP-0${i+1} · detailed stories →</a></h3>
    <p style="margin:0">${X(st.d, ...st.ev)}</p>
    <div class="k">Why this priority</div><p style="margin:0;font-size:14.5px">${I(st.why,"Priority reflects money impact and how many other functions depend on it.","domTx")}</p>
    <div class="k">Independent test</div><p style="margin:0;font-size:14.5px">${st.test}</p>
    <div class="k">Acceptance scenarios</div>
    <ol>${st.ac.map(a=>`<li class="gwt"><b>Given</b> ${a[0]}, <b>When</b> ${a[1]}, <b>Then</b> ${a[2]}.</li>`).join("")}</ol>
  </div>`).join("")}
  <h2>Edge Cases</h2>
  <ul class="plain">${s.edge.map(e=>`<li><b>${e[0]}</b> ${X(e[1], ...e.slice(2))}</li>`).join("")}</ul>
  <h2>Requirements</h2>
  <h3 style="font-size:15px;color:var(--ink);margin:0 0 10px">Functional Requirements</h3>
  <div class="reqs">${s.frs.map(f=>`<div class="req"><span class="id">${f[0]}</span><div>${X(ncMark(f[1]), ...f[3])}<span class="trace">↳ ${esc(f[2])}</span></div></div>`).join("")}</div>
  <h3 style="font-size:15px;color:var(--ink);margin:24px 0 10px">Key Entities</h3>
  <ul class="plain">${s.entities.map(e=>`<li><b>${e[0]}</b> <code style="color:var(--muted)">${e[1]}</code> — ${e[2]}</li>`).join("")}</ul>
  <h2>Success Criteria</h2>
  <p style="font-size:13.5px;color:var(--muted)">For an as-is baseline, success criteria are the guarantees any change must preserve.</p>
  <div class="reqs">${s.sc.map(c=>`<div class="req"><span class="id">${c[0]}</span><div>${I(c[1],"Derived from the functional requirements as regression guarantees.","postMain","intMain")}</div></div>`).join("")}</div>
  <h2>Assumptions</h2>
  <ul class="plain">${s.assumptions.map(a=>`<li>${a}</li>`).join("")}</ul>`;
}

function specPlan(){
  const row = (k,v) => `<tr><td style="width:190px;font-weight:600;color:var(--ink)">${k}</td><td>${v}</td></tr>`;
  return `${fileHead("plan.md","How it is built today — the technical baseline")}
  <h2>Summary</h2>
  <p>${X("Transactions &amp; Billing is implemented as five CICS programs and six batch programs over shared VSAM files, driven by JCL jobs of which four run in the CA-7 nightly chain.","domTx","schedule","crud")}</p>
  <h2>Technical Context</h2>
  <div class="tblwrap"><table class="tbl"><tbody>
    ${row("Language/Version", `COBOL · CICS · z/OS JCL <mark class="nc">[NEEDS CLARIFICATION: compiler, CICS and z/OS levels are not part of the analysis]</mark>`)}
    ${row("Primary Dependencies", X("CICS (BMS maps, file control, transient data), CA-7 scheduler, IDCAMS and SORT utilities, CSUTLDTC date routine","stats","nav","schedule"))}
    ${row("Storage", X("VSAM KSDS — TRANSACT, ACCTDATA, CARDXREF, TCATBALF, DISCGRP, TRANTYPE, TRANCATG; GDGs — daily file, rejects, system transactions, report","data","crud"))}
    ${row("Testing", `<mark class="nc">[NEEDS CLARIFICATION: no test assets were part of the analysis]</mark>`)}
    ${row("Target Platform", "As-is: IBM z/OS — see Target State Architecture")}
    ${row("Project Type", X("Mainframe application — CICS online + JCL batch","tx"))}
    ${row("Performance Goals", `<mark class="nc">[NEEDS CLARIFICATION: batch window and online response targets are not in code]</mark>`)}
    ${row("Constraints", X("Online and batch write the same account file; posting and interest are sequential, file-based and not transactional","crud","postTran"))}
    ${row("Scale/Scope", X("13 entry points, 11 programs, 7 business files","domTx","crud"))}
  </tbody></table></div>
  <h2>Constitution Check</h2>
  <p style="font-size:14.5px">Not applicable to an as-is baseline. Agree the constitution with the application team before the first delta spec.</p>
  <h2>Project Structure</h2>
  <div class="ev"><div class="evh"><b>Source code (as-is)</b><code class="call">object_details(…).filePath · transactions(…).startPoint.fullname</code></div><pre>aws-mainframe-modernization-carddemo-main/app/
├── cbl/CBTRN02C.cbl            # nightly posting
├── cbl/CBACT04C.cbl            # interest
├── cbl/COBIL00C.cbl            # bill payment (CB00)
├── cbl/COTRN02C.cbl            # add transaction (CT02)
├── cbl/…                       # COTRN00C, COTRN01C, CORPT00C, CBTRN03C, CBSTM03A/B
├── jcl/                        # INTCALC, TRANREPT, COMBTRAN, TRANBKP
├── scheduler/carddemo.ca7/     # POSTTRAN, CREASTMT, TXT2PDF1, TCATBALF
└── csd/CARDDEMO.CSD            # CICS definitions CT00–CT02, CB00, CR00</pre></div>
  <p style="font-size:13px;color:var(--muted)">${X("Paths come from the source locations and entry-point names returned by Imaging; the four programs named in full were confirmed by file path.","postMain","billPay","addTran","schedule")}</p>`;
}

function specData(){
  const cols = arr => `<div class="cols">${arr.map(c=>{const [n,k]=c.split("|");return `<span class="col ${k||""}">${n}</span>`}).join("")}</div>`;
  return `${fileHead("data-model.md","Records, fields and keys — from the code that reads them")}
  <h2>Entities</h2>
  <div class="entity"><h4>Account <code>ACCOUNT-RECORD · ACCTDATA</code></h4><div class="body">${X("Read and rewritten by posting, interest and bill payment; the cycle totals drive the limit check.","postAcct","postUpd","intUpd")}
    ${cols(["ACCT-ID|key","ACCT-CURR-BAL","ACCT-CREDIT-LIMIT","ACCT-CURR-CYC-CREDIT|warn","ACCT-CURR-CYC-DEBIT|warn","ACCT-EXPIRAION-DATE","ACCT-GROUP-ID"])}
    <div style="margin-top:8px;font-size:12.5px;color:var(--muted)">Field names exactly as in the code — including the misspelled EXPIRAION.</div></div></div>
  <div class="entity"><h4>Transaction <code>TRAN-RECORD · TRANSACT</code></h4><div class="body">${X("Written by posting, bill payment and add-transaction; merged with interest transactions by COMBTRAN.","postTran","billPay","addTran")}
    ${cols(["TRAN-ID|key","TRAN-TYPE-CD","TRAN-CAT-CD","TRAN-SOURCE","TRAN-DESC","TRAN-AMT","TRAN-MERCHANT-ID","TRAN-MERCHANT-NAME","TRAN-MERCHANT-CITY","TRAN-MERCHANT-ZIP","TRAN-CARD-NUM","TRAN-ORIG-TS","TRAN-PROC-TS"])}</div></div>
  <div class="entity"><h4>CategoryBalance <code>TRAN-CAT-BAL-RECORD · TCATBALF</code></h4><div class="body">${X("Keyed by account, type and category; created on first posting; the base for interest.","postTcat","intCalc")}
    ${cols(["TRANCAT-ACCT-ID|key","TRANCAT-TYPE-CD|key","TRANCAT-CD|key","TRAN-CAT-BAL"])}</div></div>
  <div class="entity"><h4>DisclosureGroup <code>DIS-GROUP-RECORD · DISCGRP</code></h4><div class="body">${X("Interest rate by account group, type and category, with a DEFAULT group.","intRate")}
    ${cols(["FD-DIS-ACCT-GROUP-ID|key","FD-DIS-TRAN-TYPE-CD|key","FD-DIS-TRAN-CAT-CD|key","DIS-INT-RATE"])}</div></div>
  <div class="entity"><h4>CardCrossReference <code>CARD-XREF-RECORD · CARDXREF</code></h4><div class="body">${X("Card number to account — read by every posting, interest and statement run.","postXref","intMain")}
    ${cols(["XREF-CARD-NUM|key","XREF-ACCT-ID"])}</div></div>
  <h2>Relationships</h2>
  <div class="flowfig"><svg viewBox="0 0 760 150" role="img" aria-label="Record relationships"><g font-family="Inter,sans-serif" font-size="12">
    ${[["CardCrossReference",0,20],["Account",200,20],["CategoryBalance",400,20],["DisclosureGroup",600,20],["Transaction",200,95],["DailyTransaction",0,95]].map(([n,x,y])=>`<rect x="${x}" y="${y}" width="150" height="36" rx="8" fill="${n==="Account"||n==="Transaction"?"#624ABB":"#fff"}" stroke="#C7C9E0"/><text x="${x+75}" y="${y+23}" text-anchor="middle" font-weight="600" fill="${n==="Account"||n==="Transaction"?"#fff":"#0C0613"}">${n}</text>`).join("")}
    <g stroke="#624ABB" stroke-width="1.5" fill="none"><path d="M150,38 H200"/><path d="M350,38 H400"/><path d="M550,38 H600"/><path d="M150,113 H200"/><path d="M75,56 V95"/></g>
    <g font-size="10.5" fill="#463589" font-weight="600"><text x="152" y="32">card → acct</text><text x="358" y="32">1 : n</text><text x="552" y="32">rate by key</text><text x="156" y="107">posted</text><text x="82" y="80">card no.</text></g></g></svg></div>`;
}

function specContracts(){
  return `${fileHead("contracts/entry-points.md","13 entry points · the request surface of the domain")}
  <p style="margin-top:16px">${X("Every row is an entry point in CAST Imaging — a CICS transaction or a batch job. “Call graph” is the number of objects it reaches; “Schedule” shows whether the job is in the CA-7 chain.","domTx","schedule")}</p>
  <div class="tblwrap"><table class="tbl"><thead><tr><th>Kind</th><th>Entry point</th><th>Program</th><th>Purpose</th><th>Schedule</th><th style="text-align:right">Call graph</th></tr></thead><tbody>
  ${CONTRACTS.map(c=>`<tr><td><span class="verb ${c[0]==="CICS"?"GET":c[0]==="CA-7"?"POST":"PUT"}">${c[0]}</span></td><td class="m">${c[1]}</td><td class="m">${c[2]}</td><td>${c[4]}</td><td class="${c[5]==="scheduled"?"yes":c[5]==="—"?"":"no"}">${c[5]==="scheduled"?"✓ CA-7":c[5]}</td><td style="text-align:right;font-weight:600">${fmt(c[6])}</td></tr>`).join("")}
  </tbody></table></div>
  <p style="font-size:13px;color:var(--muted);margin-top:10px">Record layouts per file and BMS screen fields per transaction are generated from the copybooks in the full export.</p>`;
}

function specClar(){
  const col = { high:"background:var(--crit-bg);color:var(--crit)", medium:"background:var(--med-bg);color:var(--med)", low:"background:#F2F0F5;color:#4B4652" };
  return `
  <p style="margin-top:22px">${I(`CAST found ${NC_COUNT} places where the code's behaviour is ambiguous, inconsistent, or likely not what was intended. Each one is a question for the application team — answered once, it becomes a requirement instead of an assumption.`,
     "The source behind each item is extracted; calling it a question rather than a requirement is a judgment.","postAcct","billPay")}</p>
  ${SPEC.clar.map(c=>`<div class="clar">
    <div class="h"><code>${c.id}</code><h4>${c.t}</h4><span class="impact" style="${col[c.impact]}">${c.impact} impact</span>${c.fr!=="—"?`<span style="font-size:12px;color:var(--muted)">affects ${c.fr}</span>`:""}</div>
    <p>${I(c.found,"Interpretation of the quoted source; open the evidence to read the code.",...c.ev)}</p>
    <div class="ask"><b>Question for the team:</b> ${c.ask}</div></div>`).join("")}`;
}

function specDelta(){
  return `
  <div style="margin-top:22px"><span class="preview-ribbon">Preview</span></div>
  <h2 style="margin-top:12px">From as-is to to-be</h2>
  <p>State a change. ${PRODUCT} produces a <b>delta spec</b>: which requirements are preserved, which change and what is new — as a new Spec Kit feature an AI agent can implement against the baseline.</p>
  <div class="delta-in"><input value="Replace nightly posting with real-time posting in a cloud ledger service" aria-label="Change intent"><button class="btn btn-primary" onclick="toast('Delta spec generation is the next phase of the prototype')">Generate delta</button></div>
  <div class="filehead"><span><code>specs/002-realtime-posting/spec.md</code></span><span>illustrative output</span></div>
  <div class="delta-grid" style="margin-top:12px">
    <div class="dcol"><h4 style="color:var(--good)">Preserved · 8</h4><ul><li>FR-001, FR-002, FR-004 — card, account and expiration checks</li><li>FR-007, FR-008 — interest formula and interest transactions</li><li>FR-013, FR-014 — statements and report</li><li>SC-002 — balances reconcile</li></ul></div>
    <div class="dcol"><h4 style="color:var(--med)">Changed · 5</h4><ul><li>FR-003 — limit tested against the balance (answers C-01)</li><li>FR-005 — all reject reasons kept (C-02)</li><li>FR-006 — posting is one atomic transaction (C-03)</li><li>FR-010 — payments reduce category balances (C-04)</li><li>FR-012 — IDs from a sequence (C-07)</li></ul></div>
    <div class="dcol"><h4 style="color:var(--purple)">New · 3</h4><ul><li>FR-N01 — posting API called per transaction</li><li>FR-N02 — daily file kept as a replay/backfill path</li><li>FR-N03 — posted-transaction event for statements and fraud</li></ul></div>
  </div>
  <div class="clar" style="margin-top:14px"><div class="h"><code>Blocking</code><h4>Resolve before building</h4></div>
    <p>${I("C-01, C-03 and C-04 change what balances mean. Implementing real-time posting without answering them would bake today's accidents into the new ledger.","Mapping of open clarifications onto the requirements affected by the change.","postAcct","postUpd","billPay")}</p></div>`;
}

/* ---------------- Markdown export (Spec Kit files) ---------------- */
function mdSpec(){
  const s = SPEC; const L = [];
  L.push("# Feature Specification: Transactions & Billing (as-is baseline)","","**Feature Branch**: `001-transactions-billing`  ","**Created**: 2026-09-28  ",
    "**Status**: As-is — generated by CAST "+PRODUCT+" from CAST Imaging  ","**Input**: Deterministic analysis of CardDemo-Cobol, snapshot "+SYSTEM.snapshot,"",
    "> Every requirement is traced to CAST Imaging evidence (`↳` lines). Items marked [NEEDS CLARIFICATION] describe observed behaviour that must be confirmed before it is relied on.","",
    "## User Scenarios & Testing *(mandatory)*","");
  s.stories.forEach((st,i)=>{ L.push(`### User Story ${i+1} - ${st.t} (Priority: ${st.p})`,"",st.d,"",`**Why this priority**: ${st.why}`,"",`**Independent Test**: ${st.test}`,"","**Acceptance Scenarios**:","");
    st.ac.forEach((a,j)=>L.push(`${j+1}. **Given** ${a[0]}, **When** ${a[1]}, **Then** ${a[2]}`)); L.push("","---",""); });
  L.push("### Edge Cases",""); s.edge.forEach(e=>L.push(`- ${e[0]} ${e[1]}`));
  L.push("","## Requirements *(mandatory)*","","### Functional Requirements",""); s.frs.forEach(f=>L.push(`- **${f[0]}**: ${f[1]}  `,`  ↳ \`${f[2]}\``));
  L.push("","### Key Entities",""); s.entities.forEach(e=>L.push(`- **${e[0]}** (\`${e[1]}\`): ${e[2]}`));
  L.push("","## Success Criteria *(mandatory)*",""); s.sc.forEach(c=>L.push(`- **${c[0]}**: ${c[1]}`));
  L.push("","## Assumptions",""); s.assumptions.forEach(a=>L.push(`- ${a}`));
  L.push("","## Clarifications",""); s.clar.forEach(c=>L.push(`- **${c.id} — ${c.t}** (${c.impact} impact${c.fr!=="—"?`, affects ${c.fr}`:""}): ${c.found}  `,`  [NEEDS CLARIFICATION: ${c.ask}]`));
  return L.join("\n");
}
function mdPlan(){
  return `# Implementation Plan: Transactions & Billing (as-is baseline)

**Branch**: \`001-transactions-billing\` | **Spec**: [spec.md](./spec.md)

## Summary

As-is technical baseline generated from CAST Imaging: five CICS programs and six batch programs over shared VSAM files, driven by JCL jobs of which four run in the CA-7 nightly chain.

## Technical Context

**Language/Version**: COBOL, CICS, z/OS JCL [NEEDS CLARIFICATION: compiler, CICS and z/OS levels]
**Primary Dependencies**: CICS (BMS, file control, TDQ), CA-7, IDCAMS, SORT, CSUTLDTC
**Storage**: VSAM KSDS TRANSACT, ACCTDATA, CARDXREF, TCATBALF, DISCGRP, TRANTYPE, TRANCATG; GDGs for daily input, rejects, system transactions and report
**Testing**: [NEEDS CLARIFICATION: no test assets in the analysis]
**Target Platform**: As-is IBM z/OS — see Target State Architecture
**Project Type**: Mainframe CICS online + JCL batch
**Performance Goals**: [NEEDS CLARIFICATION: batch window and online response targets]
**Constraints**: online and batch write the same account file; posting and interest are sequential and not transactional
**Scale/Scope**: 13 entry points, 11 programs, 7 business files

## Project Structure

\`\`\`text
aws-mainframe-modernization-carddemo-main/app/
├── cbl/CBTRN02C.cbl   # posting
├── cbl/CBACT04C.cbl   # interest
├── cbl/COBIL00C.cbl   # bill payment (CB00)
├── cbl/COTRN02C.cbl   # add transaction (CT02)
├── jcl/               # INTCALC, TRANREPT, COMBTRAN, TRANBKP
├── scheduler/carddemo.ca7/   # POSTTRAN, CREASTMT, TXT2PDF1, TCATBALF
└── csd/CARDDEMO.CSD
\`\`\`
`;
}
function mdData(){
  return `# Data Model: Transactions & Billing (as-is)

Record and field names as they appear in the code returned by CAST Imaging.

## Account — ACCOUNT-RECORD (ACCTDATA, VSAM KSDS)
ACCT-ID (key), ACCT-CURR-BAL, ACCT-CREDIT-LIMIT, ACCT-CURR-CYC-CREDIT, ACCT-CURR-CYC-DEBIT, ACCT-EXPIRAION-DATE, ACCT-GROUP-ID

## Transaction — TRAN-RECORD (TRANSACT, VSAM KSDS)
TRAN-ID (key), TRAN-TYPE-CD, TRAN-CAT-CD, TRAN-SOURCE, TRAN-DESC, TRAN-AMT, TRAN-MERCHANT-ID/NAME/CITY/ZIP, TRAN-CARD-NUM, TRAN-ORIG-TS, TRAN-PROC-TS

## CategoryBalance — TRAN-CAT-BAL-RECORD (TCATBALF)
TRANCAT-ACCT-ID + TRANCAT-TYPE-CD + TRANCAT-CD (key), TRAN-CAT-BAL

## DisclosureGroup — DIS-GROUP-RECORD (DISCGRP)
FD-DIS-ACCT-GROUP-ID + FD-DIS-TRAN-TYPE-CD + FD-DIS-TRAN-CAT-CD (key), DIS-INT-RATE — group DEFAULT used as fallback

## CardCrossReference — CARD-XREF-RECORD (CARDXREF)
XREF-CARD-NUM (key), XREF-ACCT-ID
`;
}
function mdContracts(){
  return `# Contract: Transactions & Billing entry points (as-is)

| Kind | Entry point | Program | Purpose | Schedule | Call graph (objects) |
|---|---|---|---|---|---|
${CONTRACTS.map(c=>`| ${c[0]} | \`${c[1]}\` | ${c[2]} | ${c[4]} | ${c[5]} | ${c[6]} |`).join("\n")}
`;
}
const EXPORT_FILES = [
  ["specs/001-transactions-billing/spec.md", mdSpec],
  ["specs/001-transactions-billing/plan.md", mdPlan],
  ["specs/001-transactions-billing/data-model.md", mdData],
  ["specs/001-transactions-billing/contracts/entry-points.md", mdContracts],
];
