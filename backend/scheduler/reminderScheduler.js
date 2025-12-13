// backend/scheduler/reminderScheduler.js
import cron from 'node-cron';
import Patient from '../models/Patient.model.js';
import User from '../models/userSchema.js';
import { sendEmail } from '../utils/sendEmail.js'; // Assurez-vous du bon chemin
import ErrorHandler from '../middlewares/error.js'; // Ou votre classe ErrorHandler


export const startReminderJob = () => {
    let job;
    
    job = cron.schedule('0 18 * * *', async () => { 
        console.log('SCHEDULER LOG: Démarrage de la tâche de rappel (24h avant le RDV)...');
        const now = new Date();
        const startOfTomorrow = new Date(now);
        startOfTomorrow.setDate(now.getDate() + 1);
        startOfTomorrow.setHours(0, 0, 0, 0);

        const endOfTomorrow = new Date(now);
        endOfTomorrow.setDate(now.getDate() + 1);
        endOfTomorrow.setHours(23, 59, 59, 999);

        try {
            const patientsToNotify = await Patient.find({
                'appointments.date': { $gte: startOfTomorrow, $lt: endOfTomorrow },
                'appointments.emailReminderSent': false,
                'appointments.emailReminderActive': true, // <<< FILTRE : SEULEMENT SI ACTIF
                'appointments.emailReminderTime': '24h-before', // <<< FILTRE : SEULEMENT SI CETTE OPTION EST CHOISIE
                email: { $exists: true, $ne: null, $ne: '' }
            })
            .select('firstName lastName email appointments.date appointments.emailReminderSent appointments.emailReminderActive appointments.emailReminderTime appointments.customReminderDate doctor')
            .populate('doctor', 'firstName lastName');

            console.log(`SCHEDULER LOG: ${patientsToNotify.length} patients trouvés pour rappel 24h.`);

            for (const patient of patientsToNotify) {
                for (const appointment of patient.appointments) {
                    if (
                        appointment.date >= startOfTomorrow &&
                        appointment.date < endOfTomorrow &&
                        !appointment.emailReminderSent &&
                        appointment.emailReminderActive &&
                        appointment.emailReminderTime === '24h-before' &&
                        patient.email
                    ) {
                        const rdvDate = appointment.date.toLocaleDateString('fr-FR');
                        const rdvTime = appointment.date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                        const doctorName = patient.doctor ? `Dr. ${patient.doctor.firstName} ${patient.doctor.lastName}` : 'votre médecin';

                        const emailSubject = `Rappel: Votre rendez-vous médical le ${rdvDate}`;
                        const emailMessage = `Bonjour ${patient.firstName} ${patient.lastName},\n\n` +
                                            `Ceci est un rappel pour votre rendez-vous avec ${doctorName} demain, le ${rdvDate} à ${rdvTime}.\n\n` +
                                            `Merci de vous présenter à l'heure.\n\n` +
                                            `Cordialement,\nVotre cabinet médical.`;

                        try {
                            await sendEmail({ email: patient.email, subject: emailSubject, message: emailMessage });
                            appointment.emailReminderSent = true;
                            appointment.emailReminderSentAt = new Date();
                            await patient.save();
                            console.log(`SCHEDULER LOG: Rappel 24h envoyé à ${patient.email} pour le RDV du ${rdvDate} à ${rdvTime}.`);
                        } catch (emailError) {
                            console.error(`SCHEDULER ERROR: Échec de l'envoi du rappel 24h à ${patient.email}:`, emailError);
                        }
                    }
                }
            }
            console.log('SCHEDULER LOG: Tâche de rappel des rendez-vous terminée.');
        } catch (error) {
            console.error('SCHEDULER ERROR: Erreur lors de l\'exécution de la tâche de rappel 24h:', error);
        }
    }, {
        scheduled: true,
        timezone: "Africa/Algiers"
    });
    return job;
};
cron.schedule('* * * * *', async () => { // Toutes les 1 minute
    console.log('SCHEDULER LOG: Démarrage de la tâche de rappel (heure précise)...');
    const now = new Date();
    const next5Minutes = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes après maintenant

    try {
        const patientsToNotifyCustom = await Patient.find({
            'appointments.customReminderDate': { $lte: next5Minutes }, // Si la date personnalisée est passée ou dans les 5min
            'appointments.emailReminderSent': false,
            'appointments.emailReminderActive': true,
            'appointments.emailReminderTime': 'custom-date', // SEULEMENT SI CETTE OPTION
            email: { $exists: true, $ne: null, $ne: '' }
        })
        .select('firstName lastName email appointments.date appointments.emailReminderSent appointments.emailReminderActive appointments.emailReminderTime appointments.customReminderDate doctor')
        .populate('doctor', 'firstName lastName');

        console.log(`SCHEDULER LOG: ${patientsToNotifyCustom.length} patients trouvés pour rappel heure précise.`);

        for (const patient of patientsToNotifyCustom) {
            for (const appointment of patient.appointments) {
                if (
                    appointment.emailReminderActive &&
                    appointment.emailReminderTime === 'custom-date' &&
                    appointment.customReminderDate &&
                    appointment.customReminderDate <= next5Minutes &&
                    !appointment.emailReminderSent &&
                    patient.email
                ) {
                    const rdvDate = appointment.date.toLocaleDateString('fr-FR');
                    const rdvTime = appointment.date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                    const doctorName = patient.doctor ? `Dr. ${patient.doctor.firstName} ${patient.doctor.lastName}` : 'votre médecin';

                    const emailSubject = `Rappel Important: Votre rendez-vous médical le ${rdvDate}`;
                    const emailMessage = `Bonjour ${patient.firstName} ${patient.lastName},\n\n` +
                                        `Ceci est un rappel personnalisé pour votre rendez-vous avec ${doctorName} le ${rdvDate} à ${rdvTime}.\n\n` +
                                        `Il a été programmé pour vous être envoyé maintenant.\n\n` +
                                        `Cordialement,\nVotre cabinet médical.`;

                    try {
                        await sendEmail({ email: patient.email, subject: emailSubject, message: emailMessage });
                        appointment.emailReminderSent = true;
                        appointment.emailReminderSentAt = new Date();
                        await patient.save();
                        console.log(`SCHEDULER LOG: Rappel personnalisé envoyé à ${patient.email} pour RDV du ${rdvDate} à ${rdvTime}.`);
                    } catch (emailError) {
                        console.error(`SCHEDULER ERROR: Échec de l'envoi du rappel personnalisé à ${patient.email}:`, emailError);
                    }
                }
            }
        }
        console.log('SCHEDULER LOG: Tâche de rappel heure précise terminée.');
    } catch (error) {
        console.error('SCHEDULER ERROR: Erreur lors de l\'exécution de la tâche de rappel heure précise:', error);
    }
}, { scheduled: true, timezone: "Africa/Algiers" });