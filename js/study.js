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

boot();
