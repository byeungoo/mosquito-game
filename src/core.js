import { speciesForSpawn } from './monsters.js';
export const WORLD = { width: 1000, height: 700 };
export const THREAT_LIMIT = 30;
export const WAVE_SECONDS = 22;
export const EVOLUTION_SECONDS = 15;
export const ALLY_LIMITS = { loach: 10, frog: 10 };
export const ALLY_ATTACK_INTERVALS = { loach: 1.5, frog: 1.3 };
export const maxRankForLevel = level => level >= 8 ? 4 : level >= 5 ? 3 : level >= 3 ? 2 : 1;
// Blend encounter rates rather than rounding enemy batches upward at every wave.
export function spawnRateForLevel(level) {
  const denseRate = Math.min(10, 3 + Math.floor(level / 2)) / Math.max(.45, 1.65 - level * .09);
  const steadyRate = Math.min(10, 3 + Math.floor(level / 3)) / Math.max(.6, 1.65 - (level - 1) * .05);
  return (denseRate + steadyRate) / 2;
}
export const EVOLUTIONS = [
  { name: '일반 모기', hp: 2, threat: 1, scale: 1, color: '#dac393', speed: 1, points: 2 },
  { name: '흡혈종', hp: 5, threat: 2, scale: 1.35, color: '#ed866f', speed: 1.35, points: 5 },
  { name: '철갑종', hp: 11, threat: 3, scale: 1.7, color: '#abc5e8', speed: 1.05, points: 12 },
  { name: '사신종', hp: 20, threat: 5, scale: 2.05, color: '#d29aff', speed: 1.6, points: 25 },
  { name: '재앙의 여왕', hp: 65, threat: 10, scale: 3.2, color: '#ff638e', speed: .8, points: 100 },
];
export const WEAPONS = [
  { id: 'net', key: '1', unlock: 1, name: '대왕 뜰채', icon: 'net', tag: '기본 공격 · 물속 + 공중', cooldown: .48, radius: 56, damage: 1, description: '물속은 한 번에, 일반 성충은 두 번! 드래그로 연속 공격해요.', hint: '클릭 / 드래그 · 기본 피해 1, 성충도 공격 가능' },
  { id: 'loach', key: '2', unlock: 1, name: '미꾸라지', icon: 'fish', tag: '자동 사냥 · 물속', cooldown: 17, radius: 35, damage: 1, description: '물속을 자동 사냥해요. 최대 10마리. 진화 유충은 여러 번 공격해야 해요.', hint: '클릭 · 물속 자동 방어 (최대 10마리)' },
  { id: 'electric', key: '3', unlock: 2, name: '전기 방전봉', icon: 'bolt', tag: '광역 연쇄 · 피해 3', cooldown: 5, radius: 165, chainRadius: 145, damage: 3, description: '넓은 범위에서 최대 16마리를 감전시켜요. 멀리 떨어진 적에게도 번개가 이어집니다.', hint: '클릭 · 넓어진 범위와 길어진 연쇄 번개' },
  { id: 'flame', key: '4', unlock: 3, name: '화염 방사기', icon: 'flamethrower', tag: '지속 화염 · 초당 피해 16', cooldown: .12, radius: 155, damage: 1, dps: 16, heatPerSecond: 25, description: '연못을 누르고 있으면 범위 안 성충에게 초당 피해 16! 약 4초 연속 분사하며, 드래그로 조준할 수 있어요.', hint: '연못을 누른 채 유지 / 드래그 · 초당 피해 16 · 과열 시 잠시 냉각' },
  { id: 'vortex', key: '5', unlock: 4, name: '소용돌이', icon: 'vortex', tag: '제어 · 물속 + 공중', cooldown: 13, radius: 205, description: '5초 동안 모든 적을 끌어모아요. 거대한 괴물은 흡입에 저항해요.', hint: '클릭 · 모아둔 괴물에게 범위 공격을 연결하세요' },
  { id: 'frog', key: '6', unlock: 5, name: '개구리 특공대', icon: 'frog', tag: '고속 자동 사냥 · 공중 피해 3', cooldown: 20, radius: 35, damage: 3, description: '1.3초마다 빠르게 혀를 뻗어 공격해요. 최대 10마리로 공중을 지켜주세요.', hint: '클릭 · 1.3초마다 공격하는 지원군 (최대 10마리)' },
  { id: 'freeze', key: '7', unlock: 6, name: '절대 영도', icon: 'snow', tag: '빙결 · 후속 피해 증가', cooldown: 15, radius: 180, description: '성장과 이동을 5초간 정지. 얼어붙은 적은 피해를 1.5배 받아요.', hint: '클릭 · 얼린 뒤 강한 공격으로 산산조각!' },
  { id: 'palm', key: '8', unlock: 7, name: '여래신장', icon: 'palm', tag: '궁극기 · 피해 18', cooldown: 27, radius: 255, damage: 18, description: '황금 손바닥으로 강타! 여왕은 살아남을 수 있어요. 빙결과 조합하세요.', hint: '클릭 · 황금 손바닥, 넓은 범위에 피해 18' },
  { id: 'dragon', key: '9', unlock: 8, name: '용왕 강림', icon: 'dragon', tag: '전설 · 전장 관통', cooldown: 32, radius: 120, damage: 25, description: '지정한 높이로 용이 솟아올라 전장을 가로지르며 피해 25를 줘요.', hint: '클릭 · 선택한 높이의 가로 영역을 용왕이 관통' },
  { id: 'blackhole', key: '0', unlock: 9, name: '모기 블랙홀', icon: 'blackhole', tag: '전설 · 압축 폭발', cooldown: 30, radius: 270, damage: 32, description: '3초 동안 적을 빨아들인 뒤 중심을 폭발시켜 피해 32를 줘요.', hint: '클릭 · 중력으로 끌어모은 뒤 압축 폭발' },
  { id: 'meteor', key: '-', unlock: 10, name: '천벌 유성우', icon: 'meteor', tag: '재앙 · 다중 폭격', cooldown: 38, radius: 230, damage: 20, description: '유성 다섯 발이 차례로 떨어져요. 겹치는 폭발은 피해가 누적돼요.', hint: '클릭 · 유성 5발로 괴물 떼를 집중 폭격' },
  { id: 'chorus', key: 'q', unlock: 4, name: '두꺼비 합창', icon: 'chorus', tag: '공명 · 반복 충격파', cooldown: 18, radius: 220, description: '4초 동안 네 번 우렁차게 합창해요! 충격파마다 피해 2를 주고 적을 밀어냅니다.', hint: '클릭 · 합창단 소환, 네 번의 광역 충격파' },
  { id: 'rewind', key: 'w', unlock: 5, name: '시간 되감기', icon: 'rewind', tag: '시간 마법 · 진화 퇴행', cooldown: 26, radius: 195, description: '변이종은 한 등급 퇴행, 일반 모기는 유충으로! 여왕에게는 2.5초 정지로 적용돼요.', hint: '클릭 · 성장을 되돌려 위험도를 줄이세요' },
  { id: 'talisman', key: 'e', unlock: 7, name: '연쇄 부적', icon: 'talisman', tag: '주술 · 처치 시 연쇄 폭발', cooldown: 21, radius: 200, description: '12초 동안 적에게 부적을 붙여요. 처치하면 주변에 피해 8! 다른 부적도 연쇄 폭발합니다.', hint: '클릭 · 부적을 붙인 뒤 뜰채·번개로 폭발을 시작하세요' },
  { id: 'thunderstorm', key: 'r', unlock: 11, name: '천뢰난무', icon: 'bolt', tag: '필살기 · 전장 전체', cooldown: 45, radius: 1200, damage: 24, description: '연못 전체에 벼락을 쏟아 모든 적에게 피해 24! 재사용 45초. 빙결과 조합하면 더욱 강력해요.', hint: 'R 선택 후 클릭 · 전장 전체에 벼락 / 피해 24' },
];
export const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export const stageOf = e => e.age < 4 ? 'egg' : e.age < 15 ? 'larva' : e.age < 20 ? 'pupa' : 'adult';
export const evolutionOf = e => EVOLUTIONS[e.rank || 0];
export function pondPoint(x, y) {
  const dx = (x - 500) / 440, dy = (y - 390) / 263, length = Math.hypot(dx, dy);
  return length > .95 ? { x: 500 + dx / length * 440 * .95, y: 390 + dy / length * 263 * .95 } : { x, y };
}

// Reflect only outward motion at the bank. Repeated clamping must not rotate an animal.
export function reflectAtPondEdge(entity) {
  const point = pondPoint(entity.x, entity.y);
  if (Math.hypot(point.x - entity.x, point.y - entity.y) < 1e-6) return;
  const gx = (point.x - 500) / (440 * 440), gy = (point.y - 390) / (263 * 263);
  const length = Math.hypot(gx, gy), nx = gx / length, ny = gy / length;
  const vx = Math.cos(entity.angle), vy = Math.sin(entity.angle), outward = vx * nx + vy * ny;
  entity.x = point.x - nx * 1.5; entity.y = point.y - ny * 1.5;
  if (outward > 0) entity.angle = Math.atan2(vy - 2 * outward * ny, vx - 2 * outward * nx);
  entity.turn = Math.max(entity.turn || 0, .8);
}

function separateLoaches(allies) {
  const fish = allies.filter(a => a.type === 'loach');
  for (let pass = 0; pass < 3; pass++) {
    for (let i = 0; i < fish.length; i++) for (let j = i + 1; j < fish.length; j++) {
      const a = fish[i], b = fish[j], dx = a.x - b.x, dy = a.y - b.y, length = Math.hypot(dx, dy);
      if (length >= 29) continue;
      const angle = length > .001 ? Math.atan2(dy, dx) : (a.id * 2.399 + b.id * .73);
      const shift = (29 - length) * .5, px = Math.cos(angle) * shift, py = Math.sin(angle) * shift;
      a.x += px; a.y += py; b.x -= px; b.y -= py;
    }
    for (const a of fish) reflectAtPondEdge(a);
  }
}

export class PondGame {
  constructor(random = Math.random) { this.random = random; this.reset(); }
  reset() {
    this.status = 'ready'; this.elapsed = 0; this.level = 1; this.kills = 0; this.score = 0; this.bestCombo = 0; this.bossKills = 0;
    this.danger = 0; this.enemies = []; this.allies = []; this.fields = []; this.events = [];
    this.cooldowns = Object.fromEntries(WEAPONS.map(w => [w.id, 0]));
    this.spawnTimer = .7; this.nextId = 1; this.heat = 0; this.overheated = false; this.flameUntil = 0;
    for (let i = 0; i < 22; i++) this.spawn(this.random() * 15);
  }
  start() { this.reset(); this.status = 'playing'; }
  get adults() { return this.enemies.reduce((n, e) => n + (stageOf(e) === 'adult' ? 1 : 0), 0); }
  get threat() { return this.enemies.reduce((n, e) => n + (stageOf(e) === 'adult' ? evolutionOf(e).threat : 0), 0); }
  get waveProgress() { return (this.elapsed % WAVE_SECONDS) / WAVE_SECONDS; }
  isUnlocked(id) { return WEAPONS.some(w => w.id === id && this.level >= w.unlock); }
  spawn(age = 0, rank = Math.min(3, Math.floor((this.level - 1) / 3.5))) {
    if (this.enemies.length >= 240) return null;
    const angle = this.random() * Math.PI * 2, radius = Math.sqrt(this.random()) * .85;
    const hp = age >= 20 ? EVOLUTIONS[rank].hp : 1 + Math.floor(rank / 2);
    const e = { id: this.nextId++, x: 500 + Math.cos(angle) * 420 * radius, y: 390 + Math.sin(angle) * 245 * radius, age, rank, hp, maxHp: hp, evolve: 0, breed: 0, angle: this.random() * Math.PI * 2, seed: this.random() * 100, frozen: 0, turn: 0, hit: 0, sealed: 0 };
    e.species = speciesForSpawn(e.id, this.level);
    this.enemies.push(e); return e;
  }
  emit(type, data = {}) { this.events.push({ type, ...data }); }
  drainEvents() { return this.events.splice(0); }
  damage(targets, amount, source, x, y) {
    if (!targets.length) return 0;
    const dead = [], alive = [];
    for (const e of targets) {
      e.hp -= amount * (e.frozen > 0 ? 1.5 : 1); e.hit = .15;
      if (e.hp <= 0) dead.push(e); else alive.push({ x: e.x, y: e.y, amount: amount * (e.frozen > 0 ? 1.5 : 1), rank: e.rank });
    }
    if (alive.length) this.emit('damage', { targets: alive, source });
    if (!dead.length) return 0;
    const ids = new Set(dead.map(e => e.id)); this.enemies = this.enemies.filter(e => !ids.has(e.id));
    this.kills += dead.length; this.bestCombo = Math.max(this.bestCombo, dead.length);
    for (const e of dead) { this.score += stageOf(e) === 'adult' ? evolutionOf(e).points : 1 + e.rank; if (e.rank === 4 && stageOf(e) === 'adult') { this.bossKills++; this.emit('bossKilled', { x: e.x, y: e.y }); } }
    this.emit('kills', { targets: dead.map(e => ({ x: e.x, y: e.y, adult: stageOf(e) === 'adult', frozen: e.frozen > 0, rank: e.rank })), count: dead.length, source, x, y });
    // Remove this batch before resolving chained seals so every enemy scores once.
    for (const e of dead) {
      if (e.sealed > 0) {
        this.emit('sealBurst', { x: e.x, y: e.y, radius: 125 });
        this.damage(this.enemies.filter(other => distance(other, e) <= 125), 8, 'talisman', e.x, e.y);
      }
    }
    return dead.length;
  }
  use(id, x, y) {
    if (this.status !== 'playing') return { ok: false, reason: 'paused' };
    const w = WEAPONS.find(w => w.id === id);
    if (!w) return { ok: false, reason: 'unknown' };
    if (!this.isUnlocked(id)) return { ok: false, reason: 'locked', unlock: w.unlock };
    if (this.cooldowns[id] > 0) return { ok: false, reason: 'cooldown' };
    if (id === 'flame' && this.overheated) return { ok: false, reason: 'overheated' };
    if (id === 'loach' || id === 'frog') {
      if (this.allies.filter(a => a.type === id).length >= ALLY_LIMITS[id]) return { ok: false, reason: 'limit', limit: ALLY_LIMITS[id] };
      const point = pondPoint(x, y);
      this.allies.push({ ...point, id: this.nextId++, type: id, angle: -Math.PI / 2, attack: .4, eaten: 0, seed: this.random() * 100, targetId: null });
      if (id === 'loach') separateLoaches(this.allies);
      this.cooldowns[id] = w.cooldown; this.emit('deploy', { ...point, source: id }); return { ok: true };
    }
    const center = { x, y };
    let targets = this.enemies.filter(e => distance(e, center) <= w.radius);
    this.cooldowns[id] = w.cooldown;
    if (id === 'thunderstorm') {
      const strikes = this.enemies.map(e => ({ x: e.x, y: e.y }));
      const count = this.damage([...this.enemies], w.damage, id, 500, 390);
      this.emit('thunderstorm', { x: 500, y: 390, strikes, count });
      return { ok: true, count };
    }
    if (id === 'chorus') {
      this.fields.push({ x, y, type: 'chorus', remaining: 4, pulse: .2, radius: w.radius });
      this.emit('chorus', { x, y }); return { ok: true };
    }
    if (id === 'rewind') {
      for (const e of targets) {
        if (e.rank === 4 && stageOf(e) === 'adult') { e.frozen = Math.max(e.frozen, 2.5); continue; }
        const healthRatio = e.hp / e.maxHp;
        if (stageOf(e) === 'adult') { if (e.rank > 0) e.rank--; else e.age = 10; }
        else e.age = Math.max(0, e.age - 9);
        e.maxHp = stageOf(e) === 'adult' ? evolutionOf(e).hp : 1 + Math.floor(e.rank / 2);
        e.hp = e.maxHp * healthRatio; e.evolve = 0; e.breed = 0;
      }
      this.emit('rewind', { x, y, radius: w.radius, count: targets.length }); return { ok: true };
    }
    if (id === 'talisman') {
      for (const e of targets) e.sealed = 12;
      this.emit('talisman', { x, y, radius: w.radius, count: targets.length }); return { ok: true };
    }
    if (id === 'flame') {
      targets = targets.filter(e => stageOf(e) === 'adult'); this.heat = Math.min(100, this.heat + 6); this.flameUntil = this.elapsed + .2;
      if (this.heat >= 100) this.overheated = true;
    }
    if (id === 'vortex' || id === 'blackhole') {
      const point = pondPoint(x, y);
      this.fields.push({ ...point, type: id, remaining: id === 'vortex' ? 5 : 3, radius: w.radius });
      this.emit(id, point); return { ok: true };
    }
    if (id === 'freeze') {
      for (const e of targets) e.frozen = e.rank === 4 ? 2.5 : 5;
      this.fields.push({ x, y, type: 'freeze', remaining: 1.3, radius: w.radius }); this.emit('freeze', { x, y, count: targets.length }); return { ok: true };
    }
    if (id === 'meteor') {
      for (let i = 0; i < 5; i++) {
        const a = i / 4 * Math.PI * 2, r = i === 0 ? 0 : 85;
        this.fields.push({ x: x + Math.cos(a) * r, y: y + Math.sin(a) * r, type: 'meteor', remaining: .65 + i * .32, radius: 135 });
      }
      this.emit('meteor', { x, y }); return { ok: true };
    }
    if (id === 'dragon') targets = this.enemies.filter(e => Math.abs(e.y - y) <= w.radius);
    if (id === 'electric') {
      targets = targets.slice(0, 16);
      const links = targets.map(e => ({ from: center, to: { x: e.x, y: e.y } })), seen = new Set(targets.map(e => e.id));
      for (let i = 0; i < targets.length && targets.length < 16; i++) {
        for (const e of this.enemies) {
          if (!seen.has(e.id) && distance(e, targets[i]) < w.chainRadius) {
            seen.add(e.id); links.push({ from: { x: targets[i].x, y: targets[i].y }, to: { x: e.x, y: e.y } }); targets.push(e);
            if (targets.length >= 16) break;
          }
        }
      }
      this.emit('lightning', { x, y, links });
    }
    const count = this.damage(targets, w.damage, id, x, y);
    this.emit('attack', { source: id, x, y, radius: w.radius, count }); return { ok: true, count };
  }
  sustainFlame(delta, x, y) {
    if (this.status !== 'playing') return { ok: false, reason: 'paused' };
    const w = WEAPONS.find(w => w.id === 'flame');
    if (!this.isUnlocked('flame')) return { ok: false, reason: 'locked', unlock: w.unlock };
    if (this.overheated) return { ok: false, reason: 'overheated' };
    const dt = Math.min(Math.max(0, delta), .1, (100 - this.heat) / w.heatPerSecond);
    if (!dt) return { ok: true, count: 0 };
    this.heat = Math.min(100, this.heat + dt * w.heatPerSecond);
    this.flameUntil = this.elapsed + .2;
    if (this.heat >= 100) this.overheated = true;
    const targets = this.enemies.filter(e => stageOf(e) === 'adult' && distance(e, { x, y }) <= w.radius);
    const count = this.damage(targets, w.dps * dt, 'flame', x, y);
    // Damage is continuous; expensive particles and sound use a slower visual cadence.
    if (this.cooldowns.flame <= 0) {
      this.cooldowns.flame = w.cooldown;
      this.emit('attack', { source: 'flame', x, y, radius: w.radius, count });
    }
    return { ok: true, count };
  }
  update(delta) {
    if (this.status !== 'playing') return;
    const dt = Math.max(0, Math.min(delta, .1)); this.elapsed += dt;
    const newLevel = 1 + Math.floor((this.elapsed + 1e-6) / WAVE_SECONDS);
    if (newLevel > this.level) {
      this.level = newLevel;
      this.emit('wave', { level: this.level, unlocked: WEAPONS.filter(w => w.unlock === this.level).map(w => w.id) });
      if (this.level >= 3) {
        const rank = Math.max(1, Math.min(3, Math.floor((this.level - 1) / 3)));
        for (let i = 0; i < Math.min(4, 1 + Math.floor((this.level - 3) / 3)); i++) this.spawn(20, rank);
      }
      if (this.level >= 8 && (this.level - 8) % 4 === 0) { const queen = this.spawn(20, 4); if (queen) { queen.hp += (this.level - 8) * 4; queen.maxHp = queen.hp; this.emit('boss', { x: queen.x, y: queen.y }); } }
    }
    for (const id in this.cooldowns) this.cooldowns[id] = Math.max(0, this.cooldowns[id] - dt);
    if (this.elapsed > this.flameUntil + 1e-6) this.heat = Math.max(0, this.heat - dt * 22);
    if (this.overheated && this.heat <= 25) this.overheated = false;
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      const amount = Math.min(10, 3 + Math.floor(this.level / 3));
      for (let i = 0; i < amount; i++) this.spawn(this.random() * 5);
      this.spawnTimer = amount / spawnRateForLevel(this.level);
    }
    const expired = [];
    for (const f of this.fields) { f.remaining -= dt; if (f.remaining <= 0) expired.push(f); }
    this.fields = this.fields.filter(f => f.remaining > 0);
    for (const f of expired) {
      if (f.type === 'blackhole' || f.type === 'meteor') {
        const radius = f.type === 'blackhole' ? 190 : f.radius, damage = f.type === 'blackhole' ? 32 : 20;
        const count = this.damage(this.enemies.filter(e => distance(e, f) < radius), damage, f.type, f.x, f.y);
        this.emit('detonate', { x: f.x, y: f.y, radius, source: f.type, count });
      }
    }
    for (const f of this.fields) {
      if (f.type !== 'chorus') continue;
      f.pulse -= dt;
      if (f.pulse <= 0) {
        f.pulse += 1.2;
        const nearby = this.enemies.filter(e => distance(e, f) <= f.radius);
        const count = this.damage(nearby, 2, 'chorus', f.x, f.y);
        for (const e of nearby) {
          if (e.hp <= 0) continue;
          const angle = Math.atan2(e.y - f.y, e.x - f.x), push = 24 / (1 + e.rank * .35);
          e.x += Math.cos(angle) * push; e.y += Math.sin(angle) * push;
          if (stageOf(e) !== 'adult') Object.assign(e, pondPoint(e.x, e.y));
          else { e.x = Math.max(40, Math.min(960, e.x)); e.y = Math.max(160, Math.min(640, e.y)); }
        }
        this.emit('sonic', { x: f.x, y: f.y, radius: f.radius, count });
      }
    }
    let offspring = 0;
    for (const e of this.enemies) {
      e.hit = Math.max(0, e.hit - dt);
      e.sealed = Math.max(0, e.sealed - dt);
      if (e.frozen > 0) { e.frozen = Math.max(0, e.frozen - dt); continue; }
      const previous = stageOf(e); e.age += dt * (1 + Math.min(1.25, (this.level - 1) * .0725));
      const stage = stageOf(e);
      if (previous !== 'adult' && stage === 'adult') { const hp = evolutionOf(e).hp; e.hp = hp; e.maxHp = hp; this.emit('hatch', { x: e.x, y: e.y, rank: e.rank }); }
      if (stage === 'adult') {
        e.evolve = e.rank < maxRankForLevel(this.level) ? e.evolve + dt : 0;
        if (e.evolve >= EVOLUTION_SECONDS && e.rank < maxRankForLevel(this.level)) {
          const healthRatio = e.hp / e.maxHp;
          e.rank++; e.evolve = 0; e.maxHp = evolutionOf(e).hp; e.hp = e.maxHp * healthRatio;
          this.emit('evolve', { x: e.x, y: e.y, rank: e.rank });
        }
        if (e.rank >= 3) { e.breed += dt; if (e.breed >= 8.5) { e.breed = 0; offspring += e.rank === 4 ? 4 : 2; this.emit('breed', { x: e.x, y: e.y }); } }
      }
      e.turn -= dt;
      if (e.turn <= 0) { e.angle += (this.random() - .5) * (e.rank === 3 ? 4 : 2.6); e.turn = .25 + this.random() * .9; }
      const speed = stage === 'adult' ? 74 * evolutionOf(e).speed * (1 + Math.min(.6, this.level * .025)) : stage === 'larva' ? 16 + this.level : stage === 'pupa' ? 5 : 1;
      e.x += Math.cos(e.angle) * speed * dt; e.y += Math.sin(e.angle) * speed * dt;
      if (stage === 'adult') {
        if (e.x < 40 || e.x > 960) { e.angle = Math.PI - e.angle; e.x = Math.max(40, Math.min(960, e.x)); }
        if (e.y < 160 || e.y > 640) { e.angle = -e.angle; e.y = Math.max(160, Math.min(640, e.y)); }
      } else {
        reflectAtPondEdge(e);
      }
      for (const f of this.fields) {
        if (!['vortex', 'blackhole'].includes(f.type) || distance(e, f) > f.radius) continue;
        const dx = f.x - e.x, dy = f.y - e.y, power = (f.type === 'blackhole' ? 3.5 : 1.9) / (1 + e.rank * .25);
        e.x += (dx * power - dy * .7) * dt; e.y += (dy * power + dx * .7) * dt;
      }
    }
    for (let i = 0; i < offspring; i++) this.spawn(5);
    const claimedPrey = new Set();
    for (const a of this.allies) {
      a.attack -= dt;
      const edible = this.enemies.filter(e => (a.type === 'frog') === (stageOf(e) === 'adult') && (a.type !== 'loach' || !claimedPrey.has(e.id)));
      let target = null, nearest = Infinity;
      if (a.type === 'loach') target = edible.find(e => e.id === a.targetId) || null;
      if (target) nearest = distance(target, a);
      else for (const e of edible) { const d = distance(e, a); if (d < nearest) { target = e; nearest = d; } }
      if (a.type === 'loach') {
        a.targetId = target?.id ?? null;
        if (target) {
          claimedPrey.add(target.id);
          const desired = Math.atan2(target.y - a.y, target.x - a.x), turn = Math.atan2(Math.sin(desired - a.angle), Math.cos(desired - a.angle));
          a.angle += Math.max(-dt * 5, Math.min(dt * 5, turn));
          const step = Math.min(nearest, dt * 100); a.x += Math.cos(a.angle) * step; a.y += Math.sin(a.angle) * step;
          if (nearest < 26 && a.attack <= 0) { a.eaten += this.damage([target], 1, 'loach', a.x, a.y); a.attack = ALLY_ATTACK_INTERVALS.loach; }
        } else { a.angle += Math.sin(this.elapsed * .7 + a.seed) * dt * .8; a.x += Math.cos(a.angle) * dt * 24; a.y += Math.sin(a.angle) * dt * 24; }
        reflectAtPondEdge(a);
      } else if (target && nearest < 280 && a.attack <= 0) {
        this.emit('tongue', { from: { x: a.x, y: a.y }, to: { x: target.x, y: target.y } }); a.eaten += this.damage([target], 3, 'frog', target.x, target.y); a.attack = ALLY_ATTACK_INTERVALS.frog; a.angle = Math.atan2(target.y - a.y, target.x - a.x);
      }
    }
    separateLoaches(this.allies);
    this.danger = this.threat >= THREAT_LIMIT ? this.danger + dt : Math.max(0, this.danger - dt * 2);
    if (this.danger >= 5) { this.status = 'lost'; this.emit('end'); }
  }
}
