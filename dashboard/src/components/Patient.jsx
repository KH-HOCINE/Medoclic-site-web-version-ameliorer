import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify"; // Assurez-vous d'importer toast

const Patient = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/patient/patients`, 
          { 
            withCredentials: true
          }
        );
        setPatients(response.data.patients);
      } catch (error) {
        console.error("Erreur lors de la récupération des patients :", error);
        toast.error("Erreur lors de la récupération des patients.");
      }
    };
  
    fetchPatients();
  }, []);

  const handlePatientClick = (patientId) => {
    navigate(`/dossier-patient/${patientId}`);
  };

  // FONCTION pour supprimer un patient
  const handleDeletePatient = async (patientId, patientName) => {
    // Demander une confirmation
    const confirmDelete = window.confirm(
      `Êtes-vous sûr de vouloir supprimer le patient ${patientName} ?\nCette action est irréversible et supprimera toutes ses données (dossiers, rendez-vous, etc.).`
    );

    if (!confirmDelete) {
      return; // L'utilisateur a annulé
    }

    try {
      await axios.delete(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/patient/${patientId}`,
        { withCredentials: true }
      );

      // Mettre à jour l'état local pour retirer le patient de la liste
      setPatients(prevPatients => prevPatients.filter(p => p._id !== patientId));
      toast.success(`Patient ${patientName} supprimé avec succès !`);

    } catch (error) {
      console.error("Erreur lors de la suppression du patient :", error);
      toast.error(error.response?.data?.message || "Échec de la suppression du patient.");
    }
  };

  const filteredPatients = patients.filter(patient => {
    const searchLower = searchTerm.toLowerCase();
    // Gère le cas où patientNumber n'est pas une chaîne
    const patientNumberStr = patient.patientNumber ? patient.patientNumber.toString().toLowerCase() : '';
    return (
      patient.lastName.toLowerCase().includes(searchLower) ||
      patient.firstName.toLowerCase().includes(searchLower) ||
      patientNumberStr.includes(searchLower)
    );
  });

  return (
    <div className="patient-list">
      <h2 className="form-title">Liste des Patients inscrits dans la clinique</h2>
      
      <div className="search-bar-container">
        <div className="search-input-wrapper">
          <div className="search-icon">
            <svg viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="M21 21l-4.35-4.35"></path>
            </svg>
          </div>
          <input
            type="text"
            className="patient-search-input"
            placeholder="Rechercher un patient par nom, prénom ou numéro..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Numéro</th>
            <th>Nom</th>
            <th>Prénom</th>
            <th>Téléphone</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredPatients.map((patient) => (
            <tr key={patient._id}>
              <td>
                <span className="patient-number-circle">
                  {patient.patientNumber}
                </span>
              </td>
              <td>{patient.lastName}</td>
              <td>{patient.firstName}</td>
              <td>{patient.phoneNumber}</td>
              <td className="action-buttons">
                <button className="btn-view" onClick={() => handlePatientClick(patient._id)}> 
                  Consulter le dossier 
                </button>
                <button 
                  className="btn-delete" 
                  onClick={() => handleDeletePatient(patient._id, `${patient.firstName} ${patient.lastName}`)}
                >
                  Supprimer le patient
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Patient;