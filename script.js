// Percorsi aggiornati ai file nella root del tuo repo
const MODELS = {
  verticale: {
    glb:  "./4quadro-verticale-40x60.glb",
    usdz: "./4quadro-verticale-40x60.usdz",
    // per verticale nessuna rotazione
    orientation: "0deg 0deg 0deg",
    label: "60 × 40 cm"
  },
  orizzontale: {
    // per ora riuso del verticale + rotazione a 90° sull'asse Z
    glb:  "./4quadro-verticale-40x60.glb",
    usdz: "./4quadro-verticale-40x60.usdz",
    orientation: "0deg 0deg 90deg",
    label: "40 × 60 cm"
  }
};

const mv = document.getElementById('mv');
const btnAR = document.getElementById('enterAR');
const sizeInfo = document.getElementById('sizeInfo');
const selLabel = document.getElementById('selLabel');

let current = null; // {id, orient, img, label}

// Selezione carta
function pick(button){
  document.querySelectorAll('.card').forEach(b => b.classList.remove('active'));
  button.classList.add('active');

  const orient = button.dataset.orient; // "verticale" | "orizzontale"
  const img = button.dataset.img;
  const id = button.dataset.id;

  current = { id, orient, img, label: button.dataset.label };

  // Aggiorna model-viewer: src, ios-src, orientazione e info dimensioni
  const m = MODELS[orient];
  mv.setAttribute('src', m.glb);
  mv.setAttribute('ios-src', m.usdz);
  mv.orientation = m.orientation;

  selLabel.textContent = button.dataset.label;
  sizeInfo.textContent = m.label;

  // (Opzionale) Applicare texture dell'opera se il GLB lo consente
  // applyPictureTexture(img).catch(()=>{});
}

// Esempio per applicare texture (richiede GLB con materiale "Picture" o simile)
async function applyPictureTexture(imgUrl){
  await mv.updateComplete;
  const mat = mv.model?.materials?.find(m => /picture|canvas|tela/i.test(m.name));
  if(!mat) return;
  const tex = await mv.createTexture(imgUrl);
  mat.pbrMetallicRoughness.setBaseColorTexture(tex);
}

// Bind events
document.querySelectorAll('.card').forEach(btn => {
  btn.addEventListener('click', () => pick(btn));
});

// Bottone "Apri in AR"
btnAR.addEventListener('click', () => {
  if(!current){
    const first = document.querySelector('.card');
    if(first){ pick(first); }
  }
  mv.activateAR();
});

// Preseleziona la prima verticale
window.addEventListener('DOMContentLoaded', () => {
  const first = document.querySelector('.card[data-orient="verticale"]');
  if(first) pick(first);
});
