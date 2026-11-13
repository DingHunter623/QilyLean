(function(d,w){"use strict";var root=d.getElementById("qilyHometownManufacturingPaper")||d.getElementById("qilyHometownManufacturingKnowledge");if(!root)return;
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
    root.querySelectorAll('table').forEach(function(table){
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
    root.querySelectorAll(selector).forEach(function(grid){
      var children=Array.prototype.filter.call(grid.children,function(node){
        if(node.nodeType!==1)return false;
        var style=w.getComputedStyle(node);
        return style.display!=='none'&&style.visibility!=='hidden';
      });
      if(children.length>=2&&children.length<=6)grid.setAttribute('data-qily-card-count',String(children.length));
    });
  }

function annotateFrames(){
    root.querySelectorAll('figure,.flow,.workflow,.process-flow,.diagram,.visual-frame').forEach(function(node){
      if(node.classList.contains('qily-flow-frame')||node.classList.contains('qily-diagram-frame'))return;
      var hasSvg=!!node.querySelector('svg');
      var hasFlow=node.matches('.flow,.workflow,.process-flow')||!!node.querySelector('[marker-end],[data-qily-unified-arrow],.flow-step,.process-step,.workflow-step');
      if(hasFlow)node.classList.add('qily-flow-frame');
      else if(hasSvg)node.classList.add('qily-diagram-frame');
    });
  }

wrapTables();annotateCardGrids();annotateFrames();
root.querySelectorAll("a[href]").forEach(function(a){if(a.getAttribute("href").charAt(0)!=="#"){a.classList.add("qily-route-action");a.setAttribute("data-qily-interaction","route");}});
})(document,window);
