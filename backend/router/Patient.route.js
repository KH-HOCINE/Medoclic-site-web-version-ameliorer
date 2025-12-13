// Patient.route.js

import express from "express";
import multer from "multer";
import { 
  addNewPatient, 
  getAllPatients,
  getPatientsByDate, 
  getPatientById,
  updateAppointmentStatus, 
  addCertificatToPatient,
  addBilanToPatient, 
  scheduleAppointment, 
  addJustificationToPatient, 
  addPrescriptionToPatient, 
  addMedicalFilesToPatient, 
  updateAppointmentTime,
  updatePatientPhoneNumber, 
  addNoteToPatient,
  updatePatientInfo,
  sendReminderNow,
  addLettreToPatient,
  updateAppointmentArrivalTime,
  deleteMedicalFile,
  deletePrescription,
  deleteBilan,
  deleteCertificat,
  deleteJustification,
  deleteLettre,
  deleteNote,
  deleteAppointment,
  deletePatient,
  getDoctorStats // Assurez-vous que l'import est bien là
} from "../controller/Patient.controller.js";
import { isAdminAuthenticated } from "../middlewares/auth.js"; 

const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});
const router = express.Router();

router.post("/addnew", isAdminAuthenticated, upload.any(), addNewPatient);
router.get("/patients", isAdminAuthenticated, getAllPatients);

// ======================= CORRECTION ICI =======================
// Les routes spécifiques DOIVENT être déclarées AVANT les routes dynamiques comme /:id

router.get("/stats", isAdminAuthenticated, getDoctorStats); // <-- ROUTE SPÉCIFIQUE
router.get("/by-date", isAdminAuthenticated, getPatientsByDate); // <-- ROUTE SPÉCIFIQUE

// La route dynamique /:id vient APRÈS, pour ne pas capturer "stats" ou "by-date"
router.get("/:id", isAdminAuthenticated, getPatientById); // <-- ROUTE DYNAMIQUE
// =============================================================

router.delete("/:id", isAdminAuthenticated, deletePatient);

router.put("/appointment/status", isAdminAuthenticated, updateAppointmentStatus);
router.put("/:id/add-certificat", isAdminAuthenticated, addCertificatToPatient);
router.put("/:id/add-bilan", isAdminAuthenticated, addBilanToPatient);
router.put("/schedule-appointment", isAdminAuthenticated, scheduleAppointment);
router.put("/:id/add-justification", isAdminAuthenticated, addJustificationToPatient);
router.put("/:id/add-prescription", isAdminAuthenticated, addPrescriptionToPatient);
router.put("/:id/add-medical-files", isAdminAuthenticated, upload.any(), addMedicalFilesToPatient);
router.put("/update-appointment-time", isAdminAuthenticated, updateAppointmentTime);
router.put("/:id/update-phone-number", isAdminAuthenticated, updatePatientPhoneNumber);
router.put("/:id/add-note", isAdminAuthenticated, addNoteToPatient);
router.put("/:id/update-info", isAdminAuthenticated, upload.any(), updatePatientInfo);
router.put("/patient/schedule-appointment", isAdminAuthenticated, scheduleAppointment);
router.post("/patient/send-reminder-now", isAdminAuthenticated, sendReminderNow);
router.put("/:id/add-lettre", isAdminAuthenticated, addLettreToPatient);
router.delete("/:patientId/medical-file/:fileIndex", isAdminAuthenticated, deleteMedicalFile);
router.delete("/:patientId/prescription/:prescriptionId", isAdminAuthenticated, deletePrescription);
router.delete("/:patientId/bilan/:bilanId", isAdminAuthenticated, deleteBilan);
router.delete("/:patientId/certificat/:certificatId", isAdminAuthenticated, deleteCertificat);
router.delete("/:patientId/justification/:justificationId", isAdminAuthenticated, deleteJustification);
router.delete("/:patientId/lettre/:lettreId", isAdminAuthenticated, deleteLettre);
router.delete("/:patientId/note/:noteId", isAdminAuthenticated, deleteNote);
router.delete("/:patientId/appointment/:appointmentId", isAdminAuthenticated, deleteAppointment);
router.put("/appointment/arrival-time", isAdminAuthenticated, updateAppointmentArrivalTime);

export default router;