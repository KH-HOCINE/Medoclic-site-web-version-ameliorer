import mongoose from "mongoose";
import xlsx from "xlsx";
import Medicament from "./models/Medicament.model.js";

// === 1️⃣ Connexion MongoDB ===
const MONGO_URI = "mongodb://127.0.0.1:27017/ta_base_de_donnees";
await mongoose.connect(MONGO_URI);
console.log("✅ Connecté à MongoDB");

// === 2️⃣ Lecture du fichier Excel ===
const workbook = xlsx.readFile("./data/NOMENCLATURE-VERSION-OCTOBRE-2025.xlsx");
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const medicamentsData = xlsx.utils.sheet_to_json(sheet);
console.log(`📘 ${medicamentsData.length} lignes trouvées.`);

// === 3️⃣ Transformation ===
const medicaments = medicamentsData.map(row => ({
  nomCommercial: row["NOM DE MARQUE"]?.trim() || "Inconnu",
  nomScientifique: row["DÉNOMINATION COMMUNE INTERNATIONALE"]?.trim() || "",
  dosage: row["DOSAGE"]?.trim() || "",
  forme: (() => {
    const f = row["FORME"]?.toLowerCase() || "";
    if (f.includes("comprim")) return "Comprimé";
    if (f.includes("gélule")) return "Gélule";
    if (f.includes("sachet")) return "Sachet";
    if (f.includes("sirop")) return "Sirop";
    if (f.includes("ampoule")) return "Ampoule";
    if (f.includes("pommade")) return "Pommade";
    if (f.includes("crème")) return "Crème";
    if (f.includes("spray")) return "Spray";
    if (f.includes("suppositoire")) return "Suppositoire";
    if (f.includes("inject")) return "Solution injectable";
    return "Autre";
  })(),
  formeAutre: row["FORME"]?.trim() || "",
  voie: "Orale",
  classeTherapeutique: "Non spécifiée",
  description: ""
}));

// === 4️⃣ Insertion MongoDB ===
try {
  const inserted = await Medicament.insertMany(medicaments, { ordered: false });
  console.log(`✅ ${inserted.length} médicaments insérés avec succès !`);
} catch (err) {
  console.error("⚠️ Erreurs d'insertion :", err.writeErrors?.length || err);
}

await mongoose.connection.close();
console.log("🔒 Connexion MongoDB fermée.");
