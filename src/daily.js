// A date and a seeded generator are enough for a shared challenge; no server required.
export function koreanDate(now = new Date()) {
  return new Date(now.getTime()+9*60*60*1000).toISOString().slice(0,10);
}
export function seededRandom(seed) {
  let value = 2166136261;
  for(const char of seed) value = Math.imul(value ^ char.charCodeAt(0),16777619);
  return () => {
    value = (value+0x6D2B79F5)|0;
    let t = Math.imul(value ^ value>>>15,1|value);
    t ^= t+Math.imul(t ^ t>>>7,61|t);
    return ((t ^ t>>>14)>>>0)/4294967296;
  };
}
const THEMES = [
  {name:'강철 그물의 밤',upgrade:'netcraft',description:'뜰채 피해 +1 · 범위 +8로 시작'},
  {name:'특공대 출동',upgrade:'pack',description:'지원군 공격 속도 +20%로 시작'},
  {name:'분노한 연못',upgrade:'power',description:'모든 공격 피해 +12%로 시작'},
  {name:'쉴 틈 없는 반격',upgrade:'tempo',description:'스킬 재사용 회복 +12%로 시작'},
];
export function dailyChallenge(date=koreanDate()) {
  const index=Math.floor(Date.parse(date+'T00:00:00Z')/86400000)%THEMES.length;
  return {date,seed:`pond-daily-v1:${date}`,...THEMES[index]};
}
export function saveDailyRecord(records,date,run) {
  const safe={};
  if(records && typeof records==='object') for(const [key,value] of Object.entries(records)) {
    if(/^\d{4}-\d{2}-\d{2}$/.test(key) && Number.isFinite(value?.score) && value.score>=0 && Number.isFinite(value?.level) && value.level>=1) safe[key]={score:Math.floor(value.score),level:Math.floor(value.level)};
  }
  const previous=safe[date] || {score:0,level:1};
  safe[date]={score:Math.max(previous.score,run.score),level:Math.max(previous.level,run.level)};
  return Object.fromEntries(Object.entries(safe).sort(([a],[b])=>b.localeCompare(a)).slice(0,14));
}
