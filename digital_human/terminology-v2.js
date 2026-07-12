(function(){
  'use strict';
  const RULES=[
    [/当前保留7条微博精选入口；后续新增内容继续按主题、适用场景、核心观点、可落地动作和原文链接沉淀。/g,'围绕精益理念、IE方法、质量工具与现场改善持续沉淀实用内容，便于专业交流、学习参考与方法复用。'],
    [/以下内容先按知识主题整理为网页化条目，微博原文保留为外部来源入口；后续如补充正文截图或原文，可继续加深为完整文章。/g,'围绕制造改善主题持续整理，便于学习、交流与实践参考。'],
    [/围绕精益生产、目视化管理、IE方法与数智化工厂持续更新，沉淀适合学习、交流与朋友圈分享的专业内容。/g,'持续分享制造改善实践、精益方法与数智化工厂思考。'],
    [/丁启利\s*AI\s*数字人/g,'丁启利 AI制造助手'],
    [/AI\s*数字人/g,'AI制造助手'],
    [/数字人/g,'AI制造助手'],
    [/制造改善实践论文合集/g,'制造改善知识合集'],
    [/制造改善实践论文/g,'制造改善知识文章'],
    [/实践论文合集/g,'知识合集'],
    [/代表论文/g,'代表文章'],
    [/方法论文/g,'方法文章'],
    [/论文附件/g,'配套资料'],
    [/论文下载/g,'资料下载'],
    [/论文目录/g,'知识目录'],
    [/论文首页/g,'知识首页'],
    [/论文库/g,'知识库'],
    [/论文/g,'知识文章'],
    [/阅读全文/g,'查看内容'],
    [/返回问答/g,'返回交流'],
    [/与丁启利对话/g,'与丁启利交流'],
    [/面试深度沟通/g,'项目交流'],
    [/面试沟通/g,'专业交流'],
    [/面试/g,'专业交流'],
    [/求职定位/g,'能力适配场景'],
    [/求职/g,'能力交流'],
    [/个人简历/g,'专业履历'],
    [/简历/g,'履历'],
    [/作者：丁启利/g,'分享人：丁启利'],
    [/作者/g,'分享人'],
    [/我的经验/g,'实践经验'],
    [/我的方法/g,'实践方法'],
    [/我的案例/g,'实践案例'],
    [/ChatGPT/g,'AI工具']
  ];
  function replaceText(value){
    let out=String(value||'');
    for(const [pattern,replacement] of RULES)out=out.replace(pattern,replacement);
    return out;
  }
  function cleanTextNodes(root){
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(node){
      const p=node.parentElement;
      if(!p||p.closest('script,style,noscript,code,pre'))return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }});
    const nodes=[];
    while(walker.nextNode())nodes.push(walker.currentNode);
    for(const node of nodes){const next=replaceText(node.nodeValue);if(next!==node.nodeValue)node.nodeValue=next;}
  }
  function cleanAttributes(root){
    const selectors=['[title]','[aria-label]','[alt]','meta[name="description"]','meta[property="og:title"]','meta[property="og:description"]'];
    root.querySelectorAll(selectors.join(',')).forEach(el=>{
      for(const attr of ['title','aria-label','alt','content']){
        if(el.hasAttribute&&el.hasAttribute(attr)){
          const old=el.getAttribute(attr),next=replaceText(old);
          if(next!==old)el.setAttribute(attr,next);
        }
      }
    });
  }
  function apply(root=document){
    if(root===document){document.title=replaceText(document.title);cleanTextNodes(document.body);cleanAttributes(document);}else if(root.nodeType===1){cleanTextNodes(root);cleanAttributes(root);}
  }
  function boot(){
    apply();
    let queued=false;
    const observer=new MutationObserver(records=>{
      if(queued)return;queued=true;
      requestAnimationFrame(()=>{
        queued=false;
        for(const record of records){
          record.addedNodes.forEach(node=>{if(node.nodeType===1)apply(node);else if(node.nodeType===3&&node.parentElement&&!node.parentElement.closest('script,style,noscript,code,pre')){const next=replaceText(node.nodeValue);if(next!==node.nodeValue)node.nodeValue=next;}});
        }
      });
    });
    observer.observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();