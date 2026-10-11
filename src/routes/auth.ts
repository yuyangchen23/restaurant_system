import express from "express"
import { register, login, ownerCred } from "../controllers/authControllers.js";

const router = express.Router();

// router.post('/register', register);
router.post('/login', login);
router.get('/owner', ownerCred);

export default router;