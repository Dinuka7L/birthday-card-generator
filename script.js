// ===== Refs =====
const photoInput  = document.getElementById('photoInput');
const cardSelect  = document.getElementById('cardSelect');
const photoX      = document.getElementById('photoX');
const photoY      = document.getElementById('photoY');
const photoScale  = document.getElementById('photoScale');
const nameInput   = document.getElementById('nameInput');
const nameX       = document.getElementById('nameX');
const nameY       = document.getElementById('nameY');
const nameScale   = document.getElementById('nameScale');
const nameColor   = document.getElementById('nameColor');
const confirmBtn  = document.getElementById('confirmBtn');
const downloadBtn = document.getElementById('downloadBtn');
const canvas      = document.getElementById('cardCanvas');
const ctx         = canvas.getContext('2d');

// ===== State =====
let userImage = null;
const templateImage = new Image();

// ===== Helpers =====
// Fit the displayed canvas via CSS transform—preserves aspect ratio!
function fitDisplayCanvas() {
  if (!canvas.width || !canvas.height) return;
  const maxW = window.innerWidth * 0.9;
  const maxH = window.innerHeight * 0.9;
  // compute uniform scale
  const scale = Math.min(maxW / canvas.width, maxH / canvas.height, 1);
  // set transform origin top-left so it shrinks toward viewport corner
  canvas.style.transformOrigin = 'top left';
  canvas.style.transform = `scale(${scale})`;
}

// Redraw then refit
function redrawAndFit() {
  drawCanvas();
  fitDisplayCanvas();
}

// ===== 1) Load template =====
cardSelect.addEventListener('change', () => {
  confirmBtn.disabled = true;
  downloadBtn.style.display = 'none';
  templateImage.src = cardSelect.value;
});
templateImage.onload = () => {
  redrawAndFit();
  confirmBtn.disabled = !userImage;
};

// ===== 2) Load photo =====
photoInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    userImage = new Image();
    userImage.onload = () => {
      redrawAndFit();
      confirmBtn.disabled = !templateImage.width;
    };
    userImage.src = reader.result;
  };
  reader.readAsDataURL(file);
});

// ===== 3) Watch controls =====
[
  photoX, photoY, photoScale,
  nameInput, nameX, nameY, nameScale, nameColor
].forEach(el => el.addEventListener('input', redrawAndFit));

// ===== 4) Draw at full native resolution =====
function drawCanvas() {
  if (!templateImage.width) return;

  // Internal resolution = template size
  canvas.width  = templateImage.width;
  canvas.height = templateImage.height;

  // Clear
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw user photo
  if (userImage) {
    const px = photoX.value * canvas.width  - (userImage.width * photoScale.value) / 2;
    const py = photoY.value * canvas.height - (userImage.height * photoScale.value) / 2;
    ctx.save();
    ctx.translate(px, py);
    ctx.scale(photoScale.value, photoScale.value);
    ctx.drawImage(userImage, 0, 0);
    ctx.restore();
  }

  // Draw template on top
  ctx.drawImage(templateImage, 0, 0);

  // Draw name overlay
  ctx.save();
  const fs = 60 * nameScale.value;
  ctx.font = `${fs}px Montserrat`;
  ctx.fillStyle = nameColor.value;
  ctx.textBaseline = 'top';
  const nx = nameX.value * canvas.width;
  const ny = nameY.value * canvas.height;
  ctx.fillText(nameInput.value || '', nx, ny);
  ctx.restore();
}

// ===== 5) Confirm → show download =====
confirmBtn.addEventListener('click', () => {
  downloadBtn.style.display = 'block';
});

// ===== 6) Download full‑res JPEG =====
downloadBtn.addEventListener('click', () => {
  const dataURL = canvas.toDataURL('image/jpeg', 0.9);
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = 'birthday-card.jpg';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// ===== 7) Refit on window resize =====
window.addEventListener('resize', fitDisplayCanvas);
