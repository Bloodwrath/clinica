// Importamos Firebase correctamente
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBiYElqFixHiTHrnO01EVP8tmNIHQmp05M",
  authDomain: "clinica-60d05.firebaseapp.com",
  projectId: "clinica-60d05",
  storageBucket: "clinica-60d05.firebasestorage.app",
  messagingSenderId: "1046435421377",
  appId: "1:1046435421377:web:5d9ef87dacd113719e0840",
  measurementId: "G-TGWPKRFBKB"
};

// Inicializamos Firebase
const app = initializeApp(firebaseConfig);

// Exportamos la instancia de Firebase correctamente
export { app };
