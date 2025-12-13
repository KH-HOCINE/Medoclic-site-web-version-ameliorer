import mongoose from "mongoose";

const medicamentSchema = new mongoose.Schema({
  // Nom du médicament
  nomCommercial: {
    type: String,
    required: [true, "Le nom commercial du médicament est requis"],
    trim: true
    // La contrainte "unique: true" a été enlevée d'ici
  },
  nomScientifique: {
    type: String,
    trim: true
  },
  
  // Dosage
  dosage: {
    type: String,
    required: [true, "Le dosage est requis"],
    trim: true
  },
  
  // Forme pharmaceutique
  forme: {
    type: String,
    required: [true, "La forme pharmaceutique est requise"],
    enum: [
      "Comprimé",
      "Gélule", 
      "Sachet",
      "Sirop",
      "Ampoule",
      "Pommade",
      "Crème",
      "Spray",
      "Suppositoire",
      "Solution injectable",
      "Autre"
    ]
  },
  formeAutre: {
    type: String,
    trim: true
  },
  
  // Voie d'administration
  voie: {
    type: String,
    required: [true, "La voie d'administration est requise"],
    enum: [
      "Orale",
      "Intraveineuse",
      "Intramusculaire",
      "Sous-cutanée",
      "Rectale",
      "Cutanée",
      "Nasale",
      "Oculaire",
      "Autre"
    ]
  },
  
  // Classe thérapeutique
  classeTherapeutique: {
    type: String,
    required: [true, "La classe thérapeutique est requise"],
    trim: true
  },
  
  // Description (optionnel)
  description: {
    type: String,
    trim: true
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// NOUVEAU : Crée un index unique basé sur la combinaison de ces 3 champs.
// Cela empêchera de créer un médicament avec le même nom, le même dosage ET la même forme.
medicamentSchema.index({ nomCommercial: 1, dosage: 1, forme: 1 }, { unique: true });


export default mongoose.model("Medicament", medicamentSchema);