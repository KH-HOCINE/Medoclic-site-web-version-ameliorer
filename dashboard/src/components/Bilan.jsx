import React, { useState, useEffect, useContext } from 'react';
import { Context } from "../main";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css";

// Définition des tests pour chaque groupe avec leurs libellés
const group1Tests = {
  groupageSanguin: "Groupage sanguin",
  fnsComplete: "FNS Complète",
  glycemieAJeun: "Glycémie à jeun",
  hemoglobineGlyqueeHbA1c: "Hémoglobine glyquée (HbA1c)",
  hbpo: "HBPO",
  cholesterolTotalHDLLDL: "Cholestérol Total, HDL, LDL",
  triglycerides: "Triglycérides",
  ureeSanguine: "Urée sanguine",
  acideUrique: "Acide urique",
  bilirubineASATALAT: "Bilirubine : (ASAT, ALAT)",
  cpk: "CPK",
  testosteronemie: "Testostéronémie",
  prolactinemie: "Prolactinémie",
  tauxHCG: "Taux hCG",
  psaTotal: "PSA total",
  psaLibre: "PSA libre"
};

const group2Tests = {
  phosphatasesAlcalines: "Phosphatases alcalines",
  tauxProthrombineTP: "Taux de prothrombine (TP)",
  tckInr: "TCK-INR",
  vsCrpFibrinogene: "VS, CRP, Fibrinogène",
  ferSerique: "Fer Sérique",
  ionogrammeSanguin: "Ionogramme sanguin (NA+, K+, CA)",
  phosphoremie: "Phosphorémie",
  magnesemie: "Magnésémie",
  ecbuAntibiogramme: "ECBU, Antibiogramme",
  chimieDesUrines: "Chimie des urines + Protéinurie des 24H",
  microalbuminurie: "Microalbuminurie",
  spermogramme: "Spermogramme",
  fshLh: "FSH, LH",
  tshT3T4: "TSH, T3, T4",
  covid19Pcr: "Covid-19: PCR",
  covid19Antigenique: "Covid-19: Antigénique",
  covid19Serologique: "Covid-19: Sérologique"
};

// Création de l'état initial pour tous les tests
const initialTestsState = {
  ...Object.keys(group1Tests).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
  ...Object.keys(group2Tests).reduce((acc, key) => ({ ...acc, [key]: false }), {})
};

const Bilan = () => {
  const { admin } = useContext(Context);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const currentDate = new Date().toLocaleDateString('fr-FR');
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [additionalTest, setAdditionalTest] = useState("");
  const [additionalTests, setAdditionalTests] = useState([]);
  const [selectedTests, setSelectedTests] = useState(initialTestsState);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/patient/patients`,
          { withCredentials: true }
        );
        setPatients(response.data.patients);
      } catch (error) {
        console.error("Erreur de chargement des patients:", error);
      }
    };
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(patient => {
    const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  const handleTestChange = (testName) => {
    setSelectedTests(prev => ({
      ...prev,
      [testName]: !prev[testName]
    }));
  };

  const handleAddTest = () => {
    if (additionalTest.trim()) {
      setAdditionalTests([...additionalTests, additionalTest.trim()]);
      setAdditionalTest("");
    }
  };

  const handleRemoveTest = (index) => {
    setAdditionalTests(additionalTests.filter((_, i) => i !== index));
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
    const bilanData = {
      date: new Date().toISOString().split('T')[0],
      doctorName: `Dr. ${admin.firstName} ${admin.lastName}`,
      doctor: {
        cabinetPhone: admin.cabinetPhone,
        ordreNumber: admin.ordreNumber,
        cabinetAddress: admin.cabinetAddress,
      },
      tests: selectedTests,
      additionalTests
    };

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/patient/${selectedPatient}/add-bilan`,
        bilanData,
        { withCredentials: true }
      );

      if (response.status === 200) {
        alert("Bilan enregistré avec succès");
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
  
  const selectedTestsList = [
    ...Object.entries(selectedTests)
      .filter(([_, checked]) => checked)
      .map(([key]) => (group1Tests[key] || group2Tests[key])),
    ...additionalTests
  ];

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
                <p className="patient-data">Nom : {selectedPatientData.lastName}</p>
                <span className="separator">|</span>
                <p className="patient-data">Prénom : {selectedPatientData.firstName}</p>
                <span className="separator">|</span>
                <p className="patient-data">Age : {calculateAge(selectedPatientData.dob)}</p>
              </div>

              <h2 className="certificate-title">DEMANDE DE BILAN</h2>
              <h3>Examens prescrits :</h3>
              <ul className="tests-list">
                {selectedTestsList.map((test, index) => (
                  <li key={index}>{test}</li>
                ))}
              </ul>

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
          <h2 className="form-title"> Page Bilan</h2>
          <form onSubmit={handleSubmit} className="add-prescription-form">
            <div className="form-row">
              <div className="form-group">
                <label>Date du bilan :</label>
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

            <div className="bilan-tests-container">
              <div className="bilan-tests-group">
                <h4>Groupe 1</h4>
                {Object.entries(group1Tests).map(([key, label]) => (
                  <div className="test-item" key={key}>
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedTests[key]}
                        onChange={() => handleTestChange(key)}
                      /> {label}
                    </label>
                  </div>
                ))}
              </div>

              <div className="bilan-tests-group">
                <h4>Groupe 2</h4>
                {Object.entries(group2Tests).map(([key, label]) => (
                  <div className="test-item" key={key}>
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedTests[key]}
                        onChange={() => handleTestChange(key)}
                      /> {label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="form-group">
              <label>Tests supplémentaires:</label>
              <div className="additional-tests">
                <input
                  type="text"
                  value={additionalTest}
                  onChange={(e) => setAdditionalTest(e.target.value)}
                  placeholder="Ajouter un test"
                />
                <button type="button" onClick={handleAddTest}>
                  +
                </button>
              </div>
              {additionalTests.length > 0 && (
                <ul className="additional-tests-list">
                  {additionalTests.map((test, index) => (
                    <li key={index}>
                      {test}
                      <button
                        type="button"
                        onClick={() => handleRemoveTest(index)}
                        className="remove-test"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button type="submit" className="submit-button">
              Voir aperçu
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default Bilan;