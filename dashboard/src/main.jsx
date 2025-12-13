// Dans src/main.jsx
import React, { createContext, useState } from "react";
import ReactDOM from "react-dom/client"; // Assurez-vous que c'est bien votre import pour ReactDOM
import App from "./App"; // Votre composant App principal


export const Context = createContext({
  isAuthenticated: undefined,
  setIsAuthenticated: () => {},
  admin: {},
  setAdmin: () => {},
  shouldRefreshDashboard: false, // <<< NOUVEAU: Pour indiquer au dashboard de rafraîchir
  setShouldRefreshDashboard: () => {}, // <<< NOUVEAU: La fonction pour changer cet état
});

const AppWrapper = () => { // C'est généralement un wrapper autour de votre App dans main.jsx
  const [isAuthenticated, setIsAuthenticated] = useState(undefined);
  const [admin, setAdmin] = useState({});
  const [shouldRefreshDashboard, setShouldRefreshDashboard] = useState(false); // <<< DÉCLARER LE NOUVEL ÉTAT

  return (
    <Context.Provider value={{
      isAuthenticated,
      setIsAuthenticated,
      admin,
      setAdmin,
      shouldRefreshDashboard, // <<< PASSER LE NOUVEL ÉTAT AU CONTEXT
      setShouldRefreshDashboard, // <<< PASSER LA FONCTION AU CONTEXT
    }}>
      <App /> {/* Votre composant App est enfant de ce wrapper */}
    </Context.Provider>
  );
};

// Le rendu final de votre application
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>
);