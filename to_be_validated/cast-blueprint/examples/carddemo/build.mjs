// Assembles carddemo/index.html: the Shopizer Blueprint shell and generic engine + CardDemo content.
import { readFileSync, writeFileSync } from "fs";
const T = readFileSync("engine-template.html", "utf8").split("\n");
const L = (a, b) => T.slice(a - 1, b).join("\n");          // 1-based inclusive line range from the template
const S = f => readFileSync(`src/${f}`, "utf8");

const head = L(1, 693)
  .replace("<h3>Shopizer e-commerce platform</h3>", "<h3>CardDemo credit card platform</h3>")
  .replace("Reading the CAST Imaging analysis for 3 applications", "Reading the CAST Imaging analysis for CardDemo-Cobol");

const parts = [
  head,
  S("01-core.js"),
  L(971, 975),            // docHead
  L(1098, 1109),          // paintGrounding
  L(1114, 1114),          // esc
  S("02-spec.js"),
  L(1669, 1696),          // export modal
  L(1939, 1962).replace("cart-checkout.feature", "transactions-billing.feature"),   // ruleCard, rulesCatalog
  S("03-rules-stories.js"),
  L(2078, 2112).replace("<b>Endpoint</b>", "<b>Entry point</b>"),                   // story cards
  L(2145, 2149),          // acText
  S("04-diagrams.js"),
  L(2626, 2652),          // seqSVG, seqMermaid
  S("05-debt-ctx.js"),
  L(2891, 2907),          // debtItem, debtRegister
  L(3012, 3040).replace('localStorage.getItem("blueprint-ctx")', "localStorage.getItem(CTX_KEY)").replace('localStorage.setItem("blueprint-ctx"', "localStorage.setItem(CTX_KEY"),
  L(3042, 3072),          // C(), openCustomer, ctxField
  L(3074, 3087),          // ctxSummary
  L(3103, 3103),          // CLOUD_ICONS (official provider icons)
  L(3343, 3366),          // HRS, SECS, PRICES
  S("06-plan.js"),
  L(3740, 3754),          // roiCurve
  L(3852, 3880),          // evidence drawer, toast
  "ctxLoad();\nrender();\n</script>\n</body>\n</html>\n",
];
const out = parts.join("\n");
writeFileSync("index.html", out);
console.log("index.html", (out.length / 1024).toFixed(0) + " KB");
