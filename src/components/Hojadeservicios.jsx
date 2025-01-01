import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { database } from "./firebaseConfig"; // Ajusta la ruta si es necesario
import { ref, set, get, update, push, remove } from "firebase/database";

const Homepage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [data, setData] = useState([]); // Inicializamos como un array vacío
  const [showSidebar, setShowSidebar] = useState(false); // Estado para mostrar u ocultar la barra lateral
  const [showPassword, setShowPassword] = useState(false); // Estado para mostrar u ocultar la contraseña
  const sidebarRef = useRef(null); // Referencia a la barra lateral

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/"); // Redirige de nuevo a la página de login
  };

  // Función para obtener los datos desde Firebase
  const fetchData = async () => {
    try {
      const dbRef = ref(database, "users");
      const snapshot = await get(dbRef);
      if (snapshot.exists()) {
        setData(Object.entries(snapshot.val())); // Usa Object.entries para manejar la lista de datos
      } else {
        console.log("No data available");
        setData([]); // Asegura que data sea un array vacío si no hay datos
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
      setData([]); // Asegura que data sea un array vacío en caso de error
    }
  };

  // Fetch data from Firebase on page load
  useEffect(() => {
    fetchData();
  }, []);  

  // Crear un nuevo usuario en la base de datos de Firebase
  const addUser = (email, password) => {
    const dbRef = ref(database, "users");
    const newUserRef = push(dbRef); // Usamos push para crear un nuevo nodo
    set(newUserRef, {
      email: email,
      password: password,
    }).then(() => {
      alert("User added to Firebase!");
      // Después de agregar el usuario, actualizamos la lista de datos
      fetchData();
    }).catch((error) => {
      console.error("Error adding user: ", error);
    });
  };

  // Eliminar un usuario de la base de datos de Firebase
  const deleteUser = (id) => {
    const dbRef = ref(database, `users/${id}`);
    remove(dbRef)
      .then(() => {
        alert("User deleted from Firebase!");
        // Después de eliminar el usuario, actualizamos la lista de datos
        fetchData();
      })
      .catch((error) => {
        console.error("Error deleting user: ", error);
      });
  };

  // Manejar la actualización de un campo específico
  const handleFieldChange = (id, field, value) => {
    const dbRef = ref(database, `users/${id}`);
    update(dbRef, { [field]: value })
      .then(() => {
        // Actualizar el estado local de `data` con los nuevos valores
        const updatedData = data.map(([key, item]) =>
          key === id ? [key, { ...item, [field]: value }] : [key, item]
        );
        setData(updatedData); // Actualiza el estado local con los nuevos valores
      })
      .catch((error) => {
        console.error("Error updating data: ", error);
      });
  };

  // Función para alternar la visibilidad de la contraseña
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Función para alternar la visibilidad de la barra lateral
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  // Función para cerrar la barra lateral si se hace clic fuera de ella
  const handleClickOutside = (e) => {
    if (sidebarRef.current && !sidebarRef.current.contains(e.target) && !e.target.closest('.show-sidebar-button')) {
      setShowSidebar(false); // Cierra la barra lateral si el clic está fuera de ella
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!user) {
    return <p className="error-message">User not logged in!</p>;
  }

  return (
    <div className="homepage-container">
      {/* Botón de la barra lateral */}
      <button className="show-sidebar-button" onClick={toggleSidebar}>
        ☰
      </button>

      {/* Barra lateral */}
      <div ref={sidebarRef} className={`sidebar ${showSidebar ? "show" : ""}`}>
        <button className="menu-item" onClick={handleLogout}>Logout</button>
      </div>

      {/* Card de la página principal */}
      <div className="homepage-card">
        <h1 className="homepage-title">Hoja De Servicios Administrador</h1>
        <div className="table-container">
          {/* Formulario para agregar un usuario */}
          <button
            className="create-table-button"
            onClick={() => addUser("newuser@example.com", "password123")}
          >
            Add User to Firebase
          </button>

          <table className="service-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Password</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data && data.length > 0 ? (
                data.map(([id, item], index) => (
                  <tr key={id}>
                    <td>{index + 1}</td>
                    <td>
                      <input
                        type="email"
                        value={item.email}
                        onChange={(e) => handleFieldChange(id, "email", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={item.password}
                        onChange={(e) => handleFieldChange(id, "password", e.target.value)}
                      />
                      <button
                        className="toggle-password-button"
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </td>
                    <td>
                      <button
                        className="delete-button"
                        onClick={() => deleteUser(id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">No data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
