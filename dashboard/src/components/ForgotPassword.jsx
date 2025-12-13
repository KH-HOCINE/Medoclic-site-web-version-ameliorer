import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/user/forgot-password`,
        { email }
      );
      
      toast.success("Email de réinitialisation envoyé !");
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-content">
        <div className="forgot-password-image">
          <img 
            src="/ForgotPassword.png" 
            alt="Récupération de compte" 
          />
        </div>
        
        <form onSubmit={handleSubmit} className="forgot-password-form">
          <h2>Récupération de compte</h2>
          <p className="form-description">
            Entrez votre adresse email professionnelle pour recevoir un lien de réinitialisation de votre mot de passe.
          </p>
          
          <div className="input-group">
            <label htmlFor="email">Email professionnel</label>
            <input
              id="email"
              type="email"
              placeholder="exemple@cabinet-medical.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" disabled={isLoading} className="submit-btn">
            {isLoading ? "Envoi en cours..." : "Envoyer le code"}
          </button>
          
          <div className="additional-info">
            <p>
              <strong>Important :</strong> Utilisez l'adresse email associée à votre compte professionnel.
            </p>
            <p>
              Si vous ne recevez pas l'email, vérifiez votre dossier spam ou contactez notre support.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;