import express from "express";
import { 
  addMedicament, 
  getAllMedicaments, 
  getMedicamentById, 
  updateMedicament, 
  deleteMedicament 
} from "../controller/Medicament.controller.js";
import { isAdminAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/add", isAdminAuthenticated, addMedicament);
router.get("/all", isAdminAuthenticated, getAllMedicaments);
router.get("/:id", isAdminAuthenticated, getMedicamentById);
router.put("/:id", isAdminAuthenticated, updateMedicament);
router.delete("/:id", isAdminAuthenticated, deleteMedicament);

export default router;