// Fluent — practicar (repaso, juegos, conversaciones, Alex IA), diccionario, gramática, progreso y ajustes.
const REF=window.REFERENCE||{grammar:[],compare:[],phrasal:[],irregular:[],expressions:[],false_friends:[]};
function learnedWords(){const ws=Object.values(S.srs).filter(c=>c.kind==='w');return ws.length>=8?ws:ALL_WORDS.slice(0,24).map(w=>({...w}))}

/* ---------------- practicar ---------------- */
function practiceView(){
  const due=srsDue().length,weak=srsWeak().length;
  return `<h1 class="title">Practicar</h1><div class="grid2">
  <button class="tile-card wide hero" onclick="startReview()"><div class="ti">${ic('brain',24)}</div><div><b>Repaso diario</b><br><span>${due?`${due} ${due===1?'cosa lista':'cosas listas'} para repasar`:'Al día. Repasa lo aprendido'}</span></div></button>
  <button class="tile-card wide" onclick="openTutor()"><div class="ti">${kikoSVG(40,'talk')}</div><div><b>Platica con Alex</b><br><span>Conversa en inglés, te corrige y al final te dice cómo mejorar</span></div></button>
  <button class="tile-card" onclick="gamePairs()"><div class="ti">${ic('pairs',22)}</div><b>Parejas contra reloj</b><span>Une palabras en 60 segundos</span></button>
  <button class="tile-card" onclick="gameListen()"><div class="ti">${ic('ear',22)}</div><b>Oído rápido</b><span>Escucha y elige</span></button>
  <button class="tile-card" onclick="gameTF()"><div class="ti">${ic('tf',22)}</div><b>¿Sí o no?</b><span>¿La traducción es correcta?</span></button>
  <button class="tile-card" onclick="gameSpell()"><div class="ti">${ic('spell',22)}</div><b>Deletrea</b><span>Escucha y escríbelo</span></button>
  <button class="tile-card" onclick="practiceSpeak()"><div class="ti">${ic('mic',22)}</div><b>Pronunciación</b><span>Di frases en voz alta</span></button>
  <button class="tile-card" onclick="openDialogs()"><div class="ti">${ic('chat',22)}</div><b>Conversaciones</b><span>Actúa diálogos reales</span></button>
  <button class="tile-card" onclick="practiceWeak()"><div class="ti">${ic('target',22)}</div><b>Palabras difíciles</b><span>${weak?weak+' por reforzar':'Las que más fallas'}</span></button>
  <button class="tile-card" onclick="openGrammar()"><div class="ti">${ic('book',22)}</div><b>Gramática y comparaciones</b><span>${REF.grammar.length} temas, ${REF.compare.length} comparaciones</span></button>
  </div>`;
}
function startReview(){const due=srsDue();let cards=due.length?pick(due,15):pick(Object.values(S.srs),12);if(!cards.length)return toast('Primero termina una lección','think');runSession({mode:'review',queue:cards.map(exReviewFromCard),title:'Repaso'})}
function practiceWeak(){const w=srsWeak();if(!w.length)return toast('¡No tienes palabras difíciles! Sigue así','celebrate');runSession({mode:'review',queue:pick(w,12).map(exReviewFromCard),title:'Difíciles'})}
function practiceSpeak(){const pool=Object.values(S.srs).filter(c=>c.kind==='s');const ss=pool.length>=5?pool:ALL_SENTS.slice(0,10);runSession({mode:'review',queue:pick(ss,8).map(s=>({type:'speak',q:'Dilo en voz alta',prompt:s.en,es:s.es,answer:s.en,item:{...s,kind:'s'}})),title:'Pronunciación'})}

/* ---------------- juegos ---------------- */
let G=null;
function gameShell(title,inner){$('player').classList.add('open');document.body.style.overflow='hidden';P={mode:'game',i:0,total:1,answered:0,correct:0,wrong:0,combo:0,maxCombo:0,start:Date.now(),queue:[],retried:new Set()};$('pBtn').style.display='none';$('pFoot').className='p-foot';$('pFb').innerHTML='';$('pBody').innerHTML=`<div class="p-q">${title}</div>${inner}`}
function gameTimer(sec,onTick,onEnd){let t=sec;G.timer=setInterval(()=>{t--;onTick(t);if(t<=0){clearInterval(G.timer);onEnd()}},1000)}
function gameEnd(score,label){clearInterval(G?.timer);S.totals.games++;P.gameXP=Math.min(40,Math.round(score*1.5));P.answered=Math.max(P.answered,1);finishSession();$('pBody').querySelector('h2').textContent=label}
function gamePairs(){
  const words=learnedWords();G={score:0};let left=0;
  const round=()=>{const ps=pick(words,5).map(w=>[enMain(w.en),w.es]);cur={type:'pairs',pairs:ps,_left:5};left=5;const L=shuffle(ps.map(p=>p[0])),R=shuffle(ps.map(p=>p[1]));
    $('gp').innerHTML=L.map((x,i)=>`<button class="pair" data-side="L" data-v="${esc(x)}" onclick="tapPair(this)">${esc(x)}</button><button class="pair" data-side="R" data-v="${esc(R[i])}" onclick="tapPair(this)">${esc(R[i])}</button>`).join('')};
  gameShell(`Une las parejas <span id="gt" style="float:right;color:var(--fire)">60</span>`,`<div class="pill" style="margin-bottom:12px">Puntos: <b id="gs">0</b></div><div class="pairs" id="gp"></div>`);
  window.mark=(ok)=>{if(ok){G.score+=5;P.correct+=5;$('gs').textContent=G.score;round()}};round();
  gameTimer(60,t=>{const e=$('gt');if(e)e.textContent=t},()=>{window.mark=markOrig;gameEnd(G.score,`¡${G.score} parejas!`)});
}
const markOrig=mark;
function gameListen(){
  const words=learnedWords();G={score:0,n:0};
  const next=()=>{if(G.n>=12)return gameEnd(G.score,`${G.score} de 12`);G.n++;const w=pick(words,1)[0];const opts=shuffle([enMain(w.en),...distractors(w.en,ALL_WORDS,3,'en')]);G.ans=enMain(w.en);
    $('gb').innerHTML=`<div class="big-listen"><button onclick="speak('${esc(G.ans).replace(/'/g,"\\'")}')">${ic('speaker',40)}</button></div><div class="opts two">${opts.map(o=>`<button class="opt" onclick="gl(this,'${esc(o).replace(/'/g,"\\'")}')">${esc(o)}</button>`).join('')}</div>`;setTimeout(()=>speak(G.ans),200)};
  window.gl=(el,v)=>{const ok=v===G.ans;el.classList.add(ok?'right':'wrong');if(ok){G.score++;P.correct++;sfx('done')}else sfx('error');setTimeout(next,ok?450:900)};
  gameShell(`Oído rápido`,`<div class="pill" style="margin-bottom:12px">12 palabras</div><div id="gb"></div>`);next();
}
function gameTF(){
  const words=learnedWords();G={score:0};
  const next=()=>{const w=pick(words,1)[0];const truth=Math.random()<.5;const shown=truth?w.es:distractors(w.en,ALL_WORDS,1,'es')[0];G.truth=truth;
    $('gb').innerHTML=`<div class="wordcard"><div class="en">${esc(enMain(w.en))}</div><div class="es" style="font-size:24px;color:var(--text)">= ${esc(shown)}</div></div><div class="grid2"><button class="btn good" onclick="gt(true)">${ic('check',22)} Sí</button><button class="btn bad" style="margin:0" onclick="gt(false)">${ic('close',22)} No</button></div>`};
  window.gt=v=>{if(v===G.truth){G.score++;P.correct++;sfx('ok')}else{sfx('error');buzz(40)}const e=$('gs');if(e)e.textContent=G.score;next()};
  gameShell(`¿Sí o no? <span id="gt2" style="float:right;color:var(--fire)">45</span>`,`<div class="pill" style="margin-bottom:12px">Puntos: <b id="gs">0</b></div><div id="gb"></div>`);next();
  gameTimer(45,t=>{const e=$('gt2');if(e)e.textContent=t},()=>gameEnd(G.score,`¡${G.score} aciertos!`));
}
function gameSpell(){
  const words=learnedWords().filter(w=>!enMain(w.en).includes(' '));G={score:0,n:0};
  const next=()=>{if(G.n>=8)return gameEnd(G.score*2,`${G.score} de 8`);G.n++;const w=pick(words,1)[0];G.ans=enMain(w.en);
    $('gb').innerHTML=`<div class="big-listen"><button onclick="speak(G.ans)">${ic('speaker',40)}</button><button class="slow" onclick="speak(G.ans,{slow:true})">${ic('turtle',30)}</button></div><p class="muted" style="text-align:center">${esc(w.es)}</p><input id="sp" class="typein" style="min-height:0;text-align:center;font-size:24px" autocapitalize="off" autocomplete="off" spellcheck="false" onkeydown="if(event.key==='Enter')gs2()"><button class="btn" style="margin-top:14px" onclick="gs2()">Comprobar</button>`;setTimeout(()=>{speak(G.ans);$('sp')?.focus()},200)};
  window.gs2=()=>{const v=$('sp').value;const ok=norm(v)===norm(G.ans);if(ok){G.score++;P.correct++;sfx('done');next()}else{sfx('error');$('sp').value='';$('sp').placeholder=G.ans;setTimeout(next,1300)}};
  gameShell('Deletrea',`<div id="gb"></div>`);next();
}

/* ---------------- conversaciones (diálogos de cada curso) ---------------- */
function openDialogs(){const us=UNITS.filter(u=>unitUnlocked(u.id));openSheet(head('Conversaciones','Tú eres la persona B. Alex dice las líneas de A.')+`<div class="list">${us.map(u=>`<div class="li" onclick="closeSheet();openDialogue(${u.id})">${ic('chat',20)}<div class="mid"><div class="t">${esc(u.dialogue.title_es)}</div><div class="s">Curso ${u.id} · ${esc(u.dialogue.setting_es)}</div></div>${S.units[u.id]?.dlg?`<span style="color:var(--gold)">${ic('star',18)}</span>`:''}</div>`).join('')}</div>`)}
function openDialogue(uid){
  const u=unitById(uid),d=u.dialogue;
  openSheet(head(esc(d.title_es),esc(d.setting_es))+`<div class="chat">${d.lines.map(l=>`<div class="msg ${l.who==='B'?'me':'kiko'}">${esc(l.en)}<span class="tr" style="${l.who==='B'?'color:rgba(255,255,255,.75)':''}">${esc(l.es)}</span></div>`).join('')}</div>
  <button class="btn alt" onclick="playDialogue(${uid})">${ic('speaker',18)} Escuchar completa</button><button class="btn" onclick="closeSheet();actDialogue(${uid})">${ic('mic',18)} Actuarla (tú eres B)</button>`);
}
function playDialogue(uid){const ls_=unitById(uid).dialogue.lines;let i=0;const nx=()=>{if(i<ls_.length)speak(ls_[i++].en,{onend:()=>setTimeout(nx,350)})};nx()}
function actDialogue(uid){const d=unitById(uid).dialogue;const q=[];d.lines.forEach((l,i)=>{if(l.who==='B'){const prev=d.lines[i-1];q.push({type:'speak',q:prev?`Alex: “${prev.en}”`:'Empieza la plática',prompt:l.en,es:l.es,answer:l.en,item:null,audioFirst:prev?.en})}});
  runSession({mode:'review',queue:q,title:d.title_es,onFinish:acc=>{S.units[uid]={...(S.units[uid]||{}),dlg:Math.max(acc,S.units[uid]?.dlg||0)}}})}

/* ---------------- Alex IA ---------------- */
const SCENARIOS=[['','Plática libre'],['ordering food at a restaurant in New York','Restaurante'],['checking in at a hotel','Hotel'],['a job interview for an office job','Entrevista'],['asking for directions in a city','Direcciones'],['shopping for clothes','Compras'],['at the doctor','Doctor'],['making plans with a friend for the weekend','Planes con amigos'],['at the airport check-in','Aeropuerto'],['talking about your family and hobbies','Familia y hobbies']];
let T={msgs:[],scen:'',busy:false};
function tutorLevel(){const nx=nextLesson();const u=nx?(nx.test||nx.unit):16;return u<=6?'A1':u<=11?'A2':u<=15?'B1':'B2'}
function openTutor(){T={msgs:[],scen:T.scen||'',busy:false};renderTutor();setTimeout(()=>{if(!T.msgs.length)kikoSays(T.scen?"Let's start! I'll begin.":`Hi${userName()?' '+userName():''}! I'm Alex. How are you today?`,'¡Hola! Soy Alex. ¿Cómo estás hoy?')},300)}
function renderTutor(){
  openSheet(head('Platica con Alex',`Nivel ${tutorLevel()} · Escribe o habla en inglés. Si no sabes cómo decir algo, escríbelo en español.`)+
  `<div class="scen">${SCENARIOS.map(([k,n])=>`<button class="${T.scen===k?'on':''}" onclick="T.scen='${k}';openTutor()">${n}</button>`).join('')}</div>
  <div class="chat" id="chat">${T.msgs.map(msgHTML).join('')}</div>
  <div class="composer"><button class="mic" id="tMic" onclick="tutorMic()" aria-label="Hablar">${ic('mic',22)}</button><textarea id="tIn" rows="1" placeholder="Write in English…" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();tutorSend()}"></textarea><button onclick="tutorSend()" aria-label="Enviar">${ic('send',20)}</button></div>
  ${T.msgs.filter(m=>m.role==='user').length>=2?`<button class="btn alt" style="margin-top:10px" onclick="tutorSummary()">${ic('flag',18)} Terminar y ver cómo me fue</button>`:''}`);
  const c=$('chat');c.lastElementChild?.scrollIntoView({block:'end'});
}
function msgHTML(m,i){
  if(m.role==='user')return `<div class="msg me">${esc(m.content)}</div>`;
  if(m.typing)return `<div class="msg kiko"><span class="muted">Alex está escribiendo…</span></div>`;
  return `<div class="msg kiko">${esc(m.content)}${m.reply_es?`<span class="tr" id="tr${i}" style="display:none">${esc(m.reply_es)}</span>`:''}${m.correction?`<span class="corr"><b>Mejor di:</b> ${esc(m.correction)}${m.explain_es?`<br><span class="muted">${esc(m.explain_es)}</span>`:''}</span>`:m.praise?`<span class="ok">${ic('check',14)} ${esc(m.praise)}</span>`:''}<span class="acts"><button onclick="speak(T.msgs[${i}].content)">${ic('speaker',15)} Escuchar</button>${m.reply_es?`<button onclick="const e=$('tr${i}');e.style.display=e.style.display?'':'none'">Traducir</button>`:''}</span></div>`;
}
function kikoSays(en,es){T.msgs.push({role:'assistant',content:en,reply_es:es});renderTutor();speak(en)}
async function tutorSend(){
  const inp=$('tIn');const txt=(inp?.value||'').trim();if(!txt||T.busy)return;
  T.msgs.push({role:'user',content:txt});T.busy=true;T.msgs.push({role:'assistant',typing:true});renderTutor();sfx('ok');
  try{
    const {data:{session}}=await sb.auth.getSession();
    const r=await fetch(TUTOR_API,{method:'POST',headers:{Authorization:'Bearer '+session.access_token,'Content-Type':'application/json'},body:JSON.stringify({messages:T.msgs.filter(m=>!m.typing).map(m=>({role:m.role,content:m.content})),scenario:T.scen,level:tutorLevel()})});
    const j=await r.json().catch(()=>({}));T.msgs.pop();
    if(!r.ok){T.msgs.push({role:'assistant',content:j.error||'Alex no está disponible ahorita.',reply_es:null});T.busy=false;renderTutor();sfx('error');return}
    T.msgs.push({role:'assistant',content:j.reply||'…',reply_es:j.reply_es,correction:j.correction,explain_es:j.explain_es,praise:j.praise});
    S.totals.tutor++;addXP(2);save();T.busy=false;renderTutor();speak(j.reply||'');sfx(j.correction?'toggle':'done');
  }catch(e){T.msgs.pop();T.busy=false;T.msgs.push({role:'assistant',content:'Sin conexión. Intenta otra vez.'});renderTutor()}
}
function tutorMic(){
  const b=$('tMic');if(!canListen())return toast('Usa el micrófono de tu teclado para dictar','think');
  if(b.classList.contains('rec')){stopListen();return}
  b.classList.add('rec');listen({onText:t=>{$('tIn').value=t},onEnd:f=>{b?.classList.remove('rec');sfx('stop');if(f.trim())tutorSend()},onError:()=>{b?.classList.remove('rec')}});
}
async function tutorSummary(){
  openSheet(head('Tu plática','Alex está revisando…')+`<div style="text-align:center">${kikoSVG(120,'think')}</div>`);
  try{const {data:{session}}=await sb.auth.getSession();
    const r=await fetch(TUTOR_API,{method:'POST',headers:{Authorization:'Bearer '+session.access_token,'Content-Type':'application/json'},body:JSON.stringify({mode:'summary',messages:T.msgs.filter(m=>!m.typing).map(m=>({role:m.role,content:m.content})),level:tutorLevel()})});
    const j=await r.json();if(!r.ok)throw new Error(j.error);
    addXP(5);save();sfx('celebrate');
    openSheet(head('Así te fue',`Nivel estimado: ${esc(j.level_guess||tutorLevel())}`)+`<div style="text-align:center">${kikoSVG(110,(j.score||0)>=70?'celebrate':'happy')}<div style="font-size:44px;font-weight:900;color:var(--gold)">${j.score??'—'}<span style="font-size:20px">/100</span></div><p>${esc(j.summary_es||'')}</p></div>
    ${(j.strengths_es||[]).length?`<div class="sec"><h2>Lo que hiciste bien</h2></div><div class="list">${j.strengths_es.map(s=>`<div class="li"><span style="color:var(--good)">${ic('check',18)}</span><div class="mid">${esc(s)}</div></div>`).join('')}</div>`:''}
    ${(j.mistakes||[]).length?`<div class="sec"><h2>Errores para corregir</h2></div>${j.mistakes.map(m=>`<div class="card"><div style="color:var(--bad);text-decoration:line-through">${esc(m.said)}</div><div style="color:var(--good);font-weight:800;margin:4px 0">${esc(m.better)} <button class="spk" style="border:0;background:none;color:var(--blue);cursor:pointer" onclick="speak('${esc(m.better).replace(/'/g,"\\'")}')">${ic('speaker',16)}</button></div><div class="muted small">${esc(m.why_es)}</div></div>`).join('')}`:'<div class="card"><b style="color:var(--good)">¡Sin errores importantes!</b></div>'}
    ${(j.tips_es||[]).length?`<div class="sec"><h2>Cómo mejorar</h2></div><div class="list">${j.tips_es.map(s=>`<div class="li">${ic('target',18)}<div class="mid">${esc(s)}</div></div>`).join('')}</div>`:''}
    ${(j.useful_phrases||[]).length?`<div class="sec"><h2>Frases útiles</h2></div><div class="list">${j.useful_phrases.map(p=>`<div class="li" onclick="speak('${esc(p.en).replace(/'/g,"\\'")}')"><span style="color:var(--blue)">${ic('speaker',18)}</span><div class="mid"><div class="t">${esc(p.en)}</div><div class="s">${esc(p.es)}</div></div></div>`).join('')}</div>`:''}
    <div style="margin-top:16px"><button class="btn" onclick="openTutor()">Platicar otra vez</button></div>`);
    (j.mistakes||[]).forEach(m=>srsAdd({en:m.better,es:m.why_es||'Corrección de Alex',lesson:'kiko'},'s'));save();
  }catch(e){openSheet(head('Tu plática','')+`<p>No pude revisar la plática: ${esc(e.message||'')}</p><button class="btn" onclick="renderTutor()">Regresar</button>`)}
}

/* ---------------- gramática y referencia ---------------- */
function openGrammar(tab='grammar'){
  const tabs=[['grammar','Gramática'],['compare','Comparaciones'],['phrasal','Phrasal verbs'],['irregular','Verbos irregulares'],['expressions','Expresiones'],['false_friends','Falsos amigos']];
  let body='';
  if(tab==='grammar')body=`<div class="list">${REF.grammar.map((g,i)=>`<div class="li" onclick="openTopic(${i})"><span class="pill">${g.level}</span><div class="mid"><div class="t">${esc(g.title)}</div><div class="s">${esc(g.summary)}</div></div></div>`).join('')}</div>`;
  if(tab==='compare')body=`<div class="list">${REF.compare.map((c,i)=>`<div class="li" onclick="openCompare(${i})"><div class="mid"><div class="t">${esc(c.title)}</div><div class="s">${esc(c.trick)}</div></div></div>`).join('')}</div>`;
  if(tab==='phrasal')body=`<div class="list">${REF.phrasal.map(p=>`<div class="li" onclick="speak('${esc(p.en).replace(/'/g,"\\'")}')"><div class="mid"><div class="t">${esc(p.en)} <span class="muted">· ${esc(p.es)}</span></div><div class="s">${esc(p.ex_en)} — ${esc(p.ex_es)}</div></div></div>`).join('')}</div>`;
  if(tab==='irregular')body=`<div class="list">${REF.irregular.map(v=>`<div class="li" onclick="speak('${esc(v.slice(0,3).join(', ')).replace(/'/g,"\\'")}')"><div class="mid"><div class="t">${esc(v[0])} · ${esc(v[1])} · ${esc(v[2])}</div><div class="s">${esc(v[3])}</div></div></div>`).join('')}</div>`;
  if(tab==='expressions')body=`<div class="list">${REF.expressions.map(x=>`<div class="li" onclick="speak('${esc(x.en).replace(/'/g,"\\'")}')"><div class="mid"><div class="t">${esc(x.en)}</div><div class="s">${esc(x.es)} · ${esc(x.when)}</div></div></div>`).join('')}</div>`;
  if(tab==='false_friends')body=`<div class="list">${REF.false_friends.map(x=>`<div class="li"><div class="mid"><div class="t">${esc(x.en)} ≠ ${esc(x.looks_like)}</div><div class="s">Significa: ${esc(x.means)}. ${esc(x.ex_en)}</div></div></div>`).join('')}</div>`;
  openSheet(head('Gramática y más','Toca cualquier frase para escucharla')+`<div class="scen">${tabs.map(([k,n])=>`<button class="${tab===k?'on':''}" onclick="openGrammar('${k}')">${n}</button>`).join('')}</div>`+body);
}
function exList(ex){return `<div class="list">${ex.map(e=>`<div class="li" onclick="speak('${esc(e.en).replace(/'/g,"\\'")}')"><span style="color:var(--blue)">${ic('speaker',16)}</span><div class="mid"><div class="t">${esc(e.en)}</div><div class="s">${esc(e.es)}</div></div></div>`).join('')}</div>`}
function openTopic(i){const g=REF.grammar[i];openSheet(head(esc(g.title),`${g.level} · ${esc(g.summary)}`)+g.body.map(p=>`<p style="line-height:1.55">${esc(p)}</p>`).join('')+(g.table?`<div style="overflow-x:auto;margin:10px 0"><table style="width:100%;border-collapse:collapse;font-size:14px">${g.table.map((r,ri)=>`<tr>${r.map(c=>`<${ri?'td':'th'} style="border:1px solid var(--line);padding:8px;text-align:left">${esc(c)}</${ri?'td':'th'}>`).join('')}</tr>`).join('')}</table></div>`:'')+`<div class="sec"><h2>Ejemplos</h2></div>`+exList(g.examples)+`<button class="btn alt" style="margin-top:14px" onclick="openGrammar('grammar')">Ver todos los temas</button>`)}
function openCompare(i){const c=REF.compare[i];openSheet(head(esc(c.title),'')+`<p style="line-height:1.55">${esc(c.body)}</p><div class="tipbox"><b>Truco</b>${esc(c.trick)}</div><div class="sec"><h2>${esc(c.a)}</h2></div>${exList(c.a_ex)}<div class="sec"><h2>${esc(c.b)}</h2></div>${exList(c.b_ex)}<button class="btn alt" style="margin-top:14px" onclick="openGrammar('compare')">Ver todas</button>`)}

/* ---------------- diccionario ---------------- */
let dictQ='';
function dictView(){
  return `<h1 class="title">Diccionario</h1><div class="search">${ic('search',20)}<input id="dq" value="${esc(dictQ)}" placeholder="Busca en inglés o español…" autocapitalize="off" autocomplete="off" oninput="dictLocal(this.value)" onkeydown="if(event.key==='Enter')dictOnline()"><button class="iconbtn" style="background:var(--chalk);color:var(--onchalk);border:0" onclick="dictOnline()" aria-label="Buscar">${ic('search',20)}</button></div>
  <div id="dres">${dictHome()}</div>`;
}
function dictHome(){const saved=S.saved||[];return `${saved.length?`<div class="sec"><h2>Mis palabras guardadas</h2></div><div class="list">${saved.slice(-20).reverse().map(w=>`<div class="dli" onclick="dictQ='${esc(w.en).replace(/'/g,"\\'")}';$('dq').value=dictQ;dictOnline()"><b>${esc(w.en)}</b><span>${esc(w.es)}</span></div>`).join('')}</div>`:''}<p class="muted small" style="margin:14px 4px">Busca cualquier palabra: primero te muestro las del curso y, con la lupa, busco en el diccionario completo de inglés (significado, pronunciación y traducción).</p>`}
function dictLocal(q){dictQ=q;const t=q.trim().toLowerCase();const box=$('dres');if(!t){box.innerHTML=dictHome();return}
  const strip=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();const tt=strip(t);
  const hits=[];const seen=new Set();
  for(const w of ALL_WORDS){const a=strip(w.en),b=strip(w.es);if((a.startsWith(tt)||b.startsWith(tt)||a.includes(' '+tt)||b.includes(tt))&&!seen.has(w.en)){seen.add(w.en);hits.push({en:w.en,es:w.es,src:`Curso ${w.unit}`})}if(hits.length>30)break}
  for(const p of REF.phrasal){if(strip(p.en).includes(tt)||strip(p.es).includes(tt))hits.push({en:p.en,es:p.es,src:'Phrasal verb'})}
  for(const v of REF.irregular){if(v.some(x=>strip(x).startsWith(tt)))hits.push({en:v.slice(0,3).join(' · '),es:v[3],src:'Verbo irregular'})}
  box.innerHTML=(hits.length?`<div class="list">${hits.slice(0,40).map(h=>`<div class="dli" onclick="dictQ='${esc(enMain(h.en.split(' · ')[0])).replace(/'/g,"\\'")}';$('dq').value=dictQ;dictOnline()"><div style="flex:1"><b>${esc(h.en)}</b><br><span>${esc(h.es)}</span></div><span class="pill">${esc(h.src)}</span></div>`).join('')}</div>`:'')+`<button class="btn alt" style="margin-top:12px" onclick="dictOnline()">${ic('search',18)} Buscar “${esc(q.trim())}” en el diccionario completo</button>`;
}
async function dictOnline(){
  const q=($('dq')?.value||dictQ).trim();if(!q)return;dictQ=q;const box=$('dres');box.innerHTML=`<div style="text-align:center;padding:20px">${kikoSVG(90,'think')}<p class="muted">Buscando…</p></div>`;
  const isEs=/[áéíóúñ¿¡]/i.test(q)||!/^[a-z' -]+$/i.test(q)&&false;
  try{
    // Traducción (gratis): MyMemory. Detectamos dirección probando inglés primero.
    let en=q,es='';
    const tr=async(text,pair)=>{const r=await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${pair}`);const j=await r.json();return (j.responseData?.translatedText||'').trim()};
    let def=null;
    const lookup=async w=>{const r=await fetch('https://api.dictionaryapi.dev/api/v2/entries/en/'+encodeURIComponent(w.toLowerCase()));if(!r.ok)return null;const j=await r.json();return Array.isArray(j)?j:null};
    if(!isEs)def=await lookup(q);
    if(!def){const toEn=await tr(q,'es|en');if(toEn&&toEn.toLowerCase()!==q.toLowerCase()){en=toEn;es=q;def=toEn.split(' ').length<=3?await lookup(toEn):null}}
    if(!es)es=await tr(en,'en|es');
    const ph=def?.[0]?.phonetic||def?.[0]?.phonetics?.find(p=>p.text)?.text||'';
    const audio=def?.[0]?.phonetics?.find(p=>p.audio)?.audio||'';
    const means=(def||[]).flatMap(d=>d.meanings||[]).slice(0,4);
    const POS={noun:'sustantivo',verb:'verbo',adjective:'adjetivo',adverb:'adverbio',pronoun:'pronombre',preposition:'preposición',conjunction:'conjunción',interjection:'interjección'};
    window.__dictAudio=audio;
    box.innerHTML=`<div class="dres"><div class="w">${esc(en)} <button class="iconbtn" onclick="${audio?`new Audio(window.__dictAudio).play().catch(()=>speak('${esc(en).replace(/'/g,"\\'")}'))`:`speak('${esc(en).replace(/'/g,"\\'")}')`}" aria-label="Escuchar">${ic('speaker',18)}</button><button class="iconbtn" onclick="speak('${esc(en).replace(/'/g,"\\'")}',{slow:true})" aria-label="Lento">${ic('turtle',18)}</button></div>${ph?`<div class="ph">${esc(ph)}</div>`:''}<div class="tr">${esc(es||'—')}</div>
    ${means.map(m=>`<div class="def"><em>${POS[m.partOfSpeech]||esc(m.partOfSpeech)}</em>${m.definitions.slice(0,2).map(d=>`${esc(d.definition)}${d.example?`<i>“${esc(d.example)}”</i>`:''}`).join('<br>')}${m.synonyms?.length?`<div class="small muted">Sinónimos: ${m.synonyms.slice(0,5).map(esc).join(', ')}</div>`:''}</div>`).join('')}
    <button class="btn" style="margin-top:10px" onclick="saveWord('${esc(en).replace(/'/g,"\\'")}','${esc(es).replace(/'/g,"\\'")}')">${ic('plus',18)} Guardar para repasar</button></div>`;
    sfx('ok');
  }catch(e){box.innerHTML=`<div class="card">No pude buscar ahorita (revisa tu internet). <button class="btn alt" style="margin-top:10px" onclick="speak('${esc(q).replace(/'/g,"\\'")}')">${ic('speaker',18)} Escuchar “${esc(q)}”</button></div>`}
}
function saveWord(en,es){S.saved=S.saved||[];if(!S.saved.some(w=>w.en===en))S.saved.push({en,es,at:today()});srsAdd({en,es,lesson:'dict'},'w');save();sfx('done');toast('Guardada. Te la pondré en el repaso')}

/* ---------------- progreso ---------------- */
function statsView(){
  const lv=level();const t=S.totals;const acc=t.total?Math.round(t.correct/t.total*100):0;const mins=Math.round(t.ms/60000);
  const days=[...Array(14)].map((_,i)=>addDays(today(),i-13));const mx=Math.max(S.settings.goal,...days.map(k=>S.days[k]?.xp||0));
  const weeks=16;const start=addDays(today(),-(weeks*7-1)-((new Date().getDay()+6)%7)+0);
  const heat=[...Array(weeks*7)].map((_,i)=>{const k=addDays(start,i);if(k>today())return '<i style="visibility:hidden"></i>';const x=S.days[k]?.xp||0;return `<i class="${x>=S.settings.goal?'l3':x>=S.settings.goal/2?'l2':x>0?'l1':''} ${k===today()?'today':''}" title="${k}: ${x} XP"></i>`}).join('');
  const doneL=Object.keys(S.done).length;
  return `<h1 class="title">Progreso</h1>
  <div class="card row">${kikoSVG(70,'happy')}<div style="flex:1"><b style="font-size:20px">Nivel ${lv.lv}</b><div class="muted small">${lv.into} / ${lv.need} XP para el nivel ${lv.lv+1}</div><div class="meter"><i style="width:${Math.round(lv.into/lv.need*100)}%"></i></div></div></div>
  <div class="kpis">
    <div class="kpi"><b style="color:var(--fire)">${streak()}</b><span>Días de racha (mejor: ${bestStreak()})</span></div>
    <div class="kpi"><b style="color:var(--gold)">${t.xp}</b><span>XP en total</span></div>
    <div class="kpi"><b>${wordsLearned()}</b><span>Palabras aprendidas (${wordsMastered()} dominadas)</span></div>
    <div class="kpi"><b>${doneL}/${LESSONS.length}</b><span>Lecciones</span></div>
    <div class="kpi"><b style="color:var(--good)">${acc}%</b><span>Aciertos</span></div>
    <div class="kpi"><b>${mins<60?mins+' min':(mins/60).toFixed(1)+' h'}</b><span>Tiempo estudiando</span></div>
  </div>
  <div class="sec"><h2>XP de las últimas 2 semanas</h2></div><div class="card"><div class="bars">${days.map(k=>{const x=S.days[k]?.xp||0;return `<div><i style="height:${Math.max(2,x/mx*100)}%;${x>=S.settings.goal?'':'opacity:.55'}"></i><span>${'DLMMJVS'[new Date(k+'T12:00').getDay()]}</span></div>`}).join('')}</div></div>
  <div class="sec"><h2>Constancia</h2><span class="muted small">16 semanas</span></div><div class="card"><div class="heat">${heat}</div></div>
  <div class="sec"><h2>Avance por curso</h2></div><div class="list">${UNITS.map(u=>{const n=u.lessons.filter(l=>S.done[l.id]).length;return `<div class="li" style="cursor:default"><span class="pill">${u.id}</span><div class="mid"><div class="t">${esc(u.title_es)}</div><div class="meter"><i style="width:${Math.round(n/u.lessons.length*100)}%"></i></div></div><span class="small muted">${n}/${u.lessons.length}</span></div>`}).join('')}</div>
  <div class="sec"><h2>Logros</h2><span class="muted small">${Object.keys(S.ach).length}/${ACHS.length}</span></div><div class="achs">${ACHS.map(([id,name,desc,icn])=>`<div class="ach ${S.ach[id]?'got':''}"><div class="ai">${ic(icn,22)}</div><b>${esc(name)}</b><span>${esc(desc)}</span></div>`).join('')}</div>
  ${srsWeak().length?`<div class="sec"><h2>Palabras que más fallas</h2></div><div class="list">${srsWeak().slice(0,8).map(c=>`<div class="li" onclick="speak('${esc(enMain(c.en)).replace(/'/g,"\\'")}')"><div class="mid"><div class="t">${esc(c.en)}</div><div class="s">${esc(c.es)}</div></div><span class="small muted">${Math.round(c.ok/c.seen*100)}%</span></div>`).join('')}</div>`:''}`;
}

/* ---------------- ajustes ---------------- */
function settingsView(){
  const st=pushState();const txt={on:'Activados',off:'Toca para activarlos',install:'Primero instala Fluent en tu pantalla de inicio',denied:'Bloqueados en los ajustes del teléfono',unsupported:'Este navegador no los permite'}[st];
  return `<h1 class="title">Ajustes</h1><div class="list">
    <div class="li" onclick="openName()">${ic('user',20)}<div class="mid"><div class="t">${esc(user?.user_metadata?.name||'Tu nombre')}</div><div class="s">${esc(user?.email||'')}</div></div><span class="muted small">Cambiar</span></div>
    <div class="li" onclick="openOnboarding(2)">${ic('target',20)}<div class="mid"><div class="t">Meta diaria</div><div class="s">${S.settings.goal} XP al día</div></div></div>
    <div class="li" style="cursor:default">${ic('bell',20)}<div class="mid"><div class="t">Recordatorio diario</div><div class="s">${txt}</div></div><input type="time" value="${S.settings.remind}" style="border:1px solid var(--line);background:var(--s2);border-radius:10px;padding:6px" onchange="S.settings.remind=this.value;save();toast('Te recuerdo a las '+this.value)"></div>
    ${st==='off'?`<div style="padding:0 0 14px"><button class="btn" onclick="enablePush(this).then(ok=>{if(ok){toast('Recordatorios activados');render()}})">Activar recordatorios</button></div>`:st==='on'?`<div class="li" onclick="testPush()">${ic('bell',20)}<div class="mid"><div class="t">Probar notificación</div></div></div>`:''}
    <label class="li">${ic('sound',20)}<div class="mid"><div class="t">Sonidos</div></div><input type="checkbox" class="tgl" ${soundOn()?'checked':''} onchange="setSound(this.checked)"></label>
    <div class="li" style="cursor:default">${ic('speaker',20)}<div class="mid"><div class="t">Velocidad de la voz</div><div class="s">${S.settings.rate<.85?'Lenta':S.settings.rate>1?'Rápida':'Normal'}</div></div><input type="range" min=".6" max="1.2" step=".05" value="${S.settings.rate}" onchange="S.settings.rate=+this.value;save();speak('This is how I sound.');render()"></div>
    <div class="li" style="cursor:default">${ic('chat',20)}<div class="mid"><div class="t">Voz</div></div><select style="max-width:170px;border:1px solid var(--line);background:var(--s2);border-radius:10px;padding:6px" onchange="S.settings.voice=this.value;save();speak('Hello! I am your new voice.')"><option value="">Automática</option>${voices.map(v=>`<option ${S.settings.voice===v.name?'selected':''}>${esc(v.name)}</option>`).join('')}</select></div>
  </div>
  <div class="seg" style="margin:12px 0">${[['dark','Oscura'],['light','Clara'],['auto','Como el teléfono']].map(([v,n])=>`<button class="${themePref()===v?'on':''}" onclick="ls('fluent_theme','${v}');applyTheme();sfx('toggle');render()">${n}</button>`).join('')}</div>
  <button class="btn alt" onclick="if(confirm('¿Cerrar sesión?'))logout()">${ic('logout',18)} Cerrar sesión</button>`;
}
function openName(force){openSheet(head(force?'¿Cómo te llamas?':'Tu nombre','Se usa en todas tus apps.')+`<div class="field"><input id="nmIn" value="${esc(user?.user_metadata?.name||'')}" placeholder="Tu nombre"></div><button class="btn" onclick="saveName(this)">Guardar</button>`);setTimeout(()=>$('nmIn')?.focus(),300)}
async function saveName(btn){const nm=$('nmIn').value.trim();if(!nm)return;btn.disabled=true;const {data,error}=await sb.auth.updateUser({data:{name:nm}});if(error){btn.disabled=false;return toast('No se pudo guardar','sad')}user=data.user;sfx('done');closeSheet();render();toast('Nice to meet you, '+userName()+'!')}

// El arranque (boot) está al final de js/world.js.
