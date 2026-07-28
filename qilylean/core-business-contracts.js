(function(){
  'use strict';

  if(window.__qilyCoreBusinessContractsReady)return;
  window.__qilyCoreBusinessContractsReady=true;

  var CONTRACTS={
    factory:{
      title:'新工厂规划设计项目技术服务合同范本',
      meta:'16页 A4｜高清图文原版｜仅限在线预览',
      pageCount:16,
      width:1414,
      height:2000,
      basePath:'/media/contracts/factory/page-'
    },
    lean:{
      title:'精益改善项目交付技术服务合同范本',
      meta:'17页 A4｜用户上传高清图文原版｜仅限在线预览',
      pageCount:17,
      width:1406,
      height:1988,
      basePath:'/media/contracts/lean/page-'
    },
    visual:{
      title:'5S与目视化管理咨询项目技术服务合同范本',
      meta:'12页 A4｜高清图文原版｜仅限在线预览',
      pageCount:12,
      width:1414,
      height:2000,
      basePath:'/media/contracts/visual/page-'
    }
  };

  var detailKey=document.body.getAttribute('data-core-contract-detail');
  if(!detailKey)return;

  var viewer=document.getElementById('coreContractViewer');
  var contract=CONTRACTS[detailKey];
  if(!viewer||!contract)return;

  var title=viewer.querySelector('[data-contract-viewer-title]');
  var meta=viewer.querySelector('[data-contract-viewer-meta]');
  var status=viewer.querySelector('[data-contract-viewer-status]');
  var frame=viewer.querySelector('[data-contract-pages],.core-contract-viewer-frame');
  var closeButton=viewer.querySelector('[data-contract-viewer-close]');
  var mounted=false;

  function pad(number){return String(number).padStart(2,'0');}

  function mountPages(){
    if(mounted)return;
    mounted=true;
    viewer.hidden=false;
    viewer.setAttribute('aria-busy','true');
    title.textContent=contract.title;
    meta.textContent=contract.meta;
    status.textContent='正在加载高清图文页面……';
    frame.innerHTML='';

    var fragment=document.createDocumentFragment();
    var loaded=0;
    var failed=0;

    for(var page=1;page<=contract.pageCount;page+=1){
      var figure=document.createElement('figure');
      figure.className='core-contract-page';
      figure.setAttribute('aria-label',contract.title+'第'+page+'页');

      var image=document.createElement('img');
      image.src=contract.basePath+pad(page)+'.webp?v=20260728-protected-contract-preview-v1';
      image.alt=contract.title+'第'+page+'页高清图文';
      image.width=contract.width;
      image.height=contract.height;
      image.loading=page<=2?'eager':'lazy';
      image.decoding='async';
      image.draggable=false;
      if(page===1)image.fetchPriority='high';
      image.addEventListener('load',function(){
        loaded+=1;
        if(loaded===1){
          status.textContent='高清图文已打开，可上下连续浏览全部页面；本页面不加载PDF文件。';
          viewer.setAttribute('aria-busy','false');
        }
      });
      image.addEventListener('error',function(){
        failed+=1;
        if(failed===1){
          status.textContent='部分高清页面暂未加载成功，请强制刷新后重试。';
          viewer.setAttribute('aria-busy','false');
        }
      });

      var caption=document.createElement('figcaption');
      caption.className='core-contract-page-number';
      caption.textContent='第 '+page+' / '+contract.pageCount+' 页';

      figure.appendChild(image);
      figure.appendChild(caption);
      fragment.appendChild(figure);
    }

    frame.appendChild(fragment);
  }

  if(closeButton)closeButton.addEventListener('click',function(){
    viewer.hidden=true;
    status.textContent='预览已收起；点击“查看合同范本”可重新展开。';
    window.scrollTo({top:0,behavior:'smooth'});
  });

  Array.prototype.slice.call(document.querySelectorAll('a[href="#coreContractViewer"]')).forEach(function(link){
    link.addEventListener('click',function(){
      viewer.hidden=false;
      mountPages();
    });
  });

  viewer.addEventListener('contextmenu',function(event){event.preventDefault();});
  viewer.addEventListener('dragstart',function(event){event.preventDefault();});
  viewer.addEventListener('selectstart',function(event){event.preventDefault();});
  document.addEventListener('keydown',function(event){
    if(viewer.hidden)return;
    if((event.ctrlKey||event.metaKey)&&(event.key.toLowerCase()==='s'||event.key.toLowerCase()==='p'))event.preventDefault();
    if(event.key==='Escape'&&closeButton)closeButton.click();
  });

  mountPages();
})();