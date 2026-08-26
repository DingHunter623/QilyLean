/* QilyLean Sitewide Content Contrast Guard V6｜2026-08-26
 * Applies WCAG-oriented readable foreground correction to non-interactive public text.
 * Buttons/CTA remain owned by Interaction Contrast Guard.
 * V6: only registered hero/dark components own gradient/image contrast. Generic gradients no longer
 * suppress runtime correction, and Chromium/Safari text-fill is evaluated as the rendered foreground.
 */
(function(d,w){
  'use strict';
  if(w.__qilyContentContrastGuardV1)return;
  w.__qilyContentContrastGuardV1=true;

  var SELECTOR='p,li,dt,dd,td,th,label,small,span,strong,b,em,h1,h2,h3,h4,h5,h6,.module-lead,.engineering-checklist,.notice,.callout,.summary,.insight,.lead,[role="status"],[role="alert"]';
  var COMPONENT_OWNED_DARK='.hero,.module-hero,.daily-hero,.document-hero,.project-hero,.projects-hero,.cooperation-hero,.capability-hero,.capabilities-hero,.experience-hero,.improvement-hero,.improvements-hero,.knowledge-hero,.trust-hero,.article-hub,.qily-ia-dark,.closing,[data-qily-dark-surface],[data-theme="dark"]';
  var EXCLUDE='header,.qily-site-header,.qily-global-header,#floatDock,.qily-floating-dock,.qily-web-translate,.qily-translation-progress,button,input,select,textarea,[role="button"],[contenteditable="true"]';
  var queued=false;

  function parseColor(value){
    var m=String(value||'').match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)/i);
    if(!m)return null;
    return{r:Number(m[1]),g:Number(m[2]),b:Number(m[3]),a:m[4]===undefined?1:Number(m[4])};
  }
  function blend(fg,bg){var a=fg.a==null?1:fg.a;return{r:fg.r*a+bg.r*(1-a),g:fg.g*a+bg.g*(1-a),b:fg.b*a+bg.b*(1-a),a:1}}
  function channel(v){v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)}
  function luminance(c){return .2126*channel(c.r)+.7152*channel(c.g)+.0722*channel(c.b)}
  function contrast(a,b){var x=luminance(a),y=luminance(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
  function effectiveBackground(el){
    var current=el;var bg={r:255,g:255,b:255,a:1};var layers=[];
    while(current&&current.nodeType===1){var c=parseColor(w.getComputedStyle(current).backgroundColor);if(c&&c.a>0)layers.push(c);current=current.parentElement}
    for(var i=layers.length-1;i>=0;i-=1)bg=blend(layers[i],bg);
    return bg;
  }
  function renderedForeground(style){
    var fill=parseColor(style&&style.getPropertyValue&&style.getPropertyValue('-webkit-text-fill-color'));
    if(fill&&fill.a>0)return fill;
    return parseColor(style&&style.color);
  }
  function threshold(el){var s=w.getComputedStyle(el);var size=parseFloat(s.fontSize)||16;var weight=parseInt(s.fontWeight,10)||400;return(size>=24||(size>=18.66&&weight>=700))?3:4.5}
  function release(el){
    if(!el)return;
    el.removeAttribute('data-qily-content-contrast-fixed');
  }
  function isComponentOwnedDark(el){
    return !!(el&&el.matches&&el.matches(COMPONENT_OWNED_DARK));
  }
  function hasOpaqueLocalSurface(style,el){
    if(el&&el.getAttribute&&el.getAttribute('data-qily-light-surface')==='true')return true;
    var c=parseColor(style&&style.backgroundColor);
    return !!(c&&c.a>=.82);
  }
  function componentOwnsContrast(el){
    if(!el)return false;
    var current=el;var localSurface=false;
    while(current&&current.nodeType===1&&current!==d.documentElement){
      var style=w.getComputedStyle(current);
      if(isComponentOwnedDark(current))return !localSurface;
      if(hasOpaqueLocalSurface(style,current))localSurface=true;
      if(current===d.body)break;
      current=current.parentElement;
    }
    return false;
  }
  function fix(el){
    if(!el||!el.isConnected)return;
    if(el.closest(EXCLUDE)){release(el);return}
    if(componentOwnsContrast(el)){release(el);return}
    if(!String(el.textContent||'').trim())return;
    var style=w.getComputedStyle(el);if(style.visibility==='hidden'||style.display==='none'||Number(style.opacity)===0)return;
    var fg=renderedForeground(style);if(!fg)return;var bg=effectiveBackground(el);var actual=blend(fg,bg);if(contrast(actual,bg)>=threshold(el)){release(el);return}
    var dark={r:23,g:63,b:73,a:1},light={r:255,g:255,b:255,a:1};var darkRatio=contrast(dark,bg),lightRatio=contrast(light,bg);el.setAttribute('data-qily-content-contrast-fixed',lightRatio>darkRatio?'light':'dark')
  }
  function scan(root){
    root=root||d.body;if(!root)return;
    if(root.matches&&root.matches(SELECTOR))fix(root);
    var nodes=root.querySelectorAll?root.querySelectorAll(SELECTOR):[];for(var i=0;i<nodes.length;i+=1)fix(nodes[i])
  }
  function schedule(root){if(queued)return;queued=true;w.requestAnimationFrame(function(){queued=false;scan(root&&root.nodeType===1?root:d.body)})}
  function boot(){scan(d.body)}
  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  d.addEventListener('qily:shell-ready',function(){schedule(d.body)});d.addEventListener('qily:language-change',function(){schedule(d.body)});w.addEventListener('pageshow',function(){schedule(d.body)},{passive:true});w.addEventListener('resize',function(){schedule(d.body)},{passive:true});
  if(w.MutationObserver)new MutationObserver(function(records){for(var i=0;i<records.length;i+=1){var target=records[i].target&&records[i].target.nodeType===1?records[i].target:records[i].target&&records[i].target.parentElement;if(target){schedule(target);break}}}).observe(d.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class','style','data-qily-light-surface','data-qily-dark-surface','data-qily-dark-band','data-qily-table-theme']});
})(document,window);
