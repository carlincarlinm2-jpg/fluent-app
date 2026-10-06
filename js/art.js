// Ilustraciones 3D (Microsoft Fluent Emoji 3D, licencia MIT) en lugar de los emojis del teclado,
// y el creador de avatar animado del viajero.
const ART_BASE='https://cdn.jsdelivr.net/npm/@lobehub/fluent-emoji-3d@1.1.0/assets/';
const _seg=typeof Intl!=='undefined'&&Intl.Segmenter?new Intl.Segmenter(undefined,{granularity:'grapheme'}):null;
function graphemes(s){return _seg?[..._seg.segment(String(s))].map(x=>x.segment):[...String(s)]}
function artCode(g){return [...g].map(c=>c.codePointAt(0).toString(16)).join('-')}
// Cada dibujo prueba primero el nombre exacto y luego variantes; si no existe, queda una ficha con la inicial.
function artFallback(img){
  const tried=+(img.dataset.t||0);const code=img.dataset.c;const alts=[code.includes('fe0f')?code.replace(/-fe0f/g,''):code.replace(/^([0-9a-f]+)/,'$1-fe0f'),code.split('-200d-')[0]];
  if(tried<alts.length&&alts[tried]!==code){img.dataset.t=tried+1;img.src=ART_BASE+alts[tried]+'.webp';return}
  const s=document.createElement('span');s.className='art-x';s.style.width=s.style.height=img.style.width;s.textContent=(img.alt||'•').slice(0,1).toUpperCase();img.replaceWith(s);
}
function art(e,size=40,label=''){
  const gs=graphemes(e).filter(g=>g.trim());
  return gs.map(g=>`<img class="art" src="${ART_BASE}${artCode(g)}.webp" data-c="${artCode(g)}" alt="${esc(label)}" style="width:${size}px;height:${size}px" loading="lazy" decoding="async" draggable="false" onerror="artFallback(this)">`).join('');
}

/* ---------------- avatar animado ---------------- */
const AV={
  skin:['#ffdbb4','#f1c27d','#e0ac69','#c68642','#8d5524','#5c3a21'],
  hairC:['#1d1a1a','#4a2c1a','#8b5a2b','#d6a85b','#c0392b','#7f8c8d','#6a5af9','#22d36b'],
  bg:['#3a3d55','#2f6fd6','#6a5af9','#e8504f','#22a06b','#f7b733','#d66efd','#111'],
  hair:['Corto','Rizado','Largo','Chongo','Rapado','Copete','Coletas','Afro'],
  eyes:['Normales','Felices','Pestañas','Grandes'],
  mouth:['Sonrisa','Risa','Neutral','Sorpresa'],
  acc:['Nada','Lentes','Lentes de sol','Gorra','Audífonos','Corona','Sombrero','Moño'],
};
// Precio de cada opción (0 = gratis). Las primeras de cada lista son gratis.
const AV_PRICE={hair:[0,0,0,0,40,60,60,80],eyes:[0,0,40,60],mouth:[0,0,0,40],acc:[0,0,60,50,80,300,120,50],hairC:[0,0,0,0,40,40,80,80],bg:[0,0,0,0,30,30,60,120]};
function avState(){const w=W();w.av=w.av||{skin:1,hair:0,hairC:0,eyes:0,mouth:0,acc:0,bg:2};w.avOwn=w.avOwn||{};return w.av}
function avOwned(k,i){return !AV_PRICE[k]||!AV_PRICE[k][i]||!!W().avOwn[k+i]}
let _avid=0;
function avatarSVG(size=40,a=avState(),anim=true){
  const id='av'+(++_avid),sk=AV.skin[a.skin]||AV.skin[1],hc=AV.hairC[a.hairC]||AV.hairC[0],bg=AV.bg[a.bg]||AV.bg[2],ink='#1d1420';
  const hairBack=[
    '',
    `<circle cx="34" cy="40" r="10" fill="${hc}"/><circle cx="66" cy="40" r="10" fill="${hc}"/>`,
    `<path d="M24 46q0-28 26-28t26 28v30H66V50H34v26H24z" fill="${hc}"/>`,
    '', '', '',
    `<circle cx="22" cy="52" r="9" fill="${hc}"/><circle cx="78" cy="52" r="9" fill="${hc}"/>`,
    `<circle cx="50" cy="40" r="30" fill="${hc}"/>`][a.hair]||'';
  const hairTop=[
    `<path d="M27 44q0-22 23-22t23 22q-8-9-23-9t-23 9z" fill="${hc}"/>`,
    `<g fill="${hc}"><circle cx="34" cy="30" r="8"/><circle cx="44" cy="25" r="8"/><circle cx="56" cy="25" r="8"/><circle cx="66" cy="30" r="8"/><circle cx="72" cy="38" r="6"/><circle cx="28" cy="38" r="6"/></g>`,
    `<path d="M27 46q0-24 23-24t23 24q-10-12-23-12t-23 12z" fill="${hc}"/>`,
    `<path d="M27 44q0-22 23-22t23 22q-8-9-23-9t-23 9z" fill="${hc}"/><circle cx="50" cy="16" r="8" fill="${hc}"/>`,
    `<path d="M28 42q2-18 22-18t22 18q-10-6-22-6t-22 6z" fill="${hc}" opacity=".55"/>`,
    `<path d="M27 44q0-22 23-22t23 22q-8-9-23-9t-23 9z" fill="${hc}"/><path d="M40 26q8-14 24-8-10 2-14 12z" fill="${hc}"/>`,
    `<path d="M27 44q0-22 23-22t23 22q-8-9-23-9t-23 9z" fill="${hc}"/>`,
    `<path d="M24 46q-2-28 26-28t26 28q-8-10-26-10t-26 10z" fill="${hc}"/>`][a.hair]||'';
  const eyes=[
    `<g class="av-eyes"><ellipse cx="41" cy="50" rx="3.6" ry="4.4" fill="${ink}"/><ellipse cx="59" cy="50" rx="3.6" ry="4.4" fill="${ink}"/><circle cx="42.2" cy="48.6" r="1.2" fill="#fff"/><circle cx="60.2" cy="48.6" r="1.2" fill="#fff"/></g>`,
    `<path d="M37 51q4-5 8 0M55 51q4-5 8 0" stroke="${ink}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`,
    `<g class="av-eyes"><ellipse cx="41" cy="50" rx="3.6" ry="4.4" fill="${ink}"/><ellipse cx="59" cy="50" rx="3.6" ry="4.4" fill="${ink}"/><path d="M36 46l-2-2M38 45l-1-3M64 46l2-2M62 45l1-3" stroke="${ink}" stroke-width="1.6" stroke-linecap="round"/><circle cx="42.2" cy="48.6" r="1.2" fill="#fff"/><circle cx="60.2" cy="48.6" r="1.2" fill="#fff"/></g>`,
    `<g class="av-eyes"><ellipse cx="41" cy="50" rx="6" ry="6.6" fill="#fff"/><ellipse cx="59" cy="50" rx="6" ry="6.6" fill="#fff"/><circle cx="42" cy="51" r="3.6" fill="${ink}"/><circle cx="60" cy="51" r="3.6" fill="${ink}"/><circle cx="43.2" cy="49.6" r="1.2" fill="#fff"/><circle cx="61.2" cy="49.6" r="1.2" fill="#fff"/></g>`][a.eyes]||'';
  const mouth=[
    `<path d="M43 61q7 6 14 0" stroke="${ink}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`,
    `<path d="M42 59q8 10 16 0z" fill="${ink}"/><path d="M45 62q5 3 10 0" fill="#ff8fa3"/>`,
    `<path d="M44 62h12" stroke="${ink}" stroke-width="2.6" stroke-linecap="round"/>`,
    `<ellipse cx="50" cy="62" rx="3.4" ry="4" fill="${ink}"/>`][a.mouth]||'';
  const acc=[
    '',
    `<g fill="none" stroke="${ink}" stroke-width="2"><circle cx="41" cy="50" r="7"/><circle cx="59" cy="50" r="7"/><path d="M48 50h4M34 49l-6-2M66 49l6-2"/></g>`,
    `<g><path d="M32 46h16q1 9-8 9t-8-9zM52 46h16q1 9-8 9t-8-9z" fill="${ink}"/><path d="M48 47h4" stroke="${ink}" stroke-width="2"/><path d="M36 48l4-1M56 48l4-1" stroke="#fff" stroke-width="1.4" opacity=".6"/></g>`,
    `<path d="M25 40q0-20 25-20t25 20z" fill="#e8504f"/><path d="M50 40h30q-2 6-10 6H50z" fill="#c43b3a"/><circle cx="50" cy="20" r="3" fill="#c43b3a"/>`,
    `<path d="M24 50q0-28 26-28t26 28" stroke="${ink}" stroke-width="4" fill="none"/><rect x="18" y="44" width="10" height="16" rx="5" fill="#6a5af9"/><rect x="72" y="44" width="10" height="16" rx="5" fill="#6a5af9"/>`,
    `<path d="M32 30l6-14 12 10 12-10 6 14z" fill="#f7c948" stroke="#d9a514" stroke-width="1.5"/><circle cx="50" cy="22" r="2.4" fill="#e8504f"/>`,
    `<ellipse cx="50" cy="32" rx="34" ry="6" fill="#8b5a2b"/><path d="M32 32q0-18 18-18t18 18z" fill="#a0682f"/><path d="M33 28h34" stroke="#5c3a21" stroke-width="3"/>`,
    `<path d="M60 22l10-6v12zM60 22l-10-6v12z" fill="#ff5fa2"/><circle cx="60" cy="22" r="3" fill="#ff8fc0"/>`][a.acc]||'';
  return `<svg class="avatar ${anim?'anim':''}" width="${size}" height="${size}" viewBox="0 0 100 100" role="img" aria-label="Tu avatar"><defs><radialGradient id="${id}b" cx="35%" cy="25%" r="85%"><stop offset="0" stop-color="${bg}" stop-opacity=".7"/><stop offset="1" stop-color="${bg}"/></radialGradient><radialGradient id="${id}s" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
  <circle cx="50" cy="50" r="50" fill="url(#${id}b)"/><g class="av-body">${hairBack}<path d="M24 100q2-22 26-22t26 22z" fill="${bg==='#111'?'#2f6fd6':'#fff'}" opacity=".9"/><rect x="44" y="66" width="12" height="14" rx="5" fill="${sk}"/><ellipse cx="50" cy="50" rx="23" ry="25" fill="${sk}"/><ellipse cx="50" cy="44" rx="18" ry="16" fill="url(#${id}s)"/><ellipse cx="27" cy="52" rx="4" ry="6" fill="${sk}"/><ellipse cx="73" cy="52" rx="4" ry="6" fill="${sk}"/>${hairTop}<circle cx="35" cy="58" r="4" fill="#ff8fa3" opacity=".35"/><circle cx="65" cy="58" r="4" fill="#ff8fa3" opacity=".35"/>${eyes}${mouth}${acc}</g></svg>`;
}
