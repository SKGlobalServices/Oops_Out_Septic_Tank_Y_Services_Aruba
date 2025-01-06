import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import Homepage from "./components/Hojadeservicios.jsx";
import Homepageuser from "./components/Hojadeserviciosuser.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter basename="/OopsOutSepticTankYServicesAruba">
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/homepage" element={<Homepage />} />
      <Route path="/homepageuser" element={<Homepageuser />} />
    </Routes>
  </BrowserRouter>
);
