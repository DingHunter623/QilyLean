/* QilyLean OpenAI Ads Measurement Pixel integration.
 * Activate by replacing OPENAI_ADS_PIXEL_ID in the script tag with the Pixel ID
 * provisioned in OpenAI Ads Manager. Pixel IDs are public configuration; never
 * place a Conversions API key in browser code.
 */
(function(w,d){
  'use strict';
  var hostScript=d.currentScript;
  var pixelId=hostScript?String(hostScript.getAttribute('data-openai-ads-pixel-id')||'').trim():'';
  var placeholder='OPENAI_ADS_PIXEL_ID';
  var api={enabled:false,measure:function(){},leadCreated:function(){}};
  w.QilyOpenAIAds=api;
  if(!pixelId||pixelId===placeholder)return;
  try{
    if(!w.oaiq){
      var q=function(){q.q.push(arguments);};
      q.q=[];
      w.oaiq=q;
      var sdk=d.createElement('script');
      sdk.async=true;
      sdk.src='https://bzrcdn.openai.com/sdk/oaiq.min.js';
      var first=d.getElementsByTagName('script')[0];
      first.parentNode.insertBefore(sdk,first);
    }
    w.oaiq('init',{pixelId:pixelId});
    api.enabled=true;
    api.measure=function(name,data,options){
      try{
        if(options)w.oaiq('measure',name,data,options);
        else w.oaiq('measure',name,data);
      }catch(error){}
    };
    api.leadCreated=function(eventId){
      var options=eventId?{event_id:String(eventId)}:undefined;
      api.measure('lead_created',{type:'customer_action'},options);
    };
    if(!hostScript||hostScript.getAttribute('data-openai-ads-page-view')!=='false'){
      api.measure('page_viewed',{
        type:'contents',
        contents:[{id:w.location.pathname||'/',name:d.title||w.location.pathname||'/',content_type:'page'}]
      });
    }
  }catch(error){}
})(window,document);
