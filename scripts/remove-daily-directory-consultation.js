#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const directoryPath = path.join(root, 'qilylean', 'daily-insights.html');
const dailyDir = path.join(root, 'qilylean', 'daily');

function writeIfChanged(filePath, before, after) {
  if (before === after) return false;
  fs.writeFileSync(filePath, after, 'utf8');
  return true;
}

function removeDirectoryConsultation() {
  const before = fs.readFileSync(directoryPath, 'utf8');
  let after = before.replace(
    /\s*<section class="brief-consultation" id="brief-consultation"[\s\S]*?<\/section>\s*/,
    '\n'
  );

  after = after.replace(
    /\nvar consultationForm=document\.getElementById\('briefConsultationForm'\)[\s\S]*?(?=\n\}\)\(\);)/,
    ''
  );

  const forbidden = [
    'id="brief-consultation"',
    'id="briefConsultationForm"',
    '简报留言交流',
    '留言来源：今日简报总目录',
    "consultationApi+'/consultations'"
  ];
  forbidden.forEach((term) => {
    if (after.includes(term)) throw new Error(`Daily directory consultation removal failed: ${term}`);
  });

  return writeIfChanged(directoryPath, before, after);
}

function removeDirectoryCtaFromBriefPages() {
  let changed = 0;
  const files = fs.readdirSync(dailyDir).filter((name) => /^\d{4}-\d{2}-\d{2}\.html$/.test(name));
  files.forEach((name) => {
    const filePath = path.join(dailyDir, name);
    const before = fs.readFileSync(filePath, 'utf8');
    const after = before.replace(
      /\s*<aside class="brief-consultation-cta">[\s\S]*?<\/aside>\s*/g,
      ''
    );
    if (after.includes('brief-consultation-cta') || after.includes('#brief-consultation')) {
      throw new Error(`Obsolete directory consultation CTA remains: ${name}`);
    }
    if (!after.includes('data-brief-message-form') || after.includes('评价本期简报') || after.includes('data-brief-rating') || after.includes('data-brief-sentiment')) {
      throw new Error(`Direct brief message-only module validation failed: ${name}`);
    }
    if (writeIfChanged(filePath, before, after)) changed += 1;
  });
  return changed;
}

const directoryChanged = removeDirectoryConsultation();
const pageCount = removeDirectoryCtaFromBriefPages();
process.stdout.write(`Removed duplicate directory consultation: directory=${directoryChanged ? 'updated' : 'already clean'}, brief pages=${pageCount}.\n`);
