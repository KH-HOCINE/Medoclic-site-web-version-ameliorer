import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    arrivalTime: { type: Date, required: false }, // NOUVEAU CHAMP pour l'heure d'arrivée
    seenStatus: { type: Boolean, default: false }, // GARDÉ pour compatibilité
    // NOUVEAU CHAMP pour le statut détaillé
    appointmentStatus: { 
        type: String, 
        enum: ['En attente', 'Consulté', 'RDV annulé', 'RDV confirmé', 'Patient absent'],
        default: 'En attente'
    },
    emailReminderActive: {
        type: Boolean,
        default: false,
    },
    emailReminderTime: {
        type: String,
        enum: ['24h-before', 'manual-now', 'custom-date'],
        default: '24h-before',
        nullable: true,
    },
    customReminderDate: {
        type: Date,
        nullable: true,
    },
    emailReminderSent: {
        type: Boolean,
        default: false,
    },
    emailReminderSentAt: {
        type: Date,
        nullable: true,
    },
});

const patientSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    patientNumber: { type: String, required: false},
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { 
      type: String, 
      required: false,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Email invalide"]
    },
    address: { type: String, required: false },
    dob: { type: Date, required: false },
    weight: { type: Number, required: false },
    height: { type: Number, required: false },
    bloodGroup: { type: String, required: false },
    chronicDiseases: { type: String },
    pastSurgeries: { type: String },
    medicalFiles: [{
      url: String,
      addedDate: { type: Date, default: Date.now }
    }],
    profileImage: {
      url: String,
      addedDate: { type: Date, default: Date.now }
    },
    phoneNumber: { type: String, required: true },
    gender: {
      type: String,
      required: false,
      enum: ["Male", "Female", "Other"]
    },
    appointments: [appointmentSchema],
    
    certificats: [{
      date: Date,
      doctorName: String,
      doctor: {
        cabinetPhone: String,
        ordreNumber: String,
        cabinetAddress: String,
      },
      startDate: Date,
      endDate: Date,
      prolongationStart: Date,
      prolongationEnd: Date,
      returnDate: Date,
      arretJours: String,
      prolongationJours: String
    }],
    
    bilans: [{
      date: Date,
      doctorName: String,
      doctor: {
        cabinetPhone: String,
        ordreNumber: String,
        cabinetAddress: String,
      },
      tests: {
        groupageSanguin: { type: Boolean, default: false },
        fnsComplete: { type: Boolean, default: false },
        glycemieAJeun: { type: Boolean, default: false },
        hemoglobineGlyqueeHbA1c: { type: Boolean, default: false },
        hbpo: { type: Boolean, default: false },
        cholesterolTotalHDLLDL: { type: Boolean, default: false },
        triglycerides: { type: Boolean, default: false },
        ureeSanguine: { type: Boolean, default: false },
        acideUrique: { type: Boolean, default: false },
        bilirubineASATALAT: { type: Boolean, default: false },
        cpk: { type: Boolean, default: false },
        testosteronemie: { type: Boolean, default: false },
        prolactinemie: { type: Boolean, default: false },
        tauxHCG: { type: Boolean, default: false },
        psaTotal: { type: Boolean, default: false },
        psaLibre: { type: Boolean, default: false },
        phosphatasesAlcalines: { type: Boolean, default: false },
        tauxProthrombineTP: { type: Boolean, default: false },
        tckInr: { type: Boolean, default: false },
        vsCrpFibrinogene: { type: Boolean, default: false },
        ferSerique: { type: Boolean, default: false },
        ionogrammeSanguin: { type: Boolean, default: false },
        phosphoremie: { type: Boolean, default: false },
        magnesemie: { type: Boolean, default: false },
        ecbuAntibiogramme: { type: Boolean, default: false },
        chimieDesUrines: { type: Boolean, default: false },
        proteinurie24h: { type: Boolean, default: false },
        microalbuminurie: { type: Boolean, default: false },
        spermogramme: { type: Boolean, default: false },
        fshLh: { type: Boolean, default: false },
        tshT3T4: { type: Boolean, default: false },
        covid19Pcr: { type: Boolean, default: false },
        covid19Antigenique: { type: Boolean, default: false },
        covid19Serologique: { type: Boolean, default: false }
      },
      additionalTests: [String]
    }],
    
    justifications: [{
        date: Date,
        doctorName: String,
        doctor: {
          cabinetPhone: String,
          ordreNumber: String,
          cabinetAddress: String,
      },
        justificationText: String
    }],
    
    lettres: [{
      date: Date,
      doctorName: String,
      doctor: {
        cabinetPhone: String,
        ordreNumber: String,
        cabinetAddress: String,
      },
      letterType: String,
      contentText: String
    }],

    notes: [{
      date: Date,
      doctorName: String,
      doctor: {
        cabinetPhone: String,
        ordreNumber: String,
        cabinetAddress: String,
      },
      noteText: String
    }],

    prescriptions: [{
      date: Date,
      doctorName: String,
      doctor: {
        cabinetPhone: String,
        ordreNumber: String,
        cabinetAddress: String,
      },
      medications: [{
        medicamentId: mongoose.Schema.Types.ObjectId,
        nomCommercial: String,
        dosage: String,
        frequency: String,
        boxes: Number,
        duration: String,
        forme: String,        // AJOUTER CE CHAMP
        frequence: String,    // AJOUTER CE CHAMP
        duree: String,       
        note: String 
      }],
    }],
    
    registrationDate: { type: Date, default: Date.now }
    
  },
  { timestamps: true }
);

patientSchema.pre('save', async function(next) {
  if (!this.patientNumber) {
    const count = await this.constructor.countDocuments({ doctor: this.doctor });
    this.patientNumber = `P${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

export default mongoose.model("Patient", patientSchema);