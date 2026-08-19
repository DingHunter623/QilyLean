/* QilyLean visual geometry closure v4｜2026-08-19
 * Purpose: sitewide geometry closure for SVG arrows, diagram whitespace, tables and visual-card density.
 * V4 arrow contract:
 * - simple marker arrows are converted to one-piece filled vector paths in user-space units;
 * - separate line + triangle arrows are converted to one-piece filled vector paths;
 * - no shaft is allowed to protrude through an arrow tip;
 * - arrowheads use bounded dimensions independent of markerUnits/strokeWidth multiplication;
 * - target-frame gap is explicit and consistent;
 * - the 2026-08-14 bidirectional reform/improvement scene uses symmetric, smaller arrows.
 */
(function (d, w) {
  'use strict';
  if (w.__qilyVisualGeometryV4) return;
  w.__qilyVisualGeometryV4 = true;

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var SAFE_GAP = 10;
  var MAX_TARGET_GAP = 96;
  var AXIS_TOLERANCE = 6;

  function installDensityStyles() {
    if (d.getElementById('qilyVisualDensityClosureV4')) return;
    var old = d.getElementById('qilyVisualDensityClosureV3') || d.getElementById('qilyVisualDensityClosureV2');
    if (old) old.remove();
    var style = d.createElement('style');
    style.id = 'qilyVisualDensityClosureV4';
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

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
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
    if (!svg || svg.dataset.qilyGeometryTightened === '4') return;
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
      svg.dataset.qilyGeometryTightened = '4';
      return;
    }

    var pad = Math.max(22, Math.min(38, viewBox.width * 0.025));
    var left = Math.max(viewBox.x, content.x - pad);
    var right = Math.min(viewBox.x + viewBox.width, content.x + content.width + pad);
    var nextWidth = right - left;

    if (nextWidth < viewBox.width * 0.74 || nextWidth >= viewBox.width * 0.96) {
      svg.dataset.qilyGeometryTightened = '4';
      return;
    }

    if (background) {
      var inset = Math.max(10, Math.min(20, nextWidth * 0.014));
      background.setAttribute('x', String(left + inset));
      background.setAttribute('width', String(Math.max(1, nextWidth - inset * 2)));
    }

    svg.setAttribute('viewBox', [left, viewBox.y, nextWidth, viewBox.height].join(' '));
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.dataset.qilyGeometryTightened = '4';
  }

  function usefulRects(svg, viewBox) {
    return Array.prototype.slice.call(svg.querySelectorAll('rect')).filter(function (rect) {
      return !isBackgroundRect(rect, viewBox);
    }).map(rectBox);
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

  function targetTip(rect, direction) {
    if (direction === 'down') return rect.y - SAFE_GAP;
    if (direction === 'up') return rect.y + rect.height + SAFE_GAP;
    if (direction === 'right') return rect.x - SAFE_GAP;
    return rect.x + rect.width + SAFE_GAP;
  }

  function colorOf(element) {
    var color = element.getAttribute('stroke') || element.getAttribute('fill') || '';
    if (!color || color === 'none' || color === 'currentColor') {
      try {
        var style = w.getComputedStyle(element);
        color = style.stroke && style.stroke !== 'none' ? style.stroke : style.fill;
      } catch (error) {}
    }
    return color && color !== 'none' ? color : '#0f4b5a';
  }

  function strokeWidthOf(element) {
    var value = number(element.getAttribute('stroke-width'));
    if (value > 0) return value;
    try {
      value = number(w.getComputedStyle(element).strokeWidth);
    } catch (error) {}
    return value > 0 ? value : 6;
  }

  function pathForArrow(start, tip, direction, shaftWidth, headLength, headHalf) {
    var sh = shaftWidth / 2;
    if (direction === 'down') {
      var baseDown = Math.max(start.y + 2, tip.y - headLength);
      return 'M' + (start.x - sh) + ' ' + start.y + ' H' + (start.x + sh) + ' V' + baseDown + ' H' + (start.x + headHalf) + ' L' + tip.x + ' ' + tip.y + ' L' + (start.x - headHalf) + ' ' + baseDown + ' H' + (start.x - sh) + ' Z';
    }
    if (direction === 'up') {
      var baseUp = Math.min(start.y - 2, tip.y + headLength);
      return 'M' + (start.x - sh) + ' ' + start.y + ' H' + (start.x + sh) + ' V' + baseUp + ' H' + (start.x + headHalf) + ' L' + tip.x + ' ' + tip.y + ' L' + (start.x - headHalf) + ' ' + baseUp + ' H' + (start.x - sh) + ' Z';
    }
    if (direction === 'right') {
      var baseRight = Math.max(start.x + 2, tip.x - headLength);
      return 'M' + start.x + ' ' + (start.y - sh) + ' V' + (start.y + sh) + ' H' + baseRight + ' V' + (start.y + headHalf) + ' L' + tip.x + ' ' + tip.y + ' L' + baseRight + ' ' + (start.y - headHalf) + ' V' + (start.y - sh) + ' Z';
    }
    var baseLeft = Math.min(start.x - 2, tip.x + headLength);
    return 'M' + start.x + ' ' + (start.y - sh) + ' V' + (start.y + sh) + ' H' + baseLeft + ' V' + (start.y + headHalf) + ' L' + tip.x + ' ' + tip.y + ' L' + baseLeft + ' ' + (start.y - headHalf) + ' V' + (start.y - sh) + ' Z';
  }

  function insertOnePieceArrow(reference, start, tip, direction, color, strokeWidth) {
    var shaft = clamp(strokeWidth || 6, 4, 8);
    var headLength = clamp(shaft * 2.25, 11, 17);
    var headHalf = clamp(shaft * 1.65, 7.5, 12.5);
    var path = d.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', pathForArrow(start, tip, direction, shaft, headLength, headHalf));
    path.setAttribute('fill', color);
    path.setAttribute('stroke', 'none');
    path.setAttribute('data-qily-unified-arrow', 'v4');
    if (reference && reference.getAttribute('opacity')) path.setAttribute('opacity', reference.getAttribute('opacity'));
    if (reference && reference.parentNode) reference.parentNode.insertBefore(path, reference);
    return path;
  }

  function simpleArrowGeometry(element) {
    var tag = (element.tagName || '').toLowerCase();
    var x1, y1, x2, y2;
    if (tag === 'line') {
      x1 = number(element.getAttribute('x1'));
      y1 = number(element.getAttribute('y1'));
      x2 = number(element.getAttribute('x2'));
      y2 = number(element.getAttribute('y2'));
    } else if (tag === 'path') {
      var value = (element.getAttribute('d') || '').trim();
      var vertical = value.match(/^M\s*(-?\d+(?:\.\d+)?)\s*[ ,]+\s*(-?\d+(?:\.\d+)?)\s+V\s*(-?\d+(?:\.\d+)?)\s*$/i);
      var horizontal = value.match(/^M\s*(-?\d+(?:\.\d+)?)\s*[ ,]+\s*(-?\d+(?:\.\d+)?)\s+H\s*(-?\d+(?:\.\d+)?)\s*$/i);
      var direct = value.match(/^M\s*(-?\d+(?:\.\d+)?)\s*[ ,]+\s*(-?\d+(?:\.\d+)?)\s+L\s*(-?\d+(?:\.\d+)?)\s*[ ,]+\s*(-?\d+(?:\.\d+)?)\s*$/i);
      if (vertical) {
        x1 = number(vertical[1]); y1 = number(vertical[2]); x2 = x1; y2 = number(vertical[3]);
      } else if (horizontal) {
        x1 = number(horizontal[1]); y1 = number(horizontal[2]); x2 = number(horizontal[3]); y2 = y1;
      } else if (direct) {
        x1 = number(direct[1]); y1 = number(direct[2]); x2 = number(direct[3]); y2 = number(direct[4]);
      } else return null;
    } else return null;

    var dx = x2 - x1, dy = y2 - y1;
    var direction = '';
    if (Math.abs(dx) <= 0.75 && Math.abs(dy) > 1) direction = dy > 0 ? 'down' : 'up';
    else if (Math.abs(dy) <= 0.75 && Math.abs(dx) > 1) direction = dx > 0 ? 'right' : 'left';
    else return null;
    return { start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, direction: direction };
  }

  function convertMarkerArrow(element, rects) {
    if (!element.hasAttribute('marker-end') || element.dataset.qilyUnifiedArrow === 'v4') return;
    var geometry = simpleArrowGeometry(element);
    if (!geometry) return;
    var hit = nearestRectForEndpoint(rects, geometry.end.x, geometry.end.y, geometry.direction, MAX_TARGET_GAP);
    var tip = { x: geometry.end.x, y: geometry.end.y };
    if (hit) {
      var t = targetTip(hit.rect, geometry.direction);
      if (geometry.direction === 'down' || geometry.direction === 'up') tip.y = t;
      else tip.x = t;
    }
    insertOnePieceArrow(element, geometry.start, tip, geometry.direction, colorOf(element), strokeWidthOf(element));
    element.remove();
  }

  function translationOf(element) {
    var transform = element.getAttribute('transform') || '';
    var tx = 0, ty = 0, match;
    var re = /translate\(\s*(-?\d+(?:\.\d+)?)\s*(?:[, ]\s*(-?\d+(?:\.\d+)?))?\s*\)/ig;
    while ((match = re.exec(transform))) {
      tx += number(match[1]);
      ty += match[2] == null ? 0 : number(match[2]);
    }
    return { x: tx, y: ty };
  }

  function parseTriangle(polygon) {
    var raw = (polygon.getAttribute('points') || '').trim();
    if (!raw) return null;
    var values = raw.split(/[ ,]+/).map(number);
    if (values.length !== 6) return null;
    var shift = translationOf(polygon);
    var points = [
      { x: values[0] + shift.x, y: values[1] + shift.y },
      { x: values[2] + shift.x, y: values[3] + shift.y },
      { x: values[4] + shift.x, y: values[5] + shift.y }
    ];
    var eps = 1.5;
    var pairs = [[0,1,2],[0,2,1],[1,2,0]];
    for (var i = 0; i < pairs.length; i += 1) {
      var a = points[pairs[i][0]], b = points[pairs[i][1]], tip = points[pairs[i][2]];
      if (Math.abs(a.y - b.y) <= eps) {
        var baseY = (a.y + b.y) / 2;
        return { polygon: polygon, direction: tip.y < baseY ? 'up' : 'down', tip: tip, baseCenter: { x: (a.x + b.x) / 2, y: baseY } };
      }
      if (Math.abs(a.x - b.x) <= eps) {
        var baseX = (a.x + b.x) / 2;
        return { polygon: polygon, direction: tip.x < baseX ? 'left' : 'right', tip: tip, baseCenter: { x: baseX, y: (a.y + b.y) / 2 } };
      }
    }
    return null;
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

  function pairLineToTriangle(lines, triangle, used) {
    var best = null;
    lines.forEach(function (line) {
      if (used.has(line.node) || line.node.hasAttribute('marker-end') || line.node.hasAttribute('marker-start')) return;
      var vertical = Math.abs(line.x1 - line.x2) < 0.75;
      var horizontal = Math.abs(line.y1 - line.y2) < 0.75;
      if ((triangle.direction === 'up' || triangle.direction === 'down') && !vertical) return;
      if ((triangle.direction === 'left' || triangle.direction === 'right') && !horizontal) return;
      var axisDelta = vertical ? Math.abs(line.x2 - triangle.baseCenter.x) : Math.abs(line.y2 - triangle.baseCenter.y);
      if (axisDelta > AXIS_TOLERANCE) return;
      var d1 = Math.hypot(line.x1 - triangle.baseCenter.x, line.y1 - triangle.baseCenter.y);
      var d2 = Math.hypot(line.x2 - triangle.baseCenter.x, line.y2 - triangle.baseCenter.y);
      var distance = Math.min(d1, d2);
      if (distance <= 34 && (!best || distance < best.distance)) best = { line: line, distance: distance, end: d1 <= d2 ? 1 : 2 };
    });
    return best;
  }

  function convertSeparateArrows(svg, rects) {
    var used = new Set();
    var lines = Array.prototype.slice.call(svg.querySelectorAll('line')).map(lineData);
    var triangles = Array.prototype.slice.call(svg.querySelectorAll('polygon')).map(parseTriangle).filter(Boolean).filter(function (triangle) {
      var box = visibleBBox(triangle.polygon);
      return box && box.width <= 80 && box.height <= 80;
    });

    triangles.forEach(function (triangle) {
      var pair = pairLineToTriangle(lines, triangle, used);
      if (!pair) return;
      var line = pair.line;
      var start = pair.end === 1 ? { x: line.x2, y: line.y2 } : { x: line.x1, y: line.y1 };
      var tip = { x: triangle.tip.x, y: triangle.tip.y };
      var hit = nearestRectForEndpoint(rects, tip.x, tip.y, triangle.direction, MAX_TARGET_GAP);
      if (hit) {
        var t = targetTip(hit.rect, triangle.direction);
        if (triangle.direction === 'up' || triangle.direction === 'down') tip.y = t;
        else tip.x = t;
      }
      insertOnePieceArrow(line.node, start, tip, triangle.direction, colorOf(triangle.polygon), strokeWidthOf(line.node));
      used.add(line.node);
      line.node.remove();
      triangle.polygon.remove();
    });
  }

  function removeLeanSceneLegacyArrows(svg) {
    Array.prototype.forEach.call(svg.querySelectorAll('path[marker-end]'), function (path) {
      var g = simpleArrowGeometry(path);
      if (g && Math.abs(g.start.x - 600) < 3 && g.start.y >= 235 && g.end.y <= 325) path.remove();
    });
    Array.prototype.forEach.call(svg.querySelectorAll('line'), function (line) {
      var g = simpleArrowGeometry(line);
      if (g && Math.abs(g.start.x - 600) < 3 && Math.abs(g.end.x - 600) < 3 && Math.min(g.start.y, g.end.y) >= 430 && Math.max(g.start.y, g.end.y) <= 520) line.remove();
    });
    Array.prototype.forEach.call(svg.querySelectorAll('polygon'), function (polygon) {
      var triangle = parseTriangle(polygon);
      if (triangle && Math.abs(triangle.tip.x - 600) < 20 && triangle.tip.y >= 430 && triangle.tip.y <= 475) polygon.remove();
    });
  }

  function normalizeLeanBidirectionalScene(svg) {
    var label = svg.getAttribute('aria-label') || '';
    if (label.indexOf('改革自上而下改善自下而上的双向治理机制图') === -1 || svg.dataset.qilyBidirectionalArrow === 'v4') return false;
    removeLeanSceneLegacyArrows(svg);

    var anchor = svg.querySelector('rect[x="170"][y="320"]') || svg.querySelector('rect');
    var down = d.createElementNS(SVG_NS, 'path');
    down.setAttribute('d', pathForArrow({ x: 600, y: 252 }, { x: 600, y: 308 }, 'down', 7, 16, 10));
    down.setAttribute('fill', '#caa15f');
    down.setAttribute('stroke', 'none');
    down.setAttribute('data-qily-unified-arrow', 'v4');
    down.setAttribute('data-qily-scene-arrow', 'reform-down');

    var up = d.createElementNS(SVG_NS, 'path');
    up.setAttribute('d', pathForArrow({ x: 600, y: 503 }, { x: 600, y: 447 }, 'up', 7, 16, 10));
    up.setAttribute('fill', '#178b94');
    up.setAttribute('stroke', 'none');
    up.setAttribute('data-qily-unified-arrow', 'v4');
    up.setAttribute('data-qily-scene-arrow', 'improvement-up');

    if (anchor && anchor.parentNode) {
      anchor.parentNode.insertBefore(down, anchor);
      anchor.parentNode.insertBefore(up, anchor);
    } else {
      svg.appendChild(down);
      svg.appendChild(up);
    }
    svg.dataset.qilyBidirectionalArrow = 'v4';
    return true;
  }

  function normalizeSvg(svg) {
    if (!svg || svg.dataset.qilyArrowClosure === 'v4') return;
    var viewBox = parseViewBox(svg);
    if (!viewBox) return;
    var rects = usefulRects(svg, viewBox);

    normalizeLeanBidirectionalScene(svg);
    Array.prototype.forEach.call(svg.querySelectorAll('line[marker-end],path[marker-end]'), function (element) {
      convertMarkerArrow(element, rects);
    });
    convertSeparateArrows(svg, rects);

    if (svg.matches('svg.brief-scene-svg') || svg.closest('.engineering-flow,.visual')) tightenSceneSvg(svg);
    svg.dataset.qilyArrowClosure = 'v4';
  }

  function run() {
    installDensityStyles();
    var svgs = d.querySelectorAll('main svg[viewBox]');
    Array.prototype.forEach.call(svgs, normalizeSvg);
  }

  installDensityStyles();
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', function () { requestAnimationFrame(run); }, { once: true });
  else requestAnimationFrame(run);
  w.addEventListener('load', run, { once: true });
  w.addEventListener('pageshow', run);
  d.addEventListener('qily:shell-ready', run);
})(document, window);
