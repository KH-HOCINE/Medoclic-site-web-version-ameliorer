import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import { Context } from "../main";
import axios from "axios";
import "../App.css";

// Modèles de lettres pré-remplies
const LETTER_TEMPLATES = {
  "Orientation": "Cher confrère,\n\nJe vous adresse le patient(e) [Nom du Patient], âgé(e) de [Âge du Patient] ans, pour avis et prise en charge concernant [Motif de la consultation].\n\nJe reste à votre disposition pour toute information complémentaire.\n\nConfraternellement,",
  "Radio": "Demande de radiographie de [Partie du corps à examiner].\n\nContexte clinique : [Décrire le contexte].\n\nMerci.",
  "Scanner": "Demande de TDM [Partie du corps à examiner] avec/sans injection de produit de contraste.\n\nContexte clinique : [Décrire le contexte].\n\nMerci.",
  "Échographie": "Demande d'échographie [Partie du corps à examiner].\n\nContexte clinique : [Décrire le contexte].\n\nMerci.",
  "IRM": "Demande d'IRM [Partie du corps à examiner] avec/sans injection de produit de contraste.\n\nContexte clinique : [Décrire le contexte].\n\nMerci.",
  "ECG": "Demande d'ECG de repos.\n\nContexte clinique : [Décrire le contexte].\n\nMerci.",
  "IMG": "Demande d'imagerie médicale.\n\nType d'examen souhaité : [Préciser si possible].\n\nContexte clinique : [Décrire le contexte].\n\nMerci.",
  "Autre": "" // Laisser vide pour une lettre personnalisée
};

const Lettre = () => {
  const { admin } = useContext(Context);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [letterType, setLetterType] = useState("Orientation");
  const [customLetterTitle, setCustomLetterTitle] = useState(""); // Nouvel état
  const [contentText, setContentText] = useState(LETTER_TEMPLATES["Orientation"]);
  const [showPreview, setShowPreview] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const currentDate = new Date().toLocaleDateString('fr-FR');
  const navigate = useNavigate();

  const filteredPatients = patients.filter(p => `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()));
  const selectedPatientData = patients.find(p => p._id === selectedPatient);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/patient/patients`, { withCredentials: true });
        setPatients(data.patients);
      } catch (error) {
        console.error("Erreur de chargement des patients:", error);
      }
    };
    fetchPatients();
  }, []);
  
  const calculateAge = (dob) => {
    if (!dob) return '';
    const age = new Date().getFullYear() - new Date(dob).getFullYear();
    return age;
  };

  useEffect(() => {
    let template = LETTER_TEMPLATES[letterType] || "";
    if (selectedPatientData) {
      template = template.replace(/\[Nom du Patient\]/g, `${selectedPatientData.firstName} ${selectedPatientData.lastName}`);
      template = template.replace(/\[Âge du Patient\]/g, calculateAge(selectedPatientData.dob));
    }
    setContentText(template);
  }, [letterType, selectedPatientData]);


  const handleSubmit = (e) => {
    e.preventDefault();
    const finalTitle = letterType === "Autre" ? customLetterTitle : letterType;
    if (!selectedPatient || !finalTitle || !contentText) {
      alert("Veuillez sélectionner un patient et remplir tous les champs, y compris le titre.");
      return;
    }
    setShowPreview(true);
  };

  const handleSave = async () => {
    const finalLetterType = letterType === "Autre" ? customLetterTitle : letterType;

    if (!finalLetterType) {
      alert("Veuillez préciser un titre pour la lettre.");
      return;
    }

    const lettreData = {
      date: new Date(),
      doctorName: `Dr. ${admin.firstName} ${admin.lastName}`,
      doctor: {
        cabinetPhone: admin.cabinetPhone,
        ordreNumber: admin.ordreNumber,
        cabinetAddress: admin.cabinetAddress,
      },
      letterType: finalLetterType,
      contentText,
    };

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/patient/${selectedPatient}/add-lettre`,
        lettreData,
        { withCredentials: true }
      );
      if (response.status === 200) {
        alert("Lettre enregistrée avec succès !");
        navigate(`/dossier-patient/${selectedPatient}`);
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      alert(error.response?.data?.message || "Erreur lors de l'enregistrement.");
    }
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
              <p className="patient-data">Age : {calculateAge(selectedPatientData?.dob)}</p>
            </div>

            <h2 className="certificate-title">
              {(letterType === "Autre" ? customLetterTitle : letterType).toUpperCase()}
            </h2>

            <div className="contenu" style={{ whiteSpace: 'pre-wrap' }}>
                {contentText}
            </div>
            
            <div className="signature">
              <p>Signature et cachet du médecin</p>
              <p>Dr {admin?.firstName} {admin?.lastName}</p>
            </div>
          </div>
          <div className="preview-actions no-print">
            <div className="button-container">
              <button className="print-button" onClick={() => window.print()}>Imprimer</button>
              <button className="edit-button" onClick={() => setShowPreview(false)}>Modifier</button>
              <button className="submit-button" onClick={handleSave}>Enregistrer</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="form-container">
          <div className="form-image">
            <img src="/lettre.png" alt="Illustration de lettre" className="lettre-image"/>
          </div>
          <div className="form-content">
            <h2 className="form-title">Générer une Lettre</h2>
            <form onSubmit={handleSubmit} className="add-prescription-form">
                <div className="form-group">
                    <label>Patient :</label>
                    <div className="searchable-dropdown">
                    <input
                        type="text"
                        placeholder="Rechercher un patient..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setIsDropdownOpen(true);
                        }}
                        onClick={() => setIsDropdownOpen(true)}
                    />
                    {isDropdownOpen && (
                        <div className="dropdown-list">
                        {filteredPatients.length > 0 ? (
                            filteredPatients.map(p => (
                            <div key={p._id} className="dropdown-item" onClick={() => {
                                setSelectedPatient(p._id);
                                setSearchTerm(`${p.firstName} ${p.lastName}`);
                                setIsDropdownOpen(false);
                            }}>
                                {p.patientNumber} - {p.firstName} {p.lastName}
                            </div>
                            ))
                        ) : (
                            <div className="dropdown-no-results">Aucun patient trouvé</div>
                        )}
                        </div>
                    )}
                    </div>
                </div>

                <div className="form-group">
                    <label>Type de Lettre :</label>
                    <select value={letterType} onChange={e => setLetterType(e.target.value)}>
                    {Object.keys(LETTER_TEMPLATES).map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                    </select>
                </div>
                
                {letterType === "Autre" && (
                  <div className="form-group">
                    <label>Titre personnalisé :</label>
                    <input
                      type="text"
                      value={customLetterTitle}
                      onChange={e => setCustomLetterTitle(e.target.value)}
                      placeholder="Entrez le titre de la lettre (ex: Compte Rendu)"
                      required 
                    />
                  </div>
                )}
                
                <div className="form-group">
                    <label>Contenu :</label>
                    <textarea 
                        value={contentText} 
                        onChange={e => setContentText(e.target.value)}
                        rows="10"
                        placeholder="Contenu de la lettre..."
                    />
                </div>
              
                <button type="submit" className="submit-button">Voir l'aperçu</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lettre;