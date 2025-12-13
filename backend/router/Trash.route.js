// routes/Trash.route.js
import express from "express";
import { 
  getTrashItems,
  restoreTrashItem,
  deleteTrashItemPermanently,
  emptyTrash,
  getTrashStats
} from "../controller/Trash.controller.js";
import { isAdminAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", isAdminAuthenticated, getTrashItems);
router.get("/stats", isAdminAuthenticated, getTrashStats);
router.put("/restore/:id", isAdminAuthenticated, restoreTrashItem);
router.delete("/permanent/:id", isAdminAuthenticated, deleteTrashItemPermanently);
router.delete("/empty", isAdminAuthenticated, emptyTrash);

export default router;