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

// === CORS GLOBAL ===
const allowedOrigins = [
  "http://localhost:5173", // Local dev
  "https://medoclic-dashboard.vercel.app", // Dashboard frontend
  "https://medoclic-site-web-version-ameliorer.vercel.app" // Frontend principal
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

// === BODY PARSERS & COOKIE PARSER ===
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use(cookieParser());

// === ROUTE DE TEST DU BACKEND ===
app.get("/", (req, res) => {
  res.send("Backend Medoclic fonctionne ✅");
});

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
app.use(errorMiddleware); // Toujours en dernier

export default app;