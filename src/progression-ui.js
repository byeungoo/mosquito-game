import { UPGRADES, SKILL_FORMS } from './upgrades.js';

export function setupProgression({game,pause,resume,onSelect}) {
  const $=id=>document.getElementById(id), dialog=$('upgrade-dialog');
  let resumeAfter=false, lastBuild='';
  function refresh() {
    $('upgrade-open').hidden=!game.upgradeOffer.length;
    const build=JSON.stringify(game.upgrades)+game.wardSpent;
    if(build===lastBuild)return;lastBuild=build;
    $('run-upgrades').replaceChildren();
    const owned=UPGRADES.filter(p=>game.upgrades[p.id]);
    $('build-empty').hidden=owned.length>0;
    for(const p of owned){
      const chip=document.createElement('span');chip.className='upgrade-chip';
      chip.textContent=`${p.name} ${game.upgrades[p.id]}${p.id==='ward'&&game.wardSpent?' · 소진':''}`;
      chip.title=p.description;$('run-upgrades').append(chip);
    }
  }
  function open() {
    if(!['playing','paused'].includes(game.status) || !game.upgradeOffer.length || dialog.open || document.querySelector('dialog[open]'))return;
    resumeAfter=game.status==='playing';if(resumeAfter)pause();
    $('upgrade-wave').textContent=`WAVE ${game.upgradeWave} 보급 · 이번 판에 계속 적용`;
    $('upgrade-options').replaceChildren();
    for(const id of game.upgradeOffer) {
      const p=UPGRADES.find(p=>p.id===id),button=document.createElement('button');
      button.className='upgrade-option';button.type='button';
      const current=game.upgrades[id]||0,next=current+1;
      button.innerHTML=`<span class="upgrade-category">${p.category}${p.weapon?' · 이펙트 진화':''}</span><svg aria-hidden="true"><use href="#i-${p.icon}"/></svg><strong>${p.name}</strong><span class="upgrade-rank">LV ${current} → ${next} / ${p.max}</span><span class="upgrade-description">${p.description}${p.weapon?`<br><b>✦ ${SKILL_FORMS[p.weapon][next-1]}</b> · 같은 기술을 3회까지 강화`:''}</span><span class="upgrade-choose">이 강화 선택 →</span>`;
      button.addEventListener('click',()=>{
        if(!game.chooseUpgrade(id))return;
        refresh();dialog.close();onSelect(p);
      });$('upgrade-options').append(button);
    }
    dialog.showModal();
  }
  $('upgrade-open').addEventListener('click',open);
  $('upgrade-later').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{if(resumeAfter)resume();resumeAfter=false;});
  refresh();return {open,refresh};
}
