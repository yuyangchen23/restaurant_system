import express from "express"
import { login, logout, ownerCred } from "../controllers/authControllers.js";

const router = express.Router();

router.post('/login', login);
router.post('/logout', logout);

router.get('/owner', ownerCred);

export default router;