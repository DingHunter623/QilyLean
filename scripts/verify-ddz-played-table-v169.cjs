/* Run against a local HTTP server. The fixture bridge is injected by Playwright only;
   production ships no state mutation or test-only API. NODE_PATH may supply Playwright. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const base=process.env.DDZ_TEST_URL||'http://127.0.0.1:8765';
const out=process.env.DDZ_TEST_OUTPUT||'/tmp/ddz-played-table-v169';
fs.mkdirSync(out,{recursive:true});
const fixture=`
  window.__DDZRegression={
    seed(hands){
      window.PureDDZTest.stop();let id=0;
      Object.assign(state,{phase:'playing',hands:hands.map(ranks=>ranks.map((rank,i)=>({id:id++,rank,suit:['♠','♥','♣','♦'][i%4]}))),bottom:[{id:51,rank:5,suit:'♣'},{id:52,rank:6,suit:'♣'},{id:53,rank:15,suit:'♥'}],landlord:0,current:0,lastPlay:null,tablePlays:[null,null,null],tablePasses:[false,false,false],trickNumber:0,passCount:0,winner:null,playCounts:[0,0,0],selected:new Set(),settings:{...state.settings,music:false,voice:false,effects:false}});
      closeModal('welcome');closeModal('result');render();
    },
    play(player,count){window.PureDDZTest.stop();state.current=player;return commitPlay(player,state.hands[player].slice(0,count));},
    pass(player){window.PureDDZTest.stop();state.current=player;pass(player);},
    render(){render();}
  };
`;
async function open(browser,options={}){
  const context=await browser.newContext({viewport:{width:1680,height:904},...options});
  await context.addInitScript(()=>{
    try{
    localStorage.setItem('pure_ddz_settings_v2',JSON.stringify({voice:false,music:false,effects:false,font:'large',difficulty:'expert'}));
    localStorage.setItem('pure_ddz_music_v168','0');
    }catch(_){}
  });
  const page=await context.newPage();
  await page.route('**/ddz-core-v155.js?*',async route=>{
    const response=await route.fetch();
    const body=(await response.text()).replace('  window.PureDDZTest=Object.freeze(',fixture+'  window.PureDDZTest=Object.freeze(');
    await route.fulfill({response,body});
  });
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base+'/tools/pure-ddz/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__DDZRegression&&window.QilyLeanDdzUxV168);
  return {context,page,errors};
}
async function seed(page,hands){await page.evaluate(h=>__DDZRegression.seed(h),hands);await page.waitForTimeout(600);}
async function play(page,player,count){const result=await page.evaluate(([p,n])=>__DDZRegression.play(p,n),[player,count]);assert.equal(result.ok,true,result.message);}
async function badge(page,player){return page.locator(`#ddz-played-table [data-player="${player}"] .ddz-play-badge`).textContent();}
async function geometry(page){return page.evaluate(()=>{
  const board=document.getElementById('ddz-played-table'),me=document.getElementById('me-panel'),center=document.querySelector('.center-area');
  const cards=[...board.querySelectorAll('.ddz-play-card')];
  return {top:board.offsetTop,bottom:board.offsetTop+board.offsetHeight,meTop:me.offsetTop,centerBottom:center.offsetTop+center.offsetHeight,width:board.offsetWidth,height:board.offsetHeight,
    escaped:cards.filter(card=>{const c=card.getBoundingClientRect(),s=card.closest('.ddz-player-play').getBoundingClientRect();return c.left<s.left-1||c.right>s.right+1||c.top<s.top-1||c.bottom>s.bottom+1;}).length,
    hidden:cards.filter(card=>getComputedStyle(card).display==='none'||card.offsetWidth===0).length,
    classes:document.documentElement.className};
});}
async function checkGeometry(page,name){await page.waitForTimeout(250);const g=await geometry(page);console.log(name,JSON.stringify(g));assert(g.width>100);assert(g.top>=g.centerBottom,`${name}: overlaps status`);assert(g.bottom<=g.meTop,`${name}: overlaps hand`);assert.equal(g.escaped,0,`${name}: clipped cards`);assert.equal(g.hidden,0);}
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const {context,page,errors}=await open(browser);
  await seed(page,[[3,3,14,15],[5,5,13],[8,8,12,13]]);
  await play(page,0,2);assert.equal(await badge(page,0),'当前出牌');
  assert.equal(await page.locator('[data-player="0"] .ddz-play-card').count(),2);
  await play(page,1,2);await play(page,2,2);
  assert.equal(await page.locator('#ddz-played-table .ddz-play-card').count(),6);
  assert.equal(await badge(page,0),'已被压过');assert.equal(await badge(page,2),'当前出牌');
  await checkGeometry(page,'desktop-1680x904');
  await page.screenshot({path:path.join(out,'desktop-three-players.png')});
  await page.evaluate(()=>__DDZRegression.pass(0));assert.equal(await badge(page,0),'不要');
  await page.evaluate(()=>__DDZRegression.pass(1));
  await page.waitForFunction(()=>PureDDZTest.getState().lastPlay===null);
  await page.evaluate(()=>PureDDZTest.stop());
  assert.equal(await page.locator('#ddz-played-table .ddz-play-card').count(),6);
  assert.equal(await page.locator('#ddz-played-table .is-current').count(),0);
  await play(page,2,1);
  assert.equal(await badge(page,0),'上一轮');assert.equal(await badge(page,2),'当前出牌');
  await seed(page,[[3],[4],[5]]);await play(page,0,1);assert.equal(await badge(page,0),'已出完');
  await page.waitForFunction(()=>!document.getElementById('result').classList.contains('hidden'));
  await page.locator('#result-close').click();
  assert.equal(await page.locator('[data-player="0"] .ddz-play-card').count(),1);
  await page.evaluate(()=>PureDDZTest.start());await page.evaluate(()=>PureDDZTest.stop());
  assert.equal(await page.locator('#ddz-played-table').isVisible(),false);
  assert.deepEqual(await page.evaluate(()=>PureDDZTest.getState().tablePlays),[null,null,null]);
  // Invalid selections and hints must not publish cards prematurely.
  await seed(page,[[3,4,5,6,7,14],[8,9,10],[11,12,13]]);
  assert.equal((await page.evaluate(()=>__DDZRegression.play(0,2))).ok,false);
  assert.equal(await page.locator('#ddz-played-table .ddz-play-card').count(),0);
  await page.locator('#hint').click();
  assert.equal(await page.locator('#ddz-played-table .ddz-play-card').count(),0);
  await page.locator('#play').click();
  assert((await page.locator('[data-player="0"] .ddz-play-card').count())>0);
  await page.evaluate(()=>PureDDZTest.stop());
  assert.deepEqual(errors,[]);
  await context.close();
  const long=[3,3,3,4,4,4,5,5,5,6,6,6,7,7,8,8,9,9,10,10];
  const profiles=[
    ['desktop-900x600',{viewport:{width:900,height:600}}],
    ['desktop-1366x768',{viewport:{width:1366,height:768}}],
    ['desktop-1920x1080',{viewport:{width:1920,height:1080}}],
    ['android-844x390',{viewport:{width:844,height:390},isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36'}],
    ['android-667x375',{viewport:{width:667,height:375},isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36'}],
    ['android-568x320',{viewport:{width:568,height:320},isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36'}],
    ['portrait-390x844',{viewport:{width:390,height:844},isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36'}],
    ['iphone-390x844',{viewport:{width:390,height:844},isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1'}]
  ];
  for(const [name,options] of profiles){
    const {context,page,errors}=await open(browser,options);
    await seed(page,[long,[11,12,13],[14,15,16]]);
    if(name.startsWith('iphone')){await page.locator('#v120-landscape-toggle').click();await page.waitForTimeout(500);assert(await page.evaluate(()=>QilyLeanDdzVirtualLandscape.active));}
    await play(page,0,20);await page.evaluate(()=>PureDDZTest.stop());
    assert.equal(await page.locator('[data-player="0"] .ddz-play-card').count(),20);
    await page.screenshot({path:path.join(out,name+'.png')});
    await checkGeometry(page,name);assert.deepEqual(errors,[]);
    await context.close();
  }
  console.log('PASS: immediate three-player cards, passes, trick reset, winning hand, restart, invalid play, hint/manual play, and eight viewport profiles including iPhone virtual landscape.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
