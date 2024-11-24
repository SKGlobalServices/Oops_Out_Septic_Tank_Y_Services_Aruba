import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB53zWuI5_po2oIhI-I8pZa-o4p4Iz521A",
  authDomain: "oops-out-septic-tank.firebaseapp.com",
  projectId: "oops-out-septic-tank",
  storageBucket: "oops-out-septic-tank.appspot.com",
  messagingSenderId: "114814305323",
  appId: "1:114814305323:web:337c44947d9937d423966e",
  measurementId: "G-SD3NV7VTCJ"
};

// Inicializa Firebase con la configuración proporcionada
const app = initializeApp(firebaseConfig);

// Obtiene la instancia de Firestore
const db = getFirestore(app);
// Google analytics

export default db;