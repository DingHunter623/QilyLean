const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dir = path.join(root, 'global-knowledge');
const forbiddenSchemes = /^(?:mailto:|tel:|weixin:|whatsapp:)/i;
const forbiddenRoutes = /\/(?:cooperation|links|projects|contact|trust|capabilities|experience|improvements|lean-production)(?:\/|$)/i;

function walk(p) {
  return fs.readdirSync(p, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(p, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exitCode = 1;
}

if (!fs.existsSync(dir)) {
  fail('global-knowledge directory is missing');
  process.exit(1);
}

const htmlFiles = walk(dir).filter((f) => /\.html?$/i.test(f));
if (htmlFiles.length < 4) fail('Global Knowledge isolation pages are incomplete');

for (const file of htmlFiles) {
  const rel = path.relative(root, file);
  const html = fs.readFileSync(file, 'utf8');
  const hrefs = [...html.matchAll(/\bhref\s*=\s*["']([^"']+)["']/gi)].map((m) => m[1]);

  for (const href of hrefs) {
    if (forbiddenSchemes.test(href)) fail(`${rel} contains direct contact link: ${href}`);
    if (forbiddenRoutes.test(href)) fail(`${rel} links to a commercial/main-site route: ${href}`);

    if (/^https?:\/\//i.test(href)) {
      if (href === 'https://qilylean.cn/' || /^https:\/\/qilylean\.com\/global-knowledge\//i.test(href)) continue;
      fail(`${rel} contains non-isolated external link: ${href}`);
      continue;
    }

    if (href.startsWith('#')) continue;
    if (href.startsWith('/global-knowledge/')) continue;
    fail(`${rel} contains a direct non-isolated href: ${href}`);
  }

  if (/\b(?:mailto:|tel:|weixin:|whatsapp:)/i.test(html)) fail(`${rel} contains a direct contact scheme`);
}

const reader = fs.readFileSync(path.join(dir, 'view', 'index.html'), 'utf8');
if (!reader.includes('var ALLOWED=[')) fail('isolated reader allowlist is missing');
if (forbiddenRoutes.test(reader.match(/var ALLOWED=\[[\s\S]*?\];/)?.[0] || '')) fail('isolated reader allowlist contains a commercial route');
if (!reader.includes("root.querySelectorAll('script,style,header,footer,nav,form,button,input,textarea,select,iframe,object,embed")) fail('isolated reader sanitizer is missing structural removal');

const cn = fs.readFileSync(path.join(root, 'cn-site', 'index.html'), 'utf8');
if (!cn.includes('https://qilylean.com/global-knowledge/')) fail('CN homepage no longer points to the isolated Global Knowledge bridge');
if (/https:\/\/qilylean\.com\/(?!global-knowledge\/)/i.test(cn)) fail('CN homepage contains a non-isolated qilylean.com route');

if (process.exitCode) process.exit(process.exitCode);
console.log(`Global Knowledge isolation gate passed: ${htmlFiles.length} HTML pages checked.`);
