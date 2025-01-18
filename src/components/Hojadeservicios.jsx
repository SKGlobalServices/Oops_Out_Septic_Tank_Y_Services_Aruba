import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { database } from "./firebaseConfig";
import { ref, set, push, remove, update, onValue } from "firebase/database";

const Homepage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [data, setData] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const sidebarRef = useRef(null);

  // Estado para la fecha y hora actual
  const [currentDateTime, setCurrentDateTime] = useState({
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
  });

  // Actualizar fecha y hora cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime({
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Mantener al usuario logueado al recargar la página
  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/homepageuser");
    }
  }, [user, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  useEffect(() => {
    const dbRef = ref(database, "data");

    const unsubscribe = onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        setData(Object.entries(snapshot.val()));
      } else {
        setData([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const addData = (
    direccion,
    notas,
    cubicos,
    realizadopor,
    metododepago,
    efectivo,
    factura
  ) => {
    const dbRef = ref(database, "data");
    const newDataRef = push(dbRef);
    set(newDataRef, {
      direccion,
      notas,
      cubicos,
      realizadopor,
      metododepago,
      efectivo,
      factura,
    }).catch((error) => {
      console.error("Error adding data: ", error);
    });
  };

  const deleteData = (id) => {
    const dbRef = ref(database, `data/${id}`);
    remove(dbRef).catch((error) => {
      console.error("Error deleting data: ", error);
    });
  };

  const handleFieldChange = (id, field, value) => {
    const dbRef = ref(database, `data/${id}`);
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

  return (
    <div className="homepage-container">
      <button className="show-sidebar-button" onClick={toggleSidebar}>
        ☰
      </button>

      <div ref={sidebarRef} className={`sidebar ${showSidebar ? "show" : ""}`}>
        <button className="menu-item" onClick={() => navigate("/homepage")}>
          Hoja De Servicios Administrador
        </button>
        <button className="menu-item" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="homepage-card">
        <div className="current-date">
          <div>{currentDateTime.date}</div>
          <div>{currentDateTime.time}</div>
          <button
            className="create-table-button"
            onClick={() => addData("", "", "", "", "", "", "")}
          >
            Add New Data
          </button>
        </div>

        <div className="table-container">
          <table className="service-table">
            <thead>
              <tr>
                <th>Dirección</th>
                <th>Notas</th>
                <th>Cúbicos</th>
                <th>Realizado Por</th>
                <th>Método de Pago</th>
                <th>Efectivo</th>
                <th>Factura</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data && data.length > 0 ? (
                data.map(([id, item], index) => (
                  <tr key={id}>
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
                        value={item.notas}
                        onChange={(e) =>
                          handleFieldChange(id, "notas", e.target.value)
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
                        type="text"
                        value={item.realizadopor}
                        onChange={(e) =>
                          handleFieldChange(id, "realizadopor", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <select
                        value={item.metododepago}
                        onChange={(e) =>
                          handleFieldChange(id, "metododepago", e.target.value)
                        }
                      >
                        <option value=""></option>
                        <option value="credito">Crédito</option>
                        <option value="debito">Débito</option>
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
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={item.factura}
                        onChange={(e) =>
                          handleFieldChange(id, "factura", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <button
                        className="delete-button"
                        onClick={() => deleteData(id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
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
