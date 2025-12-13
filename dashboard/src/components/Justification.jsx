import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import { Context } from "../main";
import axios from "axios";
import "../App.css";

const Justification = () => {
  const { admin } = useContext(Context);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [justificationText, setJustificationText] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const currentDate = new Date().toLocaleDateString('fr-FR');
  const navigate = useNavigate();

  const filteredPatients = patients.filter(patient => {
    const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/patient/patients`,
          {withCredentials: true}
        );
        setPatients(response.data.patients);
      } catch (error) {
        console.error("Erreur de chargement des patients:", error);
      }
    };
    fetchPatients();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedPatient ) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }
    setShowPreview(true);
  };

  const handleSave = async () => {
    const justificationData = {
      date: new Date(),
      doctorName: `Dr. ${admin.firstName} ${admin.lastName}`,
      doctor: {
        cabinetPhone: admin.cabinetPhone,
        ordreNumber: admin.ordreNumber,
        cabinetAddress: admin.cabinetAddress,
      },
    };
    
    if (justificationText) {
      justificationData.justificationText = justificationText;
    }
    

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/patient/${selectedPatient}/add-justification`,
        justificationData,
        {
          withCredentials: true
        }
      );

      if (response.status === 200) {
        alert("Justification enregistrée avec succès");
        navigate("/");
      }
    } catch (error) {
      console.error("Erreur :", error.message);
      alert(error.response?.data?.message || "Erreur lors de l'enregistrement");
    }
  };

  const selectedPatientData = patients.find(p => p._id === selectedPatient);

  const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="form-component">
      {showPreview ? (
        <div className="certificate-preview">
          <div className="preview-content">
            <div className="doctor-header">
              <div className="doctor-info">
                <div>N°: {admin?.ordreNumber}</div>
                <div>Dr. {admin?.firstName} {admin?.lastName}</div>
                <div>Spécialité : {admin?.specialite}</div>
                <div>{admin?.cabinetAddress}</div>
                <div>Tél: {admin?.cabinetPhone}</div>
              </div>
              
              <div className="date-div">
                <p>Fait le {currentDate}</p>
              </div>
            </div>
            
            <div className="patient-data-container">
              <p className="patient-data">Nom : {selectedPatientData?.lastName}</p>
              <span className="separator">|</span>
              <p className="patient-data">Prénom : {selectedPatientData?.firstName}</p>
              <span className="separator">|</span>
              <p className="patient-data">Age : {selectedPatientData ? calculateAge(selectedPatientData.dob) : ''}</p>
            </div>

            <h2 className="certificate-title">JUSTIFICATION MÉDICALE</h2>

            <div className="contenu">
              <p>Je soussigné(e), Dr {admin?.firstName} {admin?.lastName}  Certifie avoir vu et examiné le patient(e) agé de {selectedPatientData ? calculateAge(selectedPatientData.dob) : ''} ans ce jour au cabinet. </p>
              <p>dont certificat </p>
            </div>
            
            <div className="signature">
              <p>Signature et cachet du médecin</p>
              <p>Dr {admin?.firstName} {admin?.lastName}</p>
            </div>
          </div>

          <div className="preview-actions no-print">
            <div className="button-container">
              <button className="print-button" onClick={() => window.print()}>
                Imprimer
              </button>
              <button className="edit-button" onClick={() => setShowPreview(false)}>
                Modifier
              </button>
              <button className="submit-button" onClick={handleSave}>
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="form-container">
          {/* Colonne gauche - Image */}
          <div className="form-image">
            <img 
              src="/justification.png" 
              alt="Illustration médicale" 
              className="justification-image"
            />
          </div>

          {/* Colonne droite - Formulaire */}
          <div className="form-content">
            <h2 className="form-title">Justification Médicale</h2>
            <form onSubmit={handleSubmit} className="add-prescription-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Date :</label>
                  <input
                    type="text"
                    value={currentDate}
                    readOnly
                    className="disabled-field"
                  />
                </div>
                
                <div className="form-group">
                  <label>Médecin :</label>
                  <input 
                    type="text" 
                    value={admin ? `Dr. ${admin.firstName} ${admin.lastName}` : "Chargement..."} 
                    readOnly
                    className="disabled-field"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Patient :</label>
                <div className="searchable-dropdown">
                  <input
                    type="text"
                    placeholder="Rechercher par nom ou prénom..."
                    value={searchTerm}
                    onChange={(e) => {
                      const newSearchTerm = e.target.value;
                      setSearchTerm(newSearchTerm);
                      if (selectedPatient) {
                        const selected = patients.find(p => p._id === selectedPatient);
                        if (selected && `${selected.firstName} ${selected.lastName}` !== newSearchTerm) {
                          setSelectedPatient("");
                        }
                      }
                      setIsDropdownOpen(true);
                    }}
                    onClick={() => setIsDropdownOpen(true)}
                  />
                  {isDropdownOpen && (
                    <div className="dropdown-list">
                      {filteredPatients.length > 0 ? (
                        filteredPatients.map(patient => (
                          <div
                            key={patient._id}
                            className="dropdown-item"
                            onClick={() => {
                              setSelectedPatient(patient._id);
                              setSearchTerm(`${patient.firstName} ${patient.lastName}`);
                              setIsDropdownOpen(false);
                            }}
                          >
                            {patient.patientNumber} - {patient.firstName} {patient.lastName}
                          </div>
                        ))
                      ) : (
                        <div className="dropdown-no-results">Aucun patient trouvé</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" className="submit-button">
                Voir l'aperçu
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Justification;