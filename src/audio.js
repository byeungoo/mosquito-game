// Locally synthesized soundtrack and effects: no downloads or audio assets.
export class PondAudio {
  constructor() {
    this.enabled = true; this.voices = new Set(); this.last = new Map(); this.step = 0; this.next = 0;
    try { this.enabled = localStorage.getItem('pond-sound') !== 'off'; } catch { /* Optional storage. */ }
  }
  unlock() {
    if (!this.enabled) return;
    try {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.master = this.ctx.createGain(); this.master.gain.value = .55;
        const compressor = this.ctx.createDynamicsCompressor();
        this.master.connect(compressor); compressor.connect(this.ctx.destination);
        this.noise = this.ctx.createBuffer(1,this.ctx.sampleRate,this.ctx.sampleRate);
        const data = this.noise.getChannelData(0);
        for(let i=0;i<data.length;i++) data[i]=Math.random()*2-1;
      }
      this.ctx.resume().catch(() => {});
    } catch { this.enabled = false; }
  }
  toggle() {
    this.enabled = !this.enabled;
    if(this.enabled) this.unlock(); else this.stop();
    try { localStorage.setItem('pond-sound',this.enabled?'on':'off'); } catch { /* Optional storage. */ }
  }
  stop() {
    for(const source of this.voices) { try { source.stop(); } catch { /* Already ended. */ } }
    this.voices.clear(); this.next = 0;
  }
  voice(freq,duration,type,volume,endFreq,delay=0,noise=false) {
    if(!this.enabled || !this.ctx || this.ctx.state!=='running' || this.voices.size>=48) return;
    const c=this.ctx, start=c.currentTime+delay, source=noise?c.createBufferSource():c.createOscillator();
    const gain=c.createGain(), filter=c.createBiquadFilter();
    if(noise) {source.buffer=this.noise;filter.type='bandpass';filter.frequency.value=freq;filter.Q.value=.65;}
    else {source.type=type;source.frequency.setValueAtTime(freq,start);if(endFreq)source.frequency.exponentialRampToValueAtTime(endFreq,start+duration);filter.type='lowpass';filter.frequency.value=3500;}
    gain.gain.setValueAtTime(.0001,start);gain.gain.linearRampToValueAtTime(volume,start+.008);gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
    source.connect(filter);filter.connect(gain);gain.connect(this.master);
    this.voices.add(source);source.onended=()=>{this.voices.delete(source);source.disconnect();filter.disconnect();gain.disconnect();};
    source.start(start);source.stop(start+duration+.02);
  }
  tone(freq,duration=.1,type='sine',volume=.04,endFreq,delay=0) {this.voice(freq,duration,type,volume,endFreq,delay);}
  hiss(freq,duration,volume,delay=0) {this.voice(freq,duration,'sine',volume,0,delay,true);}
  update(level,danger) {
    if(!this.enabled || !this.ctx || this.ctx.state!=='running') return;
    const now=this.ctx.currentTime;
    if(this.next<now-.25) this.next=now;
    const pace=60/(94+Math.min(level,12)*2)/2;
    const roots=[146.83,130.81,174.61,110], melody=[0,7,12,7,3,7,10,7,0,7,15,12,10,7,3,7];
    while(this.next<now+.12) {
      const n=this.step++, delay=Math.max(0,this.next-now), root=roots[Math.floor(n/16)%4];
      this.tone(root*2**(melody[n%16]/12),pace*.85,'triangle',.065,undefined,delay);
      if(n%4===0) {this.tone(root/2,pace*3.5,'sine',.12,undefined,delay);this.tone(110,.15,'sine',.16,42,delay);}
      if(n%4===2)this.hiss(1200,.09,.035,delay);
      if(level>=3 || n%2===0)this.hiss(6500,.035,.018,delay);
      if(level>=5 && n%8===0)this.tone(root*1.5,pace*6,'triangle',.027,undefined,delay);
      if(danger>0 && n%4===0)this.tone(740,.12,'sine',.07,550,delay);
      this.next+=pace;
    }
  }
  event(e) {
    if(!this.enabled || !this.ctx) return;
    const id=e.type==='attack'?e.source:e.type, now=this.ctx.currentTime;
    if(now-(this.last.get(id)??-10)<({flame:.11,kills:.12,hatch:.7,evolve:.5,tongue:.18,sealBurst:.12}[id]||.06))return;
    this.last.set(id,now);
    if(id==='net'){this.hiss(1600,.12,.17);this.tone(180,.09,'sine',.15,65);}
    if(id==='flame')this.hiss(480,.19,.2);
    if(id==='lightning'){this.hiss(3200,.25,.17);this.tone(120,.18,'sawtooth',.05,1300);}
    if(id==='tongue'){this.tone(280,.13,'sine',.12,85);}
    if(id==='hatch')this.tone(230,.15,'sawtooth',.015,370);
    if(id==='evolve'){this.tone(90,.3,'sawtooth',.04,270);this.hiss(600,.25,.05);}
    if(id==='kills'&&e.count>0)this.tone(e.count>=4?880:520,.1,'sine',.065,260);
    if(['detonate','palm','sealBurst'].includes(id)){this.hiss(180,.55,.3);this.tone(85,.6,'sine',.25,28);}
    if(id==='dragon'){this.hiss(420,1.4,.24);[65,98,130].forEach((f,i)=>this.tone(f,1.2,'sawtooth',.075,f*2,.08*i));this.hiss(2200,.5,.1,.4);}
    if(id==='freeze')[880,1320,1760].forEach((f,i)=>this.tone(f,.4,'sine',.08,undefined,i*.07));
    if(['wave','bossKilled'].includes(id))[330,440,554,660].forEach((f,i)=>this.tone(f,.24,'triangle',.1,undefined,i*.1));
    if(id==='boss'){this.hiss(160,.8,.2);[98,92,65].forEach((f,i)=>this.tone(f,.7,'sawtooth',.1,40,i*.25));}
    if(id==='thunderstorm')for(let i=0;i<4;i++){this.hiss(220+i*300,.65,.24,i*.2);this.tone(65,.6,'sine',.2,28,i*.2);}
  }
}
