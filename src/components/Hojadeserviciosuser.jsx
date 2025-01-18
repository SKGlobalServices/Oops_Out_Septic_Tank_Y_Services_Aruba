import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { database } from "./firebaseConfig";
import { ref, set, push, remove, update, onValue } from "firebase/database";

const Homepageuser = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [data, setData] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const sidebarRef = useRef(null);

  const [currentDateTime, setCurrentDateTime] = useState({
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime({
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    const dbRef = ref(database, "users");

    const unsubscribe = onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        setData(Object.entries(snapshot.val()));
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

  const addUser = (email, password) => {
    const dbRef = ref(database, "users");
    const newUserRef = push(dbRef);
    set(newUserRef, { email, password }).catch((error) => {
      console.error("Error adding user: ", error);
    });
  };

  const deleteUser = (id) => {
    const dbRef = ref(database, `users/${id}`);
    remove(dbRef).catch((error) => {
      console.error("Error deleting user: ", error);
    });
  };

  const handleFieldChange = (id, field, value) => {
    const dbRef = ref(database, `users/${id}`);
    update(dbRef, { [field]: value }).catch((error) => {
      console.error("Error updating data: ", error);
    });
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

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
        <button className="menu-item" onClick={() => navigate("/homepageuser")}>Hoja De Servicios</button>
        <button className="menu-item" onClick={handleLogout}>Logout</button>
      </div>

      <div className="homepage-card">
        <div className="current-date">
          <div>{currentDateTime.date}</div>
          <div>{currentDateTime.time}</div>
        </div>

        <div className="table-container">
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
                        onChange={(e) =>
                          handleFieldChange(id, "email", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={item.password}
                        onChange={(e) =>
                          handleFieldChange(id, "password", e.target.value)
                        }
                      />
                      <button
                        className="show-password-button"
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
                <tr className="no-data">
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

export default Homepageuser;
