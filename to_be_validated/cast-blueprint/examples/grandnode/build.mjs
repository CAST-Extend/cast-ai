// Assembles grandnode/index.html: the Blueprint shell and generic engine (frozen template) + GrandNode content.
import { readFileSync, writeFileSync } from "fs";
const T = readFileSync("../carddemo/engine-template.html", "utf8").split("\n");
const L = (a, b) => T.slice(a - 1, b).join("\n");
const S = f => readFileSync(`src/${f}`, "utf8");
const head = L(1, 693).replace("<h3>Shopizer e-commerce platform</h3>", "<h3>GrandNode e-commerce platform</h3>").replace("Reading the CAST Imaging analysis for 3 applications", "Reading the CAST Imaging analysis for GrandNode");
const out = [head, S("01-core.js"), L(971, 975), L(1098, 1109), L(1114, 1114), S("02-spec-rules-stories.js"), L(1669, 1696),
  L(1939, 1962).replace("cart-checkout.feature", "checkout-orders.feature"),
  L(2078, 2112).replace("<b>Endpoint</b>", "<b>Entry point</b>").replace("${fmt(size)} objects", '${size==null?"—":fmt(size)+" objects"}'),
  L(2145, 2149), S("03-diagrams-debt-ctx.js"), L(2626, 2652), L(2891, 2907),
  L(3012, 3040).replace('localStorage.getItem("blueprint-ctx")', "localStorage.getItem(CTX_KEY)").replace('localStorage.setItem("blueprint-ctx"', "localStorage.setItem(CTX_KEY"),
  L(3042, 3072), L(3074, 3087), L(3103, 3103), L(3343, 3366), S("04-plan.js"), L(3740, 3754), L(3852, 3880),
  "ctxLoad();\nrender();\n</script>\n</body>\n</html>\n"].join("\n");
writeFileSync("index.html", out); console.log("index.html", (out.length/1024).toFixed(0)+" KB");
