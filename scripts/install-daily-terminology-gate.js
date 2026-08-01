#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const workflowPath = path.join(root, '.github', 'workflows', 'build-daily-archive.yml');
let workflow = fs.readFileSync(workflowPath, 'utf8');

function replaceOnce(source, target, replacement, label) {
  if (source.includes(replacement)) return source;
  if (!source.includes(target)) throw new Error(`Cannot install ${label}: anchor was not found.`);
  return source.replace(target, replacement);
}

workflow = replaceOnce(
  workflow,
  '      - "scripts/enhance-terminology-training.js"\n',
  '      - "scripts/enhance-terminology-training.js"\n      - "scripts/audit-daily-terminology.js"\n',
  'workflow path trigger'
);

workflow = replaceOnce(
  workflow,
  '      - name: Pin responsive daily stylesheet version\n        run: node scripts/bump-daily-css-version.js\n',
  '      - name: Audit latest brief terminology before publication\n        run: node scripts/audit-daily-terminology.js\n\n      - name: Validate daily terminology coverage\n        shell: bash\n        run: |\n          test -s qilylean/daily/terminology-audit-latest.json\n          node - <<\'NODE\'\n          const fs = require(\'fs\');\n          const report = JSON.parse(fs.readFileSync(\'qilylean/daily/terminology-audit-latest.json\', \'utf8\'));\n          if (report.status !== \'passed\') throw new Error(\'Daily terminology audit did not pass\');\n          if (!Array.isArray(report.unknownTerms) || report.unknownTerms.length) {\n            throw new Error(`Uncovered Daily Brief terms: ${(report.unknownTerms || []).join(\', \')}`);\n          }\n          NODE\n          LATEST_DATE="$(node -e "const data=require(\'./qilylean/daily/index.json\'); process.stdout.write(data[0].date)")"\n          if grep -q \'Sponsor（项目发起人／主责高层）\' "qilylean/daily/$LATEST_DATE.html"; then\n            grep -q \'href="/knowledge/terminology/sponsor.html"\' "qilylean/daily/$LATEST_DATE.html" || {\n              echo "Sponsor is explained but is not linked to its terminology lesson"\n              exit 1\n            }\n          fi\n\n      - name: Pin responsive daily stylesheet version\n        run: node scripts/bump-daily-css-version.js\n',
  'terminology audit step'
);

workflow = replaceOnce(
  workflow,
  '          git add knowledge/index.html knowledge/terminology.html qilylean/daily-insights.html qilylean/daily/index.json qilylean/daily/*.html qilylean/assets/daily-*.svg sitemap.xml\n',
  '          git add knowledge/index.html knowledge/terminology.html qilylean/daily-insights.html qilylean/daily/index.json qilylean/daily/*.html qilylean/daily/terminology-audit-latest.json qilylean/assets/daily-*.svg sitemap.xml\n',
  'generated terminology audit commit rule'
);

fs.writeFileSync(workflowPath, workflow.endsWith('\n') ? workflow : `${workflow}\n`, 'utf8');
console.log('Installed the Daily Brief terminology audit and publication gate.');
