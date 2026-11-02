import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { getMenus, addItemToMenu, getItemById, updateItemById, updateItemAvail } from '../controllers/menuControllers.js';

const router = express.Router();

router.get('/items', getMenus);
router.post('/items', addItemToMenu);
router.get('/items/:id', getItemById);
router.patch('/items/:id', authenticate, authorize("Manager", "Owner"), updateItemById);
router.patch('/items/:id/availability', authenticate, authorize("Manager", "Owner"), updateItemAvail);


export default router;