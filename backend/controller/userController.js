import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import User from "../models/userSchema.js";
import ErrorHandler from "../middlewares/error.js";
import { generateToken } from "../utils/jwtToken.js";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";

export const login = catchAsyncErrors(async (req, res, next) => {
  console.log("BACKEND LOGIN LOG: --- DÉBUT TENTATIVE DE CONNEXION ---");
  const { email, password } = req.body;

  console.log("BACKEND LOGIN LOG: Email reçu:", email);
  console.log("BACKEND LOGIN LOG: Mot de passe reçu (masqué):", password ? "[Reçu]" : "[Manquant]");

  if (!email || !password) {
    console.error("BACKEND LOGIN LOG: ERREUR - Email ou mot de passe manquant dans la requête.");
    return next(new ErrorHandler("Veuillez remplir tous les champs", 400));
  }

  console.log("BACKEND LOGIN LOG: Recherche utilisateur par email:", email);
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (!user) {
    console.error("BACKEND LOGIN LOG: ERREUR - Utilisateur non trouvé pour l'email:", email);
    return next(new ErrorHandler("Identifiants incorrects", 401));
  }
  console.log("BACKEND LOGIN LOG: Utilisateur trouvé dans DB:", user.email, "ID:", user._id);

  console.log("BACKEND LOGIN LOG: Début comparaison mot de passe...");
  const isPasswordMatch = await user.comparePassword(password);
  console.log("BACKEND LOGIN LOG: Résultat comparaison mot de passe:", isPasswordMatch ? "Correspond" : "Ne Correspond PAS");

  if (!isPasswordMatch) {
    console.error("BACKEND LOGIN LOG: ERREUR - Mot de passe incorrect pour l'utilisateur:", user.email);
    return next(new ErrorHandler("Identifiants incorrects", 401));
  }

  // Vérifier si le compte est vérifié
  if (!user.isVerified) {
    console.error("BACKEND LOGIN LOG: ERREUR - Compte non vérifié pour l'utilisateur:", user.email);
    return next(new ErrorHandler("Votre compte n'a pas encore été vérifié par l'administrateur. Vous recevrez un email une fois activé.", 401));
  }

  console.log("BACKEND LOGIN LOG: Mot de passe vérifié, connexion réussie.");
  generateToken(user, "Connexion réussie!", 200, res);
  console.log("BACKEND LOGIN LOG: Token généré et cookie envoyé.");
  console.log("BACKEND LOGIN LOG: --- FIN TENTATIVE DE CONNEXION ---");
});

export const addNewAdmin = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, cabinetAddress, cabinetPhone, ordreNumber, specialite, password, profilePhoto } = req.body;

  const requiredFields = ['firstName', 'lastName', 'email', 'cabinetAddress', 'cabinetPhone', 'ordreNumber', 'specialite', 'password'];
  const missingFields = requiredFields.filter(field => !req.body[field]);
  
  if (missingFields.length > 0) {
    return next(new ErrorHandler(`Champs manquants : ${missingFields.join(', ')}`, 400));
  }

  const existingAdmin = await User.findOne({ email });
  if (existingAdmin) {
    return next(new ErrorHandler("Cet email est déjà utilisé", 400));
  }

  const admin = await User.create({
    firstName,
    lastName,
    email,
    cabinetAddress,
    cabinetPhone,
    ordreNumber,
    specialite,
    password,
    profilePhoto: profilePhoto || null, // AJOUT
    role: "Admin",
    isVerified: false,
  });

  // Envoi d'un email au propriétaire (vous) pour vérification
  const ownerEmail = process.env.OWNER_EMAIL;
  if (!ownerEmail) {
    console.error("OWNER_EMAIL non défini dans les variables d'environnement");
  } else {
    try {
      await sendEmail({
        email: ownerEmail,
        subject: "Nouveau médecin en attente de vérification",
        message: `
          Un nouveau médecin a demandé à s'inscrire sur Medoclic.
          Détails:
          - Prénom: ${firstName}
          - Nom: ${lastName}
          - Email: ${email}
          - Cabinet: ${cabinetAddress}
          - Téléphone: ${cabinetPhone}
          - Numéro d'ordre: ${ordreNumber}
          - Spécialité: ${specialite}
          
          Pour vérifier ce compte, veuillez mettre à jour manuellement le champ 'isVerified' à true pour l'utilisateur avec l'ID: ${admin._id} dans la base de données.
        `
      });
      console.log(`Email de notification envoyé au propriétaire (${ownerEmail})`);
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email au propriétaire:", error);
    }
  }

  // Envoi d'un email au médecin pour l'informer que son compte est en attente
  try {
    await sendEmail({
      email: email,
      subject: "Votre compte Medoclic est en cours de vérification",
      message: `
        Bonjour Dr ${lastName},
        
        Votre compte a bien été créé mais nécessite une vérification manuelle par notre équipe.
        Vous recevrez un email de confirmation une fois votre compte activé.
        
        Merci pour votre patience,
        L'équipe Medoclic
      `
    });
    console.log(`Email d'attente envoyé au médecin (${email})`);
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email au médecin:", error);
  }

  res.status(201).json({
    success: true,
    message: "Compte créé. En attente de vérification par l'administrateur.",
    admin: {
      _id: admin._id,
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      role: admin.role,
      isVerified: admin.isVerified,
      createdAt: admin.createdAt
    }
  });
});

export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;
  const userWithoutPassword = user.toObject();
  delete userWithoutPassword.password;
  console.log("BACKEND LOG (getUserDetails): User object sent to frontend:", userWithoutPassword);
  res.status(200).json({ success: true, user: userWithoutPassword });
});

export const logoutAdmin = catchAsyncErrors(async (req, res, next) => { 
  res.status(200)
    .clearCookie("adminToken", {
      secure: true,
      sameSite: 'none',
    })
    .json({ success: true, message: "Déconnexion réussie" });
});

export const changePassword = catchAsyncErrors(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  
  if (!oldPassword || !newPassword) {
    return next(new ErrorHandler("Veuillez remplir tous les champs", 400));
  }

  const user = await User.findById(req.user.id).select("+password");
  
  const isPasswordMatch = await user.comparePassword(oldPassword);
  if (!isPasswordMatch) {
    return next(new ErrorHandler("Ancien mot de passe incorrect", 400));
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Mot de passe mis à jour avec succès"
  });
});

export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;
  
  if (!email) {
    return next(new ErrorHandler("Veuillez fournir votre email", 400));
  }

  const user = await User.findOne({ email });
  
  if (!user) {
    return next(new ErrorHandler("Utilisateur non trouvé", 404));
  }

  const resetToken = crypto.randomBytes(20).toString("hex");
  
  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
    
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  
  await user.save();

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Réinitialisation de votre mot de passe Medoclic",
      message: `
        Bonjour Dr ${user.lastName},
        Vous avez demandé une réinitialisation de mot de passe.
        Code de vérification : ${resetToken}
        Ou cliquez sur ce lien :
        <a href="${resetUrl}">${resetUrl}</a>
        Ce code expirera dans 15 minutes.
      `
    });

    res.status(200).json({
      success: true,
      message: `Email envoyé à ${user.email}`
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    return next(new ErrorHandler("Échec d'envoi de l'email", 500));
  }
});

export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new ErrorHandler("Token invalide ou expiré", 400));
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  
  await user.save();

  res.status(200).json({
    success: true,
    message: "Mot de passe mis à jour avec succès"
  });
});

export const updateProfile = catchAsyncErrors(async (req, res, next) => {
  const { email, cabinetAddress, cabinetPhone } = req.body;

  // Vérifier que l'email n'est pas déjà utilisé par un autre utilisateur
  if (email && email !== req.user.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ErrorHandler("Cet email est déjà utilisé", 400));
    }
  }

  const updatedData = {};
  if (email) updatedData.email = email;
  if (cabinetAddress) updatedData.cabinetAddress = cabinetAddress;
  if (cabinetPhone) updatedData.cabinetPhone = cabinetPhone;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    updatedData,
    { 
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    message: "Profil mis à jour avec succès",
    user: {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      cabinetAddress: user.cabinetAddress,
      cabinetPhone: user.cabinetPhone,
      ordreNumber: user.ordreNumber,
      specialite: user.specialite,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt
    }
  });
});

export const updateProfilePhoto = catchAsyncErrors(async (req, res, next) => {
  const { profilePhoto } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { profilePhoto },
    { 
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    message: profilePhoto ? "Photo de profil mise à jour avec succès" : "Photo de profil supprimée avec succès",
    user: {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      cabinetAddress: user.cabinetAddress,
      cabinetPhone: user.cabinetPhone,
      ordreNumber: user.ordreNumber,
      specialite: user.specialite,
      role: user.role,
      profilePhoto: user.profilePhoto,
      isVerified: user.isVerified,
      createdAt: user.createdAt
    }
  });
});