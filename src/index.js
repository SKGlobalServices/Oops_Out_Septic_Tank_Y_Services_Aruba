import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from "./components/Hojadeservicios.jsx";
import Homepageuser from "./components/Hojadeserviciosuser.jsx";
import Hojamañana from "./components/Hojamañana.jsx";
import Hojadefechas from "./components/Hojadefechas.jsx";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter basename="/OopsOutSepticTankYServicesAruba">
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/homepage" element={<Homepage />} />
      <Route path="/homepageuser" element={<Homepageuser />} />
      <Route path="/hojamañana" element={<Hojamañana />} />
      <Route path="/hojadefechas" element={<Hojadefechas />} />
    </Routes>
  </BrowserRouter>
);
