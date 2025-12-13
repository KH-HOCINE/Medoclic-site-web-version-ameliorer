import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "../App.css";

const AddMedicament = () => {
  const [nomCommercial, setNomCommercial] = useState("");
  const [nomScientifique, setNomScientifique] = useState("");
  const [dosage, setDosage] = useState("");
  const [forme, setForme] = useState("");
  const [formeAutre, setFormeAutre] = useState("");
  const [voie, setVoie] = useState("");
  const [classeTherapeutique, setClasseTherapeutique] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/medicament/add`,
        { 
          nomCommercial, 
          nomScientifique,
          dosage, 
          forme,
          formeAutre,
          voie,
          classeTherapeutique,
          description 
        },
        { withCredentials: true }
      );
      toast.success(response.data.message);
      navigate("/"); // Rediriger après succès
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de l'ajout");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToMedicamentsList = () => {
    navigate("/liste-medicaments");
  };

  return (
    <div className="form-component">
      {/* En-tête avec bouton aligné à droite */}
      <div className="form-header">
        <h2>Ajouter un nouveau médicament</h2>
        <div className="button-group">
          <button 
            type="button" 
            onClick={handleGoToMedicamentsList}
            className="manage-button"
          >
            Gérer les médicaments
          </button>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="add-form">
        <div className="form-group">
          <label>Nom commercial *</label>
          <input
            type="text"
            value={nomCommercial}
            onChange={(e) => setNomCommercial(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Nom scientifique</label>
          <input
            type="text"
            value={nomScientifique}
            onChange={(e) => setNomScientifique(e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label>Dosage *</label>
          <input
            type="text"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Forme pharmaceutique *</label>
          <select
            value={forme}
            onChange={(e) => setForme(e.target.value)}
            required
          >
            <option value="">Sélectionner une forme</option>
            <option value="Comprimé">Comprimé</option>
            <option value="Gélule">Gélule</option>
            <option value="Sachet">Sachet</option>
            <option value="Sirop">Sirop</option>
            <option value="Ampoule">Ampoule</option>
            <option value="Pommade">Pommade</option>
            <option value="Crème">Crème</option>
            <option value="Spray">Spray</option>
            <option value="Suppositoire">Suppositoire</option>
            <option value="Solution injectable">Solution injectable</option>
            <option value="Autre">Autre</option>
          </select>
        </div>
        
        {forme === "Autre" && (
          <div className="form-group">
            <label>Spécifier la forme *</label>
            <input
              type="text"
              value={formeAutre}
              onChange={(e) => setFormeAutre(e.target.value)}
              required
            />
          </div>
        )}
        
        <div className="form-group">
          <label>Voie d'administration *</label>
          <select
            value={voie}
            onChange={(e) => setVoie(e.target.value)}
            required
          >
            <option value="">Sélectionner une voie</option>
            <option value="Orale">Orale</option>
            <option value="Intraveineuse">Intraveineuse</option>
            <option value="Intramusculaire">Intramusculaire</option>
            <option value="Sous-cutanée">Sous-cutanée</option>
            <option value="Rectale">Rectale</option>
            <option value="Cutanée">Cutanée</option>
            <option value="Nasale">Nasale</option>
            <option value="Oculaire">Oculaire</option>
            <option value="Autre">Autre</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Classe thérapeutique *</label>
          <input
            type="text"
            value={classeTherapeutique}
            onChange={(e) => setClasseTherapeutique(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Description (optionnel)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        
        <button type="submit" disabled={isLoading} className="submit-button">
          {isLoading ? "En cours..." : "Ajouter"}
        </button>
      </form>
    </div>
  );
};

export default AddMedicament;