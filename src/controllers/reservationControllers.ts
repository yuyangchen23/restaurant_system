import { Request, Response } from "express";
import {
  setReservationTimer,
  findFirstTable,
  setUpReservation,
  getAllReservations,
  updateReservationById,
  removeReservation,
  searchReservationByPhone,
  checkInCustomer,
} from "../services/reservationServices.js";
import { AppError } from "../errors/AppError.js";

export const createReservation = async (req: Request, res: Response) => {
  const { customerName, phone, partySize, startTime } = req.body;

  if (!startTime) {
    throw new AppError(401, "Please provide start time for your reservation.");
  }

  const endTime = setReservationTimer(startTime);

  // find the first table
  const table = await findFirstTable(partySize, startTime, endTime);

  if (!table) {
    throw new AppError(409, "All tables occupied. No empty tables for now.");
  }

  const reservation = await setUpReservation({
    customerName,
    phone,
    partySize,
    startTime,
    endTime,
    tableId: table.id,
  });

  res.status(200).json({
    success: true,
    data: reservation,
  });
};

export const getReservations = async (req: Request, res: Response) => {
  const reservations = await getAllReservations();

  return res.status(200).json({
    success: true,
    reservations,
  });
};

type UpdatedReservationInput = {
  customerName?: string;
  phone?: string;
  partySize?: number;
  startTime?: string;
};

export const updateReservation = async (req: Request, res: Response) => {
  const reservationId = req.params.id;
  const UpdatedReservationInput = req.body;

  if (!reservationId || typeof reservationId !== "string") {
    throw new AppError(400, "Please provide reservation ID");
  }

  const updatedReservation = await updateReservationById(
    reservationId,
    UpdatedReservationInput,
  );

  if (!updatedReservation) {
    throw new AppError(501, "Server down.");
  }

  res.status(200).json({
    success: true,
    data: updatedReservation,
  });
};

export const deleteReservation = async (req: Request, res: Response) => {
  const reservationId = req.params.id;

  if (!reservationId || typeof reservationId !== "string") {
    throw new AppError(400, "Invalid reservation ID");
  }

  const reservation = await removeReservation(reservationId);

  res.status(200).json({
    success: true,
    reservation,
  });
};

export const checkIn = async (req: Request, res: Response) => {
  const { phone } = req.body;
  const reservations = await searchReservationByPhone(phone);
  const reservation = reservations[0];

  if (!reservation) {
    throw new AppError(404, "No reservation found.");
  }

  if (reservations.length > 1) {
    throw new AppError(409, "Multiple reservations found.");
  }

  const checkedInReservation = await checkInCustomer(reservation.id);

  return res.status(200).json({
    success: true,
    checkedInReservation,
  });
};

export const closeSession = async () => {
  
}