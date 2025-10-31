'use strict';

/* Elenco quadri – nomi file sanificati (niente accenti/apostrofi) */
const QUADRI = [
  { id:'veglia-sul-mare',             nome:'Veglia sul mare',             glb:'Veglia_sul_mare.glb',            usdz:'Veglia_sul_mare.usdz' },
  { id:'il-borgo-che-guarda-il-mare', nome:'Il borgo che guarda il mare', glb:'il_borgo_che_guarda_il_mare.glb', usdz:'il_borgo_che_guarda_il_mare.usdz' },
  { id:'il-castello-e-il-mare',       nome:'Il castello e il mare',       glb:'il_castello_e_il_mare.glb',       usdz:'il_castello_e_il_mare.usdz' },
  { id:'liberta-al-tramonto',         nome:'Libertà al tramonto',         glb:'liberta_al_tramonto.glb',         usdz:'liberta_al_tramonto.usdz' },
  { id:'maremma',                     nome:'Maremma',                     glb:'maremma.glb',                     usdz:'maremma.usdz' },
  { id:'tramonto-d-oro',              nome:"Tramonto d'oro",              glb:'tramonto_d_oro.glb',              usdz:'tramonto_d_oro.usdz' },
];

const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
const listEl = document.getElementById('list');
const btnAR  = document.getElementById('btnAR');
const mv     = document.getElementById('mv');

let selected = null;

// Util per encoding sicuro (accenti/apostrofi già evitati, ma meglio)
const path = (u) => encodeURI(u);

// Costruisci lista (2× per riga)
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

function selectQuadro(i){
  const buttons = listEl.querySelectorAll('.item');
  buttons.forEach(b => b.setAttribute('aria-current','false'));
  if (buttons[i]) buttons[i].setAttribute('aria-current','true');

  selected = QUADRI[i];

  // Prepara model-viewer per AR
  mv.setAttribute('src', path(selected.glb));
  mv.setAttribute('ios-src', path(selected.usdz));
  mv.setAttribute('ar-placement', 'wall');
  mv.setAttribute('ar-scale', 'fixed');

  // Attiva il pulsante se esiste almeno il formato atteso
  const ok = isIOS ? !!selected.usdz : !!selected.glb;
  btnAR.disabled = !ok;
}

btnAR.addEventListener('click', async () => {
  if (!selected) return;
  try{
    await mv.activateAR();
  }catch(err){
    alert('AR non disponibile o file mancanti.');
    console.error(err);
  }
});

// Init
buildList();
// (Niente selezione automatica, il bottone resta disabilitato finché non scegli)
