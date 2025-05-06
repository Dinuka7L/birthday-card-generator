// script.js

// 1) Grab your DOM nodes
const photoInput   = document.getElementById('photoInput');
const previewImage = document.getElementById('previewImage');
const zoomSlider   = document.getElementById('zoomSlider');
const cropControls = document.getElementById('cropControls');
const cardSelect   = document.getElementById('cardSelect');
const previews     = document.getElementById('previews');

let cropper = null;

// 2) When the user uploads a file, show & crop it
photoInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    // show the <img> for Cropper
    previewImage.src = reader.result;
    previewImage.style.display = 'block';
    cropControls.style.display = 'block';

    // destroy any old cropper
    if (cropper) cropper.destroy();

    // init a new Cropper
    cropper = new Cropper(previewImage, {
      viewMode: 1,
      aspectRatio: 1,
      autoCropArea: 1,
      background: false,
      ready() {
        // once it’s ready, render your first preview
        renderPreviews();
      },
      crop() {
        // re‑render whenever the user moves/resizes the crop box
        renderPreviews();
      }
    });

    // reset zoom slider
    zoomSlider.value = 1;
  };
  reader.readAsDataURL(file);
});

// 3) Zoom slider also re‑renders
zoomSlider.addEventListener('input', () => {
  if (!cropper) return;
  cropper.zoomTo(parseFloat(zoomSlider.value));
  renderPreviews();
});

// 4) Changing the template re‑renders
cardSelect.addEventListener('change', renderPreviews);

// 5) Core render function
function renderPreviews() {
  // clear out old previews
  previews.innerHTML = '';

  if (!cropper) return;

  // if you only want the **selected** card:
  const templateSrc = cardSelect.value;
  renderOne(templateSrc);

  // — or, to show _all_ cards at once:
  // [...cardSelect.options].forEach(opt => renderOne(opt.value));
}

function renderOne(templateSrc) {
  const templateImg = new Image();
  templateImg.onload = () => {
    const cw = templateImg.width;
    const ch = templateImg.height;

    // prep a canvas the size of your card
    const canvas = document.createElement('canvas');
    canvas.width  = cw;
    canvas.height = ch;
    const ctx = canvas.getContext('2d');

    // 1) draw the card background
    ctx.drawImage(templateImg, 0, 0);

    // 2) define your circular “window” (tweak these coords/radius to match each PNG)
    const circle = { x: cw / 2, y: ch / 3, r: 100 };

    // 3) grab the cropped square from Cropper at the exact size
    const cropped = cropper.getCroppedCanvas({
      width: circle.r * 2,
      height: circle.r * 2
    });

    // 4) clip a circle & draw that cropped image in
    ctx.save();
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.r, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(
      cropped,
      circle.x - circle.r,
      circle.y - circle.r
    );
    ctx.restore();

    // 5) optional overlay text
    ctx.font = '28px serif';
    ctx.fillStyle = 'white';
    ctx.fillText('Happy Birthday!', 20, ch - 30);

    // 6) build the preview + Download button
    const block = document.createElement('div');
    block.className = 'preview-card';
    block.appendChild(canvas);

    const btn = document.createElement('button');
    btn.textContent = 'Download JPEG';
    btn.onclick = () => {
      // use toDataURL so it works everywhere
      const dataURL = canvas.toDataURL('image/jpeg', 0.9);
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = 'birthday-card.jpg';
      link.click();
    };
    block.appendChild(btn);

    previews.appendChild(block);
  };
  templateImg.src = templateSrc;
}
