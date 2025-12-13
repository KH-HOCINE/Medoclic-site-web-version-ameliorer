import TrashItem from "../models/Trash.model.js";
import Patient from "../models/Patient.model.js";
import Medicament from "../models/Medicament.model.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import mongoose from "mongoose";

// Fonction utilitaire pour calculer l'âge
const calculateAge = (dob) => {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Récupérer tous les éléments de la corbeille
export const getTrashItems = catchAsyncErrors(async (req, res, next) => {
  const { 
    page = 1, 
    limit = 20, 
    itemType, 
    search,
    startDate,
    endDate 
  } = req.query;

  const query = { deletedBy: req.user._id };

  if (itemType && itemType !== 'all') {
    query.itemType = itemType;
  }

  if (startDate || endDate) {
    query.deletedAt = {};
    if (startDate) query.deletedAt.$gte = new Date(startDate);
    if (endDate) query.deletedAt.$lte = new Date(endDate);
  }

  if (search) {
    query.$or = [
      { patientName: { $regex: search, $options: 'i' } },
      { medicamentName: { $regex: search, $options: 'i' } },
      { fileName: { $regex: search, $options: 'i' } },
      { documentType: { $regex: search, $options: 'i' } }
    ];
  }

  const trashItems = await TrashItem.find(query)
    .sort({ deletedAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('deletedBy', 'firstName lastName');

  // Enrichir les données avec les informations du patient
  const enrichedTrashItems = await Promise.all(
    trashItems.map(async (item) => {
      try {
        // Pour les éléments liés à un patient
        if (item.originalData.patientId) {
          const patient = await Patient.findById(item.originalData.patientId)
            .select('firstName lastName patientNumber dob gender');
          
          if (patient) {
            const enrichedItem = item.toObject();
            enrichedItem.originalData.patient = {
              firstName: patient.firstName,
              lastName: patient.lastName,
              patientNumber: patient.patientNumber,
              dob: patient.dob,
              gender: patient.gender,
              age: calculateAge(patient.dob)
            };
            return enrichedItem;
          }
        }
        
        // Pour les patients eux-mêmes
        if (item.itemType === 'patient') {
          const enrichedItem = item.toObject();
          enrichedItem.originalData.age = calculateAge(item.originalData.dob);
          return enrichedItem;
        }
        
        return item;
      } catch (error) {
        console.error('Erreur lors de l\'enrichissement des données:', error);
        return item;
      }
    })
  );

  const total = await TrashItem.countDocuments(query);

  res.status(200).json({
    success: true,
    trashItems: enrichedTrashItems,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    total
  });
});

// Restaurer un élément
export const restoreTrashItem = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const trashItem = await TrashItem.findById(id);
  
  if (!trashItem) {
    return next(new ErrorHandler("Élément non trouvé dans la corbeille", 404));
  }

  if (trashItem.deletedBy.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Non autorisé à restaurer cet élément", 403));
  }

  let restoredItem;

  try {
    switch (trashItem.itemType) {
      case 'patient':
        const existingPatient = await Patient.findById(trashItem.originalId);
        if (existingPatient) {
          return next(new ErrorHandler("Un patient avec cet ID existe déjà", 400));
        }
        restoredItem = await Patient.create(trashItem.originalData);
        break;

      case 'medicament':
        const existingMedicament = await Medicament.findById(trashItem.originalId);
        if (existingMedicament) {
          return next(new ErrorHandler("Un médicament avec cet ID existe déjà", 400));
        }
        restoredItem = await Medicament.create(trashItem.originalData);
        break;

      case 'appointment':
      case 'prescription':
      case 'bilan':
      case 'certificat':
      case 'justification':
      case 'lettre':
      case 'note':
        const patient = await Patient.findById(trashItem.originalData.patientId);
        if (!patient) {
          return next(new ErrorHandler("Patient non trouvé pour la restauration", 404));
        }

        const documentData = { ...trashItem.originalData.document };
        delete documentData._id;

        switch (trashItem.itemType) {
          case 'appointment':
            patient.appointments.push(documentData);
            break;
          case 'prescription':
            patient.prescriptions.push(documentData);
            break;
          case 'bilan':
            patient.bilans.push(documentData);
            break;
          case 'certificat':
            patient.certificats.push(documentData);
            break;
          case 'justification':
            patient.justifications.push(documentData);
            break;
          case 'lettre':
            patient.lettres.push(documentData);
            break;
          case 'note':
            patient.notes.push(documentData);
            break;
        }

        await patient.save();
        restoredItem = documentData;
        break;

      case 'medicalFile':
        const patientForFile = await Patient.findById(trashItem.originalData.patientId);
        if (!patientForFile) {
          return next(new ErrorHandler("Patient non trouvé pour la restauration du fichier", 404));
        }
        patientForFile.medicalFiles.push(trashItem.originalData.file);
        await patientForFile.save();
        restoredItem = trashItem.originalData.file;
        break;

      default:
        return next(new ErrorHandler("Type d'élément non supporté", 400));
    }

    await TrashItem.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Élément restauré avec succès",
      restoredItem
    });

  } catch (error) {
    return next(new ErrorHandler(`Erreur lors de la restauration: ${error.message}`, 500));
  }
});

// Supprimer définitivement un élément
export const deleteTrashItemPermanently = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const trashItem = await TrashItem.findById(id);
  
  if (!trashItem) {
    return next(new ErrorHandler("Élément non trouvé dans la corbeille", 404));
  }

  if (trashItem.deletedBy.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Non autorisé à supprimer cet élément", 403));
  }

  await TrashItem.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Élément supprimé définitivement"
  });
});

// Vider toute la corbeille
export const emptyTrash = catchAsyncErrors(async (req, res, next) => {
  const { itemType } = req.body;

  const query = { deletedBy: req.user._id };
  if (itemType && itemType !== 'all') {
    query.itemType = itemType;
  }

  await TrashItem.deleteMany(query);

  res.status(200).json({
    success: true,
    message: "Corbeille vidée avec succès"
  });
});

// Obtenir les statistiques de la corbeille
export const getTrashStats = catchAsyncErrors(async (req, res, next) => {
  try {
    const stats = await TrashItem.aggregate([
      {
        $match: { deletedBy: new mongoose.Types.ObjectId(req.user._id) }
      },
      {
        $group: {
          _id: '$itemType',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalItems = await TrashItem.countDocuments({ deletedBy: req.user._id });

    res.status(200).json({
      success: true,
      stats: {
        byType: stats,
        totalItems
      }
    });
  } catch (error) {
    return next(new ErrorHandler(`Erreur lors du chargement des statistiques: ${error.message}`, 500));
  }
});