// Pull current Azure retail (list) prices for the target-state services — public, read-only API.
const region = process.argv[2] || "eastus";
const Q = {
  containerApps: `serviceName eq 'Azure Container Apps' and armRegionName eq '${region}' and priceType eq 'Consumption'`,
  postgres:      `serviceName eq 'Azure Database for PostgreSQL' and armRegionName eq '${region}' and priceType eq 'Consumption' and contains(productName,'Flexible Server')`,
  redis:         `serviceName eq 'Redis Cache' and armRegionName eq '${region}' and priceType eq 'Consumption'`,
  blob:          `serviceName eq 'Storage' and armRegionName eq '${region}' and priceType eq 'Consumption' and productName eq 'Blob Storage' `,
  frontDoor:     `serviceName eq 'Azure Front Door Service' and priceType eq 'Consumption'`,
  staticWeb:     `serviceName eq 'Azure App Service' and priceType eq 'Consumption' and contains(productName,'Static Web')`,
  keyVault:      `serviceName eq 'Key Vault' and armRegionName eq '${region}' and priceType eq 'Consumption'`,
  acr:           `serviceName eq 'Container Registry' and armRegionName eq '${region}' and priceType eq 'Consumption'`,
  logAnalytics:  `serviceName eq 'Log Analytics' and armRegionName eq '${region}' and priceType eq 'Consumption'`,
};
const out = {};
for (const [k, f] of Object.entries(Q)) {
  let url = `https://prices.azure.com/api/retail/prices?api-version=2023-01-01-preview&$filter=${encodeURIComponent(f)}`;
  const items = [];
  for (let i = 0; url && i < 8; i++) {
    const r = await fetch(url); if (!r.ok) { out[k] = { error: r.status }; break; }
    const j = await r.json(); items.push(...j.Items); url = j.NextPageLink;
  }
  out[k] = items.map(x => ({ p: x.productName, s: x.skuName, m: x.meterName, u: x.unitOfMeasure, price: x.retailPrice, t: x.type, from: x.effectiveStartDate?.slice(0,10), region: x.armRegionName }));
}
console.log(JSON.stringify(out));
