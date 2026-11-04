import { Request, Response } from "express";
import {
  getAllItems,
  addItem,
  getItem,
  updateItem,
  updateItemAvailById,
  deleteItem,
} from "../services/menuServices.js";
import { AppError } from "../errors/AppError.js";

export const getMenus = async (req: Request, res: Response) => {
  const data = await getAllItems();
  res.status(200).json({
    success: true,
    data,
  });
};

export const addItemToMenu = async (req: Request, res: Response) => {
  const { name, description, price, isAvailable } = req.body;

  if (!name || !name?.trim() || !price || typeof price !== "number") {
    throw new AppError(400, "Please provide proper item name and price.");
  }

  if (isAvailable !== undefined && typeof isAvailable !== "boolean") {
    throw new AppError(400, "Availability must be a boolean.");
  }

  const item = await addItem(name, description, price, isAvailable);

  res.json({
    success: true,
    data: item,
  });
};

export const getItemById = async (req: Request, res: Response) => {
  const id = req.params.id;

  if (!id || typeof id !== "string") {
    throw new AppError(400, "Please provide a valid item id.");
  }

  const item = await getItem(id);

  if (!item) {
    throw new AppError(409, "The item does not exist");
  }

  res.status(200).json({
    success: true,
    data: item,
  });
};

export const updateItemById = async (req: Request, res: Response) => {
  const id = req.params.id;
  const { name, description, price } = req.body;

  if (!id || typeof id !== "string") {
    throw new AppError(400, "Please provide a valid ID.");
  }

  if (name !== undefined && typeof name !== "string") {
    throw new AppError(400, "Please provide a valid name.");
  }

  if (description !== undefined && typeof description !== "string") {
    throw new AppError(400, "Please provide a valid description.");
  }

  if (price !== undefined && typeof price !== "number") {
    throw new AppError(400, "Please provide a valid price.");
  }

  const item = await updateItem(id, name, description, price);

  return res.status(200).json({
    success: true,
    data: {
      item,
    },
  });
};

export const updateItemAvail = async (req: Request, res: Response) => {
  const id = req.params.id;
  const { isAvailable } = req.body;

  if (!id || typeof id !== "string") {
    throw new AppError(400, "Please enter a valid id.");
  }

  if (typeof isAvailable !== "boolean") {
    throw new AppError(400, "Please enter a valid available type.");
  }

  const item = await updateItemAvailById(id, isAvailable);

  if (!item) {
    throw new AppError(404, "Item not found.");
  }

  res.status(200).json({
    success: true,
    data: item,
  });
};

export const deleteItemById = async (req: Request, res: Response) => {
  const id = req.params.id;

  if (!id || typeof id !== "string") {
    throw new AppError(400, "Please provide a valid id.");
  }

  const deletedItem = await deleteItem(id);

  if (!deletedItem) {
    throw new AppError(404, "Item not found.");
  }

  res.status(200).json({
    success: true,
    deletedItem,
  });
};
