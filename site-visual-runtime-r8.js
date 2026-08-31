/* QilyLean Visual Runtime R8.2 | 2026-08-31
 * Presentation-only runtime. One-time enhancement + measured header geometry.
 * No MutationObserver. No navigation/Dock label ownership. No business logic.
 * R8.2: keeps the single visual-authority stylesheet last in the cascade after legacy runtimes inject compatibility styles.
 */
(function(d,w){
  'use strict';
  if(w.__qilyVisualRuntimeR82)return;
  w.__qilyVisualRuntimeR82=true;
  w.__qilyVisualRuntimeR8=true;

  var root=d.documentElement;
  var raf=0;
  var authorityTimer=0;

  function px(value){var n=Math.ceil(Number(value)||0);return Math.max(0,n)+'px';}

  function visualAuthorityLink(){return d.getElementById('qilyVisualAuthorityR8');}

  function ensureAuthorityLast(){
    var head=d.head,link=visualAuthorityLink();
    if(!head||!link||link.parentNode!==head)return;
    if(head.lastElementChild!==link)head.appendChild(link);
    root.setAttribute('data-qily-r8-cascade','authority-last');
  }

  function scheduleAuthorityLast(){
    if(authorityTimer)w.clearTimeout(authorityTimer);
    authorityTimer=w.setTimeout(function(){authorityTimer=0;ensureAuthorityLast();},0);
  }

  function installCascadeAuthority(){
    ensureAuthorityLast();
    // Deferred legacy runtimes may inject presentation-only compatibility styles while the shell settles.
    // Re-assert the final authority at bounded checkpoints and shell/language events; no DOM observer is used.
    w.setTimeout(ensureAuthorityLast,120);
    w.setTimeout(ensureAuthorityLast,700);
    d.addEventListener('qily:shell-ready',scheduleAuthorityLast);
    d.addEventListener('qily:language-change',scheduleAuthorityLast);
    w.addEventListener('pageshow',scheduleAuthorityLast,{passive:true});
  }

  function headerNode(){
    return d.querySelector('header.qily-site-header,header.qily-global-header,header.topbar.qily-site-header,header.top.qily-site-header');
  }

  function measureHeader(){
    var header=headerNode();
    if(!header)return;
    var rect=header.getBoundingClientRect();
    var height=Math.max(rect.height,header.offsetHeight||0);
    if(height>0)root.style.setProperty('--qily-header-live-height',px(height));
    header.setAttribute('data-qily-r8-measured','true');
  }

  function scheduleMeasure(){
    if(raf)w.cancelAnimationFrame(raf);
    raf=w.requestAnimationFrame(function(){raf=0;measureHeader();});
  }

  function installHeaderMeasurement(){
    measureHeader();
    var header=headerNode();
    if(header&&'ResizeObserver' in w){
      var observer=new ResizeObserver(scheduleMeasure);
      observer.observe(header);
      w.__qilyVisualR8HeaderObserver=observer;
    }
    w.addEventListener('resize',scheduleMeasure,{passive:true});
    w.addEventListener('pageshow',scheduleMeasure,{passive:true});
    d.addEventListener('qily:language-change',scheduleMeasure);
  }

  function tableCellCount(table){
    var rows=Array.prototype.slice.call(table.rows||[]).slice(0,6);
    var max=0;
    rows.forEach(function(row){max=Math.max(max,(row.cells||[]).length);});
    return max;
  }

  function tableTextLength(table){return ((table.textContent||'').replace(/\s+/g,' ').trim()).length;}

  function isTableWrapped(table){
    return !!table.closest('.qily-table-scroll,.table-wrap,.table-scroll,.table-responsive,.data-table-wrap,.data-table-scroll,.matrix-wrap,.matrix-scroll,.comparison-wrap,.comparison-table-wrap,.opl-table-wrap');
  }

  function wrapTables(){
    d.querySelectorAll('main table').forEach(function(table){
      var dense=tableCellCount(table)>=4||tableTextLength(table)>900;
      table.setAttribute('data-qily-dense-table',dense?'true':'false');
      if(isTableWrapped(table))return;
      var parent=table.parentNode;
      if(!parent)return;
      var wrap=d.createElement('div');
      wrap.className='qily-table-scroll';
      wrap.setAttribute('data-qily-r8-table-wrap','true');
      wrap.setAttribute('role','region');
      wrap.setAttribute('aria-label',table.getAttribute('aria-label')||table.querySelector('caption')&&table.querySelector('caption').textContent.trim()||'数据表横向浏览区');
      parent.insertBefore(wrap,table);
      wrap.appendChild(table);
    });
  }

  function annotateCardGrids(){
    var selector=[
      '.module-grid','.paper-grid','.project-grid','.project-list-grid','.career-full-grid','.service-grid',
      '.resource-grid','.knowledge-grid','.trust-grid','.qily-ia-grid','.qily-six-grid','.qily-proof-strip',
      '.qily-principle-grid','.qily-secondary-links'
    ].join(',');
    d.querySelectorAll('main '+selector.replace(/,/g,',main ')).forEach(function(grid){
      var children=Array.prototype.filter.call(grid.children,function(node){
        if(node.nodeType!==1)return false;
        var style=w.getComputedStyle(node);
        return style.display!=='none'&&style.visibility!=='hidden';
      });
      if(children.length>=3&&children.length<=6)grid.setAttribute('data-qily-card-count',String(children.length));
    });
  }

  function annotateFrames(){
    d.querySelectorAll('main figure,main .flow,main .workflow,main .process-flow,main .diagram,main .visual-frame').forEach(function(node){
      if(node.classList.contains('qily-flow-frame')||node.classList.contains('qily-diagram-frame'))return;
      var hasSvg=!!node.querySelector('svg');
      var hasFlow=node.matches('.flow,.workflow,.process-flow')||!!node.querySelector('[marker-end],[data-qily-unified-arrow],.flow-step,.process-step,.workflow-step');
      if(hasFlow)node.classList.add('qily-flow-frame');
      else if(hasSvg)node.classList.add('qily-diagram-frame');
    });
  }

  function auditOverflow(){
    var docWidth=d.documentElement.clientWidth||w.innerWidth;
    var offenders=[];
    d.querySelectorAll('main > *,main section > *,header.qily-site-header > *,header.qily-global-header > *').forEach(function(node){
      if(!(node instanceof Element))return;
      if(node.closest('.qily-table-scroll,.table-wrap,.table-scroll,.qily-primary-nav-scroll-rail,nav.site-nav,nav.qily-global-nav'))return;
      var style=w.getComputedStyle(node);
      if(style.position==='fixed'||style.display==='none'||style.visibility==='hidden')return;
      var rect=node.getBoundingClientRect();
      if(rect.width>docWidth+4||rect.right>docWidth+8||rect.left<-8)offenders.push(node);
    });
    root.setAttribute('data-qily-r8-overflow',offenders.length?'detected':'clear');
    if(offenders.length&&w.console&&console.warn)console.warn('[QilyLean R8] viewport overflow candidates:',offenders.slice(0,12));
  }

  function init(){
    wrapTables();
    annotateCardGrids();
    annotateFrames();
    installHeaderMeasurement();
    installCascadeAuthority();
    w.requestAnimationFrame(auditOverflow);
    w.setTimeout(auditOverflow,450);
  }

  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',init,{once:true});else init();
})(document,window);
