let currentStep = 1;
const totalSteps = 4;

const paneMap = {
  1: document.getElementById('pane-1'),
  2: document.getElementById('pane-2'),
  3: document.getElementById('pane-3'),
  4: document.getElementById('pane-4'),
};

const moviesInput = document.getElementById('movies-path');
const showsInput = document.getElementById('shows-path');
const tmdbKeyInput = document.getElementById('tmdb-key');

function showStep(step) {
  if (step < 1 || step > totalSteps) return;
  currentStep = step;

  // Actualizar paneles
  Object.keys(paneMap).forEach((k) => {
    paneMap[k].classList.toggle('active', parseInt(k) === step);
  });

  // Actualizar barra lateral
  document.querySelectorAll('.step-item').forEach((item) => {
    const s = parseInt(item.getAttribute('data-step'));
    item.classList.toggle('active', s === step);
  });
}

// Navegación siguiente / anterior
document.querySelectorAll('.next-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    if (currentStep === 3) {
      if (!moviesInput.value && !showsInput.value) {
        alert('Por favor selecciona al menos una carpeta para Películas o Series.');
        return;
      }
    }
    showStep(currentStep + 1);
  });
});

document.querySelectorAll('.prev-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    showStep(currentStep - 1);
  });
});

// Selección de carpetas mediante Electron API
document.querySelectorAll('.browse-btn').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const targetId = btn.getAttribute('data-target');
    const input = document.getElementById(targetId);
    if (window.wizardApi) {
      const selectedPath = await window.wizardApi.selectFolder();
      if (selectedPath) {
        input.value = selectedPath;
      }
    }
  });
});

// Enlace externo de TMDb
document.getElementById('link-tmdb')?.addEventListener('click', (e) => {
  e.preventDefault();
  // Se abre a través de shell si fuera necesario
});

// Guardar y arrancar
document.getElementById('btn-finish')?.addEventListener('click', async () => {
  const finishBtn = document.getElementById('btn-finish');
  finishBtn.disabled = true;
  finishBtn.textContent = 'Iniciando servidor...';

  const libraries = [];
  if (moviesInput.value) {
    libraries.push({ name: 'Películas', path: moviesInput.value, kind: 'movie' });
  }
  if (showsInput.value) {
    libraries.push({ name: 'Series', path: showsInput.value, kind: 'show' });
  }

  const payload = {
    libraries,
    tmdbApiKey: tmdbKeyInput.value.trim() || undefined,
  };

  if (window.wizardApi) {
    await window.wizardApi.saveAndStart(payload);
  }
});

// Cargar configuración existente si la hubiera
window.addEventListener('DOMContentLoaded', async () => {
  if (window.wizardApi) {
    const cfg = await window.wizardApi.getConfig();
    if (cfg && cfg.libraries) {
      const movieLib = cfg.libraries.find((l) => l.kind === 'movie');
      const showLib = cfg.libraries.find((l) => l.kind === 'show');
      if (movieLib) moviesInput.value = movieLib.path;
      if (showLib) showsInput.value = showLib.path;
      if (cfg.tmdbApiKey) tmdbKeyInput.value = cfg.tmdbApiKey;
    }
  }
});
