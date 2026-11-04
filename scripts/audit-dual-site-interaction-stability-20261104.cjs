#!/usr/bin/env node
'use strict';

/*
 * QilyLean P1 dual-site interaction stability probe | 2026-11-04
 * Read-only browser QA. No arbitrary monkey-patching of production navigation.
 * Captures observable renderer stalls, slow click-to-navigation, and JS errors.
 * It cannot prove a user's intermittent freeze is fixed without a matching trace.
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

const SITES = [
  { id: 'com', base: process.env.QILY_INT_BASE || 'https://qilylean.com',
    body: '/capabilities/', product: '/tools/times26001/' },
  { id: 'cn', base: process.env.QILY_CN_BASE || 'https://qilylean.cn',
    body: '/archive/profile/capabilities/', product: null }
];
const WIDTHS = [1440, 390];
const ROUNDS = Number(process.env.QILY_STABILITY_ROUNDS || '3');
const MAX_GAP_MS = 2500;
const MAX_CLICK_NAV_MS = 15000;
const OUTPUT = path.resolve('audit-interaction-stability');
const results = [];
fs.mkdirSync(OUTPUT, { recursive: true });

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
function safeName(s) { return s.replace(/[^a-z0-9_-]/gi, '-').slice(0, 110); }
function pathOnly(value) {
  try { const u = new URL(value); return u.pathname; } catch (_) { return '/'; }
}
async function main() {
  const browser = await chromium.launch({ headless: true });
  let failures = 0;
  try {
    for (const site of SITES) {
      for (const width of WIDTHS) {
        let contextFailures = 0;
        const context = await browser.newContext({
          viewport: { width, height: width < 500 ? 844 : 900 },
          acceptDownloads: false,
          serviceWorkers: 'allow'
        });
        await context.tracing.start({ screenshots: true, snapshots: true, sources: true });
        await context.addInitScript(() => {
          window.__qilyInteractionProbe = { worstGap: 0, gaps: [], longTasks: [] };
          let last = performance.now();
          setInterval(() => {
            const now = performance.now();
            const gap = now - last;
            last = now;
            if (gap > 250) {
              const metrics = window.__qilyInteractionProbe;
              metrics.worstGap = Math.max(metrics.worstGap, gap);
              metrics.gaps.push(Math.round(gap));
              if (metrics.gaps.length > 80) metrics.gaps.shift();
              if (gap > 1000) console.info('QILY_PERF_STALL:' + Math.round(gap));
            }
          }, 100);
          try {
            new PerformanceObserver(list => {
              for (const entry of list.getEntries()) {
                const metrics = window.__qilyInteractionProbe;
                metrics.longTasks.push(Math.round(entry.duration));
                if (metrics.longTasks.length > 80) metrics.longTasks.shift();
              }
            }).observe({ type: 'longtask', buffered: true });
          } catch (_) { /* Long Tasks API is optional. */ }
        });
        const page = await context.newPage();
        const events = { stalls: [], jsErrors: [], requestFailures: [] };
        page.on('console', msg => {
          if (msg.text().startsWith('QILY_PERF_STALL:'))
            events.stalls.push(Number(msg.text().split(':')[1]) || 0);
        });
        page.on('pageerror', e => {
          events.jsErrors.push(String(e.message || e).slice(0, 240));
        });
        page.on('requestfailed', req => {
          const u = new URL(req.url());
          if (u.origin === site.base)
            events.requestFailures.push(u.pathname);
        });

        async function runAction(label, action) {
          const row = { site: site.id, width, label, ok: false,
            elapsedMs: 0, urlPath: pathOnly(page.url()), error: null,
            worstGapMs: 0, maxLongTaskMs: 0, requestFailures: [] };
          const startStalls = events.stalls.length;
          const startErrors = events.jsErrors.length;
          const startReqs = events.requestFailures.length;
          const started = Date.now();
          try {
            await action();
            await sleep(350);
            const probe = await page.evaluate(() => window.__qilyInteractionProbe ||
              { worstGap: 0, longTasks: [] });
            row.worstGapMs = Math.max(probe.worstGap || 0, ...events.stalls.slice(startStalls), 0);
            row.maxLongTaskMs = Math.max(0, ...(probe.longTasks || []));
            row.elapsedMs = Date.now() - started;
            row.urlPath = pathOnly(page.url());
            row.requestFailures = events.requestFailures.slice(startReqs, startReqs + 6);
            // A stall means a nonresponsive renderer; slow network alone is a different finding.
            if (row.worstGapMs >= MAX_GAP_MS) throw new Error('renderer stall >= ' + MAX_GAP_MS + 'ms');
            if (row.elapsedMs >= MAX_CLICK_NAV_MS && label.indexOf('navigate') !== -1)
              throw new Error('click-to-navigation >= ' + MAX_CLICK_NAV_MS + 'ms; inspect network vs main-thread trace');
            if (events.jsErrors.length > startErrors)
              row.jsErrors = events.jsErrors.slice(startErrors, startErrors + 4);
            row.ok = true;
          } catch (err) {
            row.elapsedMs = Date.now() - started;
            row.error = String(err.message || err).slice(0, 500);
            row.jsErrors = events.jsErrors.slice(startErrors, startErrors + 4);
            failures++;
            contextFailures++;
            try {
              await page.screenshot({ path: path.join(OUTPUT,
                safeName(site.id + '-' + width + '-' + label) + '.png'), timeout: 5000 });
            } catch (_) { /* A frozen renderer can prevent screenshots. */ }
          }
          results.push(row);
          console.log('QILY_INTERACTION ' + JSON.stringify(row));
        }

        async function visit(relative) {
          await page.goto(site.base + relative,
            { waitUntil: 'domcontentloaded', timeout: 35000 });
          await sleep(300);
        }

        async function clickNavigate(selector, role) {
          const anchor = await page.locator(selector).evaluateAll((nodes, currentOrigin) => {
            const current = location.pathname;
            const valid = nodes.find(node => {
              try {
                const u = new URL(node.href, currentOrigin);
                return u.origin === currentOrigin && u.pathname !== current
                  && !/\.(apk|aab|pdf|zip|png|jpg|svg|mp4)$/i.test(u.pathname)
                  && !node.hasAttribute('download')
                  && (!node.target || node.target === '_self');
              } catch (_) { return false; }
            });
            if (!valid) return null;
            return { href: valid.href, text: (valid.textContent || '').trim().slice(0, 80) };
          }, site.base);
          if (!anchor) throw new Error('No eligible ' + role + ' link');
          const target = new URL(anchor.href);
          const link = page.locator(selector).filter({ hasText: anchor.text }).first();
          // Text can repeat. Use the exact href on the selected element for deterministic click.
          const exact = page.locator(selector + '[href="' +
            new URL(anchor.href).pathname.replace(/"/g, '') + '"]').first();
          const clickable = await exact.count() ? exact : link;
          await clickable.click({ noWaitAfter: true, timeout: 10000 });
          await page.waitForURL(url => url.pathname === target.pathname,
            { waitUntil: 'domcontentloaded', timeout: 22000 });
          await page.locator('body').waitFor({ state: 'visible', timeout: 10000 });
        }

        for (let round = 1; round <= ROUNDS; round++) {
          await runAction('navigate-header-r' + round, async () => {
            await visit('/');
            await clickNavigate('header nav a[href]', 'header');
          });
          await runAction('navigate-body-r' + round, async () => {
            await visit(site.body);
            await clickNavigate('main a[href]', 'body');
          });
        }

        if (site.product) {
          for (let round = 1; round <= 2; round++) {
            await runAction('times26001-modal-r' + round, async () => {
              await visit(site.product);
              const button = page.locator('button[data-app-share-qr="times26001"]').first();
              await button.click({ timeout: 10000 });
              const dialog = page.locator('#qilyAppShareDialog');
              await dialog.waitFor({ state: 'visible', timeout: 6000 });
              await dialog.locator('.app-share-close').click({ timeout: 6000 });
              await dialog.waitFor({ state: 'hidden', timeout: 6000 });
            });
          }
        }
        try {
          if (contextFailures) {
            await context.tracing.stop({ path: path.join(OUTPUT,
              'trace-' + safeName(site.id + '-' + width) + '.zip') });
          } else {
            await context.tracing.stop();
          }
        } finally { await context.close(); }
      }
    }
  } finally {
    await browser.close();
    fs.writeFileSync(path.join(OUTPUT, 'report.json'),
      JSON.stringify({ date: new Date().toISOString(), config: {
        widths: WIDTHS, rounds: ROUNDS, maxGapMs: MAX_GAP_MS,
        maxClickNavMs: MAX_CLICK_NAV_MS
      }, failures, results }, null, 2));
  }
  if (failures) {
    console.error('QilyLean dual-site interaction: ' + failures + ' failed checks');
    process.exitCode = 1;
  } else {
    console.log('QilyLean dual-site interaction: all sampled checks passed (not proof of zero intermittent freezes).');
  }
}
main().catch(e => { console.error(e); process.exitCode = 1; });
