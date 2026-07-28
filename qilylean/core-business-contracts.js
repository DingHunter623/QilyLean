(function(){
  'use strict';

  if(window.__qilyCoreBusinessContractsReady)return;
  window.__qilyCoreBusinessContractsReady=true;

  var CONTRACTS={
    factory:{
      title:'新工厂规划设计项目技术服务合同范本',
      meta:'15页 A4｜高清PDF原版｜在线预览',
      url:'/qilylean/private/factory-planning-contract.pdf.b64?v=20260728-core-contracts-v1'
    },
    lean:{
      title:'精益改善项目交付技术服务合同范本',
      meta:'15页 A4｜高清PDF原版｜在线预览',
      url:'/qilylean/private/lean-improvement-delivery-contract.pdf.b64?v=20260728-core-contracts-v1'
    },
    visual:{
      title:'5S与目视化管理咨询项目技术服务合同范本',
      meta:'12页 A4｜高清PDF原版｜在线预览',
      url:'/qilylean/private/5s-visual-contract.pdf.b64?v=20260728-core-contracts-v1'
    }
  };

  var viewer=document.getElementById('coreContractViewer');
  if(!viewer)return;
  var title=viewer.querySelector('[data-contract-viewer-title]');
  var meta=viewer.querySelector('[data-contract-viewer-meta]');
  var status=viewer.querySelector('[data-contract-viewer-status]');
  var frame=viewer.querySelector('iframe');
  var closeButton=viewer.querySelector('[data-contract-viewer-close]');
  var buttons=Array.prototype.slice.call(document.querySelectorAll('[data-contract-preview]'));
  var blobUrls={};
  var loading={};

  function decodeBase64Pdf(encoded){
    var clean=encoded.replace(/\s/g,'');
    var binary=atob(clean);
    var bytes=new Uint8Array(binary.length);
    for(var index=0;index<binary.length;index+=1)bytes[index]=binary.charCodeAt(index);
    return new Blob([bytes],{type:'application/pdf'});
  }

  function setBusy(key,busy){
    buttons.forEach(function(button){
      if(button.getAttribute('data-contract-preview')===key){
        button.disabled=busy;
        button.textContent=busy?'正在加载高清原版…':button.getAttribute('data-default-label');
      }
    });
  }

  function getPdfUrl(key){
    if(blobUrls[key])return Promise.resolve(blobUrls[key]);
    if(loading[key])return loading[key];
    var contract=CONTRACTS[key];
    if(!contract)return Promise.reject(new Error('unknown_contract'));
    setBusy(key,true);
    loading[key]=fetch(contract.url,{credentials:'same-origin',cache:'force-cache'})
      .then(function(response){if(!response.ok)throw new Error('contract_'+response.status);return response.text();})
      .then(function(encoded){
        var url=URL.createObjectURL(decodeBase64Pdf(encoded));
        blobUrls[key]=url;
        return url;
      })
      .finally(function(){setBusy(key,false);loading[key]=null;});
    return loading[key];
  }

  function openContract(key){
    var contract=CONTRACTS[key];
    if(!contract)return;
    viewer.hidden=false;
    viewer.setAttribute('aria-busy','true');
    title.textContent=contract.title;
    meta.textContent=contract.meta;
    status.textContent='正在加载高清合同原版……';
    frame.removeAttribute('src');
    getPdfUrl(key).then(function(url){
      frame.src=url+'#view=FitH&toolbar=0&navpanes=0&pagemode=none';
      status.textContent='高清合同原版已打开，可上下连续浏览全部页面。';
      viewer.setAttribute('aria-busy','false');
      viewer.scrollIntoView({behavior:'smooth',block:'start'});
    }).catch(function(){
      status.textContent='合同原版暂未加载成功，请刷新页面后重试。';
      viewer.setAttribute('aria-busy','false');
    });
  }

  buttons.forEach(function(button){
    button.setAttribute('data-default-label',button.textContent.trim());
    button.addEventListener('click',function(){openContract(button.getAttribute('data-contract-preview'));});
  });

  closeButton.addEventListener('click',function(){
    viewer.hidden=true;
    frame.removeAttribute('src');
    status.textContent='';
  });
  viewer.addEventListener('contextmenu',function(event){event.preventDefault();});
  document.addEventListener('keydown',function(event){
    if(viewer.hidden)return;
    if((event.ctrlKey||event.metaKey)&&(event.key.toLowerCase()==='s'||event.key.toLowerCase()==='p'))event.preventDefault();
    if(event.key==='Escape')closeButton.click();
  });
  window.addEventListener('beforeunload',function(){
    Object.keys(blobUrls).forEach(function(key){URL.revokeObjectURL(blobUrls[key]);});
  },{once:true});
})();