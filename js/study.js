// Fluent — pestaña "Aprende": diccionario con dibujos (vocabulario básico por temas),
// gramática en acción estilo Cambridge (elegir, ordenar palabras) y escenas "What are they doing?".
const VOC=(window.VOCAB||[]).map(c=>({...c,words:c.w.map(s=>{const [pic,en,es]=s.split('|');return {pic,en,es,cat:c.id}})}));
const GRAM=window.GRAMMAR||[];
// Las palabras del diccionario visual también aparecen en la búsqueda del diccionario.
VOC.forEach(c=>c.words.forEach(w=>{if(!ALL_WORDS.some(x=>x.en.toLowerCase()===w.en.toLowerCase()))ALL_WORDS.push({en:w.en,es:w.es,pos:'noun',ex_en:'',ex_es:'',lesson:'v-'+c.id,unit:1,pic:w.pic})}));
function SW(){const w=W();w.vocab=w.vocab||{};w.gram=w.gram||{};return w}
const isHex=p=>/^#[0-9a-f]{6}$/i.test(p);
function picHTML(p,size=44){return isHex(p)?`<span class="v-sw" style="background:${p};width:${size}px;height:${size}px"></span>`:`<span class="v-pic" style="font-size:${size}px">${p}</span>`}
const sayJS=t=>`speak('${esc(t).replace(/'/g,"\\'")}')`;

/* ---------------- vista principal ---------------- */
let curVocab=null;
function studyView(){
  const sw=SW();const vDone=VOC.filter(c=>sw.vocab[c.id]>=80).length;const gDone=GRAM.filter(g=>sw.gram[g.id]>=80).length;
  const scenes=GRAM.flatMap(g=>g.x.filter(x=>x[0]==='p')).length;
  return `<h1 class="title">Aprende</h1>
  <button class="v-scene-hero" onclick="startScenes()"><span class="v-sh-pics">👩🍳👨📖</span><span style="flex:1;text-align:left"><small>Escenas con dibujos</small><b>What are they doing?</b><em>Mira el dibujo y acomoda las palabras · ${scenes} escenas</em></span>${ic('play',24)}</button>
  <div class="sec"><h2>Diccionario con dibujos</h2><span class="muted small">${vDone}/${VOC.length} temas dominados</span></div>
  <div class="v-grid">${VOC.map(c=>{const b=sw.vocab[c.id]||0;return `<button class="v-cat" style="--c:${c.c}" onclick="openVocab('${c.id}')"><span class="v-ce">${c.e}</span><b>${esc(c.n)}</b><small>${esc(c.en)} · ${c.words.length}</small>${b?`<i class="v-best ${b>=80?'ok':''}">${b}%</i>`:''}</button>`}).join('')}</div>
  <div class="sec"><h2>Gramática en acción</h2><span class="muted small">Estilo Cambridge · ${gDone}/${GRAM.length}</span></div>
  ${['A1','A2','B1','B2'].map(lv=>{const gs=GRAM.filter(g=>g.lv===lv);if(!gs.length)return '';return `<div class="g-lv"><span>${lv}</span><em>${{A1:'Principiante',A2:'Básico',B1:'Intermedio',B2:'Intermedio alto'}[lv]}</em></div><div class="list">${gs.map(g=>{const b=sw.gram[g.id]||0;return `<div class="li" onclick="openGram('${g.id}')"><span class="g-e">${g.e}</span><div class="mid"><div class="t">${esc(g.n)}</div><div class="s">${esc(g.es)}</div></div>${b?`<span class="g-best ${b>=80?'ok':''}">${b}%</span>`:ic('play',18)}</div>`}).join('')}</div>`}).join('')}`;
}

/* ---------------- un tema de vocabulario ---------------- */
function openVocab(id){curVocab=id;sfx('open');view='vocab';buildNav();render();scrollTo({top:0})}
function vocabView(){
  const c=VOC.find(x=>x.id===curVocab);if(!c)return studyView();const b=SW().vocab[c.id]||0;
  return `<div class="v-head" style="--c:${c.c}"><button class="w-back" onclick="go('study')" aria-label="Volver">${ic('close',18)}</button><div class="v-he">${c.e}</div><small>${esc(c.en)}</small><h1>${esc(c.n)}</h1><p>${c.words.length} palabras · toca una para escucharla${b?` · tu mejor: ${b}%`:''}</p>
  <div class="v-actions"><button class="btn" onclick="vocabCards('${c.id}')">${ic('book',18)} Tarjetas</button><button class="btn alt" onclick="vocabQuiz('${c.id}')">${ic('bolt',18)} Jugar</button></div></div>
  <div class="v-words">${c.words.map(w=>`<button class="v-word" onclick="${sayJS(w.en)}">${picHTML(w.pic,46)}<b>${esc(w.en)}</b><small>${esc(w.es)}</small></button>`).join('')}</div>`;
}
function vocabCards(id){
  const c=VOC.find(x=>x.id===id);let i=0;const ws=c.words;
  $('player').classList.add('open');document.body.style.overflow='hidden';
  P={mode:'game',i:0,total:ws.length,answered:0,correct:0,wrong:0,combo:0,maxCombo:0,start:Date.now(),queue:[],retried:new Set()};
  $('pFoot').className='p-foot';$('pFb').innerHTML='';const b=$('pBtn');b.style.display='';b.className='btn';b.disabled=false;
  const show=()=>{const w=ws[i];$('pBar').style.width=Math.round(i/ws.length*100)+'%';
    $('pBody').innerHTML=`<p class="bf-k">${esc(c.n)} · ${i+1} de ${ws.length}</p><button class="fc" id="fc" onclick="this.classList.toggle('flip');${sayJS(w.en)}"><span class="fc-f">${picHTML(w.pic,120)}<em>¿Cómo se dice en inglés?</em></span><span class="fc-b">${picHTML(w.pic,70)}<b>${esc(w.en)}</b><small>${esc(w.es)}</small></span></button><div class="big-listen" style="margin-top:14px"><button onclick="${sayJS(w.en)}">${ic('speaker',34)}</button><button class="slow" onclick="speak('${esc(w.en).replace(/'/g,"\\'")}',{slow:true})">${ic('turtle',28)}</button></div>`;
    b.textContent=i<ws.length-1?'Siguiente':'Terminar'};
  b.onclick=()=>{srsAdd({en:ws[i].en,es:ws[i].es,lesson:'v-'+id},'w');i++;P.answered=i;if(i>=ws.length){P.gameXP=8;P.correct=ws.length;b.onclick=footAction;_finishSession();$('pBody').querySelector('h2').textContent='¡Repasaste todo el tema!';return}show()};
  show();
}
function vocabQuiz(id){
  const c=VOC.find(x=>x.id===id);const pool=c.words;const qs=pick(pool,Math.min(10,pool.length));let i=0,ok=0;
  $('player').classList.add('open');document.body.style.overflow='hidden';
  P={mode:'game',i:0,total:qs.length,answered:0,correct:0,wrong:0,combo:0,maxCombo:0,start:Date.now(),queue:[],retried:new Set()};
  $('pBtn').style.display='none';$('pFoot').className='p-foot';$('pFb').innerHTML='';
  const others=w=>pick(pool.filter(x=>x.en!==w.en),3);
  const show=()=>{$('pBar').style.width=Math.round(i/qs.length*100)+'%';if(i>=qs.length)return end();const w=qs[i];const kind=i%3;
    let q,opts;
    if(kind===0){q=`<div class="vq-pic">${picHTML(w.pic,110)}</div><p class="bf-k">¿Cómo se dice en inglés?</p>`;opts=shuffle([w,...others(w)]).map(o=>`<button class="opt" onclick="vqA(this,${o.en===w.en})">${esc(o.en)}</button>`).join('')}
    else if(kind===1){q=`<div class="big-listen"><button onclick="${sayJS(w.en)}">${ic('speaker',40)}</button></div><p class="bf-k">Escucha y toca el dibujo</p>`;opts=shuffle([w,...others(w)]).map(o=>`<button class="opt vq-o" onclick="vqA(this,${o.en===w.en})">${picHTML(o.pic,54)}</button>`).join('');setTimeout(()=>speak(w.en),250)}
    else{q=`<div class="big-word">${esc(w.es)}</div><p class="bf-k">Elige la palabra en inglés</p>`;opts=shuffle([w,...others(w)]).map(o=>`<button class="opt" onclick="vqA(this,${o.en===w.en})">${esc(o.en)}</button>`).join('')}
    $('pBody').innerHTML=`<p class="bf-k">${esc(c.n)} · ${i+1} de ${qs.length}</p>${q}<div class="opts two">${opts}</div>`};
  window.vqA=(el,good)=>{document.querySelectorAll('.opts .opt').forEach(b=>b.disabled=true);const w=qs[i];
    if(good){ok++;P.correct++;el.classList.add('right');sfx('done');srsAdd({en:w.en,es:w.es,lesson:'v-'+id},'w')}else{el.classList.add('wrong');P.wrong++;sfx('error');buzz(30);document.querySelectorAll('.opts .opt').forEach(b=>{if(b.getAttribute('onclick').includes('true'))b.classList.add('right')})}
    speak(w.en);i++;P.answered=i;setTimeout(show,good?700:1500)};
  const end=()=>{const pct=Math.round(ok/qs.length*100);const sw=SW();const prev=sw.vocab[id]||0;sw.vocab[id]=Math.max(prev,pct);dayCount('game');if(pct>=80&&prev<80)addCoins(15);P.gameXP=Math.round(ok*1.5);_finishSession();$('pBody').querySelector('h2').textContent=pct>=80?`¡Dominas ${c.n}!`:`${ok} de ${qs.length} correctas`};
  show();
}

/* ---------------- gramática en acción ---------------- */
function openGram(id){const g=GRAM.find(x=>x.id===id);const b=SW().gram[id]||0;
  openSheet(head(`${g.e} ${esc(g.n)}`,`${g.lv} · ${esc(g.es)}`)+`<div class="tipbox"><b>${ic('book',16)} Así se usa</b>${esc(g.tip)}</div>
  <div class="list" style="margin-bottom:16px">${g.x.filter(x=>x[0]==='o'||x[0]==='p').slice(0,3).map(x=>{const en=x[0]==='o'?x[1]:x[3],es=x[0]==='o'?x[2]:x[4];return `<div class="li" onclick="${sayJS(en)}"><span style="color:var(--blue)">${ic('speaker',18)}</span><div class="mid"><div class="t">${esc(en)}</div><div class="s">${esc(es)}</div></div></div>`}).join('')}</div>
  <button class="btn" onclick="closeSheet();runGram('${id}')">${b?'Practicar otra vez':'Practicar'} · ${g.x.length} ejercicios</button>`)}
function startScenes(){const items=shuffle(GRAM.flatMap(g=>g.x.filter(x=>x[0]==='p'))).slice(0,8);runItems(items,'Escenas: What are they doing?',null)}
function runGram(id){const g=GRAM.find(x=>x.id===id);runItems(shuffle(g.x),g.n,id)}
let GX=null;
const gTok=s=>s.replace(/[.,!?]/g,'').split(/\s+/).filter(Boolean);
function runItems(items,title,gid){
  GX={items,i:0,ok:0,title,gid};
  $('player').classList.add('open');document.body.style.overflow='hidden';
  P={mode:'game',i:0,total:items.length,answered:0,correct:0,wrong:0,combo:0,maxCombo:0,start:Date.now(),queue:[],retried:new Set()};
  gxShow();
}
function gxFoot(label,en,fn){const b=$('pBtn');b.style.display='';b.className='btn';b.textContent=label;b.disabled=!en;b.onclick=fn}
function gxShow(){
  $('pFoot').className='p-foot';$('pFb').innerHTML='';$('pBar').style.width=Math.round(GX.i/GX.items.length*100)+'%';
  if(GX.i>=GX.items.length)return gxEnd();
  const x=GX.items[GX.i];const top=`<p class="bf-k">${esc(GX.title)} · ${GX.i+1} de ${GX.items.length}</p>`;
  if(x[0]==='c'){
    $('pBody').innerHTML=top+`<div class="p-q">Elige la opción correcta</div><div class="g-sent">${esc(x[1]).replace('___','<span class="g-gap" id="gGap">____</span>')}</div><div class="opts">${x[2].map((o,k)=>`<button class="opt" data-k="${k}" onclick="gxPick(this)">${esc(o)}</button>`).join('')}</div>`;
    GX.sel=null;gxFoot('Comprobar',false,gxCheck);
  }else{
    const isP=x[0]==='p';const ans=isP?x[3]:x[1],es=isP?x[4]:x[2];const tk=gTok(ans);
    let sh=shuffle(tk);for(let k=0;k<8&&sh.join(' ')===tk.join(' ');k++)sh=shuffle(tk);
    $('pBody').innerHTML=top+(isP?`<div class="g-scene">${[...new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(x[1])].map(s=>`<span>${s.segment}</span>`).join('')}</div><div class="g-ask"><button class="g-ask-btn" onclick="${sayJS(x[2])}">${ic('speaker',18)}</button><b>${esc(x[2])}</b></div>`:`<div class="p-q">Ordena las palabras</div><p class="muted" style="margin-top:-6px">${esc(es)}</p>`)+
      `<div class="g-ans" id="gAns"></div><div class="g-bank" id="gBank">${sh.map((t,k)=>`<button class="tile" data-k="${k}" onclick="gxTile(this)">${esc(t)}</button>`).join('')}</div>`;
    GX.ansTk=tk;GX.es=es;GX.full=ans;gxFoot('Comprobar',false,gxCheck);
  }
}
function gxPick(el){document.querySelectorAll('.opts .opt').forEach(o=>o.classList.remove('sel'));el.classList.add('sel');GX.sel=+el.dataset.k;$('gGap').textContent=el.textContent;sfx('toggle');$('pBtn').disabled=false}
function gxTile(el){sfx('toggle');const into=el.parentElement.id==='gBank'?'gAns':'gBank';$(into).appendChild(el);if(into==='gAns')speak(el.textContent);$('pBtn').disabled=!$('gAns').children.length}
function gxCheck(){
  const x=GX.items[GX.i];let ok,right,expl='';
  if(x[0]==='c'){ok=GX.sel===x[3];right=x[1].replace('___',x[2][x[3]]);expl=x[4]}
  else{const said=[...$('gAns').children].map(b=>b.textContent).join(' ');ok=norm(said)===norm(GX.ansTk.join(' '));right=GX.full;expl=GX.es;document.querySelectorAll('.tile').forEach(b=>b.disabled=true)}
  if(ok){GX.ok++;P.correct++;sfx('done');buzz(15)}else{P.wrong++;sfx('error');buzz([30,40,30])}
  speak(right);
  $('pFoot').className='p-foot '+(ok?'good':'bad');
  $('pFb').innerHTML=`<div>${kikoSVG(52,ok?'happy':'sad')}</div><div><h4>${ok?pickArr(['¡Excelente!','¡Perfecto!','¡Así se dice!','¡Muy bien!']):'Casi. La respuesta es:'}</h4><p><b>${esc(right)}</b>${expl?`<br>${esc(expl)}`:''}</p></div>`;
  const b=$('pBtn');b.className='btn '+(ok?'good':'bad');b.textContent='Continuar';b.onclick=()=>{GX.i++;P.answered=GX.i;gxShow()};
}
function gxEnd(){
  const pct=Math.round(GX.ok/GX.items.length*100);
  if(GX.gid){const sw=SW();const prev=sw.gram[GX.gid]||0;sw.gram[GX.gid]=Math.max(prev,pct);if(pct>=80&&prev<80)addCoins(20)}
  dayCount('game');P.gameXP=Math.round(GX.ok*2);P.answered=GX.items.length;$('pBtn').onclick=footAction;
  _finishSession();$('pBody').querySelector('h2').textContent=pct>=80?'¡Lo dominas!':pct>=50?'¡Vas muy bien!':'Sigue practicando';
}

/* ---------------- conectar con la navegación ---------------- */
IC.study='<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M8 7h7M8 11h5"/>';
VIEWS.splice(1,0,['study','Aprende','study']);
const _render2=render;
render=function(){if(view==='study'||view==='vocab'){const m=$('main');m.innerHTML=(view==='vocab'?'':topbar())+(view==='vocab'?vocabView():studyView());m.classList.remove('fade');void m.offsetWidth;m.classList.add('fade');return}_render2()};
const _buildNav2=buildNav;
buildNav=function(){const v=view;if(v==='vocab'){view='study';_buildNav2();view='vocab';return}_buildNav2()};


/* ---------------- para hablar bien: situaciones y pronunciación ---------------- */
const SIT=(window.SITUATIONS||[]).map(x=>({...x,ph:x.p.map(s=>{const [en,es]=s.split('|');return {en,es}})}));
const SND=(window.SOUNDS||[]).map(x=>({...x,pr:x.pairs.map(s=>{const [a,b,ma,mb]=s.split('|');return {a,b,ma,mb}})}));
function speakHTML(){const sw=SW();sw.sit=sw.sit||{};sw.snd=sw.snd||{};
  return `<div class="sec"><h2>Habla en la vida real</h2><span class="muted small">Frases que sí se usan</span></div>
  <div class="sit-grid">${SIT.map(x=>{const b=sw.sit[x.id]||0;return `<button class="sit" onclick="openSit('${x.id}')"><span class="sit-e">${x.e}</span><span class="mid"><b>${esc(x.n)}</b><small>${esc(x.en)} · ${x.ph.length} frases</small></span>${b?`<i class="v-best ${b>=80?'ok':''}">${b}%</i>`:''}</button>`}).join('')}</div>
  <div class="sec"><h2>Laboratorio de pronunciación</h2><span class="muted small">Los sonidos que más cuestan</span></div>
  <div class="list">${SND.map(x=>{const b=sw.snd[x.id]||0;return `<div class="li" onclick="openSnd('${x.id}')"><span class="g-e">${x.e}</span><div class="mid"><div class="t">${esc(x.n)}</div><div class="s">${esc(x.pr.slice(0,3).map(p=>p.a+' / '+p.b).join(' · '))}</div></div>${b?`<span class="g-best ${b>=80?'ok':''}">${b}%</span>`:ic('play',18)}</div>`}).join('')}</div>`}
const _studyView=studyView;
studyView=function(){return _studyView().replace('<div class="sec"><h2>Diccionario con dibujos',speakHTML()+'<div class="sec"><h2>Diccionario con dibujos')};
function openSit(id){const x=SIT.find(s=>s.id===id);
  openSheet(head(`${x.e} ${esc(x.n)}`,`${esc(x.en)} · toca una frase para escucharla`)+`<div class="list" style="margin-bottom:16px">${x.ph.map(p=>`<div class="li" onclick="${sayJS(p.en)}"><span style="color:var(--blue)">${ic('speaker',18)}</span><div class="mid"><div class="t">${esc(p.en)}</div><div class="s">${esc(p.es)}</div></div><button class="iconbtn" onclick="event.stopPropagation();speak('${esc(p.en).replace(/'/g,"\\'")}',{slow:true})" aria-label="Despacio">${ic('turtle',18)}</button></div>`).join('')}</div><button class="btn" onclick="closeSheet();practiceSit('${id}')">${ic('mic',18)} Practicar esta situación</button>`)}
function practiceSit(id){const x=SIT.find(s=>s.id===id);const ph=pick(x.ph,Math.min(8,x.ph.length));const items=[];
  ph.forEach((p,i)=>{const k=i%3;if(k===0){const opts=shuffle([p.es,...pick(x.ph.filter(q=>q.en!==p.en),2).map(q=>q.es)]);items.push(['l',p.en,opts,opts.indexOf(p.es),p.es])}else if(k===1)items.push(['o',p.en,p.es]);else items.push(canListen()?['s',p.en,p.es]:['o',p.en,p.es])});
  runItems(items,x.n,null);GX.sit=id}
function openSnd(id){const x=SND.find(s=>s.id===id);
  openSheet(head(`${x.e} ${esc(x.n)}`,'Escucha la diferencia')+`<div class="tipbox"><b>${ic('book',16)} Cómo se hace</b>${esc(x.tip)}</div><div class="mp-list">${x.pr.map(p=>`<div class="mp"><button onclick="${sayJS(p.a)}">${ic('speaker',16)} <b>${esc(p.a)}</b><small>${esc(p.ma)}</small></button>${x.speakOnly?'':`<button onclick="${sayJS(p.b)}">${ic('speaker',16)} <b>${esc(p.b)}</b><small>${esc(p.mb)}</small></button>`}</div>`).join('')}</div><button class="btn" onclick="closeSheet();practiceSnd('${id}')">${ic('ear',18)} Practicar</button>`)}
function practiceSnd(id){const x=SND.find(s=>s.id===id);const items=[];
  pick(x.pr,Math.min(8,x.pr.length)).forEach((p,i)=>{if(!x.speakOnly&&i%2===0){const t=Math.random()<.5?0:1;items.push(['m',[p.a,p.b],t,[p.ma,p.mb]])}else items.push(canListen()?['s',p.a,p.ma]:['m',[p.a,p.b],0,[p.ma,p.mb]])});
  runItems(items,x.n,null);GX.snd=id}
const _gxShow=gxShow;
gxShow=function(){
  if(!GX||GX.i>=GX.items.length)return _gxShow();
  const x=GX.items[GX.i];const top=`<p class="bf-k">${esc(GX.title)} · ${GX.i+1} de ${GX.items.length}</p>`;
  if(!['l','s','m'].includes(x[0]))return _gxShow();
  $('pFoot').className='p-foot';$('pFb').innerHTML='';$('pBar').style.width=Math.round(GX.i/GX.items.length*100)+'%';GX.sel=null;
  if(x[0]==='l'){$('pBody').innerHTML=top+`<div class="p-q">¿Qué significa?</div><div class="big-listen"><button onclick="${sayJS(x[1])}">${ic('speaker',40)}</button><button class="slow" onclick="speak('${esc(x[1]).replace(/'/g,"\\'")}',{slow:true})">${ic('turtle',30)}</button></div><div class="opts">${x[2].map((o,k)=>`<button class="opt" data-k="${k}" onclick="gxPick2(this)">${esc(o)}</button>`).join('')}</div>`;setTimeout(()=>speak(x[1]),250);gxFoot('Comprobar',false,gxCheck)}
  else if(x[0]==='m'){const w=x[1][x[2]];$('pBody').innerHTML=top+`<div class="p-q">¿Cuál escuchaste?</div><div class="big-listen"><button onclick="${sayJS(w)}">${ic('speaker',40)}</button><button class="slow" onclick="speak('${esc(w).replace(/'/g,"\\'")}',{slow:true})">${ic('turtle',30)}</button></div><div class="opts two">${x[1].map((o,k)=>`<button class="opt mp-o" data-k="${k}" onclick="gxPick2(this)"><b>${esc(o)}</b><small>${esc(x[3][k])}</small></button>`).join('')}</div>`;setTimeout(()=>speak(w),250);gxFoot('Comprobar',false,gxCheck)}
  else{$('pBody').innerHTML=top+`<div class="p-q">Dilo en voz alta</div><div class="say-card"><button onclick="${sayJS(x[1])}">${ic('speaker',22)}</button><div><b>${esc(x[1])}</b><small>${esc(x[2])}</small></div></div><button class="mic-xl" id="sayMic" aria-label="Hablar">${ic('mic',44)}</button><div class="heard" id="sayHeard">Toca el micrófono y habla</div><button class="linkb" style="display:block;margin:14px auto 0" onclick="GX.skip=true;gxCheck()">No puedo hablar ahora</button>`;gxFoot('Comprobar',false,gxCheck);GX.said='';
    $('sayMic').onclick=()=>{const m=$('sayMic');m.classList.add('rec');sfx('record');$('sayHeard').textContent='Te escucho…';listen({onText:t=>{$('sayHeard').textContent=t},onEnd:t=>{m.classList.remove('rec');GX.said=t||'';$('sayHeard').textContent=t||'No te escuché, intenta otra vez';if(t)gxCheck()},onError:()=>{m.classList.remove('rec');$('sayHeard').textContent='No pude usar el micrófono'}})}}
};
function gxPick2(el){document.querySelectorAll('.opts .opt').forEach(o=>o.classList.remove('sel'));el.classList.add('sel');GX.sel=+el.dataset.k;sfx('toggle');$('pBtn').disabled=false}
const _gxCheck=gxCheck;
gxCheck=function(){
  const x=GX.items[GX.i];if(!['l','s','m'].includes(x[0]))return _gxCheck();
  let ok,right,expl='';
  if(x[0]==='l'){ok=GX.sel===x[3];right=x[1];expl=x[4]}
  else if(x[0]==='m'){ok=GX.sel===x[2];right=x[1][x[2]];expl=x[3][x[2]]}
  else{if(GX.skip){GX.skip=false;GX.items.splice(GX.i,1);P.total=GX.items.length;return gxShow()}const sc=similarity(GX.said,x[1]);ok=sc>=.7;right=x[1];expl=`Entendí: "${GX.said}" · ${Math.round(sc*100)}% parecido`;if(ok){S.totals.speak++;dayCount('speak')}}
  document.querySelectorAll('.opts .opt').forEach(b=>b.disabled=true);
  if(ok){GX.ok++;P.correct++;sfx('done');buzz(15)}else{P.wrong++;sfx('error');buzz([30,40,30])}
  speak(right);$('pFoot').className='p-foot '+(ok?'good':'bad');
  $('pFb').innerHTML=`<div>${kikoSVG(52,ok?'happy':'sad')}</div><div><h4>${ok?pickArr(['¡Excelente!','¡Suenas muy bien!','¡Perfecto!','¡Así mero!']):x[0]==='s'?'Casi. Escúchalo y vuelve a intentarlo:':'Casi. Era:'}</h4><p><b>${esc(right)}</b>${expl?`<br>${esc(expl)}`:''}</p></div>`;
  const b=$('pBtn');b.style.display='';b.disabled=false;b.className='btn '+(ok?'good':'bad');b.textContent='Continuar';b.onclick=()=>{GX.i++;P.answered=GX.i;gxShow()};
};
const _gxEnd=gxEnd;
gxEnd=function(){const pct=Math.round(GX.ok/Math.max(1,GX.items.length)*100);const sw=SW();sw.sit=sw.sit||{};sw.snd=sw.snd||{};
  if(GX.sit){const prev=sw.sit[GX.sit]||0;sw.sit[GX.sit]=Math.max(prev,pct);if(pct>=80&&prev<80)addCoins(20);GX.items.forEach(it=>{if(it[0]!=='m')srsAdd({en:it[1],es:it[0]==='l'?it[4]:it[2],lesson:'sit-'+GX.sit},'s')})}
  if(GX.snd){const prev=sw.snd[GX.snd]||0;sw.snd[GX.snd]=Math.max(prev,pct);if(pct>=80&&prev<80)addCoins(20)}
  _gxEnd()};

boot();
