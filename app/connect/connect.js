const qrImg = document.getElementById('qr-img');
const urlText = document.getElementById('url-text');
const copyBtn = document.getElementById('copy-btn');

window.addEventListener('DOMContentLoaded', async () => {
  if (window.connectApi) {
    const data = await window.connectApi.getData();
    if (data.qrDataUrl) {
      qrImg.src = data.qrDataUrl;
    }
    urlText.value = data.url;

    copyBtn.addEventListener('click', async () => {
      await window.connectApi.copyUrl(data.url);
      copyBtn.textContent = '¡Copiado!';
      setTimeout(() => { copyBtn.textContent = 'Copiar'; }, 2000);
    });
  }
});
