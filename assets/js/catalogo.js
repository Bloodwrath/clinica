// Versión: 2.0.1
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, collection, query, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { app } from "./firebaseKey.js";
import * as XLSX from "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm";

// Variables globales
let estudios = [];
let estudiosFiltrados = [];
let nombresEstudios = [];
const ESTUDIOS_POR_PAGINA = 18;
let paginaActual = 1;

// Inicializar Firebase
const auth = getAuth(app);
export const db = getFirestore(app); // Firestore Database

// Cargar estudios desde localStorage o inicializar vacío
function cargarEstudios() {
    const data = localStorage.getItem("catalogoEstudios");
    estudios = data ? JSON.parse(data) : [];
    estudiosFiltrados = [...estudios];
    nombresEstudios = estudios.map(e => e.nombre);
}

// Guardar estudios en localStorage
function guardarEstudios() {
    localStorage.setItem("catalogoEstudios", JSON.stringify(estudios));
}

// Renderizar catálogo
function renderCatalogo(pagina = 1) {
    const catalogo = document.getElementById("Catalogo");
    catalogo.innerHTML = "";
    const inicio = (pagina - 1) * ESTUDIOS_POR_PAGINA;
    const fin = inicio + ESTUDIOS_POR_PAGINA;
    const paginaEstudios = estudiosFiltrados.slice(inicio, fin);

    if (paginaEstudios.length === 0) {
        catalogo.innerHTML = "<div class='col-12 text-center'><p>No se encontraron estudios.</p></div>";
        renderPaginacion(1);
        return;
    }

    paginaEstudios.forEach(estudio => {
        const card = document.createElement("div");
        card.className = "col-md-4 mb-4";
        card.innerHTML = `
            <div class="card h-100 shadow-sm">
                ${estudio.imagen ? `<img src="${estudio.imagen}" class="card-img-top" alt="Imagen del estudio">` : ''}
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${estudio.nombre}</h5>
                    <p class="card-text">${estudio.descripcion}</p>
                    <p class="card-text"><strong>Precio:</strong> $${estudio.precio}</p>
                    ${estudio.categoria ? `<span class="badge bg-info mb-2">${estudio.categoria}</span>` : ''}
                    <button class="btn btn-primary mt-auto" onclick="verDetalleEstudio('${estudio.id}')">Ver detalles</button>
                </div>
            </div>
        `;
        catalogo.appendChild(card);
    });

    renderPaginacion(Math.ceil(estudiosFiltrados.length / ESTUDIOS_POR_PAGINA));
}

// Renderizar paginación
function renderPaginacion(totalPaginas) {
    const paginacion = document.getElementById("paginacion-catalogo");
    paginacion.innerHTML = "";

    if (totalPaginas <= 1) return;

    // Botón anterior
    paginacion.innerHTML += `
        <li class="page-item${paginaActual === 1 ? " disabled" : ""}">
            <a class="page-link" href="#" data-pag="${paginaActual - 1}">&laquo;</a>
        </li>
    `;

    for (let i = 1; i <= totalPaginas; i++) {
        paginacion.innerHTML += `
            <li class="page-item${paginaActual === i ? " active" : ""}">
                <a class="page-link" href="#" data-pag="${i}">${i}</a>
            </li>
        `;
    }

    // Botón siguiente
    paginacion.innerHTML += `
        <li class="page-item${paginaActual === totalPaginas ? " disabled" : ""}">
            <a class="page-link" href="#" data-pag="${paginaActual + 1}">&raquo;</a>
        </li>
    `;

    // Eventos de paginación
    paginacion.querySelectorAll("a.page-link").forEach(link => {
        link.onclick = (e) => {
            e.preventDefault();
            const pag = parseInt(link.getAttribute("data-pag"));
            if (pag >= 1 && pag <= totalPaginas) {
                paginaActual = pag;
                renderCatalogo(paginaActual);
            }
        };
    });
}

// Buscar estudios
function buscarEstudios(texto) {
    if (!texto) {
        estudiosFiltrados = [...estudios];
    } else {
        estudiosFiltrados = estudios.filter(e => e.nombre.toLowerCase().includes(texto.toLowerCase()));
    }
    paginaActual = 1;
    renderCatalogo(paginaActual);
}

// Autocompletado
function setupAutocompletado() {
    const input = document.getElementById("busqueda-estudios");
    const sugerencias = document.getElementById("sugerencias-busqueda");

    input.addEventListener("input", () => {
        const valor = input.value.trim().toLowerCase();
        sugerencias.innerHTML = "";
        if (!valor) return;
        const coincidencias = nombresEstudios.filter(nombre => nombre.toLowerCase().includes(valor));
        coincidencias.slice(0, 8).forEach(nombre => {
            const div = document.createElement("div");
            div.className = "sugerencia-item";
            div.textContent = nombre;
            div.onclick = () => {
                input.value = nombre;
                sugerencias.innerHTML = "";
                buscarEstudioExacto(nombre);
            };
            sugerencias.appendChild(div);
        });
    });

    document.addEventListener("click", (e) => {
        if (!sugerencias.contains(e.target) && e.target !== input) {
            sugerencias.innerHTML = "";
        }
    });
}

// Buscar estudio exacto
function buscarEstudioExacto(nombre) {
    estudiosFiltrados = estudios.filter(e => e.nombre === nombre);
    paginaActual = 1;
    renderCatalogo(paginaActual);
}

// Ver detalles de estudio
window.verDetalleEstudio = function (id) {
    localStorage.setItem("estudioDetalle", id);
    window.location.href = "detalle.html";
};

// Cargar Excel
function setupCargaExcel() {
    const inputExcel = document.getElementById("input-excel");
    inputExcel.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        const headers = rows[0].map(h => h.toLowerCase().trim());
        const idxNombre = headers.indexOf("nombre del estudio");
        const idxRequisitos = headers.indexOf("requisitos");
        const idxDescripcion = headers.indexOf("descripcion del estudio");
        const idxPrecio = headers.indexOf("precio");
        const idxImagen = headers.indexOf("imagen");
        const idxCategoria = headers.indexOf("categoria");
        if (idxNombre === -1 || idxRequisitos === -1 || idxDescripcion === -1 || idxPrecio === -1) {
            alert("El archivo Excel no tiene los encabezados requeridos.");
            return;
        }
        const nuevosEstudios = [];
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row[idxNombre]) continue;
            nuevosEstudios.push({
                id: crypto.randomUUID(),
                nombre: row[idxNombre],
                requisitos: row[idxRequisitos] || "",
                descripcion: row[idxDescripcion] || "",
                precio: row[idxPrecio] || "",
                imagen: idxImagen !== -1 ? row[idxImagen] : "",
                categoria: idxCategoria !== -1 ? row[idxCategoria] : ""
            });
        }
        estudios = nuevosEstudios;
        guardarEstudios();
        cargarEstudios();
        renderCatalogo(1);
        alert("Catálogo actualizado correctamente.");
        inputExcel.value = "";
    });
}

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
    cargarEstudios();
    renderCatalogo();
    setupAutocompletado();
    setupCargaExcel();

    // Buscar al escribir en la barra de búsqueda
    document.getElementById("busqueda-estudios").addEventListener("keyup", (e) => {
        if (e.key === "Enter") {
            buscarEstudios(e.target.value);
        }
    });
});
