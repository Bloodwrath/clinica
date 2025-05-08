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
        col.className = 'col-md-4 mb-4';
        col.innerHTML = `
      <div class="card h-100 shadow-sm">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title text-uppercase">${estudio.nombre}</h5>
          <p class="card-text">${estudio.descripcion}</p>
          <div class="mt-auto">
            <button class="btn btn-primary w-100 ver-detalle" data-id="${estudio.id}">VER DETALLES</button>
          </div>
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
