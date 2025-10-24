// Chiavi SEMPLICI (slug) per evitare problemi di click/encoding.
// I nomi file sono esattamente quelli che hai in root.
const MODELS = {
  veglia: {
    glb: "veglia_sul_mare.glb",
    usdz: "veglia_sul_mare.usdz",
    label: "Veglia sul mare"
  },
  borgo: {
    glb: "il_borgo_che_guarda_il_mare.glb",
    usdz: "il_borgo_che_guarda_il_mare.usdz",
    label: "Il borgo che guarda il mare"
  },
  castello: {
    glb: "il_castello_e_il_mare.glb",
    usdz: "il_castello_e_il_mare.usdz",
    label: "Il castello e il mare"
  },
  liberta: {
    glb: "libertà_al_tramonto.glb",
    usdz: "libertà_al_tramonto.usdz",
    label: "Libertà al tramonto"
  },
  maremma: {
    glb: "maremma.glb",
    usdz: "maremma.usdz",
    label: "Maremma"
  },
  tramonto_doro: {
    glb: "tramonto_d'oro.glb",
    usdz: "tramonto_d'oro.usdz",
    label: "Tramonto d’oro"
  }
};

const viewer = document.getElementById("viewer");
const selName = document.getElementById("selName");
const list = document.getElementById("names");
const openAR = document.getElementById("openAR");
const iosArHidden = document.getElementById("iosArHidden");

function isIOS(){
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}
function isAndroid(){
  return /Android/.test(navigator.userAgent);
}

// Per URL assoluto (richiesto da Scene Viewer)
function absUrlFrom(filename){
  const parts = filename.split(".");
  const ext = parts.pop();
  const base = parts.join(".");
  const u = new URL(`./${encodeURIComponent(base)}.${ext}`, window.location.href);
  return u.href;
}

let currentKey = null;

function selectRow(key){
  document.querySelectorAll('#names li button')
    .forEach(b => b.classList.toggle('active', b.dataset.key === key));
}

function setPreview(glb, usdz, label){
  // forza ricarica pulita del viewer
  viewer.pause && viewer.pause();
  viewer.removeAttribute('reveal'); // workaround occasionali
  viewer.src = ""; // reset
  viewer.setAttribute("ios-src", "");
  // assegna
  viewer.src = `./${encodeURIComponent(glb)}`;
  viewer.setAttribute("ios-src", `./${encodeURIComponent(usdz)}`);
  selName.textContent = label;

  // fallback anti-nero: se il GLB non ha IBL compatibile
  viewer.addEventListener('error', () => {
    selName.textContent = `${label} (errore caricamento anteprima)`;
  }, { once: true });
}

function cambiaTela(key){
  const m = MODELS[key];
  if(!m) return;
  currentKey = key;
  selectRow(key);
  setPreview(m.glb, m.usdz, m.label);
}

// Unico pulsante "Vedi in AR"
openAR.addEventListener('click', () => {
  if(!currentKey){
    const first = document.querySelector('#names button')?.dataset.key;
    if(first) cambiaTela(first); else return;
  }
  const m = MODELS[currentKey];
  if(!m) return;

  if(isIOS()){
    // Quick Look: serve un <a rel="ar"> cliccato dall'utente
    iosArHidden.href = `./${encodeURIComponent(m.usdz)}`;
    iosArHidden.click();
  } else if (isAndroid()){
    // Scene Viewer con URL assoluto al GLB
    const url = new URL('https://arvr.google.com/scene-viewer/1.0');
    url.searchParams.set('file', absUrlFrom(m.glb));
    url.searchParams.set('mode', 'ar_only');
    url.searchParams.set('title', m.label);
    window.location.href = url.toString();
  } else {
    // Desktop: prova activateAR del model-viewer (se supportato), altrimenti solo anteprima
    if (viewer.activateAR) viewer.activateAR();
  }
});

// click sui nomi
list.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-key]');
  if(!btn) return;
  cambiaTela(btn.dataset.key);
});

// default: seleziona il primo elemento
window.addEventListener('DOMContentLoaded', () => {
  const firstKey = document.querySelector('#names button')?.dataset.key;
  if(firstKey) cambiaTela(firstKey);
});
