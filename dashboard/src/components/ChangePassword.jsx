// Dans components/ChangePassword.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error("Les nouveaux mots de passe ne correspondent pas");
      return;
    }

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/user/change-password`,
        { oldPassword, newPassword },
      );
      
      toast.success(res.data.message);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors du changement de mot de passe");
    }
  };

  return (
    <div className="change-password-container">
      <div className="change-password-content">
        <div className="change-password-image">
          <img 
            src="/ForgotPassword.png" 
            alt="Réinitialisation du mot de passe" 
          />
        </div>
        
        <form onSubmit={handleSubmit} className="change-password-form">
          <h2>Réinitialisation du mot de passe</h2>
          <p className="form-description">
            Modifiez votre mot de passe en renseignant votre ancien mot de passe et en créant un nouveau.
          </p>
          
          <div className="input-group">
            <label htmlFor="oldPassword">Ancien mot de passe</label>
            <input
              id="oldPassword"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="newPassword">Nouveau mot de passe</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="submit-btn">
            Mettre à jour
          </button>
          
          <div className="additional-info">
            <p>
              <strong>Important :</strong> Choisissez un mot de passe sécurisé avec au moins 8 caractères.
            </p>
            <p>
              Votre mot de passe doit contenir des lettres, des chiffres et des caractères spéciaux.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;