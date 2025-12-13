import React, { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    setIsLoading(true);
    
    try {
      await axios.put(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/user/reset-password/${token}`,
        { password }
      );
      
      toast.success("Mot de passe réinitialisé avec succès !");
      // Redirection vers login
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-content">
        <div className="reset-password-image">
          {/* Chemin direct vers l'image dans le dossier public */}
          <img 
            src="/password-reset-image.png" 
            alt="Réinitialisation de mot de passe" 
          />
        </div>
        
        <form onSubmit={handleSubmit} className="reset-password-form">
          <h2>Réinitialisation du mot de passe</h2>
          
          <div className="input-group">
            <label htmlFor="password">Nouveau mot de passe</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" disabled={isLoading} className="submit-btn">
            {isLoading ? "Traitement..." : "Réinitialiser"}
          </button>
          
          <div className="password-requirements">
            <p>Le mot de passe doit contenir au moins :</p>
            <ul>
              <li>8 caractères minimum</li>
              <li>1 lettre majuscule</li>
              <li>1 chiffre</li>
              <li>1 caractère spécial</li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;