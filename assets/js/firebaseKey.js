// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBiYElqFixHiTHrnO01EVP8tmNIHQmp05M",
  authDomain: "clinica-60d05.firebaseapp.com",
  projectId: "clinica-60d05",
  storageBucket: "clinica-60d05.firebasestorage.app",
  messagingSenderId: "1046435421377",
  appId: "1:1046435421377:web:5d9ef87dacd113719e0840",
  measurementId: "G-TGWPKRFBKB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Exportamos la instancia de Firebase correctamente
export { app };
export const db = getFirestore(app);
