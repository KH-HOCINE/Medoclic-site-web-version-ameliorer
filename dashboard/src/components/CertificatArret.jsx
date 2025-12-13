import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../main";
import axios from "axios";
import "../App.css";

const CertificatArret = () => {
  const { admin } = useContext(Context);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [arretJours, setArretJours] = useState("");
  const [prolongationJours, setProlongationJours] = useState("");
  const [prolongationStart, setProlongationStart] = useState("");
  const [prolongationEnd, setProlongationEnd] = useState("");
  const [arretStart, setArretStart] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Filtrage des patients
  const filteredPatients = patients.filter(patient => {
    const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  const currentDate = new Date().toLocaleDateString('fr-FR');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/patient/patients`, 
          
        );
        setPatients(response.data.patients);
      } catch (error) {
        console.error("Erreur de chargement des patients:", error);
      }
    };
    fetchPatients();
  }, []);

  // Fonctions utilitaires
  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('fr-FR') : '';

  const calculateEndDate = (startDate, days) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + parseInt(days.match(/\((\d+)\)/)?.[1] || 0));
    return date;
  };

  // Validation du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();

    // Vérifications communes
    if (!selectedPatient || !returnDate) {
      alert("Veuillez sélectionner un patient et indiquer la date de reprise.");
      return;
    }

    // Déterminer le type de certificat
    const isNouvelArret = arretJours && arretStart;
    const isProlongation = prolongationJours && prolongationStart && prolongationEnd;

    // Validation des combinaisons
    if (!isNouvelArret && !isProlongation) {
      alert("Veuillez remplir soit l'arrêt initial soit la prolongation.");
      return;
    }
    if (isNouvelArret && isProlongation) {
      alert("Veuillez choisir entre un nouvel arrêt ou une prolongation, pas les deux.");
      return;
    }

    // Validation des formats
    const joursRegex = /.+\(\d+\)/;
    if (isNouvelArret && !joursRegex.test(arretJours)) {
      alert("Format invalide pour les jours d'arrêt. Ex: 'cinq (5)'");
      return;
    }
    if (isProlongation && !joursRegex.test(prolongationJours)) {
      alert("Format invalide pour les jours de prolongation. Ex: 'trois (3)'");
      return;
    }

    setShowPreview(true);
  };

  // Enregistrement des données
  const handleSave = async () => {
    if (!admin) {
      alert("Erreur d'authentification médecin");
      return;
    }

    const certificatData = {
      date: new Date().toISOString().split('T')[0],
      doctorName: `Dr. ${admin.firstName} ${admin.lastName}`,
      doctor: {
        cabinetPhone: admin.cabinetPhone,
        ordreNumber: admin.ordreNumber,
        cabinetAddress: admin.cabinetAddress,
      },
      patientId: selectedPatient,
      returnDate,
    };

    // Ajout conditionnel des données
    if (arretJours && arretStart) {
      certificatData.startDate = arretStart;
      certificatData.endDate = calculateEndDate(arretStart, arretJours).toISOString().split('T')[0];
      certificatData.arretJours = arretJours;
    } else {
      certificatData.prolongationStart = prolongationStart;
      certificatData.prolongationEnd = prolongationEnd;
      certificatData.prolongationJours = prolongationJours;
    }

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/patient/${selectedPatient}/add-certificat`,
        certificatData,
        
      );

      if (response.status === 200) {
        alert("Certificat enregistré avec succès");
        navigate("/");
      }
    } catch (error) {
      console.error("Erreur :", error.message);
      alert(error.response?.data?.message || "Erreur lors de l'enregistrement");
    }
  };

  // Calcul de l'âge
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

  const selectedPatientData = patients.find(p => p._id === selectedPatient);

  return (
    <div className="form-component">
      {showPreview ? (
        <div className="certificate-preview">
          <div className="preview-content">
            <div className="certificate-body">
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
                <p className="patient-data">Age : {calculateAge(selectedPatientData?.dob)}</p>
              </div>

              <h2 className="certificate-title">CERTIFICAT D'ARRET DE TRAVAIL</h2>

              {arretJours ? (
                <>
                  <p>Je soussigné, Dr {admin?.firstName} {admin?.lastName} certifie avoir examiné ce jour le (la) nommé(e) M. {selectedPatientData?.firstName} {selectedPatientData?.lastName} et déclare que son état de santé nécessite un arrêt de travail de {arretJours} jours.</p>
                  <p>À compter de : {formatDate(arretStart)}</p>
                </>
              ) : (
                <>
                  <p>Je soussigné, Dr {admin?.firstName} {admin?.lastName} certifie avoir examiné ce jour le (la) nommé(e) M. {selectedPatientData?.firstName} {selectedPatientData?.lastName} et déclare que son état de santé nécessite une prolongation d'arrêt de travail de {prolongationJours} jours.</p>
                  <p>Du : {formatDate(prolongationStart)} au : {formatDate(prolongationEnd)}</p>
                </>
              )}

              <p>Reprise du travail le {formatDate(returnDate)}</p>

              <div className="signature">
                <p>Signature et cachet du médecin</p>
                <p>Dr {admin?.firstName} {admin?.lastName}</p>
              </div>
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
        <>
          <h2 className="form-title">Certificat d'arrêt de travail</h2>
          <form onSubmit={handleSubmit} className="add-prescription-form">
            
            {/* Section commune */}
            <div className="form-group">
              <label>Patient :</label>
              <div className="searchable-dropdown">
                <input
                  type="text"
                  placeholder="Rechercher par nom ou prénom..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onClick={() => setIsDropdownOpen(true)}
                />
                {isDropdownOpen && (
                  <div className="dropdown-list">
                    {filteredPatients.map(patient => (
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
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Section Arrêt initial */}
            <div className="form-section">
              <h3>Nouvel arrêt de travail</h3>
              <div className="form-group">
                <label>Durée (texte et chiffres) :</label>
                <input
                  type="text"
                  placeholder="Ex: cinq (5)"
                  value={arretJours}
                  onChange={(e) => setArretJours(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Début de l'arrêt :</label>
                <input
                  type="date"
                  value={arretStart}
                  onChange={(e) => setArretStart(e.target.value)}
                />
              </div>
            </div>

            {/* Section Prolongation */}
            <div className="form-section">
              <h3>Prolongation d'arrêt</h3>
              <div className="form-group">
                <label>Durée (texte et chiffres) :</label>
                <input
                  type="text"
                  placeholder="Ex: trois (3)"
                  value={prolongationJours}
                  onChange={(e) => setProlongationJours(e.target.value)}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Du :</label>
                  <input
                    type="date"
                    value={prolongationStart}
                    onChange={(e) => setProlongationStart(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Au :</label>
                  <input
                    type="date"
                    value={prolongationEnd}
                    onChange={(e) => setProlongationEnd(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Champ obligatoire commun */}
            <div className="form-group">
              <label>Reprise du travail le :</label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="submit-button">
              Générer l'aperçu
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default CertificatArret;