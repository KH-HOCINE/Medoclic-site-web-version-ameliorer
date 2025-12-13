import React, { useState, useContext, useEffect } from "react";
import { Context } from "../main";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { admin, setAdmin } = useContext(Context);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: "",
    cabinetAddress: "",
    cabinetPhone: ""
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);

  // Initialiser les données du formulaire avec les informations de l'admin
  useEffect(() => {
    if (admin) {
      setFormData({
        email: admin.email || "",
        cabinetAddress: admin.cabinetAddress || "",
        cabinetPhone: admin.cabinetPhone || ""
      });
      setProfilePhoto(admin.profilePhoto || null);
    }
  }, [admin]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("La photo ne doit pas dépasser 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setProfilePhoto(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = async () => {
    try {
      setIsLoading(true);
      await axios.put(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/user/profile-photo`,
        { profilePhoto: null },
        { withCredentials: true }
      );
      setProfilePhoto(null);
      setAdmin(prev => ({ ...prev, profilePhoto: null }));
      toast.success("Photo de profil supprimée avec succès");
    } catch {
      toast.error("Erreur lors de la suppression de la photo");
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfilePhoto = async () => {
    if (!profilePhoto) return;
    try {
      setIsLoading(true);
      await axios.put(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/user/profile-photo`,
        { profilePhoto },
        { withCredentials: true }
      );
      setAdmin(prev => ({ ...prev, profilePhoto }));
      toast.success("Photo de profil mise à jour avec succès");
    } catch {
      toast.error("Erreur lors de la mise à jour de la photo");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.put(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/user/profile`,
        formData,
        { withCredentials: true }
      );
      toast.success("Profil mis à jour avec succès !");
      setAdmin(prev => ({ ...prev, ...formData }));
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la mise à jour du profil");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      email: admin.email || "",
      cabinetAddress: admin.cabinetAddress || "",
      cabinetPhone: admin.cabinetPhone || ""
    });
    setProfilePhoto(admin.profilePhoto || null);
    setIsEditing(false);
  };

  const handleChangePassword = () => navigate("/change-password");

  if (!admin) return <div className="loading">Chargement du profil...</div>;

  return (
    <section className="profile page">
      <div className="profile-header">
        <h2>Mon Profil</h2>
      
      </div>

      <div className="profile-card">
        {/* Photo de profil et Statut */}
        <div className="profile-photo-section">    
          <h4>Photo de profil</h4>
          <div className="photo-and-status-container">
            <div className="photo-management">
              <div className="photo-preview">
                {profilePhoto ? (
                  <div className="photo-with-actions">
                    <img src={profilePhoto} alt="Profil" className="profile-photo-img" />
                    <div className="photo-actions">
                      <button onClick={removePhoto} className="remove-photo-btn" disabled={isLoading}>       
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="photo-placeholder"><span>👨‍⚕️</span></div>
                )}
              </div>
              <div className="photo-upload-controls">
                <input
                  type="file"
                  id="profilePhotoInput"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="photo-input"
                />
                <label htmlFor="profilePhotoInput" className="photo-upload-label">
                  📷 {profilePhoto ? "Changer la photo" : "Ajouter une photo"}
                </label>
                {profilePhoto && admin.profilePhoto !== profilePhoto && (
                  <button onClick={updateProfilePhoto} className="save-photo-btn" disabled={isLoading}>
                    💾 Enregistrer la photo
                  </button>
                )}
                <p className="photo-help-text">Max 2MB - Format recommandé: carré</p>
              </div>
            </div>

            {/* Statut du compte */}
            <div className="status-section-inline">
              <h4>Statut du compte</h4>
              <p><strong>Rôle:</strong> {admin.role}</p>
              <p>
                <strong>Vérification:</strong>{" "}
                <span className={admin.isVerified ? "status-verified" : "status-pending"}>
                  {admin.isVerified ? "✅ Compte vérifié" : "⏳ En attente de vérification"}
                </span>
              </p>
              <p><strong>Membre depuis:</strong> {new Date(admin.createdAt).toLocaleDateString("fr-FR")}</p>
            </div>
          </div>
        </div>

        {/* Infos non modifiables */}
        <div className="info-section">
          <h4>Informations fixes non modifiables</h4>
          <div className="form-row">
            <div className="form-group disabled">
              <label>Prénom</label>
              <input type="text" value={admin.firstName || ""} disabled />
            </div>
            <div className="form-group disabled">
              <label>Nom</label>
              <input type="text" value={admin.lastName || ""} disabled />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group disabled">
              <label>Spécialité</label>
              <input type="text" value={admin.specialite || ""} disabled />
            </div>
            <div className="form-group disabled">
              <label>Numéro d'ordre</label>
              <input type="text" value={admin.ordreNumber || ""} disabled />
            </div>
          </div>
        </div>

        {/* Infos modifiables */}
        <form onSubmit={handleSubmit}>
          <div className="info-section">
            <div className="section-header-with-button">
              <h4>Informations modifiables</h4>
              {!isEditing && (
                <button type="button" className="edit-btn" onClick={() => setIsEditing(true)}>
                  ✏️ Modifier
                </button>
              )}
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} disabled={!isEditing} required />
            </div>
            <div className="form-group">
              <label>Adresse du cabinet</label>
              <textarea name="cabinetAddress" value={formData.cabinetAddress} onChange={handleInputChange} disabled={!isEditing} rows="3" required />
            </div>
            <div className="form-group">
              <label>Téléphone du cabinet</label>
              <input type="text" name="cabinetPhone" value={formData.cabinetPhone} onChange={handleInputChange} disabled={!isEditing} required maxLength="10" minLength="10" />
            </div>
          </div>

          {isEditing && (
            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={handleCancel} disabled={isLoading}>
                Annuler
              </button>
              <button type="submit" className="save-btn" disabled={isLoading}>
                {isLoading ? "Enregistrement..." : "Enregistrer les modifications"}
              </button>
            </div>
          )}
        </form>

        {/* Sécurité */}
        <div className="password-section">
          <h4>Sécurité du compte</h4>
          <button className="change-password-btn" onClick={handleChangePassword}>
            🔒 Modifier votre mot de passe
          </button>
        </div>
      </div>
    </section>
  );
};

export default Profile;