#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, 'finalize-trust-commercial-records.js');
let content = fs.readFileSync(file, 'utf8');
const before = "  if (!home.includes(cumulativeSummary) || !home.includes('非QilyLean品牌独立营收')) throw new Error('Homepage cumulative contribution is not fully qualified');";
const after = "  if (!home.includes('累计改善贡献') || !home.includes('非QilyLean品牌独立营收')) throw new Error('Homepage cumulative contribution is not fully qualified');";
if (content.includes(before)) content = content.replace(before, after);
if (!content.includes(after)) throw new Error('Finalizer validation target was not found');
fs.writeFileSync(file, content, 'utf8');
process.stdout.write('Normalized finalizer validation against the existing qualified homepage wording.\n');
