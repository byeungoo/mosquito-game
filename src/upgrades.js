export const UPGRADES = [
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
  return pool.slice(0,3).map(p=>p.id);
}
