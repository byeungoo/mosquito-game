export const SKILL_MAX_RANK=5;
export const upgradeRequiredWave=(spec,owned)=>spec.weapon?Math.max(spec.minWave,(owned[spec.id]||0)>=4?18:(owned[spec.id]||0)>=3?12:0):spec.minWave;
export const SKILL_FORMS = {
  net:['빛의 그물','빙광 그물','황금 봉인망'],loach:['비취 수호어','창해 수호어','황금 용어'],electric:['분기 뇌격','자색 뇌룡','황금 심판'],
  flame:['삼중 화염','오중 청염','불사조 백염'],vortex:['격류 회오리','폭풍의 눈','해신의 소용돌이'],frog:['비취 특공대','청해 특공대','왕관 특공대'],
  freeze:['서리 수정','빙하의 왕관','절대 빙옥'],palm:['연화 신장','거신의 손','천수 연화진'],dragon:['쌍룡 승천','삼룡 뇌해','사해 용왕'],
  blackhole:['중력 고리','이중 특이점','재앙의 눈'],meteor:['작열 운석','파편 군집','천체 붕괴'],chorus:['오중 합창','칠중 공명','구중 대합창'],
  rewind:['시간의 고리','이중 시계','삼중 시간진'],talisman:['빛의 부적','봉마 결계','황금 봉인진'],thunderstorm:['분기 낙뢰','자색 폭풍','천벌의 그물'],
  timestop:['정지된 순간','영원의 경계','시간의 지배자'],bigbang:['초신성','은하 붕괴','우주 창세'],
  sanctuary:['연화 결계','치유의 호수','생명의 정원'],orbital:['광자 포격','플라스마 기둥','천공의 심판'],
};
const ascended={net:['별빛 포획진','차원 봉인망'],loach:['태양 용어','천둥 신룡어'],frog:['연꽃 선인','천상 두꺼비왕'],electric:['성운 뇌격','차원 번개'],flame:['태양의 날개','백금 태양신'],vortex:['천공 해일','차원 소용돌이'],freeze:['영겁의 빙하','시간마저 얼리는 별'],palm:['천수 관음','우주를 받치는 손'],dragon:['오룡 해신제','육룡 천상강림'],blackhole:['은하 포식자','사건의 지평선'],meteor:['행성 파쇄','별의 장례식'],chorus:['천상 합창','세계의 공명'],rewind:['운명의 회귀','태초의 시계'],talisman:['천만 부적','인과 봉인'],thunderstorm:['뇌신의 행차','만뢰 천벌'],timestop:['멈춰버린 세계','영원의 주인'],bigbang:['다중 우주','새로운 창세'],sanctuary:['불멸의 연꽃','세계수의 연못'],orbital:['궤도 섬멸','태양의 창']};
for(const [id,names] of Object.entries(ascended))SKILL_FORMS[id].push(...names);
export const SKILL_UPGRADES = [
  ['net','대왕 뜰채','net',2],['loach','미꾸라지','fish',2],['electric','전기 방전봉','bolt',2],
  ['flame','화염 방사기','flamethrower',3],['vortex','소용돌이','vortex',4],['frog','개구리 특공대','frog',5],
  ['freeze','절대 영도','snow',6],['palm','여래신장','palm',7],['dragon','용왕 강림','dragon',8],
  ['blackhole','모기 블랙홀','blackhole',9],['meteor','천벌 유성우','meteor',10],
  ['chorus','두꺼비 합창','chorus',4],['rewind','시간 되감기','rewind',5],['talisman','연쇄 부적','talisman',7],['thunderstorm','천뢰난무','bolt',11],
  ['timestop','타임스톱','rewind',6],['bigbang','빅뱅 어택','bigbang',12],
  ['sanctuary','연꽃 성역','lotus',9],['orbital','궤도 레이저','orbital',14],
].map(([weapon,name,icon,minWave])=>({id:`skill_${weapon}`,weapon,name:`${name} 진화`,icon,minWave,max:SKILL_MAX_RANK,category:'기술 진화',description:
  weapon==='orbital'?'전장 전체 포격 피해 +20%. 레이저 기둥과 궤도 고리가 더욱 화려해집니다.':
  weapon==='sanctuary'?'피해 +20%, 반경 +6%. 정화량과 연꽃 결계가 함께 성장합니다.':
  weapon==='timestop'?'시간 정지 +1초. 신규 출현과 적의 시간이 멈추며 시계 결계가 진화합니다.':
  weapon==='bigbang'?'전장 전체 피해 +20%. 초신성 → 은하 붕괴 → 우주 창세로 대폭발이 진화합니다.':
  weapon==='dragon'?'용 1마리 추가! 총 피해 +20%, 반경 +6%. 거대한 파도와 낙뢰가 강화됩니다.':
  weapon==='vortex'?'반경 +6%, 흡입 시간 +1초. 소용돌이의 물결과 회전 날개가 진화합니다.':
  weapon==='freeze'?'반경 +6%, 일반 적 빙결 +0.75초. 얼음 결정과 서리 고리가 진화합니다.':
  weapon==='rewind'?'반경 +6%, 유충 성장 되감기 +2초. 시계와 시간 잔상이 진화합니다.':
  ['loach','frog'].includes(weapon)?'지원군 피해 +20%. 이미 배치한 지원군의 오라와 공격도 함께 진화합니다.':
  weapon==='thunderstorm'?'전장 전체 벼락 피해 +20%. 번개 가지와 폭풍의 빛이 진화합니다.':
  '피해 +20%, 반경 +6%. 이 기술의 빛·잔상·충격파가 단계별로 진화합니다.'}));
export const UPGRADES = [
  ...SKILL_UPGRADES,
  { id: 'netcraft', name: '강철 그물', icon: 'net', minWave: 2, max: 2, category: '직접 공격', description: '뜰채 피해 +1, 반경 +8. 성충도 시원하게 걷어내세요.' },
  { id: 'tempo', name: '재장전의 달인', icon: 'rewind', minWave: 2, max: 3, category: '스킬 순환', description: '소환·스킬 재사용 게이지가 12% 더 빠르게 회복됩니다. 뜰채·화염 제외.' },
  { id: 'pack', name: '특공대 훈련', icon: 'frog', minWave: 2, max: 2, category: '자동 사냥', description: '미꾸라지·개구리의 공격 주기가 20% 더 빠르게 회복됩니다.' },
  { id: 'power', name: '연못의 분노', icon: 'bolt', minWave: 2, max: 3, category: '모든 공격', description: '모든 무기와 지원군의 피해 +12%.' },
  { id: 'fuel', name: '극저온 연료통', icon: 'flamethrower', minWave: 3, max: 2, category: '화염 특화', description: '화염 분사 중 열 발생 −15%. 더 오래 누르고 태우세요.' },
  { id: 'hunter', name: '괴수 사냥꾼', icon: 'dragon', minWave: 5, max: 2, category: '보스 사냥', description: '사신과 여왕에게 주는 피해 +25%.' },
  { id: 'icecraft', name: '빙결 공명', icon: 'snow', minWave: 6, max: 2, category: '빙결 조합', description: '얼린 적의 피해 배율 +0.15, 일반 적 빙결 시간 +1초.' },
  { id: 'ward', name: '연못의 가호', icon: 'talisman', minWave: 5, max: 1, category: '최후의 방어', description: '이번 판에 한 번, 붕괴를 막고 위험 게이지를 초기화하며 모든 적을 3초간 얼립니다.' },
];

export function offerUpgrades(level, owned, random, excluded=[]) {
  const pool = UPGRADES.filter(p => !excluded.includes(p.id) && upgradeRequiredWave(p,owned) <= level && (owned[p.id] || 0) < p.max);
  // Fisher–Yates without changing the shared catalog.
  for(let i=pool.length-1;i>0;i--) {
    const j=Math.min(i,Math.floor(random()*(i+1)));
    [pool[i],pool[j]]=[pool[j],pool[i]];
  }
  const skills=pool.filter(p=>p.weapon), repeat=skills.find(p=>owned[p.id]>0), chosen=[];
  // Always offer an unfinished specialization again so a focused build is achievable.
  if(repeat)chosen.push(repeat);
  for(const p of skills) if(chosen.length<2 && !chosen.includes(p))chosen.push(p);
  const general=pool.find(p=>!p.weapon);if(general)chosen.push(general);
  for(const p of pool)if(chosen.length<3 && !chosen.includes(p))chosen.push(p);
  return chosen.slice(0,3).map(p=>p.id);
}
