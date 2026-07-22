(function(){
  'use strict';
  /*
   * 导航只由浏览器原生链接处理。
   * 不在捕获阶段拦截 click、touch 或 pointer 事件，避免与页面内锚点、
   * target="_top" 及其他页面脚本互相触发而产生循环或空白页。
   */
  if (window.__qilyLeanNativeNavigationReady) return;
  window.__qilyLeanNativeNavigationReady = true;
})();
