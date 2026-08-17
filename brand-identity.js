/* QilyLean retired brand rewriter guard｜2026-08-17
 * 兼容旧缓存页面：不再改写首页H1、导语或一级导航。
 */
(function (w) {
  'use strict';
  w.__qilyLeanBrandIdentityV3 = true;
  w.__qilyBrandIdentityContract = Object.freeze({
    retired: true,
    staticHtmlAuthority: true,
    runtimeHeroRewrite: false,
    runtimeNavigationRewrite: false,
    friendLinkInjection: false
  });
})(window);
