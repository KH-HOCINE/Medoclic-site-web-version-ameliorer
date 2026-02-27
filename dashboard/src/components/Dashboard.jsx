import React, { useContext, useEffect, useState } from "react";
import { Context } from "../main";
import { Navigate, useNavigate } from "react-router-dom";

import { FaUsers, FaCalendarAlt, FaUserClock, FaTrashAlt, FaFolder, FaClock, FaPhone, FaCheckCircle, FaCog, FaUser } from "react-icons/fa";

import axios from "axios";
import { toast } from "react-toastify";
import { format } from "date-fns";

const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [patientsToday, setPatientsToday] = useState(0);
  const [unconsultedPatientsToday, setUnconsultedPatientsToday] = useState(0);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const navigate = useNavigate();

  const { isAuthenticated, admin, shouldRefreshDashboard, setShouldRefreshDashboard } = useContext(Context);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fonction pour trier les rendez-vous par heure d'arrivée
  const sortAppointmentsByArrival = (appointments) => {
    return appointments.sort((a, b) => {
      if (a.arrivalTime && b.arrivalTime) {
        return new Date(a.arrivalTime) - new Date(b.arrivalTime);
      }
      if (a.arrivalTime && !b.arrivalTime) {
        return -1;
      }
      if (!a.arrivalTime && b.arrivalTime) {
        return 1;
      }
      return new Date(a.date) - new Date(b.date);
    });
  };

  // Fonction helper : décrémente uniquement pour "Consulté" ou "RDV annulé"
  const isUnconsulted = (status) => {
    return status !== 'Consulté' && status !== 'RDV annulé';
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const patientsResponse = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/patient/patients`,
          { withCredentials: true }
        );
        setTotalPatients(patientsResponse.data.patients.length);

        const today = new Date();
        const formattedDateForBackend = format(today, "yyyy-MM-dd");

        const appointmentsResponse = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/patient/by-date?date=${formattedDateForBackend}`,
          { withCredentials: true }
        );

        const patientsWithAppointmentsToday = appointmentsResponse.data.patients || [];

        const startOfCurrentDayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0));
        const endOfCurrentDayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() + 1, 0, 0, 0, 0));

        const allAppointments = patientsWithAppointmentsToday.flatMap(patient =>
          patient.appointments
            .filter(appt => {
              const apptDate = new Date(appt.date);
              return apptDate >= startOfCurrentDayUTC && apptDate < endOfCurrentDayUTC;
            })
            .map(appt => ({
              ...appt,
              patientId: patient._id,
              firstName: patient.firstName,
              lastName: patient.lastName,
              phoneNumber: patient.phoneNumber,
              seen: appt.seenStatus,
              appointmentStatus: appt.appointmentStatus
            }))
        );

        const sortedAppointments = sortAppointmentsByArrival(allAppointments);

        setAppointments(sortedAppointments);
        setPatientsToday(sortedAppointments.length);

        const unconsultedCount = sortedAppointments.filter(appt => {
          const currentStatus = appt.appointmentStatus || (appt.seen ? 'Consulté' : 'En attente');
          return isUnconsulted(currentStatus);
        }).length;
        setUnconsultedPatientsToday(unconsultedCount);

      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        toast.error("Erreur lors du chargement des données.");
        setAppointments([]);
        setPatientsToday(0);
        setUnconsultedPatientsToday(0);
      }
    };

    if (isAuthenticated || shouldRefreshDashboard) {
      fetchData();
      if (shouldRefreshDashboard) {
        setShouldRefreshDashboard(false);
      }
    }
  }, [isAuthenticated, shouldRefreshDashboard]);

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

  const handleUpdateStatus = async (patientId, appointmentId, newStatus) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/patient/appointment/status`,
        {
          patientId,
          appointmentId,
          status: newStatus,
        },
        { withCredentials: true }
      );
      toast.success("Statut mis à jour !");

      const updatedAppointments = appointments.map(appt =>
        appt._id === appointmentId
          ? {
              ...appt,
              appointmentStatus: newStatus,
              seen: newStatus === 'Consulté'
            }
          : appt
      );

      const sortedAppointments = sortAppointmentsByArrival(updatedAppointments);
      setAppointments(sortedAppointments);

      const unconsulted = sortedAppointments.filter(appt => {
        const currentStatus = appt.appointmentStatus || (appt.seen ? 'Consulté' : 'En attente');
        return isUnconsulted(currentStatus);
      }).length;
      setUnconsultedPatientsToday(unconsulted);

    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      toast.error(error.response?.data?.message || "Échec de la mise à jour du statut");
    }
  };

  const handleUpdateArrivalTime = async (patientId, appointmentId, newTimeValue) => {
    if (!newTimeValue) return;
    try {
      const originalAppointment = appointments.find(a => a._id === appointmentId);
      if (!originalAppointment) return;

      const arrivalDate = new Date(originalAppointment.date);
      const [hours, minutes] = newTimeValue.split(':');
      arrivalDate.setHours(hours, minutes);

      await axios.put(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/patient/appointment/arrival-time`,
        { patientId, appointmentId, arrivalTime: arrivalDate.toISOString() },
        { withCredentials: true }
      );
      toast.success("Heure d'arrivée enregistrée !");

      const updatedAppointments = appointments.map(appt =>
        appt._id === appointmentId ? { ...appt, arrivalTime: arrivalDate.toISOString() } : appt
      );

      const sortedAppointments = sortAppointmentsByArrival(updatedAppointments);
      setAppointments(sortedAppointments);

    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'heure d'arrivée:", error);
      toast.error("Échec de la mise à jour de l'heure d'arrivée.");
    }
  };

  const handleUpdateAppointmentTime = async (patientId, appointmentId, newDate) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/patient/update-appointment-time`,
        { patientId, appointmentId, newAppointmentDate: newDate.toISOString() },
        { withCredentials: true }
      );
      toast.success("Heure du rendez-vous mise à jour");

      const updatedAppointments = appointments.map(appt =>
        appt._id === appointmentId ? { ...appt, date: newDate.toISOString() } : appt
      );

      const sortedAppointments = sortAppointmentsByArrival(updatedAppointments);
      setAppointments(sortedAppointments);

    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'heure:", error);
      toast.error("Échec de la mise à jour de l'heure du rendez-vous");
    }
  };

  const handleDeleteAppointment = async (patientId, appointmentId, patientName) => {
    const confirmDelete = window.confirm(`Êtes-vous sûr de vouloir supprimer le rendez-vous de ${patientName} ?`);
    if (!confirmDelete) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/patient/${patientId}/appointment/${appointmentId}`,
        { withCredentials: true }
      );
      toast.success(`Rendez-vous de ${patientName} supprimé avec succès`);

      const updatedAppointments = appointments.filter(appt => appt._id !== appointmentId);
      setAppointments(updatedAppointments);
      setPatientsToday(updatedAppointments.length);

      const unconsulted = updatedAppointments.filter(appt => {
        const currentStatus = appt.appointmentStatus || (appt.seen ? 'Consulté' : 'En attente');
        return isUnconsulted(currentStatus);
      }).length;
      setUnconsultedPatientsToday(unconsulted);

    } catch (error) {
      console.error("Erreur lors de la suppression du rendez-vous:", error);
      toast.error(error.response?.data?.message || "Erreur lors de la suppression du rendez-vous");
    }
  };

  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }

  return (
    <section className="dashboard page">
      <div className="banner">
        <div className="firstBox">
          <div className="content">
            <div className="admin-info">
              {admin?.profilePhoto ? (
                <img
                  src={admin.profilePhoto}
                  alt={`Dr ${admin.lastName}`}
                  className="admin-profile-photo"
                />
              ) : (
                <div className="admin-photo-placeholder">
                  👨‍⚕️
                </div>
              )}
              <div className="admin-details" onClick={() => navigate("/profile")} style={{ cursor: "pointer" }}>
                <p>Bonjour Dr,</p>
                <h5>{admin && `${admin.lastName} ${admin.firstName}`}</h5>
              </div>
            </div>
            <p>{format(currentDateTime, "dd/MM/yyyy HH:mm:ss")}</p>
          </div>
        </div>

        <div className="secondBox" onClick={() => navigate("/patients")} style={{ cursor: "pointer" }}>
          <p>
            <FaUsers />
            <span>Nombre total de patients inscrit au cabinet :</span>
          </p>
          <h3>{totalPatients}</h3>
          <h5>voir plus...</h5>
        </div>

        <div className="thirdBox" onClick={() => navigate("/calendar")} style={{ cursor: "pointer" }}>
          <p>
            <FaCalendarAlt />
            <span>Nombre total de RDV programmés aujourd'hui:</span>
          </p>
          <h3>{patientsToday}</h3>
          <h5>voir plus...</h5>
        </div>

        <div
          className="fourthBox"
          style={{ cursor: "pointer" }}
          onClick={() => document.getElementById('today-appointments')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <p>
            <FaUserClock />
            <span>Nombre de patients restant à consulter aujourd'hui :</span>
          </p>
          <h3>{unconsultedPatientsToday}</h3>
          <h5>Patients en attente</h5>
        </div>
      </div>

      <div className="appointments-section" id="today-appointments">
        <h5 className="appointments-title">
          Rendez-vous du jour
        </h5>
        <div className="banner">
          <table>
            <thead>
              <tr>
                <th><FaUser style={{ marginRight: '8px' }} />Patient</th>
                <th><FaClock style={{ marginRight: '8px' }} />Heure RDV</th>
                <th><FaClock style={{ marginRight: '8px' }} />Heure d'arrivée</th>
                <th><FaPhone style={{ marginRight: '8px' }} />Téléphone</th>
                <th><FaCheckCircle style={{ marginRight: '8px' }} />Statut</th>
                <th><FaCog style={{ marginRight: '8px' }} />Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length > 0 ? (
                appointments.map((appointment) => {
                  const currentStatus = appointment.appointmentStatus || (appointment.seen ? 'Consulté' : 'En attente');

                  return (
                    <tr
                      key={appointment._id}
                      style={{
                        backgroundColor: appointment.arrivalTime ? '#f0f8ff' : 'transparent',
                        borderLeft: appointment.arrivalTime ? '3px solid #007bff' : 'none'
                      }}
                    >
                      <td>
                        {appointment.arrivalTime && (
                          <span style={{ color: '#007bff', fontSize: '12px', marginRight: '5px' }}>
                          </span>
                        )}
                        {`${appointment.firstName} ${appointment.lastName}`}
                      </td>
                      <td>
                        <input
                          type="time"
                          defaultValue={format(new Date(appointment.date), "HH:mm")}
                          onChange={(e) => {
                            const newTime = e.target.value;
                            const newDate = new Date(appointment.date);
                            const [hours, minutes] = newTime.split(":");
                            newDate.setHours(hours, minutes);
                            handleUpdateAppointmentTime(appointment.patientId, appointment._id, newDate);
                          }}
                        />
                      </td>
                      <td>
                        <input
                          type="time"
                          defaultValue={appointment.arrivalTime ? format(new Date(appointment.arrivalTime), "HH:mm") : ""}
                          onBlur={(e) => handleUpdateArrivalTime(appointment.patientId, appointment._id, e.target.value)}
                          placeholder="--:--"
                          style={{
                            backgroundColor: appointment.arrivalTime ? '#e3f2fd' : 'white',
                            fontWeight: appointment.arrivalTime ? 'bold' : 'normal'
                          }}
                        />
                      </td>
                      <td>{appointment.phoneNumber}</td>
                      <td>
                        <select
                          className={getStatusClassName(currentStatus)}
                          value={currentStatus}
                          onChange={(e) => handleUpdateStatus(appointment.patientId, appointment._id, e.target.value)}
                        >
                          <option value="En attente" className="status-en-attente">
                            Patient en salle d'attente {getStatusEmoji('En attente')}
                          </option>
                          <option value="RDV confirmé" className="status-confirme">
                            RDV confirmé {getStatusEmoji('RDV confirmé')}
                          </option>
                          <option value="Consulté" className="status-consulte">
                            Patient consulté {getStatusEmoji('Consulté')}
                          </option>
                          <option value="Patient absent" className="status-absent">
                            Patient absent {getStatusEmoji('Patient absent')}
                          </option>
                          <option value="RDV annulé" className="status-annule">
                            RDV annulé {getStatusEmoji('RDV annulé')}
                          </option>
                        </select>
                      </td>
                      <td className="dashboard-actions-column">
                        <div className="dashboard-actions-buttons">
                          <button
                            className="dashboard-btn-view-file"
                            onClick={() => navigate(`/dossier-patient/${appointment.patientId}`)}
                            title="Consulter le dossier du patient"
                          >
                            <FaFolder /> Voir Dossier
                          </button>
                          <button
                            className="dashboard-btn-delete-appointment"
                            onClick={() => handleDeleteAppointment(
                              appointment.patientId,
                              appointment._id,
                              `${appointment.firstName} ${appointment.lastName}`
                            )}
                            title="Supprimer ce rendez-vous"
                          >
                            <FaTrashAlt /> Supprimer RDV
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6">Aucun rendez-vous aujourd'hui</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;