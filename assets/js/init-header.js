// Mostrar loader mientras se carga el header
function mostrarLoader() {
    let loader = document.getElementById('global-loader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'global-loader';
        loader.style.position = 'fixed';
        loader.style.top = 0;
        loader.style.left = 0;
        loader.style.width = '100vw';
        loader.style.height = '100vh';
        loader.style.background = 'rgba(255,255,255,0.85)';
        loader.style.zIndex = 9999;
        loader.style.display = 'flex';
        loader.style.alignItems = 'center';
        loader.style.justifyContent = 'center';
        loader.innerHTML = `<div class="spinner-border text-primary" style="width:3rem;height:3rem;" role="status"><span class="visually-hidden">Cargando...</span></div>`;
        document.body.appendChild(loader);
    } else {
        loader.style.display = 'flex';
    }
}
function ocultarLoader() {
    const loader = document.getElementById('global-loader');
    if (loader) loader.style.display = 'none';
}

mostrarLoader();
fetch('header.html')
    .then(res => res.text())
    .then(html => { document.getElementById('header').innerHTML = html; })
    .then(() => import('./header.js'))
    .finally(() => {
        // Espera un pequeño tiempo para asegurar que el DOM se actualizó
        setTimeout(ocultarLoader, 200);
    });
