'use strict';
});
}


async function fileExists(url) {
try {
const res = await fetch(url, { method: 'HEAD', cache: 'no-store' });
return res.ok;
} catch { return false; }
}


function showPoster(src) {
if (!src) { previewImg.style.display = 'none'; placeholder.hidden = false; return; }
const img = new Image();
img.onload = () => {
previewImg.src = src; previewImg.style.display = 'block'; placeholder.hidden = true;
};
img.onerror = () => {
previewImg.style.display = 'none'; placeholder.hidden = false;
};
img.src = src;
}


async function selectQuadro(index) {
const buttons = listEl.querySelectorAll('.item');
buttons.forEach(b => b.setAttribute('aria-current', 'false'));
const btn = buttons[index];
if (btn) btn.setAttribute('aria-current', 'true');


selected = QUADRI[index];
titleEl.textContent = selected.nome;


// Aggiorna anteprima stabile con poster JPG
showPoster(selected.poster);


// Configura model-viewer per AR
mv.setAttribute('src', selected.glb);
mv.setAttribute('ios-src', selected.usdz);


// Abilita/disabilita "Vedi in AR" in base ai file disponibili
const [hasGLB, hasUSDZ] = await Promise.all([fileExists(selected.glb), fileExists(selected.usdz)]);
const okForIOS = hasUSDZ;
const okForAndroid = hasGLB;
let enabled = (isIOS && okForIOS) || (!isIOS && okForAndroid);
if (!enabled && (okForIOS || okForAndroid)) enabled = true; // consenti fallback di model-viewer


btnAR.disabled = !enabled;
btnAR.title = '';
if (!enabled) btnAR.title = isIOS ? 'Manca il file USDZ per iOS' : 'Manca il file GLB per Android/Web';
}


// Click su "Vedi in AR"
btnAR.addEventListener('click', async () => {
if (!selected) return;
try {
await mv.activateAR();
} catch (e) {
alert('AR non disponibile su questo dispositivo o file non trovati.');
console.warn(e);
}
});


// Init
buildList();
// Se vuoi selezionare automaticamente il primo disponibile, decommenta:
// selectQuadro(0);
