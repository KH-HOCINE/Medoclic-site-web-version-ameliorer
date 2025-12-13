import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "../App.css"; // Votre fichier CSS

const ListeMedicaments = () => {
  const [medicaments, setMedicaments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingMedicament, setEditingMedicament] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  // États pour le formulaire de modification
  const [nomCommercial, setNomCommercial] = useState("");
  const [nomScientifique, setNomScientifique] = useState("");
  const [dosage, setDosage] = useState("");
  const [forme, setForme] = useState("");
  const [formeAutre, setFormeAutre] = useState("");
  const [voie, setVoie] = useState("");
  const [classeTherapeutique, setClasseTherapeutique] = useState("");
  const [description, setDescription] = useState("");

  // Charger tous les médicaments
  const fetchMedicaments = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/medicament/all`,
        { withCredentials: true }
      );
      setMedicaments(response.data.medicaments);
    } catch (error) {
      toast.error("Erreur lors du chargement des médicaments");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicaments();
  }, []);

  // Filtrer les médicaments par nom commercial
  const filteredMedicaments = medicaments.filter(med =>
    med.nomCommercial.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Ouvrir le formulaire de modification
  const handleEdit = (medicament) => {
    setEditingMedicament(medicament);
    setNomCommercial(medicament.nomCommercial);
    setNomScientifique(medicament.nomScientifique || "");
    setDosage(medicament.dosage);
    setForme(medicament.forme);
    setFormeAutre(medicament.formeAutre || "");
    setVoie(medicament.voie);
    setClasseTherapeutique(medicament.classeTherapeutique);
    setDescription(medicament.description || "");
    setShowModal(true);
  };

  // Sauvegarder les modifications
  const handleSave = async () => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/medicament/${editingMedicament._id}`,
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
      handleCloseModal();
      fetchMedicaments(); // Recharger la liste
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la modification");
    }
  };

  // Fermer la modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMedicament(null);
    // Réinitialiser les champs
    setNomCommercial("");
    setNomScientifique("");
    setDosage("");
    setForme("");
    setFormeAutre("");
    setVoie("");
    setClasseTherapeutique("");
    setDescription("");
  };

  // Supprimer un médicament
  const handleDelete = async (id, nomCommercial) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le médicament "${nomCommercial}" ?`)) {
      try {
        const response = await axios.delete(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/medicament/${id}`,
          { withCredentials: true }
        );
        
        toast.success(response.data.message);
        fetchMedicaments(); // Recharger la liste
      } catch (error) {
        toast.error(error.response?.data?.message || "Erreur lors de la suppression");
      }
    }
  };

  // Gérer les clics sur l'overlay de la modal
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  if (isLoading) {
    return <div className="loading">Chargement des médicaments...</div>;
  }

  return (
    <div className="form-component">
      {/* En-tête avec bouton aligné à droite */}
      <div className="form-header">
        <h2>Liste des médicaments</h2>
        <div className="button-group">
          <button 
            onClick={() => navigate("/add-medicament")}
            className="add-button"
          >
            ✚ Ajouter un médicament
          </button>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Rechercher par nom commercial..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tableau des médicaments */}
      <div className="medicaments-list">
        {filteredMedicaments.length === 0 ? (
          <div className="no-medicaments">
            <p>Aucun médicament trouvé.</p>
          </div>
        ) : (
          <table className="medicaments-table">
            <thead>
              <tr>
                <th>Médicament</th>
                <th>Dosage</th>
                <th>Forme</th>
                <th>Voie</th>
                <th>Classe thérapeutique</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMedicaments.map((medicament) => (
                <tr key={medicament._id}>
                  <td data-label="Médicament">
                    <div className="medicament-name">{medicament.nomCommercial}</div>
                    {medicament.nomScientifique && (
                      <div className="medicament-scientific">({medicament.nomScientifique})</div>
                    )}
                  </td>
                  <td data-label="Dosage">{medicament.dosage}</td>
                  <td data-label="Forme">
                    <span className="badge badge-forme">
                      {medicament.forme === "Autre" ? medicament.formeAutre : medicament.forme}
                    </span>
                  </td>
                  <td data-label="Voie">
                    <span className="badge badge-voie">{medicament.voie}</span>
                  </td>
                  <td data-label="Classe thérapeutique">
                    <span className="badge badge-classe">{medicament.classeTherapeutique}</span>
                  </td>
                  <td data-label="Actions">
                    <div className="actions-cell">
                      <button 
                        onClick={() => handleEdit(medicament)}
                        className="edit-button"
                        title="Modifier"
                      >
                        ✏️ Modifier
                      </button>
                      <button 
                        onClick={() => handleDelete(medicament._id, medicament.nomCommercial)}
                        className="delete-button"
                        title="Supprimer"
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de modification */}
      {showModal && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>Modifier le médicament</h3>
              <button 
                onClick={handleCloseModal}
                className="close-button"
                title="Fermer"
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-row">
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
                
                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="3"
                    placeholder="Description optionnelle du médicament..."
                  />
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                onClick={handleCloseModal}
                className="cancel-button"
              >
                Annuler
              </button>
              <button 
                onClick={handleSave}
                className="submit-button"
              >
                💾 Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListeMedicaments;