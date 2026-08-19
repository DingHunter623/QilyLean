/* QilyLean visual geometry closure v2｜2026-08-19
 * Purpose: close recurring visual defects across the site without page-by-page patches.
 * 1) Snap straight SVG flow arrows to adjacent boxes when tiny gaps exist.
 * 2) Tighten inline engineering/brief SVG viewBoxes when content uses too little horizontal space.
 * 3) Preserve the outer scene frame after viewBox tightening.
 * 4) Make tables/content cards size to their real content instead of carrying avoidable blank space.
 */
(function (d, w) {
  'use strict';
  if (w.__qilyVisualGeometryV2) return;
  w.__qilyVisualGeometryV2 = true;

  function installDensityStyles() {
    if (d.getElementById('qilyVisualDensityClosureV2')) return;
    var style = d.createElement('style');
    style.id = 'qilyVisualDensityClosureV2';
    style.textContent = [
      'html body main table{height:auto!important;min-height:0!important;table-layout:auto!important}',
      'html body main table tr{height:auto!important;min-height:0!important}',
      'html body main table :is(th,td){height:auto!important;min-height:0!important;padding:10px 12px!important;vertical-align:top!important;line-height:1.52!important}',
      'html body main table.rule-table.balanced-cols{table-layout:auto!important}',
      'html body main table.rule-table.balanced-cols :is(th,td){width:auto!important}',
      'html body main table.rule-table.compact-first-col :is(th:first-child,td:first-child){width:1%!important;white-space:nowrap!important}',
      'html body main :is(.brief-scene-figure-v1,.engineering-flow,figure:has(>svg.brief-scene-svg)){width:100%!important;max-width:none!important;margin-left:0!important;margin-right:0!important}',
      'html body main :is(.brief-scene-svg,.engineering-flow svg){display:block!important;width:100%!important;max-width:none!important;height:auto!important;margin:0!important}',
      'html body main :is(.brief-highlight-grid,.brief-one-point-grid,.formula-grid,.owner-grid,.status-grid,.brief-learning-grid,.module-grid,.project-grid){align-items:stretch!important;grid-auto-rows:auto!important}',
      'html body main :is(.brief-highlight-grid,.brief-one-point-grid,.formula-grid,.owner-grid,.status-grid,.brief-learning-grid,.module-grid,.project-grid)>*{height:auto!important;min-height:0!important}',
      'html body main :is(.brief-scene-figure-v1,figure:has(>svg.brief-scene-svg)) figcaption{margin-top:8px!important;margin-bottom:0!important}',
      '@media(max-width:760px){html body main table :is(th,td){padding:8px 8px!important;line-height:1.48!important}}'
    ].join('');
    (d.head || d.documentElement).appendChild(style);
  }

  function number(value) {
    var n = parseFloat(value);
    return Number.isFinite(n) ? n : 0;
  }

  function parseViewBox(svg) {
    var raw = (svg.getAttribute('viewBox') || '').trim().split(/[ ,]+/).map(number);
    if (raw.length !== 4 || raw[2] <= 0 || raw[3] <= 0) return null;
    return { x: raw[0], y: raw[1], width: raw[2], height: raw[3] };
  }

  function rectBox(rect) {
    return {
      x: number(rect.getAttribute('x')),
      y: number(rect.getAttribute('y')),
      width: number(rect.getAttribute('width')),
      height: number(rect.getAttribute('height'))
    };
  }

  function isBackgroundRect(rect, viewBox) {
    var box = rectBox(rect);
    if (!viewBox || !box.width || !box.height) return false;
    return box.width >= viewBox.width * 0.88 && box.height >= viewBox.height * 0.72;
  }

  function visibleBBox(node) {
    if (!node || node.tagName === 'defs' || node.tagName === 'style' || node.tagName === 'title' || node.tagName === 'desc') return null;
    try {
      var box = node.getBBox();
      if (!box || (!box.width && !box.height)) return null;
      return { x: box.x, y: box.y, width: box.width, height: box.height };
    } catch (error) {
      return null;
    }
  }

  function union(boxes) {
    if (!boxes.length) return null;
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    boxes.forEach(function (box) {
      minX = Math.min(minX, box.x);
      minY = Math.min(minY, box.y);
      maxX = Math.max(maxX, box.x + box.width);
      maxY = Math.max(maxY, box.y + box.height);
    });
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }

  function tightenSceneSvg(svg) {
    if (!svg || svg.dataset.qilyGeometryTightened === '2') return;
    var viewBox = parseViewBox(svg);
    if (!viewBox) return;

    var children = Array.prototype.slice.call(svg.children);
    var background = children.find(function (node) {
      return node.tagName && node.tagName.toLowerCase() === 'rect' && isBackgroundRect(node, viewBox);
    }) || null;

    var boxes = children.filter(function (node) {
      return node !== background;
    }).map(visibleBBox).filter(Boolean);
    var content = union(boxes);
    if (!content || content.width <= 0) return;

    var usage = content.width / viewBox.width;
    if (usage >= 0.925) {
      svg.dataset.qilyGeometryTightened = '2';
      return;
    }

    var pad = Math.max(22, Math.min(38, viewBox.width * 0.025));
    var left = Math.max(viewBox.x, content.x - pad);
    var right = Math.min(viewBox.x + viewBox.width, content.x + content.width + pad);
    var nextWidth = right - left;

    if (nextWidth < viewBox.width * 0.74 || nextWidth >= viewBox.width * 0.96) {
      svg.dataset.qilyGeometryTightened = '2';
      return;
    }

    if (background) {
      var inset = Math.max(10, Math.min(20, nextWidth * 0.014));
      background.setAttribute('x', String(left + inset));
      background.setAttribute('width', String(Math.max(1, nextWidth - inset * 2)));
    }

    svg.setAttribute('viewBox', [left, viewBox.y, nextWidth, viewBox.height].join(' '));
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.dataset.qilyGeometryTightened = '2';
  }

  function usefulRects(svg, viewBox) {
    return Array.prototype.slice.call(svg.querySelectorAll('rect')).filter(function (rect) {
      return !isBackgroundRect(rect, viewBox);
    }).map(function (rect) {
      var box = rectBox(rect);
      box.node = rect;
      return box;
    });
  }

  function nearestRectForEndpoint(rects, x, y, direction, maxGap) {
    var best = null;
    rects.forEach(function (rect) {
      var gap = Infinity;
      if (direction === 'down' && x >= rect.x - 3 && x <= rect.x + rect.width + 3 && rect.y >= y) gap = rect.y - y;
      if (direction === 'up' && x >= rect.x - 3 && x <= rect.x + rect.width + 3 && rect.y + rect.height <= y) gap = y - (rect.y + rect.height);
      if (direction === 'right' && y >= rect.y - 3 && y <= rect.y + rect.height + 3 && rect.x >= x) gap = rect.x - x;
      if (direction === 'left' && y >= rect.y - 3 && y <= rect.y + rect.height + 3 && rect.x + rect.width <= x) gap = x - (rect.x + rect.width);
      if (gap >= 0 && gap <= maxGap && (!best || gap < best.gap)) best = { rect: rect, gap: gap };
    });
    return best;
  }

  function snapLine(line, rects) {
    if (!line.hasAttribute('marker-end')) return;
    var x1 = number(line.getAttribute('x1'));
    var y1 = number(line.getAttribute('y1'));
    var x2 = number(line.getAttribute('x2'));
    var y2 = number(line.getAttribute('y2'));
    var dx = x2 - x1, dy = y2 - y1;
    var direction;
    if (Math.abs(dx) < 0.5 && Math.abs(dy) > 0.5) direction = dy > 0 ? 'down' : 'up';
    else if (Math.abs(dy) < 0.5 && Math.abs(dx) > 0.5) direction = dx > 0 ? 'right' : 'left';
    else return;
    var hit = nearestRectForEndpoint(rects, x2, y2, direction, 16);
    if (!hit || hit.gap < 0.5) return;
    if (direction === 'down') line.setAttribute('y2', String(hit.rect.y + 1));
    if (direction === 'up') line.setAttribute('y2', String(hit.rect.y + hit.rect.height - 1));
    if (direction === 'right') line.setAttribute('x2', String(hit.rect.x + 1));
    if (direction === 'left') line.setAttribute('x2', String(hit.rect.x + hit.rect.width - 1));
  }

  function snapSimplePath(path, rects) {
    if (!path.hasAttribute('marker-end')) return;
    var dValue = (path.getAttribute('d') || '').trim();
    var vertical = dValue.match(/^M\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+V\s*(-?\d+(?:\.\d+)?)$/i);
    var horizontal = dValue.match(/^M\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+H\s*(-?\d+(?:\.\d+)?)$/i);
    if (vertical) {
      var vx = number(vertical[1]), vy1 = number(vertical[2]), vy2 = number(vertical[3]);
      var vdir = vy2 > vy1 ? 'down' : 'up';
      var vhit = nearestRectForEndpoint(rects, vx, vy2, vdir, 18);
      if (!vhit || vhit.gap < 0.5) return;
      var targetY = vdir === 'down' ? vhit.rect.y + 1 : vhit.rect.y + vhit.rect.height - 1;
      path.setAttribute('d', 'M' + vx + ' ' + vy1 + ' V' + targetY);
      return;
    }
    if (horizontal) {
      var hx1 = number(horizontal[1]), hy = number(horizontal[2]), hx2 = number(horizontal[3]);
      var hdir = hx2 > hx1 ? 'right' : 'left';
      var hhit = nearestRectForEndpoint(rects, hx2, hy, hdir, 18);
      if (!hhit || hhit.gap < 0.5) return;
      var targetX = hdir === 'right' ? hhit.rect.x + 1 : hhit.rect.x + hhit.rect.width - 1;
      path.setAttribute('d', 'M' + hx1 + ' ' + hy + ' H' + targetX);
    }
  }

  function fixKnownDualFlowTriangle(svg) {
    var label = (svg.getAttribute('aria-label') || '') + ' ' + (svg.textContent || '');
    if (label.indexOf('改革自上而下') === -1 && label.indexOf('改革 ↓ 与改善 ↑') === -1) return;
    var polygons = Array.prototype.slice.call(svg.querySelectorAll('polygon'));
    polygons.forEach(function (polygon) {
      var box = visibleBBox(polygon);
      if (!box || box.width > 60 || box.height > 60) return;
      var rects = Array.prototype.slice.call(svg.querySelectorAll('rect')).map(function (r) {
        var b = rectBox(r); b.node = r; return b;
      });
      var cx = box.x + box.width / 2;
      var best = null;
      rects.forEach(function (rect) {
        if (cx < rect.x || cx > rect.x + rect.width) return;
        var bottom = rect.y + rect.height;
        var gap = box.y - bottom;
        if (gap >= 0 && gap <= 8 && (!best || gap < best.gap)) best = { gap: gap };
      });
      if (best && best.gap > 0) {
        var old = polygon.getAttribute('transform') || '';
        polygon.setAttribute('transform', (old + ' translate(0 ' + (-best.gap) + ')').trim());
      }
    });
  }

  function normalizeSvg(svg) {
    if (!svg) return;
    var viewBox = parseViewBox(svg);
    if (!viewBox) return;
    var rects = usefulRects(svg, viewBox);
    Array.prototype.forEach.call(svg.querySelectorAll('line[marker-end]'), function (line) { snapLine(line, rects); });
    Array.prototype.forEach.call(svg.querySelectorAll('path[marker-end]'), function (path) { snapSimplePath(path, rects); });
    fixKnownDualFlowTriangle(svg);
    tightenSceneSvg(svg);
  }

  function run() {
    installDensityStyles();
    var svgs = d.querySelectorAll('figure svg.brief-scene-svg, .engineering-flow svg[viewBox], .visual svg[viewBox]');
    Array.prototype.forEach.call(svgs, normalizeSvg);
  }

  installDensityStyles();
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', function () { requestAnimationFrame(run); }, { once: true });
  else requestAnimationFrame(run);
  w.addEventListener('load', run, { once: true });
  d.addEventListener('qily:shell-ready', run);
})(document, window);
