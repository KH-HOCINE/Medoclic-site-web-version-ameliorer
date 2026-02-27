import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://medoclic-dashboard.vercel.app",
  "https://medoclic-site-web-version-ameliorer.vercel.app"
];

// Middleware CORS global
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Répondre immédiatement aux requêtes OPTIONS
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

// Body parsers
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