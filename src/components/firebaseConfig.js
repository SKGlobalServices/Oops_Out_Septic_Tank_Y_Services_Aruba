// Importar las funciones necesarias de Firebase
import { initializeApp } from "firebase/app"; 
import { getDatabase } from "firebase/database";

// Configuración de Firebase (usa tus credenciales)
const firebaseConfig = {
  apiKey: "AIzaSyB53zWuI5_po2oIhI-I8pZa-o4p4Iz521A",
  authDomain: "oops-out-septic-tank.firebaseapp.com",
  databaseURL: "https://oops-out-septic-tank-default-rtdb.firebaseio.com",
  projectId: "oops-out-septic-tank",
  storageBucket: "oops-out-septic-tank.firebasestorage.app",
  messagingSenderId: "114814305323",
  appId: "1:114814305323:web:337c44947d9937d423966e",
  measurementId: "G-SD3NV7VTCJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };