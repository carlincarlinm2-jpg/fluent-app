// Fluent — núcleo: datos, progreso, repaso inteligente (SRS), voz, micrófono, personaje, navegación y cuenta.
const SUPABASE_URL='https://xvncydijzordzwrilqai.supabase.co';
const SUPABASE_KEY='sb_publishable_tLpsLGTQfdAGX5Il611y7w_i3DIuWrx';
const PUSH_API='https://hola-ritmo.vercel.app';
const TUTOR_API='https://hola-nutri.vercel.app/api/tutor';
const sb=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
let user=null,S=null,view='learn';

/* ---------------- utilidades ---------------- */
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const dkey=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const today=()=>dkey(new Date());
const addDays=(k,n)=>{const d=new Date(k+'T12:00:00');d.setDate(d.getDate()+n);return dkey(d)};
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const pick=(a,n)=>shuffle(a).slice(0,n);
const cap=s=>s?s.charAt(0).toUpperCase()+s.slice(1):s;
function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){return null}}
function userName(){return (user?.user_metadata?.name||user?.email?.split('@')[0]||'').split(' ')[0]}
function buzz(ms=10){try{navigator.vibrate&&navigator.vibrate(ms)}catch(e){}}

/* ---------------- contenido ---------------- */
const UNITS=window.COURSES||[];
const LESSONS=[];UNITS.forEach(u=>u.lessons.forEach((l,i)=>LESSONS.push({...l,unit:u.id,idx:i})));
const lessonById=id=>LESSONS.find(l=>l.id===id);
const unitById=id=>UNITS.find(u=>u.id===id);
const ALL_WORDS=[];UNITS.forEach(u=>u.lessons.forEach(l=>l.words.forEach(w=>ALL_WORDS.push({...w,lesson:l.id,unit:u.id}))));
const ALL_SENTS=[];UNITS.forEach(u=>u.lessons.forEach(l=>l.sentences.forEach(s=>ALL_SENTS.push({...s,lesson:l.id,unit:u.id}))));
// Lo que se dice: quita la parte "/ went" de "go / went" para preguntar.
const enMain=w=>String(w).split(' / ')[0];

/* ---------------- estado y guardado ---------------- */
function blankState(){return {v:1,done:{},units:{},srs:{},days:{},totals:{xp:0,correct:0,total:0,ms:0,lessons:0,perfect:0,speak:0,tutor:0,games:0,reviews:0},ach:{},saved:[],settings:{goal:30,rate:.92,voice:'',remind:'19:00',onboarded:false}}}
let saveT=null;
function save(now){clearTimeout(saveT);try{ls('fluent_cache_'+user.id,JSON.stringify(S))}catch(e){}saveT=setTimeout(pushSave,now?0:1200)}
async function pushSave(){
  if(!user)return;
  const st=streak();
  const {error}=await sb.from('en_state').upsert({user_id:user.id,data:S,last_day:lastStudyDay(),streak:st,remind_time:S.settings.remind||'19:00',updated_at:new Date().toISOString()},{onConflict:'user_id'});
  if(error)console.warn('save',error.message);
}
async function loadState(){
  const {data,error}=await sb.from('en_state').select('data').eq('user_id',user.id).maybeSingle();
  if(error){console.warn(error);const c=ls('fluent_cache_'+user.id);S=c?JSON.parse(c):blankState();return}
  S=data?.data?{...blankState(),...data.data}:blankState();
  S.settings={...blankState().settings,...(S.settings||{})};S.totals={...blankState().totals,...(S.totals||{})};
}
function dayRec(k=today()){return S.days[k]||(S.days[k]={xp:0,ms:0,correct:0,total:0,lessons:0})}
function addXP(n){S.totals.xp+=n;dayRec().xp+=n}
function lastStudyDay(){const ks=Object.keys(S.days).filter(k=>S.days[k].xp>0).sort();return ks[ks.length-1]||null}
function streak(){let k=today();if(!(S.days[k]?.xp>0))k=addDays(k,-1);let n=0;while(S.days[k]?.xp>0){n++;k=addDays(k,-1)}return n}
function bestStreak(){const ks=Object.keys(S.days).filter(k=>S.days[k].xp>0).sort();let b=0,r=0,prev=null;for(const k of ks){r=prev&&addDays(prev,1)===k?r+1:1;b=Math.max(b,r);prev=k}return b}
function level(){const xp=S.totals.xp;let lv=1,need=100,acc=0;while(xp>=acc+need){acc+=need;lv++;need=Math.round(need*1.25)}return {lv,into:xp-acc,need}}

/* ---------------- repaso inteligente (SRS) ---------------- */
// Cada palabra u oración aprendida se repasa en intervalos que crecen si la aciertas (1, 3, 7, 16… días) y vuelve pronto si fallas.
const skey=(it)=>(it.kind==='s'?'s:':'w:')+String(it.en).toLowerCase();
function srsAdd(it,kind='w'){const k=skey({...it,kind});if(!S.srs[k])S.srs[k]={kind,en:it.en,es:it.es,ex_en:it.ex_en||'',ex_es:it.ex_es||'',pos:it.pos||'',lesson:it.lesson||'',e:2.5,i:0,r:0,due:today(),lapses:0,seen:0,ok:0,added:today()};return S.srs[k]}
function srsGrade(it,ok){
  const k=skey(it);const c=S.srs[k];if(!c)return;
  c.seen++;const t=today();
  if(ok){c.ok++;c.r++;c.i=c.r===1?1:c.r===2?3:Math.round(c.i*c.e);c.e=Math.min(3,c.e+.08);c.due=addDays(t,c.i)}
  else{c.lapses++;c.r=0;c.i=0;c.e=Math.max(1.3,c.e-.2);c.due=t}
}
function srsDue(){const t=today();return Object.values(S.srs).filter(c=>c.due<=t)}
function srsWeak(){return Object.values(S.srs).filter(c=>c.seen>=2&&c.ok/c.seen<.7||c.lapses>=2).sort((a,b)=>(a.ok/a.seen)-(b.ok/b.seen))}
function wordsLearned(){return Object.values(S.srs).filter(c=>c.kind==='w').length}
function wordsMastered(){return Object.values(S.srs).filter(c=>c.kind==='w'&&c.i>=7).length}

/* ---------------- voz (escuchar) ---------------- */
let voices=[];
function loadVoices(){try{voices=speechSynthesis.getVoices().filter(v=>/^en(-|_)/i.test(v.lang))}catch(e){voices=[]}}
try{loadVoices();speechSynthesis.onvoiceschanged=loadVoices}catch(e){}
function pickVoice(){
  if(!voices.length)loadVoices();
  if(S?.settings?.voice){const v=voices.find(v=>v.name===S.settings.voice);if(v)return v}
  const pref=[/Samantha/i,/Google US English/i,/Ava/i,/Allison/i,/Aria/i,/Jenny/i,/Microsoft.*(Aria|Jenny|Guy)/i,/en-US/i];
  for(const p of pref){const v=voices.find(v=>p.test(v.name)||p.test(v.lang));if(v)return v}
  return voices[0]||null;
}
function speak(text,{slow=false,onend}={}){
  try{
    speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(String(text).replace(/ \/ /g,', '));
    const v=pickVoice();if(v)u.voice=v;u.lang=v?.lang||'en-US';u.rate=(S?.settings?.rate||.92)*(slow?.6:1);u.pitch=1;
    if(onend)u.onend=onend;speechSynthesis.speak(u);
  }catch(e){onend&&onend()}
}

/* ---------------- micrófono (hablar) ---------------- */
const SR=()=>window.SpeechRecognition||window.webkitSpeechRecognition;
let recog=null;
function canListen(){return !!SR()}
function listen({lang='en-US',onText,onEnd,onError}){
  const C=SR();if(!C){onError&&onError('unsupported');return}
  stopListen();try{recog=new C()}catch(e){onError&&onError('unsupported');return}
  recog.lang=lang;recog.interimResults=true;recog.continuous=false;recog.maxAlternatives=3;
  let final='';
  recog.onresult=e=>{let t='';for(let i=0;i<e.results.length;i++){t+=e.results[i][0].transcript}final=t;onText&&onText(t,e.results[e.results.length-1].isFinal)};
  recog.onerror=e=>{onError&&onError(e.error)};
  recog.onend=()=>{recog=null;onEnd&&onEnd(final)};
  try{recog.start();sfx('record')}catch(e){onError&&onError('start')}
}
function stopListen(){if(recog){try{recog.stop()}catch(e){}recog=null}}

/* ---------------- comparar respuestas ---------------- */
const CONTR={"i'm":'i am',"you're":'you are',"he's":'he is',"she's":'she is',"it's":'it is',"we're":'we are',"they're":'they are',"don't":'do not',"doesn't":'does not',"didn't":'did not',"can't":'cannot',"won't":'will not',"isn't":'is not',"aren't":'are not',"wasn't":'was not',"weren't":'were not',"i've":'i have',"you've":'you have',"we've":'we have',"they've":'they have',"haven't":'have not',"hasn't":'has not',"i'll":'i will',"you'll":'you will',"we'll":'we will',"they'll":'they will',"i'd":'i would',"let's":'let us',"that's":'that is',"what's":'what is',"there's":'there is',"couldn't":'could not',"shouldn't":'should not',"wouldn't":'would not'};
const NUMS={zero:'0',one:'1',two:'2',three:'3',four:'4',five:'5',six:'6',seven:'7',eight:'8',nine:'9',ten:'10',eleven:'11',twelve:'12',twenty:'20'};
function norm(s,{nums=true}={}){
  let t=String(s||'').toLowerCase().replace(/[’`]/g,"'").replace(/[.,!?¿¡;:"()]/g,' ').replace(/\s+/g,' ').trim();
  t=t.split(' ').map(w=>CONTR[w]||w).join(' ');
  if(nums)t=t.split(' ').map(w=>NUMS[w]||w).join(' ');
  return t.replace(/\bcannot\b/g,'can not');
}
function lev(a,b){const m=a.length,n=b.length;if(!m)return n;if(!n)return m;let p=Array.from({length:n+1},(_,i)=>i);for(let i=1;i<=m;i++){const c=[i];for(let j=1;j<=n;j++)c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1));p=c}return p[n]}
// Parecido entre lo que dijiste/escribiste y lo esperado (0 a 1), por palabras y por letras.
function similarity(said,expected){
  const a=norm(said),b=norm(expected);if(!a)return 0;if(a===b)return 1;
  const wa=a.split(' '),wb=b.split(' ');const wd=lev(wa,wb);const ws=1-wd/Math.max(wa.length,wb.length);
  const cs=1-lev(a,b)/Math.max(a.length,b.length);return Math.max(0,(ws+cs*2)/3);
}
function typedOK(said,expected){const a=norm(said),b=norm(expected);if(a===b)return 'exact';const d=lev(a,b);return d<=Math.max(1,Math.floor(b.length/12))?'typo':false}

/* ---------------- personaje: Alex, el pájaro azul ---------------- */
let _kid=0;
function isSleep(){const h=new Date().getHours();return h>=23||h<5}
function kikoSVG(size=90,mood='idle'){
  if(isSleep()&&['idle','wave'].includes(mood))mood='sleep';
  const id='k'+(++_kid),sleep=mood==='sleep',ink='#14182b';
  const happy=['happy','celebrate','wave'].includes(mood);
  const eyes=sleep?`<path d="M38 55q8 6 16 0M66 55q8 6 16 0" stroke="${ink}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`
    :happy?`<path d="M38 57q8-10 16 0M66 57q8-10 16 0" stroke="${ink}" stroke-width="3.6" fill="none" stroke-linecap="round"/>`
    :`<g class="eyes"><ellipse cx="46" cy="54" rx="10" ry="11.5" fill="#fff"/><ellipse cx="74" cy="54" rx="10" ry="11.5" fill="#fff"/><g class="pupils"><circle cx="${mood==='think'?44:48}" cy="${mood==='think'?51:56}" r="5.6" fill="${ink}"/><circle cx="${mood==='think'?72:76}" cy="${mood==='think'?51:56}" r="5.6" fill="${ink}"/><circle cx="${mood==='think'?46:50}" cy="${mood==='think'?49:54}" r="1.9" fill="#fff"/><circle cx="${mood==='think'?74:78}" cy="${mood==='think'?49:54}" r="1.9" fill="#fff"/></g></g>`;
  const zz=sleep?`<text class="z" x="92" y="22" font-size="12" font-weight="800" fill="var(--muted)">z</text><text class="z z2" x="100" y="12" font-size="15" font-weight="800" fill="var(--muted)">z</text><text class="z z3" x="108" y="2" font-size="18" font-weight="800" fill="var(--muted)">Z</text>`:'';
  const tongue=happy||mood==='talk'?`<path d="M56 73q4 4 8 0" fill="#ff7a8a"/>`:'';
  const brow=mood==='sad'?`<path d="M36 41l16 5M84 41l-16 5" stroke="${ink}" stroke-width="2.8" stroke-linecap="round"/>`:mood==='think'?`<path d="M37 40q8-4 16 0" stroke="${ink}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`:'';
  return `<svg class="kiko alex m-${mood}" width="${size}" height="${size}" viewBox="0 0 120 132" onclick="kikoPoke(this)" role="img" aria-label="Alex">
  <defs><radialGradient id="${id}g" cx="36%" cy="26%" r="85%"><stop offset="0" stop-color="#9ad8ff"/><stop offset=".45" stop-color="#3f8ff5"/><stop offset="1" stop-color="#1c4fc2"/></radialGradient>
  <radialGradient id="${id}b" cx="50%" cy="30%" r="75%"><stop offset="0" stop-color="#fffaf0"/><stop offset="1" stop-color="#ffe2b8"/></radialGradient>
  <linearGradient id="${id}s" x1="0" x2="1"><stop offset="0" stop-color="#ff5a5f"/><stop offset="1" stop-color="#e2303c"/></linearGradient></defs>
  <ellipse class="ks" cx="60" cy="127" rx="28" ry="4.5" fill="#000"/>
  <g class="kb">
    <path d="M86 98q22 6 26 22-14-2-22-8 2 8-2 14-8-10-10-22z" fill="#1c4fc2"/>
    <path d="M50 117l-4 8M50 117l1 9M50 117l5 8M70 117l-5 8M70 117l-1 9M70 117l4 8" stroke="#ff9b2f" stroke-width="3" stroke-linecap="round"/>
    <g class="crest"><path d="M58 22q-10-16 0-20 4 10 6 18z" fill="#3f8ff5"/><path d="M63 22q4-17 14-14-6 9-10 16z" fill="#2c6fe0"/><path d="M55 25q-14-6-10-14 6 6 12 11z" fill="#6cb6ff"/></g>
    <ellipse cx="60" cy="70" rx="40" ry="46" fill="url(#${id}g)"/>
    <ellipse cx="60" cy="92" rx="25" ry="22" fill="url(#${id}b)"/>
    <g class="wing l"><path d="M22 68q-14 16-2 38 12-10 14-34z" fill="#1c4fc2"/><path d="M20 84q3 8 5 14M15 90q3 5 5 9" stroke="#163d99" stroke-width="2" fill="none" stroke-linecap="round"/></g>
    <g class="wing r"><path d="M98 68q14 16 2 38-12-10-14-34z" fill="#1c4fc2"/><path d="M100 84q-3 8-5 14M105 90q-3 5-5 9" stroke="#163d99" stroke-width="2" fill="none" stroke-linecap="round"/></g>
    <g class="scarf"><path d="M28 76q32 14 64 0l-2 9q-30 12-60 0z" fill="url(#${id}s)"/><path d="M74 82l8 20-9-2-2 8-6-22z" fill="#e2303c"/><path d="M76 89l4 9" stroke="#ffd166" stroke-width="2" stroke-linecap="round"/><path d="M36 80q24 8 48 0" stroke="#ffd166" stroke-width="2" fill="none" stroke-dasharray="3 4"/></g>
    <circle cx="35" cy="66" r="5.5" fill="#ff8fa3" opacity=".55"/><circle cx="85" cy="66" r="5.5" fill="#ff8fa3" opacity=".55"/>
    ${eyes}${brow}
    <path d="M53 63q7-5 14 0l-7 9z" fill="#ffb02e"/><path d="M53 63q7-3 14 0" stroke="#e8891a" stroke-width="1.4" fill="none"/>
    <g class="beak-lo"><path d="M55 69q5 5 10 0l-5 5z" fill="#e8891a"/></g>${tongue}
  </g>${zz}</svg>`;
}
function kikoPoke(el){sfx('coin');buzz(12);el.classList.add('m-happy');setTimeout(()=>el.classList.remove('m-happy'),1200);if(Math.random()<.5)speak(pickArr(['Hello!','Let us practice!','You got this!','Nice to see you!']))}
const pickArr=a=>a[Math.floor(Math.random()*a.length)];

/* ---------------- íconos ---------------- */
const IC={
  learn:'<path d="M3 9.5 12 4l9 5.5-9 5.5z"/><path d="M7 12v4.5c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V12M21 9.5v5"/>',
  practice:'<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9.5v5M20.5 9.5v5M6.5 12h11"/>',
  dict:'<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M9 8h6M9 11h4"/>',
  stats:'<path d="M4 20V11M10 20V5M16 20v-6M21 20H3"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2.8v2.4M12 18.8v2.4M4.2 7.5l2.1 1.2M17.7 15.3l2.1 1.2M4.2 16.5l2.1-1.2M17.7 8.7l2.1-1.2"/><circle cx="12" cy="12" r="7"/>',
  fire:'<path d="M12 22c4 0 7-3 7-7 0-3-2-5.5-3.5-7-.3 2-1.5 3-2.5 3 0-3-1-6-4-8 0 3-4 6-4 12 0 4 3 7 7 7z" fill="currentColor" stroke="none"/>',
  bolt:'<path d="M13 2 4 14h7l-1 8 9-12h-7z" fill="currentColor" stroke="none"/>',
  star:'<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" fill="currentColor" stroke="none"/>',
  lock:'<rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  play:'<path d="M8 5v14l11-7z" fill="currentColor" stroke="none"/>',
  speaker:'<path d="M4 9h4l5-4v14l-5-4H4zM16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>',
  turtle:'<path d="M4 15c0-4 3.5-7 8-7s8 3 8 7z"/><path d="M20 13h2M6 15v2M18 15v2M9.5 8.5 12 15l2.5-6.5"/>',
  mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>',
  send:'<path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/>',
  close:'<path d="M6 6l12 12M18 6 6 18"/>',
  chat:'<path d="M4 5h16v11H9l-5 4z"/>',
  repeat:'<path d="M17 2.5 20.5 6 17 9.5"/><path d="M3.5 11V9a3 3 0 0 1 3-3h14M7 21.5 3.5 18 7 14.5"/><path d="M20.5 13v2a3 3 0 0 1-3 3h-14"/>',
  timer:'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9 2h6"/>',
  ear:'<path d="M7 10a5 5 0 0 1 10 0c0 3-3 4-3 7a3 3 0 0 1-6 0"/><path d="M10 10a2 2 0 0 1 4 0"/>',
  pairs:'<rect x="3" y="4" width="8" height="7" rx="2"/><rect x="13" y="13" width="8" height="7" rx="2"/><path d="M11 7.5h4a2 2 0 0 1 2 2V13"/>',
  spell:'<path d="M4 18 8 6l4 12M5.5 14h5M14 12h6M14 16h4"/>',
  tf:'<path d="M5 12.5l3 3 5-6M14 9l6 6M20 9l-6 6"/>',
  book:'<path d="M12 6.5C10 5 7 4.5 4 5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V5c-3-.5-6 0-8 1.5zM12 6.5v13"/>',
  trophy:'<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 21h8M9.5 17h5"/>',
  target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  bell:'<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  moon:'<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  sound:'<path d="M4 9h4l5-4v14l-5-4H4zM16.5 8.5a5 5 0 0 1 0 7"/>',
  logout:'<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H3"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  heart:'<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  brain:'<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V4.5A2.5 2.5 0 0 0 9 4zM15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1"/>',
  flag:'<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
};
const ic=(n,s=20,w=2)=>`<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n]||''}</svg>`;

/* ---------------- tema ---------------- */
function themePref(){return ls('fluent_theme')||'dark'}
function applyTheme(){const p=themePref();const t=p==='auto'?(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'):p;document.documentElement.dataset.theme=t;const m=document.querySelector('meta[name=theme-color]');if(m)m.content=t==='light'?'#f1f1f3':'#131416'}

/* ---------------- avisos visuales ---------------- */
let toastT;function toast(msg,mood='happy'){const t=$('toast');t.innerHTML=`${kikoSVG(30,mood)}<span>${esc(msg)}</span>`;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),2600)}
function confetti(){const c=document.createElement('div');c.className='confetti';const cols=['#36c96f','#ffcf3f','#2f7bea','#e8504f','#ff9b4a','#ededee'];for(let i=0;i<55;i++){const p=document.createElement('i');p.style.left=Math.random()*100+'%';p.style.background=cols[i%cols.length];p.style.animationDelay=Math.random()*.4+'s';p.style.animationDuration=1.3+Math.random()*.9+'s';c.appendChild(p)}document.body.appendChild(c);setTimeout(()=>c.remove(),2800)}

/* ---------------- hojas ---------------- */
function openSheet(html){$('sheet').innerHTML='<div class="grab"></div>'+html;$('overlay').classList.add('open');$('sheet').scrollTop=0;sfx('open')}
function closeSheet(){if($('overlay').classList.contains('open'))sfx('close');stopListen();try{speechSynthesis.cancel()}catch(e){}$('overlay').classList.remove('open')}
$('overlay').addEventListener('click',e=>{if(e.target.id==='overlay')closeSheet()});
const head=(t,sub)=>`<div class="shead"><div><h3>${t}</h3>${sub?`<p>${sub}</p>`:''}</div><button class="x" onclick="closeSheet()" aria-label="Cerrar">${ic('close',17)}</button></div>`;

/* ---------------- logros ---------------- */
const ACHS=[
  ['first','Primer paso','Termina tu primera lección','flag',()=>S.totals.lessons>=1],
  ['s3','En llamas','Racha de 3 días','fire',()=>bestStreak()>=3],
  ['s7','Una semana','Racha de 7 días','fire',()=>bestStreak()>=7],
  ['s30','Imparable','Racha de 30 días','fire',()=>bestStreak()>=30],
  ['x100','100 XP','Gana 100 puntos','bolt',()=>S.totals.xp>=100],
  ['x1000','1,000 XP','Gana 1,000 puntos','bolt',()=>S.totals.xp>=1000],
  ['x5000','5,000 XP','Gana 5,000 puntos','bolt',()=>S.totals.xp>=5000],
  ['w50','50 palabras','Aprende 50 palabras','book',()=>wordsLearned()>=50],
  ['w250','250 palabras','Aprende 250 palabras','book',()=>wordsLearned()>=250],
  ['w700','Vocabulario pro','Aprende 700 palabras','book',()=>wordsLearned()>=700],
  ['perfect','Perfecto','Lección sin errores','star',()=>S.totals.perfect>=1],
  ['perfect10','Precisión','10 lecciones perfectas','star',()=>S.totals.perfect>=10],
  ['speak50','Buena pronunciación','50 frases dichas bien','mic',()=>S.totals.speak>=50],
  ['tutor10','Platicador','10 mensajes con Alex','chat',()=>S.totals.tutor>=10],
  ['games10','Jugador','Juega 10 juegos','timer',()=>S.totals.games>=10],
  ['review100','Memoria de elefante','100 repasos','brain',()=>S.totals.reviews>=100],
  ['unit1','Curso 1 completo','Termina el curso 1','trophy',()=>unitComplete(1)],
  ['unit8','Mitad del camino','Termina el curso 8','trophy',()=>unitComplete(8)],
  ['unit16','Nivel B2','Termina el curso 16','trophy',()=>unitComplete(16)],
  ['unit20','¡Fluent!','Termina los 20 cursos','trophy',()=>unitComplete(20)],
  ['exam85','Distinción','Saca 85% o más en un examen','star',()=>Object.values(S.units).some(u=>u.exam?.total>=85)],
];
function checkAchs(){const got=[];for(const [id,name,,,fn] of ACHS){if(!S.ach[id]&&fn()){S.ach[id]=today();got.push(name)}}return got}

/* ---------------- avance de cursos ---------------- */
function lessonDone(id){return !!S.done[id]}
function unitComplete(uid){const u=unitById(uid);return !!u&&u.lessons.every(l=>lessonDone(l.id))&&!!S.units[uid]?.test}
function unitUnlocked(uid){return uid===1||unitComplete(uid-1)||!!S.units[uid]?.skip}
function nextLesson(){for(const u of UNITS){if(!unitUnlocked(u.id))return null;for(const l of u.lessons)if(!lessonDone(l.id))return l;if(!S.units[u.id]?.test)return {test:u.id}}return null}

/* ---------------- navegación ---------------- */
const VIEWS=[['learn','Aprender','learn'],['practice','Practicar','practice'],['dict','Diccionario','dict'],['stats','Progreso','stats']];
function buildNav(){
  $('nav').innerHTML=VIEWS.map(v=>`<button class="${view===v[0]?'on':''}" onclick="go('${v[0]}')">${ic(v[2],23)}<span>${v[1]}</span></button>`).join('');
  $('side').innerHTML=`<div class="brand">${kikoSVG(42,'idle')} Fluent</div>`+VIEWS.concat([['settings','Ajustes','gear']]).map(v=>`<button class="nv ${view===v[0]?'on':''}" onclick="go('${v[0]}')">${ic(v[2],21)} ${v[1]}</button>`).join('');
}
function go(v){if(v!==view)sfx('toggle');view=v;buildNav();render();scrollTo({top:0})}
function topbar(){const st=streak(),d=dayRec(),goal=S.settings.goal;const doneToday=S.days[today()]?.xp>0;
  return `<div class="topbar"><button class="stat ${doneToday?'fire':'dim'}" onclick="openStreak()" aria-label="Racha">${ic('fire',22)} ${st}</button><button class="stat xp" onclick="go('stats')" aria-label="Puntos de hoy">${ic('bolt',20)} ${d.xp}/${goal}</button><button class="stat" style="color:var(--muted)" onclick="go('stats')">${ic('star',18)} Nivel ${level().lv}</button><button class="iconbtn" onclick="go('settings')" aria-label="Ajustes">${ic('gear',19)}</button></div>`}
function render(){const m=$('main');const fn={learn:learnView,practice:practiceView,dict:dictView,stats:statsView,settings:settingsView}[view]||learnView;m.innerHTML=topbar()+fn();m.classList.remove('fade');void m.offsetWidth;m.classList.add('fade');if(view==='learn')setTimeout(scrollToCurrent,60)}
function openStreak(){const st=streak();const days=[...Array(7)].map((_,i)=>addDays(today(),i-6));
  openSheet(`<div style="text-align:center">${kikoSVG(110,st?'celebrate':'think')}<h3 style="font-size:40px;margin:4px 0;color:var(--fire)">${st} ${st===1?'día':'días'}</h3><p class="muted" style="margin-top:0">${st?'de racha. Practica hoy para no perderla.':'Haz una lección hoy para empezar tu racha.'}</p>
  <div style="display:flex;justify-content:center;gap:8px;margin:16px 0">${days.map(k=>{const on=S.days[k]?.xp>0;return `<div style="text-align:center"><div style="width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:${on?'var(--fire)':'var(--s3)'};color:${on?'#2b1400':'var(--faint)'}">${ic(on?'check':'fire',16)}</div><span class="small muted">${'DLMMJVS'[new Date(k+'T12:00').getDay()]}</span></div>`}).join('')}</div>
  <p class="muted small">Mejor racha: ${bestStreak()} días</p><button class="btn" onclick="closeSheet();startNext()">Practicar ahora</button></div>`)}

/* ---------------- notificaciones ---------------- */
function pushState(){
  if(!('serviceWorker' in navigator)||!('PushManager' in window)||!('Notification' in window)){const ios=/iphone|ipad|ipod/i.test(navigator.userAgent),st=navigator.standalone||matchMedia('(display-mode: standalone)').matches;return ios&&!st?'install':'unsupported'}
  if(Notification.permission==='denied')return 'denied';
  return Notification.permission==='granted'&&ls('fluent_push')==='on'?'on':'off';
}
const b64=b=>{const p='='.repeat((4-b.length%4)%4),s=atob((b+p).replace(/-/g,'+').replace(/_/g,'/'));return Uint8Array.from([...s].map(c=>c.charCodeAt(0)))};
async function enablePush(btn){
  try{if(btn)btn.disabled=true;const perm=await Notification.requestPermission();if(perm!=='granted'){if(btn)btn.disabled=false;return toast('Sin permiso no te puedo recordar','sad')}
    const reg=await navigator.serviceWorker.ready;const {publicKey}=await (await fetch(PUSH_API+'/api/vapid')).json();
    let sub=await reg.pushManager.getSubscription();if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64(publicKey)});
    const j=sub.toJSON();const {error}=await sb.from('rt_push_subs').upsert({user_id:user.id,app:'fluent',endpoint:j.endpoint,p256dh:j.keys.p256dh,auth:j.keys.auth,tz:Intl.DateTimeFormat().resolvedOptions().timeZone},{onConflict:'endpoint'});if(error)throw error;
    ls('fluent_push','on');sfx('done');save(true);return true;
  }catch(e){console.error(e);if(btn)btn.disabled=false;alert('No se pudieron activar: '+(e.message||e));return false}
}
async function testPush(){try{const {data:{session}}=await sb.auth.getSession();const r=await fetch(PUSH_API+'/api/test-push',{method:'POST',headers:{Authorization:'Bearer '+session.access_token,'Content-Type':'application/json'},body:JSON.stringify({app:'fluent'})});const j=await r.json().catch(()=>({}));toast(r.ok?'Enviada, revisa tus notificaciones':'No se pudo: '+(j.error||r.status))}catch(e){toast('No se pudo enviar','sad')}}

/* ---------------- cuenta ---------------- */
function showSignup(on){$('loginCard').style.display=on?'none':'block';$('signupCard').style.display=on?'block':'none'}
function authErr(id,m){const e=$(id);e.textContent=m;e.style.display='block';sfx('error')}
async function login(){const email=$('lEmail').value.trim(),password=$('lPass').value;if(!email||!password)return authErr('loginErr','Escribe tu correo y contraseña.');
  $('lBtn').disabled=true;const {data,error}=await sb.auth.signInWithPassword({email,password});$('lBtn').disabled=false;
  if(error)return authErr('loginErr',error.message==='Invalid login credentials'?'Correo o contraseña incorrectos.':error.message.includes('confirm')?'Primero confirma tu correo (revisa tu bandeja).':error.message);sfx('done');start(data.user)}
async function signup(){const name=$('sName').value.trim(),email=$('sEmail').value.trim(),password=$('sPass').value;
  if(!name)return authErr('signupErr','Escribe tu nombre.');if(!email.includes('@'))return authErr('signupErr','Escribe un correo válido.');if(password.length<6)return authErr('signupErr','La contraseña debe tener al menos 6 caracteres.');
  $('sBtn').disabled=true;const {data,error}=await sb.auth.signUp({email,password,options:{data:{name},emailRedirectTo:location.origin}});$('sBtn').disabled=false;
  if(error)return authErr('signupErr',error.message.includes('registered')?'Ese correo ya tiene cuenta. Entra con él.':error.message);
  if(!data.session){showSignup(false);authErr('loginErr','Te mandamos un correo de confirmación. Ábrelo y luego entra aquí.');return}sfx('done');start(data.user)}
async function logout(){await pushSave();await sb.auth.signOut();user=null;S=null;closeSheet();$('auth').classList.add('open')}

/* ---------------- arranque ---------------- */
function hideSplash(){const s=$('splash');if(s&&!s.classList.contains('hide')){s.classList.add('hide');setTimeout(()=>s.remove(),450)}}
async function start(u){
  user=u;$('auth').classList.remove('open');
  await loadState();buildNav();render();hideSplash();
  if(!S.settings.onboarded)setTimeout(openOnboarding,500);
  else if(!u.user_metadata?.name)setTimeout(()=>openName(true),800);
}
async function boot(){
  applyTheme();$('splashK').innerHTML=kikoSVG(150,'wave');$('authK').innerHTML=kikoSVG(130,'wave');
  if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
  setTimeout(hideSplash,6000);
  const {data:{session}}=await sb.auth.getSession();
  if(session)await start(session.user);else{$('auth').classList.add('open');hideSplash()}
}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&S)pushSave()});
