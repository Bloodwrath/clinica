import { db } from './firebaseKey.js';
import { doc, getDoc, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const id = params.get('id');
const contenedor = document.getElementById('detalle-estudio');

async function mostrarDetalle() {
  if (!id) {
    contenedor.innerHTML = '<div class="col-md-8"><div class="alert alert-danger">ESTUDIO NO ENCONTRADO.</div></div>';
    return;
  }
  const docRef = doc(db, "ESTUDIOS", id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    contenedor.innerHTML = '<div class="col-md-8"><div class="alert alert-danger">ESTUDIO NO ENCONTRADO.</div></div>';
    return;
  }
  const data = docSnap.data();

  // Restaura la imagen como antes, y muestra los detalles en el orden solicitado
  contenedor.innerHTML = `
    <div class="col-12 d-flex flex-column flex-md-row align-items-start gap-4">
      <div class="flex-shrink-0" style="width:340px;max-width:100%;">
        <div style="position:relative;">
          <img src="assets/img/imagenFondo.jpg" alt="${data["NOMBRE"]}" class="w-100 rounded" style="object-fit:cover;max-height:240px;">
        </div>
      </div>
      <div class="flex-grow-1">
        <h2 class="mb-3" style="font-size:2rem;font-weight:700;">${data["NOMBRE"]}</h2>
        <div class="mb-2" style="font-size:1.3rem;color:#007bff;font-weight:600;">$${data["PRECIO"]} MXN</div>
        <div class="mb-3" style="font-size:1.1rem;">
          <b>Descripción:</b> ${data["DESCRIPCION"] || ""}
        </div>
        <div class="mb-3" style="font-size:1.1rem;">
          <b>Requisitos:</b> ${data["REQUISITOS"] || "CONSULTAR EN LABORATORIO"}
        </div>
        <div class="mb-2" style="font-size:1.1rem;">
          <b>Tiempo de entrega:</b> ${data["TIEMPO DE ENTREGA"] || "CONSULTAR EN LABORATORIO"}
        </div>
      </div>
    </div>
    <div class="mt-5">
      <h5 class="mb-3" style="font-weight:600;">También te puede gustar</h5>
      <div id="sugerencias-categoria" class="row"></div>
    </div>
    `;

  mostrarSugerenciasCategoria(data["CATEGORIA"], data["NOMBRE"]);
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

  sugerenciasCont.innerHTML = sugeridos.map(s => `
      <div class="col-6 col-md-3 mb-3">
        <div class="card h-100" style="border:none;">
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
              $${s.precio} MXN
            </div>
            <button class="btn btn-link p-0 ver-detalle-sugerido" data-id="${s.id}" style="font-size:0.93rem;text-decoration:none;color:#007bff;">Ver detalles</button>
          </div>
        </div>
      </div>
    `).join('');

  // Evento para ver detalles de sugeridos
  sugerenciasCont.querySelectorAll('.ver-detalle-sugerido').forEach(btn => {
    btn.onclick = () => {
      window.location.href = `detalle.html?id=${btn.getAttribute('data-id')}`;
    };
  });
}

mostrarDetalle();
