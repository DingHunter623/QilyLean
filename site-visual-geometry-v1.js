/* QilyLean visual geometry closure v3｜2026-08-19
 * Purpose: sitewide geometry closure for SVG arrows, diagram whitespace, tables and visual-card density.
 * V3 arrow contract:
 * - marker arrow tip keeps a safe visual gap from the target frame;
 * - marker line endpoint accounts for marker tip overhang, so the triangle never presses into the frame;
 * - separate triangle + line arrows are paired geometrically and joined with a small overlap, never detached;
 * - vertical/horizontal arrows remain centered on the target module axis.
 */
(function (d, w) {
  'use strict';
  if (w.__qilyVisualGeometryV3) return;
  w.__qilyVisualGeometryV3 = true;

  var SAFE_GAP = 4;
  var JOIN_OVERLAP = 1.25;
  var MAX_MARKER_TARGET_GAP = 42;
  var MAX_SEPARATE_TARGET_GAP = 52;
  var AXIS_TOLERANCE = 5;

  function installDensityStyles() {
    if (d.getElementById('qilyVisualDensityClosureV3')) return;
    var old = d.getElementById('qilyVisualDensityClosureV2');
    if (old) old.remove();
    var style = d.createElement('style');
    style.id = 'qilyVisualDensityClosureV3';
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
      height: number(rect.getAttribute('height')),
      node: rect
    };
  }

  function isBackgroundRect(rect, viewBox) {
    var box = rectBox(rect);
    if (!viewBox || !box.width || !box.height) return false;
    return box.width >= viewBox.width * 0.88 && box.height >= viewBox.height * 0.72;
  }

  function visibleBBox(node) {
    if (!node) return null;
    var tag = (node.tagName || '').toLowerCase();
    if (tag === 'defs' || tag === 'style' || tag === 'title' || tag === 'desc') return null;
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
    if (!svg || svg.dataset.qilyGeometryTightened === '3') return;
    var viewBox = parseViewBox(svg);
    if (!viewBox) return;

    var children = Array.prototype.slice.call(svg.children);
    var background = children.find(function (node) {
      return node.tagName && node.tagName.toLowerCase() === 'rect' && isBackgroundRect(node, viewBox);
    }) || null;

    var boxes = children.filter(function (node) { return node !== background; }).map(visibleBBox).filter(Boolean);
    var content = union(boxes);
    if (!content || content.width <= 0) return;

    var usage = content.width / viewBox.width;
    if (usage >= 0.925) {
      svg.dataset.qilyGeometryTightened = '3';
      return;
    }

    var pad = Math.max(22, Math.min(38, viewBox.width * 0.025));
    var left = Math.max(viewBox.x, content.x - pad);
    var right = Math.min(viewBox.x + viewBox.width, content.x + content.width + pad);
    var nextWidth = right - left;

    if (nextWidth < viewBox.width * 0.74 || nextWidth >= viewBox.width * 0.96) {
      svg.dataset.qilyGeometryTightened = '3';
      return;
    }

    if (background) {
      var inset = Math.max(10, Math.min(20, nextWidth * 0.014));
      background.setAttribute('x', String(left + inset));
      background.setAttribute('width', String(Math.max(1, nextWidth - inset * 2)));
    }

    svg.setAttribute('viewBox', [left, viewBox.y, nextWidth, viewBox.height].join(' '));
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.dataset.qilyGeometryTightened = '3';
  }

  function usefulRects(svg, viewBox) {
    return Array.prototype.slice.call(svg.querySelectorAll('rect')).filter(function (rect) {
      return !isBackgroundRect(rect, viewBox);
    }).map(rectBox);
  }

  function targetEdge(rect, direction) {
    if (direction === 'down') return rect.y;
    if (direction === 'up') return rect.y + rect.height;
    if (direction === 'right') return rect.x;
    return rect.x + rect.width;
  }

  function nearestRectForEndpoint(rects, x, y, direction, maxGap) {
    var best = null;
    rects.forEach(function (rect) {
      var gap = Infinity;
      if (direction === 'down' && x >= rect.x - AXIS_TOLERANCE && x <= rect.x + rect.width + AXIS_TOLERANCE && rect.y >= y) gap = rect.y - y;
      if (direction === 'up' && x >= rect.x - AXIS_TOLERANCE && x <= rect.x + rect.width + AXIS_TOLERANCE && rect.y + rect.height <= y) gap = y - (rect.y + rect.height);
      if (direction === 'right' && y >= rect.y - AXIS_TOLERANCE && y <= rect.y + rect.height + AXIS_TOLERANCE && rect.x >= x) gap = rect.x - x;
      if (direction === 'left' && y >= rect.y - AXIS_TOLERANCE && y <= rect.y + rect.height + AXIS_TOLERANCE && rect.x + rect.width <= x) gap = x - (rect.x + rect.width);
      if (gap >= 0 && gap <= maxGap && (!best || gap < best.gap)) best = { rect: rect, gap: gap };
    });
    return best;
  }

  function markerFromElement(element) {
    var raw = element.getAttribute('marker-end') || '';
    var match = raw.match(/url\(["']?#([^"')]+)["']?\)/);
    if (!match) return null;
    return element.ownerSVGElement ? element.ownerSVGElement.querySelector('#' + CSS.escape(match[1])) : null;
  }

  function markerTipOverhang(element) {
    var marker = markerFromElement(element);
    if (!marker) return Math.max(2, number(element.getAttribute('stroke-width')) || 1);
    var refX = number(marker.getAttribute('refX'));
    var maxX = refX;
    Array.prototype.forEach.call(marker.children, function (node) {
      var box = visibleBBox(node);
      if (box) maxX = Math.max(maxX, box.x + box.width);
    });
    var units = (marker.getAttribute('markerUnits') || 'strokeWidth').toLowerCase();
    var scale = units === 'userspaceonuse' ? 1 : Math.max(1, number(element.getAttribute('stroke-width')) || 1);
    var overhang = Math.max(0, maxX - refX) * scale;
    return Math.max(1, overhang);
  }

  function markerEndpointForTarget(element, rect, direction) {
    var edge = targetEdge(rect, direction);
    var overhang = markerTipOverhang(element);
    if (direction === 'down' || direction === 'right') return edge - SAFE_GAP - overhang;
    return edge + SAFE_GAP + overhang;
  }

  function snapMarkerLine(line, rects) {
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
    var hit = nearestRectForEndpoint(rects, x2, y2, direction, MAX_MARKER_TARGET_GAP);
    if (!hit) return;
    var target = markerEndpointForTarget(line, hit.rect, direction);
    if (direction === 'down' || direction === 'up') line.setAttribute('y2', String(target));
    else line.setAttribute('x2', String(target));
  }

  function snapMarkerPath(path, rects) {
    if (!path.hasAttribute('marker-end')) return;
    var value = (path.getAttribute('d') || '').trim();
    var vertical = value.match(/^M\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+V\s*(-?\d+(?:\.\d+)?)$/i);
    var horizontal = value.match(/^M\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+H\s*(-?\d+(?:\.\d+)?)$/i);
    if (vertical) {
      var x = number(vertical[1]), y1 = number(vertical[2]), y2 = number(vertical[3]);
      var direction = y2 > y1 ? 'down' : 'up';
      var hit = nearestRectForEndpoint(rects, x, y2, direction, MAX_MARKER_TARGET_GAP);
      if (!hit) return;
      path.setAttribute('d', 'M' + x + ' ' + y1 + ' V' + markerEndpointForTarget(path, hit.rect, direction));
      return;
    }
    if (horizontal) {
      var x1 = number(horizontal[1]), y = number(horizontal[2]), x2 = number(horizontal[3]);
      var hDirection = x2 > x1 ? 'right' : 'left';
      var hHit = nearestRectForEndpoint(rects, x2, y, hDirection, MAX_MARKER_TARGET_GAP);
      if (!hHit) return;
      path.setAttribute('d', 'M' + x1 + ' ' + y + ' H' + markerEndpointForTarget(path, hHit.rect, hDirection));
    }
  }

  function parseTriangle(polygon) {
    var raw = (polygon.getAttribute('points') || '').trim();
    if (!raw) return null;
    var values = raw.split(/[ ,]+/).map(number);
    if (values.length !== 6) return null;
    var points = [
      { x: values[0], y: values[1] },
      { x: values[2], y: values[3] },
      { x: values[4], y: values[5] }
    ];
    var eps = 1.5;
    var pairs = [[0,1,2],[0,2,1],[1,2,0]];
    for (var i = 0; i < pairs.length; i += 1) {
      var a = points[pairs[i][0]], b = points[pairs[i][1]], tip = points[pairs[i][2]];
      if (Math.abs(a.y - b.y) <= eps) {
        var baseY = (a.y + b.y) / 2;
        return {
          polygon: polygon,
          direction: tip.y < baseY ? 'up' : 'down',
          tip: tip,
          baseCenter: { x: (a.x + b.x) / 2, y: baseY },
          baseA: a,
          baseB: b
        };
      }
      if (Math.abs(a.x - b.x) <= eps) {
        var baseX = (a.x + b.x) / 2;
        return {
          polygon: polygon,
          direction: tip.x < baseX ? 'left' : 'right',
          tip: tip,
          baseCenter: { x: baseX, y: (a.y + b.y) / 2 },
          baseA: a,
          baseB: b
        };
      }
    }
    return null;
  }

  function triangleTarget(rects, triangle) {
    return nearestRectForEndpoint(rects, triangle.tip.x, triangle.tip.y, triangle.direction, MAX_SEPARATE_TARGET_GAP);
  }

  function translateTriangle(triangle, delta) {
    var poly = triangle.polygon;
    var transform = poly.getAttribute('transform') || '';
    var dx = 0, dy = 0;
    if (triangle.direction === 'up' || triangle.direction === 'down') dy = delta;
    else dx = delta;
    poly.setAttribute('transform', (transform + ' translate(' + dx + ' ' + dy + ')').trim());
    triangle.tip.x += dx;
    triangle.tip.y += dy;
    triangle.baseCenter.x += dx;
    triangle.baseCenter.y += dy;
  }

  function placeTriangleAtSafeGap(triangle, rects) {
    var hit = triangleTarget(rects, triangle);
    if (!hit) return;
    var desired;
    if (triangle.direction === 'down') desired = hit.rect.y - SAFE_GAP;
    else if (triangle.direction === 'up') desired = hit.rect.y + hit.rect.height + SAFE_GAP;
    else if (triangle.direction === 'right') desired = hit.rect.x - SAFE_GAP;
    else desired = hit.rect.x + hit.rect.width + SAFE_GAP;
    var actual = triangle.direction === 'up' || triangle.direction === 'down' ? triangle.tip.y : triangle.tip.x;
    translateTriangle(triangle, desired - actual);
  }

  function lineData(line) {
    return {
      node: line,
      x1: number(line.getAttribute('x1')),
      y1: number(line.getAttribute('y1')),
      x2: number(line.getAttribute('x2')),
      y2: number(line.getAttribute('y2'))
    };
  }

  function pairLineToTriangle(lines, triangle) {
    var best = null;
    lines.forEach(function (line) {
      if (line.node.hasAttribute('marker-end') || line.node.hasAttribute('marker-start')) return;
      var vertical = Math.abs(line.x1 - line.x2) < 0.75;
      var horizontal = Math.abs(line.y1 - line.y2) < 0.75;
      if ((triangle.direction === 'up' || triangle.direction === 'down') && !vertical) return;
      if ((triangle.direction === 'left' || triangle.direction === 'right') && !horizontal) return;
      var axisDelta = vertical ? Math.abs(line.x2 - triangle.baseCenter.x) : Math.abs(line.y2 - triangle.baseCenter.y);
      if (axisDelta > AXIS_TOLERANCE) return;
      var d1 = Math.hypot(line.x1 - triangle.baseCenter.x, line.y1 - triangle.baseCenter.y);
      var d2 = Math.hypot(line.x2 - triangle.baseCenter.x, line.y2 - triangle.baseCenter.y);
      var distance = Math.min(d1, d2);
      if (distance <= 28 && (!best || distance < best.distance)) best = { line: line, distance: distance, end: d1 <= d2 ? 1 : 2 };
    });
    return best;
  }

  function joinSeparateArrows(svg, rects) {
    var lines = Array.prototype.slice.call(svg.querySelectorAll('line')).map(lineData);
    var triangles = Array.prototype.slice.call(svg.querySelectorAll('polygon')).map(parseTriangle).filter(Boolean).filter(function (triangle) {
      var box = visibleBBox(triangle.polygon);
      return box && box.width <= 72 && box.height <= 72;
    });

    triangles.forEach(function (triangle) {
      placeTriangleAtSafeGap(triangle, rects);
      var pair = pairLineToTriangle(lines, triangle);
      if (!pair) return;
      var line = pair.line.node;
      var bx = triangle.baseCenter.x;
      var by = triangle.baseCenter.y;
      if (triangle.direction === 'up') by += JOIN_OVERLAP;
      if (triangle.direction === 'down') by -= JOIN_OVERLAP;
      if (triangle.direction === 'left') bx += JOIN_OVERLAP;
      if (triangle.direction === 'right') bx -= JOIN_OVERLAP;
      if (pair.end === 1) {
        line.setAttribute('x1', String(bx));
        line.setAttribute('y1', String(by));
      } else {
        line.setAttribute('x2', String(bx));
        line.setAttribute('y2', String(by));
      }
    });
  }

  function normalizeSvg(svg) {
    if (!svg) return;
    var viewBox = parseViewBox(svg);
    if (!viewBox) return;
    var rects = usefulRects(svg, viewBox);
    Array.prototype.forEach.call(svg.querySelectorAll('line[marker-end]'), function (line) { snapMarkerLine(line, rects); });
    Array.prototype.forEach.call(svg.querySelectorAll('path[marker-end]'), function (path) { snapMarkerPath(path, rects); });
    joinSeparateArrows(svg, rects);
    tightenSceneSvg(svg);
    svg.dataset.qilyArrowClosure = 'v3';
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