import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Context } from "../main";
import "../App.css";

const AddNewPatient = () => {
  const { id } = useParams(); // Pour savoir si on est en mode modification
  const navigate = useNavigate();
  const { setShouldRefreshDashboard } = useContext(Context);
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    patientNumber: "",
    firstName: "",
    lastName: "",
    address: "",
    dob: "",
    weight: "",
    height: "",
    gender: "",
    bloodGroup: "",
    chronicDiseases: "",
    pastSurgeries: "",
    medicalFiles: [],
    phoneNumber: "",
    email: "",
    nextAppointment: "",
    profileImage: null,
  });

  // Charger les données du patient si on est en mode modification
  useEffect(() => {
    if (isEditing) {
      const fetchPatientData = async () => {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/patient/${id}`,
            { withCredentials: true }
          );
          const patient = response.data;
          
          setFormData({
            patientNumber: patient.patientNumber || "",
            firstName: patient.firstName || "",
            lastName: patient.lastName || "",
            address: patient.address || "",
            dob: patient.dob ? new Date(patient.dob).toISOString().split('T')[0] : "",
            weight: patient.weight || "",
            height: patient.height || "",
            gender: patient.gender || "",
            bloodGroup: patient.bloodGroup || "",
            chronicDiseases: patient.chronicDiseases || "",
            pastSurgeries: patient.pastSurgeries || "",
            medicalFiles: [],
            phoneNumber: patient.phoneNumber || "",
            email: patient.email || "",
            nextAppointment: "",
            profileImage: null,
          });
        } catch (error) {
          toast.error("Erreur lors du chargement des données du patient");
          console.error(error);
        }
      };
      fetchPatientData();
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, medicalFiles: [...e.target.files] });
  };

  const handleProfileImageChange = (e) => {
    setFormData({ ...formData, profileImage: e.target.files[0] });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation du numéro de téléphone
    const phoneNumber = formData.phoneNumber;
    const phoneRegex = /^(05|06|07)\d{8}$/;
    if (!phoneRegex.test(phoneNumber)) {
      toast.error("Le numéro de téléphone doit commencer par 05, 06 ou 07 et contenir 10 chiffres.");
      return;
    }

    // Validation de l'email seulement s'il est fourni
    if (formData.email) {
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error("Veuillez entrer une adresse email valide.");
        return;
      }
    }

    const data = new FormData();
    for (const key in formData) {
      if (key === "medicalFiles") {
        for (const file of formData[key]) {
          data.append("medicalFiles", file);
        }
      } else if (formData[key] !== "") { // N'envoyer que les champs non vides
        data.append(key, formData[key]);
      }
    }

    try {
      let response;
      if (isEditing) {
        // Mode modification
       response = await axios.put(
  `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/patient/${id}/update-info`, 
  data, 
  {
    headers: { "Content-Type": "multipart/form-data" },
    withCredentials: true,
  }
);
        toast.success("Informations du patient mises à jour avec succès");
        setShouldRefreshDashboard(true);
        navigate(`/dossier-patient/${id}`); // Retourner au dossier du patient
      } else {
        // Mode création
        response = await axios.post(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/patient/addnew`, 
          data, 
          {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          }
        );
        toast.success("Patient ajouté avec succès");
        setShouldRefreshDashboard(true);
         navigate('/patients'); 
        // Réinitialiser le formulaire
        setFormData({
          patientNumber: "",
          firstName: "",
          lastName: "",
          address: "",
          dob: "",
          weight: "",
          height: "",
          gender: "",
          bloodGroup: "",
          chronicDiseases: "",
          pastSurgeries: "",
          medicalFiles: [],
          phoneNumber: "",
          email: "",
          nextAppointment: "",
          profileImage: null,
        });
      }
      console.log(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Une erreur s'est produite");
      console.error(error);
    }
  };

  return (
    <div className="form-component">
    <h2 className="form-title">
  {isEditing ? "Modifier le patient" : "Ajouter un nouveau patient"}
</h2>
      <form onSubmit={handleSubmit} className="add-patient-form">
        
        {/* Champs obligatoires */}
        <div className="required-fields">
          <h3>Informations obligatoires</h3>
          
          {/* Champ numéro du patient - toujours visible */}
          <div className="form-group">
            <label htmlFor="patientNumber">Numéro du patient:</label>
            <input 
              type="text" 
              name="patientNumber" 
              placeholder={isEditing ? "Numéro du patient" : "Numéro du patient (généré automatiquement si vide)"} 
              value={formData.patientNumber}
              onChange={handleChange} 
            />
          </div>
          
          <div className="form-group">
          <label htmlFor="firstName">Prénom:</label>
          <input 
            type="text" 
            name="firstName" 
            placeholder="Prénom *" 
            value={formData.firstName}
            onChange={handleChange} 
            required 
          />
          </div>

          <div className="form-group">
          <label htmlFor="lastName">Nom:</label>
          <input 
            type="text" 
            name="lastName" 
            placeholder="Nom *" 
            value={formData.lastName}
            onChange={handleChange} 
            required 
          />
          </div>

          <div className="form-group">
          <label htmlFor="phoneNumber">Téléphone:</label>
          <input
            type="text"
            name="phoneNumber"
            placeholder="Numéro de téléphone *"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
          />
          </div>
          
          <button type="submit" className="submit-button-inline">
            {isEditing ? "Mettre à jour les informations" : "Ajouter le patient"}
          </button>
        </div>

        {/* Champs optionnels */}
        <div className="optional-fields">
          <h3>Informations optionnelles</h3>
          
          <div className="form-group">
          <label htmlFor="address">Adresse :</label>
          <input 
            type="text" 
            name="address" 
            placeholder="Adresse" 
            value={formData.address}
            onChange={handleChange} 
          />
          </div>
          
          <div className="form-group">
            <label htmlFor="dob">Date de naissance :</label>
            <input
              type="date"
              id="dob"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
          <label htmlFor="weight">Poids:</label>
          <input 
            type="number" 
            name="weight" 
            placeholder="Poids (kg)" 
            value={formData.weight}
            onChange={handleChange} 
          />
          </div>
          
          <div className="form-group">
          <label htmlFor="height">Taille:</label>
          <input 
            type="number" 
            name="height" 
            placeholder="Taille (cm)" 
            value={formData.height}
            onChange={handleChange} 
          />
          </div>
          
          <div className="form-group">
          <label htmlFor="bloodGroup">Groupe sanguin:</label>
          <select 
            name="bloodGroup" 
            value={formData.bloodGroup}
            onChange={handleChange}
          >
            <option value="">Sélectionner le groupe sanguin</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
          </div>
          
          <div className="form-group">
          <label htmlFor="gender">Sexe:</label>
            <select 
              name="gender" 
              value={formData.gender}
              onChange={handleChange} 
              className="gender-select"
            >
              <option value="">Sélectionner le sexe</option>
              <option value="Male">Masculin</option>
              <option value="Female">Féminin</option>
              <option value="Other">/</option>
            </select>
          </div>
          
          <div className="form-group">
          <label htmlFor="chronicDiseases">Antécédents médicaux:</label>
          <textarea 
            name="chronicDiseases" 
            placeholder="Antécédents médicaux" 
            value={formData.chronicDiseases}
            onChange={handleChange} 
          />
          </div>
          
          <div className="form-group">
          <label htmlFor="pastSurgeries">Antécédents chirurgicaux:</label>
          <textarea 
            name="pastSurgeries" 
            placeholder="Antécédents chirurgicaux" 
            value={formData.pastSurgeries}
            onChange={handleChange} 
          />
          </div>
          
          <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />
          </div>
          
          {!isEditing && (
            <div className="form-group">
              <label htmlFor="nextAppointment">Premier rendez-vous :</label>
              <input
                type="datetime-local"
                id="nextAppointment"
                name="nextAppointment"
                value={formData.nextAppointment}
                onChange={handleChange}
              />
            </div>
          )}
          
          <div className="form-group">
            <label>Ajouter des fichiers médicaux :</label>
            <input type="file" name="medicalFiles" multiple onChange={handleFileChange} />
          </div>
          
          <div className="form-group">
            <label>Photo d'identité :</label>
            <input
              type="file"
              name="profileImage"
              accept="image/*"
              onChange={handleProfileImageChange}
            />
          </div>
        </div>

        <button type="submit">
          {isEditing ? "Mettre à jour" : "Ajouter le patient"}
        </button>
        
        {isEditing && (
          <button 
            type="button" 
            onClick={() => navigate(`/dossier-patient/${id}`)}
            className="cancel-button"
          >
            Annuler
          </button>
        )}
      </form>
    </div>
  );
};

export default AddNewPatient;
