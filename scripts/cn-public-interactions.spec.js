const {test,expect}=require('@playwright/test');
const fs=require('fs');
const path=require('path');

const ROOT=fs.realpathSync(process.cwd());
const CN=path.join(ROOT,'cn-site');
const BASE=process.env.QILY_CN_BASE||'http://127.0.0.1:4174';
const ORIGIN=new URL(BASE).origin;
const TERM='/archive/knowledge/terminology/';
const INDEX='/archive/global-knowledge/briefs/';
const PUBLIC=JSON.parse(fs.readFileSync(path.join(CN,'archive/public-interactions.json'),'utf8'));
const LESSONS=PUBLIC.terminology_lessons;
const BRIEF_COUNT=fs.readdirSync(path.join(CN,'briefs/archive')).filter(x=>/^\d{4}-\d{2}-\d{2}$/.test(x)).length;
const failures=new WeakMap();
const mime={'.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.gif':'image/gif','.svg':'image/svg+xml','.qly':'application/octet-stream','.mp4':'video/mp4','.webm':'video/webm'};

// Production /mirror-media/ proxies an explicitly resolved repository asset.
// Serve those same real bytes in CI; missing files fail rather than becoming
// synthetic images or a tolerant mock response.
function repositoryAsset(url){
  const pathname=decodeURIComponent(new URL(url).pathname);
  const relative=pathname.slice('/mirror-media/'.length);
  if(!relative||relative.split('/').includes('..')||relative.includes('\0'))throw new Error('Unsafe mirror asset '+pathname);
  const resolved=fs.realpathSync(path.resolve(ROOT,relative));
  if(!resolved.startsWith(ROOT+path.sep)||!fs.statSync(resolved).isFile()||!mime[path.extname(resolved).toLowerCase()])throw new Error('Unapproved mirror asset '+pathname);
  return resolved;
}

test.setTimeout(60_000);
test.beforeEach(async({page})=>{
  const missing=[];
  failures.set(page,missing);
  await page.route('**/*',async route=>{
    const url=new URL(route.request().url());
    if(url.origin!==ORIGIN)return route.abort('blockedbyclient');
    if(!url.pathname.startsWith('/mirror-media/'))return route.continue();
    try{
      const file=repositoryAsset(url.href);
      await route.fulfill({status:200,contentType:mime[path.extname(file).toLowerCase()],body:fs.readFileSync(file)});
    }catch(error){
      missing.push(String(error));
      await route.fulfill({status:404,contentType:'text/plain',body:'Required repository mirror asset is missing'});
    }
  });
  await page.addInitScript(()=>{
    window.__qilyPublicPrintCalls=0;
    window.print=()=>{window.__qilyPublicPrintCalls++;};
  });
});
test.afterEach(async({page})=>{
  expect(failures.get(page)||[],'every requested mirror asset exists in the repository').toEqual([]);
});

async function open(page,route){
  const response=await page.goto(BASE+route,{waitUntil:'domcontentloaded'});
  expect(response&&response.ok(),route+' loads from the generated CN root').toBeTruthy();
}

for(const device of [{name:'desktop',width:1440,height:900},{name:'mobile',width:390,height:844}]){
  test.describe(device.name,()=>{
    test.use({viewport:{width:device.width,height:device.height},isMobile:device.name==='mobile'});

    test('knowledge modules cross-station visual geometry baseline',async({page,context})=>{
      await open(page,'/knowledge/');
      const source=await context.newPage();
      try{
        const globalBase=process.env.QILY_GLOBAL_BASE||'http://127.0.0.1:4175';
        const response=await source.goto(globalBase+'/knowledge/',{waitUntil:'domcontentloaded'});
        expect(response&&response.ok(),'International source knowledge page must load').toBeTruthy();
        await page.evaluate(()=>document.fonts.ready);
        await source.evaluate(()=>document.fonts.ready);
        await page.waitForTimeout(800);
        await source.waitForTimeout(800);
        const sample=async(target,prefix)=>{
          return await target.evaluate(({prefix})=>{
            const id=['knowledge-stats','ai-manufacturing-knowledge','terminology','daily','tools','lean-series','documents'];
            const number=x=>Math.round(x*100)/100;
            const rect=node=>{
              if(!node)return null;
              const r=node.getBoundingClientRect();
              return {width:number(r.width),height:number(r.height),x:number(r.left),y:number(r.top)};
            };
            const computed=node=>{
              if(!node)return null;
              const css=getComputedStyle(node);
              return {font:number(parseFloat(css.fontSize)),line:number(parseFloat(css.lineHeight)),
                weight:css.fontWeight,color:css.color,background:css.backgroundColor,
                fill:css.webkitTextFillColor,decoration:css.textDecorationLine,
                border:css.borderLeftWidth+' '+css.borderLeftColor,
                borderTop:css.borderTopWidth+' '+css.borderTopColor,
                radius:css.borderRadius,shadow:css.boxShadow,
                pad:[css.paddingTop,css.paddingRight,css.paddingBottom,css.paddingLeft],
                margin:[css.marginTop,css.marginRight,css.marginBottom,css.marginLeft],
                display:css.display,gap:css.gap,columns:css.gridTemplateColumns,
              };
            };
            const out={};
            for(const name of id){
              const section=document.getElementById(prefix+name);
              if(!section){out[name]={missing:true};continue}
              const inner=section.querySelector('.module-inner');
              const grid=section.querySelector('.module-grid');
              const card=section.querySelector('.module-card');
              out[name]={
                section:{rect:rect(section),css:computed(section)},
                inner:rect(inner),heading:computed(section.querySelector('.module-heading h2')),
                headCopy:computed(section.querySelector('.module-heading p')),
                grid:computed(grid),
                cards:section.querySelectorAll('.module-card').length,
                card:{rect:rect(card),css:computed(card)},
                label:computed(card?.querySelector('small')),
                cardTitle:computed(card?.querySelector('h3')),
                body:computed(card?.querySelector('p')),
                action:computed(card?.querySelector('.knowledge-stat-jump,.module-actions a')),
                actionRect:rect(card?.querySelector('.knowledge-stat-jump,.module-actions a')),
                eyebrow:computed(section.querySelector('.module-eyebrow')),
                result:computed(section.querySelector('.module-result')),
                secondary:computed(section.querySelector('.module-actions a.secondary')),
              };
            }
            return out;
          },{prefix});
        };
        const [intl,cn]=await Promise.all([sample(source,''),sample(page,'cn-global-')]);
        const reference={viewport:device.width,international:intl,china:cn};
        const evidenceDir=path.join(ROOT,'visual-cn-typography-v23');
        fs.mkdirSync(evidenceDir,{recursive:true});
        fs.writeFileSync(path.join(evidenceDir,'knowledge-vi-parity-'+device.width+'.json'),
          JSON.stringify(reference,null,2));
        const within=(a,b,limit,label)=>{
          expect(typeof a,'international '+label).toBe('number');
          expect(typeof b,'China '+label).toBe('number');
          expect(Math.abs(a-b),label+' international='+a+' cn='+b).toBeLessThanOrEqual(limit);
        };
        const px=x=>parseFloat(x);
        for(const key of Object.keys(intl)){
          const a=intl[key],b=cn[key];
          expect(a.missing,'International section '+key).toBeFalsy();
          expect(b.missing,'CN section '+key).toBeFalsy();
          within(a.inner.width,b.inner.width,1,key+' content axis');
          for(let i=0;i<4;i++){
            within(px(a.section.css.pad[i]),px(b.section.css.pad[i]),1,key+' section padding '+i);
          }
          expect(b.section.css.background,key+' section surface').toBe(a.section.css.background);
          within(a.heading.font,b.heading.font,.35,key+' section heading');
          expect(b.heading.weight,key+' heading weight').toBe(a.heading.weight);
          expect(b.heading.color,key+' heading ink').toBe(a.heading.color);
          within(a.card.rect.width,b.card.rect.width,2,key+' card width');
          for(let i=0;i<4;i++){
            within(px(a.card.css.pad[i]),px(b.card.css.pad[i]),1,key+' card padding '+i);
          }
          expect(b.card.css.radius,key+' card radius').toBe(a.card.css.radius);
          expect(b.card.css.border,key+' card edge').toBe(a.card.css.border);
          expect(b.card.css.borderTop,key+' card top edge').toBe(a.card.css.borderTop);
          expect(b.card.css.background,key+' card background').toBe(a.card.css.background);
          expect(b.card.css.decoration,key+' card text emphasis').toBe(a.card.css.decoration);
          within(a.cardTitle.font,b.cardTitle.font,.35,key+' card heading font');
          expect(b.cardTitle.weight,key+' card heading weight').toBe(a.cardTitle.weight);
          expect(b.cardTitle.fill,key+' card heading color').toBe(a.cardTitle.fill);
          within(a.body.font,b.body.font,.35,key+' body font');
          expect(b.body.weight,key+' body weight').toBe(a.body.weight);
          expect(b.body.color,key+' body ink').toBe(a.body.color);
          within(a.action.font,b.action.font,.35,key+' action font');
          expect(b.action.weight,key+' action weight').toBe(a.action.weight);
          expect(b.action.color,key+' action ink').toBe(a.action.color);
          if(device.name==='mobile' && key!=='knowledge-stats'){
            within(a.actionRect.width,b.actionRect.width,2,key+' mobile button width');
          }
          // Existing China accessibility gate requires all small labels >=18px;
          // international small labels are 15.75-16.65px for non-stat cards.
          expect(b.label.font,key+' China label accessibility floor').toBeGreaterThanOrEqual(18);
          within(a.label.font,b.label.font,2.5,key+' label semantic scale');
          expect(b.label.weight,key+' label weight').toBe(a.label.weight);
          if(a.grid&&b.grid){
            within(px(a.grid.gap),px(b.grid.gap),1,key+' column gap');
            expect(b.grid.columns.trim().split(/\s+/).length,
              key+' responsive column count').toBe(a.grid.columns.trim().split(/\s+/).length);
          }
        }
        // Additional parity assertions for less common knowledge components.
        const aiA=intl['ai-manufacturing-knowledge'].eyebrow;
        const aiB=cn['ai-manufacturing-knowledge'].eyebrow;
        within(aiA.font,aiB.font,.35,'AI module gold-eyebrow font');
        expect(aiB.weight).toBe(aiA.weight);
        expect(aiB.color).toBe(aiA.color);
        expect(aiB.fill).toBe(aiA.fill);
        const oplA=intl.terminology.result,oplB=cn.terminology.result;
        within(oplA.font,oplB.font,.35,'OPL result caption font');
        expect(oplB.weight).toBe(oplA.weight);
        expect(oplB.color).toBe(oplA.color);
        expect(oplB.fill).toBe(oplA.fill);
        expect(oplB.radius).toBe(oplA.radius);
        const buttonA=intl.daily.secondary,buttonB=cn.daily.secondary;
        within(buttonA.font,buttonB.font,.35,'secondary brief button font');
        expect(buttonB.weight).toBe(buttonA.weight);
        expect(buttonB.color).toBe(buttonA.color);
        expect(buttonB.border).toBe(buttonA.border);
        expect(buttonB.radius).toBe(buttonA.radius);
        // Also retain computed evidence for exceptional components: gold
        // module label, OPL information strip and secondary actions.
        console.log('QILY-KNOWLEDGE-VI-SPECIAL +JSON.stringify({viewport:device.width,
          eyebrow:[intl['ai-manufacturing-knowledge'].eyebrow,cn['ai-manufacturing-knowledge'].eyebrow],
          result:[intl.terminology.result,cn.terminology.result],
          secondary:[intl.daily.secondary,cn.daily.secondary]}));
        for(const name of ['knowledge-stats','lean-series']){
          const intlSection=source.locator('#'+name);
          const cnSection=page.locator('#cn-global-'+name);
          await intlSection.screenshot({path:path.join(evidenceDir,'knowledge-intl-'+name+'-'+device.width+'.png'),
            animations:'disabled',timeout:15000});
          await cnSection.screenshot({path:path.join(evidenceDir,'knowledge-cn-'+name+'-'+device.width+'.png'),
            animations:'disabled',timeout:15000});
        }
        console.log('PASS: QILY-CN-KNOWLEDGE-COMPUTED-VI-PARITY '+device.width+'px / 7 sections / typography, width, paddings, color, card borders and action styles');

      }finally{
        await source.close();
      }
    });

    test('complete international knowledge hub is locally mirrored with professional links and VI',async({page})=>{
      await open(page,'/knowledge/');
      const hub=page.locator('#main .qily-cn-knowledge-hub[data-qily-international-knowledge-mirror="v1"]');
      await expect(hub).toBeVisible();
      const sections=[
        'knowledge-stats','ai-manufacturing-knowledge','terminology',
        'daily','tools','lean-series','documents',
      ];
      for(const name of sections){
        await expect(hub.locator('#cn-global-'+name)).toHaveCount(1);
      }
      await expect(hub).toHaveAttribute('data-qily-brief-total',String(BRIEF_COUNT));
      await expect(hub).toHaveAttribute('data-qily-terminology-total','193');
      const stats=hub.locator('#cn-global-knowledge-stats .knowledge-stat-card');
      await expect(stats).toHaveCount(4);
      await expect(stats.nth(0)).toContainText('6 大模块');
      await expect(stats.nth(1)).toContainText('193 项');
      await expect(stats.nth(2)).toContainText(String(BRIEF_COUNT)+' 篇');
      await expect(stats.nth(3)).toContainText('16 项');
      await expect(stats.nth(0)).toHaveAttribute('href','#cn-global-knowledge-architecture');
      await expect(stats.nth(1)).toHaveAttribute('href','/archive/knowledge/terminology/');
      await expect(stats.nth(2)).toHaveAttribute('href','/briefs/');
      await expect(stats.nth(3)).toHaveAttribute('href','#cn-global-tools');
      await expect(page.locator('#cn-global-knowledge-architecture')).toBeVisible();
      await expect(hub.locator('#cn-global-tools article.module-card')).toHaveCount(4);
      await expect(hub.locator('#cn-global-lean-series article.module-card')).toHaveCount(6);
      await expect(hub.locator('#cn-global-documents article.module-card')).toHaveCount(6);
      await expect(hub.locator('#cn-global-documents a[href="/assets/knowledge/%E7%8E%B0%E5%9C%BA%E7%AE%A1%E7%90%86.pdf"]')).toHaveCount(2);
      const localLinks=await hub.locator('a[href]').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('href')));
      expect(localLinks.length).toBeGreaterThan(25);
      expect(localLinks.every(href=>href.startsWith('/')||href.startsWith('#')),'No overseas or commercial link inside personal knowledge hub').toBeTruthy();
      expect(localLinks.some(href=>href.includes('/cooperation/'))).toBeFalsy();
      const grid=hub.locator('#cn-global-knowledge-stats .knowledge-stat-grid');
      const cols=await grid.evaluate(node=>getComputedStyle(node).gridTemplateColumns.split(/\s+/).filter(Boolean).length);
      expect(cols).toBe(device.name==='mobile'?1:3);
      const origin=await page.locator('head link[href*="knowledge-vi-parity-v2"]').count();
      expect(origin,'Knowledge index must load the updated, scoped style version').toBe(1);
      await expect(page.locator('footer.footer')).toContainText('湘ICP备2026041143号-1');
      await expect(page.locator('footer.footer')).toContainText('湘公网安备43020002000443号');
    });

    test('CN brief landing retains only the year-index module, without the duplicate latest list',async({page})=>{
      await open(page,'/briefs/');
      const body=page.locator('body[data-qily-knowledge-discovery="v1"]');
      const main=body.locator('main#main');
      await expect(main).toBeVisible();
      const expectedYears=fs.readdirSync(path.join(CN,'briefs/archive/year'))
        .filter(name=>/^20[0-9]{2}$/.test(name));
      const yearCards=main.locator('.catalog-year-grid>a.catalog-card');
      await expect(yearCards).toHaveCount(expectedYears.length);
      expect(expectedYears.length).toBe(8);
      for(const year of expectedYears){
        await expect(yearCards.filter({has:page.locator('h3:text-is("'+year+'年")')}))
          .toHaveAttribute('href','/briefs/archive/year/'+year+'/');
      }
      await expect(body).toHaveAttribute('data-qily-brief-total',String(BRIEF_COUNT));
      await expect(main.locator('.catalog-stats')).toContainText(String(BRIEF_COUNT));
      await expect(main.locator('section.section')).toHaveCount(1);
      await expect(main.locator('section.section.alt,.article-list.catalog-list,.catalog-more,.catalog-extension')).toHaveCount(0);
      await expect(main).not.toContainText('LATEST BRIEFS');
      await expect(main).not.toContainText('最近同步的24篇');
      await expect(page.locator('footer.footer')).toContainText('湘ICP备2026041143号-1');
      await expect(page.locator('footer.footer')).toContainText('湘公网安备43020002000443号');
    });

    test('yearly CN brief directory matches international cards, metadata and live filtering',async({page})=>{
      await open(page,'/briefs/archive/year/2026/');
      const root=page.locator('body[data-qily-brief-year-catalog="v2"]');
      const grid=root.locator('#briefCuratedGrid');
      const cards=grid.locator('.brief-index-card');
      const expected=fs.readdirSync(path.join(CN,'briefs/archive'))
        .filter(x=>/^2026-\d{2}-\d{2}$/.test(x)).length;
      expect(expected).toBeGreaterThan(30);
      await expect(cards).toHaveCount(expected);
      await expect(root.locator('#briefFilterStatus')).toContainText('当前 '+BRIEF_COUNT+' 篇精选');
      await expect(root.locator('#briefFilterStatus')).toContainText('2026年 '+expected+' 篇');
      const reference=cards.filter({has:page.locator('time[datetime="2026-09-28"]')});
      await expect(reference.locator('.brief-index-meta span')).toContainText('生产计划闭环与产能经营');
      await expect(reference.locator('.brief-index-summary')).toContainText('净需求');
      await expect(reference.locator('h2 a')).toHaveAttribute('href','/briefs/archive/2026-09-28/');
      await expect(reference.locator('.brief-index-actions a')).toHaveAttribute('href','/briefs/archive/2026-09-28/');
      const columns=await grid.evaluate(el=>getComputedStyle(el).gridTemplateColumns.trim().split(/\s+/).length);
      expect(columns).toBe(device.name==='mobile'?1:2);
      const search=root.locator('#briefSearch');
      await expect(search).toHaveAttribute('placeholder','例如：NPI、SMED、标准工时、PMO');
      await search.fill('2026-09-28');
      await expect(grid.locator('.brief-index-card:visible')).toHaveCount(1);
      await expect(root.locator('#briefFilterStatus')).toContainText('找到 1 篇相关精选');
      await search.fill('不可能匹配的目录字段_7x8q');
      await expect(grid.locator('.brief-index-card:visible')).toHaveCount(0);
      await search.fill('');
      await expect(grid.locator('.brief-index-card:visible')).toHaveCount(expected);
      await expect(root.locator('main a[href*="qilylean.com"]')).toHaveCount(0);
      await expect(root.locator('footer.footer')).toContainText('湘ICP备2026041143号-1');
      await expect(root.locator('footer.footer')).toContainText('湘公网安备43020002000443号');
    });

    test('2026-09-04 role card typography follows the international approved sample',async({page,context})=>{
      await open(page,'/briefs/archive/2026-09-04/');
      const row=page.locator('main[data-qily-brief-content="v2"] #selected-brief .brief-topic-statement');
      const summary=row.locator('article.brief-asset-card');
      const side=row.locator('aside.brief-role-shift[aria-label="角色升级方向"]');
      await expect(summary).toBeVisible();
      await expect(side).toBeVisible();
      await expect(side.locator('strong')).toContainText('制造系统设计者');
      const geometry=await side.evaluate(node=>{
        const side=node.getBoundingClientRect();
        const article=node.parentElement.querySelector('article.brief-asset-card').getBoundingClientRect();
        const css=getComputedStyle(node);
        const title=getComputedStyle(node.querySelector('strong'));
        return {
          side:{x:side.x,y:side.y,width:side.width,height:side.height},
          article:{x:article.x,y:article.y,width:article.width,height:article.height},
          bg:css.backgroundImage,color:css.color,layout:css.display,
          titleColor:title.color,titleSize:parseFloat(title.fontSize),
          labelSize:parseFloat(getComputedStyle(node.querySelector('small')).fontSize),
          descriptionSize:parseFloat(getComputedStyle(node.querySelector('span')).fontSize),
          overflow:document.documentElement.scrollWidth-innerWidth
        };
      });
      expect(geometry.layout,'role panel follows the approved international grid layout').toBe('grid');
      expect(geometry.bg,'role panel retains a dark gradient background').toContain('gradient');
      expect(geometry.titleColor,'role heading uses readable gold against dark background').toBe('rgb(255, 227, 155)');
      expect(geometry.titleSize,'role title must not grow beyond the international heading scale').toBeLessThanOrEqual(24);
      const source=await context.newPage();
      try{
        const globalBase=process.env.QILY_GLOBAL_BASE||'http://127.0.0.1:4175';
        const response=await source.goto(globalBase+'/qilylean/daily/2026-09-04.html',{waitUntil:'domcontentloaded'});
        expect(response&&response.ok(),'international sample must load').toBeTruthy();
        await expect(source.locator('aside.brief-role-shift strong')).toBeVisible();
        await source.waitForTimeout(1200);
        await source.evaluate(()=>document.fonts.ready);
        const reference=await source.locator('aside.brief-role-shift').evaluate(node=>({
          strong:parseFloat(getComputedStyle(node.querySelector('strong')).fontSize),
          small:parseFloat(getComputedStyle(node.querySelector('small')).fontSize),
          span:parseFloat(getComputedStyle(node.querySelector('span')).fontSize)
        }));
        expect(Math.abs(geometry.titleSize-reference.strong),'CN role heading vs international: '+JSON.stringify({cn:geometry.titleSize,global:reference.strong})).toBeLessThanOrEqual(2);
        expect(geometry.labelSize,'China site-wide small-caption floor must remain intact').toBe(18);
        expect(Math.abs(geometry.labelSize-reference.small),'CN role label remains within the cross-site small-label VI band').toBeLessThanOrEqual(4);
        expect(geometry.descriptionSize,'CN role description must not exceed international size by more than 2px').toBeLessThanOrEqual(reference.span+2);
      }finally{
        await source.close();
      }
      expect(geometry.side.width,'the role panel cannot collapse to loose text').toBeGreaterThan(200);
      expect(geometry.side.height,'the role panel retains card geometry').toBeGreaterThan(180);
      expect(geometry.overflow,'the layout does not overflow the viewport horizontally').toBeLessThanOrEqual(1);
      if(device.name==='desktop'){
        expect(geometry.side.x,'aside remains to the right of the abstract card').toBeGreaterThan(geometry.article.x+geometry.article.width);
        expect(Math.abs(geometry.side.y-geometry.article.y),'desktop cards start at the same row').toBeLessThanOrEqual(5);
      }else{
        expect(geometry.side.y,'mobile card stacks after the abstract').toBeGreaterThanOrEqual(geometry.article.y+geometry.article.height-2);
      }
    });

    test('resource directory clones public international layout and keeps only the isolated entry',async({page,context})=>{
      await open(page,'/resources/');
      const root=page.locator('main[data-qily-public-tech-directory="v2"]');
      await expect(root.locator('#companyGrid .card')).toHaveCount(100);
      await expect(root.locator('#filters button')).toHaveCount(6);
      await expect(root.locator('#qilyChinaKnowledgeBridge a')).toHaveText('进入国际站 ↗');
      await expect(root.locator('#qilyChinaKnowledgeBridge a')).toHaveAttribute('href','https://qilylean.com/links/cn-public/');
      await expect(root.locator('#navigationPartnerLinks a')).toHaveAttribute('href','https://www.hao123.com/');
      await expect(root.locator('#industryResourceService,#industry-resource-network,form,a[href*="/cooperation/"],a[href*="/links/onboarding/"]')).toHaveCount(0);
      await expect(page.locator('footer.footer')).toContainText('湘ICP备2026041143号-1');
      await expect(page.locator('footer.footer')).toContainText('湘公网安备43020002000443号');
      fs.mkdirSync('visual-cn-typography-v23',{recursive:true});
      await page.screenshot({path:'visual-cn-typography-v23/resources-'+device.name+'-top.png'});

      const reference=await context.newPage();
      const globalBase=process.env.QILY_GLOBAL_BASE||'http://127.0.0.1:4175';
      await reference.goto(globalBase+'/links/',{waitUntil:'networkidle'});
      // International shell owners finish their last presentation pass at
      // 1400ms. Compare the settled source cascade, not an intermediate frame.
      await reference.waitForTimeout(1800);
      await reference.evaluate(()=>document.fonts.ready);
      await reference.screenshot({path:'visual-cn-typography-v23/resources-reference-'+device.name+'-top.png'});
      const selectors=['.hero','.hero-inner','.eyebrow','h1','.lead','.stat','.stat strong','.stat span','.section','.inner','.notice','#navigationPartnerLinks a','#qilyChinaKnowledgeBridge a','.toolbar','.search','.filters','.filter','.grid','.card','.card h2','.mark','.cn','.meta','.tag'];
      for(const selector of selectors){
        const measure=el=>{const cs=getComputedStyle(el);const props=['fontSize','lineHeight','fontWeight','fontFamily','letterSpacing','color','webkitTextFillColor','backgroundColor','backgroundImage','display','paddingTop','paddingBottom','paddingLeft','paddingRight','marginTop','marginBottom','borderTopWidth','borderRadius','gap'];return Object.fromEntries(props.map(p=>[p,cs[p]]));};
        const expected=await reference.locator('main '+selector).first().evaluate(measure);
        const actual=await root.locator(selector).first().evaluate(measure);
        expect.soft(actual,'international computed styles: '+selector).toEqual(expected);
      }
      for(const selector of ['.hero-inner','.inner','.toolbar','.grid']){
        const sourceWidth=await reference.locator('main '+selector).first().evaluate(el=>el.getBoundingClientRect().width);
        const chinaWidth=await root.locator(selector).first().evaluate(el=>el.getBoundingClientRect().width);
        expect.soft(chinaWidth,'international content width: '+selector).toBeCloseTo(sourceWidth,1);
      }
      const sourceLinks=await reference.locator('#companyGrid .card').evaluateAll(nodes=>nodes.map(a=>a.href));
      expect(await root.locator('#companyGrid .card').evaluateAll(nodes=>nodes.map(a=>a.href))).toEqual(sourceLinks);
      await reference.close();
      await root.locator('#searchInput').fill('台积电');
      await expect(root.locator('#companyGrid .card')).toHaveCount(1);
      await root.locator('#searchInput').fill('__CN_DIRECTORY_NO_MATCH__');
      await expect(root.locator('#companyGrid .card')).toHaveCount(0);
      await expect(root.locator('#emptyState')).toBeVisible();
      await root.locator('#searchInput').fill('');
      await root.locator('#filters button').filter({hasText:'半导体'}).click();
      const count=await root.locator('#companyGrid .card').count();
      expect(count).toBeGreaterThan(0);expect(count).toBeLessThan(100);
      await root.locator('#filters button').filter({hasText:'全部'}).click();
      await expect(root.locator('#companyGrid .card')).toHaveCount(100);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no horizontal page overflow').toBe(true);
      await root.locator('#companyGrid').scrollIntoViewIfNeeded();
      await page.screenshot({path:'visual-cn-typography-v23/resources-'+device.name+'-cards.png'});
    });

    test('terminology search handles a match, no results and clearing',async({page})=>{
      await open(page,TERM);
      const search=page.locator('#termSearch');
      const results=page.locator('#termSearchGrid .term-search-hit');
      await expect(search).toBeVisible();
      await expect(page.locator('.mirror-article-fidelity [data-term-card]')).toHaveCount(LESSONS);
      await search.fill('ＳＭＥＤ');
      await expect.poll(()=>results.count()).toBeGreaterThan(0);
      await expect(results.first().locator('.term-code')).toHaveText('SMED');
      await expect(page.locator('#termCount')).toContainText('找到');
      await search.fill('__CN_NO_SUCH_TERM_20261012__');
      await expect(page.locator('#termEmpty')).toBeVisible();
      await expect(results).toHaveCount(0);
      await expect(page.locator('#termCount')).toHaveText('未找到相关术语');
      await search.fill('');
      await expect(page.locator('#termEmpty')).toBeHidden();
      await expect(page.locator('.term-search-results')).toBeHidden();
      await expect(page.locator('.mirror-article-fidelity [data-term-card]')).toHaveCount(LESSONS);
      await expect(page.locator('#engineering')).toBeVisible();
    });

    test('SMED deep link opens its lesson and returns to the full list',async({page})=>{
      await open(page,TERM+'?opl=SMED#engineering');
      const modal=page.locator('#termOplModal');
      await expect(modal).toBeVisible();
      await expect(page.locator('#termOplTitle')).toContainText('SMED｜');
      await expect(page.locator('#termOplPage')).toContainText('／'+LESSONS);
      await expect(page.locator('#termOplContent')).toContainText('制造现场案例');
      await expect(page.locator('header.site-header')).toBeVisible();
      await expect(modal.locator('a[href^="mailto:"],a[href^="tel:"],.term-opl-contact-card')).toHaveCount(0);
      await modal.locator('[data-opl-print]').click();
      await expect.poll(()=>page.evaluate(()=>window.__qilyPublicPrintCalls)).toBe(1);
      await modal.locator('[data-opl-close].term-opl-close').click();
      await expect(page).toHaveURL(BASE+TERM);
      await expect(page.locator('#termSearch')).toBeVisible();
      await expect(page.locator('.mirror-article-fidelity [data-term-card]')).toHaveCount(LESSONS);
    });

    for(const entry of [
      {name:'factory plans',route:'/archive/practice/factory-layout/',selector:'button[data-plan-preview]',count:9},
      {name:'organization previews',route:'/archive/reference/production-operations-organization/',selector:'button.preview-open',count:29},
    ]){
      test(entry.name+' switch, close and restore keyboard focus',async({page})=>{
        await open(page,entry.route);
        const triggers=page.locator('.mirror-article-fidelity '+entry.selector);
        await expect(triggers).toHaveCount(entry.count);
        const trigger=triggers.first();
        await trigger.click();
        const viewer=page.locator('.qily-public-preview');
        await expect(viewer).toBeVisible();
        await expect.poll(()=>viewer.locator('img').evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
        const firstTitle=await viewer.locator('h2').textContent();
        await viewer.locator('[data-preview-action="previous"]').click();
        await expect(viewer.locator('h2')).not.toHaveText(firstTitle);
        await expect.poll(()=>viewer.locator('img').evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
        await expect(viewer.locator('[role="status"]')).toContainText('第 '+entry.count+' / '+entry.count+' 张');
        await viewer.locator('[data-preview-action="close"]').click();
        await expect(viewer).toBeHidden();
        await expect(trigger).toBeFocused();
        await trigger.click();
        await page.keyboard.press('Escape');
        await expect(viewer).toBeHidden();
        await expect(trigger).toBeFocused();
      });
    }

    test('historical lesson print controls call the browser print action',async({page})=>{
      for(const route of ['/archive/knowledge/pdca-gantt-milestone-opl/','/archive/knowledge/terminology/mtbf/','/archive/knowledge/terminology/mttr/']){
        await open(page,route);
        const button=page.locator('.mirror-article-fidelity button[data-public-print]');
        await expect(button).toHaveCount(1);
        await expect(button).toBeVisible();
        await button.click();
        await expect.poll(()=>page.evaluate(()=>window.__qilyPublicPrintCalls)).toBe(1);
      }
    });

    test('local brief index restores q filtering and date navigation',async({page})=>{
      await open(page,INDEX+'?q=SMED');
      await expect(page.locator('#cnPublicBriefSearch')).toHaveValue('SMED');
      const visible=page.locator('[data-brief-date]:visible');
      await expect.poll(()=>visible.count()).toBeGreaterThan(0);
      expect(await visible.count()).toBeLessThan(BRIEF_COUNT);
      await expect(page.locator('#cnPublicBriefCount')).toContainText('相关简报');
      await page.locator('#cnPublicBriefSearch').fill('');
      await expect(visible).toHaveCount(BRIEF_COUNT);
      await open(page,INDEX+'?date=2026-08-25');
      await expect(page).toHaveURL(BASE+'/briefs/archive/2026-08-25/');
      await expect(page.locator('main#main[data-qily-brief-content="v2"]')).toBeVisible();
    });

    test('library links reach complete resources below the sticky header',async({page})=>{
      await open(page,'/archive/global-knowledge/library/');
      await page.getByRole('link',{name:/流程改善/}).click();
      await expect(page).toHaveURL(BASE+'/archive/reference/lean-tools/#flow');
      await expect(page.locator('.mirror-article-fidelity article.card')).toHaveCount(10);
      await expect.poll(()=>page.evaluate(()=>{
        const target=document.querySelector('#flow').getBoundingClientRect();
        const header=document.querySelector('header').getBoundingClientRect();
        return target.top>=header.bottom-1&&target.top<header.bottom+200;
      }),{timeout:5000}).toBe(true);
      await open(page,'/archive/reference/execution-loop/');
      await expect(page.locator('.mirror-article-fidelity article.card')).toHaveCount(8);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    });
  });
}

test('all 44 reference canvases have real assets and each collection draws its first page',async({page})=>{
  const collections=[
    {route:'/archive/reference/reference-audit-documents/',count:11,key:'QilyLeanPreview2026'},
    {route:'/archive/reference/reference-iatf16949-core-tools/',count:6,key:'QilyLeanPreview2026'},
    {route:'/archive/reference/reference-materials/',count:13,key:'QilyLeanPreview2026'},
    {route:'/archive/reference/reference-one-piece-flow/',count:14,key:'QilyLeanFlowPreview2026'},
  ];
  let checked=0;
  for(const collection of collections){
    await open(page,collection.route);
    const canvases=page.locator('.mirror-article-fidelity canvas[data-src]');
    await expect(canvases).toHaveCount(collection.count);
    const assets=await canvases.evaluateAll(nodes=>nodes.map(n=>({src:n.getAttribute('data-src'),key:n.getAttribute('data-preview-key')})));
    for(const asset of assets){
      expect(asset.src).toMatch(/^\/mirror-media\/qilylean\/reference\/[^?#]+\.qly$/);
      expect(asset.key).toBe(collection.key);
      const bytes=fs.readFileSync(repositoryAsset(new URL(asset.src,BASE).href));
      expect(bytes.length).toBeGreaterThan(1000);
      expect(bytes[0]^asset.key.charCodeAt(0),'reference asset decodes to JPEG').toBe(0xff);
      expect(bytes[1]^asset.key.charCodeAt(1),'reference asset decodes to JPEG').toBe(0xd8);
      checked++;
    }
    const first=canvases.first();
    await first.scrollIntoViewIfNeeded();
    await expect(first).toHaveAttribute('data-loaded','1',{timeout:15000});
    const drawn=await first.evaluate(canvas=>({width:canvas.width,height:canvas.height,alpha:canvas.getContext('2d').getImageData(0,0,1,1).data[3]}));
    expect(drawn.width).toBeGreaterThan(500);
    expect(drawn.height).toBeGreaterThan(500);
    expect(drawn.alpha).toBe(255);
  }
  expect(checked).toBe(44);
});
