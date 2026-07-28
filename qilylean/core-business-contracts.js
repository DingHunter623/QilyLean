(function(){
  'use strict';

  if(window.__qilyCoreBusinessContractsReady)return;
  window.__qilyCoreBusinessContractsReady=true;

  var CONTRACTS={
    factory:{
      title:'新工厂规划设计项目技术服务合同范本',
      meta:'15页 A4｜高清PDF原版｜在线预览',
      shortMeta:'15页高清PDF原版',
      pageUrl:'/cooperation/factory-planning/',
      url:'/qilylean/private/factory-planning-contract.pdf.b64?v=20260728-core-business-pages-v2'
    },
    lean:{
      title:'精益改善项目交付技术服务合同范本',
      meta:'17页 A4｜用户上传高清PDF原版｜在线预览',
      shortMeta:'17页高清PDF原版',
      pageUrl:'/cooperation/lean-improvement/',
      url:'/qilylean/private/lean-improvement-delivery-contract.pdf.b64?v=20260728-user-pdf-v2'
    },
    visual:{
      title:'5S与目视化管理咨询项目技术服务合同范本',
      meta:'12页 A4｜高清PDF原版｜在线预览',
      shortMeta:'12页高清PDF原版',
      pageUrl:'/cooperation/visual-management/',
      url:'/qilylean/private/5s-visual-contract.pdf.b64?v=20260728-core-business-pages-v2'
    }
  };

  var detailKey=document.body.getAttribute('data-core-contract-detail');
  var buttons=Array.prototype.slice.call(document.querySelectorAll('[data-contract-preview]'));

  buttons.forEach(function(button){
    var key=button.getAttribute('data-contract-preview');
    var contract=CONTRACTS[key];
    if(!contract)return;
    var card=button.closest('.service-contract');
    var meta=card&&card.querySelector('.service-contract-meta span');
    if(meta)meta.textContent=contract.shortMeta;
    button.textContent='查看独立业务页与合同范本';
    button.addEventListener('click',function(){window.location.href=contract.pageUrl;});
  });

  if(!detailKey)return;
  var viewer=document.getElementById('coreContractViewer');
  var contract=CONTRACTS[detailKey];
  if(!viewer||!contract)return;

  var title=viewer.querySelector('[data-contract-viewer-title]');
  var meta=viewer.querySelector('[data-contract-viewer-meta]');
  var status=viewer.querySelector('[data-contract-viewer-status]');
  var frame=viewer.querySelector('iframe');
  var closeButton=viewer.querySelector('[data-contract-viewer-close]');
  var blobUrl='';

  function decodeBase64Pdf(encoded){
    var clean=encoded.replace(/\s/g,'');
    var binary=atob(clean);
    var bytes=new Uint8Array(binary.length);
    for(var index=0;index<binary.length;index+=1)bytes[index]=binary.charCodeAt(index);
    return new Blob([bytes],{type:'application/pdf'});
  }

  function openContract(){
    viewer.hidden=false;
    viewer.setAttribute('aria-busy','true');
    title.textContent=contract.title;
    meta.textContent=contract.meta;
    status.textContent='正在加载高清合同原版……';
    fetch(contract.url,{credentials:'same-origin',cache:'force-cache'})
      .then(function(response){if(!response.ok)throw new Error('contract_'+response.status);return response.text();})
      .then(function(encoded){
        if(blobUrl)URL.revokeObjectURL(blobUrl);
        blobUrl=URL.createObjectURL(decodeBase64Pdf(encoded));
        frame.src=blobUrl+'#view=FitH&toolbar=0&navpanes=0&pagemode=none';
        status.textContent='高清合同原版已打开，可上下连续浏览全部页面。';
        viewer.setAttribute('aria-busy','false');
      })
      .catch(function(){
        status.textContent='合同原版暂未加载成功，请刷新页面后重试。';
        viewer.setAttribute('aria-busy','false');
      });
  }

  if(closeButton)closeButton.addEventListener('click',function(){
    viewer.hidden=true;
    frame.removeAttribute('src');
    status.textContent='';
    window.scrollTo({top:0,behavior:'smooth'});
  });
  Array.prototype.slice.call(document.querySelectorAll('a[href="#coreContractViewer"]')).forEach(function(link){
    link.addEventListener('click',function(){
      if(!viewer.hidden)return;
      viewer.hidden=false;
      if(blobUrl){
        frame.src=blobUrl+'#view=FitH&toolbar=0&navpanes=0&pagemode=none';
        status.textContent='高清合同原版已打开，可上下连续浏览全部页面。';
      }else{
        openContract();
      }
    });
  });
  viewer.addEventListener('contextmenu',function(event){event.preventDefault();});
  document.addEventListener('keydown',function(event){
    if(viewer.hidden)return;
    if((event.ctrlKey||event.metaKey)&&(event.key.toLowerCase()==='s'||event.key.toLowerCase()==='p'))event.preventDefault();
    if(event.key==='Escape'&&closeButton)closeButton.click();
  });
  window.addEventListener('beforeunload',function(){if(blobUrl)URL.revokeObjectURL(blobUrl);},{once:true});
  openContract();
})();
