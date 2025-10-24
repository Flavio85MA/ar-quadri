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
const isAndroid = /Android/i.test(navigator.userAgent);
const isMobile = isIOS || isAndroid;

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

// Ripulisce eventuale model-viewer usato come anteprima (desktop only)
function clearThumbPreview(){
  const old = document.getElementById('mvPreview');
  if (old) old.remove();
}

// Normalizza un JPG su iOS disegnandolo su canvas e riassegnando il dataURL
async function normalizeJpegForIOS(url){
  // stessa origine: GitHub Pages del repo, quindi ok per canvas
  const res = await fetch(path(url), { cache: 'no-store' });
  if (!res.ok) throw new Error('Poster fetch failed');
  const blob = await res.blob();
  const bitmap = await createImageBitmap(blob); // rapido e gestisce orientamento
  const maxW = 1600; // per sicurezza riduciamo un po' (opzionale)
  const scale = Math.min(1, maxW / bitmap.width);
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d', { alpha: false, colorSpace: 'srgb' });
  ctx.drawImage(bitmap, 0, 0, w, h);
  // JPEG baseline sRGB
  return canvas.toDataURL('image/jpeg', 0.9);
}

// Mostra JPG; su mobile iOS, se il JPG esiste lo normalizziamo via canvas.
// Se il JPG manca/fallisce: su mobile mostriamo placeholder; su desktop fallback 3D.
function showPosterOrModel(srcPoster, srcGlb){
  const thumb = document.querySelector('.thumb');

  // reset
  clearThumbPreview();
  previewImg.style.display = 'none';
  placeholder.hidden = false;

  // 1) Prova JPG sempre
  if (srcPoster){
    if (isIOS) {
      // iOS: normalizzazione canvas per evitare neri (EXIF/profili/progressivo)
      normalizeJpegForIOS(srcPoster).then(dataURL => {
        previewImg.src = dataURL;
        previewImg.style.display = 'block';
        placeholder.hidden = true;
      }).catch(() => {
        // su iOS se il poster fallisce mostriamo placeholder (niente 3D in preview)
        previewImg.style.display = 'none';
        placeholder.hidden = false;
      });
      return;
    } else {
      // Android/Desktop: carico normalmente
      const test = new Image();
      test.onload = () => {
        previewImg.src = path(srcPoster);
        previewImg.style.display = 'block';
        placeholder.hidden = true;
      };
      test.onerror = () => {
        // Desktop: fallback 3D; Android: evitiamo 3D per coerenza? Lo lasciamo OFF per mobile
        if (!isMobile) addModelPreview(srcGlb);
        else { previewImg.style.display = 'none'; placeholder.hidden = false; }
      };
      test.src = path(srcPoster);
      return;
    }
  }

  // Nessun poster specificato
  if (!isMobile) {
    addModelPreview(srcGlb); // solo desktop
  } else {
    previewImg.style.display = 'none';
    placeholder.hidden = false;
  }

  function addModelPreview(glb){
    if (!glb) { previewImg.style.display = 'none'; placeholder.hidden = false; return; }
    const mvPrev = document.createElement('model-viewer');
    mvPrev.id = 'mvPreview';
    mvPrev.setAttribute('src', path(glb));
    mvPrev.setAttribute('camera-controls', '');
    mvPrev.setAttribute('reveal', 'auto');   // render immediato
    mvPrev.setAttribute('exposure', '1');
    mvPrev.setAttribute('shadow-intensity', '0');
    mvPrev.setAttribute('environment-image', 'neutral');
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

  // ANTEPRIMA: JPG (su iOS normalizzato via canvas), desktop fallback 3D
  showPosterOrModel(q.poster, q.glb);

  // Config AR per "Vedi in AR"
  mv.setAttribute('src', path(q.glb));
  mv.setAttribute('ios-src', path(q.usdz));

  // Abilita pulsante AR in base alla piattaforma
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
