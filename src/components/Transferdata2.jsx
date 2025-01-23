import React, { useEffect } from "react";
import { ref, get, set, remove, update } from "firebase/database";
import { database } from "./firebaseConfig";

const TransferData2 = () => {
  useEffect(() => {
    const transferData = async () => {
      const currentDate = new Date();
      const hours = currentDate.getHours();
      const minutes = currentDate.getMinutes();
      const seconds = currentDate.getSeconds();

      // Verifica si es exactamente el tiempo
      if (hours === 23 && minutes === 59 && seconds === 0) {
        try {
          const hojaMañanaRef = ref(database, "hojamañana");
          const snapshot = await get(hojaMañanaRef);

          if (snapshot.exists()) {
            const data = snapshot.val();
            await transferDataToDestination(data);
            await deleteOriginalData(data);
          } else {
            console.log("No hay datos para transferir.");
          }
        } catch (error) {
          console.error("Error al transferir o eliminar datos:", error);
        }
      }
    };

    // Intervalo para verificar cada segundo
    const interval = setInterval(transferData, 1000);

    return () => clearInterval(interval);
  }, []);

  const transferDataToDestination = async (data) => {
    const dataRef = ref(database, "data");
    const dataSnapshot = await get(dataRef);

    if (dataSnapshot.exists()) {
      console.log("La tabla 'data' ya existe. Los datos se agregarán.");
      await update(dataRef, data);
    } else {
      console.log(
        "La tabla 'data' no existe. Se creará y se agregarán los datos."
      );
      await set(dataRef, data);
    }
  };

  // Función para eliminar los datos de la tabla original (hojamañana)
  const deleteOriginalData = async (data) => {
    for (const id in data) {
      const itemRef = ref(database, `hojamañana/${id}`);
      await remove(itemRef);
      console.log(`Datos con ID ${id} eliminados de la tabla 'hojamañana'`);
    }
  };

  return null; // No se renderiza nada
};

export default TransferData2;
