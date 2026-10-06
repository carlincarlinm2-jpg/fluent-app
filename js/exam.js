// Fluent — examen final de cada curso, estilo Cambridge: Reading, Listening, Use of English, Writing y Speaking.
// Se aprueba con 70%: 85%+ "con distinción", 75%+ "con mérito". Writing y Speaking los califica Alex (IA); si no hay conexión, te autoevalúas.
const EXAMS=window.EXAMS||{};
const VOICE_SEX={11:{A:'f',B:'m'},15:{A:'f',B:'m'},18:{A:'m',B:'f'},19:{A:'f',B:'m'},20:{A:'f',B:'m'}};
let X=null;

function sexVoices(){if(!voices.length)loadVoices();const us=voices.filter(v=>/en[-_]US/i.test(v.lang));const pool=us.length?us:voices;
  const m=pool.find(v=>/(Alex|Daniel|Fred|Aaron|Guy|Davis|Tom|Rishi|Male|David|Mark)/i.test(v.name));const f=pool.find(v=>/(Samantha|Google US English|Ava|Allison|Aria|Jenny|Susan|Zira|Female|Karen|Moira|Victoria)/i.test(v.name));
  return {f:f||pool[0]||null,m:m&&m!==f?m:null}}
function speakLines(lines,uid,onDone){
  try{speechSynthesis.cancel()}catch(e){}const vs=sexVoices();const map=VOICE_SEX[uid]||{A:'f',B:'m'};let i=0;
  const next=()=>{if(i>=lines.length){onDone&&onDone();return}const l=lines[i++];const sex=map[l.who]||'f';const u=new SpeechSynthesisUtterance(l.en);
    const v=sex==='m'?(vs.m||vs.f):vs.f;if(v)u.voice=v;u.lang='en-US';u.rate=(S.settings.rate||.92);u.pitch=sex==='m'&&!vs.m?.75:sex==='f'&&!vs.m?1.15:1;u.onend=()=>setTimeout(next,380);u.onerror=()=>setTimeout(next,100);speechSynthesis.speak(u)};
  next();
}
function examLevel(uid){return unitById(uid)?.level||'A1'}
function openTest(uid){openExam(uid)}
function openExam(uid){
  const u=unitById(uid),e=EXAMS[uid];if(!e)return toast('Este examen todavía no está listo','think');
  const best=S.units[uid]?.exam;
  openSheet(head(`Examen final · Curso ${uid}`,`${esc(u.title_es)} · Nivel ${u.level}`)+`<div style="display:flex;justify-content:center">${kikoSVG(110,'think')}</div>
  <p class="muted" style="text-align:center;line-height:1.5">Un examen como los de Cambridge, con las 5 habilidades. Dura unos 15 a 20 minutos y se aprueba con <b>70%</b>.</p>
  <div class="list" style="margin:12px 0">${[['book','Reading','Lee un texto y contesta 5 preguntas'],['ear','Listening','Escucha una conversación (2 veces) y contesta 5 preguntas'],['spell','Use of English','10 preguntas de gramática y vocabulario'],['practice','Writing',`Escribe un texto de ${e.writing.min_words}–${e.writing.max_words} palabras`],['mic','Speaking','Lee en voz alta y contesta preguntas hablando']].map(([i,t,s])=>`<div class="li" style="cursor:default">${ic(i,20)}<div class="mid"><div class="t">${t}</div><div class="s">${s}</div></div></div>`).join('')}</div>
  ${best?`<p style="text-align:center">Tu mejor resultado: <b>${best.total}%</b> · ${esc(gradeName(best.total))}</p>`:''}
  <button class="btn" onclick="closeSheet();startExam(${uid})">Empezar examen</button>`);
}
function gradeName(p){return p>=85?'Aprobado con distinción':p>=75?'Aprobado con mérito':p>=70?'Aprobado':'No aprobado'}

/* ---------------- flujo ---------------- */
function startExam(uid){
  const e=EXAMS[uid];
  X={uid,e,step:0,ans:{reading:[],listening:[],use:[]},writing:'',speakRead:[],speakAns:[],plays:0,start:Date.now()};
  X.steps=[{s:'intro'},...e.reading.questions.map((q,i)=>({s:'reading',i})),{s:'listenIntro'},{s:'listening'},...e.use.map((q,i)=>({s:'use',i})),{s:'writing'},...e.speaking.read_aloud.map((t,i)=>({s:'read',i})),...e.speaking.questions.map((t,i)=>({s:'speakQ',i})),{s:'grading'}];
  P={mode:'exam',i:0,total:X.steps.length,answered:0,correct:0,wrong:0,combo:0,maxCombo:0,start:Date.now(),queue:[],retried:new Set()};
  $('player').classList.add('open');document.body.style.overflow='hidden';sfx('open');examStep();
}
function exBar(){$('pBar').style.width=Math.round(X.step/(X.steps.length-1)*100)+'%';$('pCombo').textContent=''}
function exFoot(label,enabled,fn){const b=$('pBtn');b.style.display='';b.className='btn';b.textContent=label;b.disabled=!enabled;$('pFoot').className='p-foot';$('pFb').innerHTML='';b.onclick=fn}
function exNext(){X.step++;P.i=X.step;examStep()}
function sectionTag(t){return `<span class="pill" style="margin-bottom:10px">${t}</span>`}
function examStep(){
  exBar();const st=X.steps[X.step],e=X.e,body=$('pBody');body.scrollTop=0;
  if(st.s==='intro'){body.innerHTML=`${sectionTag('Parte 1 · Reading')}<div class="p-q">${esc(e.reading.title)}</div><div class="card" style="line-height:1.6;font-size:16.5px;white-space:pre-line">${esc(e.reading.text)}</div><p class="muted small">Lee el texto con calma. En las siguientes pantallas lo verás arriba de cada pregunta.</p>`;exFoot('Ver preguntas',true,exNext);return}
  if(st.s==='reading'){const q=e.reading.questions[st.i];body.innerHTML=`${sectionTag(`Reading · ${st.i+1} de ${e.reading.questions.length}`)}<details class="card" ${st.i===0?'open':''}><summary style="font-weight:800;cursor:pointer">${esc(e.reading.title)} (toca para ver el texto)</summary><div style="line-height:1.6;margin-top:10px;white-space:pre-line">${esc(e.reading.text)}</div></details><div class="p-q" style="font-size:20px">${esc(q.q)}</div>${examOpts(q.options,'reading',st.i)}`;exFoot('Siguiente',X.ans.reading[st.i]!=null,exNext);return}
  if(st.s==='listenIntro'){body.innerHTML=`${sectionTag('Parte 2 · Listening')}<div class="p-q">${esc(e.listening.title)}</div><div style="display:flex;justify-content:center">${kikoSVG(110,'talk')}</div><p class="muted" style="text-align:center;line-height:1.5">Vas a escuchar una conversación. Como en el examen real, la puedes escuchar <b>2 veces</b>. Primero lee las preguntas en la siguiente pantalla.</p>`;exFoot('Ver preguntas',true,exNext);return}
  if(st.s==='listening'){const qs=e.listening.questions;body.innerHTML=`${sectionTag('Listening')}<div class="big-listen"><button id="lsBtn" onclick="examPlay()" aria-label="Escuchar">${ic('speaker',40)}</button></div><p class="heard" id="lsState">${X.plays<2?`Toca para escuchar (${2-X.plays} ${2-X.plays===1?'vez':'veces'})`:'Ya escuchaste las 2 veces'}</p>${qs.map((q,i)=>`<div class="p-q" style="font-size:18px;margin-top:18px">${i+1}. ${esc(q.q)}</div>${examOpts(q.options,'listening',i)}`).join('')}`;exFoot('Siguiente',X.ans.listening.filter(x=>x!=null).length===qs.length,exNext);return}
  if(st.s==='use'){const q=e.use[st.i];body.innerHTML=`${sectionTag(`Parte 3 · Use of English · ${st.i+1} de ${e.use.length}`)}<div class="p-q" style="font-size:21px">${esc(q.q).replace('___','<span style="display:inline-block;min-width:70px;border-bottom:3px solid var(--blue)">&nbsp;</span>')}</div>${examOpts(q.options,'use',st.i)}`;exFoot('Siguiente',X.ans.use[st.i]!=null,exNext);return}
  if(st.s==='writing'){const w=e.writing;body.innerHTML=`${sectionTag('Parte 4 · Writing')}<div class="tipbox"><b>${esc(w.prompt_es)}</b><span class="muted">${esc(w.prompt_en)}</span></div><textarea id="wrIn" class="typein" style="min-height:200px" placeholder="Escribe aquí en inglés…" oninput="X.writing=this.value;examWC()">${esc(X.writing)}</textarea><p class="small muted" id="wc"></p>`;examWC();return}
  if(st.s==='read'){const t=e.speaking.read_aloud[st.i];body.innerHTML=`${sectionTag(`Parte 5 · Speaking · Lectura ${st.i+1}`)}<div class="p-q">Lee esta frase en voz alta</div><div class="bubble" style="font-size:21px">${esc(t)}</div>${speakBox()}`;exFoot('Siguiente',false,()=>{X.speakRead[st.i]=X.speakRead[st.i]??0;exNext()});wireSpeak(txt=>{const sc=similarity(txt,t);X.speakRead[st.i]=Math.round(sc*100);return `Entendí: “${txt}” · ${X.speakRead[st.i]}%`});return}
  if(st.s==='speakQ'){const q=e.speaking.questions[st.i];body.innerHTML=`${sectionTag(`Speaking · Pregunta ${st.i+1}`)}<div class="p-prompt">${kikoSVG(70,'talk')}<div class="bubble">${spkBtn(q)}${esc(q)}</div></div><p class="muted small">Contesta con 2 o 3 oraciones completas, hablando en inglés.</p>${speakBox()}`;setTimeout(()=>speak(q),300);exFoot('Siguiente',false,exNext);wireSpeak(txt=>{X.speakAns[st.i]=(X.speakAns[st.i]?X.speakAns[st.i]+' ':'')+txt;return `Entendí: “${X.speakAns[st.i]}”`},true);return}
  if(st.s==='grading')return examGrade();
}
function examOpts(opts,sec,i){return `<div class="opts">${opts.map((o,k)=>`<button class="opt ${X.ans[sec][i]===k?'sel':''}" onclick="examPick('${sec}',${i},${k},this)"><span class="k">${'ABCD'[k]}</span>${esc(o)}</button>`).join('')}</div>`}
function examPick(sec,i,k,el){X.ans[sec][i]=k;el.parentElement.querySelectorAll('.opt').forEach(o=>o.classList.remove('sel'));el.classList.add('sel');sfx('toggle');
  if(sec==='listening'){$('pBtn').disabled=X.ans.listening.filter(x=>x!=null).length!==X.e.listening.questions.length}else $('pBtn').disabled=false}
function examPlay(){if(X.plays>=2)return toast('Ya la escuchaste 2 veces, como en el examen real','think');X.plays++;const b=$('lsBtn');b.disabled=true;$('lsState').textContent='Escuchando…';speakLines(X.e.listening.script,X.uid,()=>{b.disabled=false;const s=$('lsState');if(s)s.textContent=X.plays<2?'Puedes escucharla 1 vez más':'Ya escuchaste las 2 veces'})}
function examWC(){const n=(X.writing.trim().match(/\S+/g)||[]).length,w=X.e.writing;const el=$('wc');if(el)el.innerHTML=`${n} palabras · pide ${w.min_words}–${w.max_words}`;exFoot('Entregar',n>=Math.max(5,Math.round(w.min_words*.6)),exNext)}
function speakBox(){return canListen()?`<button class="mic-xl" id="micX" aria-label="Hablar">${ic('mic',44)}</button><div class="heard" id="heard">Toca el micrófono y habla</div>`:`<textarea id="typeIn" class="typein" style="min-height:90px" placeholder="Toca aquí y dicta con el micrófono del teclado"></textarea><button class="btn alt" id="dictOk" style="margin-top:10px">Listo</button>`}
function wireSpeak(onResult,append){
  const done=(t)=>{if(!t.trim())return;const msg=onResult(t);if(!$('heard')){const ta=$('typeIn');ta&&ta.insertAdjacentHTML('afterend','<div class="heard" id="heard"></div>')}if($('heard'))$('heard').innerHTML=esc(msg);$('pBtn').disabled=false;sfx('done')};
  if(!canListen()){$('dictOk').onclick=()=>{const t=$('typeIn').value;$('typeIn').value='';done(t)};return}
  const b=$('micX');b.onclick=()=>{if(b.classList.contains('rec')){stopListen();return}b.classList.add('rec');$('heard').textContent='Te escucho…';
    listen({onText:t=>{$('heard').innerHTML=`<b>${esc(t)}</b>`},onEnd:f=>{b.classList.remove('rec');sfx('stop');if(f)done(f);else $('heard').textContent='No te escuché. Inténtalo otra vez.'},onError:()=>{b.classList.remove('rec');$('heard').textContent='No te escuché bien. Inténtalo otra vez.'}})};
}

/* ---------------- calificación ---------------- */
async function gradeAI(kind,task,answer){
  try{const {data:{session}}=await sb.auth.getSession();const r=await fetch(TUTOR_API,{method:'POST',headers:{Authorization:'Bearer '+session.access_token,'Content-Type':'application/json'},body:JSON.stringify({mode:'grade',kind,level:examLevel(X.uid),task,answer})});if(!r.ok)return null;const j=await r.json();return typeof j.score==='number'?j:null}catch(e){return null}
}
async function examGrade(){
  const e=X.e;$('pBtn').style.display='none';$('pBody').innerHTML=`<div class="result">${kikoSVG(140,'think')}<h2>Calificando tu examen…</h2><p class="muted">Alex está revisando tu Writing y tu Speaking.</p></div>`;
  const pct=(sec,qs)=>Math.round(qs.filter((q,i)=>X.ans[sec][i]===q.answer).length/qs.length*100);
  const R={reading:pct('reading',e.reading.questions),listening:pct('listening',e.listening.questions),use:pct('use',e.use)};
  const w=e.writing;const wTask={prompt_en:w.prompt_en,checklist:w.checklist_es,min:w.min_words,max:w.max_words};
  const spTask={prompt_en:'Answer these speaking questions: '+e.speaking.questions.join(' / '),checklist:['Contesta cada pregunta','Usa oraciones completas'],min:'',max:''};
  const spAnswer=e.speaking.questions.map((q,i)=>`Q: ${q}\nA: ${X.speakAns[i]||'(no answer)'}`).join('\n');
  const [wg,sg]=await Promise.all([gradeAI('writing',wTask,X.writing),gradeAI('speaking',spTask,spAnswer)]);
  X.wg=wg;X.sg=sg;
  if(wg)R.writing=wg.score;else{const n=(X.writing.match(/\S+/g)||[]).length;R.writing=Math.min(100,Math.round(Math.min(1,n/w.min_words)*60+20));R.writingSelf=true}
  const readAvg=X.speakRead.length?X.speakRead.reduce((a,b)=>a+(b||0),0)/e.speaking.read_aloud.length:0;
  const ansScore=sg?sg.score:Math.min(100,(X.speakAns.filter(Boolean).join(' ').match(/\S+/g)||[]).length*4);
  R.speaking=Math.round(readAvg*.4+ansScore*.6);
  R.total=Math.round((R.reading+R.listening+R.use+R.writing+R.speaking)/5);
  const pass=R.total>=70,prev=S.units[X.uid]||{};
  S.units[X.uid]={...prev,exam:!prev.exam||R.total>prev.exam.total?{...R,at:today()}:prev.exam,...(pass?{test:Math.max(R.total,prev.test||0)}:{})};
  const xp=pass?40:15;addXP(xp);const d=dayRec();d.ms+=Date.now()-X.start;S.totals.ms+=Date.now()-X.start;
  const repaired=tryRepair();const achs=checkAchs();save(true);
  if(pass){sfx('celebrate');confetti()}else sfx('ok');
  const bar=(n,v)=>`<div class="li" style="cursor:default"><div class="mid"><div class="t">${n}</div><div class="meter"><i style="width:${v}%;background:${v>=70?'var(--good)':v>=50?'var(--gold)':'var(--bad)'}"></i></div></div><b>${v}%</b></div>`;
  const review=(title,qs,sec)=>`<details class="card"><summary style="font-weight:800;cursor:pointer">Revisar ${title}</summary>${qs.map((q,i)=>{const ok=X.ans[sec][i]===q.answer;return `<div style="margin-top:12px"><div style="font-weight:700">${ok?'✅':'❌'} ${esc(q.q)}</div><div class="small">Correcta: <b>${esc(q.options[q.answer])}</b>${ok?'':` · Tu respuesta: ${esc(q.options[X.ans[sec][i]]??'—')}`}</div><div class="small muted">${esc(q.explain_es)}</div></div>`}).join('')}</details>`;
  const fb=(g,label)=>g?`<details class="card"><summary style="font-weight:800;cursor:pointer">Comentarios de ${label}</summary><p>${esc(g.feedback_es||'')}</p>${(g.criteria||[]).map(c=>`<div class="small">${esc(c.name_es)}: <b>${c.score}/5</b></div>`).join('')}${(g.corrections||[]).map(c=>`<div style="margin-top:8px"><span style="color:var(--bad);text-decoration:line-through">${esc(c.said)}</span> → <b style="color:var(--good)">${esc(c.better)}</b><div class="small muted">${esc(c.why_es)}</div></div>`).join('')}${g.improved?`<div class="tipbox"><b>Versión mejorada</b>${esc(g.improved)}</div>`:''}</details>`:'';
  $('pBar').style.width='100%';
  $('pBody').innerHTML=`<div class="result">${kikoSVG(140,pass?'celebrate':'happy')}<h2>${esc(gradeName(R.total))}</h2><div style="font-size:52px;font-weight:900;color:${pass?'var(--good)':'var(--gold)'}">${R.total}%</div>
  ${pass?`<div class="card" style="border:2px solid var(--gold);text-align:center"><div class="small muted">CERTIFICADO FLUENT</div><b style="font-size:20px">${esc(user?.user_metadata?.name||userName())}</b><div>aprobó el Curso ${X.uid}: ${esc(unitById(X.uid).title_es)}</div><div class="small muted">Nivel ${examLevel(X.uid)} · ${new Date().toLocaleDateString('es-MX',{day:'numeric',month:'long',year:'numeric'})}</div></div>`:`<p class="muted">Necesitas 70% para aprobar. Repasa lo que fallaste y vuelve a intentarlo.</p>`}</div>
  <div class="list" style="margin:14px 0">${bar('Reading',R.reading)}${bar('Listening',R.listening)}${bar('Use of English',R.use)}${bar('Writing'+(R.writingSelf?' (sin IA)':''),R.writing)}${bar('Speaking',R.speaking)}</div>
  ${repaired?`<div class="card"><b style="color:var(--fire)">${ic('fire',18)} ¡Racha recuperada!</b></div>`:''}${achs.map(a=>`<div class="card"><b style="color:var(--gold)">${ic('trophy',18)} Logro: ${esc(a)}</b></div>`).join('')}
  ${review('Reading',e.reading.questions,'reading')}${review('Listening',e.listening.questions,'listening')}${review('Use of English',e.use,'use')}
  ${fb(wg,'Writing')}<details class="card"><summary style="font-weight:800;cursor:pointer">Respuesta modelo de Writing</summary><p>${esc(w.model_answer)}</p></details>${fb(sg,'Speaking')}`;
  exFoot('Terminar',true,()=>{$('pBtn').onclick=footAction;endPlayer()});
}
