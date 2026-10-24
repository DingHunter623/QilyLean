const fs=require('node:fs');
const assert=require('node:assert/strict');
const r8=fs.readFileSync('.github/workflows/enforce-visual-authority-r8.yml','utf8');
const v4=fs.readFileSync('.github/workflows/v4-build.yml','utf8');
const r8Push=r8.split('  pull_request:')[0];
assert.match(r8Push,/^\s+- '\*\*\/\*\.html'$/m,'R8 positive HTML trigger missing');
assert.match(r8Push,/^\s+- '!cn-site\/\*\*'$/m,'R8 must exclude CN-site HTML from COM writes');
const v4Triggers=v4.split('\npermissions:')[0];
for(const p of ["cn-site/**","services/cn-translation/**","scripts/cn-*.spec.js","scripts/cn-*.py","scripts/test-cn-*.py",".github/workflows/cn-*.yml",".github/workflows/deploy-cn-preprod.yml"]){
 assert(v4Triggers.includes("      - '"+p+"'"),'V4 must ignore CN-only path: '+p);
}
assert.match(r8,/npx playwright test scripts\/international-about-whitespace-guard-20261025\.spec\.js/);
console.log('PASS: CN-only commits do not trigger international R8/V4 visual writeback; international About whitespace is browser-guarded.');
