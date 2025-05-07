document.addEventListener("DOMContentLoaded", () => {
    const id = localStorage.getItem("estudioDetalle");
    const data = localStorage.getItem("catalogoEstudios");
    const estudios = data ? JSON.parse(data) : [];
    const estudio = estudios.find(e => e.id === id);

    const cont = document.getElementById("detalle-estudio");
    if (!estudio) {
        cont.innerHTML = `<div class="col-12 text-center"><p>No se encontró el estudio.</p></div>`;
        return;
    }

    cont.innerHTML = `
        <div class="col-md-8">
            <div class="card shadow">
                <div class="card-body">
                    <h2 class="card-title">${estudio.nombre}</h2>
                    <p class="card-text"><strong>Descripción:</strong> ${estudio.descripcion}</p>
                    <p class="card-text"><strong>Requisitos:</strong> ${estudio.requisitos}</p>
                    <p class="card-text"><strong>Precio:</strong> $${estudio.precio}</p>
                    <a href="catalogo.html" class="btn btn-secondary mt-3">Volver al catálogo</a>
                </div>
            </div>
        </div>
    `;
});
