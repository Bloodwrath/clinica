import { db } from './firebaseKey.js';
import { doc, getDoc, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const id = params.get('id');
const contenedor = document.getElementById('detalle-estudio');

// Utilidad para formatear precios con comas y máximo 2 decimales
function formatearPrecio(precio) {
  if (precio === undefined || precio === null || precio === "") return "";
  const num = Number(precio);
  if (isNaN(num)) return precio;
  return num.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

async function mostrarDetalle() {
  if (!id) {
    contenedor.innerHTML = '<div class="col-md-8"><div class="alert alert-danger">ESTUDIO NO ENCONTRADO.</div></div>';
    return;
  }
  // Obtener el estudio directamente de Firebase
  const docRef = doc(db, "ESTUDIOS", id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    contenedor.innerHTML = '<div class="col-md-8"><div class="alert alert-danger">ESTUDIO NO ENCONTRADO.</div></div>';
    return;
  }
  const data = docSnap.data();

  // Inserta la imagen en el div correspondiente
  const imagenCont = document.getElementById('detalle-imagen');
  if (imagenCont) {
    imagenCont.innerHTML = `
      <div style="position:relative;">
        <img src="assets/img/imagenFondo.jpg" alt="${data["NOMBRE"]}" class="w-100 rounded" style="object-fit:cover;max-height:240px;">
      </div>
    `;
  }

  // Inserta el detalle en el div correspondiente
  contenedor.innerHTML = `
    <h2 class="mb-3" style="font-size:2rem;font-weight:700;">${data["NOMBRE"]}</h2>
    <div class="mb-2" style="font-size:1.3rem;color:#007bff;font-weight:600;">$${formatearPrecio(data["PRECIO"])} MXN</div>
    <div id="contact-buttons" class="mb-3"></div>
    <div class="mb-3" style="font-size:1.1rem;">
      <b>Descripción:</b> ${data["DESCRIPCION"] || ""}
    </div>
    <div class="mb-3" style="font-size:1.1rem;">
      <b>Requisitos:</b> ${data["REQUISITOS"] || "CONSULTAR EN LABORATORIO"}
    </div>
    <div class="mb-2" style="font-size:1.1rem;">
      <b>Tiempo de entrega:</b> ${data["TIEMPO DE ENTREGA"] || "CONSULTAR EN LABORATORIO"}
    </div>
  `;

  // Inserta el bloque de sugerencias en el wrapper fuera del detalle
  const sugerenciasWrapper = document.getElementById('sugerencias-wrapper');
  if (sugerenciasWrapper) {
    sugerenciasWrapper.innerHTML = `
      <h5 class="mb-3" style="font-weight:600;">También te puede interesar</h5>
      <div id="sugerencias-categoria" class="row g-3"></div>
    `;
  }

  mostrarContactButtons(data["NOMBRE"]);
  mostrarSugerenciasCategoria(data["CATEGORIA"], data["NOMBRE"]);
}

function mostrarContactButtons(nombreEstudio) {
  const contactButtons = document.getElementById('contact-buttons');
  let llamarBtn = '';
  // Detección básica de dispositivo móvil
  if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    llamarBtn = `
      <a href="tel:5579416398" class="btn btn-primary m-1">
        LLAMAR
      </a>
    `;
  }
  const mensaje = encodeURIComponent(`Quiero hacer una cita para el estudio '${nombreEstudio}'`);
  contactButtons.innerHTML = `
    ${llamarBtn}
    <a href="https://wa.me/5579416398?text=${mensaje}" class="btn btn-success m-1" target="_blank" rel="noopener">
      WHATSAPP
    </a>
  `;
}

async function mostrarSugerenciasCategoria(categoria, nombreActual) {
  if (!categoria) return;
  const sugerenciasCont = document.getElementById('sugerencias-categoria');
  if (!sugerenciasCont) return;

  // Buscar estudios de la misma categoría, excluyendo el actual
  const q = query(collection(db, "ESTUDIOS"), where("CATEGORIA", "==", categoria));
  const querySnapshot = await getDocs(q);
  let sugeridos = [];
  querySnapshot.forEach(docSnap => {
    const d = docSnap.data();
    if (d["NOMBRE"] !== nombreActual) {
      sugeridos.push({
        id: docSnap.id,
        nombre: d["NOMBRE"],
        precio: d["PRECIO"],
        categoria: d["CATEGORIA"],
        // Puedes agregar imagen si la tienes en la BD
      });
    }
  });

  // Mezclar aleatoriamente y tomar hasta 4
  sugeridos = sugeridos.sort(() => Math.random() - 0.5).slice(0, 4);

  sugerenciasCont.innerHTML = sugeridos.map(s => {
    // Elimina el botón de WhatsApp en sugerencias
    return `
      <div class="col-6 col-md-3 mb-3">
        <div class="card h-100 card-clickeable-sugerido" data-id="${s.id}" style="border:none;cursor:pointer;">
          <div style="position:relative;">
            <img src="assets/img/imagenFondo.jpg" alt="${s.nombre}" class="w-100" style="height:120px;object-fit:cover;">
            <div style="position:absolute;top:10px;left:10px;color:white;font-weight:bold;font-size:1rem;text-shadow:1px 1px 6px #000,0 0 2px #000;">
              ${s.categoria || ""}
            </div>
          </div>
          <div class="card-body px-0 pt-2 pb-2">
            <div class="card-title mb-1" style="font-size:0.97rem;font-weight:500;line-height:1.2;">
              ${s.nombre}
            </div>
            <div class="fw-normal mb-1" style="font-size:0.95rem;color:#444;">
              $${formatearPrecio(s.precio)} MXN
            </div>
            <button class="btn btn-link p-0 ver-detalle-sugerido" data-id="${s.id}" style="font-size:0.93rem;text-decoration:none;color:#007bff;">Ver detalles</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Evento para ver detalles en toda la tarjeta sugerida
  sugerenciasCont.querySelectorAll('.card-clickeable-sugerido').forEach(card => {
    card.onclick = (e) => {
      if (e.target.closest('.ver-detalle-sugerido')) return;
      const id = card.getAttribute('data-id');
      window.location.href = `detalle.html?id=${id}`;
    };
  });

  // Evento para el botón "Ver detalles" (opcional, para evitar doble navegación)
  sugerenciasCont.querySelectorAll('.ver-detalle-sugerido').forEach(btn => {
    btn.onclick = () => {
      window.location.href = `detalle.html?id=${btn.getAttribute('data-id')}`;
    };
  });
}

mostrarDetalle();
