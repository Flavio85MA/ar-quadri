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
  "tramonto_d&#39;oro": { // chiave dall'onclick in HTML
    glb: "tramonto_d'oro.glb",
    usdz: "tramonto_d'oro.usdz",
    label: "Tramonto d’oro"
  }
};

const viewer = document.getElementById("viewer");
const selName = document.getElementById("selName");

const iosARLink = document.getElementById("iosARLink");
const androidARLink = document.getElementById("androidARLink");
const mvARBtn = document.getElementById("mvARBtn");
const openStandalone = document.getElementById("openStandalone");

function isIOS(){
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}
function isAndroid(){
  return /Android/.test(navigator.userAgent);
}
function inIframe(){
  try { return window.self !== window.top; } catch(e){ return true; }
}

// filename -> ./encoded.ext (gestisce apostrofi e accenti)
function urlFrom(filename){
  const parts = filename.split(".");
  const ext = parts.pop();
  const base = parts.join(".");
  return `./${encodeURIComponent(base)}.${ext}`;
}
// URL assoluto (richiesto da Scene Viewer)
function absUrlFrom(filename){
  const u = new URL(urlFrom(filename), window.location.href);
  return u.href;
}

// costruisce link scene-viewer per Android
function sceneViewerUrl(fileAbsUrl, title){
  const base = 'https://arvr.google.com/scene-viewer/1.0';
  const params = new URLSearchParams({
    file: fileAbsUrl,
    mode: 'ar_only',
    title: title
  });
  return `${base}?${params.toString()}`;
}

let currentKey = null;

function cambiaTela(key){
  const m = MODELS[key];
  if(!m) return;
  currentKey = key;

  const glbURL = urlFrom(m.glb);
  const usdzURL = urlFrom(m.usdz);

  // aggiorna preview
  viewer.src = glbURL;
  viewer.setAttribute("ios-src", usdzURL);
  selName.textContent = m.label;

  // configura bottoni AR
  const standaloneUrl = `${location.origin}${location.pathname}?m=${encodeURIComponent(key)}`;
  openStandalone.href = standaloneUrl;

  if(isIOS()){
    iosARLink.style.display = 'inline-block';
    androidARLink.style.display = 'none';
    // link Quick Look deve puntare direttamente al .usdz
    iosARLink.href = urlFrom(m.usdz);
    mvARBtn.style.display = inIframe() ? 'none' : 'inline-block';
    openStandalone.style.display = inIframe() ? 'inline-block' : 'none';
  } else if (isAndroid()){
    iosARLink.style.display = 'none';
    androidARLink.style.display = 'inline-block';
    // Scene Viewer vuole URL assoluto del GLB
    androidARLink.href = sceneViewerUrl(absUrlFrom(m.glb), m.label);
    mvARBtn.style.display = inIframe() ? 'none' : 'inline-block';
    openStandalone.style.display = inIframe() ? 'inline-block' : 'none';
  } else {
    // Desktop: nessun AR, solo anteprima; offri standalone
    iosARLink.style.display = 'none';
    androidARLink.style.display = 'none';
    mvARBtn.style.display = 'none';
    openStandalone.style.display = 'inline-block';
  }
}

// tasto AR di model-viewer (funziona bene solo FUORI da iframe)
mvARBtn.addEventListener('click', () => {
  viewer.activateAR();
});

// pre-selezione da querystring
(function init(){
  const params = new URLSearchParams(location.search);
  const key = params.get("m");
  if(key && MODELS[key]) cambiaTela(key);
  else cambiaTela(Object.keys(MODELS)[0]);
})();
