(function(){
'use strict';
var API_BASE='https://qilylean-ai.dinghunter623.workers.dev';
var token=document.getElementById('token');
var login=document.getElementById('loginBox');
var dashboard=document.getElementById('dashboard');
var connect=document.getElementById('connect');
var refresh=document.getElementById('refresh');
var refreshConsultations=document.getElementById('refreshConsultations');
var refreshBriefFeedback=document.getElementById('refreshBriefFeedback');
var logout=document.getElementById('logout');
var badge=document.getElementById('serviceBadge');
var consultationList=document.getElementById('consultationList');
var briefFeedbackList=document.getElementById('briefFeedbackList');

function setText(id,value){var element=document.getElementById(id);if(element)element.textContent=value;}
function setBadge(text,ok){badge.textContent=text;badge.className='badge '+(ok?'ok':'bad');}
function savedToken(){return sessionStorage.getItem('qily_admin_token')||'';}
function authHeaders(){return{Authorization:'Bearer '+(token.value.trim()||savedToken())};}
function escapeHtml(value){return String(value==null?'':value).replace(/[&<>"']/g,function(character){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character];});}
function formatTime(value){if(!value)return'—';try{return new Date(value).toLocaleString('zh-CN',{hour12:false});}catch(error){return value;}}
function statusLabel(value){return value==='contacted'?'已联系':value==='closed'?'已关闭':'待联系';}

async function request(path,options){
  var response=await fetch(API_BASE+path,Object.assign({},options||{},{headers:Object.assign({},(options&&options.headers)||{},authHeaders())}));
  var data=await response.json().catch(function(){return{};});
  if(!response.ok)throw new Error(response.status===401?'管理口令不正确':(data.error||('后台请求失败：'+response.status)));
  return data;
}

function renderConsultations(items){
  var list=Array.isArray(items)?items:[];
  setText('pendingConsultations',list.filter(function(item){return(item.status||'new')==='new';}).length);
  if(!list.length){consultationList.innerHTML='<div class="empty">暂无咨询或留言记录。</div>';return;}
  consultationList.innerHTML=list.map(function(item){
    var status=item.status||'new';
    var isBriefMessage=item.industry==='今日简报留言交流';
    var message=String(item.problem||'—').replace(/^来源简报：[^\n]*\n留言内容：/,'').trim();
    var source=item.source_brief||item.timing||item.source_page||'未标注';
    return '<article class="consultation-card" data-key="'+escapeHtml(item.key||'')+'">'
      +'<div class="consultation-meta"><div><span class="badge '+escapeHtml(status)+'">'+statusLabel(status)+'</span> <small>'+escapeHtml(formatTime(item.submitted_at))+'</small></div><small>编号：'+escapeHtml(item.id||'—')+'</small></div>'
      +'<h3>'+(isBriefMessage?'今日简报留言｜'+escapeHtml(item.company||'匿名读者'):escapeHtml(item.company||'未填写企业')+'｜'+escapeHtml(item.industry||'未填写行业'))+'</h3>'
      +'<div class="consultation-fields">'
      +(isBriefMessage
        ?'<div class="consultation-wide"><strong>来源简报</strong>'+escapeHtml(source)+'</div>'
          +'<div><strong>联系方式</strong>'+escapeHtml(item.contact||'未留下联系方式')+'</div>'
          +'<div><strong>来源页面</strong>'+escapeHtml(item.source_page||'未标注')+'</div>'
          +'<div class="consultation-wide"><strong>留言内容</strong>'+escapeHtml(message)+'</div>'
        :'<div><strong>所在地区</strong>'+escapeHtml(item.location||'—')+'</div>'
          +'<div><strong>企业／产线规模</strong>'+escapeHtml(item.scale||'未填写')+'</div>'
          +'<div><strong>计划启动时间</strong>'+escapeHtml(item.timing||'未填写')+'</div>'
          +'<div><strong>联系人及电话</strong>'+escapeHtml(item.contact||'—')+'</div>'
          +'<div class="consultation-wide"><strong>当前主要问题</strong>'+escapeHtml(item.problem||'—')+'</div>'
          +'<div class="consultation-wide"><strong>希望达到的目标</strong>'+escapeHtml(item.target||'未填写')+'</div>')
      +'</div>'
      +'<div class="consultation-actions">'
      +(status!=='contacted'?'<button class="btn" type="button" data-status="contacted">标记已联系</button>':'')
      +(status!=='closed'?'<button class="btn secondary" type="button" data-status="closed">标记已关闭</button>':'')
      +(status!=='new'?'<button class="btn secondary" type="button" data-status="new">恢复待联系</button>':'')
      +'</div></article>';
  }).join('');
}

function renderBriefFeedback(items){
  if(!briefFeedbackList)return;
  var list=Array.isArray(items)?items:[];
  if(!list.length){briefFeedbackList.innerHTML='<div class="empty">暂无简报评分互动。</div>';return;}
  briefFeedbackList.innerHTML=list.map(function(item){
    var count=Number(item.rating_count||0),average=Number(item.rating_average||0),total=count+Number(item.likes||0)+Number(item.dislikes||0);
    return '<article class="feedback-card"><div><strong>'+escapeHtml(item.brief_date||'未标注日期')+'</strong><span>'+escapeHtml(item.brief_title||'未标注标题')+'</span></div>'
      +'<div class="feedback-numbers"><b>'+escapeHtml(count?average.toFixed(1):'—')+'</b><small>五星均分／'+escapeHtml(count)+'次</small></div>'
      +'<div class="feedback-numbers"><b>👍 '+escapeHtml(item.likes||0)+'　👎 '+escapeHtml(item.dislikes||0)+'</b><small>总互动 '+escapeHtml(total)+'</small></div>'
      +(item.brief_url?'<a href="'+escapeHtml(item.brief_url)+'" target="_blank" rel="noopener">打开简报</a>':'')+'</article>';
  }).join('');
}

async function loadConsultations(){
  consultationList.innerHTML='<div class="empty">正在加载咨询记录…</div>';
  var data=await request('/admin/consultations?limit=100');
  renderConsultations(data.consultations||[]);
}

async function loadBriefFeedback(){
  if(!briefFeedbackList)return;
  briefFeedbackList.innerHTML='<div class="empty">正在加载简报评分…</div>';
  var data=await request('/admin/brief-feedback?limit=100');
  renderBriefFeedback(data.feedback||[]);
}

async function load(){
  var value=token.value.trim()||savedToken();
  if(!value){setBadge('需要口令',false);return;}
  connect.disabled=true;refresh.disabled=true;if(refreshConsultations)refreshConsultations.disabled=true;if(refreshBriefFeedback)refreshBriefFeedback.disabled=true;setBadge('连接中',true);
  try{
    var results=await Promise.all([request('/admin/status'),request('/admin/consultations?limit=100'),request('/admin/brief-feedback?limit=100')]);
    var data=results[0],consultations=results[1].consultations||[],feedback=results[2].feedback||[];
    sessionStorage.setItem('qily_admin_token',value);
    login.classList.add('hidden');dashboard.classList.remove('hidden');
    setBadge('运行正常',true);
    setText('todayRequests',data.today.requests||0);
    setText('todaySuccess',data.today.success||0);
    setText('todayErrors',data.today.errors||0);
    setText('todayLimited',data.today.rate_limited||0);
    setText('todayConsultations',data.today.consultations||0);
    setText('todayBriefRatings',data.today.brief_ratings||0);
    setText('todayBriefSentiments',data.today.brief_sentiments||0);
    setText('todayBriefComments',data.today.brief_comments||0);
    setText('model',data.model||'—');
    setText('limit',(data.daily_ip_limit||0)+' 次/日');
    setText('maxTokens',data.max_output_tokens||'—');
    setText('keyState',data.openai_key_configured?'已配置':'未配置');
    setText('storage',data.statistics_storage==='enabled'?'已启用 Cloudflare KV':'尚未绑定 KV');
    setText('consultationEmail',data.consultation_receiver||'396767769@qq.com');
    setText('emailBinding',data.consultation_email_binding?'Cloudflare邮件绑定已启用':'使用网页邮件通知通道');
    setText('allTime',[data.all_time.requests||0,data.all_time.success||0,data.all_time.errors||0].join(' / '));
    setText('dateUtc',data.date_utc||'—');
    renderConsultations(consultations);
    renderBriefFeedback(feedback);
  }catch(e){
    setBadge(e.message||'连接失败',false);login.classList.remove('hidden');dashboard.classList.add('hidden');
  }finally{connect.disabled=false;refresh.disabled=false;if(refreshConsultations)refreshConsultations.disabled=false;if(refreshBriefFeedback)refreshBriefFeedback.disabled=false;}
}

connect.addEventListener('click',load);
token.addEventListener('keydown',function(e){if(e.key==='Enter')load();});
refresh.addEventListener('click',load);
if(refreshConsultations)refreshConsultations.addEventListener('click',function(){refreshConsultations.disabled=true;loadConsultations().catch(function(error){consultationList.innerHTML='<div class="empty">'+escapeHtml(error.message||'咨询记录加载失败')+'</div>';}).finally(function(){refreshConsultations.disabled=false;});});
if(refreshBriefFeedback)refreshBriefFeedback.addEventListener('click',function(){refreshBriefFeedback.disabled=true;loadBriefFeedback().catch(function(error){briefFeedbackList.innerHTML='<div class="empty">'+escapeHtml(error.message||'评分记录加载失败')+'</div>';}).finally(function(){refreshBriefFeedback.disabled=false;});});
consultationList.addEventListener('click',async function(event){
  var button=event.target.closest&&event.target.closest('button[data-status]');if(!button)return;
  var card=button.closest('.consultation-card');var key=card&&card.getAttribute('data-key');var next=button.getAttribute('data-status');if(!key||!next)return;
  button.disabled=true;
  try{await request('/admin/consultations/status',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({key:key,status:next})});await loadConsultations();}
  catch(error){alert(error.message||'状态更新失败');button.disabled=false;}
});
logout.addEventListener('click',function(){sessionStorage.removeItem('qily_admin_token');token.value='';dashboard.classList.add('hidden');login.classList.remove('hidden');setBadge('已退出',false);});
if(savedToken()){token.value=savedToken();load();}
})();
