// Fluent — nivel adaptativo: examen de colocación (sube o baja según contestas), medición continua
// de vocabulario, gramática, escuchar y hablar, dificultad automática y recomendaciones para ti.
// También agrega juegos interactivos con dibujos: burbujas, arrastrar y memorama ilustrado.
const SKILLS=[['vocab','Vocabulario','book'],['grammar','Gramática','target'],['listen','Escuchar','ear'],['speak','Hablar','mic']];
const CEFR=['A1','A2','B1','B2','C1'];
const CEFR_ES={A1:'Principiante',A2:'Básico',B1:'Intermedio',B2:'Intermedio alto',C1:'Avanzado'};
const CEFR_UNIT={A1:1,A2:7,B1:12,B2:16,C1:20};
function AD(){const w=W();w.ad=w.ad||{sk:{vocab:[],grammar:[],listen:[],speak:[]},lv:null,placed:null};return w.ad}
function record(skill,ok){const a=AD();const arr=a.sk[skill]||(a.sk[skill]=[]);arr.push(ok?1:0);if(arr.length>40)arr.shift()}
function skillPct(k){const arr=AD().sk[k]||[];if(arr.length<4)return null;const recent=arr.slice(-25);return Math.round(recent.reduce((x,y)=>x+y,0)/recent.length*100)}
// Nivel estimado: lo que salió en el examen de colocación, ajustado por cómo vas contestando.
function myLevel(){const a=AD();let i=a.lv!=null?a.lv:Math.max(0,Math.min(4,CEFR.indexOf((unitById(currentUnit())||{}).level||'A1')));
  const ps=SKILLS.map(s=>skillPct(s[0])).filter(x=>x!=null);if(ps.length>=2){const avg=ps.reduce((x,y)=>x+y,0)/ps.length;if(avg>=88&&i<4)i+=0.5;if(avg<55&&i>0)i-=0.5}
  return Math.max(0,Math.min(4,i))}
function levelName(){return CEFR[Math.round(myLevel())]}
// Dificultad 1 (fácil) a 3 (difícil) para ajustar opciones y tiempos.
function diff(){const l=myLevel();const ps=SKILLS.map(s=>skillPct(s[0])).filter(x=>x!=null);const avg=ps.length?ps.reduce((x,y)=>x+y,0)/ps.length:70;
  let d=l<1?1:l<2.5?2:3;if(avg>=90)d=Math.min(3,d+1);if(avg<55)d=Math.max(1,d-1);return d}
function bossTime(){return [14,11,8][diff()-1]}

/* ---------------- registrar resultados en cada tipo de ejercicio ---------------- */
const _markA=mark;
mark=function(ok,title,detail){try{const t=cur&&cur.type||'';record(/listen|hear|dict/i.test(t)?'listen':/speak/i.test(t)?'speak':/order|build|sent|tiles|fill/i.test(t)?'grammar':'vocab',ok)}catch(e){}return _markA(ok,title,detail)};
const _gxCheckA=gxCheck;
gxCheck=function(){const x=GX&&GX.items[GX.i];const before=P?P.correct:0;const r=_gxCheckA();if(x&&P&&!GX.skip){const ok=P.correct>before;const k={c:'grammar',o:'grammar',p:'grammar',l:'listen',m:'listen',s:'speak'}[x[0]];if(k)record(k,ok)}save();return r};
const _vocabQuizA=vocabQuiz;
vocabQuiz=function(id){_vocabQuizA(id);const f=window.vqA;window.vqA=(el,good)=>{record(document.querySelector('.big-listen')?'listen':'vocab',good);f(el,good)}};
const _bfAnsA=bfAns;bfAns=function(el,ok){record(B&&B.qs[B.i]&&B.qs[B.i].listen?'listen':'vocab',ok);return _bfAnsA(el,ok)};
const _stPickA=stPick;stPick=function(el,ok){record('listen',ok);return _stPickA(el,ok)};

/* ---------------- examen de colocación adaptativo ---------------- */
let PL=null;
function placementPool(){
  const pool={A1:[],A2:[],B1:[],B2:[],C1:[]};
  GRAM.forEach(g=>g.x.filter(x=>x[0]==='c').forEach(x=>pool[g.lv]&&pool[g.lv].push({t:'g',q:x[1],o:x[2],a:x[3]})));
  // Vocabulario de los cursos según su nivel
  UNITS.forEach(u=>{const lv=u.level;if(!pool[lv])return;u.lessons.forEach(l=>l.words.slice(0,2).forEach(w=>pool[lv].push({t:'v',w,unit:u.id})))});
  return pool}
function startPlacement(){
  PL={pool:placementPool(),lv:1,n:0,max:20,hist:[],used:new Set()};
  $('player').classList.add('open');document.body.style.overflow='hidden';
  P={mode:'game',i:0,total:PL.max,answered:0,correct:0,wrong:0,combo:0,maxCombo:0,start:Date.now(),queue:[],retried:new Set()};
  $('pBtn').style.display='none';$('pFoot').className='p-foot';$('pFb').innerHTML='';plNext();
}
function plNext(){
  $('pBar').style.width=Math.round(PL.n/PL.max*100)+'%';
  if(PL.n>=PL.max)return plEnd();
  const lv=CEFR[PL.lv];const cands=PL.pool[lv].filter((q,i)=>!PL.used.has(lv+i));const idx=Math.floor(Math.random()*cands.length);const q=cands[idx];PL.used.add(lv+PL.pool[lv].indexOf(q));PL.q=q;
  let html,opts;
  if(q.t==='g'){opts=q.o.map((o,k)=>({o,k}));html=`<div class="p-q">Elige la opción correcta</div><div class="g-sent">${esc(q.q).replace('___','<span class="g-gap">____</span>')}</div>`;PL.a=q.a}
  else{const ws=UNITS.filter(u=>Math.abs(u.id-q.unit)<=2).flatMap(u=>u.lessons.flatMap(l=>l.words));const d=distractors(q.w.es,ws,3,'es');opts=shuffle([q.w.es,...d]).map((o,k)=>({o,k}));PL.a=opts.findIndex(x=>x.o===q.w.es);html=`<div class="p-q">¿Qué significa?</div><div class="big-word">${esc(enMain(q.w.en))}</div>`}
  $('pBody').innerHTML=`<p class="bf-k">Examen de nivel · ${PL.n+1} de ${PL.max}</p>${html}<div class="opts">${opts.map(x=>`<button class="opt" onclick="plAns(${x.k})">${esc(x.o)}</button>`).join('')}</div><p class="muted small" style="text-align:center;margin-top:14px">Si no sabes, no adivines: el examen se adapta a ti.</p><button class="linkb" style="display:block;margin:6px auto" onclick="plAns(-1)">No lo sé</button>`;
}
function plAns(k){const ok=k===PL.a;PL.hist.push({lv:PL.lv,ok});PL.n++;P.answered=PL.n;if(ok){P.correct++;sfx('ok')}else{sfx('toggle')}
  // Sube de nivel con 2 aciertos seguidos en el nivel; baja con un error.
  const last=PL.hist.slice(-2);if(ok&&last.length===2&&last.every(h=>h.ok&&h.lv===PL.lv)&&PL.lv<4)PL.lv++;else if(!ok&&PL.lv>0)PL.lv--;
  plNext()}
function plEnd(){
  // Nivel final: el más alto donde acertó al menos 60% (con 2 preguntas o más).
  let res=0;for(let i=0;i<5;i++){const h=PL.hist.filter(x=>x.lv===i);if(h.length>=2&&h.filter(x=>x.ok).length/h.length>=.6)res=i}
  const a=AD();a.lv=res;a.placed=today();save(true);
  const L=CEFR[res];P.gameXP=20;P.answered=PL.max;_finishSession();
  $('pBody').querySelector('h2').textContent=`Tu nivel: ${L} · ${CEFR_ES[L]}`;
  const ex=document.createElement('div');ex.className='card';ex.innerHTML=`<b>${{A1:'Empieza desde lo básico, vas a avanzar rápido.',A2:'Ya entiendes lo básico. Vamos por más.',B1:'Ya te defiendes en inglés. Toca pulir y hablar más.',B2:'Tienes muy buen nivel. Vamos por fluidez y detalles.',C1:'Nivel avanzado. A perfeccionar.'}[L]}</b><div class="muted small" style="margin-top:6px">Te recomiendo empezar en <b>${esc(place(CEFR_UNIT[L]).n)}</b>. La app irá ajustando la dificultad según cómo contestes.</div>${CEFR_UNIT[L]>1&&!unitUnlocked(CEFR_UNIT[L])?`<button class="btn" style="margin-top:12px" onclick="endPlayer();startSkipTest(${CEFR_UNIT[L]})">Hacer la prueba para saltar hasta ahí</button>`:''}`;
  $('pBody').querySelector('.result').appendChild(ex);
}

/* ---------------- tarjeta "Tu nivel" y recomendaciones ---------------- */
function levelCardHTML(){
  const a=AD();const L=levelName();const lvls=CEFR.map((c,i)=>`<span class="${i<=Math.round(myLevel())?'on':''}">${c}</span>`).join('');
  const sk=SKILLS.map(([k,n,icn])=>{const p=skillPct(k);return `<div class="sk"><span class="sk-i">${ic(icn,16)}</span><span class="sk-n">${n}</span><div class="w-bar"><i style="width:${p??0}%;background:${p==null?'var(--s3)':p>=80?'var(--good)':p>=60?'var(--gold)':'var(--bad)'}"></i></div><b>${p==null?'—':p+'%'}</b></div>`}).join('');
  const weak=SKILLS.map(([k,n])=>({k,n,p:skillPct(k)})).filter(x=>x.p!=null).sort((x,y)=>x.p-y.p)[0];
  const rec={vocab:['Repasa vocabulario con dibujos',`openVocab('${VOC[Math.floor(Math.random()*VOC.length)].id}')`],grammar:['Practica gramática de tu nivel',`runGram('${(GRAM.find(g=>g.lv===L)||GRAM[0]).id}')`],listen:['Entrena tu oído',`practiceSnd('${SND[Math.floor(Math.random()*SND.length)].id}')`],speak:['Practica hablando',`practiceSit('${SIT[Math.floor(Math.random()*SIT.length)].id}')`]};
  return `<div class="lvc"><div class="lvc-top"><div><small>Tu nivel estimado</small><h2>${L} <em>${CEFR_ES[L]}</em></h2></div><div class="lvc-steps">${lvls}</div></div>${sk}
  ${weak&&weak.p<85?`<button class="lvc-rec" onclick="${rec[weak.k][1]}">${ic('target',18)}<span><small>Recomendado para ti · tu punto más débil es ${weak.n.toLowerCase()}</small><b>${rec[weak.k][0]}</b></span>${ic('play',18)}</button>`:''}
  <button class="linkb" style="margin-top:10px" onclick="startPlacement()">${a.placed?'Volver a medir mi nivel':'Hacer examen de nivel (5 minutos)'}</button></div>`;
}
const _studyViewA=studyView;
studyView=function(){const html=_studyViewA();return html.replace('<h1 class="title">Aprende</h1>','<h1 class="title">Aprende</h1>'+levelCardHTML())};
const _cityViewA=cityView;
cityView=function(){const a=AD();const html=_cityViewA();if(a.placed)return html;return html.replace('<div class="w-missions">',`<button class="pl-cta" onclick="startPlacement()"><span>${ic('target',22)}</span><span style="flex:1;text-align:left"><b>¿Cuál es tu nivel de inglés?</b><small>Haz el examen de 5 minutos y la app se adapta a ti</small></span>${ic('play',20)}</button><div class="w-missions">`)};

/* ---------------- juegos interactivos con dibujos ---------------- */
const _vocabViewA=vocabView;
vocabView=function(){const c=VOC.find(x=>x.id===curVocab);let html=_vocabViewA();if(!c)return html;
  return html.replace('<div class="v-words">',`<div class="vg-row"><button class="vg" onclick="vgBubbles('${c.id}')"><span>🫧</span><b>Burbujas</b><small>Escucha y revienta</small></button><button class="vg" onclick="vgDrag('${c.id}')"><span>🧲</span><b>Arrastra</b><small>Une palabra y dibujo</small></button><button class="vg" onclick="vgMemo('${c.id}')"><span>🃏</span><b>Memorama</b><small>Dibujo y palabra</small></button></div><div class="v-words">`)};
function vgShell(title,inner){$('player').classList.add('open');document.body.style.overflow='hidden';
  P={mode:'game',i:0,total:1,answered:0,correct:0,wrong:0,combo:0,maxCombo:0,start:Date.now(),queue:[],retried:new Set()};
  $('pBtn').style.display='none';$('pFoot').className='p-foot';$('pFb').innerHTML='';$('pBody').innerHTML=`<div class="p-q">${title}</div>${inner}`}
function vgEnd(id,ok,total,label){const pct=Math.round(ok/Math.max(1,total)*100);const sw=SW();sw.vocab[id]=Math.max(sw.vocab[id]||0,pct);dayCount('game');P.gameXP=Math.min(30,ok*2);P.answered=total;P.correct=ok;_finishSession();$('pBody').querySelector('h2').textContent=label}
// Burbujas: escuchas una palabra y revientas la burbuja con su dibujo antes de que se escape.
function vgBubbles(id){
  const c=VOC.find(x=>x.id===id);const ws=c.words;const goal=10;const speed=[22,32,44][diff()-1];let ok=0,n=0,lives=3,target=null,items=[],raf,last=0;
  vgShell(`Burbujas <span style="float:right" id="vbL">❤️❤️❤️</span>`,`<div class="vb-top"><button class="vb-say" id="vbS">${ic('speaker',22)} Escuchar</button><span>Aciertos: <b id="vbN">0</b>/${goal}</span></div><div class="vb" id="vb"></div>`);
  const box=$('vb');const say=()=>{if(target)speak(target.en)};$('vbS').onclick=say;
  const newT=()=>{target=pick(ws,1)[0];setTimeout(say,200)};
  const spawn=()=>{const hasT=items.some(i=>i.w.en===target.en);const w=!hasT&&Math.random()<.55?target:pick(ws,1)[0];const el=document.createElement('button');el.className='bub';el.innerHTML=picHTML(w.pic,40);el.style.left=(4+Math.random()*72)+'%';box.appendChild(el);
    const it={el,w,y:box.clientHeight+10,sp:speed*(.8+Math.random()*.5),wob:Math.random()*6};items.push(it);
    el.onclick=()=>{if(it.w.en===target.en){ok++;n++;P.correct++;$('vbN').textContent=ok;sfx('done');record('listen',true);srsAdd({en:w.en,es:w.es,lesson:'v-'+id},'w');el.classList.add('pop');items=items.filter(x=>x!==it);setTimeout(()=>el.remove(),300);if(ok>=goal)return fin();newT()}else{sfx('error');buzz(30);record('listen',false);el.classList.add('bad');lose()}}};
  const lose=()=>{lives--;$('vbL').textContent='❤️'.repeat(Math.max(0,lives))+'🤍'.repeat(3-Math.max(0,lives));if(lives<=0)fin()};
  const fin=()=>{cancelAnimationFrame(raf);items.forEach(i=>i.el.remove());vgEnd(id,ok,Math.max(goal,ok+3-lives),ok>=goal?'¡Reventaste todas!':`${ok} aciertos`)};
  let prev=performance.now();const step=t=>{if(!$('vb'))return;const dt=(t-prev)/1000;prev=t;if(t-last>[1300,1000,800][diff()-1]){last=t;spawn()}
    items=items.filter(it=>{it.y-=it.sp*dt;it.el.style.transform=`translate(${Math.sin(t/600+it.wob)*10}px,${it.y}px)`;if(it.y<-70){it.el.remove();if(it.w.en===target.en){lose();newT()}return false}return true});raf=requestAnimationFrame(step)};
  G={raf:0};newT();raf=requestAnimationFrame(step);G.raf=raf;
}
// Arrastra: une cada palabra con su dibujo arrastrándola (o tocando palabra y luego dibujo).
function vgDrag(id){
  const c=VOC.find(x=>x.id===id);let round=0,ok=0,miss=0;const rounds=3,per=[3,4,5][diff()-1];
  vgShell('Arrastra cada palabra a su dibujo',`<p class="muted small" style="margin:-6px 0 10px">También puedes tocar la palabra y luego el dibujo.</p><div id="dg"></div>`);
  const show=()=>{if(round>=rounds)return vgEnd(id,ok,rounds*per,miss===0?'¡Perfecto, sin errores!':`${ok} parejas`);
    const ws=pick(c.words,per);const words=shuffle(ws);
    $('dg').innerHTML=`<div class="dg-pics">${ws.map((w,i)=>`<div class="dg-slot" data-en="${esc(w.en)}">${picHTML(w.pic,52)}<span class="dg-drop"></span></div>`).join('')}</div><div class="dg-words">${words.map(w=>`<button class="dg-w" data-en="${esc(w.en)}">${esc(w.en)}</button>`).join('')}</div>`;
    let sel=null,left=per;
    const place=(btn,slot)=>{if(slot.classList.contains('done'))return;if(slot.dataset.en===btn.dataset.en){slot.classList.add('done');slot.querySelector('.dg-drop').textContent=btn.dataset.en;btn.remove();ok++;P.correct++;sfx('done');speak(btn.dataset.en);record('vocab',true);srsAdd({en:btn.dataset.en,es:(c.words.find(w=>w.en===btn.dataset.en)||{}).es||'',lesson:'v-'+id},'w');if(--left===0){round++;setTimeout(show,700)}}else{miss++;sfx('error');buzz(30);record('vocab',false);slot.classList.add('no');setTimeout(()=>slot.classList.remove('no'),400)}};
    document.querySelectorAll('.dg-w').forEach(b=>{
      b.onclick=()=>{document.querySelectorAll('.dg-w').forEach(x=>x.classList.remove('sel'));sel=b;b.classList.add('sel');speak(b.dataset.en)};
      b.onpointerdown=e=>{const r=b.getBoundingClientRect();const ghost=b.cloneNode(true);ghost.classList.add('ghost');ghost.style.width=r.width+'px';document.body.appendChild(ghost);let moved=false;
        const mv=ev=>{moved=true;ghost.style.left=(ev.clientX-r.width/2)+'px';ghost.style.top=(ev.clientY-24)+'px'};
        const up=ev=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);ghost.remove();if(!moved)return;const el=document.elementFromPoint(ev.clientX,ev.clientY);const slot=el&&el.closest('.dg-slot');if(slot)place(b,slot)};
        mv(e);moved=false;addEventListener('pointermove',mv);addEventListener('pointerup',up)}});
    document.querySelectorAll('.dg-slot').forEach(s=>s.onclick=()=>{if(sel){place(sel,s);sel=null}});
  };show();
}
// Memorama ilustrado: parejas de dibujo y palabra.
function vgMemo(id){
  const c=VOC.find(x=>x.id===id);const n=[4,6,8][diff()-1];const ws=pick(c.words,n);const cards=shuffle(ws.flatMap((w,i)=>[{k:i,pic:w.pic},{k:i,t:w.en}]));let open=[],found=0,moves=0;
  vgShell(`Memorama <span style="float:right" class="small muted" id="vmM">0 movimientos</span>`,`<div class="memo" style="grid-template-columns:repeat(4,1fr)">${cards.map((x,i)=>`<button class="mc" data-k="${x.k}"><span class="mf">?</span><span class="mb ${x.t?'en':''}">${x.t?esc(x.t):picHTML(x.pic,44)}</span></button>`).join('')}</div>`);
  document.querySelectorAll('.memo .mc').forEach(el=>el.onclick=()=>{if(el.classList.contains('flip')||open.length>=2)return;el.classList.add('flip');sfx('toggle');const w=ws[+el.dataset.k];speak(w.en);open.push(el);
    if(open.length===2){moves++;$('vmM').textContent=moves+' movimientos';const [a,b]=open;if(a.dataset.k===b.dataset.k){setTimeout(()=>{a.classList.add('ok');b.classList.add('ok');sfx('done');open=[];found++;P.correct++;record('vocab',true);if(found===n)vgEnd(id,n,n+Math.max(0,moves-n),`¡Listo en ${moves} movimientos!`)},350)}else{record('vocab',false);setTimeout(()=>{a.classList.remove('flip');b.classList.remove('flip');open=[]},900)}}});
}

boot();
