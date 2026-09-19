export const SKILL_UPGRADES = [
  ['net','대왕 뜰채','net',2],['loach','미꾸라지','fish',2],['electric','전기 방전봉','bolt',2],
  ['flame','화염 방사기','flamethrower',3],['vortex','소용돌이','vortex',4],['frog','개구리 특공대','frog',5],
  ['freeze','절대 영도','snow',6],['palm','여래신장','palm',7],['dragon','용왕 강림','dragon',8],
  ['blackhole','모기 블랙홀','blackhole',9],['meteor','천벌 유성우','meteor',10],
  ['chorus','두꺼비 합창','chorus',4],['rewind','시간 되감기','rewind',5],['talisman','연쇄 부적','talisman',7],['thunderstorm','천뢰난무','bolt',11],
].map(([weapon,name,icon,minWave])=>({id:`skill_${weapon}`,weapon,name:`${name} 진화`,icon,minWave,max:3,category:'기술 진화',description:
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

export function offerUpgrades(level, owned, random) {
  const pool = UPGRADES.filter(p => p.minWave <= level && (owned[p.id] || 0) < p.max);
  // Fisher–Yates without changing the shared catalog.
  for(let i=pool.length-1;i>0;i--) {
    const j=Math.min(i,Math.floor(random()*(i+1)));
    [pool[i],pool[j]]=[pool[j],pool[i]];
  }
  const skills=pool.filter(p=>p.weapon), repeat=skills.find(p=>owned[p.id]>0), chosen=[];
  // Always offer an unfinished specialization again so a three-rank build is achievable.
  if(repeat)chosen.push(repeat);
  for(const p of skills) if(chosen.length<2 && !chosen.includes(p))chosen.push(p);
  const general=pool.find(p=>!p.weapon);if(general)chosen.push(general);
  for(const p of pool)if(chosen.length<3 && !chosen.includes(p))chosen.push(p);
  return chosen.slice(0,3).map(p=>p.id);
}
