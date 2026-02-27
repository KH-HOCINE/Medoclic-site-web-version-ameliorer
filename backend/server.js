// server.js
import app from "./app.js";
import { startReminderJob } from "./scheduler/reminderScheduler.js";
import { dbConnection } from "./database/dbConnection.js";

dbConnection();

console.log("SERVER LOG: Tentative de démarrage du scheduler...");
try {
    startReminderJob();
    console.log("SERVER LOG: Scheduler démarré avec succès.");
} catch (error) {
    console.error("SERVER LOG: Erreur au démarrage du scheduler:", error);
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server listening at port ${PORT}`);
});