import { Request, Response } from "express";
import { AppError } from "../errors/AppError.js";
import { findCurrentSession } from "../services/diningSessionServices.js";


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

}

export const closeDiningSession = async (req: Request, res: Response) => {
  // close session
}