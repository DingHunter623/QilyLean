#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const scriptsDir = __dirname;
const sourcePath = path.join(scriptsDir, 'publish-npi-four-stage-series.js');
const tempPath = path.join(scriptsDir, '.publish-npi-four-stage-series.runtime.js');

let source = fs.readFileSync(sourcePath, 'utf8');
const lines = source.split(/\r?\n/);
const index = lines.findIndex(line => line.includes('const articleRe=new RegExp'));
if (index < 0) throw new Error('NPI publisher article matcher was not found.');
lines[index] = '  const articleRe=new RegExp(`(<article class="post" id="${item.date}">[\\\\s\\\\S]*?)<div class="content">[\\\\s\\\\S]*?<\\\\/div><\\\\/article>(\\\\s*<section class="brief-feedback")`);';
source = lines.join('\n');

try {
  fs.writeFileSync(tempPath, source);
  const result = spawnSync(process.execPath, [tempPath], { cwd: path.resolve(scriptsDir, '..'), stdio: 'inherit' });
  if (result.error) throw result.error;
  process.exitCode = result.status || 0;
} finally {
  try { fs.unlinkSync(tempPath); } catch (error) {}
}
