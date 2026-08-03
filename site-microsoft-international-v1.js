/* QilyLean Microsoft-inspired international layout enhancer */
(function(d,w){
  'use strict';
  if(w.__qilyMicrosoftInternationalV1)return;
  w.__qilyMicrosoftInternationalV1=true;

  var CARD_SELECTOR=[
    '.module-card','.card','.project-card','.knowledge-card','.brief-card',
    '.tool-card','.evidence-card','.career-full-card','.work-card',
    '.service-card','.metric'
  ].join(',');
  var SECTION_SELECTOR=[
    'main>section','.module-section','.section','.daily-section',
    '.knowledge-section','.content-section'
  ].join(',');
  var pending=false;

  function isElement(node){return !!node&&node.nodeType===1;}

  function isDirectlyInteractive(el){
    if(!isElement(el))return false;
    if(el.matches('a[href],button,[role="link"],[data-href],[data-url]'))return true;
    if(el.hasAttribute('onclick'))return true;
    if(el.getAttribute('tabindex')==='0'&&el.getAttribute('role')==='link')return true;
    return false;
  }

  function classifyCards(root){
    var scope=isElement(root)?root:d;
    var cards=scope.matches&&scope.matches(CARD_SELECTOR)?[scope]:Array.prototype.slice.call(scope.querySelectorAll(CARD_SELECTOR));
    cards.forEach(function(card){
      card.classList.remove('qily-ms-static-card','qily-ms-interactive-card');
      card.classList.add(isDirectlyInteractive(card)?'qily-ms-interactive-card':'qily-ms-static-card');
    });

    var directLinks=scope.matches&&scope.matches('a[href]')?[scope]:Array.prototype.slice.call(scope.querySelectorAll('a[href]'));
    directLinks.forEach(function(link){
      if(link.matches('.module-actions a,.actions a,.module-subnav a,.subnav a,.site-nav a,.nav a,.qily-global-nav a'))return;
      if(link.matches('.capability-digital-visual>a,.gallery a,.media-grid a,.thumb-grid a'))link.classList.add('qily-ms-interactive-card');
    });
  }

  function markSections(root){
    var scope=isElement(root)?root:d;
    var sections=scope.matches&&scope.matches(SECTION_SELECTOR)?[scope]:Array.prototype.slice.call(scope.querySelectorAll(SECTION_SELECTOR));
    sections.forEach(function(section){section.classList.add('qily-ms-section');});
  }

  function normalizeToolLabels(){
    var heading=d.querySelector('#digital-tools .module-heading h2,#digital-tools .head h2');
    if(heading&&heading.textContent.trim()==='数字工具作品')heading.textContent='精益数字工具';
    d.querySelectorAll('a[href="#digital-tools"]').forEach(function(link){
      if(link.textContent.trim()==='数字工具作品')link.textContent='精益数字工具';
    });
  }

  function markTools(root){
    var scope=isElement(root)?root:d;
    var toolSections=[];
    if(scope.matches&&scope.matches('#digital-tools,.capability-digital-tools'))toolSections.push(scope);
    Array.prototype.push.apply(toolSections,scope.querySelectorAll('#digital-tools,.capability-digital-tools'));
    toolSections.forEach(function(node){
      var section=node.closest('section')||node;
      section.classList.add('qily-ms-product-showcase');
      node.querySelectorAll('.capability-digital-tool').forEach(function(tool,index){
        tool.classList.add('qily-ms-product-row');
        tool.setAttribute('data-qily-product-order',String(index+1));
      });
    });
    normalizeToolLabels();
  }

  function markHero(root){
    var scope=isElement(root)?root:d;
    var heroes=[];
    if(scope.matches&&scope.matches('.hero,.module-hero,.daily-hero'))heroes.push(scope);
    Array.prototype.push.apply(heroes,scope.querySelectorAll('.hero,.module-hero,.daily-hero'));
    heroes.forEach(function(hero){hero.classList.add('qily-ms-hero');});
  }

  function markPage(){
    d.documentElement.classList.add('qily-ms-international');
    if(d.body)d.body.classList.add('qily-ms-international');
  }

  function enhance(root){
    markPage();
    markSections(root||d);
    markTools(root||d);
    markHero(root||d);
    classifyCards(root||d);
  }

  function schedule(root){
    if(pending)return;
    pending=true;
    w.requestAnimationFrame(function(){pending=false;enhance(root||d);});
  }

  function boot(){
    enhance(d);
    var observer=new MutationObserver(function(records){
      var root=null;
      for(var i=0;i<records.length;i+=1){
        if(records[i].addedNodes&&records[i].addedNodes.length){
          for(var j=0;j<records[i].addedNodes.length;j+=1){
            if(isElement(records[i].addedNodes[j])){root=records[i].addedNodes[j];break;}
          }
        }
        if(root)break;
      }
      schedule(root||d);
    });
    observer.observe(d.body,{childList:true,subtree:true});
  }

  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})(document,window);
