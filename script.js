// Config: per ora usiamo sempre lo stesso modello verticale.
// Quando avrai un modello orizzontale dedicato, sostituisci qui.
const MODELS = {
  verticale: {
    glb:  "assets/models/frame-vertical.glb",
    usdz: "assets/models/frame-vertical.usdz",
    // rotazione Z = 0°
    orientation: "0deg 0deg 0deg",
    // Info dimensioni reali (metri). Mostriamo al cliente:
    label: "60 × 40 cm"
  },
  orizzontale: {
    // riuso del verticale + rotazione a 90° sullo Z
    glb:  "assets/models/frame-vertical.glb",
    usdz: "assets/models/frame-vertical.usdz",
    orientation: "0deg 0deg 90deg",
    label: "40 × 60 cm"
  }
};

// Se vuoi “iniettare” l’immagine scelta come texture sul quadro:
// - Prepara nel tuo GLB/USdz un materiale con nome “Picture” (o simile)
// - Abilita setTexture in model-viewer via scene-graph API quando pronto
// In questa prima versione, visualizziamo anteprima e metadati; AR usa il modello base.

const mv = document.getElementById('mv');
const btnAR = document.getElementById('enterAR');
const sizeInfo = document.getElementById('sizeInfo');
const selLabel = document.getElementById('selLabel');

let current = null; // {id, orient, img, label}

function pick(button){
  document.querySelectorAll('.card').forEach(b => b.classList.remove('active'));
  button.classList.add('active');

  const orient = button.dataset.orient; // "verticale" | "orizzontale"
  const img = button.dataset.img;
  const id = button.dataset.id;

  current = { id, orient, img, label: button.dataset.label };

  // Aggiorna viewer (src, ios-src, orientazione, info dimensioni)
  const m = MODELS[orient];
  mv.setAttribute('src', m.glb);
  mv.setAttribute('ios-src', m.usdz);
  mv.orientation = m.orientation; // ruotiamo il modello per orizzontale

  selLabel.textContent = `${button.querySelector('span').textContent}`;
  sizeInfo.textContent = (orient === 'verticale') ? MODELS.verticale.label : MODELS.orizzontale.label;

  // (Opzionale) Tentativo di applicare la texture selezionata, se il tuo GLB lo consente
  // applyPictureTexture(img).catch(()=>{ /* ignora se non supportato */ });
}

// Esempio di hook per texture (richiede GLB con materiale nota e UV pronti)
async function applyPictureTexture(imgUrl){
  await mv.updateComplete;
  const scene = mv.model?.materials || [];
  const mat = mv.model?.materials?.find(m => /picture/i.test(m.name));
  if(!mat) return;
  const tex = await mv.createTexture(imgUrl);
  mat.pbrMetallicRoughness.setBaseColorTexture(tex);
}

document.querySelectorAll('.card').forEach(btn => {
  btn.addEventListener('click', () => pick(btn));
});

// Apri direttamente l’AR (equivale a toccare l’icona in model-viewer)
btnAR.addEventListener('click', () => {
  // mini-guard
  if(!current){
    // scegli il primo se nulla selezionato
    const first = document.querySelector('.card');
    if(first){ pick(first); }
  }
  mv.activateAR();
});

// Se vuoi pre-selezionare di default la prima verticale
window.addEventListener('DOMContentLoaded', () => {
  const first = document.querySelector('.card[data-orient="verticale"]');
  if(first) pick(first);
});
