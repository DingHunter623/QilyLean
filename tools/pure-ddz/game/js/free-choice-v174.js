(() => {
  'use strict';
  if(window.__qilyDdzFreeChoiceV174)return;
  window.__qilyDdzFreeChoiceV174=true;

  const VERSION='1.7.4';
  let hintActive=false;
  let hintIds=new Set();
  let internal=false;

  const selectedCards=()=>[...document.querySelectorAll('#hand .card[aria-pressed="true"]')];
  const selectedIds=()=>new Set(selectedCards().map(card=>String(card.dataset.id||'')).filter(Boolean));

  function clearSelectedExcept(keepId=null){
    internal=true;
    try{
      let guard=64;
      while(guard-->0){
        const selected=selectedCards();
        const target=selected.find(card=>keepId===null||String(card.dataset.id)!==String(keepId));
        if(!target)break;
        target.click();
      }
    }finally{internal=false;}
  }

  function captureHint(){
    hintIds=selectedIds();
    hintActive=hintIds.size>0;
  }

  function resetHint(){
    hintActive=false;
    hintIds.clear();
  }

  /*
   * V174｜真正的自主出牌
   * 1. 监听器挂在 document，而不是“启力提示”按钮本身，避免按钮被 V168 cloneNode 替换后丢失监听。
   * 2. 启力提示只负责给出默认选择；玩家第一次点另一张牌时，以玩家点击为最高优先级。
   * 3. 清除提示牌发生在原生 card click 完成、手牌重绘之后，绝不在 pointerdown 阶段吃掉真实点击。
   * 4. “不要”后立即清掉所有已抬起牌。
   */
  document.addEventListener('click',event=>{
    if(internal)return;

    const hint=event.target.closest?.('#hint');
    if(hint){
      setTimeout(captureHint,0);
      return;
    }

    const pass=event.target.closest?.('#pass');
    if(pass){
      setTimeout(()=>clearSelectedExcept(null),0);
      resetHint();
      return;
    }

    const reset=event.target.closest?.('#play,#start,#again,#welcome-start');
    if(reset){
      resetHint();
      return;
    }

    if(!hintActive)return;
    const card=event.target.closest?.('#hand .card');
    if(!card)return;

    const targetId=String(card.dataset.id||'');
    if(!targetId)return;
    const wasHintCard=hintIds.has(targetId);
    resetHint();

    /*
     * 原生 card click 已经先执行并 render() 了：
     * - 点的是提示外新牌：只保留玩家刚点的牌，彻底摆脱 AI 默认方案；
     * - 点的是提示内牌：保留玩家刚刚完成的增删结果，后续继续完全自由多选。
     */
    if(!wasHintCard)setTimeout(()=>clearSelectedExcept(targetId),0);
  },false);

  /* 额外保险：任何回合切换后都不允许残留“提示锁定”状态。 */
  const timer=setInterval(()=>{
    try{
      const state=window.PureDDZTest?.getState?.();
      if(!state||state.phase!=='playing'||state.current!==0)resetHint();
    }catch(_error){}
  },250);
  window.addEventListener('pagehide',()=>clearInterval(timer),{once:true});

  window.QilyLeanDdzFreeChoiceV174=Object.freeze({
    version:VERSION,
    captureHint,
    clearSelectedExcept,
    resetHint
  });
})();
