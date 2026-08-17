#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const script = (html.match(/<script data-qily-r2-first-paint>([\s\S]*?)<\/script>/) || [])[1] || '';
const build = (script.match(/BUILD='([^']+)'/) || [])[1] || '';

function assert(ok, message) {
  if (!ok) throw new Error(message);
}

function storage(seed) {
  const values = new Map(Object.entries(seed || {}));
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); },
    snapshot() { return Object.fromEntries(values); }
  };
}

function execute({ href = 'https://qilylean.com/', active = '', session, replaceThrows = false } = {}) {
  const classes = new Set(['qily-shell-pending', 'qily-r2-first-paint-pending']);
  const attributes = {};
  const handlers = {};
  const local = storage(active ? { qily_site_html_build_v2: active } : {});
  const tab = session || storage();
  const replacements = [];
  const documentElement = {
    classList: {
      add(...names) { names.forEach((name) => classes.add(name)); },
      remove(...names) { names.forEach((name) => classes.delete(name)); }
    },
    setAttribute(name, value) { attributes[name] = value; }
  };
  const location = {
    href,
    replace(next) {
      replacements.push(next);
      if (replaceThrows) throw new Error('simulated navigation failure');
      this.href = next;
    }
  };
  const window = {
    location,
    localStorage: local,
    sessionStorage: tab,
    history: { replaceState(_state, _title, next) { location.href = new URL(next, location.href).href; } },
    addEventListener(type, handler) { handlers[type] = handler; }
  };
  vm.runInNewContext(script, { document: { documentElement }, window, URL, Date }, { timeout: 1000 });
  return { classes, attributes, handlers, local, session: tab, replacements };
}

assert(script && build === '20260817-atomic-first-paint-v2', 'Current bounded first-paint script was not found.');

const current = execute({ active: build });
assert(current.replacements.length === 0, 'Current document unexpectedly refreshed.');
assert(!current.classes.has('qily-stale-document'), 'Current document remained hidden.');

const sharedSession = storage();
const stale = execute({ active: 'older-build', session: sharedSession });
assert(stale.replacements.length === 1, 'Stale document did not make exactly one cache-busted attempt.');
assert(stale.classes.has('qily-stale-document'), 'Stale document was exposed before navigation.');
const requestedUrl = new URL(stale.replacements[0]);
assert(requestedUrl.searchParams.get('qily-refresh') === build, 'Cache-busted attempt did not target the current document build.');

const staleAgain = execute({ active: 'older-build', session: sharedSession });
assert(staleAgain.replacements.length === 0, 'Session retry marker did not cap a stripped-query reload loop.');
assert(!staleAgain.classes.has('qily-stale-document'), 'Bounded fallback remained hidden.');

const terminal = execute({ href: `https://qilylean.com/?qily-refresh=${encodeURIComponent(build)}&qily-ts=test`, active: 'older-build' });
assert(terminal.replacements.length === 0, 'Cache-busted response retried instead of becoming terminal.');
assert(!terminal.classes.has('qily-stale-document'), 'Cache-busted terminal response remained hidden.');

const failed = execute({ active: 'older-build', replaceThrows: true });
assert(failed.replacements.length === 1, 'Navigation failure did not exercise the recovery path.');
assert(!failed.classes.has('qily-stale-document'), 'Navigation failure left the usable static document hidden.');

const restored = execute({ active: build });
restored.local.setItem('qily_site_html_build_v2', 'future-build');
restored.handlers.pageshow({ persisted: true });
restored.handlers.pageshow({ persisted: true });
assert(restored.replacements.length === 1, 'BFCache recovery was not capped at one attempt.');
assert(!restored.classes.has('qily-stale-document'), 'Repeated BFCache recovery did not reveal the fallback.');

process.stdout.write('Bounded first-paint guard behavior passed: normal, stale, stripped-query, terminal, navigation-failure, and BFCache scenarios.\n');
