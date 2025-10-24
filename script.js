'use strict';

// --- ELENCO QUADRI (file in ROOT della repo) ---
const QUADRI = [
  { id: 'veglia-sul-mare', nome: 'Veglia sul mare (60×40)', poster: 'Veglia_sul_mare.jpg', glb: 'Veglia_sul_mare.glb', usdz: 'Veglia_sul_mare.usdz' },
  { id: 'il-borgo-che-guarda-il-mare', nome: 'Il borgo che guarda il mare (60×40)', poster: 'il_borgo_che_guarda_il_mare.jpg', glb: 'il_borgo_che_guarda_il_mare.glb', usdz: 'il_borgo_che_guarda_il_mare.usdz' },
  { id: 'il-castello-e-il-mare', nome: 'Il castello e il mare (60×40)', poster: 'il_castello_e_il_mare.jpg', glb: 'il_castello_e_il_mare.glb', usdz: 'il_castello_e_il_mare.usdz' },
  { id: 'liberta-al-tramonto', nome: 'Libertà al tramonto (60×40)', poster: 'libertà_al_tramonto.jpg', glb: 'libertà_al_tramonto.glb', usdz: 'libertà_al_tramonto.usdz' },
  { id: 'maremma', nome: 'Maremma (60×40)', poster: 'maremma.jpg', glb: 'maremma.glb', usdz: 'maremma.usdz' },
  { id: 'tramonto-d-oro', nome: "Tramonto d'oro (60×40)", poster: "tramonto_d'oro.jpg", glb: "tramonto_d'oro.glb", usdz: "tramonto_d'oro.usdz" },
];

// --- RILEVAMENTO PIATTAFORMA ---
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

// --- ELEMENTI DOM ---
const listEl     = document.getElementById('list');
const previewImg = document.getElementById('preview');
const placeholder= document.getElementById('placeholder');
const titleEl    = document.getElementById('title');
const btnAR      = document.getElementById('btnAR');
const mv         = document.getElementById('mv');

let selected = null;

// --- UTILS ---
function path(u){ return encodeURI(u); }

async function fileExists(url){
  try{
    const res = await fetch(path(url), { method:'HEAD', cache:'no-store' });
    return res.ok;
  } catch { return false; }
}

// Ripulisce eventuale model-viewer usato come anteprima
function clearThumbPreview(){
  const old = document.getElementById('mvPreview');
  if (old) old.remove();
}

// Mostra JPG se disponibile; se manca o fallisce, usa model-viewer (GLB) come anteprima
async function showPosterOrModel(srcPoster, srcGlb){
  const thumb = document.querySelector('.thumb');

  clearThumbPreview();

  // 1) Prova il JPG (se dichiarato)
  if (srcPoster){
    const okPoster = await fileExists(srcPoster);
    if (okPoster){
      previewImg.src = path(srcPoster);
      previewImg.style.display = 'block';
      placeholder.hidden = true;
      return;
    }
  }

  // 2) Fallback: usa GLB in model-viewer visibile, con reveal=auto (render immediato)
  const okGlb = await fileExists(srcGlb);
  if (okGlb){
    const mvPrev = document.createElement('model-viewer');
    mvPrev.id = 'mvPreview';
    mvPrev.setAttribute('src', path(srcGlb));
    mvPrev.setAttribute('camera-controls', '');
    mvPrev.setAttribute('reveal', 'auto');           // <— qui il fix principale
    mvPrev.setAttribute('exposure', '1');
    mvPrev.setAttribute('shadow-intensity', '0');
    mvPrev.style.width  = '100%';
    mvPrev.style.height = '100%';
    previewImg.style.display = 'none';
    placeholder.hidden = true;
    thumb.appendChild(mvPrev);
    return;
  }

  // 3) Se manca pure il GLB, mostra placeholder
  previewImg.style.display = 'none';
  placeholder.hidden = false;
}

// --- RENDER LISTA BOTTONI ---
function buildList(){
  listEl.innerHTML = '';
  QUADRI.forEach((q, i) => {
    const b = document.createElement('button');
    b.className = 'item';
    b.type = 'button';
    b.textContent = q.nome;
    b.addEventListener('click', () => selectQuadro(i));
    listEl.appendChild(b);
  });
}

// --- SELEZIONE QUADRO ---
async function selectQuadro(i){
  const buttons = listEl.querySelectorAll('.item');
  buttons.forEach(b => b.setAttribute('aria-current','false'));
  if (buttons[i]) buttons[i].setAttribute('aria-current','true');

  const q = QUADRI[i];
  selected = q;
  titleEl.textContent = q.nome;

  // ANTEPRIMA: JPG se c'è, altrimenti model-viewer GLB (reveal=auto)
  await showPosterOrModel(q.poster, q.glb);

  // Config AR per il pulsante "Vedi in AR"
  mv.setAttribute('src', path(q.glb));
  mv.setAttribute('ios-src', path(q.usdz));

  const [hasGLB, hasUSDZ] = await Promise.all([fileExists(q.glb), fileExists(q.usdz)]);
  let enabled = (isIOS && hasUSDZ) || (!isIOS && hasGLB);
  if (!enabled && (hasGLB || hasUSDZ)) enabled = true; // consenti fallback gestito da model-viewer
  btnAR.disabled = !enabled;

  btnAR.onclick = async () => {
    if (!selected) return;
    try { await mv.activateAR(); }
    catch { alert('AR non disponibile o file mancanti.'); }
  };
}

// --- INIT ---
buildList();
// selectQuadro(0); // opzionale: seleziona il primo all'apertura
