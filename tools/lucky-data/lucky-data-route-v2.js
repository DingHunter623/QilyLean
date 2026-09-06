/* Lucky Data route + game selector coordinator | QilyLean | 2026-09-07 */
(function(d,w){
  'use strict';
  if(w.__qilyLuckyDataRouteV2)return;
  w.__qilyLuckyDataRouteV2=true;
  var ROUTES={dlt:'/tools/lucky-data/dlt/',ssq:'/tools/lucky-data/ssq/',kl8:'/tools/lucky-data/kl8/',fc3d:'/tools/lucky-data/fc3d/'};
  var LABELS={dlt:'大乐透',ssq:'双色球',kl8:'快乐8',fc3d:'福彩3D'};

  function gameButtons(){return Array.prototype.slice.call(d.querySelectorAll('#gameTabs [data-game]'));}
  function selectors(){return Array.prototype.slice.call(d.querySelectorAll('[data-lucky-game-select],#aiGameSelect,#pageGameSelect'));}
  function syncUi(game){
    gameButtons().forEach(function(btn){
      var on=btn.getAttribute('data-game')===game;
      btn.classList.toggle('is-active',on);
      btn.setAttribute('aria-selected',on?'true':'false');
    });
    selectors().forEach(function(sel){if(sel.value!==game)sel.value=game;});
    d.querySelectorAll('[data-lucky-current-game]').forEach(function(node){node.textContent=LABELS[game]||game;});
  }
  function triggerGame(game){
    var btn=gameButtons().find(function(x){return x.getAttribute('data-game')===game;});
    if(btn){syncUi(game);btn.click();}
  }
  function install(){
    var fixed=(d.body&&d.body.getAttribute('data-lucky-fixed-game')||'').trim();
    var isFixed=!!ROUTES[fixed];
    var initial=isFixed?fixed:'dlt';
    try{
      var q=new URLSearchParams(w.location.search).get('game');
      if(!isFixed&&ROUTES[q])initial=q;
    }catch(_e){}

    gameButtons().forEach(function(btn){
      btn.addEventListener('click',function(e){
        var game=btn.getAttribute('data-game');
        if(isFixed&&e.isTrusted&&game!==fixed){
          e.preventDefault();
          e.stopImmediatePropagation();
          w.location.href=ROUTES[game];
          return;
        }
        syncUi(game);
      },true);
    });

    selectors().forEach(function(sel){
      sel.addEventListener('change',function(){
        var game=sel.value;
        if(!ROUTES[game])return;
        if(isFixed){w.location.href=ROUTES[game];return;}
        triggerGame(game);
      });
    });

    syncUi(initial);
    w.setTimeout(function(){triggerGame(initial);},0);
  }

  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',install,{once:true});else install();
})(document,window);
