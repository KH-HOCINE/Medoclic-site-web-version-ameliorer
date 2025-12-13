import mongoose from "mongoose";

const trashItemSchema = new mongoose.Schema({
  originalId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  itemType: {
    type: String,
    required: true,
    enum: [
      'patient',
      'appointment', 
      'medicament',
      'prescription',
      'bilan',
      'certificat',
      'justification',
      'lettre',
      'note',
      'medicalFile'
    ]
  },
  originalData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deletedAt: {
    type: Date,
    default: Date.now
  },
  patientName: String,
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient'
  },
  medicamentName: String,
  appointmentDate: Date,
  documentType: String,
  fileName: String
}, { 
  timestamps: true 
});

// Index pour optimiser les requêtes
trashItemSchema.index({ itemType: 1, deletedAt: -1 });
trashItemSchema.index({ patientId: 1 });
trashItemSchema.index({ deletedBy: 1 });
trashItemSchema.index({ deletedAt: -1 });

export default mongoose.model("TrashItem", trashItemSchema);