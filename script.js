const MODELS = {
  verticale: {
    glb:  "./4quadro-verticale-40x60.glb",
    usdz: "./4quadro-verticale-40x60.usdz",
    orientation: "0deg 0deg 0deg",
    label: "60 × 40 cm"
  },
  orizzontale: {
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

let current = null;

function pick(button){
  document.querySelectorAll('.card').forEach(b => b.classList.remove('active'));
  button.classList.add('active');

  const orient = button.dataset.orient;
  const img = button.dataset.img;
  const id = button.dataset.id;

  current = { id, orient, img, label: button.dataset.label };

  const m = MODELS[orient];
  mv.setAttribute('src', m.glb);
  mv.setAttribute('ios-src', m.usdz);
  mv.orientation = m.orientation;

  selLabel.textContent = button.dataset.label;
  sizeInfo.textContent = m.label;

  // Per texture vere: abiliteremo questa quando il GLB avrà il materiale "tela"
  // applyPictureTexture(img).catch(()=>{});
}

async function applyPictureTexture(imgUrl){
  await mv.updateComplete;
  const mat = mv.model?.materials?.find(m => /picture|canvas|tela/i.test(m.name));
  if(!mat) return;
  const tex = await mv.createTexture(imgUrl);
  mat.pbrMetallicRoughness.setBaseColorTexture(tex);
}

document.querySelectorAll('.card').forEach(btn => {
  btn.addEventListener('click', () => pick(btn));
});

btnAR.addEventListener('click', () => {
  if(!current){
    const first = document.querySelector('.card');
    if(first){ pick(first); }
  }
  mv.activateAR();
});

window.addEventListener('DOMContentLoaded', () => {
  const first = document.querySelector('.card[data-orient="verticale"]');
  if(first) pick(first);
});
