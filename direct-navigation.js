/* QilyLean direct navigation v2｜2026-08-17
 * 只声明原生整页导航契约，不再异步加载品牌脚本、改写首屏正文或补挂样式。
 */
(function (w) {
  'use strict';
  if (w.__qilyLeanNativeNavigationReady) return;
  w.__qilyLeanNativeNavigationReady = true;
  w.__qilyDirectNavigationContract = Object.freeze({
    mode: 'native-document-navigation-v2',
    domSwap: false,
    runtimeContentRewrite: false,
    runtimeBrandRewrite: false,
    runtimeStylesheetInjection: false
  });
})(window);
