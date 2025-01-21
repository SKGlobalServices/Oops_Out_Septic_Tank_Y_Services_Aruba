import React, { useEffect } from "react";
import { ref, get, set, remove } from "firebase/database";
import { database } from "./firebaseConfig";

const TransferData = () => {
  useEffect(() => {
    const transferData = async () => {
      const currentDate = new Date();
      const hours = currentDate.getHours();
      const minutes = currentDate.getMinutes();
      const seconds = currentDate.getSeconds();

      // Verifica si es exactamente el tiempo
      if (hours === 23 && minutes === 55 && seconds === 0) {
        try {
          const dataRef = ref(database, "data");
          const snapshot = await get(dataRef);

          if (snapshot.exists()) {
            const data = snapshot.val();
            const dateId = currentDate.toLocaleDateString("en-GB").replace(/\//g, "-");
            const registroRef = ref(database, `registrofechas`);

            for (const id in data) {
              const registroData = data[id];
              const fechaConId = {
                ...registroData,
                fecha: dateId,
              };

              const registroItemRef = ref(database, `registrofechas/${dateId}/${id}`);
              await set(registroItemRef, fechaConId);
              console.log(`Datos transferidos a registrofechas con ID ${id} y fecha ${dateId}`);

              const itemRef = ref(database, `data/${id}`);
              await remove(itemRef);
              console.log(`Datos con ID ${id} eliminados de la tabla 'data'`);
            }
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

  return null; // No se renderiza nada
};

export default TransferData;
