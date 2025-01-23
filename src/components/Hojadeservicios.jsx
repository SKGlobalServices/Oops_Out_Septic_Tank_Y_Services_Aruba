import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { database } from "./firebaseConfig";
import { ref, set, push, remove, update, onValue } from "firebase/database";
import TransferData from "./Transferdata";
import logo from "../assets/img/logo.jpg";

const Homepage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [data, setData] = useState([]);
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);
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
    const dbRef = ref(database, "data");
    const unsubscribe = onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        const fetchedData = Object.entries(snapshot.val());
        setData(fetchedData);
      } else {
        setData([]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const dbRef = ref(database, "users");
    const unsubscribe = onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        const fetchedUsers = Object.entries(snapshot.val())
          .filter(([_, user]) => user.role !== "admin")
          .map(([id, user]) => ({ id, name: user.name }));
        setUsers(fetchedUsers);
      } else {
        setUsers([]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const dbRef = ref(database, "clientes");
    const unsubscribe = onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        const fetchedClients = Object.entries(snapshot.val()).map(([id, client]) => ({
          id,
          direccion: client.direccion,
          cubicos: client.cubicos,
        }));
        setClients(fetchedClients);
      } else {
        setClients([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const addData = async (
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
    const dbRef = ref(database, "data");
    const newDataRef = push(dbRef);

    await set(newDataRef, {
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

    // Sincronizar con "clientes"
    syncWithClients(direccion, cubicos);
  };

  const handleFieldChange = (id, field, value) => {
    const dbRef = ref(database, `data/${id}`);
    update(dbRef, { [field]: value }).catch((error) => {
      console.error("Error updating data: ", error);
    });

    // Actualizar cúbicos automáticamente cuando cambia la dirección
    if (field === "direccion") {
      const matchingClient = clients.find((client) => client.direccion === value);
      if (matchingClient) {
        handleFieldChange(id, "cubicos", matchingClient.cubicos);
      }
    }

    // Sincronizar cambios en cúbicos hacia "clientes"
    if (field === "cubicos") {
      const dataItem = data.find(([itemId]) => itemId === id);
      if (dataItem) {
        const [, item] = dataItem;
        syncWithClients(item.direccion, value);
      }
    }
  };

  const syncWithClients = (direccion, cubicos) => {
    // Verificar si el cliente ya existe en "clientes"
    const existingClient = clients.find((client) => client.direccion === direccion);

    if (existingClient) {
      // Actualizar los cúbicos si es necesario
      if (existingClient.cubicos !== cubicos) {
        const clientRef = ref(database, `clientes/${existingClient.id}`);
        update(clientRef, { cubicos }).catch((error) => {
          console.error("Error updating client: ", error);
        });
      }
    } else {
      // Agregar un nuevo cliente si no existe
      addClient(direccion, cubicos);
    }
  };

  const addClient = (direccion, cubicos) => {
    const dbRef = ref(database, "clientes");
    const newClientRef = push(dbRef);

    set(newClientRef, { direccion, cubicos }).catch((error) => {
      console.error("Error adding client: ", error);
    });
  };

  const deleteData = (id) => {
    const dbRef = ref(database, `data/${id}`);
    remove(dbRef).catch((error) => {
      console.error("Error deleting data: ", error);
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
      <TransferData />
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
        <h1 className="title-page">Servicios De Hoy</h1>
        <div className="current-date">
          <div>{currentDateTime.date}</div>
          <div>{currentDateTime.time}</div>
        </div>
        <button
          className="create-table-button"
          onClick={() => addData("", "", "", "", "", "", "", "", "", "", "")}
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
                        <select
                          value={item.realizadopor}
                          onChange={(e) =>
                            handleFieldChange(
                              id,
                              "realizadopor",
                              e.target.value
                            )
                          }
                        >
                          <option value=""></option>
                          {users.map((user) => (
                            <option key={user.id} value={user.name}>
                              {user.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="text"
                          style={{
                            width: `${Math.max(
                              item.anombrede?.length || 1,
                              15
                            )}ch`,
                          }}
                          value={item.anombrede}
                          onChange={(e) =>
                            handleFieldChange(id, "anombrede", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <div className="custom-select-container">
                          <input
                            type="text"
                            style={{
                              width: `${Math.max(
                                item.direccion?.length || 1,
                                15
                              )}ch`,
                            }}
                            value={item.direccion || ""}
                            onChange={(e) =>
                              handleFieldChange(
                                id,
                                "direccion",
                                capitalizeWords(e.target.value)
                              )
                            }
                            onFocus={(e) =>
                              e.target.setAttribute(
                                "list",
                                `direccion-options-${id}`
                              )
                            }
                            onBlur={(e) =>
                              setTimeout(
                                () => e.target.removeAttribute("list"),
                                200
                              )
                            }
                            className="custom-select-input"
                          />
                          <datalist id={`direccion-options-${id}`}>
                            {Array.from(
                              new Set(
                                clients // Cambiado para que use los datos de "clients" en lugar de "data"
                                  .map((client) => client.direccion) // Obtener solo las direcciones de los clientes
                                  .filter((direccion) => direccion) // Filtrar direcciones válidas
                              )
                            ).map((direccion, index) => (
                              <option
                                key={index}
                                value={capitalizeWords(direccion)}
                              >
                                {capitalizeWords(direccion)}
                              </option>
                            ))}
                          </datalist>
                        </div>
                      </td>

                      <td>
                        <select
                          value={item.servicio}
                          style={{ width: "15ch" }}
                          onChange={(e) =>
                            handleFieldChange(id, "servicio", e.target.value)
                          }
                        >
                          <option value=""></option>
                          <option value="Servicio 1">Servicio 1</option>
                          <option value="Servicio 2">Servicio 2</option>
                          <option value="Servicio 3">Servicio 3</option>
                          <option value="Servicio 4">Servicio 4</option>
                          <option value="Servicio 5">Servicio 5</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="number"
                          style={{ width: "12ch" }}
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
                          style={{ width: "22ch" }}
                          onChange={(e) =>
                            handleFieldChange(id, "pago", e.target.value)
                          }
                        >
                          <option value=""></option>
                          <option value="Debe">Debe</option>
                          <option value="Pago">Pago</option>
                          <option value="Pendiente">Pendiente</option>
                          <option value="Pendiente Fin De Mes">
                            Pendiente Fin De Mes
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
                          style={{
                            width: `${Math.max(item.notas?.length || 1, 15)}ch`,
                          }}
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
                          style={{ width: "10ch" }}
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
                          style={{ width: "10ch" }}
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

export default Homepage;