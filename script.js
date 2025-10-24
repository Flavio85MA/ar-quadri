// Mappa dei modelli: i file sono nella root del repo.
// Useremo encodeURIComponent per gestire caratteri speciali (es. apostrofo).
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
  // nota: qui la chiave contiene l'apostrofo HTML (&#39;) perché arriva dall'onclick in index.html
  "tramonto_d&#39;oro": {
    glb: "tramonto_d'oro.glb",
    usdz: "tramonto_d'oro.usdz",
    label: "Tramonto d’oro"
  }
};

const viewer = document.getElementById("viewer");
const selName = document.getElementById("selName");
const btnOpenAR = document.getElementById("openAR");

function urlFrom(filename){
  // Converte il nome file in URL sicuro (gestisce apostrofi e accenti)
  // Esempio: "tramonto_d'oro.glb" -> "tramonto_d%27oro.glb"
  const parts = filename.split(".");
  const ext = parts.pop();
  const base = parts.join(".");
  return `./${encodeURIComponent(base)}.${ext}`;
}

function cambiaTela(key){
  const m = MODELS[key];
  if(!m) return;

  const glbURL = urlFrom(m.glb);
  const usdzURL = urlFrom(m.usdz);

  viewer.src = glbURL;
  viewer.setAttribute("ios-src", usdzURL);
  selName.textContent = m.label;
}

// Pulsante "Apri in AR" (chiama l’AR nativa del device)
btnOpenAR.addEventListener("click", () => {
  // Se non è selezionato nulla, prendi il primo
  if(!viewer.src){
    cambiaTela(Object.keys(MODELS)[0]);
  }
  viewer.activateAR();
});

// Pre-selezione da querystring ?m=chiave (opzionale, utile per link da GHL)
(function(){
  const params = new URLSearchParams(location.search);
  const key = params.get("m");
  if(key && MODELS[key]){
    cambiaTela(key);
  } else {
    // di default carica il primo modello
    cambiaTela(Object.keys(MODELS)[0]);
  }
})();
