// Importar las funciones necesarias de Firebase
import { initializeApp } from "firebase/app"; 
import { getDatabase } from "firebase/database";

// Configuración de Firebase (usa tus credenciales)
const firebaseConfig = {
  apiKey: "AIzaSyBl3hSY_JN75LnLrEaNNyZP8Xud9PzwDc4",
  authDomain: "oops-out-septic-tank-5f92a.firebaseapp.com",
  projectId: "oops-out-septic-tank-5f92a",
  storageBucket: "oops-out-septic-tank-5f92a.appspot.com",
  messagingSenderId: "113759038919",
  appId: "1:113759038919:web:bfd7c5c01439c8f3d3fde2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };