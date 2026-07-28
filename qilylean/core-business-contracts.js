(function(){
  'use strict';

  if(window.__qilyCoreBusinessContractsReady)return;
  window.__qilyCoreBusinessContractsReady=true;

  var CONTRACTS={
    factory:{
      title:'新工厂规划设计项目技术服务合同范本',
      meta:'16页 A4｜高清图文原版｜仅限在线预览',
      pageCount:16,
      url:'/qilylean/private/factory-planning-contract.pdf.b64?v=20260728-canvas-preview-v1'
    },
    lean:{
      title:'精益改善项目交付技术服务合同范本',
      meta:'17页 A4｜用户上传高清图文原版｜仅限在线预览',
      pageCount:17,
      url:'/qilylean/private/lean-improvement-delivery-contract.pdf.b64?v=20260728-canvas-preview-v1'
    },
    visual:{
      title:'5S与目视化管理咨询项目技术服务合同范本',
      meta:'12页 A4｜高清图文原版｜仅限在线预览',
      pageCount:12,
      url:'/qilylean/private/5s-visual-contract.pdf.b64?v=20260728-canvas-preview-v1'
    }
  };

  var PDF_JS_SOURCES=[
    'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js',
    'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.min.js'
  ];

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
  var loadingPromise=null;

  function loadPdfJs(){
    if(window.pdfjsLib)return Promise.resolve(window.pdfjsLib);
    return new Promise(function(resolve,reject){
      var index=0;
      function tryNext(){
        if(index>=PDF_JS_SOURCES.length){reject(new Error('pdfjs_unavailable'));return;}
        var script=document.createElement('script');
        script.src=PDF_JS_SOURCES[index++];
        script.async=true;
        script.referrerPolicy='no-referrer';
        script.onload=function(){
          if(window.pdfjsLib){resolve(window.pdfjsLib);return;}
          script.remove();
          tryNext();
        };
        script.onerror=function(){script.remove();tryNext();};
        document.head.appendChild(script);
      }
      tryNext();
    });
  }

  function decodeBase64(encoded){
    var clean=encoded.replace(/\s/g,'');
    var binary=atob(clean);
    var bytes=new Uint8Array(binary.length);
    for(var index=0;index<binary.length;index+=1)bytes[index]=binary.charCodeAt(index);
    return bytes;
  }

  function loadDocument(){
    if(loadingPromise)return loadingPromise;
    status.textContent='正在建立受保护的高清在线预览……';
    viewer.setAttribute('aria-busy','true');
    loadingPromise=Promise.all([
      loadPdfJs(),
      fetch(contract.url,{credentials:'same-origin',cache:'force-cache'}).then(function(response){
        if(!response.ok)throw new Error('contract_'+response.status);
        return response.text();
      })
    ]).then(function(results){
      var pdfjs=results[0];
      var bytes=decodeBase64(results[1]);
      return pdfjs.getDocument({data:bytes,disableWorker:true,disableFontFace:false,useSystemFonts:true}).promise;
    });
    return loadingPromise;
  }

  function renderPage(pdf,pageNumber,figure){
    if(figure.dataset.rendered==='1'||figure.dataset.rendering==='1')return;
    figure.dataset.rendering='1';
    pdf.getPage(pageNumber).then(function(page){
      var baseViewport=page.getViewport({scale:1});
      var cssWidth=Math.max(320,Math.min(1414,frame.clientWidth-20));
      var pixelRatio=Math.min(window.devicePixelRatio||1,2);
      var targetWidth=Math.min(1600,Math.max(900,cssWidth*pixelRatio));
      var viewport=page.getViewport({scale:targetWidth/baseViewport.width});
      var canvas=figure.querySelector('canvas');
      var context=canvas.getContext('2d',{alpha:false});
      canvas.width=Math.floor(viewport.width);
      canvas.height=Math.floor(viewport.height);
      canvas.style.aspectRatio=viewport.width+' / '+viewport.height;
      return page.render({canvasContext:context,viewport:viewport,background:'rgb(255,255,255)'}).promise;
    }).then(function(){
      figure.dataset.rendered='1';
      figure.dataset.rendering='0';
      figure.classList.add('is-rendered');
      if(pageNumber===1){
        status.textContent='高清合同图文已打开，可上下连续浏览全部页面；微信端不会载入或跳转PDF文件。';
        viewer.setAttribute('aria-busy','false');
      }
    }).catch(function(){
      figure.dataset.rendering='0';
      figure.classList.add('has-error');
      status.textContent='部分页面渲染失败，请刷新页面后重试。';
      viewer.setAttribute('aria-busy','false');
    });
  }

  function buildPages(pdf){
    frame.innerHTML='';
    var fragment=document.createDocumentFragment();
    var observer=null;

    if('IntersectionObserver' in window){
      observer=new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(!entry.isIntersecting)return;
          var figure=entry.target;
          renderPage(pdf,Number(figure.dataset.page),figure);
          observer.unobserve(figure);
        });
      },{rootMargin:'900px 0px'});
    }

    for(var pageNumber=1;pageNumber<=pdf.numPages;pageNumber+=1){
      var figure=document.createElement('figure');
      figure.className='core-contract-page';
      figure.dataset.page=String(pageNumber);
      figure.setAttribute('aria-label',contract.title+'第'+pageNumber+'页');

      var canvas=document.createElement('canvas');
      canvas.setAttribute('role','img');
      canvas.setAttribute('aria-label',contract.title+'第'+pageNumber+'页高清图文');

      var placeholder=document.createElement('div');
      placeholder.className='core-contract-page-placeholder';
      placeholder.textContent='正在准备第 '+pageNumber+' 页高清图文……';

      var caption=document.createElement('figcaption');
      caption.className='core-contract-page-number';
      caption.textContent='第 '+pageNumber+' / '+pdf.numPages+' 页';

      figure.appendChild(canvas);
      figure.appendChild(placeholder);
      figure.appendChild(caption);
      fragment.appendChild(figure);

      if(observer)observer.observe(figure);
    }

    frame.appendChild(fragment);
    if(!observer){
      Array.prototype.slice.call(frame.querySelectorAll('.core-contract-page')).forEach(function(figure){
        renderPage(pdf,Number(figure.dataset.page),figure);
      });
    }else{
      var first=frame.querySelector('.core-contract-page');
      if(first)renderPage(pdf,1,first);
    }
  }

  function mountPages(){
    if(mounted)return;
    mounted=true;
    viewer.hidden=false;
    title.textContent=contract.title;
    meta.textContent=contract.meta;
    loadDocument().then(function(pdf){
      buildPages(pdf);
    }).catch(function(){
      status.textContent='高清在线预览暂未建立成功，请检查网络后强制刷新。';
      viewer.setAttribute('aria-busy','false');
    });
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