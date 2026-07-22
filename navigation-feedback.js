(function () {
  'use strict';

  function installNavigationFeedback(doc) {
    if (!doc || !doc.documentElement) return;

    if (!doc.getElementById('qilyLeanNavigationFeedbackStyle')) {
      var style = doc.createElement('style');
      style.id = 'qilyLeanNavigationFeedbackStyle';
      style.textContent =
        '.qilyLean-nav-target{' +
          'cursor:pointer!important;' +
          '-webkit-tap-highlight-color:rgba(23,139,148,.28);' +
          'transition:transform .18s ease,filter .18s ease,opacity .18s ease,box-shadow .18s ease,background-color .18s ease;' +
        '}' +
        'a.qilyLean-nav-target{' +
          'position:relative;text-decoration-line:underline;text-decoration-color:transparent;' +
          'text-decoration-thickness:2px;text-underline-offset:.32em;' +
          'transition:text-decoration-color .18s ease,transform .18s ease,filter .18s ease,opacity .18s ease,box-shadow .18s ease,background-color .18s ease;' +
        '}' +
        'a.qilyLean-nav-target::after{' +
          'content:"";position:absolute;left:0;right:0;bottom:-.42em;height:3px;border-radius:999px;' +
          'background:currentColor;transform:scaleX(0);transform-origin:center;transition:transform .18s ease;pointer-events:none;' +
        '}' +
        '.qilyLean-nav-target:hover,.qilyLean-nav-target:focus-visible,.qilyLean-nav-target.qilyLean-nav-pressed{' +
          'filter:brightness(1.08) saturate(1.16);opacity:.92;' +
        '}' +
        'a.qilyLean-nav-target:hover,a.qilyLean-nav-target:focus-visible,a.qilyLean-nav-target.qilyLean-nav-pressed{text-decoration-color:currentColor;}' +
        'a.qilyLean-nav-target:hover::after,a.qilyLean-nav-target:focus-visible::after,a.qilyLean-nav-target.qilyLean-nav-pressed::after{transform:scaleX(1);}' +
        '.qilyLean-nav-lift:hover,.qilyLean-nav-lift:focus-visible,.qilyLean-nav-lift.qilyLean-nav-pressed{' +
          'transform:translateY(-3px);box-shadow:0 12px 24px rgba(15,75,90,.22);' +
        '}' +
        '.qilyLean-nav-target:focus-visible{outline:3px solid rgba(23,139,148,.88);outline-offset:4px;}' +
        '.qilyLean-nav-target:active{transform:translateY(-1px) scale(.985);}';
      (doc.head || doc.documentElement).appendChild(style);
    }

    function markTarget(element) {
      if (!element || element.nodeType !== 1 || element.hasAttribute('disabled')) return;
      element.classList.add('qilyLean-nav-target');
      if (element.matches('.button,.btn,.float-btn,.float-home,[data-href],[data-url],[data-route],[role="link"],.card,.tile,.project,.module,[class*="card"],[class*="tile"],[class*="project"],[class*="module"]')) {
        element.classList.add('qilyLean-nav-lift');
      }
    }

    function markTargets(root) {
      if (!root || (root.nodeType !== 1 && root.nodeType !== 9)) return;
      if (root.nodeType === 1 && root.matches && root.matches('a[href],[role="link"],[data-href],[data-url],[data-route],[data-nav],[data-action="home"],.float-home,[data-a="home"]')) {
        markTarget(root);
      }
      var targets = root.querySelectorAll ? root.querySelectorAll('a[href]:not([href^="javascript:"]),[role="link"],[data-href],[data-url],[data-route],[data-nav],[data-action="home"],.float-home,[data-a="home"],[onclick*="location"],[onclick*="QilyLeanNavigate"]') : [];
      Array.prototype.forEach.call(targets, markTarget);
    }

    markTargets(doc);
    if (doc.__qilyLeanNavigationFeedbackBound) return;
    doc.__qilyLeanNavigationFeedbackBound = true;

    doc.addEventListener('pointerdown', function (event) {
      var target = event.target && event.target.closest ? event.target.closest('.qilyLean-nav-target') : null;
      if (!target) return;
      target.classList.add('qilyLean-nav-pressed');
      doc.defaultView.setTimeout(function () { target.classList.remove('qilyLean-nav-pressed'); }, 260);
    }, { capture: true, passive: true });

    try {
      var Observer = doc.defaultView.MutationObserver;
      var observer = new Observer(function (records) {
        records.forEach(function (record) {
          Array.prototype.forEach.call(record.addedNodes, function (node) {
            if (node && (node.nodeType === 1 || node.nodeType === 9)) markTargets(node);
          });
        });
      });
      observer.observe(doc.documentElement, { childList: true, subtree: true });
    } catch (error) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { installNavigationFeedback(document); }, { once: true });
  } else {
    installNavigationFeedback(document);
  }
})();