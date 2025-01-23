import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ref, onValue } from "firebase/database";
import { database } from "./firebaseConfig";
import logo from "../assets/img/logo.jpg";

const Clientes = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]); // Datos de clientes
  const [filter, setFilter] = useState({ direccion: "" });
  const [directions, setDirections] = useState([]); // Direcciones únicas para el filtro
  const [showSidebar, setShowSidebar] = useState(false);
  const sidebarRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/"); // Redirigir al login si no es admin
    }
  }, [user, navigate]);

  // Cargar datos de la tabla "clientes"
  useEffect(() => {
    const dbRef = ref(database, "clientes");
    const unsubscribe = onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        const allData = snapshot.val();
        const formattedData = [];
        const uniqueDirections = new Set();

        Object.entries(allData).forEach(([_, cliente]) => {
          if (cliente.direccion && cliente.direccion.trim() !== "") {
            formattedData.push({
              direccion: cliente.direccion || "Desconocida",
              cubicos: cliente.cubicos || "N/A",
            });

            uniqueDirections.add(cliente.direccion);
          }
        });

        setData(formattedData); // Establecer los datos de clientes
        setDirections(Array.from(uniqueDirections)); // Establecer las direcciones únicas
      } else {
        setData([]); // Si no hay datos
        setDirections([]);
      }
    });

    return () => unsubscribe(); // Limpiar el listener al desmontar
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setFilter({ direccion: "" });
  };

  const toggleSidebar = () => setShowSidebar(!showSidebar);

  const handleClickOutside = (e) => {
    if (
      sidebarRef.current &&
      !sidebarRef.current.contains(e.target) &&
      !e.target.closest(".show-sidebar-button")
    ) {
      setShowSidebar(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  // Filtrar datos: solo muestra filas con direcciones no vacías
  const filteredData = data
    .filter((cliente) => cliente.direccion && cliente.direccion.trim() !== "") // Filtrar si la dirección está vacía
    .filter((cliente) => {
      const matchesDireccion = filter.direccion
        ? cliente.direccion.toLowerCase().includes(filter.direccion.toLowerCase())
        : true;
      return matchesDireccion;
    });

  return (
    <div className="homepage-container">
      <button className="show-sidebar-button" onClick={toggleSidebar}>
        ☰
      </button>
      <div ref={sidebarRef} className={`sidebar ${showSidebar ? "show" : ""}`}>
        <div>
          <h1>
            <img
              src={logo}
              alt="Logo"
              id="logologin"
              className="logo-slidebar"
            />
          </h1>
        </div>
        <div>
          {user && user.name ? <p>Hola!, {user.name}</p> : <p>No user</p>}
        </div>
        <button className="menu-item" onClick={() => navigate("/homepage")}>
          Servicios De Hoy
        </button>
        <button className="menu-item" onClick={() => navigate("/hojamañana")}>
          Servicios De Mañana
        </button>
        <button className="menu-item" onClick={() => navigate("/hojadefechas")}>
          Agenda Dinamica
        </button>
        <button className="menu-item" onClick={() => navigate("/clientes")}>
          Clientes "Desarrollo"
        </button>
        <button className="menu-item" onClick={() => navigate("/")}>
          Reprogramación Automatica "PENDIETE"
        </button>
        <button className="menu-item" onClick={() => navigate("/")}>
          Generar Informes "PENDIETE"
        </button>
        <button className="menu-item" onClick={() => navigate("/")}>
          Configuración "PENDIETE"
        </button>
        <button className="menu-item" onClick={handleLogout}>
          Logout
        </button>
        <div>
          <p>© 2025 S&K Global Services</p>
        </div>
      </div>

      <div className="homepage-card">
        <h1 className="title-page">Historial de Clientes</h1>
        <div className="filters">
          <input
            type="text"
            name="direccion"
            placeholder="Filtrar por dirección"
            value={filter.direccion}
            onChange={handleFilterChange}
            className="filter-input"
            list="direccion-options"
          />
          <datalist id="direccion-options">
            {directions.map((direccion, index) => (
              <option key={index} value={direccion} />
            ))}
          </datalist>
          <button className="clear-filters-button" onClick={clearFilters}>
            Borrar Filtros
          </button>
        </div>

        <div className="table-container">
          <table className="service-table">
            <thead>
              <tr>
                <th>Dirección</th>
                <th>Cúbicos</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((cliente, index) => (
                  <tr key={index}>
                    <td>{cliente.direccion}</td>
                    <td>{cliente.cubicos}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2">No se encontraron registros</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Clientes;
