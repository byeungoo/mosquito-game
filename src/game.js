import { PondAudio } from './audio.js';
import { drawSkillEvolution, drawEvolvedFlame, drawEvolvedBolt, drawPalmEchoes } from './skill-effects.js';
import { SKILL_FORMS } from './upgrades.js';
import { bindPondPointer } from './pointer.js';
import { dailyChallenge, seededRandom, saveDailyRecord } from './daily.js';
import { setupAchievements } from './achievements.js';
import { setupProgression } from './progression-ui.js';
import { drawDragonSummon, drawThunderstorm, drawBigBang, drawTimeStop } from './spectacle.js';
import { SPECIES, speciesOf, drawMonster } from './monsters.js';
import { setupSharing } from './share.js';
import { PondGame, WEAPONS, stageOf, THREAT_LIMIT, EVOLUTIONS, evolutionOf, ALLY_LIMITS } from './core.js';

const $ = id => document.getElementById(id);
const canvas = $('game-canvas'), ctx = canvas.getContext('2d');
const game = new PondGame();
let width = 0, height = 0, sx = 1, sy = 1, unit = 1, dpr = 1;
let selected = 'net', lastTime = 0, visualTime = 0, pointer = { x: 500, y: 390, down: false, inside: false };
let pondInput;
let effects = [], particles = [], floating = [], shake = 0, toastTimer = 0, announcementTimer = 0, flash = 0, flashColor = '255,230,150';
const sound = new PondAudio();
let helpPaused = false, best = { score: 0, level: 1, kills: 0 };
let runMode='endless', challenge=null, dailyRecords={};
try { dailyRecords=JSON.parse(localStorage.getItem('pond-daily-v1') || '{}') || {}; } catch { /* Storage is optional. */ }
function refreshDailyCard() {
  const today=dailyChallenge(),record=dailyRecords[today.date];
  $('daily-description').textContent=`${today.name} · ${today.description}`;
  $('daily-record').textContent=Number.isFinite(record?.score)?`오늘 최고 ${record.score}점 · W${record.level}`:'매일 한국 시간 자정 갱신 · 기기별 기록';
}
refreshDailyCard();
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
try { const stored = JSON.parse(localStorage.getItem('pond-defense-endless-v2') || 'null'); if (stored && Number.isFinite(stored.score) && Number.isFinite(stored.level)) best = stored; } catch { /* Storage is optional. */ }
if (best.score) $('start-best').textContent = `최고 점수 ${best.score} · 최고 WAVE ${best.level}`;

const tips = [
  '성충은 15초마다 진화해요.<br><b>뜰채로 성충도 공격</b>할 수 있습니다.',
  '흡혈종부터 체력과 위험도가 증가!<br>새 장비가 열리면 적극 활용하세요.',
  '사신과 여왕은 유충을 낳습니다.<br><b>큰 괴물을 먼저</b> 쓰러뜨리세요.',
  '얼어붙은 적은 피해를 1.5배 받아요.<br><b>절대 영도 → 궁극기</b>를 연결하세요.',
  '<b>연쇄 부적 → 번개</b>로 폭발을 연결하세요.<br>시간 되감기는 진화 위험도를 낮춰줍니다.',
];

for (const [index, w] of WEAPONS.entries()) {
  const button = document.createElement('button');
  button.className = `weapon-btn${w.unlock >= 7 ? ' ultimate' : ''}${['chorus','rewind','talisman'].includes(w.id) ? ' arcane' : ''}`;
  button.dataset.weapon = w.id; button.title = `${w.name} (${w.key}) · WAVE ${w.unlock} 해금 · ${w.description}`;
  button.setAttribute('aria-label', `${w.key}. ${w.name}`);
  button.innerHTML = `<span class="keycap">${w.key.toUpperCase()}</span><svg aria-hidden="true"><use href="#i-${w.icon}"/></svg><span class="weapon-name">${w.name}</span><span class="cooldown-label"></span><span class="cooldown-shade"></span><span class="lock-label">W${String(w.unlock).padStart(2,'0')} 해금</span>`;
  const rank=document.createElement('span');rank.className='skill-rank';rank.hidden=true;button.append(rank);
  button.addEventListener('click', () => selectWeapon(w.id));
  $('weapon-grid').append(button);
  const quick = button.cloneNode(true);
  quick.classList.add('quick-weapon');
  quick.setAttribute('aria-label', `빠른 선택 · ${w.name}`);
  quick.addEventListener('click', () => selectWeapon(w.id));
  $('quick-weapons').append(quick);
}
const weaponButtons = [...document.querySelectorAll('.weapon-btn')];
function selectWeapon(id) {
  selected = id; pointer.down = false; pondInput?.cancel();
  const weapon = WEAPONS.find(w => w.id === id);
  for (const button of weaponButtons) { const active = button.dataset.weapon === id; button.classList.toggle('selected', active); button.setAttribute('aria-pressed', String(active)); }
  $('detail-tag').textContent = game.isUnlocked(id) ? weapon.tag : `잠긴 장비 · WAVE ${weapon.unlock} 해금`; $('detail-name').textContent = weapon.name;
  $('detail-description').textContent = weapon.description;
  $('detail-cooldown').textContent = id === 'flame' ? '연속 분사 · 과열 주의' : `재사용 ${weapon.cooldown}초`;
  $('weapon-hint').textContent = game.isUnlocked(id) ? weapon.hint : `아직 잠겨 있어요 · WAVE ${weapon.unlock} 도달 시 해금`;
  $('quick-name').textContent = weapon.name;
  tone(420, .03, 'sine', .025);
  if(pondInput) updateHUD();
}
selectWeapon('net');

function tone(...args) { sound.tone(...args); }
function updateSoundButton() {
  $('sound-btn').setAttribute('aria-pressed', String(sound.enabled));
  $('sound-btn').querySelector('span').textContent = sound.enabled ? 'ON' : 'OFF';
  $('sound-btn').setAttribute('aria-label', sound.enabled ? '\uC18C\uB9AC \uB044\uAE30' : '\uC18C\uB9AC \uCF1C\uAE30');
  $('sound-btn').title = $('sound-btn').getAttribute('aria-label');
}
$('sound-btn').addEventListener('click', () => { sound.toggle(); updateSoundButton(); if(sound.enabled)tone(520,.13); });
updateSoundButton();

function toast(message) { $('toast').textContent = message; $('toast').classList.add('visible'); toastTimer = 2.4; }
function startGame() {
  sound.stop(); sound.step = 0; sound.unlock(); updateSoundButton();
  if(runMode==='daily') {challenge=dailyChallenge();game.random=seededRandom(challenge.seed);} else {challenge=null;game.random=Math.random;}
  game.start(); effects = []; particles = []; floating = []; shake = 0; pointer.down = false; announcementTimer = 0; flash = 0;
  if(challenge) game.upgrades[challenge.upgrade]=1;
  $('run-mode').textContent=challenge?'오늘의 연못':'끝나지 않는 밤';
  $('wave-announcement').classList.remove('visible');
  for (const id of ['start-overlay', 'pause-overlay', 'result-overlay']) $(id).classList.add('hidden');
  $('pause-btn').disabled = false; $('pause-btn').textContent = 'Ⅱ'; $('pause-btn').setAttribute('aria-label', '일시정지');
  selectWeapon('net'); $('stage-label').textContent = 'WAVE 01 · 잠복';
  toast(challenge?`${challenge.name} · ${challenge.description}`:'뜰채는 성충도 공격합니다. 진화하기 전에 잡으세요!');
  canvas.focus({ preventScroll: true }); tone(420, .15, 'sine', .04, 840); progression.refresh(); updateHUD();
}
function pauseGame() {
  if (game.status !== 'playing') return;
  sound.stop(); game.status = 'paused'; pointer.down = false; pondInput?.cancel(); $('pause-overlay').classList.remove('hidden');
  $('pause-btn').textContent = '▷'; $('pause-btn').setAttribute('aria-label', '계속하기'); $('resume-btn').focus({ preventScroll: true });
}
function resumeGame() {
  if (game.status !== 'paused' || document.hidden || document.querySelector('dialog[open]')) return;
  sound.unlock(); game.status = 'playing'; $('pause-overlay').classList.add('hidden'); $('pause-btn').textContent = 'Ⅱ'; $('pause-btn').setAttribute('aria-label', '일시정지'); canvas.focus({ preventScroll: true });
}
$('start-btn').addEventListener('click',()=>{runMode='endless';startGame();});
$('daily-start-btn').addEventListener('click',()=>{runMode='daily';startGame();});
for (const id of ['restart-btn', 'restart-pause-btn']) $(id).addEventListener('click', startGame);
$('mode-menu-btn').addEventListener('click',()=>{
  pondInput.cancel();sound.stop();game.reset();effects=[];particles=[];floating=[];
  $('pause-btn').disabled=true;selectWeapon('net');
  $('result-overlay').classList.add('hidden');$('start-overlay').classList.remove('hidden');
  if(best.score)$('start-best').textContent=`최고 점수 ${best.score} · 최고 WAVE ${best.level}`;
  refreshDailyCard();updateHUD();$('start-btn').focus({preventScroll:true});
});
$('pause-btn').addEventListener('click', () => game.status === 'playing' ? pauseGame() : resumeGame());
$('resume-btn').addEventListener('click', resumeGame);
$('help-btn').addEventListener('click', () => { helpPaused = game.status === 'playing'; if (helpPaused) pauseGame(); $('help-dialog').showModal(); });
for (const id of ['close-help-btn', 'help-ok-btn']) $(id).addEventListener('click', () => $('help-dialog').close());
$('help-dialog').addEventListener('close', () => { if (helpPaused) resumeGame(); helpPaused = false; });
document.addEventListener('visibilitychange', () => { if (document.hidden) pauseGame(); else if(game.status==='ready')refreshDailyCard(); });
window.addEventListener('blur', () => { pointer.down = false; if (!document.querySelector('dialog[open]')) pauseGame(); });
document.addEventListener('keydown', e => {
  if (document.querySelector('dialog[open]') || e.repeat) return;
  const keyWeapon = WEAPONS.find(w => w.key === e.key.toLowerCase());
  if (keyWeapon) { selectWeapon(keyWeapon.id); e.preventDefault(); }
  if ((e.key.toLowerCase() === 'p' || e.key === 'Escape') && ['playing', 'paused'].includes(game.status)) { e.preventDefault(); game.status === 'playing' ? pauseGame() : resumeGame(); }
});
pondInput = bindPondPointer(canvas, pointer, {canAttack:()=>game.status==='playing',attack:()=>useWeapon(true)});
canvas.addEventListener('contextmenu', e => e.preventDefault());
// Keep a held attack from becoming a page pan on mobile browsers. Scope the
// non-passive listener to the pond so the arsenal and dialogs still scroll.
$('arena').addEventListener('touchmove', e => {
  if (game.status === 'playing' && e.cancelable) e.preventDefault();
}, { passive: false });
function useWeapon(explicit = false, dt = 0) {
  const result = selected === 'flame' ? game.sustainFlame(dt, pointer.x, pointer.y) : game.use(selected, pointer.x, pointer.y);
  if (explicit && !result.ok) {
    if (result.reason === 'cooldown') toast(`${WEAPONS.find(w => w.id === selected).name} · ${Math.ceil(game.cooldowns[selected])}초 후 준비돼요`);
    else if (result.reason === 'overheated') toast('잠깐! 화염 방사기를 식히고 있어요.');
    else if (result.reason === 'limit') toast(`이미 ${result.limit}마리가 연못을 지키고 있어요!`);
    else if (result.reason === 'locked') toast(`아직 잠겨 있어요. WAVE ${result.unlock}에서 해금됩니다.`);
  }
}
function endGame() {
  sound.stop();
  medals.check();
  pointer.down = false; $('pause-btn').disabled = true;
  const previous=challenge?dailyRecords[challenge.date]?.score || 0:best.score;
  const newBest = game.score > previous;
  if(challenge) {
    dailyRecords=saveDailyRecord(dailyRecords,challenge.date,game);
    try {localStorage.setItem('pond-daily-v1',JSON.stringify(dailyRecords));} catch { /* Optional. */ }
  } else {
    best.score = Math.max(best.score, game.score); best.level = Math.max(best.level, game.level); best.kills = Math.max(best.kills || 0, game.kills);
    try { localStorage.setItem('pond-defense-endless-v2', JSON.stringify(best)); } catch { /* Continue without persistence. */ }
  }
  $('result-eyebrow').textContent = 'THE POND HAS FALLEN'; $('result-title').textContent = '연못이 무너졌습니다';
  $('result-description').textContent = `최고 ${game.bestStreak}연속 처치 · 여왕 ${game.bossKills}마리 · 강화 ${Object.values(game.upgrades).reduce((a,b)=>a+b,0)}회`;
  $('result-score').textContent = game.score.toLocaleString(); $('result-level').textContent = `W${game.level}`;
  $('result-kills').textContent = game.kills; $('result-time').textContent = formatTime(game.elapsed);
  const record=challenge?dailyRecords[challenge.date]:best;
  $('result-best').textContent = `${newBest ? '✦ 새로운 최고 기록! · ' : ''}${challenge?challenge.date+' 오늘의 연못 · ':''}최고 ${record.score}점 / WAVE ${record.level}`;
  $('restart-btn').firstChild.textContent=challenge?'오늘의 연못 재도전 ':'더 멀리 도전하기 ';
  $('result-overlay').classList.remove('hidden'); $('restart-btn').focus({ preventScroll: true });
  tone(220, .5, 'triangle', .06, 75);
}

function formatTime(time) { const sec = Math.floor(time); return `${String(Math.floor(sec / 60)).padStart(2,'0')}:${String(sec % 60).padStart(2,'0')}`; }

function updateHUD() {
  $('time-value').textContent = formatTime(game.elapsed);
  $('time-stop-hud').hidden=game.timeStopRemaining<=0;
  $('time-stop-hud').textContent=`시간 정지 · ${game.timeStopRemaining.toFixed(1)}초`;
  $('streak-hud').classList.toggle('hidden',game.streak<3 || game.status==='ready' || game.status==='lost');
  $('streak-value').textContent=`${game.streak} CHAIN`;
  $('streak-bar').style.width=`${Math.max(0,Math.min(100,(game.streakUntil-game.elapsed)/4*100))}%`;
  progression.refresh();
  const threat = game.threat;
  $('adult-value').textContent = threat; $('kill-value').innerHTML = `${game.kills}<small>마리</small>`;
  $('danger-bar').style.width = `${Math.min(100, threat / THREAT_LIMIT * 100)}%`;
  $('arena').classList.toggle('danger', threat >= THREAT_LIMIT);
  $('arena').dataset.phase = String(Math.min(4, Math.floor((game.level - 1) / 2)));
  $('danger-caption').textContent = threat >= THREAT_LIMIT ? `붕괴까지 ${Math.max(0,5 - game.danger).toFixed(1)}초! 강한 괴물부터 처치` : game.danger > 0 ? `붕괴 게이지 회복 중 · ${game.danger.toFixed(1)} / 5` : `성충 ${game.adults}마리 · 진화할수록 위험도 증가`;
  $('stage-label').textContent = `WAVE ${String(game.level).padStart(2,'0')} · ${['잠복','흡혈의 밤','철갑의 습격','사신의 연못','재앙'][Math.min(4, Math.floor((game.level - 1) / 2))]}`;
  $('wave-next').textContent = `다음 변이 · WAVE ${String(game.level + 1).padStart(2,'0')}`;
  $('wave-progress').style.width = `${game.waveProgress * 100}%`;
  const nextLevel = Math.min(...WEAPONS.filter(w => w.unlock > game.level).map(w => w.unlock));
  const next = WEAPONS.filter(w => w.unlock === nextLevel);
  $('next-unlock').textContent = next.length ? `${next.map(w=>w.name).join(' + ')} · W${nextLevel}` : '한계를 넘어 · 적 증원 계속';
  $('score-label').textContent = `SCORE ${String(game.score).padStart(4,'0')}`;
  $('unlock-count').innerHTML = `${String(WEAPONS.filter(w=>game.isUnlocked(w.id)).length).padStart(2,'0')}<span>/${WEAPONS.length}</span>`;
  const w = WEAPONS.find(w => w.id === selected), cd = game.cooldowns[selected] / (['net','flame'].includes(selected)?1:game.cooldownRate);
  if(game.isUnlocked(selected)) {
    const power=(1+(game.upgrades.power||0)*.12)*game.skillPower(selected);
    $('detail-tag').textContent=selected==='net'?`뜰채 피해 ${Number(((1+(game.upgrades.netcraft||0))*power).toFixed(2))} · 반경 ${game.weaponRadius('net')}`:selected==='flame'?`초당 피해 ${Number((w.dps*power).toFixed(1))} · 연속 분사 ${(4/(1-(game.upgrades.fuel||0)*.15)).toFixed(1)}초`:w.tag;
    $('detail-cooldown').textContent=selected==='flame'?'누르는 동안 지속 피해':`재사용 ${(w.cooldown/(['net','flame'].includes(selected)?1:game.cooldownRate)).toFixed(1)}초`;
    if(selected==='flame')$('weapon-hint').textContent=`누른 채 유지 / 드래그 · 초당 피해 ${Number((w.dps*power).toFixed(1))} · 과열 주의`;
    else if(selected==='net')$('weapon-hint').textContent=`클릭 / 드래그 · 피해 ${Number(((1+(game.upgrades.netcraft||0))*power).toFixed(1))} · 성충도 공격 가능`;
    else {
      const base=w.damage??({chorus:2,talisman:8}[selected]);
      if(base)$('detail-tag').textContent=`피해 ${Number((base*power).toFixed(1))}${['thunderstorm','bigbang'].includes(selected)?' · 전장 전체':` · 반경 ${Math.round(game.weaponRadius(selected))}`}`;
    }
  }
  const allyCount = ALLY_LIMITS[selected] ? game.allies.filter(a => a.type === selected).length : 0;
  $('detail-status').textContent = !game.isUnlocked(selected) ? `WAVE ${w.unlock} 해금` : ALLY_LIMITS[selected] ? `${allyCount}/${ALLY_LIMITS[selected]}마리 · ${allyCount >= ALLY_LIMITS[selected] ? '배치 완료' : cd > 0 ? `${Math.ceil(cd)}초` : '배치 가능'}` : selected === 'flame' ? `${game.overheated ? '냉각 중' : '열기'} ${Math.round(game.heat)}%` : cd > 0 ? `${cd.toFixed(1)}초 후 준비` : '사용 준비 완료';
  $('quick-status').textContent = $('detail-status').textContent;
  const mastery=game.skillRank(selected);
  $('quick-name').textContent=`${w.name}${mastery?` · LV ${mastery}`:''}`;
  if(mastery){
      const control=['vortex','freeze','rewind','timestop'].includes(selected),damage=control?'제어 강화':`피해 +${mastery*20}%`;
    $('detail-tag').textContent+=` · 진화 ${mastery}/3 (${damage})`;
  }
  $('heat-hud').classList.toggle('hidden',selected!=='flame' || !['playing','paused'].includes(game.status));
  $('heat-hud').classList.toggle('overheated',game.overheated);
  $('heat-label').textContent = game.overheated?'과열 · 25%까지 냉각 중':`화염 연료 열기 ${Math.round(game.heat)}%`;
  $('heat-bar').style.width=`${game.heat}%`;
  for (const button of weaponButtons) {
    const id = button.dataset.weapon, cooldown = game.cooldowns[id], spec = WEAPONS.find(w => w.id === id);
    const locked = !game.isUnlocked(id); button.classList.toggle('locked', locked); button.setAttribute('aria-disabled', String(locked));
    const rank=game.skillRank(id),badge=button.querySelector('.skill-rank');badge.hidden=!rank;badge.textContent=`+${rank}`;button.dataset.mastery=rank;
    const label = button.querySelector('.cooldown-label');
    if (id === 'flame') { label.textContent = game.heat > 0 ? `${Math.round(game.heat)}°` : ''; button.querySelector('.cooldown-shade').style.height = `${game.heat}%`; }
    else { label.textContent = cooldown > .1 ? `${Math.ceil(cooldown/(id==='net'?1:game.cooldownRate))}s` : ''; button.querySelector('.cooldown-shade').style.height = `${cooldown / spec.cooldown * 100}%`; }
  }
  const boss = game.enemies.find(e => e.rank === 4 && stageOf(e) === 'adult');
  $('boss-hud').classList.toggle('hidden', !boss);
  if (boss) { $('boss-health').style.width = `${Math.max(0,boss.hp / boss.maxHp * 100)}%`; $('boss-hp-text').textContent = `${Math.ceil(boss.hp)} / ${boss.maxHp}`; }
  $('field-note').innerHTML = tips[Math.floor(game.elapsed / 20) % tips.length];
}

function announce(top, title, detail) {
  const banner = $('wave-announcement'); banner.querySelector('span').textContent = top; banner.querySelector('strong').textContent = title; banner.querySelector('p').textContent = detail;
  banner.classList.add('visible'); announcementTimer = 3;
}

function burst(x, y, color, amount = 16, power = 60) {
  for (let i = 0; i < (reducedMotion ? Math.ceil(amount / 3) : amount); i++) {
    const a = Math.random() * Math.PI * 2, speed = power * (.3 + Math.random());
    particles.push({ x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, color, life: .35 + Math.random() * .55, max: .9, size: 1.5 + Math.random() * 3 });
  }
  if (particles.length > 850) particles.splice(0, particles.length - 850);
}
function processEvents() {
  for (const e of game.drainEvents()) {
    sound.event(e);
    if(e.type==='timestop')toast(`타임스톱! ${e.duration}초 동안 출현·성장·이동 정지`);
    if(e.type==='bigbangCharge')toast('빅뱅 어택 · 우주 에너지 압축 중');
    if(e.type==='bigbang'){effects.push({...e,life:2.4,max:2.4});shake=reducedMotion?0:14;toast(`우주 대폭발! ${e.count}마리 퇴치`);}
    if(e.type==='combo') {
      const electric=e.kind==='conductive',color=electric?'#d9ff94':'#a4ecff';
      floating.push({x:e.x,y:e.y-35,text:`${electric?'소용돌이 감전':'빙결 약점'} ×${Number(e.multiplier.toFixed(2))}`,life:1.15,color});
      burst(e.x,e.y,color,12,85);
    }
    if(e.type==='upgradeOffer')progression.open();
    if(e.type==='bossWarning'){announce('DANGER APPROACHING', '6초 뒤 여왕 출현', '절대 영도와 궁극기를 준비하세요');tone(440,.2,'triangle',.08,180);}
    if(e.type==='streakReward'){toast(`${e.streak}연속 처치! +${e.points}점 · 스킬 ${e.seconds}초 회복`);burst(e.x,e.y,'#edeea4',20,100);tone(880,.16,'sine',.07,1320);}
    if(e.type==='ward'){announce('ONE MORE CHANCE','연못의 가호 발동','붕괴 방어 · 모든 적 3초 빙결');flash=.2;flashColor='145,230,255';tone(550,.4,'triangle',.1,1100);}
    if(e.type === 'thunderstorm') { effects.push({...e,life:1.8,max:1.8}); shake = reducedMotion ? 0 : 12; toast(`\uCC9C\uB8B0\uB09C\uBB34! ${e.count}\uB9C8\uB9AC \uD1F4\uCE58`); }
    if (e.type === 'wave') {
      const names = e.unlocked.map(id => WEAPONS.find(w => w.id === id).name);
      announce('MUTATION RISING', `WAVE ${String(e.level).padStart(2,'0')}`, names.length ? `${names.join(' · ')} 해금!` : '더 빠른 부화 · 더 강한 변이');
      for (const id of e.unlocked) for (const button of weaponButtons.filter(b => b.dataset.weapon === id)) button.classList.add('just-unlocked');
      if (e.unlocked.includes(selected)) selectWeapon(selected);
      flash = .16; flashColor = '190,215,255'; tone(330,.15,'triangle',.06,900);
    }
    if (e.type === 'evolve') {
      burst(e.x,e.y,EVOLUTIONS[e.rank].color,26,90); effects.push({...e,life:.85,max:.85});
      floating.push({x:e.x,y:e.y-25,text:EVOLUTIONS[e.rank].name,life:1.25,color:EVOLUTIONS[e.rank].color});
      if (e.rank >= 3) tone(110,.15,'sawtooth',.025,65);
    }
    if (e.type === 'boss') { announce('CATASTROPHE DETECTED','재앙의 여왕','체력 65+ · 위험도 10 · 유충 증식'); flash = .32; flashColor = '255,90,130'; shake = reducedMotion ? 0 : 8; tone(65,.65,'sawtooth',.07,35); burst(e.x,e.y,'#ff6c9c',65,190); }
    if (e.type === 'bossKilled') { announce('QUEEN ELIMINATED','여왕 처치','+100점 · 한숨 돌릴 시간'); flash = .2; flashColor = '229,170,255'; burst(e.x,e.y,'#ffafd5',100,210); }
    if (e.type === 'breed') burst(e.x,e.y,'#ac87cb',9,45);
    if (e.type === 'damage') {
      for (const target of e.targets.slice(0,e.source==='flame'?3:10)) { burst(target.x,target.y,'#fff1c2',e.source==='flame'?1:3,40); if (e.source !== 'flame' && target.rank > 0) floating.push({x:target.x,y:target.y-12,text:`−${Number(target.amount.toFixed(1))}`,life:.5,color:'#f7c1a2'}); }
    }
    if (e.type === 'kills') {
      for (const target of e.targets) burst(target.x, target.y, target.frozen ? '#b7f3ff' : target.adult ? '#f6c98b' : '#c3e48c', e.source === 'flame' ? 5 : 9, 50);
      if (e.count > 0 && e.source !== 'flame') floating.push({ x: e.x, y: e.y - 22, text: e.count >= 4 ? `${e.count}연속 퇴치!` : `+${e.count}`, life: 1.1, color: e.count >= 4 ? '#f5ebac' : '#d9ecc1' });
      if (e.count >= 5) tone(620, .15, 'sine', .04, 1100);
    }
    if (e.type === 'attack') {
      effects.push({ ...e, life: e.source === 'dragon' ? 1.7 : e.source === 'palm' ? 1.4 : e.source === 'net' ? .35 : .24, max: e.source === 'dragon' ? 1.7 : e.source === 'palm' ? 1.4 : e.source === 'net' ? .35 : .24 });
      if (e.source === 'palm') { shake = reducedMotion ? 0 : 16; flash = .3; flashColor = '255,220,135'; burst(e.x, e.y, '#f4d880', 140, 290); tone(85, .65, 'triangle', .14, 35); toast(`여래신장! 피해 18 · ${e.count}마리 퇴치`); }
      if (e.source === 'dragon') { flash = .22; flashColor = '105,255,221'; shake = reducedMotion ? 0 : 13; for(let i=0;i<9;i++)burst(i*125,e.y,'#83f4d3',18,120); tone(95,.6,'sawtooth',.06,280); toast(`용왕 강림! ${e.count}마리 퇴치`); }
      if (e.source === 'flame') { burst(e.x, e.y, '#ffad54', 10, 130); burst(e.x, e.y, '#ff6441', 7, 90); tone(65 + Math.random() * 55, .07, 'sawtooth', .012); }
      if (e.source === 'net') { burst(e.x, e.y, '#a6dbca', 7, 55); tone(180, .07, 'triangle', .02, 80); }
    }
    if (e.type === 'lightning') { effects.push({ ...e, life: .5, max: .5 }); flash = .09; flashColor = '140,215,255'; tone(160, .2, 'sawtooth', .035, 900); }
    if (e.type === 'tongue') effects.push({ ...e, life: .22, max: .22 });
    if (e.type === 'deploy') { burst(e.x, e.y, '#c4e8b7', 20, 80); effects.push({ ...e, type: 'ripple', life: .8, max: .8, radius: 65 }); tone(260, .13, 'sine', .04, 600); }
    if (e.type === 'freeze') { burst(e.x, e.y, '#bdefff', 32, 170); tone(1100, .22, 'sine', .03, 380); }
    if (e.type === 'vortex') tone(170, .3, 'sine', .05, 70);
    if (e.type === 'chorus') { burst(e.x,e.y,'#b1f1b7',30,80);toast('두꺼비 합창단 등장! 네 번의 공명 충격파'); }
    if (e.type === 'sonic') { effects.push({...e,life:.95,max:.95});burst(e.x,e.y,'#d6ec9d',10,70);tone(140,.22,'triangle',.07,80); }
    if (e.type === 'rewind') { effects.push({...e,life:1.4,max:1.4});burst(e.x,e.y,'#9fe8ff',50,160);tone(950,.5,'sine',.05,160);toast(`시간 되감기 · ${e.count}마리의 시간을 돌렸습니다`); }
    if (e.type === 'talisman') { effects.push({...e,life:.9,max:.9});burst(e.x,e.y,'#ffe096',24,150);tone(520,.15,'triangle',.045,780);toast(`연쇄 부적 ${e.count}개 · 처치하면 폭발합니다!`); }
    if (e.type === 'sealBurst') { effects.push({...e,life:.65,max:.65});burst(e.x,e.y,'#ffd484',32,140);tone(160,.1,'triangle',.025,70); }
    if (e.type === 'hatch') { burst(e.x, e.y, '#faaf77', 6, 27); effects.push({ ...e, type: 'ripple', life: .6, max: .6, radius: 22 }); }
    if (e.type === 'blackhole') { tone(90,.5,'sine',.07,28); toast('중력 붕괴 · 3초 뒤 압축 폭발'); }
    if (e.type === 'meteor') { tone(300,.4,'sawtooth',.035,70); toast('천벌 유성우 · 충돌 지점에서 물러나세요!'); }
    if (e.type === 'detonate') { effects.push({...e,life:1,max:1}); burst(e.x,e.y,e.source==='meteor'?'#ffbd79':'#d2a4ff',90,220); shake = reducedMotion?0:12; flash=.2;flashColor=e.source==='meteor'?'255,157,90':'190,125,255';tone(65,.3,'triangle',.11,30); }
    if (e.type === 'end') endGame();
  }
}

// All artwork is drawn locally. No textures, images, or game libraries are required.
const scenery = document.createElement('canvas');
function ellipse(c, x, y, rx, ry, color, rotation = 0) { c.beginPath(); c.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), rotation, 0, Math.PI * 2); if (color) { c.fillStyle = color; c.fill(); } }
function makeRandom(seed) { return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; }
function pondPath(c, w, h) {
  c.beginPath(); c.moveTo(w * .05, h * .5);
  c.bezierCurveTo(w * .04, h * .26, w * .19, h * .17, w * .42, h * .20);
  c.bezierCurveTo(w * .62, h * .15, w * .93, h * .23, w * .95, h * .45);
  c.bezierCurveTo(w * 1.03, h * .7, w * .8, h * .96, w * .57, h * .92);
  c.bezierCurveTo(w * .33, h * .99, w * .03, h * .87, w * .05, h * .5); c.closePath();
}
function lily(c, x, y, radius, rotation, color = '#78915c') {
  c.save(); c.translate(x, y); c.rotate(rotation); c.scale(1, .72);
  ellipse(c, 3, 7, radius + 2, radius + 2, '#041e2750');
  c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, radius, .24, Math.PI * 2 - .12); c.closePath(); c.fillStyle = color; c.fill();
  c.strokeStyle = '#b8c58330'; c.lineWidth = 1;
  for (let i = 1; i < 7; i++) { const a = i / 7 * Math.PI * 2; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * radius * .82, Math.sin(a) * radius * .82); c.stroke(); }
  c.restore();
}
function drawScenery() {
  scenery.width = Math.round(width * dpr); scenery.height = Math.round(height * dpr);
  const c = scenery.getContext('2d'); c.scale(dpr, dpr); const random = makeRandom(7731);
  const land = c.createLinearGradient(0, 0, width, height); land.addColorStop(0, '#233f32'); land.addColorStop(1, '#35513a'); c.fillStyle = land; c.fillRect(0, 0, width, height);
  for (let i = 0; i < 1200; i++) { const x = random() * width, y = random() * height; ellipse(c, x, y, random() * 2 + .3, random() * 1.2 + .2, i % 2 ? '#95b56a0b' : '#041f2210'); }
  pondPath(c, width, height); c.lineWidth = 17 * unit; c.strokeStyle = '#5d6d4255'; c.stroke(); c.lineWidth = 8 * unit; c.strokeStyle = '#91a36935'; c.stroke();
  c.save(); pondPath(c, width, height); c.clip();
  const water = c.createLinearGradient(0, 0, width * .7, height); water.addColorStop(0, '#173f3d'); water.addColorStop(.45, '#24534b'); water.addColorStop(1, '#153d3a'); c.fillStyle = water; c.fillRect(0, 0, width, height);
  const glow = c.createRadialGradient(width * .58, height * .44, 0, width * .58, height * .44, width * .65); glow.addColorStop(0, '#a6c79b15'); glow.addColorStop(1, '#022a3100'); c.fillStyle = glow; c.fillRect(0, 0, width, height);
  for (let i = 0; i < 80; i++) { const x = random() * width, y = random() * height; c.beginPath(); c.ellipse(x, y, (8 + random() * 30) * unit, (2 + random() * 5) * unit, -.1, 0, Math.PI); c.strokeStyle = '#b4d2a00b'; c.lineWidth = .8; c.stroke(); }
  for (let i = 0; i < 11; i++) { const x = width * (.08 + random() * .85), y = height * (.2 + random() * .68); c.strokeStyle = '#9eb6750c'; c.lineWidth = 2 * unit; c.beginPath(); c.moveTo(x, y); c.bezierCurveTo(x - 30, y - 15, x + 15, y - 50, x - 10, y - 65); c.stroke(); }
  c.restore();
  // River stones and reeds frame the playable water.
  for (let i = 0; i < 34; i++) {
    const a = random() * Math.PI * 2, x = width * (.5 + Math.cos(a) * .455), y = height * (.56 + Math.sin(a) * .37), r = (5 + random() * 13) * unit;
    ellipse(c, x + 2, y + 5, r * 1.2, r * .7, '#092d2966', a);
    ellipse(c, x, y, r, r * .65, ['#748372', '#667963', '#929783', '#596f60'][i % 4], a);
    ellipse(c, x - 2, y - 2, r * .64, r * .27, '#d4d2ab13', a);
  }
  for (const [nx, ny, count] of [[.06,.4,12],[.89,.25,15],[.91,.85,10],[.13,.88,17],[.34,.96,9],[.02,.69,8]]) {
    for (let i = 0; i < count; i++) { const x = nx * width + (random() - .5) * 48 * unit, y = ny * height + (random() - .5) * 16 * unit, bend = (random() - .5) * 45 * unit, tall = (20 + random() * 40) * unit;
      c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + bend * .6, y - tall * .8, x + bend, y - tall); c.lineWidth = (1 + random() * 2) * unit; c.strokeStyle = ['#708856', '#91a666', '#416945', '#adb87c'][i % 4]; c.stroke();
      if (i % 4 === 0) { c.lineWidth = 4 * unit; c.strokeStyle = '#aa9560'; c.beginPath(); c.moveTo(x + bend, y - tall); c.lineTo(x + bend * .94, y - tall + 9 * unit); c.stroke(); }
    }
  }
  for (const [nx, ny, r, a] of [[.2,.34,25,.4],[.24,.30,17,-1],[.82,.64,32,2],[.87,.59,19,-.5],[.34,.80,28,1],[.30,.85,17,-1],[.7,.28,15,2]]) lily(c, nx * width, ny * height, r * unit, a);
  // A small lotus at the water's edge.
  const lx = width * .815, ly = height * .625;
  for (let i = 0; i < 7; i++) { const a = i * Math.PI * 2 / 7; ellipse(c, lx + Math.cos(a) * 5 * unit, ly + Math.sin(a) * 4 * unit, 8 * unit, 3.5 * unit, '#dac5b0', a); }
  ellipse(c, lx, ly, 3 * unit, 3 * unit, '#e1c479');
  const vignette = c.createLinearGradient(0, 0, 0, height); vignette.addColorStop(0, '#0b282b9c'); vignette.addColorStop(.25, '#102c2300'); vignette.addColorStop(.8, '#102c2300'); vignette.addColorStop(1, '#0b282b75'); c.fillStyle = vignette; c.fillRect(0, 0, width, height);
}
function resize() {
  const rect = canvas.getBoundingClientRect(); width = rect.width; height = rect.height; dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
  sx = width / 1000; sy = height / 700; unit = Math.max(.65, Math.min(sx, sy) * 1.1); drawScenery();
}
new ResizeObserver(resize).observe(canvas);

function drawEnemy(e, time) {
  const stage = stageOf(e), x = e.x * sx, y = e.y * sy;
  const mutation = evolutionOf(e), size = stage === 'adult' ? mutation.scale : 1 + e.rank * .12;
  if(e.sealed>0){ctx.save();ctx.translate(x+13*unit,y-15*unit);ctx.rotate(.2+Math.sin(time*4+e.seed)*.12);ctx.fillStyle='#f5d788';ctx.fillRect(-4*unit,-8*unit,9*unit,19*unit);ctx.strokeStyle='#b44536';ctx.lineWidth=1.2*unit;ctx.beginPath();ctx.moveTo(0,-5*unit);ctx.lineTo(0,7*unit);ctx.moveTo(-2*unit,-2*unit);ctx.lineTo(3*unit,-2*unit);ctx.moveTo(-3*unit,3*unit);ctx.lineTo(3*unit,3*unit);ctx.stroke();ctx.restore();}
  if (stage === 'adult' && (e.rank > 0 || e.hp < e.maxHp)) {
    const bar = (e.rank === 4 ? 60 : 31) * unit, ybar = y - (18 * size + 8) * unit;
    ctx.fillStyle='#0a182bd0';ctx.fillRect(x-bar/2,ybar,bar,3*unit);ctx.fillStyle=mutation.color;ctx.fillRect(x-bar/2,ybar,bar*Math.max(0,e.hp/e.maxHp),3*unit);
    if(e.rank>=3){ctx.font=`600 ${Math.max(8,9*unit)}px sans-serif`;ctx.textAlign='center';ctx.fillStyle=mutation.color;ctx.fillText(speciesOf(e).name,x,ybar-5*unit);}
  }
  ctx.save(); ctx.translate(x, y); ctx.rotate(e.angle); ctx.scale(unit, unit);
  ctx.scale(size,size);
  if(e.hit>0){ctx.shadowColor='#fff3cb';ctx.shadowBlur=16;}
  if (stage === 'adult' && e.rank>0) {
    const aura = ctx.createRadialGradient(0,0,2,0,0,30);aura.addColorStop(0,mutation.color+'40');aura.addColorStop(1,mutation.color+'00');ellipse(ctx,0,0,31,26,aura);
    if(e.rank>=3){ctx.save();ctx.rotate(time*1.7);ctx.strokeStyle=mutation.color+'70';ctx.lineWidth=.6;ctx.setLineDash([4,4]);ellipse(ctx,0,0,25,25);ctx.stroke();ctx.restore();}
  }
  if (e.frozen > 0) { ellipse(ctx, 0, 0, stage === 'adult' ? 23 : 20, 17, '#a7f1ff30'); ctx.strokeStyle = '#b7f3ff90'; ctx.lineWidth = 1; ctx.stroke(); }
  if (stage === 'egg') {
    for (let i = 0; i < 5; i++) ellipse(ctx, i * 2.8 - 6, Math.sin(i * 1.7) * 2, 2.1, 3.3, e.frozen ? '#b1e5e8' : '#b6c99e');
    ctx.restore(); return;
  }
  if (stage === 'pupa') {
    const pulse = .65 + Math.sin(time * 6 + e.seed) * .15;
    ellipse(ctx, 0, 0, 17, 11, `rgba(230,157,84,${pulse * .14})`);
    ctx.beginPath(); ctx.arc(-2, 0, 6, -.3, Math.PI * 1.4); ctx.lineWidth = 7; ctx.strokeStyle = e.frozen ? '#a7e0e4' : '#d8a364'; ctx.stroke();
    ellipse(ctx, 5, -1, 5, 4, e.frozen ? '#c3f3fa' : '#f0c17d');
    if (e.age > 18 && !e.frozen) { ctx.fillStyle = '#ffcf8c'; ctx.font = 'bold 12px sans-serif'; ctx.fillText('!', -2, -15); }
    ctx.restore(); return;
  }
  if (stage === 'larva') {
    const wiggle = e.frozen ? 0 : Math.sin(time * 8 + e.seed);
    ctx.beginPath(); ctx.moveTo(-15, wiggle * 4); ctx.bezierCurveTo(-7, -6 + wiggle * 3, 0, 7 - wiggle * 2, 10, 0); ctx.strokeStyle = '#062f3055'; ctx.lineWidth = 7; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-15, wiggle * 4 - 1); ctx.bezierCurveTo(-7, -7 + wiggle * 3, 0, 6 - wiggle * 2, 10, -1); ctx.strokeStyle = e.frozen ? '#a3dfe2' : '#b5b97c'; ctx.lineWidth = 4.5; ctx.stroke();
    ellipse(ctx, 11, -1, 4.7, 4, e.frozen ? '#c5f3f7' : '#d4cc97'); ellipse(ctx, 12, -2, 1, 1, '#263f32');
    ctx.strokeStyle = '#d4d1a26b'; ctx.lineWidth = .8; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-11 + i * 5, -5); ctx.lineTo(-11 + i * 5, 5); ctx.stroke(); }
    ctx.restore(); return;
  }
  drawMonster(ctx, e, time); ctx.restore();
}

function drawAlly(a, time) {
  skillAura(a.type,a.x,a.y,32, time,.65);
  const allyScale=unit*(1+game.skillRank(a.type)*.2);
  ctx.save(); ctx.translate(a.x * sx, a.y * sy); ctx.scale(allyScale, allyScale);
  if (a.type === 'loach') {
    ctx.rotate(a.angle); const growth = 1 + Math.min(a.eaten, 20) * .014; ctx.scale(growth, growth);
    const wiggle = Math.sin(time * 9 + a.seed) * 8;
    ctx.beginPath(); ctx.moveTo(-27, wiggle); ctx.bezierCurveTo(-12, -9, 6, 4, 17, 0); ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.strokeStyle = '#152f2855'; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-27, wiggle - 3); ctx.bezierCurveTo(-12, -12, 6, 1, 17, -3); ctx.lineWidth = 9; ctx.strokeStyle = ['#b49a6b','#88d9b2','#7cdcff','#edc77f'][game.skillRank('loach')]; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-25, wiggle - 4); ctx.bezierCurveTo(-10, -12, 8, -1, 17, -4); ctx.lineWidth = 3; ctx.strokeStyle = '#dac193'; ctx.stroke();
    ellipse(ctx, 16, -4, 8, 5.5, '#cbb081'); ellipse(ctx, 19, -6, 1.5, 1.5, '#192d27');
    ctx.strokeStyle = '#dbc9a2'; ctx.lineWidth = 1; for (const side of [-1, 1]) { ctx.beginPath(); ctx.moveTo(22, -3); ctx.quadraticCurveTo(30, side * 8, 33, side * 3); ctx.stroke(); }
  } else {
    ctx.restore(); lily(ctx, a.x * sx, a.y * sy, 26 * unit, .7, '#719557'); ctx.save(); ctx.translate(a.x * sx, a.y * sy); ctx.scale(allyScale, allyScale); ctx.rotate(a.angle + Math.PI / 2);
    ellipse(ctx, -10, 5, 7, 5, '#426f40', -.5); ellipse(ctx, 10, 5, 7, 5, '#426f40', .5); ellipse(ctx, 0, 0, 11, 12, ['#8aad67','#b7df71','#72deda','#c4a0ff'][game.skillRank('frog')]); ellipse(ctx, 0, 3, 7, 8, '#b8ca84');
    ellipse(ctx, -7, -9, 5, 5, '#94b870'); ellipse(ctx, 7, -9, 5, 5, '#94b870'); ellipse(ctx, -7, -10, 2.3, 2.8, '#192f2a'); ellipse(ctx, 7, -10, 2.3, 2.8, '#192f2a');
  }
  ctx.restore();
}

function skillAura(id,x,y,radius,time,alpha=1) {
  if(!WEAPONS.some(w=>w.id===id))return;
  drawSkillEvolution(ctx,{id,tier:game.effectTier(id),rank:game.skillRank(id),x,y,radius,sx,sy,time,alpha,reducedMotion});
}
function drawFields(time) {
  for (const f of game.fields) {
    if(f.type==='bigbang'){drawBigBang(ctx,{t:1-f.remaining/1.2,width,height,rank:game.skillRank('bigbang'),charging:true,reducedMotion});continue;}
    skillAura(f.type,f.x,f.y,f.radius,time,.7);
    ctx.save(); ctx.translate(f.x * sx, f.y * sy);
    if (f.type === 'chorus') {
      for(let i=-1-game.skillRank('chorus');i<=1+game.skillRank('chorus');i++){
        const bounce=Math.max(0,Math.sin(time*5+i)) * 3*unit;ctx.save();ctx.translate(i*31*unit,(Math.abs(i)*10-bounce)*unit);ctx.scale(unit,unit);
        ellipse(ctx,0,7,19,9,'#23493288');ellipse(ctx,-11,9,9,5,'#587848');ellipse(ctx,11,9,9,5,'#587848');ellipse(ctx,0,0,17,15,'#a3b86d');ellipse(ctx,-10,-11,6,6,'#c4d786');ellipse(ctx,10,-11,6,6,'#c4d786');ellipse(ctx,-10,-12,2,3,'#25392d');ellipse(ctx,10,-12,2,3,'#25392d');ellipse(ctx,0,5,8+Math.max(0,Math.sin(time*5))*4,6,'#e4e7aa');ellipse(ctx,0,4,5,3+Math.max(0,Math.sin(time*5))*3,'#42573c');ctx.restore();
      }
      ctx.fillStyle='#d9f3af';ctx.font=`bold ${18*unit}px sans-serif`;ctx.fillText('♫',-50*unit,-25*unit);ctx.fillText('♪',37*unit,-35*unit);
    } else if (f.type === 'blackhole') {
      const r=f.radius*unit*(.6+game.skillRank('blackhole')*.1);ctx.rotate(time*2);ctx.scale(1,.72);const glow=ctx.createRadialGradient(0,0,r*.15,0,0,r);glow.addColorStop(0,'#0b001b');glow.addColorStop(.3,'#240939');glow.addColorStop(.45,'#e3b5ffbc');glow.addColorStop(.55,'#9d5fe25c');glow.addColorStop(1,'#603bb600');ellipse(ctx,0,0,r,r,glow);
      ctx.strokeStyle='#e8c4ff';ctx.lineWidth=2;ellipse(ctx,0,0,r*.48,r*.48);ctx.stroke();ellipse(ctx,0,0,r*.34,r*.34,'#0c0717');
      for(let i=0;i<7;i++){const a=time*3+i*.897,rr=r*(.55+.4*((time*.4+i*.17)%1));ellipse(ctx,Math.cos(a)*rr,Math.sin(a)*rr,3*unit,2*unit,'#e4a9ff');}
    } else if(f.type==='meteor') {
      ctx.globalAlpha=.5+Math.sin(time*18)*.2;ctx.strokeStyle='#ffad79';ctx.lineWidth=2;ctx.setLineDash([5,5]);ellipse(ctx,0,0,f.radius*sx,f.radius*sy);ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.moveTo(-12,0);ctx.lineTo(12,0);ctx.moveTo(0,-12);ctx.lineTo(0,12);ctx.stroke();
      if(f.remaining<.6){const offset=f.remaining/.6*height*.7;ctx.strokeStyle='#ffc371';ctx.lineWidth=9*unit;ctx.shadowColor='#ff8c46';ctx.shadowBlur=24;ctx.beginPath();ctx.moveTo(offset*.45,-offset);ctx.lineTo(offset*.45+45*unit,-offset-100*unit);ctx.stroke();const rank=game.skillRank('meteor');ellipse(ctx,offset*.45,-offset,(10+rank*9)*unit,(13+rank*10)*unit,rank===3?'#eadbff':'#fff1b2');if(rank){for(let k=0;k<rank*2;k++){const a=k*Math.PI/rank;ellipse(ctx,offset*.45+Math.cos(a)*35*unit,-offset+Math.sin(a)*35*unit,6*unit,9*unit,'#ffb75f');}}}
    } else if (f.type === 'vortex') {
      ctx.scale(sx, sy); ctx.rotate(-time * 2); ctx.globalAlpha = Math.min(1, f.remaining);
      for (let j = 0; j < 4; j++) { ctx.beginPath(); for (let i = 0; i < 70; i++) { const a = i / 15 + j * Math.PI / 2, r = 10 + i * 2.5; const x = Math.cos(a) * r, y = Math.sin(a) * r; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.strokeStyle = ['#a0d9c055','#b6e2ce30','#6ebda477','#d8f3d52a'][j]; ctx.lineWidth = 3; ctx.stroke(); }
      ellipse(ctx, 0, 0, 25, 25, '#082d3d77');
    } else { const fade = Math.min(1, f.remaining); ellipse(ctx, 0, 0, f.radius * sx, f.radius * sy, `rgba(168,231,248,${fade * .15})`); ctx.strokeStyle = `rgba(196,243,255,${fade * .4})`; ctx.lineWidth = 2; ctx.stroke(); }
    ctx.restore();
  }
}

function drawNet(x, y, swing = 0, opacity = 1) {
  const rx = Math.max(27, game.weaponRadius('net') * sx), ry = Math.max(23, game.weaponRadius('net') * sy);
  ctx.save(); ctx.translate(x, y - Math.sin(swing * Math.PI) * 13 * unit);
  ctx.rotate(-.4 + Math.sin(swing * Math.PI) * .12); ctx.globalAlpha *= opacity;
  // Handle and metal socket sit behind the hoop, not across its opening.
  ctx.lineCap = 'round'; ctx.strokeStyle = '#102d3266'; ctx.lineWidth = 10 * unit;
  ctx.beginPath(); ctx.moveTo(3 * unit, ry + 2 * unit); ctx.lineTo(3 * unit, ry + 68 * unit); ctx.stroke();
  const grip = ctx.createLinearGradient(-4 * unit, 0, 4 * unit, 0); grip.addColorStop(0, '#725337'); grip.addColorStop(.5, '#d8b77d'); grip.addColorStop(1, '#94704a');
  ctx.strokeStyle = grip; ctx.lineWidth = 7 * unit; ctx.beginPath(); ctx.moveTo(0, ry); ctx.lineTo(0, ry + 65 * unit); ctx.stroke();
  ctx.strokeStyle = '#8fb8b3'; ctx.lineWidth = 10 * unit; ctx.beginPath(); ctx.moveTo(0, ry - 2 * unit); ctx.lineTo(0, ry + 12 * unit); ctx.stroke();
  ctx.strokeStyle = '#3b625a'; ctx.lineWidth = 9 * unit; ctx.beginPath(); ctx.moveTo(0, ry + 49 * unit); ctx.lineTo(0, ry + 64 * unit); ctx.stroke();
  // Translucent hanging net, bounded to an oval so the weave never spills out.
  ellipse(ctx, 0, 10 * unit, rx * .91, ry * .99, '#081f3140');
  ctx.save(); ellipse(ctx, 0, 0, rx, ry); ctx.clip();
  const bag = ctx.createLinearGradient(0, -ry, 0, ry); bag.addColorStop(0, '#d7f4ec0d'); bag.addColorStop(1, '#c0ebe94a');
  ctx.fillStyle = bag; ctx.fillRect(-rx, -ry, rx * 2, ry * 2);
  ctx.strokeStyle = '#c3eae8b8'; ctx.lineWidth = 1.1 * unit;
  const step = Math.max(7 * unit, rx / 5);
  for (let offset = -rx - ry; offset <= rx + ry; offset += step) {
    ctx.beginPath(); ctx.moveTo(offset - ry, -ry); ctx.lineTo(offset + ry, ry); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(offset + ry, -ry); ctx.lineTo(offset - ry, ry); ctx.stroke();
  }
  ctx.restore();
  ellipse(ctx, 0, 0, rx, ry); ctx.strokeStyle = '#234e50'; ctx.lineWidth = 7 * unit; ctx.stroke();
  ctx.strokeStyle = ['#a9d8d1','#84ffc8','#95caff','#ffe28f'][game.skillRank('net')]; ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=reducedMotion?0:game.skillRank('net')*6;ctx.lineWidth = (4+game.skillRank('net')*2) * unit; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, 0, rx - unit, ry - unit, 0, Math.PI * 1.04, Math.PI * 1.86); ctx.strokeStyle = '#edfff1'; ctx.lineWidth = 1.5 * unit; ctx.stroke();
  ctx.restore();
}

function drawFlamethrower(x, y, firing = false, opacity = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(-.55); ctx.scale(unit*game.radiusScale('flame'), unit*game.radiusScale('flame')); ctx.globalAlpha *= opacity;
  // Two pressurized fuel tanks, a flexible feed hose, stock, trigger, and vented nozzle.
  ctx.strokeStyle='#071e2566';ctx.lineWidth=12;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(59,227);ctx.bezierCurveTo(70,270,-55,264,-14,195);ctx.stroke();
  ctx.strokeStyle='#273b3d';ctx.lineWidth=8;ctx.stroke();ctx.strokeStyle='#7d8d78';ctx.lineWidth=2;ctx.stroke();
  for(const tx of[43,68]){
    const fuel=ctx.createLinearGradient(tx-11,0,tx+11,0);fuel.addColorStop(0,'#753b2b');fuel.addColorStop(.45,'#db8050');fuel.addColorStop(1,'#9b482f');
    ctx.fillStyle=fuel;ctx.beginPath();ctx.roundRect(tx-11,157,23,74,10);ctx.fill();ctx.fillStyle='#354c43';ctx.fillRect(tx-12,171,25,7);ctx.fillRect(tx-12,214,25,7);ctx.fillStyle='#9aafa0';ctx.fillRect(tx-5,148,10,10);
  }
  ctx.strokeStyle='#dab174';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(43,149);ctx.lineTo(43,143);ctx.lineTo(67,143);ctx.lineTo(67,149);ctx.stroke();
  ellipse(ctx,54,183,9,9,'#1f3b37');ellipse(ctx,54,183,6,6,'#e5dab2');ctx.strokeStyle='#aa442f';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(54,183);ctx.lineTo(57,179);ctx.stroke();
  ctx.fillStyle='#e7bc72';ctx.font='bold 9px sans-serif';ctx.textAlign='center';ctx.fillText('FUEL',56,204);
  const metal=ctx.createLinearGradient(-17,0,17,0);metal.addColorStop(0,'#344748');metal.addColorStop(.4,'#b1c5b9');metal.addColorStop(.65,'#788e84');metal.addColorStop(1,'#253b3c');
  ctx.fillStyle='#233939';ctx.beginPath();ctx.roundRect(-23,163,46,45,7);ctx.fill();ctx.fillStyle='#577366';ctx.fillRect(-23,166,46,13);
  ctx.fillStyle='#d2b172';ctx.fillRect(-21,182,42,5);ctx.fillStyle='#263c37';ctx.beginPath();ctx.moveTo(-14,204);ctx.lineTo(-21,235);ctx.lineTo(-7,239);ctx.lineTo(3,205);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#a4b7a1';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(4,201);ctx.quadraticCurveTo(23,225,23,204);ctx.stroke();
  ctx.fillStyle=metal;ctx.fillRect(-12,113,24,52);ctx.strokeStyle='#273d3c';ctx.lineWidth=3;
  for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(-9,124+i*7);ctx.lineTo(9,124+i*7);ctx.stroke();}
  ctx.fillStyle='#455d55';ctx.fillRect(-18,105,36,12);ctx.fillStyle='#b6c2a6';ctx.fillRect(-19,101,38,5);ellipse(ctx,0,101,13,4,'#132d31');
  ctx.strokeStyle='#bfa66c';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(17,131);ctx.lineTo(23,131);ctx.lineTo(23,103);ctx.lineTo(9,97);ctx.stroke();
  if(!firing){ellipse(ctx,9,95,3,5,'#73caff');ctx.restore();return;}
  if(game.skillRank('flame')){drawEvolvedFlame(ctx,{rank:game.skillRank('flame'),time:visualTime,reducedMotion});ctx.restore();return;}
  const flicker=Math.sin(visualTime*39)*9;
  const halo=ctx.createRadialGradient(0,-3,10,0,-3,170);halo.addColorStop(0,'#ffbf4648');halo.addColorStop(1,'#fb6d2200');ellipse(ctx,0,-3,166,153,halo);
  const fire=ctx.createLinearGradient(0,102,0,-157);fire.addColorStop(0,'#b6e9ff');fire.addColorStop(.12,'#fff6bc');fire.addColorStop(.42,game.effectTier('flame')>=3?'#b8f7ff':'#ffe377');fire.addColorStop(.72,game.effectTier('flame')>=3?'#639dff':'#ff933c');fire.addColorStop(1,game.effectTier('flame')>=3?'#805dff00':'#f5522900');
  ctx.fillStyle=fire;ctx.beginPath();ctx.moveTo(-7,102);ctx.bezierCurveTo(-24,45,-127+flicker,15,-98,-102);ctx.quadraticCurveTo(-64,-57,-37,-147);ctx.quadraticCurveTo(-10,-82,10,-161+flicker);ctx.quadraticCurveTo(34,-84,70,-124);ctx.bezierCurveTo(152,-37,24,48,7,102);ctx.closePath();ctx.fill();
  ctx.fillStyle='#fff2b1dc';ctx.beginPath();ctx.moveTo(-4,101);ctx.bezierCurveTo(-8,46,-53,12,-27,-68);ctx.quadraticCurveTo(-3,-33,9,-90);ctx.bezierCurveTo(60,-9,5,62,4,101);ctx.fill();
  ctx.fillStyle='#d5f4ff';ctx.beginPath();ctx.moveTo(-4,101);ctx.quadraticCurveTo(-10,82,0,65);ctx.quadraticCurveTo(10,82,4,101);ctx.fill();
  ctx.restore();
}

function drawEffects() {
  for (const e of effects) {
    const skill=e.source || ({lightning:'electric',tongue:'frog',sonic:'chorus',sealBurst:'talisman'}[e.type]) || e.type;

    const t = 1 - e.life / e.max; ctx.save(); ctx.globalAlpha = Math.min(1, e.life * 5);
    if(e.type==='bigbang'){
      drawBigBang(ctx,{t,width,height,rank:game.skillRank('bigbang'),reducedMotion});
    } else if(e.type==='sonic'){
      ctx.translate(e.x*sx,e.y*sy);ctx.strokeStyle='#c9ee9e';ctx.lineWidth=(1-t)*5+1;
      for(let i=0;i<3;i++){const wave=Math.max(0,t-i*.13);ellipse(ctx,0,0,e.radius*sx*wave,e.radius*sy*wave);ctx.stroke();}
      ctx.fillStyle='#e2f7bc';ctx.font=`bold ${21*unit}px sans-serif`;for(let i=0;i<5;i++){const a=i*Math.PI*.4+t;ctx.fillText(i%2?'♪':'♫',Math.cos(a)*e.radius*sx*t,Math.sin(a)*e.radius*sy*t);}
    } else if(e.type==='rewind'){
      ctx.translate(e.x*sx,e.y*sy);ctx.rotate(-t*Math.PI*2);ctx.strokeStyle='#9de6ff';ctx.lineWidth=3*unit;ellipse(ctx,0,0,e.radius*sx*(1-t*.3),e.radius*sy*(1-t*.3));ctx.stroke();
      ctx.save();ctx.scale(sx,sy);for(let i=0;i<12;i++){const a=i*Math.PI/6;ctx.beginPath();ctx.moveTo(Math.cos(a)*e.radius*.72,Math.sin(a)*e.radius*.72);ctx.lineTo(Math.cos(a)*e.radius*.85,Math.sin(a)*e.radius*.85);ctx.stroke();}ctx.beginPath();ctx.moveTo(0,-85);ctx.lineTo(0,0);ctx.lineTo(58,27);ctx.stroke();ctx.restore();
    } else if(e.type==='talisman'||e.type==='sealBurst'){
      ctx.translate(e.x*sx,e.y*sy);const radius=e.radius*(.35+t*.8);ellipse(ctx,0,0,radius*sx,radius*sy,e.type==='sealBurst'?'#ffc56b25':null);ctx.strokeStyle=e.type==='sealBurst'?'#ffcd83':'#eac584';ctx.lineWidth=(1-t)*4+1;ctx.stroke();
      for(let i=0;i<6;i++){const a=i*Math.PI/3+t*1.5;ctx.save();ctx.translate(Math.cos(a)*radius*sx,Math.sin(a)*radius*sy);ctx.rotate(a);ctx.fillStyle='#f7d996';ctx.fillRect(-4*unit,-9*unit,8*unit,18*unit);ctx.strokeStyle='#b4543b';ctx.lineWidth=unit;ctx.beginPath();ctx.moveTo(0,-5*unit);ctx.lineTo(0,5*unit);ctx.moveTo(-2*unit,0);ctx.lineTo(2*unit,0);ctx.stroke();ctx.restore();}
    } else if (e.type === 'evolve') {
      ctx.translate(e.x*sx,e.y*sy);ctx.rotate(t*2);ctx.strokeStyle=EVOLUTIONS[e.rank].color;ctx.lineWidth=2;ellipse(ctx,0,0,(15+t*50)*unit,(15+t*50)*unit);ctx.stroke();for(let i=0;i<8;i++){const a=i*Math.PI/4;ctx.beginPath();ctx.moveTo(Math.cos(a)*20*unit,Math.sin(a)*20*unit);ctx.lineTo(Math.cos(a)*(35+t*30)*unit,Math.sin(a)*(35+t*30)*unit);ctx.stroke();}
    } else if(e.type==='detonate'){
      const r=e.radius*(.25+t);const color=e.source==='meteor'?'#ffb87d':'#d3a1ff';const glow=ctx.createRadialGradient(e.x*sx,e.y*sy,0,e.x*sx,e.y*sy,Math.max(r*sx,r*sy));glow.addColorStop(0,color+'9c');glow.addColorStop(.4,color+'35');glow.addColorStop(1,color+'00');ellipse(ctx,e.x*sx,e.y*sy,r*sx,r*sy,glow);ctx.strokeStyle=color;ctx.lineWidth=(1-t)*7;ctx.stroke();ellipse(ctx,e.x*sx,e.y*sy,r*sx*.7,r*sy*.7);ctx.lineWidth=2;ctx.stroke();
    } else if(e.source==='dragon'){
      const rank=game.skillRank('dragon');
      drawDragonSummon(ctx,{t,y:e.y*sy,width,unit,sy,rank,reducedMotion});
    } else if (e.type === 'thunderstorm') {
      drawThunderstorm(ctx, { t, width, height, strikes:e.strikes, sx, sy, reducedMotion, tier:game.effectTier('thunderstorm'),rank:game.skillRank('thunderstorm') });
    } else if (e.type === 'lightning') {
      ctx.lineWidth = (2.5+game.effectTier('electric')*.5) * unit; ctx.strokeStyle = game.effectTier('electric')>=3?'#d3c5ff':'#ddfbff'; ctx.shadowColor = '#8eeaff'; ctx.shadowBlur = 12;
      const links = e.links.length ? e.links : [{ from: { x: e.x, y: e.y - 55 }, to: { x: e.x, y: e.y + 55 } }];
      for (const link of links) { if(game.skillRank('electric')){drawEvolvedBolt(ctx,{...link,rank:game.skillRank('electric'),sx,sy,time:visualTime,reducedMotion});continue;} ctx.beginPath(); ctx.moveTo(link.from.x * sx, link.from.y * sy); for (let i = 1; i < 6; i++) { const p = i / 6; ctx.lineTo((link.from.x + (link.to.x - link.from.x) * p + (Math.random() - .5) * 25) * sx, (link.from.y + (link.to.y - link.from.y) * p + (Math.random() - .5) * 25) * sy); } ctx.lineTo(link.to.x * sx, link.to.y * sy); ctx.stroke(); }
    } else if (e.type === 'tongue') {
      ctx.beginPath(); ctx.moveTo(e.from.x * sx, e.from.y * sy); ctx.lineTo(e.to.x * sx, e.to.y * sy); ctx.strokeStyle = '#e2a0a0'; ctx.lineWidth = 3.5 * unit; ctx.stroke();
    } else if (e.type === 'ripple' || e.source === 'net') {
      const r = (e.radius || 65) * (.25 + t * .9); ellipse(ctx, e.x * sx, e.y * sy, r * sx, r * sy); ctx.strokeStyle = '#d9edbd'; ctx.lineWidth = 2 * unit; ctx.stroke();
      if (e.source === 'net') {
        drawNet(e.x * sx, e.y * sy, t);
      }
    } else if (e.source === 'flame') {
      if(e===effects.findLast(effect=>effect.source==='flame'))drawFlamethrower(e.x*sx,e.y*sy,true);
    } else if (e.source === 'palm') {
      drawPalmEchoes(ctx,{x:e.x,y:e.y,radius:e.radius,rank:game.skillRank('palm'),sx,sy});
      ctx.save();ctx.translate(e.x*sx,e.y*sy);ctx.rotate(t*.5);ctx.strokeStyle='#efd586';ctx.lineWidth=1.5;for(let j=0;j<3;j++){ellipse(ctx,0,0,(e.radius-25*j)*sx,(e.radius-25*j)*sy);ctx.stroke();}for(let j=0;j<12;j++){const a=j*Math.PI/6;ctx.beginPath();ctx.moveTo(Math.cos(a)*e.radius*.8*sx,Math.sin(a)*e.radius*.8*sy);ctx.lineTo(Math.cos(a)*e.radius*1.04*sx,Math.sin(a)*e.radius*1.04*sy);ctx.stroke();}ctx.restore();
      ellipse(ctx, e.x * sx, e.y * sy, e.radius * sx * (.55 + t), e.radius * sy * (.55 + t)); ctx.strokeStyle = '#f8db80'; ctx.lineWidth = (1 - t) * 8; ctx.stroke();
      ctx.translate(e.x * sx, e.y * sy - (1 - Math.min(1, t * 4)) * 100 * unit); const size = unit * (1.2 + Math.min(1, t * 4) * .7)*(1+game.skillRank('palm')*.22); ctx.scale(size, size); ctx.shadowColor = '#ffd45d'; ctx.shadowBlur = 30; ctx.fillStyle = '#e6c56bc9'; ctx.strokeStyle = '#fff0b3'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(-37, 43); ctx.lineTo(-69, -1); ctx.bezierCurveTo(-83, -27, -63, -41, -47, -14); ctx.lineTo(-37, 0); ctx.lineTo(-37, -65); ctx.bezierCurveTo(-37, -89, -17, -89, -17, -65); ctx.lineTo(-17, -90); ctx.bezierCurveTo(-17, -110, 4, -110, 4, -89); ctx.lineTo(4, -83); ctx.bezierCurveTo(4, -105, 26, -101, 26, -82); ctx.lineTo(26, -63); ctx.bezierCurveTo(26, -85, 47, -85, 47, -63); ctx.lineTo(47, 26); ctx.bezierCurveTo(47, 77, -22, 90, -37, 43); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.shadowBlur = 0; ctx.beginPath(); ctx.moveTo(-22, 8); ctx.quadraticCurveTo(0, -2, 22, 15); ctx.moveTo(-17, -62); ctx.lineTo(-17, -15); ctx.moveTo(4, -80); ctx.lineTo(4, -19); ctx.moveTo(26, -62); ctx.lineTo(26, -10); ctx.stroke();
    }
    ctx.restore();
    if(!['flame','bigbang'].includes(skill)) skillAura(skill,e.x??e.to?.x??500,e.y??e.to?.y??390,e.radius||(['thunderstorm','dragon'].includes(skill)?260:WEAPONS.find(w=>w.id===skill)?.radius)||60,visualTime,Math.min(1,e.life*5));
  }
}

let stoppedVisualTime=null;
function render(time) {
  if (!width || !height) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, width, height); ctx.save();
  if (shake > .1) ctx.translate((Math.random() - .5) * shake, (Math.random() - .5) * shake);
  ctx.drawImage(scenery, 0, 0, width, height);
  if(game.timeStopRemaining>0)drawTimeStop(ctx,{width,height,rank:game.skillRank('timestop')});
  if(game.level>=3){ctx.fillStyle=['','#43102d0c','#39236613','#4717521c','#66002e23'][Math.min(4,Math.floor(game.level/2))];ctx.fillRect(0,0,width,height);}
  // Tiny drifting lights give the scene life without obscuring targets.
  for (let i = 0; i < 16; i++) { const x = (.1 + .8 * ((i * .618) % 1)) * width + Math.sin(time * .23 + i) * 8, y = (.22 + .63 * ((i * .381) % 1)) * height + Math.cos(time * .3 + i) * 7; ellipse(ctx, x, y, 1.2 * unit, 1.2 * unit, `rgba(221,233,146,${.15 + (Math.sin(time + i * 2) + 1) * .15})`); }
  drawFields(time);
  const enemyTime=game.timeStopRemaining>0?(stoppedVisualTime??=time):(stoppedVisualTime=null,time);
  for (const e of game.enemies) if (stageOf(e) !== 'adult') drawEnemy(e, enemyTime);
  for (const a of game.allies) drawAlly(a, time);
  for (const e of game.enemies) if (stageOf(e) === 'adult') drawEnemy(e, enemyTime);
  drawEffects();
  for (const p of particles) { ctx.globalAlpha = Math.min(1, p.life / .35); ellipse(ctx, p.x * sx, p.y * sy, p.size * unit, p.size * unit, p.color); }
  ctx.globalAlpha = 1;
  for (const f of floating) { ctx.save(); ctx.globalAlpha = Math.min(1, f.life * 2); ctx.fillStyle = f.color; ctx.font = `700 ${Math.max(12, 15 * unit)}px 'Noto Sans KR',sans-serif`; ctx.textAlign = 'center'; ctx.shadowColor = '#12382c'; ctx.shadowBlur = 5; ctx.fillText(f.text, f.x * sx, f.y * sy); ctx.restore(); }
  if (pointer.inside && game.status === 'playing') {
    const w = {...WEAPONS.find(w => w.id === selected),radius:game.weaponRadius(selected)}, ready = game.isUnlocked(selected) && game.cooldowns[selected] <= 0 && !(selected === 'flame' && game.overheated);
    ctx.save(); ctx.setLineDash([5, 6]); ctx.lineWidth = 1; ctx.strokeStyle = ready ? '#e6eccb80' : '#e8af8670'; ctx.fillStyle=ready?'#d8f5ab0c':'#e8af860c';
    if(selected==='dragon') {
      const top=Math.max(0,pointer.y-w.radius)*sy,bottom=Math.min(700,pointer.y+w.radius)*sy;
      ctx.fillRect(0,top,width,bottom-top);ctx.strokeRect(0,top,width,bottom-top);
    } else if(['thunderstorm','timestop','bigbang'].includes(selected)) {
      ctx.fillRect(0,0,width,height);ctx.strokeRect(3,3,width-6,height-6);
    } else if(selected==='meteor') {
      for(let i=0;i<5;i++) {const a=i/4*Math.PI*2,r=i===0?0:85;ellipse(ctx,(pointer.x+Math.cos(a)*r)*sx,(pointer.y+Math.sin(a)*r)*sy,135*game.radiusScale('meteor')*sx,135*game.radiusScale('meteor')*sy);ctx.stroke();}
    } else {ellipse(ctx,pointer.x*sx,pointer.y*sy,w.radius*sx,w.radius*sy);ctx.fill();ctx.stroke();}
    ctx.setLineDash([]);
    ellipse(ctx, pointer.x * sx, pointer.y * sy, 2, 2, ready ? '#eef4cf' : '#e8af86'); ctx.restore();
    if (selected === 'net' && !effects.some(e => e.source === 'net')) drawNet(pointer.x * sx, pointer.y * sy, 0, .8);
    if (selected === 'flame' && !effects.some(e => e.source === 'flame')) drawFlamethrower(pointer.x * sx, pointer.y * sy, false, game.isUnlocked('flame') ? .9 : .4);
  }
  if (game.danger > 0) { ctx.fillStyle = `rgba(226,81,49,${.035 + Math.sin(time * 7) * .015})`; ctx.fillRect(0, 0, width, height); }
  if(flash>0&&!reducedMotion){ctx.fillStyle=`rgba(${flashColor},${Math.min(.2,flash)})`;ctx.fillRect(0,0,width,height);}
  ctx.restore();
}
let hudTick = 0;
function frame(now) {
  const dt = Math.min((now - (lastTime || now)) / 1000, .05); lastTime = now;
  if (game.status !== 'paused') visualTime += dt;
  if (game.status === 'playing') {
    game.update(dt);
    if (pointer.down && ['net', 'flame'].includes(selected)) useWeapon(false, dt);
    processEvents();
    if(game.status === 'playing') sound.update(game.level, game.danger);
    hudTick += dt; if (hudTick > .075 || game.status !== 'playing') { medals.check(); updateHUD(); hudTick = 0; }
  }
  if (game.status !== 'paused') {
    for (const p of particles) { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= Math.exp(-dt * 2); p.vy += 15 * dt; }
    particles = particles.filter(p => p.life > 0);
    for (const e of effects) e.life -= dt; effects = effects.filter(e => e.life > 0);
    for (const f of floating) { f.life -= dt; f.y -= dt * 23; } floating = floating.filter(f => f.life > 0);
    shake *= Math.exp(-dt * 12);
    flash=Math.max(0,flash-dt*1.7);announcementTimer-=dt;if(announcementTimer<=0)$('wave-announcement').classList.remove('visible');
    toastTimer -= dt; if (toastTimer <= 0) $('toast').classList.remove('visible');
  }
  render(visualTime); requestAnimationFrame(frame);
}
const progression=setupProgression({game,pause:pauseGame,resume:resumeGame,onSelect:p=>{
  if(p.weapon){const rank=game.skillRank(p.weapon);announce(`SKILL EVOLUTION · LV ${rank}`,SKILL_FORMS[p.weapon][rank-1],`${p.name} · 새로운 모습으로 각성`);burst(500,390,rank===3?'#ffe7a0':'#b9eaff',48,170);}
  toast(`${p.name} 강화 완료!`);tone(660,.2,'triangle',.08,990);updateHUD();
}});
const medals=setupAchievements({game,mode:()=>runMode,pause:pauseGame,resume:resumeGame,onUnlock:items=>{toast(`훈장 획득! ${items.map(a=>a.name).join(' · ')}`);tone(880,.3,'triangle',.07,1320);}});
resize(); updateHUD(); requestAnimationFrame(frame);

setupSharing({ pause: () => { const playing = game.status === 'playing'; if (playing) pauseGame(); return playing; }, resume: resumeGame, result:()=>game.status==='lost'?`모기 없는 밤 · ${challenge?challenge.date+' 오늘의 연못':'무한 생존'}\n${game.score.toLocaleString()}점 / WAVE ${game.level} / ${game.kills}마리 처치\n최고 ${game.bestStreak}연속 처치 · 여왕 ${game.bossKills}마리\n나의 기록에 도전해 보세요!`:null });
let guidePaused = false;
$('guide-btn').addEventListener('click', () => {
  guidePaused = game.status === 'playing'; if (guidePaused) pauseGame();
  $('guide-dialog').showModal();
});
$('close-guide-btn').addEventListener('click', () => $('guide-dialog').close());
$('guide-dialog').addEventListener('close', () => { if (guidePaused) resumeGame(); guidePaused = false; });
for (const species of SPECIES) {
  const card = document.createElement('article'); card.className = 'monster-card';
  const preview = document.createElement('canvas'); preview.width = 300; preview.height = 180;
  preview.setAttribute('aria-label', species.name + ' 외형'); preview.setAttribute('role', 'img');
  const brush = preview.getContext('2d'); brush.translate(145,95); brush.scale(2.6,2.6);
  drawMonster(brush, { species: species.id, rank: 2, seed: 2 }, .3);
  const name = document.createElement('h3'); name.textContent = species.name;
  const info = document.createElement('p'); info.textContent = `W${species.wave}부터 · ${species.detail}`;
  card.append(preview,name,info); $('monster-gallery').append(card);
}
