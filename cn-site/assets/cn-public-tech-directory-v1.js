/* QILY-CN-PUBLIC-TECH-DIRECTORY-V2 | international SSOT */
(function(){
    'use strict';
    var rows=`Google / Alphabet|谷歌 / Alphabet|AI云软件|美国|https://about.google/
Microsoft|微软|AI云软件|美国|https://www.microsoft.com/
OpenAI|OpenAI|AI云软件|美国|https://openai.com/
Amazon|亚马逊|AI云软件|美国|https://www.amazon.com/
IBM|IBM|AI云软件|美国|https://www.ibm.com/
Oracle|甲骨文|AI云软件|美国|https://www.oracle.com/
SAP|SAP|AI云软件|德国|https://www.sap.com/
Salesforce|赛富时|AI云软件|美国|https://www.salesforce.com/
Adobe|奥多比|AI云软件|美国|https://www.adobe.com/
ServiceNow|ServiceNow|AI云软件|美国|https://www.servicenow.com/
Palantir|帕兰提尔|AI云软件|美国|https://www.palantir.com/
Snowflake|Snowflake|AI云软件|美国|https://www.snowflake.com/
Cloudflare|Cloudflare|AI云软件|美国|https://www.cloudflare.com/
CrowdStrike|CrowdStrike|AI云软件|美国|https://www.crowdstrike.com/
Palo Alto Networks|派拓网络|AI云软件|美国|https://www.paloaltonetworks.com/
Fortinet|飞塔|AI云软件|美国|https://www.fortinet.com/
Synopsys|新思科技|AI云软件|美国|https://www.synopsys.com/
Cadence|楷登电子|AI云软件|美国|https://www.cadence.com/
Arm|安谋|AI云软件|英国|https://www.arm.com/
GitHub|GitHub|AI云软件|美国|https://github.com/
NVIDIA|英伟达|半导体|美国|https://www.nvidia.com/
TSMC|台积电|半导体|中国台湾|https://www.tsmc.com/
Samsung Electronics|三星电子|半导体|韩国|https://www.samsung.com/
Intel|英特尔|半导体|美国|https://www.intel.com/
AMD|超威半导体|半导体|美国|https://www.amd.com/
Broadcom|博通|半导体|美国|https://www.broadcom.com/
Qualcomm|高通|半导体|美国|https://www.qualcomm.com/
ASML|阿斯麦|半导体|荷兰|https://www.asml.com/
Applied Materials|应用材料|半导体|美国|https://www.appliedmaterials.com/
Lam Research|泛林集团|半导体|美国|https://www.lamresearch.com/
KLA|科磊|半导体|美国|https://www.kla.com/
Micron Technology|美光科技|半导体|美国|https://www.micron.com/
SK hynix|SK海力士|半导体|韩国|https://www.skhynix.com/
Texas Instruments|德州仪器|半导体|美国|https://www.ti.com/
Analog Devices|亚德诺|半导体|美国|https://www.analog.com/
NXP Semiconductors|恩智浦|半导体|荷兰|https://www.nxp.com/
Infineon|英飞凌|半导体|德国|https://www.infineon.com/
STMicroelectronics|意法半导体|半导体|瑞士|https://www.st.com/
Renesas Electronics|瑞萨电子|半导体|日本|https://www.renesas.com/
MediaTek|联发科技|半导体|中国台湾|https://www.mediatek.com/
Marvell Technology|迈威尔科技|半导体|美国|https://www.marvell.com/
GlobalFoundries|格芯|半导体|美国|https://gf.com/
UMC|联华电子|半导体|中国台湾|https://www.umc.com/
ASE Technology|日月光投控|半导体|中国台湾|https://www.aseglobal.com/
Tokyo Electron|东京电子|半导体|日本|https://www.tel.com/
Advantest|爱德万测试|半导体|日本|https://www.advantest.com/
Teradyne|泰瑞达|半导体|美国|https://www.teradyne.com/
ROHM Semiconductor|罗姆半导体|半导体|日本|https://www.rohm.com/
onsemi|安森美|半导体|美国|https://www.onsemi.com/
Monolithic Power Systems|芯源系统|半导体|美国|https://www.monolithicpower.com/
Apple|苹果|硬件工业|美国|https://www.apple.com/
Cisco|思科|硬件工业|美国|https://www.cisco.com/
Dell Technologies|戴尔科技|硬件工业|美国|https://www.dell.com/
HP Inc.|惠普|硬件工业|美国|https://www.hp.com/
Lenovo|联想集团|硬件工业|中国|https://www.lenovo.com/
Sony|索尼|硬件工业|日本|https://www.sony.com/
Panasonic Holdings|松下控股|硬件工业|日本|https://holdings.panasonic/
Hitachi|日立|硬件工业|日本|https://www.hitachi.com/
Toshiba|东芝|硬件工业|日本|https://www.global.toshiba/
Siemens|西门子|硬件工业|德国|https://www.siemens.com/
Schneider Electric|施耐德电气|硬件工业|法国|https://www.se.com/
ABB|ABB|硬件工业|瑞士|https://global.abb/
Honeywell|霍尼韦尔|硬件工业|美国|https://www.honeywell.com/
Rockwell Automation|罗克韦尔自动化|硬件工业|美国|https://www.rockwellautomation.com/
Mitsubishi Electric|三菱电机|硬件工业|日本|https://www.mitsubishielectric.com/
KEYENCE|基恩士|硬件工业|日本|https://www.keyence.com/
FANUC|发那科|硬件工业|日本|https://www.fanuc.co.jp/eindex.html
Bosch|博世|硬件工业|德国|https://www.bosch.com/
Foxconn|富士康科技集团|硬件工业|中国台湾|https://www.foxconn.com/
Pegatron|和硕联合科技|硬件工业|中国台湾|https://www.pegatroncorp.com/
Quanta Computer|广达电脑|硬件工业|中国台湾|https://www.quantatw.com/
Acer|宏碁|硬件工业|中国台湾|https://www.acer.com/
Logitech|罗技|硬件工业|瑞士|https://www.logitech.com/
Arista Networks|Arista Networks|硬件工业|美国|https://www.arista.com/
Nokia|诺基亚|硬件工业|芬兰|https://www.nokia.com/
Tesla|特斯拉|前沿科技|美国|https://www.tesla.com/
SpaceX|太空探索技术公司|前沿科技|美国|https://www.spacex.com/
xAI|xAI|前沿科技|美国|https://x.ai/
Neuralink|Neuralink|前沿科技|美国|https://neuralink.com/
The Boring Company|无聊公司|前沿科技|美国|https://www.boringcompany.com/
X|X|前沿科技|美国|https://x.com/
Rocket Lab|火箭实验室|前沿科技|美国|https://www.rocketlabusa.com/
Blue Origin|蓝色起源|前沿科技|美国|https://www.blueorigin.com/
Boston Dynamics|波士顿动力|前沿科技|美国|https://bostondynamics.com/
Rivian|Rivian|前沿科技|美国|https://rivian.com/
Huawei|华为|中国硬科技|中国|https://www.huawei.com/
ZTE|中兴通讯|中国硬科技|中国|https://www.zte.com.cn/
Xiaomi|小米集团|中国硬科技|中国|https://www.mi.com/
BYD|比亚迪|中国硬科技|中国|https://www.bydglobal.com/
CATL|宁德时代|中国硬科技|中国|https://www.catl.com/
SMIC|中芯国际|中国硬科技|中国|https://www.smics.com/
YMTC|长江存储|中国硬科技|中国|https://www.ymtc.com/
CXMT|长鑫存储|中国硬科技|中国|https://www.cxmt.com/
NAURA Technology|北方华创|中国硬科技|中国|https://www.naura.com/
AMEC|中微公司|中国硬科技|中国|https://www.amec-inc.com/
BOE Technology|京东方|中国硬科技|中国|https://www.boe.com/
DJI|大疆创新|中国硬科技|中国|https://www.dji.com/
Inspur|浪潮信息|中国硬科技|中国|https://www.inspur.com/
H3C|新华三|中国硬科技|中国|https://www.h3c.com/
Hikvision|海康威视|中国硬科技|中国|https://www.hikvision.com/`;
    var companies=rows.trim().split('\n').map(function(row){var p=row.split('|');return{name:p[0],cn:p[1],category:p[2],country:p[3],url:p[4]};});
    var categories=['全部','AI云软件','半导体','硬件工业','前沿科技','中国硬科技'];
    var active='全部';
    var input=document.getElementById('searchInput');var grid=document.getElementById('companyGrid');var filters=document.getElementById('filters');var result=document.getElementById('resultText');var empty=document.getElementById('emptyState');
    function escapeHtml(value){return value.replace(/[&<>"']/g,function(ch){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];});}
    function mark(name){var clean=name.replace(/[^A-Za-z0-9]/g,'');return(clean.slice(0,2)||'QL').toUpperCase();}
    function render(){var key=(input.value||'').trim().toLowerCase();var list=companies.filter(function(item){var matchCategory=active==='全部'||item.category===active;var text=(item.name+' '+item.cn+' '+item.category+' '+item.country).toLowerCase();return matchCategory&&(!key||text.indexOf(key)!==-1);});grid.innerHTML=list.map(function(item){return'<a class="card" href="'+escapeHtml(item.url)+'" target="_blank" rel="noopener noreferrer" aria-label="访问 '+escapeHtml(item.cn)+' 官方网站"><div class="card-head"><span class="mark">'+mark(item.name)+'</span><span class="external" aria-hidden="true">↗</span></div><h2>'+escapeHtml(item.name)+'</h2><div class="cn">'+escapeHtml(item.cn)+'</div><div class="meta"><span class="tag">'+escapeHtml(item.category)+'</span><span class="tag">'+escapeHtml(item.country)+'</span></div></a>';}).join('');result.textContent='当前显示 '+list.length+' 家企业';empty.style.setProperty('display',list.length?'none':'block','important');}
    categories.forEach(function(category){var button=document.createElement('button');button.type='button';button.className='filter'+(category==='全部'?' active':'');button.textContent=category;button.addEventListener('click',function(){active=category;filters.querySelectorAll('.filter').forEach(function(item){item.classList.toggle('active',item===button);});render();});filters.appendChild(button);});
    input.addEventListener('input',render);document.getElementById('totalCount').textContent=companies.length;render();
  })();
