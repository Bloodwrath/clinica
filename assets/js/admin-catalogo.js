import { db } from './firebaseKey.js';
import { collection, setDoc, doc, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const inputArchivo = document.getElementById('archivo-excel');
const btnSubir = document.getElementById('btn-subir');
const resultado = document.getElementById('resultado');

btnSubir.onclick = async () => {
    if (!inputArchivo.files.length) {
        resultado.innerHTML = '<div class="alert alert-warning">SELECCIONA UN ARCHIVO EXCEL.</div>';
        return;
    }
    // Eliminar todos los estudios existentes antes de subir los nuevos
    resultado.innerHTML = '<div class="alert alert-info">Eliminando estudios anteriores...</div>';
    const estudiosRef = collection(db, "ESTUDIOS");
    const snapshot = await getDocs(estudiosRef);
    let eliminados = 0;
    for (const docSnap of snapshot.docs) {
        await deleteDoc(doc(estudiosRef, docSnap.id));
        eliminados++;
    }
    resultado.innerHTML = `<div class="alert alert-info">Se eliminaron ${eliminados} estudios anteriores. Subiendo nuevos...</div>`;

    const archivo = inputArchivo.files[0];
    const reader = new FileReader();
    reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        const headers = rows[0].map(h => h.toString().trim().toUpperCase());
        const esperado = ["NOMBRE", "REQUISITOS", "DESCRIPCION", "PRECIO", "CATEGORIA", "TIEMPO DE ENTREGA"];
        if (headers.join('|') !== esperado.join('|')) {
            resultado.innerHTML = '<div class="alert alert-danger">EL ARCHIVO NO TIENE LOS ENCABEZADOS CORRECTOS. DEBE SER: NOMBRE, REQUISITOS, DESCRIPCION, PRECIO, CATEGORIA, TIEMPO DE ENTREGA</div>';
            return;
        }
        let exitos = 0, errores = 0;
        for (let i = 1; i < rows.length; i++) {
            const fila = rows[i];
            if (fila.length < 6) { errores++; continue; }
            const [nombre, requisitos, descripcion, precio, categoria, tiempoEntrega] = fila.map(x => (x || '').toString().trim().toUpperCase());
            if (!nombre) { errores++; continue; }
            try {
                await setDoc(doc(collection(db, "ESTUDIOS"), nombre), {
                    "ID": nombre,
                    "NOMBRE": nombre,
                    "REQUISITOS": requisitos,
                    "DESCRIPCION": descripcion,
                    "PRECIO": precio,
                    "CATEGORIA": categoria,
                    "TIEMPO DE ENTREGA": tiempoEntrega
                });
                exitos++;
            } catch {
                errores++;
            }
        }
        resultado.innerHTML = `<div class="alert alert-success">CATÁLOGO ACTUALIZADO. ${exitos} REGISTROS EXITOSOS, ${errores} ERRORES.</div>`;
    };
    reader.readAsArrayBuffer(archivo);
};
