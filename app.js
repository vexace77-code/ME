
// ═══════════════════════════════
// RANDOM TITLE FONT (changes each visit/refresh)
// ═══════════════════════════════
(function(){
  const TITLE_FONTS = [
    { family: "'Alex Brush',cursive", style: 'normal', weight: 400, letterSpacing: '0.01em', script: true },
    { family: "'Parisienne',cursive", style: 'normal', weight: 400, letterSpacing: '0.01em', script: true },
    { family: "'Allura',cursive", style: 'normal', weight: 400, letterSpacing: '0.01em', script: true },
    { family: "'Tangerine',cursive", style: 'normal', weight: 700, letterSpacing: '0.01em', script: true },
    { family: "'Pinyon Script',cursive", style: 'normal', weight: 400, letterSpacing: '0.01em', script: true }
  ];
  const titleEl = document.querySelector('.landing-title');
  if (titleEl) {
    let lastIndex = -1;
    try { lastIndex = parseInt(localStorage.getItem('titleFontLastIndex'), 10); } catch { /* private browsing */ }
    let idx;
    do { idx = Math.floor(Math.random() * TITLE_FONTS.length); }
    while (TITLE_FONTS.length > 1 && idx === lastIndex);
    try { localStorage.setItem('titleFontLastIndex', String(idx)); } catch { /* private browsing */ }
    const pick = TITLE_FONTS[idx];
    titleEl.style.fontFamily = pick.family;
    titleEl.style.fontStyle = pick.style;
    titleEl.style.fontWeight = pick.weight;
    titleEl.style.letterSpacing = pick.letterSpacing;
    titleEl.classList.toggle('font-script', pick.script);
  }
})();

// ═══════════════════════════════
// PETALS
// ═══════════════════════════════
const canvas = document.getElementById('petal-canvas');
const ctx = canvas.getContext('2d');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

class Petal {
  constructor(){ this.reset(true); }
  reset(init){
    this.x = Math.random()*canvas.width;
    this.y = init ? Math.random()*canvas.height : -20;
    this.size = Math.random()*4+2;
    this.speedY = Math.random()*0.55+0.18;
    this.speedX = (Math.random()-0.5)*0.35;
    this.opacity = Math.random()*0.25+0.04;
    this.rotation = Math.random()*Math.PI*2;
    this.rotSpeed = (Math.random()-0.5)*0.018;
    this.swayOffset = Math.random()*Math.PI*2;
    this.t = 0;
  }
  update(){
    this.t+=0.01; this.y+=this.speedY;
    this.x+=this.speedX+Math.sin(this.swayOffset+this.t)*0.018;
    this.rotation+=this.rotSpeed;
    if(this.y>canvas.height+20) this.reset(false);
  }
  draw(){
    ctx.save(); ctx.translate(this.x,this.y); ctx.rotate(this.rotation);
    ctx.globalAlpha=this.opacity;
    ctx.beginPath(); ctx.ellipse(0,0,this.size,this.size*1.55,0,0,Math.PI*2);
    ctx.fillStyle='#8BA8D0'; ctx.fill(); ctx.restore();
  }
}

if (reducedMotion) {
  canvas.style.display = 'none';
} else {
  let resizeFrame = null;
  function resizeCanvas(){
    canvas.width=window.innerWidth;
    canvas.height=window.innerHeight;
    resizeFrame=null;
  }
  function requestCanvasResize(){
    if(resizeFrame !== null) return;
    resizeFrame=requestAnimationFrame(resizeCanvas);
  }
  resizeCanvas(); window.addEventListener('resize', requestCanvasResize, {passive:true});
  const petalCount = window.matchMedia('(max-width: 600px)').matches ? 13 : 26;
  const petals = Array.from({length:petalCount}, ()=>new Petal());
  let petalsFrame;
  function animatePetals(){
    if (!document.hidden) {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      petals.forEach(p=>{p.update();p.draw();});
      petalsFrame=requestAnimationFrame(animatePetals);
    }
  }
  animatePetals();
  document.addEventListener('visibilitychange',()=>{
    if (!document.hidden && !petalsFrame) animatePetals();
    if (document.hidden) petalsFrame=null;
  });
}

// ═══════════════════════════════
// PARALLAX
// ═══════════════════════════════
const bg = document.getElementById('parallaxBg');
let mx=0, my=0;
let parallaxFrame = null;
if (!reducedMotion) {
  document.addEventListener('mousemove', e=>{
    mx=(e.clientX/window.innerWidth-0.5)*18; my=(e.clientY/window.innerHeight-0.5)*18;
    if (parallaxFrame) return;
    parallaxFrame=requestAnimationFrame(()=>{
      bg.style.transform=`translate(${mx*0.28}px,${my*0.28}px)`;
      parallaxFrame=null;
    });
  }, {passive:true});
}

// ═══════════════════════════════
// TRANSITION
// ═══════════════════════════════
const landing = document.getElementById('landing');
const main = document.getElementById('main');
const trans = document.getElementById('pageTransition');
const nav = document.getElementById('siteNav');

document.getElementById('enterBtn').addEventListener('click', ()=>{
  trans.classList.add('active');
  setTimeout(()=>{
    landing.style.display='none';
    main.style.display='block';
    nav.classList.add('visible');
    setTimeout(()=>{ main.classList.add('visible'); trans.classList.remove('active'); observeSections(); }, 90);
  }, 480);
});

document.getElementById('navBack').addEventListener('click', ()=>{
  trans.classList.add('active');
  setTimeout(()=>{
    main.style.display='none'; main.classList.remove('visible');
    nav.classList.remove('visible');
    landing.style.display='flex';
    setTimeout(()=>{ trans.classList.remove('active'); }, 90);
    // reset envelope
    document.getElementById('envelopeWrap').classList.remove('open');
    document.getElementById('envelopeReveal').classList.remove('show');
    document.getElementById('envelopeWrap').setAttribute('aria-expanded','false');
    document.getElementById('envelopeSection').hidden = true;
    document.getElementById('continueBtn').setAttribute('aria-expanded','false');
    state.envelopeOpened = false;
    // stop audio
    audio.pause(); state.isPlaying=false; updatePlayUI();
    window.scrollTo({top:0, behavior: reducedMotion ? 'auto' : 'smooth'});
  }, 480);
});

// ═══════════════════════════════
// SCROLL FADE
// ═══════════════════════════════
let sectionObserver = null;
function observeSections(){
  if(sectionObserver) return;
  const fades = main.querySelectorAll('.section-fade');
  // Older mobile browsers may not support IntersectionObserver.  Do not leave
  // the whole letter transparent when that happens.
  if (!('IntersectionObserver' in window)) {
    fades.forEach(el => el.classList.add('in-view'));
    return;
  }
  sectionObserver = new IntersectionObserver(entries=>{
    entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('in-view'); });
  }, { threshold: 0.1 });
  fades.forEach(el=>sectionObserver.observe(el));
}

// ═══════════════════════════════
// REASONS
// ═══════════════════════════════
const CONTENT = {
  reasons: [
  "لأنكِ هادئة بطريقة تجعل من حولكِ يشعرون بالأمان، هدوءكِ ليس غياباً بل حضور من نوع مختلف.",
  "لأن ذكاءكِ ليس مجرد معلومات، بل طريقة تفكير تجعلكِ ترين ما لا يراه كثيرون.",
  "لأن احترامكِ للآخرين يبدو طبيعياً وحقيقياً، وهذا نادر في هذا الزمن.",
  "لأن تركيزكِ على ما تريدين يُلهم، ورؤيتكِ تسعين نحو هدفكِ تجعل كل شيء يبدو ممكناً.",
  "لأن لطفكِ ليس أداءً، بل جزء أصيل منكِ يظهر دون أن تحاولي.",
  "لأن مجرد وجودكِ في المكان يُغيّر شيئاً في الهواء — وهذا ليس شيئاً يستطيع الجميع فعله."
  ],
  identity: {
    color: 'لو كنتِ لوناً، لكنتِ أزرقاً هادئاً؛ فيه عمق وراحة لا تُفسَّر بسهولة.',
    song: 'لو كنتِ أغنية، لكنتِ تلك الأغنية التي لا تحتاج إلى صوت عالٍ كي تبقى في البال.',
    season: 'لو كنتِ فصلاً، لكنتِ بداية الربيع؛ هادئة، لكن فيها وعد جميل بكل ما سيأتي.',
    place: 'لو كنتِ مكاناً، لكنتِ مكاناً آمناً يعود إليه المرء عندما يتعب من الضجيج.'
  },
  moods: {
    happy: 'جميل أن تكوني مبتسمة. أتمنى أن تبقى هذه الخفة معكِ لبقية يومكِ.',
    tired: 'إن كان اليوم ثقيلاً، خذي وقتكِ. لستِ مضطرة لأن تكوني بخير طوال الوقت.',
    encouragement: 'أنتِ قادرة أكثر مما تظنين. خطوة واحدة هادئة الآن تكفي لتكملي.'
  },
  tracks: ['After School', 'Bad', 'Beat It', 'Boyfriend', 'Closer', 'Company', 'Matsuri', 'One Dance', 'Someone To Call My Lover', 'Sparkle - movie ver.', 'Starboy', 'Tek It - Copy', 'Tek It', '青のすみか']
};

function readSavedState(){
  try { return JSON.parse(localStorage.getItem('shahad-site-state')) || {}; }
  catch { return {}; }
}
const savedState = readSavedState();
const state = {
  currentReason: Number.isInteger(savedState.currentReason) ? savedState.currentReason : 0,
  currentTrack: Number.isInteger(savedState.currentTrack) ? savedState.currentTrack : -1,
  isPlaying: false,
  envelopeOpened: false,
  volume: typeof savedState.volume === 'number' ? savedState.volume : .8
};
function saveState(){
  try {
    localStorage.setItem('shahad-site-state', JSON.stringify({
      currentReason: state.currentReason, currentTrack: state.currentTrack, volume: state.volume
    }));
  } catch { /* Private browsing can disable local storage. */ }
}
const reasons = CONTENT.reasons;

let reasonChangeTimer = null;
const reasonText = document.getElementById('reasonText');
const reasonNum = document.getElementById('reasonNum');
const reasonDots = document.getElementById('reasonDots');
state.currentReason = Math.max(0, Math.min(state.currentReason, reasons.length - 1));
reasonText.setAttribute('aria-live','polite');
reasonText.classList.toggle('reason-text-long', reasons[state.currentReason].length > 105);
reasonText.textContent = reasons[state.currentReason];
reasonNum.textContent = String(state.currentReason+1).padStart(2,'0')+' / '+String(reasons.length).padStart(2,'0');

reasons.forEach((_,i)=>{
  const d = document.createElement('button');
  d.type='button';
  d.className = 'reason-dot'+(i===state.currentReason?' active':'');
  d.setAttribute('aria-label',`السبب ${i+1} من ${reasons.length}`);
  d.setAttribute('aria-pressed',String(i===state.currentReason));
  d.addEventListener('click',()=>goToReason(i));
  reasonDots.appendChild(d);
});

function goToReason(idx){
  reasonText.classList.remove('show');
  clearTimeout(reasonChangeTimer);
  reasonChangeTimer=setTimeout(()=>{
    state.currentReason = (idx+reasons.length)%reasons.length;
    reasonText.textContent = reasons[state.currentReason];
    reasonText.classList.toggle('reason-text-long', reasons[state.currentReason].length > 105);
    reasonNum.textContent = String(state.currentReason+1).padStart(2,'0')+' / '+String(reasons.length).padStart(2,'0');
    reasonText.classList.add('show');
    document.querySelectorAll('.reason-dot').forEach((d,i)=>{
      const active=i===state.currentReason;
      d.classList.toggle('active',active);
      d.setAttribute('aria-pressed',String(active));
    }); saveState();
  }, 280);
}

document.getElementById('nextReason').addEventListener('click', ()=>goToReason(state.currentReason+1));
document.getElementById('prevReason').addEventListener('click', ()=>goToReason(state.currentReason-1));
reasonDots.addEventListener('keydown', event=>{
  if(event.key==='ArrowRight' || event.key==='ArrowLeft') {
    event.preventDefault(); goToReason(state.currentReason + (event.key==='ArrowRight' ? 1 : -1));
  }
});

// ═══════════════════════════════
// MUSIC PLAYER
// ═══════════════════════════════
const audio = document.getElementById('audioPlayer');
const trackListEl = document.getElementById('trackList');
const trackCount = document.getElementById('trackCount');
const playerStatus = document.getElementById('playerStatus');
const npTitle = document.getElementById('npTitle');
const npTime = document.getElementById('npTime');
const progressFill = document.getElementById('progressFill');
const progressBar = document.getElementById('progressBar');
const playPauseBtn = document.getElementById('playPauseBtn');
const playIcon = document.getElementById('playIcon');
const pauseIcon = document.getElementById('pauseIcon');

let tracks = CONTENT.tracks.map(name=>({ name, artist:'مقطوعة مختارة لأجلكِ', url:`music/${encodeURIComponent(name + '.mp3')}`, dur:'—' }));
state.currentTrack = Math.max(-1, Math.min(state.currentTrack, tracks.length - 1));

function fmt(s){ if(isNaN(s)||!s) return '0:00'; return Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0'); }

function updatePlayUI(){
  playIcon.style.display = state.isPlaying ? 'none' : 'block';
  pauseIcon.style.display = state.isPlaying ? 'block' : 'none';
  playPauseBtn.setAttribute('aria-label', state.isPlaying ? 'إيقاف الموسيقى مؤقتاً' : 'تشغيل الموسيقى');
  playPauseBtn.setAttribute('aria-pressed', String(state.isPlaying));
}

function escapeHTML(value){
  return value.replace(/[&<>'"]/g, char=>({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;'
  })[char]);
}

function renderTracks(){
  if(tracks.length===0){
    trackListEl.innerHTML='<div class="track-empty">لا توجد أغانٍ متاحة حالياً.</div>';
    trackCount.textContent='0 SONGS'; return;
  }
  trackCount.textContent = tracks.length+' SONGS';
  const fragment=document.createDocumentFragment();
  tracks.forEach((t,i)=>{
    const item = document.createElement('button');
    item.type='button';
    item.className='track-item'+(i===state.currentTrack?' active':'');
    item.dataset.trackIndex=String(i);
    item.setAttribute('aria-label',`تشغيل ${t.name}`);
    item.setAttribute('aria-pressed',String(i===state.currentTrack && state.isPlaying));
    const playBtnHTML = (i===state.currentTrack && state.isPlaying)
      ? '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="2"/><rect x="14" y="4" width="4" height="16" rx="2"/></svg>'
      : '<svg viewBox="0 0 24 24"><polygon points="6,4 19,12 6,20" fill="currentColor" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/></svg>';
    item.innerHTML=`
      <span class="track-num">${String(i+1).padStart(2,'0')}</span>
      <span class="track-play-btn" aria-hidden="true">${playBtnHTML}</span>
      <span class="track-info">
        <span class="track-name">${escapeHTML(t.name)}</span>
        <span class="track-artist">${escapeHTML(t.artist||'')}</span>
      </span>
      <span class="track-dur">${t.dur||'—'}</span>
    `;
    fragment.appendChild(item);
  });
  trackListEl.replaceChildren(fragment);
}

trackListEl.addEventListener('click', event=>{
  const item=event.target.closest('[data-track-index]');
  if(item) playTrack(Number(item.dataset.trackIndex));
});

function playTrack(idx){
  if(idx<0||idx>=tracks.length) return;
  state.currentTrack=idx; saveState();
  const t=tracks[idx];
  npTitle.textContent=t.name;
  playerStatus.textContent='جارٍ تشغيل — '+t.name;
  audio.src=t.url; audio.load();
  audio.play().then(()=>{
    playerStatus.textContent='يُشغَّل الآن — '+t.name;
    renderTracks();
  }).catch(()=>{
    state.isPlaying=false; updatePlayUI(); renderTracks();
    playerStatus.textContent='تعذّر تشغيل هذه الأغنية. حاولي ملفاً آخر.';
  });
}

renderTracks();

playPauseBtn.addEventListener('click', ()=>{
  if(tracks.length===0) return;
  if(state.currentTrack===-1){ playTrack(0); return; }
  if(state.isPlaying) audio.pause();
  else audio.play().catch(()=>{ playerStatus.textContent='تعذّر استئناف تشغيل هذه الأغنية.'; });
});

document.getElementById('prevBtn').addEventListener('click', ()=>{
  if(!tracks.length) return;
  playTrack(state.currentTrack===-1 ? tracks.length-1 : (state.currentTrack-1+tracks.length)%tracks.length);
});
document.getElementById('nextBtn').addEventListener('click', ()=>{
  if(!tracks.length) return;
  playTrack((state.currentTrack+1)%tracks.length);
});

audio.addEventListener('timeupdate', ()=>{
  const pct = audio.duration ? (audio.currentTime/audio.duration)*100 : 0;
  progressFill.style.width=pct+'%';
  npTime.textContent=fmt(audio.currentTime)+' / '+fmt(audio.duration);
  progressBar.setAttribute('aria-valuenow', String(Math.round(pct)));
  progressBar.setAttribute('aria-valuetext', npTime.textContent);
});
audio.addEventListener('loadedmetadata',()=>{
  const track=tracks[state.currentTrack];
  if(track && !Number.isNaN(audio.duration)) {
    track.dur=fmt(audio.duration);
    renderTracks();
  }
});
audio.addEventListener('play', ()=>{
  state.isPlaying=true; updatePlayUI(); renderTracks();
});
audio.addEventListener('pause', ()=>{
  state.isPlaying=false; updatePlayUI(); renderTracks();
});
audio.addEventListener('ended', ()=>{ if(tracks.length) playTrack((state.currentTrack+1)%tracks.length); });
audio.addEventListener('error', ()=>{
  state.isPlaying=false; updatePlayUI(); renderTracks();
  playerStatus.textContent='تعذّر قراءة ملف الصوت.';
});

function seekFromPointer(e){
  if(!audio.duration) return;
  const r=progressBar.getBoundingClientRect();
  const position=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));
  audio.currentTime=position*audio.duration;
}
let isSeeking=false;
progressBar.addEventListener('pointerdown', e=>{
  isSeeking=true; progressBar.setPointerCapture(e.pointerId); seekFromPointer(e);
});
progressBar.addEventListener('pointermove', e=>{ if(isSeeking) seekFromPointer(e); });
progressBar.addEventListener('pointerup', e=>{
  isSeeking=false;
  if(progressBar.hasPointerCapture(e.pointerId)) progressBar.releasePointerCapture(e.pointerId);
});
progressBar.addEventListener('pointercancel', ()=>{ isSeeking=false; });
progressBar.addEventListener('click', e=>{
  if(!isSeeking) seekFromPointer(e);
});
progressBar.addEventListener('keydown', e=>{
  if(!audio.duration) return;
  const step = e.shiftKey ? 10 : 5;
  if(e.key==='ArrowRight' || e.key==='ArrowUp') audio.currentTime=Math.min(audio.duration, audio.currentTime+step);
  else if(e.key==='ArrowLeft' || e.key==='ArrowDown') audio.currentTime=Math.max(0, audio.currentTime-step);
  else if(e.key==='Home') audio.currentTime=0;
  else if(e.key==='End') audio.currentTime=audio.duration;
  else return;
  e.preventDefault();
});

document.getElementById('volumeSlider').addEventListener('input', e=>{ state.volume=Number(e.target.value); audio.volume=state.volume; saveState(); });
audio.volume=state.volume;
document.getElementById('volumeSlider').value=state.volume;

document.getElementById('stopBtn').addEventListener('click', ()=>{
  audio.pause();
  if (audio.readyState) audio.currentTime = 0;
  progressFill.style.width = '0%';
  npTime.textContent = '0:00 / ' + fmt(audio.duration);
  progressBar.setAttribute('aria-valuenow', '0');
  playerStatus.textContent = state.currentTrack === -1 ? 'اختاري أغنية للبدء' : 'تم إيقاف الموسيقى.';
});

// ═══════════════════════════════
// PERSONAL CHAPTERS
// ═══════════════════════════════
document.querySelectorAll('.identity-option').forEach(button=>{
  button.addEventListener('click',()=>{
    document.querySelectorAll('.identity-option').forEach(item=>item.setAttribute('aria-pressed','false'));
    button.setAttribute('aria-pressed','true');
    document.getElementById('identityAnswer').textContent=CONTENT.identity[button.dataset.identity];
  });
});
document.querySelectorAll('.mood-option').forEach(button=>{
  button.addEventListener('click',()=>{
    document.querySelectorAll('.mood-option').forEach(item=>item.setAttribute('aria-pressed','false'));
    button.setAttribute('aria-pressed','true');
    document.getElementById('moodAnswer').textContent=CONTENT.moods[button.dataset.moodKey];
  });
});
document.querySelectorAll('.memory-card').forEach(card=>{
  card.addEventListener('click',()=>{
    const open=!card.classList.contains('open');
    card.classList.toggle('open',open);
    card.setAttribute('aria-expanded',String(open));
  });
});
// ═══════════════════════════════
// ENVELOPE
// ═══════════════════════════════
document.getElementById('continueBtn').addEventListener('click', ()=>{
  const envelopeSection = document.getElementById('envelopeSection');
  envelopeSection.hidden = false;
  envelopeSection.classList.add('in-view');
  document.getElementById('continueBtn').setAttribute('aria-expanded','true');
  envelopeSection.scrollIntoView({behavior: reducedMotion ? 'auto' : 'smooth', block:'start'});
  setTimeout(()=>document.getElementById('envelopeWrap').focus(), reducedMotion ? 0 : 500);
});
document.getElementById('envelopeWrap').addEventListener('click', ()=>{
  if(state.envelopeOpened) return;
  state.envelopeOpened=true;
  document.getElementById('envelopeWrap').classList.add('open');
  document.getElementById('envelopeWrap').setAttribute('aria-expanded','true');
  setTimeout(()=>{
    document.getElementById('envelopeReveal').classList.add('show');
    if(!reducedMotion) launchSurprise();
  }, 700);
});

function launchSurprise(){
  const surprise=document.getElementById('surprise');
  surprise.replaceChildren();
  Array.from({length:18},(_,i)=>{
    const star=document.createElement('span');
    star.className='surprise-star'; star.textContent=i%3===0?'✦':'·';
    star.style.left=(45+Math.random()*10)+'%'; star.style.top=(52+Math.random()*7)+'%';
    star.style.setProperty('--x',((Math.random()-.5)*90)+'vw');
    star.style.setProperty('--y',((Math.random()-.5)*70)+'vh');
    surprise.appendChild(star);
    star.addEventListener('animationend',()=>star.remove(),{once:true});
  });
}

