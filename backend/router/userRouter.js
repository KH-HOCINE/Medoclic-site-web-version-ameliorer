import express from "express";
import { 
  addNewAdmin, 
  getUserDetails, 
  login, 
  logoutAdmin,
  changePassword,
  forgotPassword, 
  resetPassword,
  updateProfile,
  updateProfilePhoto // AJOUT
} from "../controller/userController.js";

import { isAdminAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/login", login);
router.post("/admin/addnew", addNewAdmin);
router.get("/admin/me", isAdminAuthenticated, getUserDetails);
router.get("/admin/logout", isAdminAuthenticated, logoutAdmin);
router.put("/change-password", isAdminAuthenticated, changePassword);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.put("/profile", isAdminAuthenticated, updateProfile);
router.put("/profile-photo", isAdminAuthenticated, updateProfilePhoto); // NOUVELLE ROUTE

export default router;