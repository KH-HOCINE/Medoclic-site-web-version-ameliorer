import { sendEmail } from "./utils/sendEmail.js";
import 'dotenv/config'; 
console.log("APP.JS LOG: Application démarrant...");
import express from "express";
import { dbConnection } from "./database/dbConnection.js";

import cookieParser from "cookie-parser";
import cors from "cors";

import { errorMiddleware } from "./middlewares/error.js";
import userRouter from "./router/userRouter.js";
import patientRouter from "./router/Patient.route.js";
import medicamentRouter from "./router/Medicament.route.js";
import trashRouter from "./router/Trash.route.js";

const app = express(); 
console.log("CORS Origin configured as:", process.env.DASHBOARD_URL);
console.log("OWNER_EMAIL:", process.env.OWNER_EMAIL);

app.use(
  cors({
    origin: [
      "https://medoclic-dashboard.vercel.app", // <<< METTEZ CETTE URL EXACTE
      // Si vous avez un domaine personnalisé comme 'https://medoclic.com', ajoutez-le aussi ici.
      "http://localhost:5173" // Pour les tests en local
    ],
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Gardez ceci pour les cookies
  })
);
// ... le reste du code reste inchangé

app.use(cookieParser());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));




app.use("/api/v1/user", userRouter);
app.use("/api/v1/patient", patientRouter);
app.use("/api/v1/medicament", medicamentRouter);
app.use("/api/v1/trash", trashRouter);

dbConnection();

app.use(errorMiddleware);

app.get("/testemail", async (req, res) => { // <<< AJOUTEZ CETTE ROUTE DE TEST
    try {
        await sendEmail({
            email: "mouloudka18392@gmail.com", // <<< METTEZ VOTRE EMAIL PERSONNEL ICI POUR RECEVOIR LE TEST
            subject: "Test Email Medoclic",
            message: "Ceci est un email de test de votre plateforme Medoclic. Il a été envoyé via Nodemailer.",
        });
        res.status(200).json({ success: true, message: "Email de test envoyé avec succès !" });
    } catch (error) {
        console.error("Erreur lors de l'envoi de l'email de test:", error);
        res.status(500).json({ success: false, message: `Échec de l'envoi de l'email de test: ${error.message}` });
    }
});

app.use(errorMiddleware); // Ceci doit rester la dernière ligne

export default app;