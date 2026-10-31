import { Request, Response } from "express";
import { AppError } from "../errors/AppError.js";
import {
  findCurrentSession,
  createSession,
  closeSession,
} from "../services/diningSessionServices.js";

// show table session
export const showCurrentSession = async (req: Request, res: Response) => {
  const tableId = req.params.id;

  if (!tableId || typeof tableId !== "string") {
    throw new AppError(404, "Table not found.");
  }

  const diningSession = await findCurrentSession(tableId);

  res.status(200).json({
    success: true,
    data: diningSession,
  });
};

export const createDiningSession = async (req: Request, res: Response) => {
  const tableId = req.params.id;
  const { partySize, reservationId } = req.body;

  if (partySize <= 0) {
    throw new AppError(400, "Please enter a valid number.");
  }

  if (!tableId || typeof tableId !== "string") {
    throw new AppError(400, "Please provide table ID.");
  }

  if (
    reservationId !== undefined &&
    (typeof reservationId !== "string" || !reservationId.trim())
  ) {
    throw new AppError(400, "Invalid reservation ID.");
  }

  const diningSession = await createSession(tableId, partySize, reservationId);

  if (!diningSession) {
    throw new AppError(501, "Internal error");
  }

  res.status(200).json({
    success: true,
    diningSession,
  });
};

export const closeDiningSession = async (req: Request, res: Response) => {
  // close session
  const sessionId = req.params.id;
  const { outcome } = req.body;

  if (!sessionId || typeof sessionId !== "string") {
    throw new AppError(400, "Please provide correct session ID.");
  }

  if (outcome !== "COMPLETED" && outcome !== "CANCELLED") {
    throw new AppError(400, "Outcome muse be COMPLETED or CANCELLED.");
  }

  const session = await closeSession(sessionId, outcome);

  res.status(200).json({
    success: true,
    session,
  });
};
