import React, { useContext, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Context } from "./main";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import AddNewPatient from "./components/AddNewPatient";
import Sidebar from "./components/Sidebar";
import Patient from "./components/Patient";
import AddPrescription from "./components/AddPrescription";
import Calendar from "./components/Calendar";
import ChangePassword from './components/ChangePassword';
import DossierPatient from "./components/DossierPatient";
import PrescriptionOptions from "./components/PrescriptionOptions";
import Bilan from "./components/Bilan";
import CertificatArret from "./components/CertificatArret";
import Justification from "./components/Justification";
import Blocnote from "./components/Blocnote";
import Signup from "./components/Signup";
import AddMedicament from "./components/AddMedicament";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import ListeMedicaments from "./components/ListeMedicaments";
import HomePage from "./components/HomePage";
import ScoreList from "./components/ScoreList";
import ScoreDetail from "./components/ScoreDetail";
import Lettre from "./components/Lettre";
import Statistiques from "./components/Statistiques";
import Profile from "./components/Profile";
import Corbeille from "./components/Corbeille";
import "./App.css";

// Configure Axios pour envoyer les cookies avec chaque requête par défaut
axios.defaults.withCredentials = true;

const App = () => {
  const { isAuthenticated, setIsAuthenticated, admin, setAdmin } = useContext(Context);
  console.log("APP LOG (Render - Début): Path:", window.location.pathname, "isAuthenticated =", isAuthenticated, "Admin =", admin);
  console.log("APP LOG: Current isAuthenticated state on render:", isAuthenticated);
  console.log("APP LOG: Admin state (on render, before fetch):", admin); // Log avant la requête
  console.log("APP LOG (Initial Render): isAuthenticated =", isAuthenticated, "Admin =", admin);
  if (!isAuthenticated && window.location.pathname !== '/login') {
      // Si pas authentifié et pas déjà sur la page de login, rediriger vers login
      // console.log("APP LOG (Redirect): Not authenticated, redirecting to /login.");
      // return <Navigate to="/login" />; // Si vous aviez une redirection ici
  }


  useEffect(() => {
      // ... (votre fonction fetchUser) ...
      const fetchUser = async () => {
          console.log("APP LOG (fetchUser): Appel à /admin/me.");
          console.log("APP LOG (fetchUser): Appel à /admin/me. isAuth avant requete:", isAuthenticated);
          try {
              const response = await axios.get(
                  `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/user/admin/me`,
                  { withCredentials: true }
              );
              console.log("APP LOG (fetchUser Success): Réponse user data:", response.data.user);
              setAdmin(response.data.user);
              setIsAuthenticated(true); // C'est ici que ça passe à true
              console.log("APP LOG (fetchUser Success): isAuthenticated mis à TRUE. Admin mis à jour.");
          } catch (error) {
              console.error("APP LOG (fetchUser Error): Échec de /admin/me:", error.response?.status, error.response?.data?.message || error.message);
              setIsAuthenticated(false);
              setAdmin({}); // Réinitialiser l'admin
              console.log("APP LOG (fetchUser Error): isAuthenticated mis à FALSE. Admin réinitialisé.");
          }
      };

      // Condition de déclenchement :
      if (isAuthenticated === undefined) { // Au tout premier chargement
          console.log("APP LOG (useEffect): isAuthenticated est null, déclenchement de fetchUser.");
          fetchUser();
      } else if (isAuthenticated === false && window.location.pathname !== '/login') {
          // Si on est clairement non authentifié et pas sur la page login, on peut re-tenter ou laisser Navigate gérer
          console.log("APP LOG (useEffect): isAuthenticated est false, mais pas sur /login. (Peut être une re-vérification)");
          // fetchUser(); // Peut-être que cet appel n'est pas nécessaire ici si Navigate est utilisé
      } else if (isAuthenticated === true && (!admin || Object.keys(admin).length === 0)) {
          // Si authentifié mais admin vide, recharger
          console.log("APP LOG (useEffect): isAuthenticated est true mais admin vide. Déclenchement de fetchUser.");
          fetchUser();
      } else {
          console.log("APP LOG (useEffect): État d'authentification stable. Pas de fetchUser.");
      }
  }, [isAuthenticated, admin]); // Dépendances
  if (isAuthenticated === undefined) {
      console.log("APP LOG (Rendu): Authentification en cours de chargement...");
      return <div>Chargement de l'authentification...</div>;
  }

  // --- Vérifiez la logique de rendu des Routes ---
  return (
 <Router>
      {/* La Sidebar est toujours là, même si non authentifié */}
      <Sidebar />
      <Routes>
        {/* Route racine : affiche le Dashboard si authentifié, sinon redirige vers /login */}
        <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/home" />} />

        {/* Page de connexion : si déjà authentifié, redirige vers le Dashboard */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />

        {/* Routes protégées : affichent le composant si authentifié, sinon redirigent vers /login */}
        <Route path="/Patient/addnew" element={isAuthenticated ? <AddNewPatient /> : <Navigate to="/login" />} />
        <Route path="/patients" element={isAuthenticated ? <Patient /> : <Navigate to="/login" />} />
        <Route path="/prescription" element={isAuthenticated ? <AddPrescription /> : <Navigate to="/login" />} />
        <Route path="/calendar" element={isAuthenticated ? <Calendar /> : <Navigate to="/login" />} />
        <Route path="/dossier-patient/:id" element={isAuthenticated ? <DossierPatient /> : <Navigate to="/login" />} />
        <Route path="/prescription-options" element={isAuthenticated ? <PrescriptionOptions /> : <Navigate to="/login" />} />
        <Route path="/bilan" element={isAuthenticated ? <Bilan /> : <Navigate to="/login" />} />
        <Route path="/certificat-arret" element={isAuthenticated ? <CertificatArret /> : <Navigate to="/login" />} />
        <Route path="/justification" element={isAuthenticated ? <Justification /> : <Navigate to="/login" />} />
        <Route path="/blocnote" element={isAuthenticated ? <Blocnote /> : <Navigate to="/login" />} />
        <Route path="/change-password" element={isAuthenticated ? <ChangePassword /> : <Navigate to="/login" />} />
        <Route path="/modifier-patient/:id" element={isAuthenticated ? <AddNewPatient /> : <Navigate to="/login" />} /> {/* Pour la modification */}
        <Route path="/signup" element={<Signup />} /> 
        <Route path="/add-medicament" element={isAuthenticated ? <AddMedicament /> : <Navigate to="/login" />} />     
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/liste-medicaments" element={isAuthenticated ? <ListeMedicaments /> : <Navigate to="/login" />} />
        <Route path="/scores" element={isAuthenticated ? <ScoreList /> : <Navigate to="/login" />} />
        <Route path="/statistiques" element={isAuthenticated ? <Statistiques /> : <Navigate to="/login" />} />
<Route path="/scores/:scoreId" element={isAuthenticated ? <ScoreDetail /> : <Navigate to="/login" />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/lettre" element={isAuthenticated ? <Lettre /> : <Navigate to="/login" />} />
        <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
       // Dans les imports
import Corbeille from "./components/Corbeille"; // Ajoutez cette ligne

// Dans les routes
<Route path="/corbeille" element={isAuthenticated ? <Corbeille /> : <Navigate to="/login" />} />
      </Routes>
      <ToastContainer position="top-center" />
    </Router>
  );
};

export default App;
