import React from 'react';
import { useNavigate } from 'react-router-dom';

const PrescriptionOptions = () => {
  const navigate = useNavigate();

  const options = [
    { 
      label: "Ordonnance", 
      action: () => navigate("/prescription") 
    },
    { 
      label: "Bilan", 
      action: () => navigate("/bilan") 
    },
    { 
      label: "Certificat d'arrêt", 
      action: () => navigate("/certificat-arret") 
    },
    { 
      label: "Justification", 
      action: () => navigate("/justification") 
    },

     { 
      label: "Lettres", 
      action: () => navigate("/lettre") 
    },

     { 
      label: "Fiche de suivi ", 
      action: () => navigate("/blocnote") 
    }

     

  ];

  return (
    <div className="form-component">
      <h2 className="form-title">Types de prescriptions</h2>
      <div className="prescription-options">
        {options.map((option, index) => (
          <button 
            key={index}
            onClick={option.action}
            className="prescription-option-btn"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PrescriptionOptions;