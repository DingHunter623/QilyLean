(function(){
'use strict';
var root=document.querySelector('[data-brief-feedback]');
if(!root)return;

var api='https://qilylean-ai.dinghunter623.workers.dev';
var date=root.getAttribute('data-brief-date')||'';
var title=root.getAttribute('data-brief-title')||'';
var pageUrl=root.getAttribute('data-brief-url')||location.href;
var status=root.querySelector('[data-brief-feedback-status]');
var ratingSummary=root.querySelector('[data-rating-summary]');
var likeCount=root.querySelector('[data-like-count]');
var dislikeCount=root.querySelector('[data-dislike-count]');
var messageForm=root.querySelector('[data-brief-message-form]');

function setStatus(text,type){
  if(!status)return;
  status.textContent=text;
  status.className='brief-feedback-status'+(type?' '+type:'');
}

function safeStorage(){
  try{return window.localStorage;}catch(error){return null;}
}

var storage=safeStorage();
var tokenKey='qilylean_feedback_client';
var clientToken='';
if(storage){
  clientToken=storage.getItem(tokenKey)||'';
  if(!clientToken){
    clientToken=window.crypto&&window.crypto.randomUUID
      ?window.crypto.randomUUID()
      :'ql-'+Date.now()+'-'+Math.random().toString(36).slice(2);
    storage.setItem(tokenKey,clientToken);
  }
}
if(!clientToken)clientToken='session-'+Date.now()+'-'+Math.random().toString(36).slice(2);

function marker(action){
  return'qilylean_feedback_'+date+'_'+action;
}

function render(summary){
  summary=summary||{};
  var count=Number(summary.rating_count||0);
  var average=Number(summary.rating_average||0);
  if(ratingSummary)ratingSummary.textContent=count
    ?average.toFixed(1)+' / 5｜'+count+'次评分'
    :'暂无评分，期待你的第一颗星。';
  if(likeCount)likeCount.textContent=String(Number(summary.likes||0));
  if(dislikeCount)dislikeCount.textContent=String(Number(summary.dislikes||0));
  if(!storage)return;
  var savedRating=Number(storage.getItem(marker('rating'))||0);
  var savedSentiment=storage.getItem(marker('sentiment'))||'';
  root.querySelectorAll('[data-brief-rating]').forEach(function(button){
    var value=Number(button.getAttribute('data-brief-rating'));
    button.classList.toggle('selected',savedRating>0&&value<=savedRating);
    button.setAttribute('aria-pressed',String(value===savedRating));
  });
  root.querySelectorAll('[data-brief-sentiment]').forEach(function(button){
    var active=button.getAttribute('data-brief-sentiment')===savedSentiment;
    button.classList.toggle('selected',active);
    button.setAttribute('aria-pressed',String(active));
  });
}

async function loadSummary(){
  try{
    var response=await fetch(api+'/brief-feedback?brief='+encodeURIComponent(date),{headers:{Accept:'application/json'}});
    if(response.ok)render(await response.json());
  }catch(error){
    console.warn('Brief feedback summary unavailable',error);
  }
}

async function submitVote(action,value){
  if(storage&&storage.getItem(marker(action))){
    setStatus(action==='rating'?'你已经为本期评过星。':'你已经为本期提交过好／差评。','');
    return;
  }
  var buttons=Array.prototype.slice.call(root.querySelectorAll('[data-brief-rating],[data-brief-sentiment]'));
  buttons.forEach(function(item){item.disabled=true;});
  setStatus('正在提交评价…','');
  try{
    var response=await fetch(api+'/brief-feedback',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        brief_date:date,
        brief_title:title,
        brief_url:pageUrl,
        action:action,
        value:value,
        client_token:clientToken
      })
    });
    var result=await response.json().catch(function(){return{};});
    if(!response.ok)throw new Error(result.error||'feedback_'+response.status);
    if(storage)storage.setItem(marker(action),String(value));
    render(result.summary||result);
    setStatus(result.duplicate?'本期同类评价已记录，无需重复提交。':'谢谢你的评价，汇总数据已更新。','success');
  }catch(error){
    setStatus('评价暂未提交成功，请稍后重试。','error');
  }finally{
    buttons.forEach(function(item){item.disabled=false;});
  }
}

root.addEventListener('click',function(event){
  var rating=event.target.closest&&event.target.closest('[data-brief-rating]');
  if(rating){
    submitVote('rating',Number(rating.getAttribute('data-brief-rating')));
    return;
  }
  var sentiment=event.target.closest&&event.target.closest('[data-brief-sentiment]');
  if(sentiment)submitVote('sentiment',sentiment.getAttribute('data-brief-sentiment'));
});

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
  var response=await fetch('https://formsubmit.co/ajax/396767769@qq.com',{
    method:'POST',
    headers:{Accept:'application/json'},
    body:mail
  });
  if(!response.ok)throw new Error('email_'+response.status);
  return true;
}

if(messageForm)messageForm.addEventListener('submit',async function(event){
  event.preventDefault();
  if(!messageForm.reportValidity())return;
  var formData=new FormData(messageForm);
  var website=String(formData.get('website')||'').trim();
  if(website){
    setStatus('留言已提交。','success');
    return;
  }
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
    var response=await fetch(api+'/consultations',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(data)
    });
    var result=await response.json().catch(function(){return{};});
    if(!response.ok)throw new Error(result.error||'message_'+response.status);
    id=result.id||'';
    emailSent=Boolean(result.email_sent);
    if(!emailSent){
      try{emailSent=await sendMessageFallback(data,id);}
      catch(emailError){console.warn('Brief message email fallback unavailable',emailError);}
    }
    messageForm.reset();
    setStatus(emailSent
      ?'留言已提交，后台已保存并发送邮件通知。'
      :'留言已提交，后台已保存；邮件通知暂未确认。','success');
  }catch(error){
    try{emailSent=await sendMessageFallback(data,id);}
    catch(emailError){console.warn('Brief message email unavailable',emailError);}
    setStatus(emailSent
      ?'后台暂时繁忙，但留言已发送至接收邮箱。'
      :'留言暂未提交成功，请稍后重试。','error');
  }finally{
    button.disabled=false;
    button.textContent='提交留言';
  }
});

loadSummary();
})();
