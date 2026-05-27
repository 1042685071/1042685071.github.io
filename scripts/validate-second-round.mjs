import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const htmlPath = path.join(root, "index.html");
const html = fs.readFileSync(htmlPath, "utf8");

const requiredCopy = [
  "Factory-Backed SPC Flooring Supply for Global Distributors & Project Buyers",
  "Factory-backed flooring supply",
  "Factory-Backed",
  "SPC Flooring Product Codes for Bulk Orders",
  "Browse available wood-look and stone-look SPC flooring designs with product codes. Send us the product code, thickness, quantity and destination to receive a tailored quotation.",
  "Market-Ready SPC Flooring for Residential and Commercial Projects",
  "SPC flooring is widely used in apartments, hotels, offices, retail stores and renovation projects where waterproof performance, dimensional stability, easy maintenance and fast installation are important.",
  "Material Profile & Indoor Use",
  "Built for indoor flooring applications that require waterproof performance, easy maintenance and a low-VOC material profile.",
  "Factory Production & Installation Support",
  "Production and installation media are available to help overseas buyers understand our SPC flooring process, click-lock installation and project suitability.",
  "Production Line Overview",
  "Factory production footage can be provided to qualified buyers for supplier evaluation and project sourcing.",
  "Click-Lock Installation Guide",
  "Installation guidance is available for contractors, distributors and project buyers who need support materials for local customers.",
  "This helps importers and distributors reduce sourcing risk, maintain consistent product quality, and prepare repeat bulk orders with clearer production communication.",
  "Product Code / Style Code",
  "Example: 1901, 89001, or send us a screenshot by email",
  "Request Quote for This Code",
  "Samples are available for overseas buyers to check color, surface texture, thickness, click-lock quality and overall product feel before bulk orders. Sample cost and courier cost depend on destination and sample requirements.",
  "What is your MOQ?",
  "MOQ depends on product specification, color selection, packaging requirements and order quantity. Please send your target product code and quantity for confirmation.",
  "What is the production lead time?",
  "Lead time depends on order quantity, selected design, backing, packaging and current production schedule.",
  "Which trade terms do you support?",
  "EXW, FOB and other trade terms can be discussed based on order quantity, destination and shipping arrangement.",
  "Can you provide certificates or test reports?",
  "Available product documents and compliance files can be provided upon request for qualified buyers.",
  "Can I get samples before placing a bulk order?",
  "Yes. Samples are available for overseas importers, distributors, contractors and project buyers. You can request samples by sending the product code, target thickness, wear layer and destination country. Sample cost and courier cost depend on the destination and sample requirements.",
  "Certificates & Product Documents",
  "Product documents, certificates, test reports and technical files can be provided upon request for qualified importers, distributors and project buyers.",
  "CE documents available",
  "Product specification sheets",
  "Installation guidance",
  "Packaging and loading details",
  "Production, inspection, packaging and container loading materials are available to support buyer evaluation before bulk orders.",
  "Please include product code, quantity, destination port/country, sample request, OEM packaging needs, or any special requirements.",
  "Replace Gmail with domain business email before large-scale promotion.",
];

const requiredCodes = [
  "1838",
  "1901",
  "1902",
  "1903",
  "1905",
  "1906",
  "1907",
  "1909",
  "1910",
  "1911",
  "1919",
  "1920",
  "1921",
  "1922",
  "1923",
  "1925",
  "1926",
  "1927",
  "1928",
  "1930",
  "1931",
  "1932",
  "89001-1",
  "89001-5",
  "89003-4",
  "89003-5",
  "89004-5",
  "14001",
  "14002",
  "14013",
  "14015",
  "14017",
  "14018",
  "14019",
  "14020",
  "14025",
  "16055-1",
];

const failures = [];
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

for (const text of requiredCopy) {
  assert(html.includes(text), `Missing required copy: ${text}`);
}

const withoutComments = html.replace(/<!--[\s\S]*?-->/g, " ");
const visibleText = withoutComments
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<[^>]*>/g, " ")
  .replace(/\s+/g, " ")
  .toLowerCase();

const forbiddenVisible = [
  "video resources reserved",
  "reserved for production line footage",
  "reserved for click-lock installation",
  "we will use optimized videos",
  "organized for fast selection",
  "needed for a quick flooring inquiry",
  "comfort, resilience, and everyday performance underfoot",
  "eco-conscious spc flooring",
  "a cleaner flooring choice for modern interiors",
  "factory-direct spc flooring for global distributors & project buyers",
  "factory-direct bulk spc flooring supply",
  "receive a factory-direct quotation",
];

for (const phrase of forbiddenVisible) {
  assert(!visibleText.includes(phrase), `Forbidden visible/internal wording remains: ${phrase}`);
}

assert(!/\breserved\b/i.test(withoutComments), "Raw HTML still contains the word reserved");
assert(!/we will use/i.test(withoutComments), "Raw HTML still contains 'we will use'");
assert(!/manufacturer/i.test(withoutComments), "HTML should avoid unsupported manufacturer claims");
assert(!/Free Samples/i.test(withoutComments), "HTML must not promise free samples");
assert(!/REPLACE_WITH_FORM_ID/i.test(html), "Form action must not contain REPLACE_WITH_FORM_ID");
assert(!html.includes("assets/catalog/"), "Product catalog must not reference assets/catalog");
assert(!fs.existsSync(path.join(root, "assets", "catalog")), "Old assets/catalog directory should be removed");

const productDir = path.join(root, "assets", "product-codes");
assert(fs.existsSync(productDir), "Missing assets/product-codes directory");
const webpFiles = fs.existsSync(productDir)
  ? fs.readdirSync(productDir).filter(file => file.endsWith(".webp")).sort()
  : [];

assert(webpFiles.length === requiredCodes.length, `Expected ${requiredCodes.length} product WebP files, found ${webpFiles.length}`);

for (const code of requiredCodes) {
  const expectedName = `spc-flooring-product-code-${code.toLowerCase()}.webp`;
  assert(webpFiles.includes(expectedName), `Missing WebP asset for product code ${code}`);
  assert(html.includes(`code: "${code}"`), `Product data missing code ${code}`);
  assert(html.includes(`assets/product-codes/${expectedName}`), `HTML missing product image path for ${code}`);
  assert(
    html.includes(`SPC flooring product code ${code} for wholesale rigid core vinyl flooring`),
    `HTML missing optimized alt text for ${code}`
  );
}

assert(!/code:\s*"LS/i.test(html), "Product data still contains LS-prefixed old product codes");
assert(!/spc-flooring-product-code-ls/i.test(html), "HTML still references LS-prefixed product assets");

const productCodeIndex = html.indexOf('name="product_code"');
const quantityIndex = html.indexOf('name="estimated_quantity"');
assert(productCodeIndex !== -1, "Quote form missing product_code field");
assert(quantityIndex !== -1, "Quote form missing estimated_quantity field");
assert(productCodeIndex < quantityIndex, "Product Code field should appear before Estimated Quantity");

assert(html.includes("function requestQuoteForCode(code)"), "Missing quote autofill helper");
assert(html.includes("data-quote-code"), "Product quote buttons should include data-quote-code");
assert(html.includes("window.history.replaceState(null, \"\", \"#quote\")"), "Quote button should update URL to #quote");
assert(/<a class="button secondary" href="#quote">[\s\S]*?Request Samples[\s\S]*?<\/a>/.test(html), "Request Samples button should link to #quote");
assert(/<select id="samples" name="need_samples">\s*<option>Yes<\/option>\s*<option>No<\/option>\s*<option>Not Sure<\/option>\s*<\/select>/.test(html), "Need Samples options should be Yes / No / Not Sure");
assert(/<form[^>]+action="mailto:zcx1042685071@gmail\.com\?subject=SPC%20Flooring%20Quote%20Request"/.test(html), "Quote form should use the current Gmail mailto action until a real form endpoint is supplied");

if (failures.length) {
  console.error(`Second-round validation failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Second-round validation passed with ${webpFiles.length} product-coded WebP assets.`);
