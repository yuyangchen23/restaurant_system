import { Request, Response } from "express";
import { setReservationTimer, findFirstTable, setUpReservation } from "../services/reservationServices.js";
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

// export const getReservations = (req: Request, res: Response) => {

// };

// export const updateReservation = (req: Request, res: Response) => {};

// export const deleteReservation = (req: Request, res: Response) => {};
