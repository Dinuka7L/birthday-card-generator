// DOM refs
const photoInput   = document.getElementById('photoInput');
const zoomSlider   = document.getElementById('zoomSlider');
const cardSelect   = document.getElementById('cardSelect');
const nameInput    = document.getElementById('nameInput');
const messageInput = document.getElementById('messageInput');
const previews     = document.getElementById('previews');

// State for the user image
let userImage = null;
let imgX = 0, imgY = 0, imgScale = 1;
let isDragging = false, dragStartX = 0, dragStartY = 0;

// 1) Load image
document.getElementById('photoInput').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    userImage = new Image();
    userImage.onload = () => {
      // center initially
      imgScale = 1;
      imgX = (400 - userImage.width) / 2;
      imgY = (300 - userImage.height) / 2;
      renderPreviews();
    };
    userImage.src = reader.result;
  };
  reader.readAsDataURL(file);
});

// 2) Zoom slider updates scale
zoomSlider.addEventListener('input', e => {
  imgScale = parseFloat(e.target.value);
  renderPreviews();
});

// 3) Template, name or message changes
[nameInput, messageInput, cardSelect].forEach(el =>
  el.addEventListener('input', renderPreviews)
);

// 4) Main render function
function renderPreviews() {
  previews.innerHTML = '';
  if (!userImage) return;
  renderOne(cardSelect.value);
}

// 5) Render one template
function renderOne(templateSrc) {
  const templateImg = new Image();
  templateImg.onload = () => {
    const cw = templateImg.width;
    const ch = templateImg.height;
    const block = document.createElement('div');
    block.className = 'preview-card';
    block.style.position = 'relative';

    const canvas = document.createElement('canvas');
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext('2d');

    // draw user image behind
    ctx.save();
    ctx.translate(imgX, imgY);
    ctx.scale(imgScale, imgScale);
    ctx.drawImage(userImage, 0, 0);
    ctx.restore();

    // draw template on top
    ctx.drawImage(templateImg, 0, 0);

    // add name overlay
    ctx.font = 'bold 40px Montserrat';
    ctx.fillStyle = '#fff';
    ctx.fillText(nameInput.value || 'Your Name', 50, 80);

    // add custom message overlay
    ctx.font = 'italic 28px Montserrat';
    ctx.fillText(messageInput.value || 'Your custom message', 50, ch - 60);

    // fade in
    canvas.style.opacity = '0';
    canvas.style.transition = 'opacity 0.5s ease';
    setTimeout(() => canvas.style.opacity = '1', 50);

    // enable dragging the photo
    enablePhotoDrag(canvas);

    block.appendChild(canvas);

    // download button
    const btn = document.createElement('button');
    btn.textContent = 'Download JPG';
    btn.onclick = () => {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/jpeg', 0.9);
      link.download = 'birthday-card.jpg';
      link.click();
    };
    block.appendChild(btn);

    previews.appendChild(block);
  };
  templateImg.src = templateSrc;
}

// 6) Drag logic for the photo layer
function enablePhotoDrag(canvas) {
  canvas.addEventListener('pointerdown', e => {
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', e => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    imgX += dx;
    imgY += dy;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    renderPreviews();
  });
  canvas.addEventListener('pointerup', e => {
    isDragging = false;
    canvas.releasePointerCapture(e.pointerId);
  });
}
