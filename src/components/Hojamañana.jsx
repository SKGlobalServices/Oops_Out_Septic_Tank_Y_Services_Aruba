import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { database } from "./firebaseConfig";
import { ref, set, push, remove, update, onValue } from "firebase/database";
import TransferData2 from "./Transferdata";
import logo from "../assets/img/logo.jpg";


const Hojamañana = () => {
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

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/homepageuser");
    }
  }, [user, navigate]);

  useEffect(() => {
    const dbRef = ref(database, "hojamañana");
    const unsubscribe = onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        const fetchedData = Object.entries(snapshot.val());

        // Ordenar alfabéticamente por la columna "realizadopor"
        const sortedData = fetchedData.sort(([_, a], [__, b]) => {
          const nameA = a.realizadopor ? a.realizadopor.toLowerCase() : "";
          const nameB = b.realizadopor ? b.realizadopor.toLowerCase() : "";
          return nameA.localeCompare(nameB);
        });

        setData(sortedData);
      } else {
        setData([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const addData = (
    realizadopor,
    anombrede,
    direccion,
    servicio,
    cubicos,
    valor,
    pago,
    notas,
    metododepago,
    efectivo,
    factura
  ) => {
    const dbRef = ref(database, "hojamañana");
    const newDataRef = push(dbRef);
    set(newDataRef, {
      realizadopor,
      anombrede,
      direccion,
      servicio,
      cubicos,
      valor,
      pago,
      notas,
      metododepago,
      efectivo,
      factura,
    }).catch((error) => {
      console.error("Error adding data: ", error);
    });
  };

  const deleteData = (id) => {
    const dbRef = ref(database, `hojamañana/${id}`);
    remove(dbRef).catch((error) => {
      console.error("Error deleting data: ", error);
    });
  };

  const handleFieldChange = (id, field, value) => {
    const dbRef = ref(database, `hojamañana/${id}`);
    update(dbRef, { [field]: value }).catch((error) => {
      console.error("Error updating data: ", error);
    });
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

  const capitalizeWords = (str) => {
    return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getRowClass = (metodoPago) => {
    if (metodoPago === "efectivo") {
      return "efectivo";
    } else if (metodoPago === "cancelado") {
      return "cancelado";
    } else if (metodoPago === "credito") {
      return "credito";
    }
    return "";
  };

  const isEfectivoDisabled = (metodoPago) => {
    return metodoPago === "cancelado" || metodoPago === "credito";
  };

  return (
    <div className="homepage-container">
      <TransferData2 />
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
          {/* Mostrar el nombre del usuario si está disponible */}
          {user && user.name ? <p>Hola!, {user.name}</p> : <p>No user</p>}
        </div>
        <button className="menu-item" onClick={() => navigate("/homepage")}>
          Hoja De Servicios Administrador
        </button>
        <button className="menu-item" onClick={() => navigate("/hojamañana")}>
          Hoja Mañana Administrador
        </button>
        <button className="menu-item" onClick={() => navigate("/hojadefechas")}>
          Hoja De Fechas
        </button>
        <button className="menu-item" onClick={() => navigate("/")}>
          Reprogramación Automatica "PENDIETE"
        </button>
        <button className="menu-item" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="homepage-card">
        <div className="current-date">
          <div>{currentDateTime.date}</div>
          <div>{currentDateTime.time}</div>
        </div>
        <button
          className="create-table-button"
          onClick={() =>
            addData("", "", "", "", "", "", "", "", "", "", "", "")
          }
        >
          Add New Data
        </button>
        <div className="table-container">
          <table className="service-table">
            <thead>
              <tr>
                <th>Realizado Por-C4</th>
                <th>A Nombre De</th>
                <th>Dirección-C1</th>
                <th>Sevicio</th>
                <th>CúbicosC3</th>
                <th>Valor</th>
                <th>Pago</th>
                <th>Acciones</th>
                <th>Notas-A.C2</th>
                <th>Metodo De Pago-C5</th>
                <th>Efectivo-C6</th>
                <th>Factura-C7</th>
              </tr>
            </thead>
            <tbody>
              {data && data.length > 0 ? (
                data.map(([id, item]) => {
                  const rowClass = getRowClass(item.metododepago);

                  return (
                    <tr key={id} className={rowClass}>
                      <td>
                        <input
                          type="text"
                          list={`realizadopor-options-${id}`}
                          value={item.realizadopor || ""}
                          onChange={(e) =>
                            handleFieldChange(
                              id,
                              "realizadopor",
                              capitalizeWords(e.target.value)
                            )
                          }
                          className="autocomplete-input"
                        />
                        <datalist id={`realizadopor-options-${id}`}>
                          {data
                            .map(([_, i]) => i.realizadopor)
                            .filter((v, i, a) => a.indexOf(v) === i && v) // Evitar duplicados y valores vacíos
                            .map((name, index) => (
                              <option key={index} value={capitalizeWords(name)}>
                                {capitalizeWords(name)}
                              </option>
                            ))}
                        </datalist>
                      </td>
                      <td>
                        <input
                          type="text"
                          value={item.anombrede}
                          onChange={(e) =>
                            handleFieldChange(id, "anombrede", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={item.direccion}
                          onChange={(e) =>
                            handleFieldChange(id, "direccion", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={item.servicio}
                          onChange={(e) =>
                            handleFieldChange(id, "servicio", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={item.cubicos}
                          onChange={(e) =>
                            handleFieldChange(id, "cubicos", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={item.valor}
                          onChange={(e) =>
                            handleFieldChange(id, "valor", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <select
                          value={item.pago}
                          onChange={(e) =>
                            handleFieldChange(id, "valor", e.target.value)
                          }
                        >
                          <option value=""></option>
                          <option value="Debe">Debe</option>
                          <option value="Pago">Pago</option>
                          <option value="Pendiente">Pendiente</option>
                          <option value="Pendiente Fin De Mes">
                            Pendiete Fin De Mes
                          </option>
                        </select>
                      </td>
                      <td>
                        <button
                          className="delete-button"
                          onClick={() => deleteData(id)}
                        >
                          Delete
                        </button>
                      </td>
                      <td>
                        <input
                          type="text"
                          value={item.notas}
                          onChange={(e) =>
                            handleFieldChange(id, "notas", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <select
                          value={item.metododepago}
                          onChange={(e) =>
                            handleFieldChange(
                              id,
                              "metododepago",
                              e.target.value
                            )
                          }
                        >
                          <option value=""></option>
                          <option value="credito">Crédito</option>
                          <option value="cancelado">Cancelado</option>
                          <option value="efectivo">Efectivo</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="number"
                          value={item.efectivo}
                          onChange={(e) =>
                            handleFieldChange(id, "efectivo", e.target.value)
                          }
                          disabled={isEfectivoDisabled(item.metododepago)}
                        />
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          checked={item.factura === true}
                          onChange={(e) =>
                            handleFieldChange(id, "factura", e.target.checked)
                          }
                        />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr className="no-data">
                  <td colSpan="8">No data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Hojamañana;
