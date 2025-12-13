import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../App.css'; // Importez le fichier CSS

const scoresBySpecialty = {
  "Cardiologie": [
    { id: "cha2ds2vasc", name: "CHA2DS2-VASc (Score)", description: "Risque embolique sur ACFA (Fibrillation Atriale)" },
    { id: "wells-dvt", name: "Wells, Phlébite (Score)", description: "Probabilité de thrombose veineuse profonde (TVP)" },
  ],
  "Gériatrie": [
    { id: "4peps", name: "4PEPS (Score)", description: "Dépistage de la fragilité chez la personne âgée" }
  ],
  "Hépato-Gastroentérologie": [
      { id: "child-pugh", name: "Child-Pugh (Score)", description: "Stades de sévérité d'une cirrhose hépatique" }
  ],
  "Neurologie": [
    { id: "glasgow", name: "Glasgow (Score)", description: "Evaluation de l'état de conscience" }
  ],
  "Nutrition": [
    { id: "imc", name: "Indice de Masse Corporelle (IMC)", description: "Évaluation du statut pondéral (surpoids, obésité)" }
  ],
 
  "Réanimation": [
      { id: "qsofa", name: "qSOFA (Score)", description: "Gravité sepsis simplifiée (Quick SOFA)" }
  ]
};

const ScoreList = () => {
  const navigate = useNavigate();
  const [selectedSpecialty, setSelectedSpecialty] = useState("Tous");
  const [searchTerm, setSearchTerm] = useState("");

  // Crée une liste plate de tous les scores avec leur spécialité
  const allScores = Object.keys(scoresBySpecialty).reduce((acc, specialty) => {
    return [...acc, ...scoresBySpecialty[specialty].map(score => ({ ...score, specialty }))];
  }, []);

  // Filtre les scores en fonction de la spécialité et de la recherche
  const filteredScores = allScores.filter(score => {
    const matchesSpecialty = selectedSpecialty === "Tous" || score.specialty === selectedSpecialty;
    const matchesSearch = score.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          score.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSpecialty && matchesSearch;
  });

  return (
    <div className="main-container score-list-container">
      <h2 className="form-title"> Calculateur de Scores Médicaux</h2>
      
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
