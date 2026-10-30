// Build a compact icon pack (data URIs) from the official provider icon sets — icons are embedded unmodified.
// Usage: node build-icons.mjs <icons-dir>   (icons-dir contains unzipped folders: azure/, aws/, gcp-core/, gcp-legacy/)
// Downloads (ask the user first): Azure  https://learn.microsoft.com/azure/architecture/icons/  (Azure_Public_Service_Icons_V*.zip)
//                                 AWS    https://aws.amazon.com/architecture/icons/            (Icon-package_*.zip)
//                                 Google https://cloud.google.com/icons                        (core-products-icons.zip + google-cloud-legacy-icons.zip)
// Output: <icons-dir>/../icon-pack.js  →  const CLOUD_ICONS = { Azure:{edge,waf,web,idp,managed,k8s,vm,db,cache,obj,secrets,reg,obs,email}, AWS:{…}, GCP:{…}, SES }
import fs from "fs"; import path from "path";
const R = process.argv[2]; if (!R) { console.error("usage: node build-icons.mjs <icons-dir>"); process.exit(1); }
const walk = d => fs.readdirSync(d,{withFileTypes:true}).flatMap(e => e.isDirectory() ? walk(path.join(d,e.name)) : [path.join(d,e.name)]);
const all = { azure: walk(R+"/azure"), aws: walk(R+"/aws"), gcpc: walk(R+"/gcp-core"), gcpl: walk(R+"/gcp-legacy") };
const find = (set, re) => { const f = all[set].filter(p => p.endsWith(".svg") && re.test(path.basename(p))); if (!f.length) throw new Error("not found "+re); return f.sort((a,b)=>a.length-b.length)[0]; };
const MAP = {
  Azure: { edge:["azure",/Front-Door-and-CDN-Profiles/], waf:["azure",/Web-Application-Firewall-Policies/], web:["azure",/-Static-Apps\.svg/], idp:["azure",/-Enterprise-Applications\.svg/],
    managed:["azure",/Container-Apps-Environments/], k8s:["azure",/10023-icon-service-Kubernetes-Services/], vm:["azure",/VM-Scale-Sets/],
    db:["azure",/Azure-Database-PostgreSQL-Server\.svg/], cache:["azure",/10137-icon-service-Cache-Redis/], obj:["azure",/10086-icon-service-Storage-Accounts\.svg/],
    secrets:["azure",/Key-Vaults/], reg:["azure",/Container-Registries/], obs:["azure",/Application-Insights/], email:["azure",/Azure-Communication-Services/] },
  AWS: { edge:["aws",/^Arch_Amazon-CloudFront_48\.svg/], waf:["aws",/^Arch_AWS-WAF_48\.svg/], web:["aws",/^Arch_Amazon-Simple-Storage-Service_48\.svg/], idp:["aws",/^Arch_Amazon-Cognito_48\.svg/],
    managed:["aws",/^Arch_AWS-Fargate_48\.svg/], k8s:["aws",/^Arch_Amazon-Elastic-Kubernetes-Service_48\.svg/], vm:["aws",/^Arch_Amazon-EC2-Auto-Scaling_48\.svg/],
    db:["aws",/^Arch_Amazon-Aurora_48\.svg/], cache:["aws",/^Arch_Amazon-ElastiCache_48\.svg/], obj:["aws",/^Arch_Amazon-Simple-Storage-Service_48\.svg/],
    secrets:["aws",/^Arch_AWS-Secrets-Manager_48\.svg/], reg:["aws",/^Arch_Amazon-Elastic-Container-Registry_48\.svg/], obs:["aws",/^Arch_Amazon-CloudWatch_48\.svg/], email:["aws",/^Arch_Amazon-Simple-Email-Service_48\.svg/] },
  GCP: { edge:["gcpl",/^cloud_cdn\.svg/], waf:["gcpl",/^cloud_armor\.svg/], web:["gcpc",/^Cloud_Storage-512-color\.svg/], idp:["gcpl",/^identity-aware_proxy\.svg/],
    managed:["gcpc",/^CloudRun-512-color-rgb\.svg/], k8s:["gcpc",/^GKE-512-color\.svg/], vm:["gcpc",/^ComputeEngine-512-color-rgb\.svg/],
    db:["gcpc",/^CloudSQL-512-color\.svg/], cache:["gcpl",/^memorystore\.svg/], obj:["gcpc",/^Cloud_Storage-512-color\.svg/],
    secrets:["gcpl",/^secret_manager\.svg/], reg:["gcpl",/^artifact_registry\.svg/], obs:["gcpl",/^cloud_monitoring\.svg/], email:["aws",/^Arch_Amazon-Simple-Email-Service_48\.svg/] },
};
const out = {}; const report = [];
for (const [cloud, m] of Object.entries(MAP)) { out[cloud] = {};
  for (const [k,[set,re]] of Object.entries(m)) { const f = find(set, re); let svg = fs.readFileSync(f,"utf8").replace(/<\?xml[^>]*>/,"").replace(/<!--[\s\S]*?-->/g,"").replace(/\s{2,}/g," ").trim();
    out[cloud][k] = "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64"); report.push(`${cloud}.${k} ← ${path.basename(f)} (${svg.length} B)`); } }
out.SES = out.AWS.email;
fs.writeFileSync(R+"/../icon-pack.js", "const CLOUD_ICONS = " + JSON.stringify(out) + ";\n");
console.log(report.join("\n")); console.log("pack bytes:", fs.statSync(R+"/../icon-pack.js").size);
