// Mappa file (sono tutti in root)
const MODELS = {
  "veglia_sul_mare": {
    glb: "veglia_sul_mare.glb",
    usdz: "veglia_sul_mare.usdz",
    label: "Veglia sul mare"
  },
  "il_borgo_che_guarda_il_mare": {
    glb: "il_borgo_che_guarda_il_mare.glb",
    usdz: "il_borgo_che_guarda_il_mare.usdz",
    label: "Il borgo che guarda il mare"
  },
  "il_castello_e_il_mare": {
    glb: "il_castello_e_il_mare.glb",
    usdz: "il_castello_e_il_mare.usdz",
    label: "Il castello e il mare"
  },
  "libertà_al_tramonto": {
    glb: "libertà_al_tramonto.glb",
    usdz: "libertà_al_tramonto.usdz",
    label: "Libertà al tramonto"
  },
  "maremma": {
    glb: "maremma.glb",
    usdz: "maremma.usdz",
    label: "Maremma"
  },
  "tramonto_d&#39;oro": { // chiave dall'HTML (apostrofo codificato)
    glb: "tramonto_d'oro.glb",
    usdz: "tramonto_d'oro.usdz",
    label: "Tramonto d’oro"
  }
};

const viewer = document.getElementById("viewer");
const selName = document.getElementById("selName");
const list = document.getElementById("names");

const iosARLink = document.getElementById("iosARLink");
const androidARLink = document.getElementById("androidARLink");
const mvARBtn = document.getElementById("mvARBtn");

function isIOS(){
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}
function isAndroid(){
  return /Android/.test(navigator.userAgent);
}

// filename -> ./encoded.ext (gestisce apostrofi, spazi, accenti)
function urlFrom(filename){
  const parts = filename.split(".");
  const ext = parts.pop();
  const base = parts.join(".");
  return `./${encodeURIComponent(base)}.${ext}`;
}
// URL assoluto per Scene Viewer
function absUrlFrom(filename){
  const u = new URL(urlFrom(filename), window.location.href);
  return u.href;
}

let currentKey = null;

function selectRow(key){
  document.querySelectorAll('#names li button').forEach(b => b.classList.toggle('active', b.dataset.key === key));
}

function cambiaTela(key){
  const m = MODELS[key];
  if(!m) return;
  currentKey = key;

  const glbURL = urlFrom(m.glb);
  const usdzURL = urlFrom(m.usdz);

  // Anteprima nel viewer
  viewer.src = glbURL;
  viewer.setAttribute("ios-src", usdzURL);
  selName.textContent = m.label;
  selectRow(key);

  // Bottoni AR in base al device
  if(isIOS()){
    iosARLink.style.display = 'inline-block';
    androidARLink.style.display = 'none';
    mvARBtn.style.display = 'none'; // Quick Look è più affidabile
    iosARLink.href = usdzURL;       // link diretto al .usdz
  } else if (isAndroid()){
    iosARLink.style.display = 'none';
    androidARLink.style.display = 'inline-block';
    mvARBtn.style.display = 'none'; // Scene Viewer è più affidabile
    androidARLink.href = `https://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(absUrlFrom(m.glb))}&mode=ar_only&title=${encodeURIComponent(m.label)}`;
  } else {
    // Desktop: niente AR, solo anteprima
    iosARLink.style.display = 'none';
    androidARLink.style.display = 'none';
    mvARBtn.style.display = 'none';
  }
}

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
