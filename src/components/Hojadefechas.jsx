import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { database } from "./firebaseConfig";
import { ref, onValue, remove } from "firebase/database";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import logo from "../assets/img/logo.jpg";

const Hojadefechas = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [data, setData] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const sidebarRef = useRef(null);

  const [currentDateTime, setCurrentDateTime] = useState({
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }),
  });

  const [filter, setFilter] = useState({
    fecha: "",
    direccion: "",
  });

  const [showDatePicker, setShowDatePicker] = useState(false);

  const [directions, setDirections] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime({
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/homepageuser");
    }
  }, [user, navigate]);

  useEffect(() => {
    const dbRef = ref(database, "registrofechas");
    const unsubscribe = onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        const allData = snapshot.val();
        const formattedData = Object.entries(allData).map(
          ([fecha, registros]) => ({
            fecha,
            registros: Object.entries(registros),
          })
        );

        setData(formattedData);

        const uniqueDirections = new Set();
        formattedData.forEach((item) => {
          item.registros.forEach(([id, registro]) => {
            uniqueDirections.add(registro.direccion);
          });
        });
        setDirections(Array.from(uniqueDirections));
      } else {
        setData([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Función para eliminar el registro de Firebase
  const handleDelete = (fecha, id) => {
    const recordRef = ref(database, `registrofechas/${fecha}/${id}`);
    remove(recordRef)
      .then(() => {
        console.log(`Registro con ID ${id} y fecha ${fecha} eliminado.`);
      })
      .catch((error) => {
        console.error("Error al eliminar el registro:", error);
      });
  };

  const handleDateChange = (date) => {
    if (date) {
      const formattedDate = `${("0" + date.getDate()).slice(-2)}-${(
        "0" +
        (date.getMonth() + 1)
      ).slice(-2)}-${date.getFullYear()}`;
      setFilter((prevState) => ({
        ...prevState,
        fecha: formattedDate,
      }));
    } else {
      setFilter((prevState) => ({
        ...prevState,
        fecha: "",
      }));
    }
    setShowDatePicker(false);
  };

  const handleShowDatePicker = () => {
    setShowDatePicker((prevState) => !prevState);
  };

  // Función para filtrar los datos
  const filteredData = data.filter((item) => {
    const { fecha, registros } = item;

    return (
      (filter.fecha ? fecha.includes(filter.fecha) : true) &&
      (filter.direccion
        ? registros.some(
            ([id, registro]) => registro.direccion === filter.direccion
          )
        : true)
    );
  });

  const noDataForSelectedDate = filter.fecha && filteredData.length === 0;

  const getMetodoPagoColor = (metodo) => {
    switch (metodo) {
      case "efectivo":
        return "#8e44ad";
      case "cancelado":
        return "#e74c3c";
      case "credito":
        return "#2ecc71";
      default:
        return "";
    }
  };

  const getPagoColor = (estado) => {
    switch (estado) {
      case "Pago":
        return "#2ecc71";
      case "Debe":
        return "#e74c3c";
      case "Pendiente Fin De Mes":
        return "#f1c40f";
      case "Pendiente":
        return "#f1c40f";
      default:
        return "";
    }
  };

  if (!user) {
    return (
      <div className="error-container">
        <p className="error-message">User not logged in!</p>
        <input
          type="button"
          value="Redirecting to login"
          onClick={() => navigate("/")}
          readOnly
        />
      </div>
    );
  }

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
        <h1 className="title-page">Agenda Dinamica</h1>
        <div className="current-date">
          <div>{currentDateTime.date}</div>
          <div>{currentDateTime.time}</div>
        </div>
        <div className="filters">
          <button onClick={handleShowDatePicker} className="filter-button">
            Filtrar por fecha
          </button>
          {showDatePicker && (
            <div className="datepicker-container">
              <DatePicker
                selected={
                  filter.fecha
                    ? new Date(filter.fecha.split("-").reverse().join("-"))
                    : null
                }
                onChange={handleDateChange}
                dateFormat="dd/MM/yyyy"
                className="calendar-input"
              />
            </div>
          )}
          <select
            name="direccion"
            value={filter.direccion}
            onChange={handleFilterChange}
            className="dropdown"
          >
            <option value="">Selecciona una dirección</option>
            {directions.map((direccion, index) => (
              <option key={index} value={direccion}>
                {direccion}
              </option>
            ))}
          </select>
        </div>
        {noDataForSelectedDate && (
          <div className="no-data-message">
            No hay datos para la fecha seleccionada.
          </div>
        )}

        <div className="table-container">
          <table className="service-table">
            <thead>
              <tr>
                <th className="tdth-table">Fecha</th>
                <th className="tdth-table">Realizado Por</th>
                <th className="tdth-table">A Nombre De</th>
                <th className="tdth-table">Dirección</th>
                <th className="tdth-table">Sevicio</th>
                <th className="tdth-table">Cúbicos</th>
                <th className="tdth-table">Valor</th>
                <th className="tdth-table">Pago</th>
                <th className="tdth-table">Acciones</th>
                <th className="tdth-table">Notas</th>
                <th className="tdth-table">Metodo De Pago</th>
                <th className="tdth-table">Efectivo</th>
                <th className="tdth-table">Factura</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <React.Fragment key={item.fecha}>
                    {item.registros.map(([id, registro]) => (
                      <tr key={id} id="tds-tables">
                        <td className="tdth-table">{registro.fecha}</td>
                        <td className="tdth-table">{registro.realizadopor}</td>
                        <td className="tdth-table">{registro.anombrede}</td>
                        <td className="tdth-table">{registro.direccion}</td>
                        <td className="tdth-table">{registro.servicio}</td>
                        <td className="tdth-table">{registro.cubicos}</td>
                        <td className="tdth-table">{registro.valor}</td>
                        <td
                          className="tdth-table"
                          style={{
                            backgroundColor: getPagoColor(registro.pago),
                          }}
                        >
                          {registro.pago}
                        </td>
                        <td>
                          <button
                            id="delete-button-fechas"
                            className="delete-button"
                            onClick={() => handleDelete(item.fecha, id)}
                          >
                            Delete
                          </button>
                        </td>
                        <td className="tdth-table">{registro.notas}</td>
                        <td
                          className="tdth-table"
                          style={{
                            backgroundColor: getMetodoPagoColor(
                              registro.metododepago
                            ),
                          }}
                        >
                          {registro.metododepago}
                        </td>
                        <td className="tdth-table">{registro.efectivo}</td>
                        <td className="tdth-table">
                          {registro.factura ? "Sí" : "No"}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))
              ) : (
                <tr className="no-data">
                  <td colSpan="9">No data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Hojadefechas;
