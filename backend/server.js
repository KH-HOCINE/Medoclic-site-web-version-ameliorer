import app from "./app.js";
import { startReminderJob } from "./scheduler/reminderScheduler.js";
import { dbConnection } from "./database/dbConnection.js";

dbConnection();
console.log("SERVER LOG: Tentative de démarrage du scheduler..."); // <<< AJOUTÉ POUR DÉBOGAGE
try {
    startReminderJob(); // <<< VÉRIFIEZ QUE CET APPEL EST PRÉSENT ET NON COMMENTÉ
    console.log("SERVER LOG: Scheduler démarré avec succès."); // <<< AJOUTÉ POUR DÉBOGAGE
} catch (error) {
    console.error("SERVER LOG: Erreur au démarrage du scheduler:", error); // <<< AJOUTÉ POUR DÉBOGAGE
}

app.listen(process.env.PORT, () => {
  console.log(`Server listening at port ${process.env.PORT}`);
});