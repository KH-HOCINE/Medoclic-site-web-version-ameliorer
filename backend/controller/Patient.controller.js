import Patient from "../models/Patient.model.js";
import ErrorHandler from "../middlewares/error.js"; // Assurez-vous que ErrorHandler est importé
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js"; 
import { sendEmail } from "../utils/sendEmail.js"; 
import mongoose from "mongoose"; 
import User from "../models/userSchema.js"; 
import TrashItem from "../models/Trash.model.js";


// Fonction pour ajouter un nouveau patient
export const addNewPatient = catchAsyncErrors(async (req, res, next) => { // <<< AJOUTER catchAsyncErrors et next
  try {
    const doctorId = req.user._id; // Récupérer l'ID du médecin connecté
    const {
      patientNumber,
      firstName,
      lastName,
      address,
      dob,
      weight,
      height,
      gender,
      bloodGroup,
      chronicDiseases,
      pastSurgeries,
      phoneNumber,
      email,
      nextAppointment,
    } = req.body;

    // Vérifier si le numéro du patient existe déjà pour ce médecin
    const existingPatient = await Patient.findOne({
      patientNumber,
      doctor: doctorId
    });
    if (existingPatient) {
      return next(new ErrorHandler("Patient number already in use", 400)); // <<< UTILISER next(new ErrorHandler)
    }


    if (email && email.trim() !== "") {
      const existingEmail = await Patient.findOne({
          email: email.toLowerCase(),
          doctor: doctorId
      });
      if (existingEmail) {
          return next(new ErrorHandler("Cet email est déjà utilisé par un autre patient de ce médecin.", 400)); // <<< UTILISER next(new ErrorHandler)
      }
    }

    // Gestion des fichiers médicaux
    const medicalFiles = [];
    if (req.files) {
      const files = req.files.filter(file => file.fieldname === 'medicalFiles');
      for (const file of files) {
        const fileBuffer = file.buffer;
        const base64File = fileBuffer.toString("base64");
        const dataURI = `data:${file.mimetype};base64,${base64File}`;
        medicalFiles.push({
            url: dataURI,
            addedDate: new Date()
        });
      }
    }

    let profileImage = null;
    const profileImageFile = req.files.find(file => file.fieldname === 'profileImage');
    if (profileImageFile) {
        const base64Image = profileImageFile.buffer.toString("base64");
        const dataURI = `data:${profileImageFile.mimetype};base64,${base64Image}`;
        profileImage = {
            url: dataURI,
            addedDate: new Date()
        };
    }

    // Créer un nouveau patient avec le médecin associé
    const newPatient = await Patient.create({
      patientNumber,
      firstName,
      lastName,
      address,
      dob,
      weight,
      height,
      gender,
      bloodGroup,
      chronicDiseases,
      pastSurgeries,
      medicalFiles,
      phoneNumber,
      email,
      profileImage,
      appointments: nextAppointment ? [{ date: new Date(nextAppointment) }] : [],
      doctor: doctorId
    });

    res.status(201).json({ message: "Patient added successfully", patient: newPatient });
  } catch (error) {
    next(new ErrorHandler(error.message, 500)); // <<< UTILISER next(new ErrorHandler)
  }
});

// Fonction pour récupérer tous les patients du médecin
export const getAllPatients = catchAsyncErrors(async (req, res, next) => { // <<< AJOUTER catchAsyncErrors et next
  try {
    const patients = await Patient.find(
      { doctor: req.user._id },
      { medicalFiles: 0, __v: 0 }
    ).lean();

    res.status(200).json({ patients });
  } catch (error) {
    next(new ErrorHandler(error.message, 500)); // <<< UTILISER next(new ErrorHandler)
  }
});

export const getPatientsByDate = catchAsyncErrors(async (req, res, next) => { // <<< AJOUTER catchAsyncErrors et next
  try {
    const { date } = req.query;

    console.log("--- Début getPatientsByDate ---");
    console.log("Date reçue du frontend:", date);

    const queryDate = new Date(date);

    const startOfDay = new Date(Date.UTC(
        queryDate.getFullYear(),
        queryDate.getMonth(),
        queryDate.getDate(),
        0, 0, 0, 0
    ));

    const endOfDay = new Date(Date.UTC(
        queryDate.getFullYear(),
        queryDate.getMonth(),
        queryDate.getDate() + 1,
        0, 0, 0, 0
    ));

    console.log("Période de recherche UTC (début):", startOfDay.toISOString());
    console.log("Période de recherche UTC (fin):", endOfDay.toISOString());

    const patients = await Patient.find({
      doctor: req.user._id,
      'appointments.date': {
        $gte: startOfDay,
        $lt: endOfDay
      }
    });

    console.log("Patients trouvés par getPatientsByDate:", patients.length);
    console.log("--- Fin getPatientsByDate ---");

    res.status(200).json({ patients });
  } catch (error) {
    console.error("Erreur dans getPatientsByDate:", error); // Conserver le log pour le débogage
    next(new ErrorHandler(error.message, 500)); // <<< UTILISER next(new ErrorHandler)
  }
});

export const getPatientById = catchAsyncErrors(async (req, res, next) => { // <<< AJOUTER catchAsyncErrors et next
  try {
    const patient = await Patient.findOne({
      _id: req.params.id,
      doctor: req.user._id
    });

    if (!patient) {
      return next(new ErrorHandler("Patient non trouvé", 404)); // <<< UTILISER next(new ErrorHandler)
    }
    res.json(patient);
  } catch (error) {
    next(new ErrorHandler(error.message, 500)); // <<< UTILISER next(new ErrorHandler)
  }
});

// FONCTION MISE À JOUR POUR GÉRER LES NOUVEAUX STATUTS
export const updateAppointmentStatus = catchAsyncErrors(async (req, res, next) => {
  const { patientId, appointmentId, status } = req.body; // 'status' au lieu de 'seen'

  if (patientId === undefined || appointmentId === undefined || status === undefined) {
    return next(new ErrorHandler("Les IDs du patient, du RDV et le statut sont requis", 400));
  }

  const patient = await Patient.findOne({
    _id: patientId,
    doctor: req.user._id,
  });

  if (!patient) {
    return next(new ErrorHandler("Patient non trouvé", 404));
  }

  const appointment = patient.appointments.id(appointmentId);
  if (!appointment) {
    return next(new ErrorHandler("Rendez-vous non trouvé", 404));
  }

  // Mise à jour du nouveau champ appointmentStatus
  appointment.appointmentStatus = status;
  
  // Maintenir la compatibilité avec l'ancien système seenStatus
  appointment.seenStatus = (status === 'Consulté');

  await patient.save();

  res.status(200).json({ 
    success: true, 
    message: "Statut du rendez-vous mis à jour avec succès",
  });
});
export const addCertificatToPatient = catchAsyncErrors(async (req, res, next) => { // <<< AJOUTER catchAsyncErrors et next
  try {
    const patient = await Patient.findOne({
      _id: req.params.id,
      doctor: req.user._id
    });

    if (!patient) {
      return next(new ErrorHandler("Patient non trouvé", 404));
    }

    patient.certificats.push(req.body);
    await patient.save();

    res.status(200).json({ message: "Certificat ajouté avec succès", patient });
  } catch (error) {
    next(new ErrorHandler(error.message, 500));
  }
});

export const addBilanToPatient = catchAsyncErrors(async (req, res, next) => {
  try {
    const patient = await Patient.findOne({
      _id: req.params.id,
      doctor: req.user._id
    });

    if (!patient) {
      return next(new ErrorHandler("Patient non trouvé", 404));
    }

    // Ajouter le champ additionalTests
    patient.bilans.push({
      ...req.body,
      additionalTests: req.body.additionalTests || [] // Récupère les tests supplémentaires
    });
    
    await patient.save();
    res.status(200).json({ message: "Bilan ajouté avec succès", patient });
  } catch (error) {
    next(new ErrorHandler(error.message, 500));
  }
});

// Dans patientController.js, dans la fonction qui gère l'ajout/mise à jour de RDV
export const scheduleAppointment = catchAsyncErrors(async (req, res, next) => { // <<< AJOUTER catchAsyncErrors et next
  const {
    patientId,
    appointmentDate, 
    emailReminderActive, 
    emailReminderTime,   
    customReminderDate,  
  } = req.body;

  
  const patient = await Patient.findById(patientId); // <<< AJOUTEZ CETTE LIGNE

  if (!patient) {
    return next(new ErrorHandler("Patient non trouvé", 404));
  }

   const newAppointment = {
    date: new Date(appointmentDate), // Assurez-vous que c'est le bon nom de champ pour la date du RDV
    emailReminderSent: false, // Toujours false à la création
    emailReminderSentAt: null,
    emailReminderActive: emailReminderActive, // Sauvegarder l'état
    emailReminderTime: emailReminderTime,     // Sauvegarder l'option
    customReminderDate: customReminderDate ? new Date(customReminderDate) : null, // Sauvegarder la date personnalisée
  };

  patient.appointments.push(newAppointment);
  await patient.save();

    res.status(200).json({
        success: true,
        message: "Rendez-vous programmé avec succès!",
        patient: patient, // Renvoyer le patient mis à jour
        appointmentId: newAppointment._id // <<< VÉRIFIEZ ABSOLUMENT QUE CETTE LIGNE EST LÀ !
    });
});

export const addJustificationToPatient = catchAsyncErrors(async (req, res, next) => { // <<< AJOUTER catchAsyncErrors et next
  try {
    const patient = await Patient.findOne({
      _id: req.params.id,
      doctor: req.user._id
    });

    if (!patient) {
      return next(new ErrorHandler("Patient non trouvé", 404));
    }

    const justification = {
      date: new Date(),
      doctorName: req.body.doctorName,
      doctor: req.body.doctor,
      ...(req.body.justificationText && { justificationText: req.body.justificationText })
    };

    patient.justifications.push(justification);
    await patient.save();

    res.status(200).json({ message: "Justification ajoutée avec succès", patient });
  } catch (error) {
    next(new ErrorHandler(error.message, 500));
  }
});

export const addPrescriptionToPatient = catchAsyncErrors(async (req, res, next) => {
  try {
    const patient = await Patient.findOne({
      _id: req.params.id,
      doctor: req.user._id
    });

    if (!patient) {
      return next(new ErrorHandler("Patient non trouvé", 404));
    }

    // Mapper les médicaments pour inclure nomCommercial et dosage
    const medications = req.body.medications.map(med => ({
      medicamentId: med.medicamentId,
      nomCommercial: med.nomCommercial, // Ajouté
      dosage: med.dosage,               // Ajouté
       forme: med.forme,        // AJOUTER
      frequence: med.frequence, // AJOUTER  
      duree: med.duree,        // AJOUTER
      boxes: med.boxes || 1,   // Valeur par défaut
      note: med.note || ''
    }));

    const prescriptionData = {
      ...req.body,
      medications // Utiliser le nouveau tableau
    };

    patient.prescriptions.push(prescriptionData);
    await patient.save();

    res.status(200).json({ message: "Ordonnance ajoutée avec succès", patient });
  } catch (error) {
    next(new ErrorHandler(error.message, 500));
  }
});

export const addMedicalFilesToPatient = catchAsyncErrors(async (req, res, next) => { // <<< AJOUTER catchAsyncErrors et next
  try {
    const patient = await Patient.findOne({
      _id: req.params.id,
      doctor: req.user._id
    });

    if (!patient) {
      return next(new ErrorHandler("Patient non trouvé", 404));
    }

    const medicalFiles = [];
    if (req.files) {
      const files = req.files.filter(file => file.fieldname === 'medicalFiles');
      for (const file of files) {
        const base64File = file.buffer.toString("base64");
        // Dans addMedicalFilesToPatient
        const dataURI = `data:${file.mimetype};base64,${base64File}`; // mimetype doit être 'application/pdf' pour les PDFs
        medicalFiles.push({
            url: dataURI,
            addedDate: new Date()
        });
      }
    }

    patient.medicalFiles.push(...medicalFiles);
    await patient.save();

    res.status(200).json({ message: "Fichiers médicaux ajoutés", patient });
  } catch (error) {
    next(new ErrorHandler(error.message, 500));
  }
});

export const updateAppointmentTime = catchAsyncErrors(async (req, res, next) => { // <<< AJOUTER catchAsyncErrors et next
  try {
    const { patientId, appointmentId, newAppointmentDate } = req.body;

    if (!patientId || !appointmentId || !newAppointmentDate) {
      return next(new ErrorHandler("Tous les champs sont requis", 400));
    }

    const patient = await Patient.findOne({
      _id: patientId,
      doctor: req.user._id
    });

    if (!patient) {
      return next(new ErrorHandler("Patient non trouvé", 404));
    }

    const appointment = patient.appointments.id(appointmentId);
    if (!appointment) {
      return next(new ErrorHandler("Rendez-vous non trouvé", 404));
    }

    appointment.date = new Date(newAppointmentDate);
    await patient.save();

    res.status(200).json({ message: "Heure du rendez-vous mise à jour", patient });
  } catch (error) {
    next(new ErrorHandler(error.message, 500));
  }
});

export const updatePatientPhoneNumber = catchAsyncErrors(async (req, res, next) => { // <<< AJOUTER catchAsyncErrors et next
  try {
    const { id } = req.params;
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return next(new ErrorHandler("Le numéro de téléphone est requis", 400));
    }

    const patient = await Patient.findOne({
      _id: id,
      doctor: req.user._id
    });

    if (!patient) {
      return next(new ErrorHandler("Patient non trouvé", 404));
    }

    patient.phoneNumber = phoneNumber;
    await patient.save();

    res.status(200).json({ message: "Numéro de téléphone mis à jour avec succès", patient });
  } catch (error) {
    next(new ErrorHandler(error.message, 500));
  }
});


export const addNoteToPatient = catchAsyncErrors(async (req, res, next) => { // <<< AJOUTER catchAsyncErrors et next
  try {
    const patient = await Patient.findOne({
      _id: req.params.id,
      doctor: req.user._id
    });

    if (!patient) {
      return next(new ErrorHandler("Patient non trouvé", 404));
    }

    const noteData = {
      date: new Date(),
      doctorName: req.body.doctorName,
      doctor: req.body.doctor,
      noteText: req.body.noteText
    };

    patient.notes.push(noteData);
    await patient.save();

    res.status(200).json({ message: "Note ajoutée avec succès", patient });
  } catch (error) {
    next(new ErrorHandler(error.message, 500));
  }
});

// Ajoutez cette nouvelle fonction dans votre Patient.controller.js

export const updatePatientInfo = catchAsyncErrors(async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Trouver le patient
    const patient = await Patient.findOne({
      _id: id,
      doctor: req.user._id
    });

    if (!patient) {
      return next(new ErrorHandler("Patient non trouvé", 404));
    }

    // Vérifier si le numéro de patient existe déjà pour un autre patient
    if (updateData.patientNumber && updateData.patientNumber !== patient.patientNumber) {
      const existingPatientNumber = await Patient.findOne({
        patientNumber: updateData.patientNumber,
        doctor: req.user._id,
        _id: { $ne: id }
      });
      if (existingPatientNumber) {
        return next(new ErrorHandler("Ce numéro de patient est déjà utilisé.", 400));
      }
    }

    // Vérifier si l'email existe déjà pour un autre patient
    if (updateData.email && updateData.email !== patient.email) {
      if (updateData.email.trim() !== "") {
        const existingEmail = await Patient.findOne({
          email: updateData.email.toLowerCase(),
          doctor: req.user._id,
          _id: { $ne: id }
        });
        if (existingEmail) {
          return next(new ErrorHandler("Email déjà utilisé par un autre patient.", 400));
        }
      }
    }

    // Gestion des fichiers médicaux (uniquement les nouveaux uploads)
    const medicalFiles = [];
    if (req.files && req.files.length > 0) {
      const files = req.files.filter(file => file.fieldname === 'medicalFiles');
      for (const file of files) {
        const fileBuffer = file.buffer;
        const base64File = fileBuffer.toString("base64");
        const dataURI = `data:${file.mimetype};base64,${base64File}`;
        medicalFiles.push({
            url: dataURI,
            addedDate: new Date()
        });
      }
    }

    // Gestion de l'image de profil - CORRECTION ICI
    const profileImageFile = req.files?.find(file => file.fieldname === 'profileImage');
    
    // Mettre à jour les données du patient
    for (const key in updateData) {
        if (updateData[key] !== undefined && key !== 'profileImage') { 
            patient[key] = updateData[key];
        }
    }
   
    // Gérer l'ajout des nouveaux medicalFiles
    if (medicalFiles.length > 0) {
        patient.medicalFiles.push(...medicalFiles);
    }
    
    // Gérer l'update de profileImage SEULEMENT si un nouveau fichier est fourni
    if (profileImageFile) {
        const base64Image = profileImageFile.buffer.toString("base64");
        const dataURI = `data:${profileImageFile.mimetype};base64,${base64Image}`;
        patient.profileImage = {
            url: dataURI,
            addedDate: new Date()
        };
    }
    // Si aucun fichier profileImage n'est fourni, on garde l'ancienne image (ne rien faire)

    await patient.save(); // Sauvegarder les modifications

    res.status(200).json({
      message: "Informations du patient mises à jour avec succès",
      patient: patient
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return next(new ErrorHandler("Données invalides: " + error.message, 400));
    }
    next(new ErrorHandler(error.message, 500));
  }
});

export const sendReminderNow = catchAsyncErrors(async (req, res, next) => {
    const { patientId, appointmentId } = req.body; // Récupérer les IDs du patient et du RDV

    if (!patientId || !appointmentId) {
        return next(new ErrorHandler("Les IDs du patient et du rendez-vous sont requis.", 400));
    }

    const patient = await Patient.findById(patientId).populate('doctor', 'firstName lastName');
    if (!patient) {
        return next(new ErrorHandler("Patient non trouvé.", 404));
    }

    const appointment = patient.appointments.id(appointmentId); // Trouver le sous-document RDV
    if (!appointment) {
        return next(new ErrorHandler("Rendez-vous non trouvé.", 404));
    }

    // Vérifier si le rappel n'a pas déjà été envoyé manuellement pour ce RDV
    // On permet de renvoyer si l'option n'était pas 'manual-now' initialement
    if (appointment.emailReminderSent && appointment.emailReminderTime === 'manual-now') {
        return next(new ErrorHandler("Rappel déjà envoyé manuellement pour ce rendez-vous.", 400));
    }

    // Vérifier si l'email du patient est disponible
    if (!patient.email) {
        return next(new ErrorHandler("L'adresse e-mail du patient n'est pas renseignée. Impossible d'envoyer le rappel.", 400));
    }

    const rdvDate = appointment.date.toLocaleDateString('fr-FR');
    const rdvTime = appointment.date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const doctorName = patient.doctor ? `Dr. ${patient.doctor.firstName} ${patient.doctor.lastName}` : 'votre médecin';

    const emailSubject = `Rappel Immédiat: Votre rendez-vous médical le ${rdvDate}`;
    const emailMessage = `Bonjour ${patient.firstName} ${patient.lastName},\n\n` +
                        `Ceci est un rappel IMMÉDIAT pour votre rendez-vous avec ${doctorName} le ${rdvDate} à ${rdvTime}.\n\n` +
                        `Merci de vous présenter à l'heure.\n\n` +
                        `Cordialement,\nVotre cabinet médical.`;

    try {
        await sendEmail({ email: patient.email, subject: emailSubject, message: emailMessage });

        // Mettre à jour le statut du rappel pour CE rendez-vous
        appointment.emailReminderSent = true;
        appointment.emailReminderSentAt = new Date();
        appointment.emailReminderTime = 'manual-now'; // Marquer comme envoyé manuellement
        appointment.emailReminderActive = true; // S'assurer qu'il est actif si envoyé manuellement
        await patient.save(); // Sauvegarder le document Patient mis à jour

        res.status(200).json({ success: true, message: "Rappel immédiat envoyé avec succès!" });
    } catch (error) {
        console.error("Erreur lors de l'envoi du rappel immédiat:", error);
        return next(new ErrorHandler("Échec de l'envoi du rappel immédiat.", 500));
    }
});

export const addLettreToPatient = catchAsyncErrors(async (req, res, next) => {
  try {
    const patient = await Patient.findOne({
      _id: req.params.id,
      doctor: req.user._id
    });

    if (!patient) {
      return next(new ErrorHandler("Patient non trouvé", 404));
    }

    const lettreData = {
      date: new Date(),
      doctorName: req.body.doctorName,
      doctor: req.body.doctor,
      letterType: req.body.letterType,
      contentText: req.body.contentText,
    };

    patient.lettres.push(lettreData);
    await patient.save();

    res.status(200).json({ message: "Lettre ajoutée avec succès", patient });
  } catch (error) {
    next(new ErrorHandler(error.message, 500));
  }
});

// Ajouter ces nouvelles fonctions dans Patient.controller.js

// Supprimer un fichier médical
export const deleteMedicalFile = catchAsyncErrors(async (req, res, next) => {
  try {
    const { patientId, fileIndex } = req.params;

    const patient = await Patient.findOne({
      _id: patientId,
      doctor: req.user._id
    });

    if (!patient) {
      return next(new ErrorHandler("Patient non trouvé", 404));
    }

    if (fileIndex < 0 || fileIndex >= patient.medicalFiles.length) {
      return next(new ErrorHandler("Fichier médical non trouvé", 404));
    }

    // Sauvegarder dans la corbeille AVANT suppression
    const fileToDelete = patient.medicalFiles[fileIndex];
    await TrashItem.create({
      originalId: fileToDelete._id || new mongoose.Types.ObjectId(),
      itemType: 'medicalFile',
      originalData: {
        patientId: patient._id,
        file: fileToDelete
      },
      deletedBy: req.user._id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      patientId: patient._id,
      fileName: fileToDelete.url ? `Fichier médical ${fileIndex + 1}` : 'Fichier médical'
    });

    // Supprimer le fichier
    patient.medicalFiles.splice(fileIndex, 1);
    await patient.save();

    res.status(200).json({ 
      message: "Fichier médical supprimé avec succès", 
      patient 
    });
  } catch (error) {
    next(new ErrorHandler(error.message, 500));
  }
});

// Supprimer une prescription
export const deletePrescription = catchAsyncErrors(async (req, res, next) => {
  try {
    const { patientId, prescriptionId } = req.params;

    const patient = await Patient.findOne({
      _id: patientId,
      doctor: req.user._id
    });

    if (!patient) {
      return next(new ErrorHandler("Patient non trouvé", 404));
    }

    const prescriptionIndex = patient.prescriptions.findIndex(
      p => p._id.toString() === prescriptionId
    );

    if (prescriptionIndex === -1) {
      return next(new ErrorHandler("Prescription non trouvée", 404));
    }

    // Sauvegarder dans la corbeille AVANT suppression
    const prescriptionToDelete = patient.prescriptions[prescriptionIndex];
    await TrashItem.create({
      originalId: prescriptionToDelete._id,
      itemType: 'prescription',
      originalData: {
        patientId: patient._id,
        document: prescriptionToDelete.toObject ? prescriptionToDelete.toObject() : prescriptionToDelete
      },
      deletedBy: req.user._id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      patientId: patient._id
    });

    // Supprimer la prescription
    patient.prescriptions.splice(prescriptionIndex, 1);
    await patient.save();

    res.status(200).json({ 
      message: "Prescription supprimée avec succès", 
      patient 
    });
  } catch (error) {
    next(new ErrorHandler(error.message, 500));
  }
});

// Supprimer un bilan
export const deleteBilan = catchAsyncErrors(async (req, res, next) => {
  try {
    const { patientId, bilanId } = req.params;

    const patient = await Patient.findOne({
      _id: patientId,
      doctor: req.user._id
    });

    if (!patient) {
      return next(new ErrorHandler("Patient non trouvé", 404));
    }

    const bilanIndex = patient.bilans.findIndex(
      b => b._id.toString() === bilanId
    );

    if (bilanIndex === -1) {
      return next(new ErrorHandler("Bilan non trouvé", 404));
    }

    // Sauvegarder dans la corbeille AVANT suppression
    const bilanToDelete = patient.bilans[bilanIndex];
    await TrashItem.create({
      originalId: bilanToDelete._id,
      itemType: 'bilan',
      originalData: {
        patientId: patient._id,
        document: bilanToDelete.toObject ? bilanToDelete.toObject() : bilanToDelete
      },
      deletedBy: req.user._id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      patientId: patient._id
    });

    // Supprimer le bilan
    patient.bilans.splice(bilanIndex, 1);
    await patient.save();

    res.status(200).json({ 
      message: "Bilan supprimé avec succès", 
      patient 
    });
  } catch (error) {
    next(new ErrorHandler(error.message, 500));
  }
});

// Supprimer un certificat d'arrêt
export const deleteCertificat = catchAsyncErrors(async (req, res, next) => {
  try {
    const { patientId, certificatId } = req.params;

    const patient = await Patient.findOne({
      _id: patientId,
      doctor: req.user._id
    });

    if (!patient) {
      return next(new ErrorHandler("Patient non trouvé", 404));
    }

    const certificatIndex = patient.certificats.findIndex(
      c => c._id.toString() === certificatId
    );

    if (certificatIndex === -1) {
      return next(new ErrorHandler("Certificat non trouvé", 404));
    }

    // Sauvegarder dans la corbeille AVANT suppression
    const certificatToDelete = patient.certificats[certificatIndex];
    await TrashItem.create({
      originalId: certificatToDelete._id,
      itemType: 'certificat',
      originalData: {
        patientId: patient._id,
        document: certificatToDelete.toObject ? certificatToDelete.toObject() : certificatToDelete
      },
      deletedBy: req.user._id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      patientId: patient._id
    });

    // Supprimer le certificat
    patient.certificats.splice(certificatIndex, 1);
    await patient.save();

    res.status(200).json({ 
      message: "Certificat supprimé avec succès", 
      patient 
    });
  } catch (error) {
    next(new ErrorHandler(error.message, 500));
  }
});

// Supprimer une justification
export const deleteJustification = catchAsyncErrors(async (req, res, next) => {
  try {
    const { patientId, justificationId } = req.params;

    const patient = await Patient.findOne({
      _id: patientId,
      doctor: req.user._id
    });

    if (!patient) {
      return next(new ErrorHandler("Patient non trouvé", 404));
    }

    const justificationIndex = patient.justifications.findIndex(
      j => j._id.toString() === justificationId
    );

    if (justificationIndex === -1) {
      return next(new ErrorHandler("Justification non trouvée", 404));
    }

    // Sauvegarder dans la corbeille AVANT suppression
    const justificationToDelete = patient.justifications[justificationIndex];
    await TrashItem.create({
      originalId: justificationToDelete._id,
      itemType: 'justification',
      originalData: {
        patientId: patient._id,
        document: justificationToDelete.toObject ? justificationToDelete.toObject() : justificationToDelete
      },
      deletedBy: req.user._id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      patientId: patient._id
    });

    // Supprimer la justification
    patient.justifications.splice(justificationIndex, 1);
    await patient.save();

    res.status(200).json({ 
      message: "Justification supprimée avec succès", 
      patient 
    });
  } catch (error) {
    next(new ErrorHandler(error.message, 500));
  }
});

// Supprimer une lettre
export const deleteLettre = catchAsyncErrors(async (req, res, next) => {
  try {
    const { patientId, lettreId } = req.params;

    const patient = await Patient.findOne({
      _id: patientId,
      doctor: req.user._id
    });

    if (!patient) {
      return next(new ErrorHandler("Patient non trouvé", 404));
    }

    const lettreIndex = patient.lettres.findIndex(
      l => l._id.toString() === lettreId
    );

    if (lettreIndex === -1) {
      return next(new ErrorHandler("Lettre non trouvée", 404));
    }

    // Sauvegarder dans la corbeille AVANT suppression
    const lettreToDelete = patient.lettres[lettreIndex];
    await TrashItem.create({
      originalId: lettreToDelete._id,
      itemType: 'lettre',
      originalData: {
        patientId: patient._id,
        document: lettreToDelete.toObject ? lettreToDelete.toObject() : lettreToDelete
      },
      deletedBy: req.user._id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      patientId: patient._id
    });

    // Supprimer la lettre
    patient.lettres.splice(lettreIndex, 1);
    await patient.save();

    res.status(200).json({ 
      message: "Lettre supprimée avec succès", 
      patient 
    });
  } catch (error) {
    next(new ErrorHandler(error.message, 500));
  }
});

// Supprimer une note
export const deleteNote = catchAsyncErrors(async (req, res, next) => {
  try {
    const { patientId, noteId } = req.params;

    const patient = await Patient.findOne({
      _id: patientId,
      doctor: req.user._id
    });

    if (!patient) {
      return next(new ErrorHandler("Patient non trouvé", 404));
    }

    const noteIndex = patient.notes.findIndex(
      n => n._id.toString() === noteId
    );

    if (noteIndex === -1) {
      return next(new ErrorHandler("Note non trouvée", 404));
    }

    // Sauvegarder dans la corbeille AVANT suppression
    const noteToDelete = patient.notes[noteIndex];
    await TrashItem.create({
      originalId: noteToDelete._id,
      itemType: 'note',
      originalData: {
        patientId: patient._id,
        document: noteToDelete.toObject ? noteToDelete.toObject() : noteToDelete
      },
      deletedBy: req.user._id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      patientId: patient._id
    });

    // Supprimer la note
    patient.notes.splice(noteIndex, 1);
    await patient.save();

    res.status(200).json({ 
      message: "Note supprimée avec succès", 
      patient 
    });
  } catch (error) {
    next(new ErrorHandler(error.message, 500));
  }
});

// AJOUTEZ CETTE NOUVELLE FONCTION DANS Patient.controller.js

// Supprimer un rendez-vous
// Dans Patient.controller.js - fonction deleteAppointment
export const deleteAppointment = catchAsyncErrors(async (req, res, next) => {
  try {
    const { patientId, appointmentId } = req.params;

    const patient = await Patient.findOne({
      _id: patientId,
      doctor: req.user._id
    });

    if (!patient) {
      return next(new ErrorHandler("Patient non trouvé ou non autorisé", 404));
    }

    const appointmentIndex = patient.appointments.findIndex(
      (appt) => appt._id.toString() === appointmentId
    );

    if (appointmentIndex === -1) {
      return next(new ErrorHandler("Rendez-vous non trouvé", 404));
    }

    // Sauvegarder dans la corbeille
    const appointmentToDelete = patient.appointments[appointmentIndex];
    await TrashItem.create({
      originalId: appointmentToDelete._id,
      itemType: 'appointment',
      originalData: {
        patientId: patient._id,
        document: appointmentToDelete.toObject()
      },
      deletedBy: req.user._id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      patientId: patient._id,
      appointmentDate: appointmentToDelete.date
    });

    // Supprimer le rendez-vous
    patient.appointments.splice(appointmentIndex, 1);
    await patient.save();

    res.status(200).json({
      success: true,
      message: "Rendez-vous supprimé avec succès",
      patient
    });
  } catch (error) {
    next(new ErrorHandler(error.message, 500));
  }
});

export const deletePatient = catchAsyncErrors(async (req, res, next) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findOne({
      _id: id,
      doctor: req.user._id
    });

    if (!patient) {
      return next(new ErrorHandler("Patient non trouvé ou non autorisé à supprimer", 404));
    }

    // Sauvegarder dans la corbeille
    await TrashItem.create({
      originalId: patient._id,
      itemType: 'patient',
      originalData: patient.toObject(),
      deletedBy: req.user._id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      patientId: patient._id
    });

    // Supprimer le patient
    await Patient.findOneAndDelete({
      _id: id,
      doctor: req.user._id
    });

    res.status(200).json({
      success: true,
      message: "Patient supprimé avec succès",
    });

  } catch (error) {
    console.error("Erreur détaillée:", error);
    next(new ErrorHandler(error.message, 500));
  }
});

// NOUVELLE FONCTION pour mettre à jour l'heure d'arrivée
export const updateAppointmentArrivalTime = catchAsyncErrors(async (req, res, next) => {
  const { patientId, appointmentId, arrivalTime } = req.body;

  if (!patientId || !appointmentId || !arrivalTime) {
    return next(new ErrorHandler("Tous les champs sont requis", 400));
  }

  const patient = await Patient.findOne({
    _id: patientId,
    doctor: req.user._id,
  });

  if (!patient) {
    return next(new ErrorHandler("Patient non trouvé", 404));
  }

  const appointment = patient.appointments.id(appointmentId);
  if (!appointment) {
    return next(new ErrorHandler("Rendez-vous non trouvé", 404));
  }

  appointment.arrivalTime = new Date(arrivalTime);
  await patient.save();

  res.status(200).json({ 
    success: true, 
    message: "Heure d'arrivée mise à jour avec succès",
    patient
  });
});
// AJOUTEZ CETTE FONCTION À LA FIN DE VOTRE FICHIER Patient.controller.js

// Remplacez votre fonction getDoctorStats par celle-ci dans Patient.controller.js

// Remplacez votre fonction getDoctorStats existante par celle-ci dans Patient.controller.js

export const getDoctorStats = catchAsyncErrors(async (req, res, next) => {
  const doctorId = req.user._id;

  // 1. Nombre total de patients
  const totalPatients = await Patient.countDocuments({ doctor: doctorId });

  // 2. Dates pour les filtres
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  // 3. Consultations par période
  const consultationsThisMonth = await Patient.aggregate([
    { $match: { doctor: new mongoose.Types.ObjectId(doctorId) } },
    { $unwind: '$appointments' },
    { 
      $match: {
        'appointments.appointmentStatus': 'Consulté',
        'appointments.date': { $gte: startOfMonth, $lte: endOfMonth }
      }
    },
    { $count: 'total' }
  ]);

  const consultationsThisWeek = await Patient.aggregate([
    { $match: { doctor: new mongoose.Types.ObjectId(doctorId) } },
    { $unwind: '$appointments' },
    { 
      $match: {
        'appointments.appointmentStatus': 'Consulté',
        'appointments.date': { $gte: startOfWeek, $lte: now }
      }
    },
    { $count: 'total' }
  ]);

  const consultationsToday = await Patient.aggregate([
    { $match: { doctor: new mongoose.Types.ObjectId(doctorId) } },
    { $unwind: '$appointments' },
    { 
      $match: {
        'appointments.appointmentStatus': 'Consulté',
        'appointments.date': { $gte: startOfDay, $lte: now }
      }
    },
    { $count: 'total' }
  ]);

  const consultationsThisYear = await Patient.aggregate([
    { $match: { doctor: new mongoose.Types.ObjectId(doctorId) } },
    { $unwind: '$appointments' },
    { 
      $match: {
        'appointments.appointmentStatus': 'Consulté',
        'appointments.date': { $gte: startOfYear, $lte: now }
      }
    },
    { $count: 'total' }
  ]);

  // 4. Distribution par genre
  const genderDistributionResult = await Patient.aggregate([
    { $match: { doctor: new mongoose.Types.ObjectId(doctorId) } },
    { $group: { _id: '$gender', count: { $sum: 1 } } }
  ]);
  
  const genderDistribution = genderDistributionResult.reduce((acc, item) => {
    const genderKey = item._id ? item._id : 'Non défini';
    acc[genderKey] = item.count;
    return acc;
  }, {});

  // 5. Consultations des 12 derniers mois
  const last12MonthsConsultations = await Patient.aggregate([
    { $match: { doctor: new mongoose.Types.ObjectId(doctorId) } },
    { $unwind: '$appointments' },
    { 
      $match: {
        'appointments.appointmentStatus': 'Consulté',
        'appointments.date': { $gte: new Date(new Date().setMonth(now.getMonth() - 12)) }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$appointments.date' },
          month: { $month: '$appointments.date' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  // 6. Consultations des 7 derniers jours
  const last7DaysConsultations = await Patient.aggregate([
    { $match: { doctor: new mongoose.Types.ObjectId(doctorId) } },
    { $unwind: '$appointments' },
    { 
      $match: {
        'appointments.appointmentStatus': 'Consulté',
        'appointments.date': { 
          $gte: new Date(new Date().setDate(now.getDate() - 7)),
          $lte: now 
        }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$appointments.date' },
          month: { $month: '$appointments.date' },
          day: { $dayOfMonth: '$appointments.date' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);

  // 7. Consultations des 52 dernières semaines
  const last52WeeksConsultations = await Patient.aggregate([
    { $match: { doctor: new mongoose.Types.ObjectId(doctorId) } },
    { $unwind: '$appointments' },
    { 
      $match: {
        'appointments.appointmentStatus': 'Consulté',
        'appointments.date': { 
          $gte: new Date(new Date().setDate(now.getDate() - 364)),
          $lte: now 
        }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$appointments.date' },
          week: { $week: '$appointments.date' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.week': 1 } }
  ]);

  // 8. Consultations par année
  const consultationsByYear = await Patient.aggregate([
    { $match: { doctor: new mongoose.Types.ObjectId(doctorId) } },
    { $unwind: '$appointments' },
    { 
      $match: {
        'appointments.appointmentStatus': 'Consulté'
      }
    },
    {
      $group: {
        _id: { year: { $year: '$appointments.date' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1 } }
  ]);

  // 9. Distribution par tranche d'âge
  const ageDistribution = await Patient.aggregate([
    { $match: { doctor: new mongoose.Types.ObjectId(doctorId), dob: { $exists: true, $ne: null } } },
    {
      $project: {
        age: {
          $floor: {
            $divide: [
              { $subtract: [now, '$dob'] },
              1000 * 60 * 60 * 24 * 365.25
            ]
          }
        }
      }
    },
    {
      $bucket: {
        groupBy: '$age',
        boundaries: [0, 18, 30, 45, 60, 75, 120],
        default: 'Inconnu',
        output: { count: { $sum: 1 } }
      }
    }
  ]);

  // 10. Taux de présence (consultations vs absences)
  const appointmentStatusDistribution = await Patient.aggregate([
    { $match: { doctor: new mongoose.Types.ObjectId(doctorId) } },
    { $unwind: '$appointments' },
    {
      $group: {
        _id: '$appointments.appointmentStatus',
        count: { $sum: 1 }
      }
    }
  ]);

  // 11. Patients les plus récents (derniers 30 jours)
  const recentPatientsCount = await Patient.countDocuments({
    doctor: doctorId,
    registrationDate: { $gte: new Date(new Date().setDate(now.getDate() - 30)) }
  });

  // 12. Moyenne de consultations par patient
  const avgConsultationsPerPatient = totalPatients > 0 
    ? ((consultationsThisYear[0]?.total || 0) / totalPatients).toFixed(2)
    : 0;

  res.status(200).json({
    success: true,
    stats: {
      // Statistiques générales
      totalPatients,
      recentPatientsCount,
      avgConsultationsPerPatient,
      
      // Consultations par période
      consultationsToday: consultationsToday[0]?.total || 0,
      consultationsThisWeek: consultationsThisWeek[0]?.total || 0,
      consultationsThisMonth: consultationsThisMonth[0]?.total || 0,
      consultationsThisYear: consultationsThisYear[0]?.total || 0,
      
      // Distributions
      genderDistribution,
      ageDistribution,
      appointmentStatusDistribution: appointmentStatusDistribution.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      
      // Évolutions temporelles
      last7DaysConsultations,
      last12MonthsConsultations,
      last52WeeksConsultations,
      consultationsByYear
    }
  });
});