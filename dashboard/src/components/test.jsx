import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Modal from "react-modal"; // Importez un composant modal (vous pouvez utiliser react-modal ou tout autre)

Modal.setAppElement('#root'); // Ceci est nécessaire pour l'accessibilité

const DossierPatient = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null); // État pour le fichier sélectionné
  const [isModalOpen, setIsModalOpen] = useState(false); // État pour contrôler l'affichage du modal

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/patient/${id}`, 
          
        );
        setPatient(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des détails du patient :", error);
      }
    };

    const fetchPrescriptions = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/prescriptions/patient/${id}`,
          
        );
        setPrescriptions(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des ordonnances :", error);
      }
    };

    fetchPatientDetails();
    fetchPrescriptions();
  }, [id]);

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (files.length > 0) {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('medicalFiles', file);
      });

      try {
        const response = await axios.put(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/patient/${id}/add-medical-files`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            withCredentials: true 
          }
        );
        setPatient(response.data.patient);
      } catch (error) {
        console.error("Erreur lors de l'ajout des fichiers médicaux :", error);
      }
    }
  };
  const [admin, setAdmin] = useState(null);

useEffect(() => {
  const fetchAdminDetails = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/admin/${id}`);
      setAdmin(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des détails de l'admin :", error);
    }
  };

  fetchAdminDetails();
}, [id]);

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

  const handleFileClick = (file) => {
    setSelectedFile(file);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
  };

  if (!patient) return <p>Chargement des informations...</p>;

  return (
    <div className="dossier-patient-container">
      <div className="dossier-card">
        <h2>Dossier du Patient : {patient.patientNumber}</h2>
        <p><strong>Nom du Patient :</strong> {patient.firstName} {patient.lastName}</p>
        <p><strong>Age :</strong> {calculateAge(patient.dob)}</p>
        <p><strong>Date d'inscription :</strong> {new Date(patient.registrationDate).toLocaleDateString('fr-FR')}</p> {/* Ajout de la date d'inscription */}
        <p><strong>Adresse :</strong> {patient.address}</p>
        <p><strong>Email :</strong> {patient.email}</p>
        <p><strong>Téléphone :</strong> {patient.phoneNumber}</p>
        <p><strong>Groupe Sanguin :</strong> {patient.bloodGroup}</p>
        <p><strong>antécédent médicaux:</strong> {patient.chronicDiseases || "Aucune"}</p>
        <p><strong>antécédent chirurgicaux:</strong> {patient.pastSurgeries || "Aucune"}</p>

        <div className="appointments-container">
  <h3>Rendez-vous</h3>
  {patient.appointments && patient.appointments.length > 0 ? (
    patient.appointments.map((appointment, index) => (
      <div key={index} className="appointment-card">
        <p><strong>Date du rendez-vous :</strong> {new Date(appointment.date).toLocaleDateString('fr-FR')}</p>
        <p><strong>Heure du rendez-vous :</strong> {new Date(appointment.date).toLocaleTimeString('fr-FR')}</p>
      </div>
    ))
  ) : (
    <p>Aucun rendez-vous enregistré.</p>
  )}
</div>


        {/* Affichage des fichiers médicaux */}
        <div className="medical-files-container">
          <h3>Fichiers Médicaux</h3>
          <button 
            onClick={() => document.getElementById('medicalFileInput').click()}
            className="add-file-button"
          >
            + Ajouter des fichiers
          </button>
          <input
            type="file"
            id="medicalFileInput"
            multiple
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />

          {patient.medicalFiles && patient.medicalFiles.length > 0 ? (
            <div className="medical-files-grid">
              {patient.medicalFiles.map((file, index) => {
                const isImage = file.startsWith('data:image/');
                const isPDF = file.startsWith('data:application/pdf');
                
                return (
                  <div key={index} className="medical-file-card" onClick={() => handleFileClick(file)}>
                    {isImage && <img src={file} alt={`Document médical ${index + 1}`} className="medical-image" />}
                    {isPDF && (
                      <div className="pdf-container">
                        <iframe src={file} title={`PDF ${index + 1}`} className="pdf-iframe" />
                        <a href={file} download={`document-${index}.pdf`} className="download-link">Télécharger PDF</a>
                      </div>
                    )}
                    <span className="file-name">Document {index + 1}</span>
                    
                  </div>
                );
              })}
            </div>
          ) : (
            <p>Aucun fichier médical disponible</p>
          )}
        </div>

        {/* Modal pour afficher le fichier en grand */}
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          contentLabel="Fichier Médical"
          className="modal"
          overlayClassName="overlay"
        >
          {selectedFile && (
            <>
              {selectedFile.startsWith('data:image/') && (
                <img src={selectedFile} alt="Document médical" className="modal-image" />
              )}
              {selectedFile.startsWith('data:application/pdf') && (
                <iframe src={selectedFile} title="PDF" className="modal-pdf" />
              )}
              <button onClick={closeModal} className="close-modal-button">Fermer</button>
            </>
          )}
        </Modal>

        {/* Affichage des ordonnances */}
        <div className="prescriptions-container">
          <h3>Ordonnances</h3>
          {patient.prescriptions && patient.prescriptions.length > 0 ? (
            patient.prescriptions.map((prescription, index) => (
              <div key={index} className="prescription-card">
                <div className="prescription-header">
                
                <strong className="titre">ORDONNANCE</strong>
                  <p><strong>Le:</strong> {new Date(prescription.date).toLocaleDateString('fr-FR')}</p>
                </div>
                <p><strong>Médecin :</strong> {prescription.doctorName}</p>
                <p><strong>Patient (e) </strong> {patient.firstName} {patient.lastName}</p>
                {prescription.notes && <p><strong>Notes :</strong> {prescription.notes}</p>}
                <h4>Médicaments :</h4>
                <ul>
                  {prescription.medications.map((med, idx) => (
                    <li key={idx}>
                      {med.name} - {med.dosage} ({med.frequency}/jour) -  During {med.duration}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <p>Aucune ordonnance enregistrée.</p>
          )}
        </div>

        {/* Affichage des bilans prescrits */}
        <div className="bilans-container">
          <h3>Bilans Prescrits</h3>
          {patient.bilans && patient.bilans.length > 0 ? (
            patient.bilans.map((bilan, index) => {
              const prescribedTests = Object.entries(bilan.tests)
                .filter(([_, value]) => value === true)
                .map(([test]) => test);
              
              return (
                <div key={index} className="bilan-card">
                  <strong className="titre">DEMANDE DE BILAN</strong>
                  <p><strong>Nom du Patient (e):</strong>{patient.lastName} </p>
                  <p><strong>Prenom du Patient (e):</strong>{patient.firstName}</p>
                  <p><strong>Date:</strong> {new Date(bilan.date).toLocaleDateString('fr-FR')}</p>
                  <p><strong>Médecin :</strong> {bilan.doctorName}</p>
                  <h4>Tests demandés :</h4>
                  <ul className="tests-list">
                    {prescribedTests.map((test) => (
                      <li key={test}>{test}</li>
                    ))}
                  </ul>
                </div>
              );
            })
          ) : (
            <p>Aucun bilan prescrit.</p>
          )}
        </div>

        {/* Ajout de la section des arrêts de travail */}
        <div className="arrets-container">
          <h3>Arrêts de Travail</h3>
          {patient.certificats && patient.certificats.length > 0 ? (
            patient.certificats.map((certificat, index) => (
              <div key={index} className="arret-card">
                
                <p><strong>Le :</strong> {new Date(certificat.startDate).toLocaleDateString('fr-FR')}</p>
                <strong className="titre">CERTIFICAT D'ARRET DE TRAVAIL</strong>
                <p><strong>Je soussigné</strong> {certificat.doctorName}</p>
                <p><strong>Certifie avoir examiné ce jour le (la) nommé (e) </strong>{patient.firstName} {patient.lastName}</p>
                <p><strong>Et déclare que son état de sante nécessite un arret de travail </strong></p>
                <p><strong>de:</strong> </p>
                <p><strong>Une Prolongation d'arret de travail de :</strong> </p>
                {certificat.prolongationStart && (
                  <p><strong>du:</strong>  {new Date(certificat.prolongationStart).toLocaleDateString('fr-FR')} <strong>au</strong> {new Date(certificat.prolongationEnd).toLocaleDateString('fr-FR')}</p>
                )}
                <p><strong>a compter de :</strong> {new Date(certificat.date).toLocaleDateString('fr-FR')}</p>
                <p><strong>Période d'arrêt :</strong> du {new Date(certificat.startDate).toLocaleDateString('fr-FR')} au {new Date(certificat.endDate).toLocaleDateString('fr-FR')}</p>
                <p><strong> Lui permet de reprendre son travail le </strong> {new Date(certificat.returnDate).toLocaleDateString('fr-FR')}</p>
              </div>
            ))
          ) : (
            <p>Aucun arrêt de travail enregistré.</p>
          )}
        </div>

        {/* Ajouter cette section après la section des arrêts de travail */}
        <div className="justifications-container">
          <h3>Justifications Médicales</h3>
          {patient.justifications && patient.justifications.length > 0 ? (
            patient.justifications.map((justification, index) => (
              <div key={index} className="justification-card">
                <p>Last Name : {patient.lastName} </p> <p> First Name : {patient.firstName}  </p>
                <strong className="titre">jUSTIFICATION</strong>
                <p> <strong>Je soussigné :</strong> {justification.doctorName}</p>
                <p><strong>Certifie avoir vu et examiné le patient(e) agé de {calculateAge(patient.dob)} ans ce jour dont certificat </strong></p>
                <p><strong>Le:</strong> {new Date(justification.date).toLocaleDateString('fr-FR')}</p>
              </div>
            ))
          ) : (
            <p>Aucune justification enregistrée.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DossierPatient;