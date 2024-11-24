import React, { useState } from "react";
import db from "./firebase";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Row } from "react-bootstrap";

export const Iniciarsesion = () => {
  const [email, setEmail] = useState(""); // Correo electrónico
  const [password, setPassword] = useState(""); // Contraseña
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
  try {
    const docRef = await addDoc(collection(db, "usuarios"), {
      email: email,
      password: password,
    });

    alert("Operacion exitosa");
    // Restablecer los campos del formulario
    setEmail("");
    setPassword("");
} catch (error) {
    alert("Error en operacion", error);
}
};

  // Verifica si todos los campos están llenos
  const isFormValid = email && password;

  /*
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const q = query(
        collection(db, "usuarios"),
        where("email", "==", email),
        where("password", "==", password)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        navigate("./hojadeservicios.js");
      } else {
        alert("Los datos ingresados no son válidos.");
      }
    } catch (error) {
      alert("Hubo un error al verificar los datos. " + error.message);
    }
  };
*/
  return (
    <div className="container">
      <h1>Iniciar Sesión</h1>
      <Row>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input
            type="email"
            id="email"
            className="form-control"
            placeholder="Correo electronico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <input
            type="password"
            id="password"
            className="form-control"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={!isFormValid}>
          Ingresar
        </button>
      </form>
      </Row>
    </div>
  );
};


export default Iniciarsesion;