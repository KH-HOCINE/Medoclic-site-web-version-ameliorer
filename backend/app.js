// app.js
import 'dotenv/config';
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import { dbConnection } from "./database/dbConnection.js";
import { sendEmail } from "./utils/sendEmail.js";

import { errorMiddleware } from "./middlewares/error.js";

import userRouter from "./router/userRouter.js";
import patientRouter from "./router/Patient.route.js";
import medicamentRouter from "./router/Medicament.route.js";
import trashRouter from "./router/Trash.route.js";

const app = express();
console.log("APP.JS LOG: Application démarrant...");

// === CORS ===
const allowedOrigins = [
  "http://localhost:5173", // local dev
  "https://medoclic-dashboard.vercel.app", // dashboard Vercel
  "https://medoclic-site-web-version-ameliorer.vercel.app", // frontend principal
];

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // nécessaire pour les cookies
}));

// Gestion des requêtes preflight OPTIONS
app.options("*", cors({
  origin: allowedOrigins,
  credentials: true
}));

// === Body parsers & cookie parser ===
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use(cookieParser());

// === ROUTES API ===
app.use("/api/v1/user", userRouter);
app.use("/api/v1/patient", patientRouter);
app.use("/api/v1/medicament", medicamentRouter);
app.use("/api/v1/trash", trashRouter);

// === ROUTE TEST EMAIL ===
app.get("/testemail", async (req, res) => {
  try {
    await sendEmail({
      email: "mouloudka18392@gmail.com", // ton email perso
      subject: "Test Email Medoclic",
      message: "Ceci est un email de test de votre plateforme Medoclic.",
    });
    res.status(200).json({ success: true, message: "Email de test envoyé !" });
  } catch (error) {
    console.error("Erreur test email:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// === DATABASE CONNECTION ===
dbConnection();

// === ERROR MIDDLEWARE ===
app.use(errorMiddleware); // TOUJOURS DERNIER

export default app;