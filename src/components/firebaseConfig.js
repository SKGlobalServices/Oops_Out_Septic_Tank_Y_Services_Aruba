import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth, GoogleAuthProvider } from "firebase/auth";  // Importar autenticación y proveedor de Google
import { getFirestore } from "firebase/firestore";  // Importar Firestore

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

const app = initializeApp(firebaseConfig);

const database = getDatabase(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const firestore = getFirestore(app);

export { database, auth, provider, firestore };
