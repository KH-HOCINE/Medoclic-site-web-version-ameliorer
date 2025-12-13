import React, { useState, useEffect, useRef } from "react";
import { DayPicker } from "react-day-picker";
import 'react-day-picker/dist/style.css';
import { format } from "date-fns";
import { fr } from 'date-fns/locale';
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AppointmentCalendar = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState("09:00");
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [appointmentTimes, setAppointmentTimes] = useState({});
  const appointmentsRef = useRef(null);
  const [newPatientFirstName, setNewPatientFirstName] = useState("");
  const [newPatientLastName, setNewPatientLastName] = useState("");
  const [newPatientPhoneNumber, setNewPatientPhoneNumber] = useState("");
  const [showNewPatientFields, setShowNewPatientFields] = useState(false);
  const [emailReminderActive, setEmailReminderActive] = useState(false);
  const [emailReminderTimeOption, setEmailReminderTimeOption] = useState('24h-before');
  const [customReminderDateTime, setCustomReminderDateTime] = useState('');

  // Effet pour charger les rendez-vous et les patients au montage du composant
  useEffect(() => {
    if (date) {
      fetchAppointments(date);
    }
    fetchAllPatients();
  }, [date]);

  // Effet pour initialiser les heures des rendez-vous
  useEffect(() => {
    if (appointments.length > 0) {
      const times = {};
      appointments.forEach((patient) => {
        patient.appointments.forEach((appt) => {
          times[appt._id] = format(new Date(appt.date), "HH:mm");
        });
      });
      setAppointmentTimes(times);
    }
  }, [appointments]);

  // Fonction pour récupérer les rendez-vous d'une date spécifique
  const fetchAppointments = async (selectedDate) => {
    console.log("CALENDAR: Requête RDV pour date:", selectedDate.toISOString());
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/patient/by-date?date=${format(selectedDate, "yyyy-MM-dd")}`,
        { withCredentials: true }
      );
      setAppointments(response.data.patients || []);
    } catch (error) {
      console.error("CALENDAR ERREUR fetchAppointments:", error.response?.data?.message || error.message);
      toast.error("Erreur lors du chargement des rendez-vous");
    }
  };

  // Fonction pour récupérer tous les patients
  const fetchAllPatients = async () => {
    console.log("CALENDAR: Requête tous les patients.");
    try {
      const response = await axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/patient/patients`,
        { withCredentials: true }
      );
      setPatients(response.data.patients);
    } catch (error) {
      console.error("CALENDAR ERREUR fetchAllPatients:", error.response?.data?.message || error.message);
      toast.error("Erreur lors du chargement des patients");
    }
  };
  
  // Fonction pour gérer la sélection de la date et le défilement
  const handleDateSelect = (newDate) => {
    if (newDate) {
      setDate(newDate);
      setTimeout(() => {
        if (appointmentsRef.current) {
          appointmentsRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    }
  };

  // Fonction pour programmer un nouveau rendez-vous
  // Fonction pour programmer un nouveau rendez-vous
const scheduleAppointment = async () => {
  let patientIdToSchedule = selectedPatient;

  if (selectedPatient === "new") {
    if (!newPatientFirstName.trim() || !newPatientLastName.trim() || !newPatientPhoneNumber.trim()) {
      toast.error("Veuillez remplir tous les champs obligatoires pour le nouveau patient.");
      return;
    }
    try {
      const newPatientData = new FormData();
      newPatientData.append("firstName", newPatientFirstName);
      newPatientData.append("lastName", newPatientLastName);
      newPatientData.append("phoneNumber", newPatientPhoneNumber);
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/patient/addnew`,
        newPatientData,
        { headers: { "Content-Type": "multipart/form-data" }, withCredentials: true }
      );
      patientIdToSchedule = response.data.patient._id;
      toast.success("Nouveau patient ajouté avec succès !");
      setNewPatientFirstName("");
      setNewPatientLastName("");
      setNewPatientPhoneNumber("");
      setShowNewPatientFields(false);
      setSelectedPatient("");
      fetchAllPatients();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de l'ajout du nouveau patient.");
      return;
    }
  }

  if (!patientIdToSchedule || patientIdToSchedule === "new") {
    toast.error("Veuillez sélectionner un patient.");
    return;
  }

  // CONDITION 1: Vérifier que la date n'est pas dans le passé
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  if (selectedDate < today) {
    toast.error("Impossible de programmer un rendez-vous dans le passé. Veuillez sélectionner une date future.");
    return;
  }

  // CONDITION 2: Si c'est aujourd'hui, vérifier que l'heure n'est pas dans le passé
  if (selectedDate.getTime() === today.getTime()) {
    const [hours, minutes] = time.split(":");
    const appointmentTime = new Date();
    appointmentTime.setHours(hours, minutes, 0, 0);
    
    if (appointmentTime <= now) {
      toast.error("Impossible de programmer un rendez-vous dans le passé. Veuillez sélectionner une heure future.");
      return;
    }
  }

  // CONDITION 3: Vérifier qu'un patient n'a pas déjà un RDV le même jour
  const patientAlreadyHasAppointment = appointments.some(patient => {
    if (patient._id === patientIdToSchedule) {
      return patient.appointments.some(appt => {
        const apptDate = new Date(appt.date);
        return apptDate.toDateString() === date.toDateString();
      });
    }
    return false;
  });

  if (patientAlreadyHasAppointment) {
    const patientInfo = patients.find(p => p._id === patientIdToSchedule);
    const patientName = patientInfo ? `${patientInfo.firstName} ${patientInfo.lastName}` : "Ce patient";
    toast.error(`${patientName} a déjà un rendez-vous programmé pour cette date (${format(date, "dd/MM/yyyy")}). Un patient ne peut avoir qu'un seul rendez-vous par jour.`);
    return;
  }

  try {
    const [hours, minutes] = time.split(":");
    const appointmentDate = new Date(date);
    appointmentDate.setHours(hours);
    appointmentDate.setMinutes(minutes);

    const appointmentData = {
      patientId: patientIdToSchedule,
      appointmentDate: appointmentDate.toISOString(),
      emailReminderActive: emailReminderActive,
      emailReminderTime: emailReminderActive && emailReminderTimeOption !== 'manual-now' ? emailReminderTimeOption : null,
      customReminderDate: emailReminderActive && emailReminderTimeOption === 'custom-date' ? customReminderDateTime : null,
    };

    await axios.put(
      `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/patient/schedule-appointment`,
      appointmentData,
      { withCredentials: true }
    );
    toast.success("Rendez-vous programmé avec succès !");
    fetchAppointments(date);
  } catch (error) {
    toast.error(error.response?.data?.message || "Erreur lors de la programmation du rendez-vous.");
  }
};

  // FONCTION MISE À JOUR pour gérer les nouveaux statuts
  const handleUpdateStatus = async (patientId, appointmentId, newStatus) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/patient/appointment/status`,
        { patientId, appointmentId, status: newStatus }, // 'status' au lieu de 'seen'
        { withCredentials: true }
      );
      toast.success("Statut mis à jour !");
      const updatedAppointments = appointments.map(patient => ({
        ...patient,
        appointments: patient.appointments.map(appt =>
          appt._id === appointmentId ? { 
            ...appt, 
            appointmentStatus: newStatus,
            seenStatus: newStatus === "Consulté" // Maintenir la compatibilité
          } : appt
        )
      }));
      setAppointments(updatedAppointments);
    } catch (error) {
      toast.error(error.response?.data?.message || "Échec de la mise à jour du statut");
    }
  };

  // Fonction pour mettre à jour l'heure d'un rendez-vous
  const handleUpdateAppointmentTime = async (patientId, appointmentId, newTime) => {
    try {
      const newAppointmentDate = new Date(newTime);
      await axios.put(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/patient/update-appointment-time`,
        { patientId, appointmentId, newAppointmentDate: newAppointmentDate.toISOString() },
        { withCredentials: true }
      );
      toast.success("Heure du rendez-vous mise à jour");
      fetchAppointments(date);
    } catch (error) {
      toast.error("Échec de la mise à jour de l'heure du rendez-vous");
    }
  };
  
  // Fonction pour supprimer un rendez-vous
  const handleDeleteAppointment = async (patientId, appointmentId, patientName) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le rendez-vous de ${patientName} ?`)) {
      try {
        await axios.delete(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/patient/${patientId}/appointment/${appointmentId}`,
          { withCredentials: true }
        );
        toast.success(`Rendez-vous de ${patientName} supprimé avec succès`);
        fetchAppointments(date);
      } catch (error) {
        toast.error(error.response?.data?.message || "Erreur lors de la suppression");
      }
    }
  };
  
  // Fonction pour rediriger vers le dossier du patient
  const handleViewPatientFile = (patientId) => {
    navigate(`/dossier-patient/${patientId}`);
  };

  // FONCTION HELPER pour obtenir la classe CSS selon le statut
  const getStatusClassName = (status) => {
    switch (status) {
      case 'Consulté':
        return 'status-consulte';
      case 'En attente':
        return 'status-en-attente';
      case 'RDV confirmé':
        return 'status-confirme';
      case 'RDV annulé':
        return 'status-annule';
      case 'Patient absent':
        return 'status-absent';
      default:
        return 'status-en-attente';
    }
  };

  // FONCTION HELPER pour obtenir l'émoji selon le statut
  const getStatusEmoji = (status) => {
    switch (status) {
      case 'Consulté':
        return '✅';
      case 'En attente':
        return '⏳';
      case 'RDV confirmé':
        return '✔️';
      case 'RDV annulé':
        return '❌';
      case 'Patient absent':
        return '🚫';
      default:
        return '⏳';
    }
  };

  return (
    <div className="calendar-container">
      <h2 className="form-title"> Calendrier des Rendez-vous</h2>

      <div className="calendar-form-container">
        {/* FORMULAIRE DE PROGRAMMATION */}
        <div className="appointment-form">
          <h3>Programmer un nouveau rendez-vous</h3>
          
          <div className="form-row-inline">
            <div className="form-group">
              <span className="checkbox-label-text">ACTIVER LE RAPPEL PAR E-MAIL</span>
            </div>
            <div className="form-group">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  className="toggle-switch-checkbox"
                  checked={emailReminderActive}
                  onChange={(e) => setEmailReminderActive(e.target.checked)}
                />
                <span className="toggle-switch-slider round"></span>
              </label>
            </div>
            {emailReminderActive && (
              <div className="form-group inline-select-group">
                <label htmlFor="reminderTimeOption">Envoyer le rappel :</label>
                <select
                  id="reminderTimeOption"
                  value={emailReminderTimeOption}
                  onChange={(e) => {
                    setEmailReminderTimeOption(e.target.value);
                    if (e.target.value !== 'custom-date') {
                      setCustomReminderDateTime('');
                    }
                  }}
                >
                  <option value="24h-before">24 heures avant le RDV</option>
                  <option value="custom-date">À une date/heure spécifique</option>
                </select>
              </div>
            )}
          </div>
          {emailReminderActive && emailReminderTimeOption === 'custom-date' && (
            <div className="form-group">
              <label htmlFor="customReminderDate">Date et heure du rappel :</label>
              <input
                type="datetime-local"
                id="customReminderDate"
                value={customReminderDateTime}
                onChange={(e) => setCustomReminderDateTime(e.target.value)}
              />
            </div>
          )}
          <div className="time-selection">
            <label>Heure : </label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
          </div>
          <select
            onChange={(e) => {
              setSelectedPatient(e.target.value);
              setShowNewPatientFields(false);
            }}
            value={selectedPatient}
          >
            <option value="">Sélectionner un patient</option>
            {patients.map((patient) => (
              <option key={patient._id} value={patient._id}>
                {patient.firstName} {patient.lastName} (N°{patient.patientNumber})
              </option>
            ))}
          </select>
          {!showNewPatientFields && (
            <button
              type="button"
              onClick={() => {
                setShowNewPatientFields(true);
                setSelectedPatient("new");
              }}
              className="add-new-patient-btn"
            >
              + Ajouter un nouveau patient
            </button>
          )}
          {showNewPatientFields && (
            <div className="new-patient-fields-container">
              <h4>Nouveau Patient</h4>
              <input type="text" placeholder="Prénom *" value={newPatientFirstName} onChange={(e) => setNewPatientFirstName(e.target.value)} required />
              <input type="text" placeholder="Nom *" value={newPatientLastName} onChange={(e) => setNewPatientLastName(e.target.value)} required />
              <input type="text" placeholder="Numéro de téléphone *" value={newPatientPhoneNumber} onChange={(e) => setNewPatientPhoneNumber(e.target.value)} required />
              <button type="button" onClick={() => setShowNewPatientFields(false)} className="cancel-add-patient-btn">
                Annuler l'ajout
              </button>
            </div>
          )}
          <button onClick={scheduleAppointment}>Programmer</button>
        </div>

        {/* CALENDRIER REACT-DAY-PICKER */}
        <div className="rdp-container">
          <DayPicker
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            locale={fr}
            showOutsideDays
            fixedWeeks
            footer={<p style={{textAlign: 'center', fontSize: '0.9em', marginTop: '10px'}}>Date sélectionnée : {format(date, 'dd/MM/yyyy')}</p>}
          />
        </div>
      </div>

      {/* LISTE DES RENDEZ-VOUS AVEC NOUVEAUX STATUTS */}
      <div className="appointments-list" ref={appointmentsRef}>
        <h2 className="form-title"> Rendez-vous du {format(date, "dd/MM/yyyy")}</h2>
        {appointments.length === 0 ? (
          <p>Aucun rendez-vous pour cette date</p>
        ) : (
          <table className="appointments-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>N° Patient</th>
                <th>Téléphone</th>
                <th>Heure</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.flatMap((patient) =>
                patient.appointments
                  .filter((appt) => {
                    const apptDate = new Date(appt.date);
                    return apptDate.toDateString() === date.toDateString();
                  })
                  .map((appt) => {
                    // Déterminer le statut actuel - priorité au nouveau champ appointmentStatus
                    const currentStatus = appt.appointmentStatus || (appt.seenStatus ? 'Consulté' : 'En attente');
                    
                    return (
                      <tr key={appt._id} className="appointment-row">
                        <td>{patient.firstName} {patient.lastName}</td>
                        <td>{patient.patientNumber}</td>
                        <td>{patient.phoneNumber}</td>
                        <td>
                          <input
                            type="time"
                            value={appointmentTimes[appt._id] || ""}
                            onChange={(e) => {
                              const newTimeValue = e.target.value;
                              setAppointmentTimes((prev) => ({ ...prev, [appt._id]: newTimeValue }));
                              const newDateForUpdate = new Date(appt.date);
                              const [hours, minutes] = newTimeValue.split(":");
                              newDateForUpdate.setHours(hours);
                              newDateForUpdate.setMinutes(minutes);
                              handleUpdateAppointmentTime(patient._id, appt._id, newDateForUpdate);
                            }}
                          />
                        </td>
                        <td>
                          <select
                            className={getStatusClassName(currentStatus)}
                            value={currentStatus}
                            onChange={(e) => handleUpdateStatus(patient._id, appt._id, e.target.value)}
                          >
                            <option value="En attente" className="status-en-attente">
                              En attente {getStatusEmoji('En attente')}
                            </option>
                            <option value="RDV confirmé" className="status-confirme">
                              RDV confirmé {getStatusEmoji('RDV confirmé')}
                            </option>
                            <option value="Consulté" className="status-consulte">
                              Consulté {getStatusEmoji('Consulté')}
                            </option>
                            <option value="Patient absent" className="status-absent">
                              Patient absent {getStatusEmoji('Patient absent')}
                            </option>
                            <option value="RDV annulé" className="status-annule">
                              RDV annulé {getStatusEmoji('RDV annulé')}
                            </option>
                          </select>
                        </td>
                        <td className="actions-column">
                          <div className="actions-buttons">
                            <button className="btn-view-file" onClick={() => handleViewPatientFile(patient._id)}>
                              📋 Voir dossier
                            </button>
                            <button 
                              className="btn-delete-appointment" 
                              onClick={() => handleDeleteAppointment(patient._id, appt._id, `${patient.firstName} ${patient.lastName}`)}
                            >
                              🗑️ Supprimer RDV
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AppointmentCalendar;