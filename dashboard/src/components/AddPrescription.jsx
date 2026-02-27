import React, { useState, useEffect, useContext } from 'react';
import { Context } from "../main";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css";

const AddPrescription = () => {
  const { admin } = useContext(Context);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [medications, setMedications] = useState([{ 
    medicamentId: '', 
    nomCommercial: '', 
    dosage: '', 
    formePharmaceutique: '', // Nouveau champ pour stocker la forme pharmaceutique
    forme: '',
    frequence: '',
    duree: ''
  }]);
  const [notes, setNotes] = useState('');
  const currentDate = new Date().toLocaleDateString('fr-FR');
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [medicamentsList, setMedicamentsList] = useState([]);
  
  const [medicamentSearchTerms, setMedicamentSearchTerms] = useState(['']);
  const [medicamentDropdownOpen, setMedicamentDropdownOpen] = useState([false]);
  
  const formesOptions = [
    '1/4 Comprimé',
    '1/2 Comprimé',
    '1 Comprimé',
    '2 Comprimés',
    '3 Comprimés',
    '4 Comprimés',
    '5 Comprimés',
    '1/4 Injection',
    '1/2 Injection',
    '1 Injection',
    '2 Injections',
    '3 Injections',
    '4 Injections',
    '5 Injections',
    '1/4 Poudre solution',
    '1/2 Poudre solution',
    '1 Poudre solution',
    '2 Poudre solutions',
    '3 Poudre solutions'
  ];

  const frequenceOptions = [
    'par jour',
    'par semaine',
    'par mois'
  ];

  const dureeOptions = Array.from({ length: 31 }, (_, i) => `QSP ${i + 1} jour${i > 0 ? 's' : ''}`);
  
  const filteredPatients = patients.filter(patient => {
    const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  // Fonction utilitaire pour afficher la forme pharmaceutique
  const getFormeDisplay = (medicament) => {
    return medicament.forme === "Autre" ? medicament.formeAutre : medicament.forme;
  };

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/patient/patients`,
          { withCredentials: true }
        );
        setPatients(response.data.patients);
      } catch (error) {
        console.error("Erreur de chargement des patients:", error);
      }
    };
    fetchPatients();
  }, []);

  useEffect(() => {
    const fetchMedicaments = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/medicament/all`,
          { withCredentials: true }
        );
        setMedicamentsList(response.data.medicaments);
      } catch (error) {
        console.error("Erreur de chargement des médicaments:", error);
      }
    };
    fetchMedicaments();
  }, []);

  const getFilteredMedicaments = (index) => {
    const searchTerm = medicamentSearchTerms[index] || '';
    return medicamentsList.filter(medicament => 
      medicament.nomCommercial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicament.dosage.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (medicament.forme && medicament.forme.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (medicament.formeAutre && medicament.formeAutre.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const handleMedicationChange = (index, field, value) => {
    const newMedications = [...medications];
    
    if (field === 'medicamentId') {
      const selectedMedicament = medicamentsList.find(m => m._id === value);
      if (selectedMedicament) {
        newMedications[index] = {
          ...newMedications[index],
          medicamentId: value,
          nomCommercial: selectedMedicament.nomCommercial,
          dosage: selectedMedicament.dosage,
          formePharmaceutique: getFormeDisplay(selectedMedicament) // Stocker la forme pharmaceutique
        };
        
        const newSearchTerms = [...medicamentSearchTerms];
        newSearchTerms[index] = `${selectedMedicament.nomCommercial} (${selectedMedicament.dosage}) - ${getFormeDisplay(selectedMedicament)}`;
        setMedicamentSearchTerms(newSearchTerms);
        
        const newDropdownOpen = [...medicamentDropdownOpen];
        newDropdownOpen[index] = false;
        setMedicamentDropdownOpen(newDropdownOpen);
      }
    } else {
      newMedications[index][field] = value;
    }
    
    setMedications(newMedications);
  };

  const handleMedicamentSearch = (index, searchValue) => {
    const newSearchTerms = [...medicamentSearchTerms];
    newSearchTerms[index] = searchValue;
    setMedicamentSearchTerms(newSearchTerms);
    
    const newDropdownOpen = [...medicamentDropdownOpen];
    newDropdownOpen[index] = true;
    setMedicamentDropdownOpen(newDropdownOpen);
    
    const newMedications = [...medications];
    const selectedMedicament = medicamentsList.find(m => 
      `${m.nomCommercial} (${m.dosage}) - ${getFormeDisplay(m)}` === searchValue
    );
    if (!selectedMedicament) {
      newMedications[index].medicamentId = '';
      newMedications[index].nomCommercial = '';
      newMedications[index].dosage = '';
      newMedications[index].formePharmaceutique = '';
      setMedications(newMedications);
    }
  };

  const addMedicationField = () => {
    setMedications([...medications, { 
      medicamentId: '', 
      nomCommercial: '', 
      dosage: '', 
      formePharmaceutique: '',
      forme: '',
      frequence: '',
      duree: ''
    }]);
    setMedicamentSearchTerms(prevTerms => [...prevTerms, '']);
    setMedicamentDropdownOpen(prevOpen => [...prevOpen, false]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!admin || !selectedPatient) {
      alert("Veuillez sélectionner un patient");
      return;
    }
    setShowPreview(true);
  };

  const handleSave = async () => {
    const prescriptionData = {
      date: new Date().toISOString(),
      doctorName: `Dr. ${admin.firstName} ${admin.lastName}`,
      doctor: {
        cabinetPhone: admin.cabinetPhone,
        ordreNumber: admin.ordreNumber,
        cabinetAddress: admin.cabinetAddress,
      },
      medications: medications.filter(med => med.nomCommercial && med.dosage),
      notes
    };

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/patient/${selectedPatient}/add-prescription`,
        prescriptionData,
        {
          withCredentials: true
        }
      );

      if (response.status === 200) {
        alert("Ordonnance enregistrée avec succès");
        navigate("/");
      }
    } catch (error) {
      console.error("Erreur :", error.message);
      alert(error.response?.data?.message || "Erreur lors de l'enregistrement");
    }
  };
  
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
                    <p>Fait le {currentDate}</p>
                  </div>
                </div>
                
                <div className="patient-data-container">
                  <p className="patient-data">Nom : {selectedPatientData.lastName}</p>
                  <span className="separator">|</span>
                  <p className="patient-data">Prénom : {selectedPatientData.firstName}</p>
                  <span className="separator">|</span>
                  <p className="patient-data">Age : {calculateAge(selectedPatientData.dob)}</p>
                </div>
                
                <h2 className="certificate-title">ORDONNANCE MÉDICALE</h2>
                
                <div className="prescription-content">
                  <h3>Médicaments prescrits :</h3>
                  <ul className="medications-list">
                    {medications.filter(med => med.nomCommercial).map((med, idx) => (
                      <li key={idx} className="medication-item">
                        <div className="medication-line-1">
                          <strong>- {med.nomCommercial} {med.dosage} {med.formePharmaceutique && `(${med.formePharmaceutique})`}</strong>
                          <span className="qsp-spacer">{med.duree}</span>
                        </div>
                        <div className="medication-line-2">
                          {med.forme && `${med.forme}`}
                          {med.frequence && ` ${med.frequence}`}
                        </div>
                      </li>
                    ))}
                  </ul>

                  {notes && (
                    <div className="prescription-notes">
                      <h3>Notes :</h3>
                      <p>{notes}</p>
                    </div>
                  )}

                  <div className="signature">
                    <p>Signature et cachet du médecin</p>
                    <p>Dr {admin?.firstName} {admin?.lastName}</p>
                  </div>
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
        <div className="prescription-form-container">
          <div className="prescription-image">
            <img 
              src="/prescription.png" 
              alt="Illustration médicale" 
              className="prescription-img"
            />
          </div>
          
          <div className="prescription-form">
            <h2>Nouvelle Ordonnance</h2>
            <form onSubmit={handleSubmit} className="add-prescription-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Date :</label>
                  <input type="text" value={currentDate} readOnly className="disabled-field" />
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

              <div className="medications-form">
                <h3>Médicaments</h3>
                {medications.map((med, index) => (
                  <div key={index} className="medication-row">
                    <div className="searchable-dropdown">
                      <input
                        type="text"
                        placeholder="Nom du médicament"
                        value={medicamentSearchTerms[index] || ''}
                        onChange={(e) => handleMedicamentSearch(index, e.target.value)}
                        onClick={() => {
                          const newDropdownOpen = [...medicamentDropdownOpen];
                          newDropdownOpen[index] = true;
                          setMedicamentDropdownOpen(newDropdownOpen);
                        }}
                      />
                      {medicamentDropdownOpen[index] && (
                        <div className="dropdown-list">
                          {getFilteredMedicaments(index).length > 0 ? (
                            getFilteredMedicaments(index).map((medicament) => (
                              <div
                                key={medicament._id}
                                className="dropdown-item medicament-dropdown-item"
                                onClick={() => handleMedicationChange(index, 'medicamentId', medicament._id)}
                              >
                                <div className="medicament-info">
                                  <div className="medicament-name">{medicament.nomCommercial}</div>
                                  <div className="medicament-details">
                                    {medicament.dosage} - {getFormeDisplay(medicament)}
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="dropdown-no-results">Aucun médicament trouvé</div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <select
                      value={med.forme}
                      onChange={(e) => handleMedicationChange(index, 'forme', e.target.value)}
                      className="medication-select"
                    >
                      <option value="">Forme et dosage</option>
                      {formesOptions.map((forme, idx) => (
                        <option key={idx} value={forme}>{forme}</option>
                      ))}
                    </select>

                    <select
                      value={med.frequence}
                      onChange={(e) => handleMedicationChange(index, 'frequence', e.target.value)}
                      className="medication-select"
                    >
                      <option value="">Fréquence</option>
                      {frequenceOptions.map((freq, idx) => (
                        <option key={idx} value={freq}>{freq}</option>
                      ))}
                    </select>

                    <select
                      value={med.duree}
                      onChange={(e) => handleMedicationChange(index, 'duree', e.target.value)}
                      className="medication-select"
                    >
                      <option value="">Durée</option>
                      {dureeOptions.map((duree, idx) => (
                        <option key={idx} value={duree}>{duree}</option>
                      ))}
                    </select>
                  </div>
                ))}
                
                <button type="button" onClick={addMedicationField} className="add-button">
                  Ajouter un autre médicament
                </button>
              </div>

              <div className="form-group">
                <label>Notes (optionnel) :</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="3"
                  placeholder="Notes supplémentaires pour l'ordonnance..."
                />
              </div>

              <button type="submit" className="submit-button">
                Voir aperçu
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddPrescription;