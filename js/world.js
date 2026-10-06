// Fluent — el mundo: la ciudad de Brightvale (cada curso es un lugar), capítulos de historia,
// jefes, arcade de minijuegos, misiones del día, monedas, tienda y pasaporte de sellos.

/* ---------------- lugares de la ciudad ---------------- */
const DISTRICTS=[
  {id:'A1',name:'Barrio Sunrise',sub:'Lo básico para sobrevivir',from:1,to:6,sky:['#ff9a8b','#ffd29a']},
  {id:'A2',name:'Centro',sub:'Muévete por la ciudad',from:7,to:11,sky:['#5ec6ff','#b4f0c8']},
  {id:'B1',name:'El Puerto',sub:'Viaja y cuenta historias',from:12,to:15,sky:['#3a7bd5','#7fe0e6']},
  {id:'B2',name:'Distrito Financiero',sub:'Inglés de trabajo',from:16,to:19,sky:['#6a5af9','#c18cff']},
  {id:'C1',name:'La Torre',sub:'Nivel experto',from:20,to:20,sky:['#f7b733','#fc4a1a']},
];
const PLACES={
  1:{e:'🚉',n:'Estación Central',en:'Central Station',npc:['Mia','👩🏽'],boss:['Mr. Grumble, el taquillero','😤']},
  2:{e:'🏪',n:'Tiendita de la esquina',en:'Corner Store',npc:['Raj','👨🏾'],boss:['La Calculadora Loca','🧮']},
  3:{e:'🏡',n:'Casa de los Miller',en:"The Millers' House",npc:['Grandma Rose','👵🏼'],boss:['El Tío Preguntón','🧔🏻']},
  4:{e:'🏢',n:'Tu departamento',en:'Your Apartment',npc:['Leo, el casero','👨🏻‍🦰'],boss:['El Desorden','🌀']},
  5:{e:'🍔',n:'Restaurante Lucky',en:"Lucky's Diner",npc:['Sam, el mesero','🧑🏽‍🍳'],boss:['El Chef Gruñón','👨‍🍳']},
  6:{e:'⏰',n:'Torre del Reloj',en:'Clock Tower',npc:['Ava','👩🏻'],boss:['El Señor Tiempo','⌛']},
  7:{e:'🛍️',n:'Plaza Comercial',en:'The Mall',npc:['Chloe','👱🏻‍♀️'],boss:['La Rebaja Imposible','🏷️']},
  8:{e:'🚇',n:'Metro y calles',en:'Subway & Streets',npc:['Officer Dan','👮🏿‍♂️'],boss:['El Laberinto','🗺️']},
  9:{e:'🏛️',n:'Museo de Historia',en:'History Museum',npc:['Dr. Ellis','👩🏼‍🏫'],boss:['La Momia del Pasado','🧟']},
  10:{e:'🎓',n:'Universidad',en:'The University',npc:['Professor Kim','👨🏻‍🏫'],boss:['El Examen Sorpresa','📝']},
  11:{e:'🏥',n:'Hospital',en:'City Hospital',npc:['Nurse Joy','👩🏽‍⚕️'],boss:['El Virus Gruñón','🦠']},
  12:{e:'✈️',n:'Aeropuerto',en:'The Airport',npc:['Captain Lee','👨🏻‍✈️'],boss:['El Agente de Aduana','🛂']},
  13:{e:'🗺️',n:'Agencia de viajes',en:'Travel Agency',npc:['Nina','👩🏾'],boss:['El Plan Fallido','🌧️']},
  14:{e:'🏖️',n:'Muelle y playa',en:'The Pier',npc:['Surfer Jake','🏄🏼‍♂️'],boss:['El Kraken','🐙']},
  15:{e:'☕',n:'Café Opinión',en:'Opinion Café',npc:['Zoe','👩🏻‍🎤'],boss:['El Crítico Amargado','🧐']},
  16:{e:'💼',n:'Oficinas Brightcorp',en:'Brightcorp Offices',npc:['Ms. Carter','👩🏼‍💼'],boss:['El Jefe Exigente','🤵']},
  17:{e:'💻',n:'Laboratorio Tech',en:'Tech Lab',npc:['Byte','🤖'],boss:['El Hacker','👾']},
  18:{e:'🏦',n:'Banco Central',en:'Central Bank',npc:['Mr. Gold','👨🏽‍💼'],boss:['El Lobo de Wall Street','🐺']},
  19:{e:'🎭',n:'Teatro y cine',en:'The Theater',npc:['Lola','💃🏽'],boss:['La Diva','🎤']},
  20:{e:'🗼',n:'La Torre Brightvale',en:'Brightvale Tower',npc:['La Alcaldesa','👩🏿‍⚖️'],boss:['El Gran Maestro','🧙🏻‍♂️']},
};
const place=uid=>PLACES[uid]||{e:'📍',n:'Lugar',en:'Place',npc:['Alex','🧑'],boss:['Jefe','👹']};

/* ---------------- estado extra del mundo ---------------- */
function W(){S.w=S.w||{coins:0,inv:['face0'],equip:{face:'face0'},arcade:{},boss:{},story:{},missions:{},intro:false};return S.w}
function addCoins(n){W().coins+=n;if(n>0)sfx('coin')}
function dayCount(k,n=1){const d=dayRec();d.m=d.m||{};d.m[k]=(d.m[k]||0)+n}

/* ---------------- misiones del día ---------------- */
const MISSION_POOL=[
  ['lesson','Completa {n} encargo',[1,2],'target'],
  ['game','Juega {n} juegos del arcade',[2,3],'pairs'],
  ['story','Vive un capítulo de historia',[1],'book'],
  ['boss','Reta a un jefe',[1],'trophy'],
  ['review','Haz un repaso con Alex',[1],'brain'],
  ['speak','Di {n} frases en voz alta',[3,5],'mic'],
  ['xp','Gana {n} XP',[30,50],'bolt'],
];
function seedNum(s){let h=0;for(const c of s)h=(h*31+c.charCodeAt(0))>>>0;return h}
function todayMissions(){
  const t=today(),w=W();if(w.missions.day!==t){let h=seedNum(t+(user?.id||''));const pool=MISSION_POOL.slice();const out=[];
    while(out.length<3){const i=h%pool.length;h=Math.floor(h/7)+13*out.length+5;const m=pool.splice(i,1)[0];out.push({k:m[0],n:m[2][h%m[2].length],claimed:false})}
    w.missions={day:t,list:out}}
  return w.missions.list;
}
function missionProgress(m){const d=dayRec();if(m.k==='xp')return d.xp;if(m.k==='lesson')return d.lessons||0;return (d.m&&d.m[m.k])||0}
function missionText(m){const p=MISSION_POOL.find(x=>x[0]===m.k);return p[1].replace('{n}',m.n).replace('encargo',m.n>1?'encargos':'encargo')}
function claimMission(i){const m=todayMissions()[i];if(m.claimed||missionProgress(m)<m.n)return;m.claimed=true;addCoins(25);addXP(10);
  if(todayMissions().every(x=>x.claimed)){addCoins(50);confetti();toast('¡Todas las misiones! +50 monedas extra','celebrate')}else toast('+25 monedas','celebrate');save(true);render()}
function missionsHTML(compact){const ms=todayMissions();const done=ms.filter(m=>m.claimed).length;
  return `<div class="w-missions"><div class="w-mh"><b>Misiones de hoy</b><span>${done}/3 · cofre de 50 🪙</span></div>${ms.map((m,i)=>{const p=Math.min(m.n,missionProgress(m)),ok=p>=m.n;const icn=MISSION_POOL.find(x=>x[0]===m.k)[3];
    return `<div class="w-mi ${m.claimed?'claimed':ok?'ready':''}"><span class="w-mic">${ic(icn,18)}</span><div class="mid"><div class="t">${esc(missionText(m))}</div><div class="w-bar"><i style="width:${Math.round(p/m.n*100)}%"></i></div></div>${m.claimed?`<span class="w-ok">${ic('check',18,3)}</span>`:ok?`<button class="w-claim" onclick="claimMission(${i})">+25 🪙</button>`:`<span class="small muted">${p}/${m.n}</span>`}</div>`}).join('')}</div>`}

/* ---------------- seguimiento de sesiones ---------------- */
const _finishSession=finishSession;
finishSession=function(){
  if(P){if(P.mode==='lesson'){addCoins(10+(P.wrong===0?5:0))}
    if(P.mode==='review'){dayCount('review');addCoins(5)}
    if(P.mode==='game'){dayCount('game');addCoins(Math.min(20,Math.round((P.gameXP||0)/2)+3))}
    if(P.speakCount)dayCount('speak',P.speakCount)}
  _finishSession();
};
const _evalSpeak=evalSpeak;
evalSpeak=function(said){const before=S.totals.speak;_evalSpeak(said);if(S.totals.speak>before&&P)P.speakCount=(P.speakCount||0)+1};

/* ---------------- vista: ciudad ---------------- */
let curPlace=null;
function currentUnit(){const nx=nextLesson();if(!nx)return UNITS.length;if(nx.test)return nx.test;return nx.unit||+String(nx.id).split('-')[0]||1}
function placeProgress(uid){const u=unitById(uid);const n=u.lessons.filter(l=>S.done[l.id]).length;return {n,total:u.lessons.length,story:!!(S.units[uid]?.dlg),boss:!!W().boss[uid],exam:!!S.units[uid]?.test}}
function avatarHTML(size=40){return `<span class="w-av" style="--s:${size}px">${avatarSVG(size)}</span>`}
function cityView(){
  const w=W();const cu=currentUnit();const lv=level();
  let html=`<div class="w-hero"><div class="w-hero-top">${avatarHTML(54)}<div style="flex:1;min-width:0"><div class="w-hello">${greet()}</div><div class="w-lv"><b>Nivel ${lv.lv}</b><div class="w-bar gold"><i style="width:${Math.round(lv.into/lv.need*100)}%"></i></div></div></div><button class="w-coins" onclick="go('me')">🪙 ${w.coins}</button></div>
  <button class="w-go" onclick="openPlace(${cu})"><span class="w-go-e">${place(cu).e}</span><span style="flex:1;text-align:left"><small>Tu siguiente parada</small><b>${esc(place(cu).n)}</b></span>${ic('play',22)}</button></div>`;
  html+=missionsHTML();
  for(const d of DISTRICTS){
    const ids=[];for(let i=d.from;i<=d.to;i++)if(unitById(i))ids.push(i);if(!ids.length)continue;
    const open=unitUnlocked(d.from);
    html+=`<section class="w-dist ${open?'':'locked'}"><div class="w-dh" style="--a:${d.sky[0]};--b:${d.sky[1]}"><div><span class="w-lvl">${d.id}</span><h2>${esc(d.name)}</h2><p>${esc(d.sub)}</p></div><svg class="w-sky" viewBox="0 0 120 40" aria-hidden="true"><path d="M0 40V26h8v-8h6v8h6V12h10v28M34 40V20h8v-6h4v6h6v20M56 40V8h12v32M72 40V22h10v18M86 40V16h6v-6h4v6h6v24M106 40V24h14v16" fill="rgba(0,0,0,.18)"/></svg></div>
    <div class="w-blocks">${ids.map((uid,k)=>{const p=place(uid),pr=placeProgress(uid),un=unitUnlocked(uid),here=uid===cu;const pct=Math.round(pr.n/pr.total*100);
      return `<button class="w-place ${un?'':'lock'} ${here?'here':''} ${pr.exam?'done':''} ${k%2?'r':'l'}" onclick="${un?`openPlace(${uid})`:`lockedPlace(${uid})`}" aria-label="${esc(p.n)}">
        <span class="w-ring" style="--p:${pct}"><span class="w-emoji">${p.e}</span></span>
        <span class="w-pt"><small>${esc(p.en)}</small><b>${esc(p.n)}</b><span class="w-badges">${pr.exam?'<i title="Sello">🔖</i>':''}${pr.boss?'<i title="Jefe vencido">👑</i>':''}${pr.story?'<i title="Historia">📖</i>':''}${!un?ic('lock',14):`<em>${pr.n}/${pr.total}</em>`}</span></span>
        ${here?`<span class="w-pin">${avatarHTML(30)}<span>Aquí vas</span></span>`:''}</button>`}).join('<div class="w-road"></div>')}</div></section>`;
  }
  return html+`<div class="card" style="text-align:center">${kikoSVG(80,'celebrate')}<b>Junta los 20 sellos de tu pasaporte</b><div class="muted small">${UNITS.length} lugares · ${LESSONS.length} encargos · ${ALL_WORDS.length} palabras</div></div>`;
}
function lockedPlace(uid){sfx('error');const prev=place(uid-1);openSheet(head(`${place(uid).e} ${esc(place(uid).n)}`,'Todavía está cerrado')+`<p class="muted">Consigue el sello de <b>${esc(prev.n)}</b> (aprueba su examen final) para abrir este lugar.</p><p class="muted">¿Ya sabes inglés de este nivel? Haz una prueba y salta hasta aquí.</p><button class="btn" onclick="closeSheet();startSkipTest(${uid})">${ic('trophy',18)} Prueba para saltar</button>`)}

/* ---------------- vista: un lugar ---------------- */
function openPlace(uid){if(!unitUnlocked(uid))return lockedPlace(uid);curPlace=uid;sfx('open');view='place';buildNav();render();scrollTo({top:0})}
function placeView(){
  const uid=curPlace,u=unitById(uid),p=place(uid),pr=placeProgress(uid);const d=DISTRICTS.find(x=>uid>=x.from&&uid<=x.to)||DISTRICTS[0];
  const lessonsOpen=i=>i===0||!!S.done[u.lessons[i-1].id];
  const bossOpen=pr.n>=5;const examOpen=pr.n===pr.total;
  return `<div class="w-place-hero" style="--a:${d.sky[0]};--b:${d.sky[1]}"><button class="w-back" onclick="go('city')" aria-label="Volver a la ciudad">${ic('close',18)}</button><div class="w-big">${p.e}</div><small>${esc(p.en)} · ${u.level}</small><h1>${esc(p.n)}</h1><p>${esc(u.goal_es||'')}</p>
    <div class="w-stamps"><span class="${pr.story?'on':''}">📖 Historia</span><span class="${pr.boss?'on':''}">👑 Jefe</span><span class="${pr.exam?'on':''}">🔖 Sello</span></div></div>
  <div class="w-sec"><h2>Capítulo de historia</h2></div>
  <button class="w-story" onclick="playStory(${uid})"><span class="w-npc">${p.npc[1]}</span><span style="flex:1;text-align:left"><b>${esc(u.dialogue?.title_es||'Capítulo')}</b><small>${esc(u.dialogue?.setting_es||'')}</small><em>Con ${esc(p.npc[0])} · elige qué decir</em></span>${pr.story?`<span class="w-ok">${ic('check',20,3)}</span>`:ic('play',22)}</button>
  <div class="w-sec"><h2>Encargos</h2><span class="muted small">${pr.n}/${pr.total}</span></div>
  <div class="w-tasks">${u.lessons.map((l,i)=>{const dn=S.done[l.id],op=lessonsOpen(i);return `<button class="w-task ${dn?'done':op?'open':'lock'}" onclick="${dn||op?`openLesson('${l.id}')`:'lockedLesson()'}"><span class="w-tn">${dn?ic('check',16,3):op?i+1:ic('lock',14)}</span><b>${esc(l.title_es)}</b><span class="w-st">${dn?[1,2,3].map(s=>s<=dn.stars?'★':'☆').join(''):l.words.slice(0,3).map(w=>esc(enMain(w.en))).join(' · ')}</span></button>`}).join('')}</div>
  <div class="w-sec"><h2>Retos</h2></div>
  <div class="w-duo">
    <button class="w-boss ${bossOpen?'':'lock'}" onclick="${bossOpen?`bossIntro(${uid})`:`toast('Termina 5 encargos para retar al jefe','think')`}"><span class="w-be">${p.boss[1]}</span><b>Jefe: ${esc(p.boss[0])}</b><small>${pr.boss?'Vencido · repite cuando quieras':bossOpen?'Duelo de 3 vidas contra reloj':'Se abre con 5 encargos'}</small></button>
    <button class="w-boss exam ${examOpen?'':'lock'}" onclick="${examOpen?`openTest(${uid})`:`toast('Termina los 10 encargos para el examen','think')`}"><span class="w-be">🔖</span><b>Examen del sello</b><small>${pr.exam?`Aprobado con ${S.units[uid].test}%`:examOpen?'Abre el siguiente lugar':'Se abre con los 10 encargos'}</small></button>
  </div>
  <div class="w-sec"><h2>Palabras de este lugar</h2></div>
  <div class="w-words">${u.lessons.flatMap(l=>l.words).slice(0,30).map(w=>`<button onclick="speak('${esc(enMain(w.en)).replace(/'/g,"\\'")}')">${esc(enMain(w.en))}<small>${esc(w.es)}</small></button>`).join('')}</div>`;
}

/* ---------------- capítulo de historia ---------------- */
let ST=null;
function playStory(uid){
  const u=unitById(uid),d=u.dialogue;if(!d)return toast('Este lugar no tiene historia todavía','think');
  const p=place(uid);const otherB=UNITS.filter(x=>Math.abs(x.id-uid)<=3&&x.id!==uid&&x.dialogue).flatMap(x=>x.dialogue.lines.filter(l=>l.who==='B'));
  ST={uid,d,p,i:0,hearts:3,pool:otherB.length>=4?otherB:UNITS.flatMap(x=>x.dialogue?x.dialogue.lines.filter(l=>l.who==='B'):[]),log:[],ok:0,tot:0};
  $('player').classList.add('open');document.body.style.overflow='hidden';
  P={mode:'game',i:0,total:d.lines.length,answered:0,correct:0,wrong:0,combo:0,maxCombo:0,start:Date.now(),queue:[],retried:new Set()};
  $('pBtn').style.display='none';$('pFoot').className='p-foot';$('pFb').innerHTML='';
  $('pBody').innerHTML=`<div class="st-scene"><div class="st-set"><span>${p.e}</span><div><b>${esc(d.title_es)}</b><small>${esc(d.setting_es)}</small></div></div><div class="st-hearts" id="stH"></div><div class="st-chat" id="stC"></div><div id="stA"></div></div>`;
  stHearts();setTimeout(stNext,500);
}
function stHearts(){$('stH').innerHTML=[0,1,2].map(i=>`<span class="${i<ST.hearts?'':'off'}">❤</span>`).join('')}
function stBubble(who,en,es){const me=who==='B';const c=$('stC');c.insertAdjacentHTML('beforeend',`<div class="st-b ${me?'me':''}">${me?'':`<span class="st-who">${ST.p.npc[1]}</span>`}<div><p>${esc(en)}</p><small>${esc(es)}</small></div>${me?avatarHTML(30):''}</div>`);c.lastElementChild.scrollIntoView({behavior:'smooth',block:'end'})}
function stNext(){
  P.answered=ST.i;$('pBar').style.width=Math.round(ST.i/ST.d.lines.length*100)+'%';
  if(ST.i>=ST.d.lines.length)return stEnd();
  const l=ST.d.lines[ST.i];
  if(l.who==='A'){stBubble('A',l.en,l.es);$('stA').innerHTML='';speak(l.en,{onend:()=>{}});ST.i++;setTimeout(stNext,Math.min(3200,900+l.en.length*45));return}
  const opts=shuffle([l,...pick(ST.pool.filter(x=>x.en!==l.en),2)]);ST.tot++;
  $('stA').innerHTML=`<p class="st-q">¿Qué le contestas a ${esc(ST.p.npc[0])}?</p><div class="st-opts">${opts.map(o=>`<button class="opt" onclick="stPick(this,${o.en===l.en})" data-en="${esc(o.en)}">${esc(o.en)}<small>${esc(o.es)}</small></button>`).join('')}</div>${canListen()?`<button class="st-mic" onclick="stSay()">${ic('mic',20)} O dilo en voz alta</button>`:''}`;
}
function stPick(el,ok){
  document.querySelectorAll('.st-opts .opt').forEach(b=>b.disabled=true);
  const l=ST.d.lines[ST.i];
  if(ok){el.classList.add('right');sfx('done');ST.ok++;P.correct++;setTimeout(()=>{stBubble('B',l.en,l.es);speak(l.en);ST.i++;$('stA').innerHTML='';setTimeout(stNext,1100)},450)}
  else{el.classList.add('wrong');sfx('error');buzz(40);ST.hearts--;P.wrong++;stHearts();
    const reacts=['Sorry? I don\'t understand.','Hmm... what do you mean?','Excuse me?','That\'s a little strange...'];const r=reacts[Math.floor(Math.random()*reacts.length)];
    setTimeout(()=>{stBubble('A',r,'(No te entendió)');speak(r);if(ST.hearts<=0)return setTimeout(()=>stEnd(true),1200);document.querySelectorAll('.st-opts .opt').forEach(b=>{if(!b.classList.contains('wrong'))b.disabled=false})},500)}
}
function stSay(){const l=ST.d.lines[ST.i];const b=document.querySelector('.st-mic');b.classList.add('rec');b.innerHTML=ic('mic',20)+' Te escucho…';
  listen({onText:t=>{b.innerHTML=ic('mic',20)+' '+esc(t)},onEnd:t=>{b.classList.remove('rec');const sc=similarity(t||'',l.en);if(sc>=.7){S.totals.speak++;dayCount('speak');const el=[...document.querySelectorAll('.st-opts .opt')].find(o=>o.dataset.en===l.en);stPick(el,true)}else{b.innerHTML=ic('mic',20)+' No te entendí bien, intenta otra vez';sfx('error')}},onError:()=>{b.classList.remove('rec');b.innerHTML=ic('mic',20)+' O dilo en voz alta'}})}
function stEnd(failed){
  const uid=ST.uid,first=!S.units[uid]?.dlg;
  if(!failed){S.units[uid]={...(S.units[uid]||{}),dlg:true};dayCount('story');addCoins(first?30:10);ST.d.lines.filter(l=>l.who==='B').forEach(l=>srsAdd({en:l.en,es:l.es,lesson:uid+'-dlg'},'s'))}
  P.gameXP=failed?5:(first?25:12);P.answered=Math.max(1,ST.tot);P.correct=ST.ok;
  const stars=failed?0:ST.hearts;
  _finishSession();
  $('pBody').querySelector('h2').textContent=failed?'Se te acabaron las vidas':stars===3?'¡Capítulo perfecto!':'¡Capítulo completado!';
  const extra=document.createElement('div');extra.className='card';extra.innerHTML=failed?`<b>${ST.p.npc[1]} ${esc(ST.p.npc[0])} se quedó confundido.</b><div class="muted small">Repasa los encargos de este lugar y vuelve a intentarlo.</div>`:`<b>Reputación en ${esc(ST.p.n)}: ${'★'.repeat(stars)}${'☆'.repeat(3-stars)}</b><div class="muted small">${first?'+30 monedas · Las frases que dijiste se agregaron a tu repaso.':'+10 monedas'}</div>`;
  $('pBody').querySelector('.result').appendChild(extra);
}

/* ---------------- jefe del lugar ---------------- */
function bossIntro(uid){const p=place(uid);openSheet(`<div class="w-bi">${head('','')}<div class="w-be big">${p.boss[1]}</div><h2>${esc(p.boss[0])}</h2><p class="muted">Contesta rápido para quitarle vida. Tienes 3 corazones y 10 segundos por pregunta. Las rachas pegan más fuerte.</p><button class="btn" onclick="closeSheet();bossFight(${uid})">${ic('bolt',18)} ¡A pelear!</button></div>`)}
let B=null;
function bossQs(uid){const u=unitById(uid);const ws=u.lessons.flatMap(l=>l.words.map(w=>({...w,lesson:l.id})));const ss=u.lessons.flatMap(l=>l.sentences);const qs=[];
  pick(ws,5).forEach(w=>qs.push({t:'Traduce',q:enMain(w.en),a:w.es,o:distractors(w.es,ws,3,'es'),say:enMain(w.en)}));
  pick(ws,3).forEach(w=>qs.push({t:'¿Cómo se dice?',q:w.es,a:enMain(w.en),o:distractors(w.en,ws,3,'en').map(enMain)}));
  pick(ws,2).forEach(w=>qs.push({t:'Escucha',q:'🔊',a:enMain(w.en),o:distractors(w.en,ws,3,'en').map(enMain),listen:enMain(w.en)}));
  pick(ss,4).forEach(s=>{const tk=tokens(s.en);const cand=tk.filter(x=>x.length>2);if(!cand.length)return;const hide=cand[Math.floor(Math.random()*cand.length)];const others=shuffle([...new Set(ss.flatMap(x=>tokens(x.en)).filter(x=>x.length>2&&x.toLowerCase()!==hide.toLowerCase()))]).slice(0,3);if(others.length<3)return;qs.push({t:'Completa',q:s.en.replace(new RegExp('\\b'+hide.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b'),'____'),sub:s.es,a:hide,o:others})});
  return shuffle(qs).slice(0,12)}
function bossFight(uid){
  const p=place(uid);B={uid,p,hp:100,hearts:3,qs:bossQs(uid),i:0,combo:0,ok:0};
  $('player').classList.add('open');document.body.style.overflow='hidden';
  P={mode:'game',i:0,total:B.qs.length,answered:0,correct:0,wrong:0,combo:0,maxCombo:0,start:Date.now(),queue:[],retried:new Set()};
  $('pBtn').style.display='none';$('pFoot').className='p-foot';$('pFb').innerHTML='';
  $('pBody').innerHTML=`<div class="bf"><div class="bf-top"><div class="bf-boss" id="bfB">${p.boss[1]}</div><div style="flex:1"><b>${esc(p.boss[0])}</b><div class="bf-hp"><i id="bfHp" style="width:100%"></i></div></div></div><div class="bf-me"><span id="bfH"></span><span class="bf-t" id="bfT">10</span></div><div id="bfQ"></div></div>`;
  bfHearts();bfNext();
}
function bfHearts(){$('bfH').innerHTML=[0,1,2].map(i=>`<span class="${i<B.hearts?'':'off'}">❤</span>`).join('')+(B.combo>=2?` <em class="bf-combo">x${B.combo}</em>`:'')}
function bfNext(){
  clearInterval(B.timer);$('pBar').style.width=Math.round(B.i/B.qs.length*100)+'%';
  if(B.hp<=0||B.hearts<=0||B.i>=B.qs.length)return bfEnd();
  const q=B.qs[B.i];const opts=shuffle([q.a,...q.o]);
  $('bfQ').innerHTML=`<p class="bf-k">${q.t}</p><div class="bf-q">${q.listen?`<button class="bf-ls" onclick="speak('${esc(q.listen).replace(/'/g,"\\'")}')">${ic('speaker',34)}</button>`:esc(q.q)}</div>${q.sub?`<p class="muted" style="text-align:center;margin-top:-8px">${esc(q.sub)}</p>`:''}<div class="opts two">${opts.map(o=>`<button class="opt" onclick="bfAns(this,${o===q.a})">${esc(o)}</button>`).join('')}</div>`;
  if(q.listen)setTimeout(()=>speak(q.listen),250);
  let t=typeof bossTime==='function'?bossTime():10;$('bfT').textContent=t;B.timer=setInterval(()=>{t--;const e=$('bfT');if(e){e.textContent=t;e.classList.toggle('hurry',t<=3)}if(t<=0){clearInterval(B.timer);bfAns(null,false)}},1000);
}
function bfAns(el,ok){
  clearInterval(B.timer);document.querySelectorAll('#bfQ .opt').forEach(b=>{b.disabled=true;if(b.textContent===B.qs[B.i].a)b.classList.add('right')});
  if(el&&!ok)el.classList.add('wrong');
  if(ok){B.combo++;B.ok++;P.correct++;const dmg=10+Math.min(10,(B.combo-1)*3);B.hp=Math.max(0,B.hp-dmg);sfx(B.combo>=3?'coin':'done');const bb=$('bfB');bb.classList.remove('hit');void bb.offsetWidth;bb.classList.add('hit');bb.insertAdjacentHTML('beforeend',`<span class="bf-dmg">-${dmg}</span>`);setTimeout(()=>bb.querySelector('.bf-dmg')?.remove(),800)}
  else{B.combo=0;B.hearts--;P.wrong++;sfx('error');buzz([30,40,30]);document.querySelector('.bf').classList.add('shake');setTimeout(()=>document.querySelector('.bf')?.classList.remove('shake'),400)}
  $('bfHp').style.width=B.hp+'%';bfHearts();B.i++;P.answered=B.i;setTimeout(bfNext,ok?650:1300);
}
function bfEnd(){
  clearInterval(B.timer);const win=B.hp<=0||(B.i>=B.qs.length&&B.hearts>0&&B.hp<=30);const first=win&&!W().boss[B.uid];
  if(win){W().boss[B.uid]=today();addCoins(first?40:15)}dayCount('boss');
  P.gameXP=win?(first?30:15):5;P.answered=Math.max(1,B.i);
  _finishSession();
  $('pBody').querySelector('h2').textContent=win?`¡Venciste a ${B.p.boss[0]}!`:`${B.p.boss[0]} ganó esta vez`;
  const ex=document.createElement('div');ex.className='card';ex.innerHTML=win?`<b>👑 ${first?'Corona del jefe para tu pasaporte · +40 monedas':'+15 monedas'}</b>`:`<b>Le quitaste ${100-B.hp}% de vida.</b><div class="muted small">Repasa los encargos y vuelve a retarlo.</div>`;
  $('pBody').querySelector('.result').appendChild(ex);
}

/* ---------------- arcade ---------------- */
const GAMES=[
  ['rain','Lluvia de palabras','Atrapa la palabra correcta antes de que caiga','☔'],
  ['memo','Memorama','Encuentra las parejas inglés y español','🃏'],
  ['hang','Ahorcado','Adivina la palabra letra por letra','🪢'],
  ['soup','Sopa de letras','Encuentra las palabras escondidas','🔎'],
  ['race','Carrera','Escribe rápido y gánale al rival','🏎️'],
  ['escape','Escape room','Resuelve 4 candados para salir','🔐'],
  ['pairs','Parejas contra reloj','Une palabras en 60 segundos','⏱️'],
  ['listen','Oído rápido','Escucha y elige','👂'],
  ['tf','¿Sí o no?','¿La traducción es correcta?','✅'],
  ['spell','Deletrea','Escucha y escríbelo','✍️'],
];
function arc(g){const a=W().arcade;return a[g]||(a[g]={best:0,plays:0,lv:1})}
function arcadeView(){
  return `<h1 class="title">Arcade</h1><p class="muted" style="margin-top:-6px">Cada juego usa las palabras que ya aprendiste y sube de nivel cuando superas tu récord.</p>
  <div class="ar-grid">${GAMES.map(([id,n,d,e],i)=>{const a=arc(id);return `<button class="ar-card ${i<2?'big':''}" onclick="playGame('${id}')"><span class="ar-e">${e}</span><b>${n}</b><span class="ar-d">${d}</span><span class="ar-meta"><em>Nv. ${a.lv}</em>${a.best?`<em>Récord ${a.best}</em>`:''}</span></button>`}).join('')}</div>`;
}
let CURG=null;
function playGame(id){CURG=id;arc(id).plays++;sfx('open');({rain:gameRain,memo:gameMemo,hang:gameHang,soup:gameSoup,race:gameRace,escape:gameEscape,pairs:gamePairs,listen:gameListen,tf:gameTF,spell:gameSpell})[id]()}
const _gameEnd=gameEnd;
gameEnd=function(score,label){const a=CURG?arc(CURG):null;let up='';if(a){if(score>a.best){if(a.best>0){a.lv++;up=`¡Nuevo récord! Subiste a nivel ${a.lv}`}a.best=score}}clearInterval(G?.raf);cancelAnimationFrame(G?.raf);_gameEnd(score,label);if(up){const e=document.createElement('div');e.className='card';e.innerHTML=`<b style="color:var(--gold)">🏆 ${up}</b>`;$('pBody').querySelector('.result')?.appendChild(e)}CURG=null};
const gw=()=>learnedWords();
const singleWords=()=>gw().filter(w=>/^[a-z]{3,10}$/i.test(enMain(w.en)));

function gameRain(){
  const lv=arc('rain').lv;const ws=gw();G={score:0,lives:3,items:[],t0:performance.now(),last:0};
  gameShell(`Lluvia de palabras <span style="float:right" id="rl">❤❤❤</span>`,`<div class="pill" style="margin-bottom:8px">Puntos: <b id="gs">0</b></div><div class="rain-target" id="rt"></div><div class="rain" id="rain"></div>`);
  const newTarget=()=>{G.target=pick(ws,1)[0];$('rt').innerHTML=`Atrapa: <b>${esc(G.target.es)}</b>`};newTarget();
  const box=$('rain');const spawn=()=>{const isT=Math.random()<.4||!G.items.some(i=>i.ok);const w=isT?G.target:pick(ws.filter(x=>x.en!==G.target.en),1)[0];const el=document.createElement('button');el.className='drop';el.textContent=enMain(w.en);el.style.left=(5+Math.random()*60)+'%';box.appendChild(el);const it={el,y:-30,ok:w.en===G.target.en,sp:(28+lv*6)*(0.8+Math.random()*.5)};el.onclick=()=>{if(it.ok){G.score++;P.correct++;$('gs').textContent=G.score;sfx('done');el.classList.add('pop');G.items.forEach(x=>x.el.remove());G.items=[];newTarget()}else{sfx('error');buzz(30);el.classList.add('bad');lose()}};G.items.push(it)};
  const lose=()=>{G.lives--;$('rl').textContent='❤'.repeat(Math.max(0,G.lives))+'🤍'.repeat(3-Math.max(0,G.lives));if(G.lives<=0){G.items.forEach(x=>x.el.remove());gameEnd(G.score,`¡${G.score} palabras atrapadas!`)}};
  let prev=performance.now();const step=now=>{if(!$('rain')||G.lives<=0)return;const dt=(now-prev)/1000;prev=now;if(now-G.last>Math.max(700,1500-lv*100)){G.last=now;spawn()}const H=box.clientHeight;
    G.items=G.items.filter(it=>{it.y+=it.sp*dt;it.el.style.transform=`translateY(${it.y}px)`;if(it.y>H-10){it.el.remove();if(it.ok){lose();newTarget()}return false}return true});G.raf=requestAnimationFrame(step)};G.raf=requestAnimationFrame(step);
}
function gameMemo(){
  const lv=arc('memo').lv;const n=Math.min(8,4+lv);const ws=pick(gw(),n);const cards=shuffle(ws.flatMap((w,i)=>[{k:i,t:enMain(w.en),en:1},{k:i,t:w.es}]));G={open:[],found:0,moves:0,t0:Date.now()};
  gameShell(`Memorama <span style="float:right" class="small muted" id="mm">0 movimientos</span>`,`<div class="memo" style="grid-template-columns:repeat(${n>6?4:4},1fr)">${cards.map((c,i)=>`<button class="mc" data-k="${c.k}" data-i="${i}" onclick="memoTap(this)"><span class="mf">?</span><span class="mb ${c.en?'en':''}">${esc(c.t)}</span></button>`).join('')}</div>`);
  window.memoTap=el=>{if(el.classList.contains('flip')||G.open.length>=2)return;el.classList.add('flip');sfx('toggle');if(el.querySelector('.en'))speak(el.querySelector('.en').textContent);G.open.push(el);
    if(G.open.length===2){G.moves++;$('mm').textContent=G.moves+' movimientos';const [a,b]=G.open;if(a.dataset.k===b.dataset.k){setTimeout(()=>{a.classList.add('ok');b.classList.add('ok');sfx('done');G.open=[];G.found++;P.correct++;if(G.found===n){const sc=Math.max(5,n*10-Math.max(0,G.moves-n)*3);gameEnd(sc,`¡Listo en ${G.moves} movimientos!`)}},350)}else setTimeout(()=>{a.classList.remove('flip');b.classList.remove('flip');G.open=[]},900)}};
}
function gameHang(){
  const ws=pick(singleWords(),5);G={i:0,score:0};
  const round=()=>{if(G.i>=ws.length)return gameEnd(G.score,`¡${G.score} puntos!`);const w=ws[G.i];G.word=enMain(w.en).toLowerCase();G.got=new Set();G.miss=0;
    $('gb').innerHTML=`<div class="hang"><svg viewBox="0 0 120 120" id="hs"></svg><div class="hw" id="hw"></div><p class="muted" style="text-align:center">Pista: <b>${esc(w.es)}</b> · palabra ${G.i+1} de ${ws.length}</p><div class="keys">${'abcdefghijklmnopqrstuvwxyz'.split('').map(c=>`<button onclick="hangKey(this,'${c}')">${c}</button>`).join('')}</div></div>`;draw()};
  const parts=['<line x1="10" y1="110" x2="70" y2="110"/>','<line x1="30" y1="110" x2="30" y2="10"/><line x1="30" y1="10" x2="80" y2="10"/><line x1="80" y1="10" x2="80" y2="25"/>','<circle cx="80" cy="35" r="10"/>','<line x1="80" y1="45" x2="80" y2="75"/>','<line x1="80" y1="52" x2="66" y2="64"/><line x1="80" y1="52" x2="94" y2="64"/>','<line x1="80" y1="75" x2="68" y2="95"/><line x1="80" y1="75" x2="92" y2="95"/>'];
  const draw=()=>{$('hs').innerHTML=`<g stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round">${parts.slice(0,G.miss).join('')}</g>`;$('hw').innerHTML=G.word.split('').map(c=>`<span>${G.got.has(c)?c:''}</span>`).join('')};
  window.hangKey=(el,c)=>{el.disabled=true;if(G.word.includes(c)){G.got.add(c);el.classList.add('ok');sfx('ok')}else{G.miss++;el.classList.add('no');sfx('error')}draw();
    const won=G.word.split('').every(ch=>G.got.has(ch));if(won||G.miss>=6){if(won){G.score+=Math.max(2,10-G.miss);P.correct++;sfx('done')}speak(G.word);$('hw').innerHTML=G.word.split('').map(ch=>`<span class="${won?'w':'l'}">${ch}</span>`).join('');document.querySelectorAll('.keys button').forEach(b=>b.disabled=true);G.i++;setTimeout(round,1400)}};
  gameShell('Ahorcado',`<div id="gb"></div>`);round();
}
function gameSoup(){
  const lv=arc('soup').lv;const N=lv>=3?10:9;const words=pick(singleWords().filter(w=>enMain(w.en).length<=N-1),Math.min(7,4+lv));const grid=[...Array(N)].map(()=>Array(N).fill(''));const placed=[];
  const dirs=lv>=2?[[0,1],[1,0],[1,1],[-1,1]]:[[0,1],[1,0]];
  for(const w of words){const s=enMain(w.en).toUpperCase();let ok=false;for(let t=0;t<200&&!ok;t++){const [dr,dc]=dirs[Math.floor(Math.random()*dirs.length)];const r=Math.floor(Math.random()*N),c=Math.floor(Math.random()*N);const er=r+dr*(s.length-1),ec=c+dc*(s.length-1);if(er<0||er>=N||ec<0||ec>=N)continue;let fit=true;for(let k=0;k<s.length;k++){const x=grid[r+dr*k][c+dc*k];if(x&&x!==s[k]){fit=false;break}}if(!fit)continue;const cells=[];for(let k=0;k<s.length;k++){grid[r+dr*k][c+dc*k]=s[k];cells.push((r+dr*k)*N+c+dc*k)}placed.push({w,s,cells});ok=true}}
  const AB='ABCDEFGHIJKLMNOPRSTUVWY';for(let r=0;r<N;r++)for(let c=0;c<N;c++)if(!grid[r][c])grid[r][c]=AB[Math.floor(Math.random()*AB.length)];
  G={placed,found:new Set(),a:null,t0:Date.now()};
  gameShell(`Sopa de letras <span style="float:right" class="small muted" id="sf">0/${placed.length}</span>`,`<p class="muted small" style="margin:-4px 0 10px">Toca la primera y la última letra de cada palabra.</p><div class="soup" style="grid-template-columns:repeat(${N},1fr)">${grid.flat().map((ch,i)=>`<button data-i="${i}" onclick="soupTap(this)">${ch}</button>`).join('')}</div><div class="soup-list">${placed.map((p,i)=>`<span id="sw${i}">${esc(p.w.es)}</span>`).join('')}</div>`);
  window.soupTap=el=>{const i=+el.dataset.i;if(G.a===null){G.a=i;el.classList.add('sel');sfx('toggle');return}const a=G.a;G.a=null;document.querySelectorAll('.soup .sel').forEach(b=>b.classList.remove('sel'));
    const hit=G.placed.findIndex((p,k)=>!G.found.has(k)&&((p.cells[0]===a&&p.cells[p.cells.length-1]===i)||(p.cells[0]===i&&p.cells[p.cells.length-1]===a)));
    if(hit<0){sfx('error');return}G.found.add(hit);P.correct++;sfx('done');speak(G.placed[hit].s.toLowerCase());G.placed[hit].cells.forEach(c=>document.querySelector(`.soup [data-i="${c}"]`).classList.add('found'));$('sw'+hit).classList.add('done');$('sw'+hit).textContent=G.placed[hit].s.toLowerCase()+' · '+G.placed[hit].w.es;$('sf').textContent=G.found.size+'/'+G.placed.length;
    if(G.found.size===G.placed.length){const secs=Math.round((Date.now()-G.t0)/1000);gameEnd(Math.max(5,G.placed.length*8-Math.floor(secs/10)),`¡Encontraste todas en ${secs} s!`)}};
}
function gameRace(){
  const lv=arc('race').lv;const ws=gw();const goal=10;G={me:0,rival:0,score:0};
  gameShell('Carrera',`<div class="race"><div class="lane"><span class="car" id="cMe">🏎️</span><small>Tú</small></div><div class="lane"><span class="car" id="cRv">🚙</span><small>Rival</small></div><div class="finish"></div></div><div class="wordcard" style="margin-top:14px"><div class="es" id="rq" style="font-size:24px;color:var(--text)"></div><div class="muted small">Escríbelo en inglés</div></div><input id="ri" class="typein" style="min-height:0;text-align:center;font-size:22px" autocapitalize="off" autocomplete="off" spellcheck="false">`);
  const next=()=>{G.w=pick(ws,1)[0];$('rq').textContent=G.w.es;$('ri').value='';$('ri').focus()};
  const pos=()=>{if(!$('cMe')){clearInterval(G.timer);return}$('cMe').style.left=`calc(${G.me/goal*86}% )`;$('cRv').style.left=`calc(${G.rival/goal*86}% )`};
  $('ri').oninput=e=>{const v=e.target.value;const ans=String(G.w.en).split(' / ').map(x=>norm(x));if(ans.includes(norm(v))){G.me++;G.score+=3;P.correct++;sfx('done');speak(enMain(G.w.en));pos();if(G.me>=goal)return fin(true);next()}};
  $('ri').onkeydown=e=>{if(e.key==='Enter'){sfx('error');$('ri').placeholder=enMain(G.w.en);G.me=Math.max(0,G.me-0);next()}};
  G.timer=setInterval(()=>{G.rival+=1;pos();if(G.rival>=goal)fin(false)},Math.max(2200,5200-lv*400));
  const fin=win=>{clearInterval(G.timer);gameEnd(G.score+(win?10:0),win?'¡Ganaste la carrera!':'El rival llegó primero')};
  next();pos();
}
function gameEscape(){
  const ws=pick(singleWords(),3);const ss=pick(Object.values(S.srs).filter(c=>c.kind==='s').concat(ALL_SENTS.slice(0,30)),1);const code=[...Array(4)].map(()=>Math.floor(Math.random()*10));G={step:0,score:0,t0:Date.now(),fails:0};
  const puzzles=[
    {t:'Candado 1: ordena las letras',w:ws[0],q:()=>{const w0=enMain(ws[0].en).toUpperCase();let sc=w0;for(let k=0;k<12&&sc===w0;k++)sc=shuffle(w0.split('')).join('');return `<div class="big-word">${sc.split('').join(' ')}</div><p class="muted" style="text-align:center">${esc(ws[0].es)}</p>`},a:enMain(ws[0].en)},
    {t:'Candado 2: escucha y escribe',q:()=>{setTimeout(()=>speak(enMain(ws[1].en)),300);return `<div class="big-listen"><button onclick="speak('${esc(enMain(ws[1].en))}')">${ic('speaker',40)}</button></div>`},a:enMain(ws[1].en)},
    {t:'Candado 3: tradúcelo al inglés',q:()=>`<div class="big-word" style="font-size:26px">${esc(ws[2].es)}</div>`,a:enMain(ws[2].en)},
    {t:'Candado 4: ¿qué palabra falta?',q:()=>{const s=ss[0];const tk=tokens(s.en);const h=tk.reduce((a,b)=>b.length>a.length?b:a,'');G.s4=h;return `<div class="big-word" style="font-size:22px;line-height:1.4">${esc(s.en.replace(h,'____'))}</div><p class="muted" style="text-align:center">${esc(s.es)}</p>`},a:null},
  ];
  const show=()=>{const p=puzzles[G.step];$('gb').innerHTML=`<div class="esc"><div class="esc-door">🚪<div class="esc-code">${code.map((d,i)=>`<span class="${i<G.step?'on':''}">${i<G.step?d:'•'}</span>`).join('')}</div></div><p class="bf-k">${p.t}</p>${p.q()}<input id="ei" class="typein" style="min-height:0;text-align:center;font-size:22px" autocapitalize="off" autocomplete="off" spellcheck="false" onkeydown="if(event.key==='Enter')escTry()"><button class="btn" style="margin-top:12px" onclick="escTry()">Abrir candado</button></div>`;setTimeout(()=>$('ei')?.focus(),200)};
  window.escTry=()=>{const p=puzzles[G.step];const v=$('ei').value;const ans=p.a??G.s4;if(norm(v)===norm(ans)){sfx('coin');P.correct++;G.step++;G.score+=6;if(G.step>=4){const secs=Math.round((Date.now()-G.t0)/1000);$('gb').innerHTML=`<div class="esc"><div class="esc-door open">🚪✨<div class="esc-code">${code.map(d=>`<span class="on">${d}</span>`).join('')}</div></div><p style="text-align:center"><b>¡Escapaste en ${secs} segundos!</b></p></div>`;setTimeout(()=>gameEnd(G.score+Math.max(0,20-Math.floor(secs/10))-G.fails*2,'¡Escapaste!'),1300);return}show()}else{G.fails++;sfx('error');buzz(40);$('ei').value='';$('ei').placeholder=G.fails%2?'Intenta otra vez':'Pista: '+ans.slice(0,2)+'…'}};
  gameShell('Escape room',`<div id="gb"></div>`);show();
}

/* ---------------- vista: yo (personaje, pasaporte, tienda) ---------------- */
const SHOP=[
  {id:'face0',slot:'face',e:'🙂',n:'Clásico',p:0},{id:'face1',slot:'face',e:'😎',n:'Cool',p:60},{id:'face2',slot:'face',e:'🤠',n:'Vaquero',p:80},{id:'face3',slot:'face',e:'🥸',n:'Disfrazado',p:100},{id:'face4',slot:'face',e:'🤓',n:'Estudioso',p:60},{id:'face5',slot:'face',e:'🦊',n:'Zorro',p:150},{id:'face6',slot:'face',e:'🐼',n:'Panda',p:150},{id:'face7',slot:'face',e:'👽',n:'Alien',p:200},
  {id:'hat1',slot:'hat',e:'🎩',n:'Sombrero de copa',p:120},{id:'hat2',slot:'hat',e:'👑',n:'Corona',p:300},{id:'hat3',slot:'hat',e:'🧢',n:'Gorra',p:70},{id:'hat4',slot:'hat',e:'🎓',n:'Birrete',p:150},{id:'hat5',slot:'hat',e:'⛑️',n:'Casco',p:90},
  {id:'fr1',slot:'frame',e:'🟣',n:'Galaxia',p:100,bg:'linear-gradient(135deg,#6a5af9,#d66efd)'},{id:'fr2',slot:'frame',e:'🟠',n:'Atardecer',p:100,bg:'linear-gradient(135deg,#ff9a8b,#ffd29a)'},{id:'fr3',slot:'frame',e:'🟢',n:'Selva',p:100,bg:'linear-gradient(135deg,#11998e,#38ef7d)'},{id:'fr4',slot:'frame',e:'🟡',n:'Oro',p:250,bg:'linear-gradient(135deg,#f7b733,#fff1a8)'},
];
function meView(){
  const w=W(),lv=level();const stamps=UNITS.map(u=>{const pr=placeProgress(u.id);return {u,p:place(u.id),pr}});const got=stamps.filter(s=>s.pr.exam).length;
  return `<div class="me-card">${avatarHTML(86)}<div style="flex:1;min-width:0"><h1>${esc(userName()||'Viajero')}</h1><div class="muted small">Nivel ${lv.lv} · ${S.totals.xp} XP · racha ${streak()} ${streak()===1?'día':'días'}</div><div class="w-bar gold" style="margin-top:8px"><i style="width:${Math.round(lv.into/lv.need*100)}%"></i></div></div></div>
  <div class="kpis" style="margin-top:12px"><div class="kpi"><b style="color:var(--gold)">🪙 ${w.coins}</b><span>Monedas</span></div><div class="kpi"><b>${got}/20</b><span>Sellos</span></div><div class="kpi"><b>${Object.keys(w.boss).length}</b><span>Jefes vencidos</span></div><div class="kpi"><b>${wordsLearned()}</b><span>Palabras</span></div></div>
  ${missionsHTML()}
  <div class="sec"><h2>Pasaporte</h2><span class="muted small">${got} de 20 sellos</span></div>
  <div class="passport">${stamps.map(s=>`<button class="stamp ${s.pr.exam?'got':''} ${s.pr.boss?'gold':''}" onclick="${unitUnlocked(s.u.id)?`openPlace(${s.u.id})`:`lockedPlace(${s.u.id})`}"><span>${s.p.e}</span><small>${esc(s.p.n)}</small>${s.pr.boss?'<i>👑</i>':''}</button>`).join('')}</div>
    <div class="sec"><h2>Tu avatar</h2><span class="muted small">Toca para cambiarlo</span></div>${avatarEditorHTML()}
  <div class="grid2" style="margin-top:16px"><button class="tile-card" onclick="go('stats')"><div class="ti">${ic('star',22)}</div><b>Progreso y logros</b><span>Estadísticas completas</span></button><button class="tile-card" onclick="go('settings')"><div class="ti">${ic('gear',22)}</div><b>Ajustes</b><span>Meta, avisos, voz y tema</span></button></div>`;
}
const AV_LABEL={hair:'Peinado',hairC:'Color de pelo',skin:'Tono de piel',eyes:'Ojos',mouth:'Boca',acc:'Accesorio',bg:'Fondo'};
let avTab='hair';
function avatarEditorHTML(){const a=avState();const k=avTab;const list=k==='skin'?AV.skin:k==='hairC'?AV.hairC:k==='bg'?AV.bg:AV[k];
  return `<div class="ave"><div class="ave-prev">${avatarSVG(120)}</div><div class="ave-tabs">${Object.keys(AV_LABEL).map(t=>`<button class="${t===k?'on':''}" onclick="avTab='${t}';render()">${AV_LABEL[t]}</button>`).join('')}</div>
  <div class="ave-opts">${list.map((v,i)=>{const own=avOwned(k,i),on=a[k]===i,price=(AV_PRICE[k]||[])[i]||0;const prev={...a,[k]:i};const sw=['skin','hairC','bg'].includes(k);
    return `<button class="ave-o ${on?'on':''}" onclick="avPick('${k}',${i})">${sw?`<span class="ave-sw" style="background:${v}"></span>`:avatarSVG(56,prev,false)}<small>${on?'Puesto':own?(sw?'':esc(v)):'🪙 '+price}</small></button>`}).join('')}</div></div>`}
function avPick(k,i){const w=W(),a=avState();if(!avOwned(k,i)){const p=AV_PRICE[k][i];if(w.coins<p){sfx('error');return toast(`Te faltan ${p-w.coins} monedas`,'think')}w.coins-=p;w.avOwn[k+i]=1;sfx('coin');confetti();toast('¡Lo compraste!','celebrate')}else sfx('toggle');a[k]=i;save();render()}
function buy(){} function equip(){}

/* ---------------- vista: escuela de Alex ---------------- */
function kikoView(){
  const due=srsDue().length,weak=srsWeak().length;
  return `<div class="kk-hero">${kikoSVG(92,'wave')}<div><h1>Escuela de Alex</h1><p>Repasa, platica y resuelve dudas.</p></div></div><div class="grid2">
  <button class="tile-card wide hero" onclick="startReview()"><div class="ti">${ic('brain',24)}</div><div><b>Repaso del día</b><br><span>${due?`${due} ${due===1?'cosa lista':'cosas listas'} para repasar`:'Al día. Repasa lo aprendido'}</span></div></button>
  <button class="tile-card wide" onclick="openTutor()"><div class="ti">${kikoSVG(40,'talk')}</div><div><b>Platica con Alex</b><br><span>Conversa en inglés, te corrige y te dice cómo mejorar</span></div></button>
  <button class="tile-card" onclick="practiceSpeak()"><div class="ti">${ic('mic',22)}</div><b>Pronunciación</b><span>Di frases en voz alta</span></button>
  <button class="tile-card" onclick="practiceWeak()"><div class="ti">${ic('target',22)}</div><b>Palabras difíciles</b><span>${weak?weak+' por reforzar':'Las que más fallas'}</span></button>
  <button class="tile-card" onclick="openGrammar()"><div class="ti">${ic('book',22)}</div><b>Gramática</b><span>${REF.grammar.length} temas y comparaciones</span></button>
  <button class="tile-card" onclick="go('dict')"><div class="ti">${ic('search',22)}</div><b>Diccionario</b><span>Busca cualquier palabra</span></button>
  </div>`;
}

/* ---------------- bienvenida a Brightvale ---------------- */
function worldIntro(){if(W().intro)return;W().intro=true;save();openSheet(`<div style="text-align:center">${head('','')}<div style="font-size:64px;line-height:1">🌆</div><h2 style="margin:8px 0">Bienvenido a Brightvale</h2><p class="muted">Acabas de llegar a una ciudad donde todos hablan inglés. Visita cada lugar, cumple encargos, vive su historia y vence a su jefe.</p><p class="muted">Junta los <b>20 sellos</b> de tu pasaporte y gana monedas para personalizar a tu viajero.</p><button class="btn" onclick="closeSheet();openPlace(${currentUnit()})">${ic('play',18)} Empezar a explorar</button></div>`)}

/* ---------------- conectar con la navegación ---------------- */
VIEWS.length=0;VIEWS.push(['city','Ciudad','map'],['arcade','Arcade','game'],['kiko','Alex','chat'],['me','Yo','user']);
IC.map='<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/>';
IC.game='<rect x="2" y="7" width="20" height="11" rx="5"/><path d="M7 11v3M5.5 12.5h3"/><circle cx="15.5" cy="11.5" r="1"/><circle cx="18" cy="13.5" r="1"/>';
const _render=render;
render=function(){
  if(view==='learn'||view==='practice')view=view==='learn'?'city':'arcade';
  const fns={city:cityView,place:placeView,arcade:arcadeView,kiko:kikoView,me:meView};
  if(fns[view]){const m=$('main');m.innerHTML=(view==='place'?'':topbar())+fns[view]();m.classList.remove('fade');void m.offsetWidth;m.classList.add('fade');if(view==='city')setTimeout(()=>{const h=document.querySelector('.w-place.here');if(h&&!window.__scrolledC){window.__scrolledC=1}},60);return}
  _render();
};
const _buildNav=buildNav;
buildNav=function(){const v=view==='place'?'city':['dict'].includes(view)?'kiko':['stats','settings'].includes(view)?'me':view;
  $('nav').innerHTML=VIEWS.map(x=>`<button class="${v===x[0]?'on':''}" onclick="go('${x[0]}')">${ic(x[2],23)}<span>${x[1]}</span></button>`).join('');
  $('side').innerHTML=`<div class="brand">${kikoSVG(42,'idle')} Fluent</div>`+VIEWS.concat([['settings','Ajustes','gear']]).map(x=>`<button class="nv ${v===x[0]?'on':''}" onclick="go('${x[0]}')">${ic(x[2],21)} ${x[1]}</button>`).join('')};
view='city';
// Al terminar un encargo, examen o jefe dentro de un lugar, regresa al lugar.
const _start=start;start=async function(u){await _start(u);if(S&&!W().intro)setTimeout(worldIntro,600)};

// El arranque (boot) está al final de js/study.js.
