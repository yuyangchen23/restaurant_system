import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { createReservation, getReservations, updateReservation, deleteReservation } from '../controllers/reservationControllers.js';

const router = express.Router();

router.post('/createReservation', authenticate, authorize("Staff", "Manager", "Owner"), createReservation);
router.get('/getReservations', authenticate, authorize("Staff", "Manager", "Owner"), getReservations);
router.patch('/updateReservation/:id', authenticate, authorize("Staff", "Manager", "Owner"), updateReservation);
router.delete('/deleteReservation/:id', authenticate, authorize("Staff", "Manager", "Owner"), deleteReservation);
router.patch('/checkIn', authenticate, )

export default router;