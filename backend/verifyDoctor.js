import mongoose from 'mongoose';
import User from './models/userSchema.js';
import { sendEmail } from './utils/sendEmail.js';
import dotenv from 'dotenv';

dotenv.config();

const verifyDoctor = async (userId) => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log("Connecté à MongoDB");
    
    const user = await User.findById(userId);
    if (!user) {
      console.error("Utilisateur non trouvé");
      return;
    }

    if (user.isVerified) {
      console.log("Le compte est déjà vérifié");
      return;
    }

    user.isVerified = true;
    await user.save();
    
    // Envoyer un email de confirmation au médecin
    await sendEmail({
      email: user.email,
      subject: "Votre compte Medoclic est activé !",
      message: `
        Bonjour Dr ${user.lastName},
        
        Votre compte a été vérifié et activé avec succès.
        Vous pouvez désormais vous connecter à votre espace Medoclic.
        
        Cordialement,
        L'équipe Medoclic
      `
    });

    console.log(`Compte ${user.email} vérifié avec succès !`);
  } catch (error) {
    console.error("Erreur lors de la vérification:", error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
};

verifyDoctor(process.argv[2]);