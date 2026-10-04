// Fluent — aprender: ruta de cursos, lecciones, ejercicios, resultados, pruebas y recuperar racha.

/* ---------------- recuperar racha ---------------- */
// Si se te pasaron 1 o 2 días, puedes recuperar la racha ganando hoy el doble (o triple) de tu meta.
function repairInfo(){
  if(!S)return null;const t=today();
  let k=addDays(t,-1);const missed=[];
  while(!(S.days[k]?.xp>0)&&missed.length<3){missed.push(k);k=addDays(k,-1)}
  if(!missed.length||missed.length>2)return null;
  let prev=0,j=k;while(S.days[j]?.xp>0){prev++;j=addDays(j,-1)}
  if(prev<2)return null;
  const need=S.settings.goal*(missed.length+1);
  return {missed,prev,need,have:dayRec().xp};
}
function tryRepair(){const r=repairInfo();if(!r||r.have<r.need)return false;r.missed.forEach(k=>{S.days[k]={xp:1,ms:0,correct:0,total:0,lessons:0,repaired:true}});save(true);return r.prev+r.missed.length+1}
function repairBanner(){const r=repairInfo();if(!r)return '';const pct=Math.min(100,Math.round(r.have/r.need*100));
  return `<div class="card" style="border-color:var(--fire)"><div class="row">${kikoSVG(56,'sad')}<div style="flex:1"><b style="font-size:17px">Recupera tu racha de ${r.prev} días</b><div class="muted small">Se te ${r.missed.length===1?'pasó ayer':'pasaron 2 días'}. Gana <b>${r.need} XP hoy</b> y la recuperas completa.</div><div class="meter"><i style="width:${pct}%;background:var(--fire)"></i></div><div class="small muted" style="margin-top:4px">${r.have} de ${r.need} XP</div></div></div></div>`}

/* ---------------- ruta ---------------- */
const OFFS=[0,52,78,52,0,-52,-78,-52];
function learnView(){
  const nx=nextLesson();const curUnit=nx?(nx.test||nx.unit):16;
  const goalPct=Math.min(100,Math.round(dayRec().xp/S.settings.goal*100));
  let html=repairBanner()+`<div class="card row" style="cursor:pointer" onclick="startNext()">${kikoSVG(62,goalPct>=100?'celebrate':'wave')}<div style="flex:1"><b style="font-size:18px">${goalPct>=100?'¡Meta de hoy cumplida!':greet()}</b><div class="muted small">${goalPct>=100?'Sigue sumando XP si quieres.':`Te faltan ${Math.max(0,S.settings.goal-dayRec().xp)} XP para tu meta de hoy.`}</div><div class="meter"><i style="width:${goalPct}%"></i></div></div></div>`;
  for(const u of UNITS){
    const unlocked=unitUnlocked(u.id);const done=unitComplete(u.id);const current=u.id===curUnit;
    html+=`<section class="unit" id="unit${u.id}"><div class="unit-head ${current?'current':''}" onclick="openUnit(${u.id})"><div style="flex:1"><div class="num">Curso ${u.id}${done?' · Completado':''}</div><h3>${esc(u.title_es)}</h3></div><span class="lvl">${u.level}</span>${!unlocked?ic('lock',18):''}</div><div class="path">`;
    let n=0;
    u.lessons.forEach((l,i)=>{const d=S.done[l.id];const open=unlocked&&!d&&(i===0?true:!!S.done[u.lessons[i-1].id]);const isNext=nx&&nx.id===l.id;
      html+=`<button class="node ${d?'done':open?'open':''}" style="transform:translateX(${OFFS[n++%8]}px)" onclick="${d||open?`openLesson('${l.id}')`:`lockedLesson()`}" aria-label="Lección ${esc(l.title_es)}">${isNext?'<span class="tag">Empezar</span>':''}${d?ic('check',30,3):open?ic('star',30):ic('lock',24)}${d?`<span class="stars">${[1,2,3].map(s=>ic('star',13).replace('currentColor',s<=d.stars?'currentColor':'var(--s3)')).join('')}</span>`:''}</button>`;
      if(i===2&&current)html+=`<div style="align-self:${n%2?'flex-start':'flex-end'};margin:-60px 6px 0;pointer-events:auto">${kikoSVG(72,'idle')}</div>`;
    });
    const allL=u.lessons.every(l=>S.done[l.id]);
    html+=`<button class="node big ${S.units[u.id]?.dlg?'done':allL||unlocked&&u.lessons.slice(0,3).every(l=>S.done[l.id])?'open':''}" style="transform:translateX(${OFFS[n++%8]}px)" onclick="${unlocked&&u.lessons.slice(0,3).every(l=>S.done[l.id])?`openDialogue(${u.id})`:'lockedLesson()'}" aria-label="Conversación">${ic('chat',30)}</button>`;
    html+=`<button class="node big ${S.units[u.id]?.test?'done':allL?'open':''}" style="transform:translateX(${OFFS[n++%8]}px)" onclick="${allL?`openTest(${u.id})`:(!unlocked?`offerSkip(${u.id})`:'lockedLesson()')}" aria-label="Examen final">${nx&&nx.test===u.id?'<span class="tag">Examen</span>':''}${ic('trophy',32)}</button>`;
    html+=`</div></section>`;
  }
  return html+`<div class="card" style="text-align:center">${kikoSVG(90,'celebrate')}<b>¡Al final de la ruta hablarás inglés con confianza!</b><div class="muted small">${UNITS.length} cursos · ${LESSONS.length} lecciones · ${ALL_WORDS.length} palabras · ${ALL_SENTS.length} frases</div></div>`;
}
function greet(){const h=new Date().getHours();const g=h>=5&&h<12?'Good morning':h<19?'Good afternoon':'Good evening';return g+(userName()?', '+esc(userName()):'')+'!'}
function scrollToCurrent(){const el=document.querySelector('.node .tag');if(el&&!window.__scrolled){window.__scrolled=1;el.closest('.node').scrollIntoView({block:'center',behavior:'smooth'})}}
function lockedLesson(){sfx('error');toast('Termina lo anterior para desbloquearlo','think')}
function startNext(){const nx=nextLesson();if(!nx)return toast('¡Terminaste todo! Repasa o platica con Kiko','celebrate');if(nx.test)return openTest(nx.test);startLesson(nx.id)}
function openUnit(uid){
  const u=unitById(uid);const unlocked=unitUnlocked(uid);
  openSheet(head(`Curso ${u.id}: ${esc(u.title_es)}`,`${u.level} · ${esc(u.goal_es||'')}`)+
    `<div class="list">${u.lessons.map((l,i)=>`<div class="li" onclick="${unlocked&&(S.done[l.id]||i===0||S.done[u.lessons[i-1].id])?`closeSheet();openLesson('${l.id}')`:'lockedLesson()'}"><span class="pill">${i+1}</span><div class="mid"><div class="t">${esc(l.title_es)}</div><div class="s">${l.words.slice(0,4).map(w=>esc(enMain(w.en))).join(', ')}…</div></div>${S.done[l.id]?`<span style="color:var(--gold)">${ic('star',18)}</span>`:''}</div>`).join('')}</div>`+
    (unlocked?'':`<p class="muted" style="margin:14px 2px">¿Ya sabes lo de los cursos anteriores? Haz una prueba y salta hasta aquí.</p><button class="btn" onclick="closeSheet();startSkipTest(${uid})">${ic('trophy',18)} Prueba para saltar</button>`));
}
function offerSkip(uid){openUnit(uid)}

/* ---------------- detalle de lección ---------------- */
function openLesson(id){
  const l=lessonById(id);const d=S.done[id];
  openSheet(head(esc(l.title_es),`Curso ${l.unit}, lección ${l.idx+1}`)+
  `<div class="tipbox"><b>${ic('book',16)} Tip</b>${esc(l.tip_es)}</div>
  <div class="list" style="margin-bottom:16px">${l.words.map(w=>`<div class="li" onclick="speak('${esc(enMain(w.en)).replace(/'/g,"\\'")}')"><span style="color:var(--blue)">${ic('speaker',18)}</span><div class="mid"><div class="t">${esc(w.en)}</div><div class="s">${esc(w.es)}</div></div></div>`).join('')}</div>
  <button class="btn" onclick="closeSheet();startLesson('${id}')">${d?'Practicar otra vez':'Empezar lección'}</button>`);
}

/* ---------------- construcción de ejercicios ---------------- */
function distractors(correct,pool,n,field){const c=String(correct).toLowerCase();return pick(pool.filter(x=>String(x[field]).toLowerCase()!==c&&enMain(x[field])!==enMain(correct)),n).map(x=>field==='en'?enMain(x.en):x.es)}
function poolFor(unitId){const near=ALL_WORDS.filter(w=>Math.abs(w.unit-unitId)<=1);return near.length>12?near:ALL_WORDS}
function tokens(s){return s.replace(/[.,!?]/g,'').split(/\s+/).filter(Boolean)}
function exWord(w,kind){
  const pool=poolFor(w.unit||1);const item={...w,kind:'w'};
  if(kind==='en2es')return {type:'mc',q:'¿Qué significa?',prompt:enMain(w.en),say:enMain(w.en),options:shuffle([w.es,...distractors(w.en,pool,3,'es')]),answer:w.es,item};
  if(kind==='listen')return {type:'mc',q:'¿Qué escuchas?',audio:enMain(w.en),options:shuffle([enMain(w.en),...distractors(w.en,pool,3,'en')]),answer:enMain(w.en),item};
  if(kind==='type')return {type:'type',q:'Escríbelo en inglés',prompt:w.es,answer:enMain(w.en),item};
  return {type:'mc',q:`¿Cómo se dice “${w.es}”?`,prompt:null,options:shuffle([enMain(w.en),...distractors(w.en,pool,3,'en')]),answer:enMain(w.en),item,sayAnswer:true};
}
function exSentence(s,kind,unitId){
  const item={...s,kind:'s'};const tk=tokens(s.en);const extra=pick(poolFor(unitId).map(w=>enMain(w.en)).filter(x=>!x.includes(' ')&&!tk.map(t=>t.toLowerCase()).includes(x.toLowerCase())),Math.min(4,Math.max(2,Math.round(tk.length/2))));
  if(kind==='build')return {type:'build',q:'Traduce esta frase',prompt:s.es,answer:s.en,tiles:shuffle([...tk,...extra]),item};
  if(kind==='listenBuild')return {type:'build',q:'Escribe lo que escuchas',audio:s.en,answer:s.en,tiles:shuffle([...tk,...extra]),item};
  if(kind==='speak')return {type:'speak',q:'Dilo en voz alta',prompt:s.en,es:s.es,answer:s.en,item};
  if(kind==='type')return {type:'type',q:'Traduce al inglés',prompt:s.es,answer:s.en,item};
  if(kind==='listenType')return {type:'type',q:'Escribe lo que escuchas',audio:s.en,answer:s.en,item};
  // completar: quita una palabra significativa
  const cands=tk.map((w,i)=>({w,i})).filter(x=>x.w.length>2);const c=cands.length?pick(cands,1)[0]:{w:tk[0],i:0};
  const shown=tk.map((w,i)=>i===c.i?'____':w).join(' ');const opts=shuffle([c.w,...pick(poolFor(unitId).map(w=>enMain(w.en)).filter(x=>!x.includes(' ')&&x.toLowerCase()!==c.w.toLowerCase()),3)]);
  return {type:'mc',q:'Completa la frase',prompt:shown,promptEs:s.es,options:opts,answer:c.w,item,sayAfter:s.en};
}
function exPairs(words){return {type:'pairs',q:'Une las parejas',pairs:pick(words,5).map(w=>[enMain(w.en),w.es])}}
function exReviewFromCard(c){const w={en:c.en,es:c.es,unit:+String(c.lesson).split('-')[0]||1,lesson:c.lesson};return c.kind==='s'?exSentence(w,pickArr(['build','speak','type']),w.unit):exWord(w,pickArr(['es2en','en2es','listen','type']))}
function buildLesson(l){
  const first=!S.done[l.id];const words=l.words.map(w=>({...w,unit:l.unit,lesson:l.id}));const sents=l.sentences.map(s=>({...s,unit:l.unit,lesson:l.id}));
  const q=[];
  const batches=[words.slice(0,4),words.slice(4)];
  batches.forEach((b,bi)=>{
    if(first)b.forEach(w=>q.push({type:'intro',w}));
    const kinds=shuffle(['es2en','en2es','listen',bi?'type':'es2en']);b.forEach((w,i)=>q.push(exWord(w,kinds[i])));
    if(first)q.push(exPairs(b.concat(pick(words.filter(x=>!b.includes(x)),1))));
  });
  if(!first)q.push(exPairs(words));
  const sk=['build','listenBuild','speak','fill','type'];sents.forEach((s,i)=>q.push(exSentence(s,sk[i],l.unit)));
  const due=srsDue().filter(c=>c.lesson!==l.id);pick(due,2).forEach(c=>q.push(exReviewFromCard(c)));
  return q;
}

/* ---------------- reproductor ---------------- */
let P=null;
function startLesson(id){const l=lessonById(id);runSession({mode:'lesson',lesson:l,queue:buildLesson(l),title:l.title_es})}
function runSession(o){
  P={...o,i:0,total:o.queue.filter(x=>x.type!=='intro').length,correct:0,wrong:0,combo:0,maxCombo:0,start:Date.now(),retried:new Set(),answered:0};
  $('player').classList.add('open');document.body.style.overflow='hidden';sfx('open');showEx();
}
function quitLesson(){if(P&&P.i>0&&P.mode!=='game'&&!confirm('¿Salir? Perderás el avance de esta lección.'))return;endPlayer()}
function endPlayer(){$('pBtn').onclick=footAction;stopListen();try{speechSynthesis.cancel()}catch(e){}$('player').classList.remove('open');document.body.style.overflow='';P=null;render()}
function setProgress(){const done=Math.min(P.answered,P.total);$('pBar').style.width=Math.round(done/Math.max(1,P.total)*100)+'%';$('pCombo').innerHTML=P.combo>=3?`${ic('fire',16)}${P.combo}`:'';$('pCombo').style.display='flex'}
let cur=null,sel=null,footMode='check';
function showEx(){
  setProgress();
  if(P.i>=P.queue.length)return finishSession();
  cur=P.queue[P.i];sel=null;footMode='check';
  const f=$('pFoot');f.className='p-foot';$('pFb').innerHTML='';const b=$('pBtn');b.className='btn';b.disabled=true;b.textContent='Comprobar';
  const body=$('pBody');body.innerHTML=renderEx(cur);body.scrollTop=0;
  if(cur.type==='intro'){b.disabled=false;b.textContent='Continuar';footMode='next';const w0=cur.w;setTimeout(()=>speak(enMain(w0.en)),250)}
  if(cur.audio)setTimeout(()=>speak(cur.audio),300);
  if(cur.type==='speak')setTimeout(()=>speak(cur.audioFirst||cur.prompt),300);
  if(cur.type==='pairs'){b.style.display='none'}else b.style.display='';
  if(cur.type==='type')setTimeout(()=>$('typeIn')?.focus(),200);
}
const spkBtn=(t,slow)=>`<button class="spk" style="border:0;background:none;padding:0" onclick="speak('${esc(t).replace(/'/g,"\\'")}',{slow:${!!slow}})" aria-label="Escuchar">${ic(slow?'turtle':'speaker',22)}</button>`;
function renderEx(e){
  if(e.type==='intro'){const w=e.w;return `<div class="p-q">Palabra nueva</div><div class="wordcard"><div style="display:flex;justify-content:center;gap:14px;margin-bottom:8px">${spkBtn(enMain(w.en))}${spkBtn(enMain(w.en),true)}</div><div class="en">${esc(w.en)}</div><div class="es">${esc(w.es)}</div><div class="ex">${esc(w.ex_en)}<i>${esc(w.ex_es)}</i></div></div><div style="display:flex;justify-content:center">${kikoSVG(80,'talk')}</div>`}
  let top=`<div class="p-q">${esc(e.q)}</div>`;
  if(e.audio)top+=`<div class="big-listen"><button onclick="speak('${esc(e.audio).replace(/'/g,"\\'")}')" aria-label="Escuchar">${ic('speaker',40)}</button><button class="slow" onclick="speak('${esc(e.audio).replace(/'/g,"\\'")}',{slow:true})" aria-label="Más lento">${ic('turtle',30)}</button></div>`;
  else if(e.prompt)top+=`<div class="p-prompt">${kikoSVG(70,e.type==='speak'?'talk':'idle')}<div class="bubble">${e.say||e.type==='speak'?spkBtn(e.say||e.prompt):''}${esc(e.prompt)}${e.promptEs?`<div class="small muted" style="margin-top:6px">${esc(e.promptEs)}</div>`:''}</div></div>`;
  if(e.type==='mc')return top+`<div class="opts ${e.options.every(o=>o.length<14)?'two':''}">${e.options.map((o,i)=>`<button class="opt" data-v="${esc(o)}" onclick="pickOpt(this)"><span class="k">${i+1}</span>${esc(o)}</button>`).join('')}</div>`;
  if(e.type==='build')return top+`<div class="answer" id="ans"></div><div class="bank" id="bank">${e.tiles.map((t,i)=>`<button class="tile" data-i="${i}" onclick="tapTile(this)">${esc(t)}</button>`).join('')}</div>`;
  if(e.type==='type')return top+`<textarea id="typeIn" class="typein" placeholder="Escribe en inglés…" autocapitalize="off" autocomplete="off" spellcheck="false" oninput="$('pBtn').disabled=!this.value.trim()"></textarea>`;
  if(e.type==='pairs'){const L=shuffle(e.pairs.map(p=>p[0])),R=shuffle(e.pairs.map(p=>p[1]));e._left=e.pairs.length;return top+`<div class="pairs">${L.map((x,i)=>`<button class="pair" data-side="L" data-v="${esc(x)}" onclick="tapPair(this)">${esc(x)}</button><button class="pair" data-side="R" data-v="${esc(R[i])}" onclick="tapPair(this)">${esc(R[i])}</button>`).join('')}</div>`}
  if(e.type==='speak'){const can=canListen();return top+`<div class="small muted" style="text-align:center;margin:-6px 0 14px">${esc(e.es)}</div>${can?`<button class="mic-xl" id="micX" onclick="toggleSpeak()" aria-label="Hablar">${ic('mic',44)}</button><div class="heard" id="heard">Toca el micrófono y dilo</div>`:`<textarea id="typeIn" class="typein" style="min-height:80px" placeholder="Toca aquí y usa el micrófono del teclado para dictarlo" oninput="$('pBtn').disabled=!this.value.trim()"></textarea>`}<button class="btn ghost" style="margin-top:12px" onclick="skipSpeak()">Ahora no puedo hablar</button>`}
  return top;
}
function pickOpt(el){document.querySelectorAll('.opt').forEach(o=>o.classList.remove('sel'));el.classList.add('sel');sel=el.dataset.v;$('pBtn').disabled=false;if(cur.sayAnswer)speak(sel)}
document.addEventListener('keydown',e=>{if(!P||!$('player').classList.contains('open'))return;if(/^[1-4]$/.test(e.key)&&cur?.type==='mc'&&footMode==='check'){const o=document.querySelectorAll('.opt')[+e.key-1];if(o)pickOpt(o)}if(e.key==='Enter'&&!$('pBtn').disabled&&document.activeElement?.id!=='typeIn'){e.preventDefault();footAction()}if(e.key==='Enter'&&document.activeElement?.id==='typeIn'&&!e.shiftKey){e.preventDefault();if(!$('pBtn').disabled)footAction()}});
function tapTile(el){const ans=$('ans');if(el.parentElement.id==='bank'){const c=el.cloneNode(true);c.onclick=()=>{el.classList.remove('used');c.remove();$('pBtn').disabled=!ans.children.length};ans.appendChild(c);el.classList.add('used');speakWord(el.textContent)}$('pBtn').disabled=!ans.children.length}
function speakWord(w){try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(w);const v=pickVoice();if(v)u.voice=v;u.lang='en-US';u.rate=1;speechSynthesis.speak(u)}catch(e){}}
let pairSel=null;
function tapPair(el){
  if(!pairSel||pairSel.dataset.side===el.dataset.side){document.querySelectorAll(`.pair[data-side="${el.dataset.side}"]`).forEach(p=>p.classList.remove('sel'));el.classList.add('sel');pairSel=el;if(el.dataset.side==='L')speakWord(el.dataset.v);return}
  const a=pairSel.dataset.side==='L'?pairSel:el,b=pairSel.dataset.side==='L'?el:pairSel;
  const ok=cur.pairs.some(p=>p[0]===a.dataset.v&&p[1]===b.dataset.v);
  if(ok){a.classList.remove('sel');b.classList.remove('sel');a.classList.add('ok');b.classList.add('ok');sfx('ok');cur._left--;if(cur._left<=0){mark(true,'¡Todas las parejas!')}}
  else{sfx('error');[a,b].forEach(x=>{x.classList.add('no');setTimeout(()=>x.classList.remove('no','sel'),400)});cur._miss=(cur._miss||0)+1}
  pairSel=null;
}
let speaking=false;
function toggleSpeak(){
  if(speaking){stopListen();return}
  const btn=$('micX'),h=$('heard');speaking=true;btn.classList.add('rec');h.textContent='Te escucho…';
  listen({onText:(t)=>{h.innerHTML=`<b>${esc(t)}</b>`},onEnd:(final)=>{speaking=false;btn?.classList.remove('rec');sfx('stop');if(!final){h.textContent='No te escuché. Toca y vuelve a intentarlo.';return}evalSpeak(final)},onError:(err)=>{speaking=false;btn?.classList.remove('rec');h.textContent=err==='not-allowed'?'Permite el micrófono en tu navegador.':'No te escuché bien. Intenta otra vez.'}});
}
function evalSpeak(said){const sc=similarity(said,cur.answer);const pct=Math.round(sc*100);if(sc>=.72){S.totals.speak++;mark(true,`Pronunciación ${pct}%`,`Dijiste: “${said}”`)}else mark(false,`Entendí: “${said}”`,`Se dice: ${cur.answer}`)}
function skipSpeak(){P.queue.splice(P.i,1);P.total--;showEx()}
function footAction(){
  if(footMode==='next'){P.i++;return showEx()}
  const e=cur;
  if(e.type==='mc'){const ok=sel===e.answer;document.querySelectorAll('.opt').forEach(o=>{if(o.dataset.v===e.answer)o.classList.add('right');else if(o.dataset.v===sel)o.classList.add('wrong')});if(e.sayAfter)speak(e.sayAfter);else if(e.prompt&&!e.say&&e.answer&&/^[\x00-\x7F]+$/.test(e.answer))speak(e.answer);mark(ok,ok?pickArr(['¡Muy bien!','¡Correcto!','¡Excelente!','¡Así es!']):'Respuesta correcta:',ok?(e.promptEs||''):e.answer)}
  else if(e.type==='build'){const said=[...$('ans').children].map(c=>c.textContent).join(' ');const ok=norm(said)===norm(e.answer);speak(e.answer);mark(ok,ok?'¡Perfecto!':'Respuesta correcta:',ok?'':e.answer)}
  else if(e.type==='type'||e.type==='speak'){const v=$('typeIn').value;if(e.type==='speak'){return evalSpeak(v)}const r=typedOK(v,e.answer);speak(e.answer);mark(!!r,r==='exact'?'¡Correcto!':r==='typo'?'¡Casi! Cuidado con la ortografía:':'Respuesta correcta:',r==='exact'?'':e.answer)}
}
function mark(ok,title,detail){
  footMode='next';const f=$('pFoot'),b=$('pBtn');b.style.display='';
  if(cur.type!=='intro')P.answered++;
  if(ok){P.correct++;P.combo++;P.maxCombo=Math.max(P.maxCombo,P.combo);sfx(P.combo>=5&&P.combo%5===0?'coin':'done');buzz(15)}
  else{P.wrong++;P.combo=0;sfx('error');buzz([30,40,30]);if(!P.retried.has(P.i)&&P.mode!=='test'){P.retried.add(P.queue.length);const again={...cur};delete again._left;P.queue.push(again);P.total++}}
  if(cur.item&&P.mode!=='game'){if(!S.srs[skey(cur.item)])srsAdd(cur.item,cur.item.kind);srsGrade(cur.item,ok)}
  const d=dayRec();d.total++;if(ok)d.correct++;S.totals.total++;if(ok)S.totals.correct++;
  f.className='p-foot '+(ok?'good':'bad');
  $('pFb').innerHTML=`<div>${kikoSVG(52,ok?'happy':'sad')}</div><div><h4>${esc(title)}</h4>${detail?`<p>${esc(detail)}</p>`:''}</div>`;
  b.className='btn '+(ok?'good':'bad');b.disabled=false;b.textContent='Continuar';setProgress();
}
function finishSession(){
  const ms=Date.now()-P.start;const acc=P.answered?Math.round(P.correct/P.answered*100):100;const perfect=P.wrong===0&&P.answered>0;
  let xp=P.correct*2+(perfect?10:0)+(P.mode==='lesson'?10:0)+(P.mode==='test'&&acc>=75?20:0);
  if(P.mode==='game')xp=P.gameXP??Math.round(P.correct*1.5);
  addXP(xp);const d=dayRec();d.ms+=ms;S.totals.ms+=ms;
  let extra='';
  if(P.mode==='lesson'){const l=P.lesson;const stars=acc>=95?3:acc>=80?2:1;const prev=S.done[l.id];S.done[l.id]={stars:Math.max(stars,prev?.stars||0),best:Math.max(acc,prev?.best||0),at:today(),n:(prev?.n||0)+1};if(!prev){S.totals.lessons++;d.lessons++;l.words.forEach(w=>srsAdd({...w,lesson:l.id},'w'));l.sentences.forEach(s=>srsAdd({...s,lesson:l.id},'s'))}if(perfect)S.totals.perfect++}
  if(P.mode==='review')S.totals.reviews+=P.answered;
  if(P.mode==='test'){const pass=acc>=75;if(P.skipTo){if(pass){for(const u of UNITS){if(u.id>=P.skipTo)break;u.lessons.forEach(l=>{if(!S.done[l.id])S.done[l.id]={stars:1,best:acc,at:today(),n:0,skipped:true};l.words.forEach(w=>{const c=srsAdd({...w,lesson:l.id},'w');c.i=Math.max(c.i,7);c.due=addDays(today(),7)})});S.units[u.id]={...(S.units[u.id]||{}),test:acc}}}extra=pass?`<p>¡Saltaste hasta el curso ${P.skipTo}!</p>`:'<p class="muted">Te faltó poquito. Sigue desde donde vas.</p>'}else{if(pass)S.units[P.unit]={...(S.units[P.unit]||{}),test:acc};extra=pass?`<p>¡Curso ${P.unit} completado!</p>`:'<p class="muted">Necesitas 75% para pasar. ¡Vuelve a intentarlo!</p>'}}
  if(P.onFinish)P.onFinish(acc);
  const repaired=tryRepair();const achs=checkAchs();save(true);
  const goalHit=d.xp>=S.settings.goal&&d.xp-xp<S.settings.goal;
  const great=acc>=80||P.mode==='game';
  sfx(great?'celebrate':'ok');if(great)confetti();
  const t=Math.round(ms/1000);
  $('pBar').style.width='100%';$('pFoot').className='p-foot';$('pFb').innerHTML='';
  $('pBody').innerHTML=`<div class="result">${kikoSVG(150,great?'celebrate':'happy')}<h2>${P.mode==='test'?(acc>=75?'¡Aprobado!':'Casi…'):perfect?'¡Lección perfecta!':great?'¡Lección completada!':'¡Bien hecho!'}</h2>${extra}
  <div class="rstats"><div class="rstat xp"><b>+${xp}</b><span>XP</span></div><div class="rstat acc"><b>${acc}%</b><span>Aciertos</span></div><div class="rstat time"><b>${Math.floor(t/60)}:${pad(t%60)}</b><span>Tiempo</span></div></div>
  ${P.maxCombo>=5?`<p class="muted">Mejor racha de aciertos: <b style="color:var(--fire)">${P.maxCombo}</b></p>`:''}
  ${repaired?`<div class="card" style="border-color:var(--fire)"><b style="color:var(--fire)">${ic('fire',18)} ¡Racha recuperada! ${repaired} días</b></div>`:''}
  ${goalHit?`<div class="card"><b>${ic('target',18)} ¡Cumpliste tu meta de hoy!</b></div>`:''}
  ${achs.map(a=>`<div class="card"><b style="color:var(--gold)">${ic('trophy',18)} Logro: ${esc(a)}</b></div>`).join('')}</div>`;
  const b=$('pBtn');b.className='btn';b.style.display='';b.disabled=false;b.textContent='Continuar';footMode='end';
  $('pBtn').onclick=()=>{$('pBtn').onclick=footAction;endPlayer();if(goalHit&&streak()===1)setTimeout(openStreak,300)};
}

/* ---------------- pruebas ---------------- */
function testQueue(units,n=20){const ws=[],ss=[];units.forEach(u=>u.lessons.forEach(l=>{l.words.forEach(w=>ws.push({...w,unit:u.id,lesson:l.id}));l.sentences.forEach(s=>ss.push({...s,unit:u.id,lesson:l.id}))}));
  const q=[];pick(ws,Math.round(n*.55)).forEach(w=>q.push(exWord(w,pickArr(['es2en','en2es','listen','type']))));pick(ss,Math.round(n*.45)).forEach(s=>q.push(exSentence(s,pickArr(['build','listenBuild','fill','type']),s.unit)));return shuffle(q)}
function openTest(uid){const u=unitById(uid);openSheet(head(`Prueba del curso ${uid}`,esc(u.title_es))+`<div style="display:flex;justify-content:center">${kikoSVG(110,'think')}</div><p class="muted" style="text-align:center">20 preguntas de todo el curso. Necesitas 75% para pasar al siguiente.</p>${S.units[uid]?.test?`<p style="text-align:center">Tu mejor resultado: <b>${S.units[uid].test}%</b></p>`:''}<button class="btn" onclick="closeSheet();runSession({mode:'test',unit:${uid},queue:testQueue([unitById(${uid})]),title:'Prueba'})">Empezar prueba</button>`)}
function startSkipTest(uid){const prev=UNITS.filter(u=>u.id<uid);runSession({mode:'test',skipTo:uid,queue:testQueue(prev.slice(-3),24),title:'Prueba para saltar'})}

/* ---------------- bienvenida ---------------- */
function openOnboarding(step=1){
  if(step===1)return openSheet(`<div style="text-align:center">${kikoSVG(150,'wave')}<h3 style="font-size:28px;margin:6px 0">¡Hola${userName()?', '+esc(userName()):''}! Soy Kiko.</h3><p class="muted">Te voy a acompañar a aprender inglés desde cero: lecciones cortas, juegos, repaso diario y pláticas conmigo.</p><button class="btn" onclick="openOnboarding(2)">Empezar</button></div>`);
  if(step===2)return openSheet(head('¿Cuánto quieres practicar al día?','Puedes cambiarlo cuando quieras.')+`<div class="choice">${[[20,'Relajado','5 min al día'],[30,'Normal','10 min al día'],[50,'En serio','15 min al día'],[80,'Intenso','20+ min al día']].map(([g,n,s])=>`<button class="${S.settings.goal===g?'on':''}" onclick="S.settings.goal=${g};sfx('toggle');openOnboarding(3)">${ic('target',20)} ${n}<span>${s}</span></button>`).join('')}</div>`);
  if(step===3)return openSheet(head('¿A qué hora te recuerdo?','Te mando una notificación para que no pierdas tu racha.')+`<div class="field"><input type="time" id="obTime" value="${S.settings.remind}"></div><button class="btn" onclick="S.settings.remind=$('obTime').value||'19:00';enablePush(this).finally(()=>openOnboarding(4))">${ic('bell',18)} Activar recordatorio</button><button class="btn alt" onclick="S.settings.remind=$('obTime').value||'19:00';openOnboarding(4)">Ahora no</button>`);
  S.settings.onboarded=true;save(true);closeSheet();render();setTimeout(()=>startLesson(UNITS[0].lessons[0].id),300);
}
