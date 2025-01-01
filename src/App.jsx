import React, { useState } from "react";
import "./App.css";
import { ref, get, child } from "firebase/database";
import { database } from "./components/firebaseConfig";
import { useNavigate } from "react-router-dom";
import logo from "./assets/img/logo.jpg";

const App = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const dbRef = ref(database);
      const snapshot = await get(child(dbRef, "users"));

      if (snapshot.exists()) {
        const users = snapshot.val();

        const userFound = Object.values(users).find(
          (user) => user.email === email && user.password === password
        );

        if (userFound) {
          localStorage.setItem("user", JSON.stringify(userFound));
          navigate("/homepage");
        } else {
          setMessage("Invalid email or password.");
        }
      } else {
        setMessage("No users found in the database.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setMessage("An error occurred while logging in.");
    }
  };

  return (
    <div className="App">
      <div className="form-container text-center">
        <h1>
          <img src={logo} alt="Logo" id="logologin" />
        </h1>
        <form onSubmit={handleLogin} className="form-login">
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" id="passwordbutton">
            Login
          </button>
        </form>
        {message && <p className="danger">{message}</p>}
      </div>
    </div>
  );
};

export default App;
