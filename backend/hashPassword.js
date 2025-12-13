import bcrypt from "bcrypt";

const hashPassword = async () => {
  const password = "admin123@"; // Remplace par ton vrai mot de passe
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log("Mot de passe haché :", hashedPassword);
};

hashPassword();

