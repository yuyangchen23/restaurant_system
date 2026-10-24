import "dotenv/config";
import { Request, Response } from "express";
import {
  createATable,
  getAllTables,
  getTable,
  updateTable,
} from "../services/tableServices.js";
import { AppError } from "../errors/AppError.js";

export const createTable = async (req: Request, res: Response) => {
  const { number, capacity } = req.body;
  const table = await createATable(number, capacity);

  res.status(200).json({
    success: true,
    message: "Table created",
    data: {
      number: table?.number,
      capacity: table?.capacity,
    },
  });
};

export const getTables = async (req: Request, res: Response) => {
  const tables = await getAllTables();

  return res.status(200).json({
    success: true,
    data: tables,
  });
};

export const getTableById = async (req: Request, res: Response) => {
  const id = req.params.id;

  if (!id || typeof id !== "string") {
    throw new AppError(401, "Invalid table id.");
  }

  const table = await getTable(id);

  res.status(200).json({
    success: true,
    data: table,
  });
};

export const updateTableByNumber = async (req: Request, res: Response) => {
  const { number, status } = req.body;

  if (!number || !status) {
    throw new AppError(400, "Please provide table number and status");
  }

  const table = await updateTable(number, status);

  res.status(200).json({
    success: true,
    data: table,
  });
};
