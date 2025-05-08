// Versión: 2.0.1
import { db } from './firebaseKey.js';
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Variables globales
const catalogoContainer = document.getElementById('Catalogo');
const paginacion = document.getElementById('paginacion-catalogo');
const inputBusqueda = document.getElementById('busqueda-estudio');
const sugerencias = document.getElementById('sugerencias-busqueda');

let estudios = [];
let estudiosFiltrados = [];
let nombresEstudios = [];
let paginaActual = 1;
const estudiosPorPagina = 18;

// Cargar estudios desde Firebase
async function cargarEstudios() {
    const q = query(collection(db, "ESTUDIOS"));
    const querySnapshot = await getDocs(q);
    estudios = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        estudios.push({
            id: doc.id,
            nombre: data["NOMBRE"] || "",
            requisitos: data["REQUISITOS"] || "",
            descripcion: data["DESCRIPCION"] || "",
            precio: data["PRECIO"] || ""
        });
    });
    estudios.sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));
    nombresEstudios = estudios.map(e => e.nombre);
    estudiosFiltrados = [...estudios];
    mostrarPagina(1);
    generarPaginacion();
}
cargarEstudios();

// Mostrar una página del catálogo
function mostrarPagina(numPagina) {
    paginaActual = numPagina;
    catalogoContainer.innerHTML = '';
    const inicio = (numPagina - 1) * estudiosPorPagina;
    const fin = inicio + estudiosPorPagina;
    const paginaEstudios = estudiosFiltrados.slice(inicio, fin);

    paginaEstudios.forEach((estudio) => {
        const col = document.createElement('div');
        col.className = 'col-md-4 mb-4 d-flex justify-content-center';
        col.innerHTML = `
        <div class="card" style="width: 18rem; border: none; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <div style="position:relative;">
            <img src="assets/img/imagenFondo.jpg" alt="${estudio.nombre}" class="w-100" style="height:180px;object-fit:cover;">
            <div style="position:absolute;top:12px;left:16px;color:white;font-weight:bold;font-size:1.25rem;letter-spacing:1px;text-shadow:1px 1px 8px #000,0 0 2px #000;">
              ${estudio.categoria || ""}
            </div>
          </div>
          <div class="card-body px-0 pt-2 pb-3">
            <div class="card-title mb-1" style="font-size:1.05rem;font-weight:500;line-height:1.2;">
              ${estudio.nombre}
            </div>
            <div class="fw-normal mb-1" style="font-size:1rem;color:#444;">
              $${estudio.precio} MXN
            </div>
            <button class="btn btn-link p-0 mt-1 ver-detalle" data-id="${estudio.id}" style="font-size:0.97rem;text-decoration:none;color:#007bff;">Ver detalles</button>
          </div>
        </div>
        `;
        catalogoContainer.appendChild(col);
    });

    // Evento para ver detalles
    document.querySelectorAll('.ver-detalle').forEach(btn => {
        btn.onclick = (e) => {
            const id = btn.getAttribute('data-id');
            window.location.href = `detalle.html?id=${id}`;
        };
    });
}

// Generar paginación
function generarPaginacion() {
    paginacion.innerHTML = '';
    const totalPaginas = Math.ceil(estudiosFiltrados.length / estudiosPorPagina);
    if (totalPaginas <= 1) return;

    // Botón anterior
    paginacion.innerHTML += `<li class="page-item${paginaActual === 1 ? ' disabled' : ''}">
    <a class="page-link" href="#" data-pag="${paginaActual - 1}">&laquo;</a>
  </li>`;

    // Botones de página
    for (let i = 1; i <= totalPaginas; i++) {
        paginacion.innerHTML += `<li class="page-item${i === paginaActual ? ' active' : ''}">
      <a class="page-link" href="#" data-pag="${i}">${i}</a>
    </li>`;
    }

    // Botón siguiente
    paginacion.innerHTML += `<li class="page-item${paginaActual === totalPaginas ? ' disabled' : ''}">
    <a class="page-link" href="#" data-pag="${paginaActual + 1}">&raquo;</a>
  </li>`;

    // Eventos de paginación
    paginacion.querySelectorAll('a').forEach(a => {
        a.onclick = (e) => {
            e.preventDefault();
            const pag = parseInt(a.getAttribute('data-pag'));
            if (pag >= 1 && pag <= totalPaginas) {
                mostrarPagina(pag);
                generarPaginacion();
            }
        };
    });
}

// Barra de búsqueda con autocompletado
inputBusqueda.addEventListener('input', () => {
    const valor = inputBusqueda.value.trim().toUpperCase();
    sugerencias.innerHTML = '';
    if (!valor) {
        sugerencias.style.display = 'none';
        estudiosFiltrados = [...estudios];
        mostrarPagina(1);
        generarPaginacion();
        return;
    }
    const sugeridos = nombresEstudios.filter(n => n.includes(valor));
    if (sugeridos.length) {
        sugeridos.slice(0, 8).forEach(sug => {
            const item = document.createElement('a');
            item.className = 'list-group-item list-group-item-action text-uppercase';
            item.textContent = sug;
            item.onclick = () => {
                inputBusqueda.value = sug;
                sugerencias.innerHTML = '';
                sugerencias.style.display = 'none';
                buscarPorNombreExacto(sug);
            };
            sugerencias.appendChild(item);
        });
        sugerencias.style.display = 'block';
    } else {
        sugerencias.style.display = 'none';
    }
});

// Buscar por nombre exacto
function buscarPorNombreExacto(nombre) {
    estudiosFiltrados = estudios.filter(e => e.nombre === nombre);
    mostrarPagina(1);
    generarPaginacion();
}

// Si se borra la búsqueda, mostrar todo
inputBusqueda.addEventListener('blur', () => {
    setTimeout(() => { sugerencias.innerHTML = ''; sugerencias.style.display = 'none'; }, 200);
});
