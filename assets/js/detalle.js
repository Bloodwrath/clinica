import { db } from './firebaseKey.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

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
    contenedor.innerHTML = `
    <div class="col-md-8">
      <div class="card shadow">
        <div class="card-body">
          <h2 class="card-title text-uppercase">${data["NOMBRE"]}</h2>
          <h5 class="mt-4">DESCRIPCIÓN</h5>
          <p>${data["DESCRIPCION"]}</p>
          <h5 class="mt-4">REQUISITOS</h5>
          <p>${data["REQUISITOS"]}</p>
          <h5 class="mt-4">PRECIO</h5>
          <p class="fw-bold">$${data["PRECIO"]}</p>
        </div>
      </div>
    </div>
  `;
}
mostrarDetalle();
