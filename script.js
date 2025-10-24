'use strict';

// --- QUADRI ---
// Metti qui i nomi REALI dei file in root (puoi lasciarli “sciolti”).
// Per evitare problemi con spazi/apostrofi/accents, encodeURI sarà applicato a runtime.
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
const listEl = document.getElementById('list');
const previewImg = document.getElementById('preview');
const placeholder = document.getElementById('placeholder');
const titleEl = document.getElementById('title');
const btnAR = document.getElementById('btnAR');
const mv = document.getElementById('mv');

let selected = null;

// --- UTILS ---
function path(u) {
  // encode solo la parte dopo l’eventuale dominio (qui sono file locali)
  return encodeURI(u);
}

async function fileExists(url) {
  try {
    const res = await fetch(path(url), { method: 'HEAD', cache: 'no-store' });
    return res.ok;
  } catch { return false; }
}

function showPoster(src) {
  if (!src) {
    previewImg.style.display = 'none';
    placeholder.hidden = false;
    return;
  }
  const test = new Image();
  test.onload = () => {
    previewImg.src = path(src);
    previewImg.style.display = 'block';
    placeholder.hidden = true;
  };
  test.onerror = () => {
    previewImg.style.display = 'none';
    placeholder.hidden = false;
  };
  test.src = path(src);
}

// --- RENDER LISTA BOTTONI ---
function buildList() {
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
async function selectQuadro(index) {
  const buttons = listEl.querySelectorAll('.item');
  buttons.forEach(b => b.setAttribute('aria-current', 'false'));
  if (buttons[index]) buttons[index].setAttribute('aria-current', 'true');

  selected = QUADRI[index];
  titleEl.textContent = selected.nome;

  // Anteprima
  showPoster(selected.poster);

  // Configurazione AR
  mv.setAttribute('src', path(selected.glb));
  mv.setAttribute('ios-src', path(selected.usdz));

  // Abilita AR se i file esistono
  const [hasGLB, hasUSDZ] = await Promise.all([
    fileExists(selected.glb),
    fileExists(selected.usdz),
  ]);
  const okForIOS = hasUSDZ;
  const okForAndroid = hasGLB;
  let enabled = (isIOS && okForIOS) || (!isIOS && okForAndroid);
  if (!enabled && (okForIOS || okForAndroid)) enabled = true; // lascia al viewer gestire fallback
  btnAR.disabled = !enabled;
  btnAR.title = enabled
    ? ''
    : isIOS ? 'Manca il file USDZ per iOS' : 'Manca il file GLB per Android/Web';
}

// --- AVVIO AR ---
btnAR.addEventListener('click', async () => {
  if (!selected) return;
  try {
    await mv.activateAR();
  } catch (e) {
    alert('AR non disponibile su questo dispositivo o file non trovati.');
    console.warn(e);
  }
});

// --- INIT ---
buildList();
// Se vuoi selezionare automaticamente il primo: decommenta la riga seguente
// selectQuadro(0);
