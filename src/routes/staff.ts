import express from "express";
import { createStaff } from "../controllers/staffControllers.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

// router.post('/staff', authenticate, authorize("Owner"), createStaff);

export default router;