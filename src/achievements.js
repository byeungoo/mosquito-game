export const ACHIEVEMENTS = [
  {id:'hunter',name:'연못 청소부',description:'한 판에서 모기 100마리 처치',goal:100,value:g=>g.kills,icon:'net'},
  {id:'chain',name:'끊기지 않는 손놀림',description:'24연속 처치 달성',goal:24,value:g=>g.bestStreak,icon:'bolt'},
  {id:'queen',name:'왕관 파괴자',description:'재앙의 여왕 첫 처치',goal:1,value:g=>g.bossKills,icon:'dragon'},
  {id:'wave',name:'한계를 넘어서',description:'WAVE 10 도달',goal:10,value:g=>g.level,icon:'meteor'},
  {id:'squad',name:'연못 사령관',description:'미꾸라지와 개구리 합계 10마리 배치',goal:10,value:g=>g.allies.length,icon:'frog'},
  {id:'daily',name:'오늘도 출동',description:'오늘의 연못에서 WAVE 5 도달',goal:5,value:(g,mode)=>mode==='daily'?g.level:0,icon:'palm'},
];
export function newAchievements(game,mode,owned) {
  return ACHIEVEMENTS.filter(a=>!owned.includes(a.id) && a.value(game,mode)>=a.goal);
}
export function setupAchievements({game,mode,pause,resume,onUnlock}) {
  const $=id=>document.getElementById(id);let owned=[];
  try {const data=JSON.parse(localStorage.getItem('pond-medals-v1')||'[]');if(Array.isArray(data))owned=ACHIEVEMENTS.filter(a=>data.includes(a.id)).map(a=>a.id);} catch { /* Optional storage. */ }
  function label() {$('medals-btn').textContent=`수비대 훈장 · ${owned.length}/${ACHIEVEMENTS.length} ↗`;}
  function check() {
    if(!['playing','lost'].includes(game.status))return;
    const unlocked=newAchievements(game,mode(),owned);if(!unlocked.length)return;
    owned.push(...unlocked.map(a=>a.id));
    try {localStorage.setItem('pond-medals-v1',JSON.stringify(owned));} catch { /* Optional storage. */ }
    label();onUnlock(unlocked);
  }
  let wasPlaying=false;
  $('medals-btn').addEventListener('click',()=>{
    wasPlaying=game.status==='playing';if(wasPlaying)pause();
    $('medals-list').replaceChildren();
    for(const a of ACHIEVEMENTS) {
      const earned=owned.includes(a.id),value=Math.min(a.goal,a.value(game,mode())),card=document.createElement('article');
      card.className=`medal-card${earned?' earned':''}`;
      card.innerHTML=`<svg aria-hidden="true"><use href="#i-${a.icon}"/></svg><div><strong>${a.name}</strong><p>${a.description}</p><span>${earned?'획득 완료':`이번 판 ${value} / ${a.goal}`}</span></div>`;
      $('medals-list').append(card);
    }
    $('medals-dialog').showModal();
  });
  $('close-medals-btn').addEventListener('click',()=>$('medals-dialog').close());
  $('medals-dialog').addEventListener('close',()=>{if(wasPlaying)resume();wasPlaying=false;});
  label();return {check};
}
