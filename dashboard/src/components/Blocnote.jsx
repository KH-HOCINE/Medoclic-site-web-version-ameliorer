import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { Context } from "../main";
import axios from "axios";
import { 
  FaMicrophone, 
  FaMicrophoneSlash, 
  FaNotesMedical,
  FaCalculator 
} from 'react-icons/fa';
import ModalScores from './ModalScores';
import "../App.css";

const Blocnote = () => {
  const { admin } = useContext(Context);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [noteText, setNoteText] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [showScoreModal, setShowScoreModal] = useState(false);
  
  const textareaRef = useRef(null);
  const currentDate = new Date().toLocaleDateString('fr-FR');
  const navigate = useNavigate();

  const filteredPatients = patients.filter(patient => {
    const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  useEffect(() => {
    // Initialiser la reconnaissance vocale
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'fr-FR';
      
      recognitionInstance.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          setNoteText(prev => prev + finalTranscript + ' ');
        }
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Erreur de reconnaissance vocale:', event.error);
        setIsRecording(false);
      };
      
      recognitionInstance.onend = () => {
        setIsRecording(false);
      };
      
      setRecognition(recognitionInstance);
    }

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

  const startRecording = () => {
    if (recognition && !isRecording) {
      recognition.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (recognition && isRecording) {
      recognition.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedPatient || !noteText.trim()) {
      alert("Veuillez sélectionner un patient et saisir une note");
      return;
    }
    setShowPreview(true);
  };

  const handleSave = async () => {
    const noteData = {
      date: new Date(),
      doctorName: `Dr. ${admin.firstName} ${admin.lastName}`,
      doctor: {
        cabinetPhone: admin.cabinetPhone,
        ordreNumber: admin.ordreNumber,
        cabinetAddress: admin.cabinetAddress,
      },
      noteText: noteText.trim()
    };

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/patient/${selectedPatient}/add-note`,
        noteData,
        {
          withCredentials: true
        }
      );

      if (response.status === 200) {
        alert("Note enregistrée avec succès");
        navigate("/");
      }
    } catch (error) {
      console.error("Erreur :", error);
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

  const insertScoreResult = (scoreResult) => {
    if (scoreResult) {
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newText = noteText.substring(0, start) + 
                       scoreResult + "\n" + 
                       noteText.substring(end);
        setNoteText(newText);
        
        setShowScoreModal(false);
        
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(
            start + scoreResult.length + 1,
            start + scoreResult.length + 1
          );
        }, 0);
      }
    }
  };

  return (
    <div className="form-component">
      {/* Modal pour les scores - CORRECTION APPLIQUÉE ICI */}
      {showScoreModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <ModalScores 
              onInsertScore={insertScoreResult}
              onClose={() => setShowScoreModal(false)}
            />
          </div>
        </div>
      )}

      {showPreview ? (
        <>
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
                    <p>Le {currentDate}</p>
                  </div>
                </div>
                
                <div className="patient-data-container">
                  <p className="patient-data">Nom : {selectedPatientData.lastName}</p>
                  <span className="separator">|</span>
                  <p className="patient-data">Prénom : {selectedPatientData.firstName}</p>
                  <span className="separator">|</span>
                  <p className="patient-data">Age : {calculateAge(selectedPatientData.dob)}</p>
                </div>

                <h2 className="certificate-title">Examen clinique du jour </h2>

                <div className="note-content">
                  <div className="note-text">
                    {noteText.split('\n').map((line, index) => (
                      <p key={index}>{line}</p>
                    ))}
                  </div>
                </div>
                
                <div className="signature">
                  <p>Signature et cachet du médecin</p>
                  <p>Dr {admin?.firstName} {admin?.lastName}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="preview-actions no-print">
            <div className="button-container">
              <button className="action-button" onClick={() => window.print()}>
                Imprimer
              </button>
              <button className="action-button" onClick={() => setShowPreview(false)}>
                Modifier
              </button>
              <button className="action-button" onClick={handleSave}>
                Enregistrer
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="blocnote-container">
          {/* Colonne gauche - Image */}
          <div className="blocnote-image">
            <img 
              src="/teste.webp" 
              alt="Illustration médicale" 
              className="blocnote-image-content"
            />
          </div>

          {/* Colonne droite - Formulaire */}
          <div className="blocnote-content">
            <h2 className="form-title">
              <FaNotesMedical className="title-icon" />
              Examen clinique du jour
            </h2>
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

              <div className="form-group note-input-group">
                <label>Examen clinique du jour :</label>
                <div className="note-input-container">
                  <textarea
                    ref={textareaRef}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Saisissez votre note médicale ici... Vous pouvez aussi utiliser la reconnaissance vocale ou insérer des scores."
                    rows="8"
                    className="note-textarea"
                  />
                  <div className="voice-controls">
                    <button
                      type="button"
                      className="score-button"
                      onClick={() => setShowScoreModal(true)}
                      title="Ouvrir le calculateur de scores"
                    >
                      <FaCalculator />
                      Scores
                    </button>
                    
                    {recognition && (
                      <button
                        type="button"
                        className={`voice-button ${isRecording ? 'recording' : ''}`}
                        onClick={isRecording ? stopRecording : startRecording}
                        title={isRecording ? "Arrêter l'enregistrement" : "Commencer l'enregistrement vocal"}
                      >
                        {isRecording ? <FaMicrophoneSlash /> : <FaMicrophone />}
                        {isRecording ? " Arrêter" : " Microphone"}
                      </button>
                    )}
                  </div>
                </div>
                {isRecording && (
                  <div className="recording-indicator">
                    <span className="recording-dot"></span>
                    Enregistrement en cours... Parlez maintenant
                  </div>
                )}
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

export default Blocnote;