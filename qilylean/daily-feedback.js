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
})();
