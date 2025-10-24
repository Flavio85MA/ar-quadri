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
const listEl      = document.getElementById('list');
const previewImg  = document.getElementById('preview');
const placeholder = document.getElementById('placeholder');
const titleEl     = document.getElementById('title');
const btnAR       = document.getElementById('btnAR');
const mv          = document.getElementById('mv');

let selected = null;

// --- UTILS ---
function path(u){ return encodeURI(u); }

// Ripulisce eventuale model-viewer usato come anteprima
function clearThumbPreview(){
  const old = document.getElementById('mvPreview');
  if (old) old.remove();
}

// Mostra JPG se disponibile; se manca/errore, usa model-viewer (GLB) come anteprima
function showPosterOrModel(srcPoster, srcGlb){
  const thumb = document.querySelector('.thumb');

  clearThumbPreview();

  // 1) Se ho un poster dichiarato, provo a caricarlo direttamente (senza HEAD)
  if (srcPoster){
    const test = new Image();
    test.onload = () => {
      previewImg.src = path(srcPoster);
      previewImg.style.display = 'block';
      placeholder.hidden = true;
    };
    test.onerror = () => {
      // 2) Fallback immediato al GLB in 3D
      addModelPreview(srcGlb);
    };
    test.src = path(srcPoster);
    return;
  }

  // Nessun poster: vado diretto al 3D
  addModelPreview(srcGlb);

  function addModelPreview(glb){
    // Se manca anche il GLB, ri-mostra placeholder
    if (!glb){
      previewImg.style.display = 'none';
      placeholder.hidden = false;
      return;
    }
    const mvPrev = document.createElement('model-viewer');
    mvPrev.id = 'mvPreview';
    mvPrev.setAttribute('src', path(glb));
    mvPrev.setAttribute('camera-controls', '');
    mvPrev.setAttribute('reveal', 'auto');   // render immediato
    mvPrev.setAttribute('exposure', '1');
    mvPrev.setAttribute('shadow-intensity', '0');
    mvPrev.style.width  = '100%';
    mvPrev.style.height = '100%';
    previewImg.style.display = 'none';
    placeholder.hidden = true;
    thumb.appendChild(mvPrev);
  }
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

  // ANTEPRIMA robusta: JPG oppure fallback 3D
  showPosterOrModel(q.poster, q.glb);

  // Config AR per "Vedi in AR"
  mv.setAttribute('src', path(q.glb));
  mv.setAttribute('ios-src', path(q.usdz));

  // Abilito il bottone AR in base alla piattaforma (senza HEAD)
  // (Se almeno uno dei formati è presente, model-viewer gestirà il fallback)
  const likelyOK = isIOS ? !!q.usdz : !!q.glb;
  btnAR.disabled = !likelyOK;

  btnAR.onclick = async () => {
    if (!selected) return;
    try { await mv.activateAR(); }
    catch { alert('AR non disponibile o file mancanti.'); }
  };
}

// --- INIT ---
buildList();
// selectQuadro(0); // opzionale: seleziona il primo all'apertura
