/* QilyLean V26 compatibility bridge -> authoritative V28 footer */
(function (d, w) {
  'use strict';
  if (w.__qilyFooterV26BridgeToV28) return;
  w.__qilyFooterV26BridgeToV28 = true;

  var CSS_ID = 'qilyFooterStandardV28Stylesheet';
  var CSS_HREF = '/site-footer-standard-v28.css?v=20260810-footer-standard-v28';
  var SCRIPT_ID = 'qilyFooterStandardV28Script';
  var SCRIPT_SRC = '/site-footer-standard-v28.js?v=20260810-footer-standard-v28';

  function ensureCss() {
    var node = d.getElementById(CSS_ID);
    if (node) {
      if (node.getAttribute('href') !== CSS_HREF) node.setAttribute('href', CSS_HREF);
      return;
    }
    node = d.createElement('link');
    node.id = CSS_ID;
    node.rel = 'stylesheet';
    node.href = CSS_HREF;
    (d.head || d.documentElement).appendChild(node);
  }

  function ensureRuntime() {
    if (w.__qilyFooterStandardV28) return;
    var node = d.getElementById(SCRIPT_ID) || d.querySelector('script[data-qily-footer-standard="v28"]');
    if (node) {
      if (node.getAttribute('src') !== SCRIPT_SRC) node.setAttribute('src', SCRIPT_SRC);
      return;
    }
    node = d.createElement('script');
    node.id = SCRIPT_ID;
    node.src = SCRIPT_SRC;
    node.defer = true;
    node.setAttribute('data-qily-footer-standard', 'v28');
    (d.head || d.documentElement).appendChild(node);
  }

  ensureCss();
  ensureRuntime();
})(document, window);
