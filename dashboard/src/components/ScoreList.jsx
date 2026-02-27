import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../App.css';

const scoresBySpecialty = {
  "Cardiologie": [
    { id: "cha2ds2vasc", name: "CHA2DS2-VASc (Score)", description: "Risque embolique sur ACFA (Fibrillation Atriale)" },
    { id: "wells-dvt", name: "Wells, Phlébite (Score)", description: "Probabilité de thrombose veineuse profonde (TVP)" },
    { id: "grace", name: "GRACE (Score)", description: "Risque de mortalité dans le syndrome coronarien aigu" },
    { id: "hasbled", name: "HAS-BLED (Score)", description: "Risque hémorragique sous anticoagulants" },
    { id: "nyha", name: "NYHA (Classification)", description: "Classification de l'insuffisance cardiaque" },
  ],
  "Gériatrie": [
    { id: "4peps", name: "4PEPS (Score)", description: "Dépistage de la fragilité chez la personne âgée" },
    { id: "mmse", name: "MMSE (Score)", description: "Mini-Mental State Examination - Évaluation cognitive" },
    { id: "iadl", name: "IADL (Score)", description: "Activités instrumentales de la vie quotidienne" },
    { id: "adl", name: "ADL (Score)", description: "Activités de base de la vie quotidienne (Katz)" },
  ],
  "Hépato-Gastroentérologie": [
    { id: "child-pugh", name: "Child-Pugh (Score)", description: "Stades de sévérité d'une cirrhose hépatique" },
    { id: "meld", name: "MELD (Score)", description: "Sévérité de la maladie hépatique terminale" },
    { id: "rockall", name: "Rockall (Score)", description: "Risque de mortalité dans l'hémorragie digestive haute" },
  ],
  "Neurologie": [
    { id: "glasgow", name: "Glasgow (Score)", description: "Evaluation de l'état de conscience" },
    { id: "nihss", name: "NIHSS (Score)", description: "Évaluation de la sévérité d'un AVC" },
    { id: "rankin", name: "Rankin modifié (Score)", description: "Degré d'incapacité après un AVC" },
  ],
  "Nutrition": [
    { id: "imc", name: "Indice de Masse Corporelle (IMC)", description: "Évaluation du statut pondéral (surpoids, obésité)" },
    { id: "mna", name: "MNA (Score)", description: "Mini Nutritional Assessment - Dépistage de la dénutrition" },
  ],
  "Pneumologie": [
    { id: "curb65", name: "CURB-65 (Score)", description: "Sévérité d'une pneumonie communautaire" },
    { id: "wells-ep", name: "Wells, Embolie Pulmonaire (Score)", description: "Probabilité d'embolie pulmonaire" },
    { id: "gold", name: "GOLD (Classification)", description: "Stades de sévérité de la BPCO" },
  ],
  "Réanimation": [
    { id: "qsofa", name: "qSOFA (Score)", description: "Gravité sepsis simplifiée (Quick SOFA)" },
    { id: "sofa", name: "SOFA (Score)", description: "Évaluation des défaillances d'organes" },
    { id: "saps2", name: "SAPS II (Score)", description: "Simplified Acute Physiology Score" },
    { id: "apache2", name: "APACHE II (Score)", description: "Acute Physiology and Chronic Health Evaluation" },
  ],
  "Néphrologie": [
    { id: "mdrd", name: "MDRD (Formule)", description: "Estimation du débit de filtration glomérulaire" },
    { id: "ckd-epi", name: "CKD-EPI (Formule)", description: "Estimation du DFG (plus précise que MDRD)" },
    { id: "cockroft", name: "Cockcroft-Gault (Formule)", description: "Clairance de la créatinine" },
  ],
  "Obstétrique": [
    { id: "apgar", name: "Score d'Apgar", description: "Vitalité du nouveau-né à la naissance" },
    { id: "bishop", name: "Bishop (Score)", description: "Maturation cervicale avant déclenchement" },
  ],
  "Psychiatrie": [
    { id: "phq9", name: "PHQ-9 (Score)", description: "Dépistage et évaluation de la dépression" },
    { id: "gad7", name: "GAD-7 (Score)", description: "Dépistage du trouble anxieux généralisé" },
  ],
  "Rhumatologie": [
    { id: "das28", name: "DAS28 (Score)", description: "Activité de la polyarthrite rhumatoïde" },
    { id: "frax", name: "FRAX (Score)", description: "Risque de fracture ostéoporotique" },
  ],
  "Urologie": [
    { id: "ipss", name: "IPSS (Score)", description: "Symptômes prostatiques (International Prostate Symptom Score)" },
  ],
};

const ScoreList = () => {
  const navigate = useNavigate();
  const [selectedSpecialty, setSelectedSpecialty] = useState("Tous");
  const [searchTerm, setSearchTerm] = useState("");

  const allScores = Object.keys(scoresBySpecialty).reduce((acc, specialty) => {
    return [...acc, ...scoresBySpecialty[specialty].map(score => ({ ...score, specialty }))];
  }, []);

  const filteredScores = allScores.filter(score => {
    const matchesSpecialty = selectedSpecialty === "Tous" || score.specialty === selectedSpecialty;
    const matchesSearch = score.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          score.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSpecialty && matchesSearch;
  });

  return (
    <div className="main-container score-list-container">
      <h2 className="form-title">Calculateur de Scores Médicaux</h2>
      
      <div className="filter-container">
        <div className="filter-group">
          <label htmlFor="specialty-select">Filtrer par spécialité :</label>
          <select 
            id="specialty-select"
            className="filter-select"
            value={selectedSpecialty} 
            onChange={(e) => setSelectedSpecialty(e.target.value)}
          >
            <option value="Tous">Toutes les spécialités</option>
            {Object.keys(scoresBySpecialty).sort().map(specialty => (
              <option key={specialty} value={specialty}>{specialty}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="search-input">Rechercher un score :</label>
          <input
            id="search-input"
            className="filter-input"
            type="text"
            placeholder="Nom ou description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="results-count">
        {filteredScores.length} score(s) trouvé(s)
      </div>

      <div className="score-grid">
        {filteredScores
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(score => (
            <div 
              key={score.id} 
              className="score-card"
              onClick={() => navigate(`/scores/${score.id}`)}
            >
              <h3>{score.name}</h3>
              <p>{score.description}</p>
              <span className="specialty-badge">{score.specialty}</span>
            </div>
          ))
        }
      </div>

      {filteredScores.length === 0 && (
        <div className="no-results-message">
          Aucun score ne correspond à vos critères de recherche.
        </div>
      )}
    </div>
  );
};

export default ScoreList;