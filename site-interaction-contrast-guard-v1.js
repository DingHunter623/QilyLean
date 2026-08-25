/* QilyLean Sitewide Interaction Contrast Guard V1｜2026-08-25
 * Measures rendered control colors and corrects only when contrast is below WCAG AA 4.5:1.
 * Covers legacy, generated and dynamically inserted CTA/button controls without page-specific patches.
 */
(function(d,w){
  'use strict';
  if(w.__qilyInteractionContrastGuardV1)return;
  w.__qilyInteractionContrastGuardV1=true;

  var SELECTOR='a[href],button,[role="button"],input[type="button"],input[type="submit"],input[type="reset"]';
  var queued=false;

  function colorParts(value){
    var match=String(value||'').match(/rgba?\(([^)]+)\)/i);
    if(!match)return null;
    var parts=match[1].split(',').map(function(part){return parseFloat(part.trim())});
    if(parts.length<3||parts.some(function(n){return !Number.isFinite(n)}))return null;
    return {r:Math.max(0,Math.min(255,parts[0])),g:Math.max(0,Math.min(255,parts[1])),b:Math.max(0,Math.min(255,parts[2])),a:parts.length>3?Math.max(0,Math.min(1,parts[3])):1};
  }

  function channel(value){
    value/=255;
    return value<=.04045?value/12.92:Math.pow((value+.055)/1.055,2.4);
  }
  function luminance(c){return .2126*channel(c.r)+.7152*channel(c.g)+.0722*channel(c.b)}
  function contrast(a,b){
    var x=luminance(a),y=luminance(b),light=Math.max(x,y),dark=Math.min(x,y);
    return (light+.05)/(dark+.05);
  }
  function composite(fg,bg){
    var a=fg.a+(bg.a||1)*(1-fg.a);
    if(!a)return {r:255,g:255,b:255,a:0};
    return {
      r:(fg.r*fg.a+bg.r*(bg.a||1)*(1-fg.a))/a,
      g:(fg.g*fg.a+bg.g*(bg.a||1)*(1-fg.a))/a,
      b:(fg.b*fg.a+bg.b*(bg.a||1)*(1-fg.a))/a,
      a:a
    };
  }
  function effectiveBackground(el){
    var current=el,acc={r:255,g:255,b:255,a:1},depth=0;
    while(current&&current.nodeType===1&&depth<8){
      var c=colorParts(w.getComputedStyle(current).backgroundColor);
      if(c&&c.a>0){
        acc=composite(c,acc);
        if(c.a>=.96)break;
      }
      current=current.parentElement;
      depth+=1;
    }
    return acc;
  }
  function visible(el){
    if(!el||!el.isConnected)return false;
    var s=w.getComputedStyle(el);
    if(s.display==='none'||s.visibility==='hidden'||parseFloat(s.opacity||'1')<.05)return false;
    var r=el.getBoundingClientRect();
    return r.width>1&&r.height>1;
  }
  function buttonLike(el,style){
    if(el.matches('button,input[type="button"],input[type="submit"],input[type="reset"],[role="button"]'))return true;
    if(/button|btn|cta|action|download|open|reference|primary|share|service/i.test(el.className||''))return true;
    var bg=colorParts(style.backgroundColor);
    var radius=parseFloat(style.borderRadius||'0');
    var pad=parseFloat(style.paddingTop||'0')+parseFloat(style.paddingBottom||'0');
    return !!(bg&&bg.a>.35&&(radius>=3||pad>=8));
  }
  function textColor(style){
    var fill=colorParts(style.getPropertyValue('-webkit-text-fill-color'));
    if(fill&&fill.a>.05)return fill;
    return colorParts(style.color);
  }
  function audit(el){
    if(!visible(el))return;
    if(el.closest('[data-qily-no-contrast-guard="true"]'))return;
    var style=w.getComputedStyle(el);
    if(!buttonLike(el,style)){el.removeAttribute('data-qily-interaction-contrast');return}
    var bg=effectiveBackground(el),fg=textColor(style);
    if(!bg||!fg)return;
    var current=contrast(fg,bg);
    if(current>=4.5){el.removeAttribute('data-qily-interaction-contrast');return}
    var white={r:255,g:255,b:255,a:1};
    var dark={r:23,g:50,b:45,a:1};
    var whiteRatio=contrast(white,bg),darkRatio=contrast(dark,bg);
    el.setAttribute('data-qily-interaction-contrast',whiteRatio>=darkRatio?'light':'dark');
  }
  function auditTree(root){
    root=root||d;
    if(root.matches&&root.matches(SELECTOR))audit(root);
    var nodes=root.querySelectorAll?root.querySelectorAll(SELECTOR):[];
    for(var i=0;i<nodes.length;i+=1)audit(nodes[i]);
  }
  function schedule(root){
    if(queued)return;
    queued=true;
    w.requestAnimationFrame(function(){queued=false;auditTree(root&&root.nodeType===1?root:d)});
  }

  function boot(){auditTree(d)}
  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  d.addEventListener('qily:shell-ready',function(){schedule(d)});
  d.addEventListener('qily:language-change',function(){schedule(d)});
  w.addEventListener('pageshow',function(){schedule(d)},{passive:true});
  w.addEventListener('resize',function(){schedule(d)},{passive:true});
  d.addEventListener('pointerover',function(e){var el=e.target&&e.target.closest?e.target.closest(SELECTOR):null;if(el)w.requestAnimationFrame(function(){audit(el)})},true);
  d.addEventListener('focusin',function(e){var el=e.target&&e.target.closest?e.target.closest(SELECTOR):null;if(el)w.requestAnimationFrame(function(){audit(el)})},true);
  d.addEventListener('transitionend',function(e){var el=e.target&&e.target.closest?e.target.closest(SELECTOR):null;if(el)audit(el)},true);

  if(w.MutationObserver){
    new MutationObserver(function(mutations){
      for(var i=0;i<mutations.length;i+=1){
        var m=mutations[i];
        if(m.type==='childList'&&m.addedNodes.length){schedule(m.target);return}
        if(m.type==='attributes'){schedule(m.target);return}
      }
    }).observe(d.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style','disabled','aria-disabled']});
  }

  w.QilyInteractionContrastGuard=Object.freeze({version:'v1',audit:function(){auditTree(d)}});
})(document,window);
