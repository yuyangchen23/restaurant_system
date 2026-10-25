import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { createTable, getTables, getTableById, updateTableByNumber } from '../controllers/tablesControllers.js';

const router = express.Router();

router.post('/createTable', authenticate, authorize("Manager", "Owner"), createTable);
router.get('/getTables', authenticate, getTables);
router.get('/getTableById/:id', authenticate, getTableById);
router.patch('/updateTables', authenticate, authorize("Manager", "Owner"), updateTableByNumber);

export default router;