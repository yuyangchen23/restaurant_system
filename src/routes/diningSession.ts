import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { showCurrentSession, closeDiningSession, createDiningSession } from "../controllers/diningSessionControllers.js";

const router = express.Router();

router.post('/createSession/:id', authenticate, authorize("Staff", "Manager", "Owner"), createDiningSession);
router.get('/:id/current-session', authenticate, authorize("Staff", "Manager", "Owner"), showCurrentSession);
router.patch('/closeSession/:id',authenticate, authorize("Staff", "Manager", "Owner"), closeDiningSession);


export default router;