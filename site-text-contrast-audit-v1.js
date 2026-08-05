/* QilyLean sitewide textual-control contrast audit v1 | 2026-08-05 */
(function (d, w) {
  'use strict';
  if (w.__qilyTextContrastAuditV1) return;
  w.__qilyTextContrastAuditV1 = true;

  var controlSelector = [
    'a[href]', 'button', '[role="button"]', '[role="link"]',
    'input[type="button"]', 'input[type="submit"]'
  ].join(',');
  var excludedSelector = [
    '.site-music-toggle', '.qily-modal-close', '.qily-float-btn',
    '.qily-float-dock a', '.qily-float-dock button',
    '.qily-floating-dock a', '.qily-floating-dock button',
    '[aria-hidden="true"]'
  ].join(',');
  var scheduled = 0;

  function parseColor(value) {
    var match = String(value || '').match(/rgba?\(([^)]+)\)/i);
    if (!match) return null;
    var parts = match[1].split(',').map(function (part) { return parseFloat(part.trim()); });
    if (parts.length < 3 || parts.some(function (n) { return Number.isNaN(n); })) return null;
    return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 };
  }

  function channel(value) {
    value /= 255;
    return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
  }

  function luminance(color) {
    return 0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b);
  }

  function contrast(first, second) {
    var a = luminance(first);
    var b = luminance(second);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  }

  function effectiveBackground(node) {
    var current = node;
    while (current && current !== d.documentElement) {
      var style = w.getComputedStyle(current);
      var background = parseColor(style.backgroundColor);
      if (background && background.a >= 0.75) return background;
      current = current.parentElement;
    }
    return { r: 255, g: 255, b: 255, a: 1 };
  }

  function normalizeQtcActions(root) {
    var nodes = [];
    if (root && root.matches && root.matches('.qtc-action')) nodes.push(root);
    if (root && root.querySelectorAll) nodes = nodes.concat(Array.from(root.querySelectorAll('.qtc-action')));
    nodes.forEach(function (node) {
      node.classList.remove('qily-action-primary', 'qily-action-secondary');
      var label = (node.getAttribute('data-qily-action-label') || node.textContent || node.getAttribute('aria-label') || '').trim();
      if (!label) return;
      node.setAttribute('data-qily-action-label', label);
      node.setAttribute('aria-label', label);
      var existing = node.querySelector(':scope > .qtc-action-label');
      if (!existing || existing.textContent.trim() !== label || node.childNodes.length !== 1) {
        node.textContent = '';
        var span = d.createElement('span');
        span.className = 'qtc-action-label';
        span.textContent = label;
        node.appendChild(span);
      }
      node.setAttribute('data-qily-textual-control', 'true');
    });
  }

  function auditControl(node) {
    if (!node || !node.matches || !node.matches(controlSelector) || node.matches(excludedSelector)) return;
    var text = (node.textContent || node.value || '').replace(/\s+/g, ' ').trim();
    if (!text) return;
    var rect = node.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    var style = w.getComputedStyle(node);
    if (style.display === 'none' || style.visibility === 'hidden') return;

    node.setAttribute('data-qily-textual-control', 'true');
    var fill = parseColor(style.webkitTextFillColor);
    var foreground = fill && fill.a > 0 ? fill : parseColor(style.color);
    var background = effectiveBackground(node);
    var fontSize = parseFloat(style.fontSize) || 0;
    var opacity = parseFloat(style.opacity);
    var textIndent = Math.abs(parseFloat(style.textIndent) || 0);
    var ratio = foreground ? contrast(foreground, background) : 0;
    var invalid = !foreground || foreground.a < 0.8 || ratio < 4.5 || fontSize < 12 || opacity < 0.75 || textIndent > rect.width;

    if (invalid) {
      node.setAttribute('data-qily-auto-contrast', luminance(background) < 0.45 ? 'dark' : 'light');
    } else {
      node.removeAttribute('data-qily-auto-contrast');
    }
  }

  function audit(root) {
    root = root || d;
    normalizeQtcActions(root);
    var controls = [];
    if (root.matches && root.matches(controlSelector)) controls.push(root);
    if (root.querySelectorAll) controls = controls.concat(Array.from(root.querySelectorAll(controlSelector)));
    controls.forEach(auditControl);
    d.documentElement.setAttribute('data-qily-text-contrast-audited', 'v1');
  }

  function schedule(root) {
    if (scheduled) w.clearTimeout(scheduled);
    scheduled = w.setTimeout(function () {
      scheduled = 0;
      audit(root || d);
    }, 80);
  }

  function boot() {
    audit(d);
    [300, 900, 1800, 3200].forEach(function (delay) {
      w.setTimeout(function () { audit(d); }, delay);
    });
    if (w.MutationObserver) {
      new MutationObserver(function (records) {
        var root = d;
        for (var i = 0; i < records.length; i += 1) {
          if (records[i].target && records[i].target.nodeType === 1) {
            root = records[i].target;
            break;
          }
        }
        schedule(root);
      }).observe(d.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['class', 'style'] });
    }
  }

  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})(document, window);
