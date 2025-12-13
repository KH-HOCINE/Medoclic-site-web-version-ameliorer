import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const Signup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [cabinetAddress, setCabinetAddress] = useState("");
  const [cabinetPhone, setCabinetPhone] = useState("");
  const [ordreNumber, setOrdreNumber] = useState("");
  const [specialite, setSpecialite] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier la taille du fichier (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("La photo ne doit pas dépasser 2MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setProfilePhoto(null);
    // Réinitialiser l'input file
    const fileInput = document.getElementById('profilePhoto');
    if (fileInput) fileInput.value = '';
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/user/admin/addnew`,
        {
          firstName,
          lastName,
          email,
          cabinetAddress,
          cabinetPhone,
          ordreNumber,
          specialite,
          password,
          profilePhoto, // AJOUT
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      toast.success(response.data.message);
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-content">
        {/* Colonne gauche - Image */}
        <div className="signup-image">
          <img 
            src="/abc.png" 
            alt="Illustration médicale" 
            className="signup-img"
          />
        </div>
        
        {/* Colonne droite - Formulaire compact */}
        <div className="signup-form">
          <h2>Créer un compte médecin</h2>
          
          {/* Photo de profil */}
          <div className="photo-upload-section">
            <div className="photo-preview">
              {profilePhoto ? (
                <div className="photo-with-remove">
                  <img src={profilePhoto} alt="Aperçu photo profil" className="profile-preview-img" />
                  <button type="button" onClick={removePhoto} className="remove-photo-btn">
                    ✕
                  </button>
                </div>
              ) : (
                <div className="photo-placeholder">
                  <span>👨‍⚕️</span>
                </div>
              )}
            </div>
            <div className="photo-upload-controls">
              <input
                type="file"
                id="profilePhoto"
                accept="image/*"
                onChange={handlePhotoChange}
                className="photo-input"
              />
              <label htmlFor="profilePhoto" className="photo-upload-label">
                📷 Choisir une photo
              </label>
              <p className="photo-help-text">Optionnel - Max 2MB</p>
            </div>
          </div>

          <form onSubmit={handleSignup}>
            {/* Ligne 1: Prénom et Nom */}
            <div className="form-row">
              <div className="form-group">
                <label>Prénom</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Nom</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Le reste du formulaire reste inchangé */}
            {/* Ligne 2: Email et Spécialité */}
            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Spécialité</label>
                <input
                  type="text"
                  value={specialite}
                  onChange={(e) => setSpecialite(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Ligne 3: Adresse du cabinet */}
            <div className="form-group">
              <label>Adresse du cabinet</label>
              <input
                type="text"
                value={cabinetAddress}
                onChange={(e) => setCabinetAddress(e.target.value)}
                required
              />
            </div>

            {/* Ligne 4: Téléphone et Numéro d'ordre */}
            <div className="form-row">
              <div className="form-group">
                <label>Téléphone du cabinet</label>
                <input
                  type="text"
                  value={cabinetPhone}
                  onChange={(e) => setCabinetPhone(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Numéro d'ordre</label>
                <input
                  type="text"
                  value={ordreNumber}
                  onChange={(e) => setOrdreNumber(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Ligne 5: Mot de passe et Confirmation */}
            <div className="form-row">
              <div className="form-group">
                <label>Mot de passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirmer le mot de passe</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="signup-button">
              {isLoading ? "Création en cours..." : "S'inscrire"}
            </button>
          </form>

          <div className="login-link">
            <p>Déjà inscrit? <Link to="/login">Connectez-vous</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;