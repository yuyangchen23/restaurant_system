import express from "express";
import { authenticate } from "../middleware/auth.js";
import { showCurrentSession, closeDiningSession } from "../controllers/diningSessionControllers.js";

const router = express.Router();

router.get('/:id/current-session', authenticate, showCurrentSession);
router.patch('/closeSession',authenticate, closeDiningSession);


export default router;