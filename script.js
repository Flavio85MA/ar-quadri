'use strict';
const QUADRI = [
  { id:'veglia-sul-mare', nome:'Veglia sul mare (60×40)', poster:'Veglia_sul_mare.jpg', glb:'Veglia_sul_mare.glb', usdz:'Veglia_sul_mare.usdz' },
  { id:'il-borgo-che-guarda-il-mare', nome:'Il borgo che guarda il mare (60×40)', poster:'il_borgo_che_guarda_il_mare.jpg', glb:'il_borgo_che_guarda_il_mare.glb', usdz:'il_borgo_che_guarda_il_mare.usdz' },
  { id:'il-castello-e-il-mare', nome:'Il castello e il mare (60×40)', poster:'il_castello_e_il_mare.jpg', glb:'il_castello_e_il_mare.glb', usdz:'il_castello_e_il_mare.usdz' },
  { id:'liberta-al-tramonto', nome:'Libertà al tramonto (60×40)', poster:'libertà_al_tramonto.jpg', glb:'libertà_al_tramonto.glb', usdz:'libertà_al_tramonto.usdz' },
  { id:'maremma', nome:'Maremma (60×40)', poster:'maremma.jpg', glb:'maremma.glb', usdz:'maremma.usdz' },
  { id:'tramonto-d-oro', nome:"Tramonto d'oro (60×40)", poster:"tramonto_d'oro.jpg", glb:"tramonto_d'oro.glb", usdz:"tramonto_d'oro.usdz" },
];
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
const listEl=document.getElementById('list');
const previewImg=document.getElementById('preview');
const placeholder=document.getElementById('placeholder');
const titleEl=document.getElementById('title');
const btnAR=document.getElementById('btnAR');
const mv=document.getElementById('mv');

function path(u){ return encodeURI(u); }
async function fileExists(url){ try{ const r=await fetch(path(url),{method:'HEAD',cache:'no-store'}); return r.ok; } catch{ return false; } }
function showPoster(src){
  if(!src){ previewImg.style.display='none'; placeholder.hidden=false; return; }
  const test=new Image();
  test.onload=()=>{ previewImg.src=path(src); previewImg.style.display='block'; placeholder.hidden=true; };
  test.onerror=()=>{ previewImg.style.display='none'; placeholder.hidden=false; };
  test.src=path(src);
}

function buildList(){
  listEl.innerHTML='';
  QUADRI.forEach((q,i)=>{
    const b=document.createElement('button');
    b.className='item'; b.type='button'; b.textContent=q.nome;
    b.addEventListener('click',()=>selectQuadro(i));
    listEl.appendChild(b);
  });
}

async function selectQuadro(i){
  const buttons=listEl.querySelectorAll('.item');
  buttons.forEach(b=>b.setAttribute('aria-current','false'));
  if(buttons[i]) buttons[i].setAttribute('aria-current','true');

  const q=QUADRI[i];
  titleEl.textContent=q.nome;
  showPoster(q.poster);
  mv.setAttribute('src',path(q.glb));
  mv.setAttribute('ios-src',path(q.usdz));

  const [hasGLB,hasUSDZ]=await Promise.all([fileExists(q.glb),fileExists(q.usdz)]);
  let enabled=(isIOS&&hasUSDZ)||(!isIOS&&hasGLB);
  if(!enabled&&(hasGLB||hasUSDZ)) enabled=true; // lascia a model-viewer i fallback
  btnAR.disabled=!enabled;
  btnAR.onclick=async()=>{ try{ await mv.activateAR(); } catch(e){ alert('AR non disponibile o file mancanti.'); } };
}

buildList();
// selectQuadro(0); // opzionale: seleziona il primo all'apertura
