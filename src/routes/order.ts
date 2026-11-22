import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { createOrder, getOrderById, cancelOrder } from "../controllers/orderControllers.js";

const router = express.Router();

router.post('/dining-sessions/:sessionId/orders', authenticate, authorize("Staff", "Manager", "Owner"), createOrder);
router.get('/:orderId', authenticate, authorize("Staff", "Manager", "Owner"), getOrderById);
router.patch('/:id/cancel', authenticate, authorize("Staff", "Manager", "Owner"), cancelOrder);

export default router;