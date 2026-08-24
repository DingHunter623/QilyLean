#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const workflowDir = path.join(root, '.github', 'workflows');
const outFile = path.join(root, 'maintenance', 'site-system-v4-workflow-audit.json');

const files = fs.readdirSync(workflowDir).filter((name) => /\.ya?ml$/i.test(name)).sort();

function classify(name, text) {
  const lower = `${name}\n${text}`.toLowerCase();
  const product = /(apk|android|times26001|qhome|qilylean-home|app-release|play)/.test(lower);
  const deploy = /(deploy|pages|worker|publish)/.test(lower);
  const audit = /(audit|validate|verify|enforce|guard|check)/.test(lower);
  const build = /(build|materialize|sync|generate|archive)/.test(lower);
  if (product) return 'PRODUCT_OR_APP';
  if (deploy) return 'DEPLOY_OR_PUBLISH';
  if (audit) return 'VALIDATE_OR_AUDIT';
  if (build) return 'BUILD_OR_SYNC';
  return 'OTHER';
}

const entries = files.map((name) => {
  const text = fs.readFileSync(path.join(workflowDir, name), 'utf8');
  const dated = /20\d{6}/.test(name);
  const manualOnly = /\bon:\s*\n\s*workflow_dispatch\s*:/m.test(text) && !/\b(pull_request|push|schedule|workflow_run)\s*:/m.test(text);
  const triggers = {
    pullRequest: /\bpull_request\s*:/m.test(text),
    push: /\bpush\s*:/m.test(text),
    schedule: /\bschedule\s*:/m.test(text),
    workflowRun: /\bworkflow_run\s*:/m.test(text),
    manual: /\bworkflow_dispatch\s*:/m.test(text)
  };
  return {
    file: `.github/workflows/${name}`,
    bytes: Buffer.byteLength(text),
    dated,
    manualOnly,
    category: classify(name, text),
    triggers
  };
});

const categoryCounts = entries.reduce((acc, entry) => {
  acc[entry.category] = (acc[entry.category] || 0) + 1;
  return acc;
}, {});

const report = {
  generatedAt: new Date().toISOString(),
  workflowCount: entries.length,
  datedWorkflowCount: entries.filter((entry) => entry.dated).length,
  manualOnlyCount: entries.filter((entry) => entry.manualOnly).length,
  categoryCounts,
  migrationRule: 'ACTIVE -> MIGRATED -> DEPRECATED -> ARCHIVED -> DELETE',
  note: 'Classification is heuristic. A workflow must not be disabled until its required end-state is covered by a V4 build/validate/audit gate. Independent product/app release workflows are not website-governance duplication.',
  workflows: entries
};

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, `${JSON.stringify(report, null, 2)}\n`);
console.log(`[V4] Workflow audit: ${report.workflowCount} total; ${report.datedWorkflowCount} dated; ${report.manualOnlyCount} manual-only.`);
console.log(`[V4] Categories: ${JSON.stringify(categoryCounts)}`);
