(function(){
'use strict';
var root=document.querySelector('[data-brief-feedback]');
if(!root)return;

var api='https://qilylean-ai.dinghunter623.workers.dev';
var date=root.getAttribute('data-brief-date')||'';
var title=root.getAttribute('data-brief-title')||'';
var pageUrl=root.getAttribute('data-brief-url')||location.href;
var status=root.querySelector('[data-brief-feedback-status]');
var messageForm=root.querySelector('[data-brief-message-form]');

function setStatus(text,type){
  if(!status)return;
  status.textContent=text;
  status.className='brief-feedback-status'+(type?' '+type:'');
}

async function sendMessageFallback(data,id){
  var mail=new FormData();
  mail.append('_subject','【QilyLean今日简报留言】'+data.company+'｜'+date);
  mail.append('_template','table');
  mail.append('_captcha','false');
  mail.append('留言编号',id||'后台处理中');
  mail.append('留言人称谓',data.company);
  mail.append('联系方式',data.contact);
  mail.append('来源简报',date+'｜'+title);
  mail.append('留言内容',data.message);
  mail.append('来源页面',pageUrl);
  var response=await fetch('https://formsubmit.co/ajax/admin@qilylean.com',{method:'POST',headers:{Accept:'application/json'},body:mail});
  if(!response.ok)throw new Error('email_'+response.status);
  return true;
}

if(messageForm)messageForm.addEventListener('submit',async function(event){
  event.preventDefault();
  if(!messageForm.reportValidity())return;
  var formData=new FormData(messageForm);
  var website=String(formData.get('website')||'').trim();
  if(website){setStatus('留言已提交。','success');return;}
  var message=String(formData.get('message')||'').trim();
  var name=String(formData.get('name')||'').trim()||'匿名读者';
  var contact=String(formData.get('contact')||'').trim()||'未留下联系方式';
  var button=messageForm.querySelector('button[type="submit"]');
  var data={
    company:name,
    industry:'今日简报留言交流',
    location:'未提供',
    scale:'',
    problem:'来源简报：'+date+'｜'+title+'\n留言内容：'+message,
    target:'',
    timing:'今日简报留言｜'+date,
    contact:contact,
    website:website,
    source_page:pageUrl,
    source_brief:date+'｜'+title,
    message:message
  };
  button.disabled=true;
  button.textContent='正在提交…';
  setStatus('正在提交留言…','');
  var emailSent=false;
  var id='';
  try{
    var response=await fetch(api+'/consultations',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
    var result=await response.json().catch(function(){return{};});
    if(!response.ok)throw new Error(result.error||'message_'+response.status);
    id=result.id||'';
    emailSent=Boolean(result.email_sent);
    if(!emailSent){
      try{emailSent=await sendMessageFallback(data,id);}
      catch(emailError){console.warn('Brief message email fallback unavailable',emailError);}
    }
    messageForm.reset();
    setStatus(emailSent?'留言已提交，并已发送邮件通知。':'留言已提交；邮件通知暂未确认。','success');
  }catch(error){
    try{emailSent=await sendMessageFallback(data,id);}
    catch(emailError){console.warn('Brief message email unavailable',emailError);}
    setStatus(emailSent?'后台暂时繁忙，但留言已发送至接收邮箱。':'留言暂未提交成功，请稍后重试。','error');
  }finally{
    button.disabled=false;
    button.textContent='提交留言';
  }
});

/* QILY-KNOWLEDGE-ASSET-2.0
 * 目的：不改变历史精选简报模板，在既有页面上补足“工具应用场景→案例→指标→关联知识”的工程闭环。
 * 原则：可视化遵循QilyLean VI；案例统一标注为教学推演，避免与职业项目／客户项目证据混淆。
 */
var VERSION='20260828-knowledge-asset-2-0-v1';
var article=document.querySelector('article.post');
if(!article||article.getAttribute('data-qily-knowledge-asset')===VERSION)return;
article.setAttribute('data-qily-knowledge-asset',VERSION);

function clean(value){return String(value||'').replace(/\s+/g,' ').trim();}
function upper(value){return clean(value).toUpperCase();}

var TOOL_CASES=[
  {keys:['VSM','价值流'],code:'VSM',caseText:'某装配流程实际增值加工约35分钟，但从领料到完工的LT达到2.4天。团队用VSM把WIP、等待和信息触发点拉到同一张图，先在一个产品族Pilot压缩两处批量等待，再用同口径LT与WIP确认效果。',metrics:['LT','WIP','PCE']},
  {keys:['ECRS'],code:'ECRS',caseText:'某人工装配工位存在重复取放、转身和二次确认。动作分解后先取消无必要检查、合并取放、重排物料位置，CT由38秒降至32秒；连续多班复测确认后再更新标准作业。',metrics:['CT','动作数','线平衡']},
  {keys:['SMED','快速换模','快速换型'],code:'SMED',caseText:'某设备换型原需90分钟。团队录像拆解后把备料、治具预调和参数准备转为外部作业，并对内部作业并行化，Pilot换型降至55分钟；同时核对首件合格与安全条件，避免只追时间。',metrics:['C/O','FPY','停机时间']},
  {keys:['OEE'],code:'OEE',caseText:'某自动化线可动率88%、性能效率92%、质量率98%，OEE约79.3%。团队没有笼统要求“提升OEE”，而是先用停机柏拉图锁定换型和短停，再分别验证可动率及节拍损失。',metrics:['Availability','Performance','Quality']},
  {keys:['标准工时','STANDARD TIME'],code:'Standard Time',caseText:'某产品排产长期依赖经验产能。IE按稳定作业循环测时、剔除异常、确认评比与宽放口径后建立标准工时，并用现场实绩交叉验证，再同步用于人力配置、排产与成本核算。',metrics:['标准工时','UPPH','产能']},
  {keys:['线平衡','LINE BALANCE','UPPH'],code:'UPPH',caseText:'某线客户TT为36秒，瓶颈工位CT为42秒，其他工位大量等待。团队用工序负荷图重新组合动作并移动可转移作业，Pilot后瓶颈CT降至约34.5秒，再用UPPH和在制变化验证整线收益。',metrics:['TT','CT','UPPH']},
  {keys:['PDCA'],code:'PDCA',caseText:'某工序不良率连续三周约3.2%。团队先锁定缺陷层别和基线，在P阶段验证主因，D阶段只在一条线试行参数与防错措施，C阶段连续多班复测至约1.4%，A阶段再更新控制文件并横向展开。',metrics:['不良率','FPY','关闭率']},
  {keys:['5WHY','5 WHY','五问'],code:'5Why',caseText:'某端子压接不良反复发生，现场最初归因“员工操作”。逐层追问并核对点检记录后发现压接高度漂移来自量具校验与参数确认缺口，措施因此从人员提醒转为校验、参数锁定与首件确认。',metrics:['缺陷率','参数漂移','再发率']},
  {keys:['PFMEA','FMEA'],code:'PFMEA',caseText:'某新产品试产出现连接器错插风险。团队把失效模式、后果、原因与现有预防/探测控制逐项核对，按适用FMEA规则确定优先级，新增结构防错与验证证据后再重新评价风险。',metrics:['AP/RPN','控制有效性','再评价']},
  {keys:['KANBAN','看板'],code:'Kanban',caseText:'某线边物料以“大批量补满”为习惯，WIP与缺料同时存在。团队按消耗速度、补货周期和容器容量设定看板数量，在单一区域试运行后以缺料次数、WIP与补货响应验证参数。',metrics:['WIP','缺料次数','补货周期']},
  {keys:['POKA-YOKE','POKAYOKE','防错'],code:'Poka-Yoke',caseText:'某相似连接器偶发错插，单纯培训仍有再发。团队在治具与接口上增加方向/型号互锁，并把防错有效性纳入开线点检；连续生产验证无误装后再固化到PFMEA与Control Plan。',metrics:['错装率','FPY','再发率']},
  {keys:['GANTT','甘特'],code:'Gantt',caseText:'某自动化项目任务很多但节点失控。团队把“跟进设备”拆成设计冻结、FAT、到厂、SAT、Pilot、验收等里程碑，为每个节点绑定责任人、前置条件和证据，周会只处理偏差和风险。',metrics:['里程碑达成率','延期天数','关闭率']},
  {keys:['RACI'],code:'RACI',caseText:'某跨部门试运行项目曾出现“大家都参与、没人最终拍板”。重新按交付包设置唯一A、明确R/C/I，并把安全、节拍、质量、文件等放行证据绑定到里程碑后，异常升级和验收责任变得可追溯。',metrics:['里程碑','责任闭环','验收证据']},
  {keys:['PILOT','试点','试运行'],code:'Pilot',caseText:'某线体改善方案先在一个班次、一个产品族运行，预设CT、FPY、WIP和安全红线；连续达到目标且无副作用后才扩大范围，未达标则回退并修正方案，避免一次性全线铺开。',metrics:['CT','FPY','WIP']}
];

function findToolCase(text){
  var value=upper(text);
  for(var i=0;i<TOOL_CASES.length;i++){
    for(var j=0;j<TOOL_CASES[i].keys.length;j++){
      if(value.indexOf(upper(TOOL_CASES[i].keys[j]))>=0)return TOOL_CASES[i];
    }
  }
  return null;
}

function hasCaseNearby(card){
  if(card.querySelector('.case,.qily-application-case,[class*="case"]'))return true;
  var text=clean(card.textContent);
  return /案例|case/i.test(text);
}

function ensureStyles(){
  if(document.getElementById('qilyKnowledgeAssetV2Styles'))return;
  var style=document.createElement('style');
  style.id='qilyKnowledgeAssetV2Styles';
  style.textContent=[
    '.qily-application-case{margin-top:14px;padding:14px 15px;border:1px solid #cfe1dc;border-left:5px solid #0f6f73;border-radius:0 14px 14px 0;background:linear-gradient(135deg,#f7fbfa,#eef7f4);color:#315451;line-height:1.65}',
    '.qily-application-case strong{display:block;margin-bottom:5px;color:#0f4b5a!important;font-size:15px}',
    '.qily-application-case p{margin:0!important;color:#3a5756!important;font-size:14px;line-height:1.7}',
    '.qily-case-metrics{display:flex;flex-wrap:wrap;gap:6px;margin-top:9px}',
    '.qily-case-metrics span{padding:4px 8px;border:1px solid #c7ddd7;border-radius:999px;background:#fff;color:#41655f!important;font-size:12px;font-weight:800}',
    '.qily-knowledge-chain{margin:30px 0 22px;padding:22px;border:1px solid #c9ded9;border-radius:20px;background:linear-gradient(180deg,#fff,#f3f9f7);box-shadow:0 8px 24px rgba(15,75,90,.06)}',
    '.qily-knowledge-chain h3{margin:0 0 7px;color:#0f4b5a!important;font-size:22px}',
    '.qily-knowledge-chain>p{margin:0 0 15px;color:#55706d!important;line-height:1.7}',
    '.qily-knowledge-chain-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}',
    '.qily-knowledge-chain a{display:block;padding:13px 14px;border:1px solid #d3e4df;border-radius:13px;background:#fff;color:#0f5965!important;text-decoration:none;font-weight:850;line-height:1.45}',
    '.qily-knowledge-chain a small{display:block;margin-top:4px;color:#617977!important;font-weight:650}',
    '.qily-knowledge-chain a:hover{border-color:#8dbdb5;box-shadow:0 7px 18px rgba(15,75,90,.09)}',
    '@media(max-width:760px){.qily-knowledge-chain-grid{grid-template-columns:1fr}.qily-application-case{padding:13px}}'
  ].join('');
  document.head.appendChild(style);
}

function enrichToolCases(){
  var selectors=['.tool-card','.method-card','.brief-learning-card','.formula-card','.value-card'];
  var cards=Array.prototype.slice.call(article.querySelectorAll(selectors.join(',')));
  cards.forEach(function(card){
    if(hasCaseNearby(card))return;
    var heading=card.querySelector('h2,h3,h4,strong')||card;
    var found=findToolCase(clean(heading.textContent)+' '+clean(card.textContent).slice(0,180));
    if(!found)return;
    var box=document.createElement('div');
    box.className='qily-application-case';
    box.setAttribute('data-qily-case',found.code);
    box.innerHTML='<strong>应用案例｜教学推演</strong><p>'+found.caseText+'</p><div class="qily-case-metrics">'+found.metrics.map(function(metric){return '<span>'+metric+'</span>';}).join('')+'</div>';
    card.appendChild(box);
  });
}

function detectedTerms(){
  var text=upper(article.textContent);
  var found=[];
  TOOL_CASES.forEach(function(item){
    var hit=item.keys.some(function(key){return text.indexOf(upper(key))>=0;});
    if(hit&&!found.some(function(existing){return existing.code===item.code;}))found.push(item);
  });
  return found.slice(0,4);
}

function ensureKnowledgeChain(){
  if(article.querySelector('.qily-knowledge-chain'))return;
  var terms=detectedTerms();
  if(!terms.length)return;
  var panel=document.createElement('section');
  panel.className='qily-knowledge-chain';
  panel.setAttribute('aria-label','本期关联知识与项目能力');
  var links=terms.slice(0,2).map(function(item){
    return '<a href="/knowledge/terminology.html?opl='+encodeURIComponent(item.code)+'">OPL｜'+item.code+'<small>定义、口径、案例与培训确认</small></a>';
  });
  links.push('<a href="/projects/">代表项目<small>从方法进入项目证据与交付结果</small></a>');
  links.push('<a href="/improvements/">改善方法<small>查看精益、IE与工程改善方法体系</small></a>');
  links.push('<a href="/cooperation/">相关项目能力<small>将知识方法连接到企业真实课题</small></a>');
  panel.innerHTML='<h3>关联知识链｜从理解到应用</h3><p>本期涉及的工具不孤立使用：先统一定义与数据口径，再结合现场案例选择方法，最后用项目证据验证并固化。</p><div class="qily-knowledge-chain-grid">'+links.join('')+'</div>';
  var lastChecklist=article.querySelector('.checklist:last-of-type');
  var closing=article.querySelector('.closing-view,.closing');
  var anchor=lastChecklist||closing;
  if(anchor&&anchor.parentNode)anchor.parentNode.insertBefore(panel,anchor);
  else article.appendChild(panel);
}

ensureStyles();
enrichToolCases();
ensureKnowledgeChain();
})();
