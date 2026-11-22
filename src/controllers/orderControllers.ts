import { Request, Response } from "express";
import { AppError } from "../errors/AppError.js";
import {
  createOrderById,
  orderItemInput,
  findOrderById,
  cancelOrderById,
} from "../services/orderServices.js";
import { Prisma } from "../generated/prisma/client.js";

export const validateOrderItems = (input: unknown): orderItemInput[] => {
  if (!Array.isArray(input) || input.length === 0) {
    throw new AppError(400, "Please order at least one item.");
  }

  const items: orderItemInput[] = [];

  for (const item of input) {
    if (item === null || typeof item !== "object" || Array.isArray(item)) {
      throw new AppError(400, "Each order object must be as an object.");
    }

    const { menuItemId, quantity } = item as Record<string, unknown>;

    if (!menuItemId || typeof menuItemId !== "string") {
      throw new AppError(400, "Please provide valid menu item IDs.");
    }

    if (
      typeof quantity !== "number" ||
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      throw new AppError(
        400,
        "Quantity must be greater than one for each item.",
      );
    }

    items.push({
      menuItemId: menuItemId.trim(),
      quantity,
    });
  }

  return items;
};

export const createOrder = async (req: Request, res: Response) => {
  const id = req.params.id;
  const { orderItems } = req.body;

  if (!id || typeof id !== "string") {
    throw new AppError(404, "Please provide a valid ID.");
  }

  const items = validateOrderItems(orderItems);
  const order = await createOrderById(id, items);

  if (!order) {
    throw new AppError(501, "Order not created. Please try again.");
  }

  return res.status(200).json({
    success: true,
    data: order,
  });
};

export const getOrderById = async (req: Request, res: Response) => {
  const id = req.params.id;

  if (!id || typeof id !== "string") {
    throw new AppError(404, "ID not found.");
  }

  const order = await findOrderById(id);

  if (!order) {
    throw new AppError(404, "Order not found.");
  }

  return res.status(200).json({
    success: true,
    data: order,
  });
};

// find an existing order and update items if customers require
// export const updateOrder = async (req: Request, res: Response) => {

// };

export const cancelOrder = async (req: Request, res: Response) => {
  const id = req.params.id;

  if (!id || typeof id !== "string") {
    throw new AppError(404, "ID not found.");
  }

  const cancelledOrder = await cancelOrderById(id);

  if (!cancelledOrder) {
    throw new AppError(404, "No order found.");
  }

  return res.status(200).json({
    success: true,
    data: cancelledOrder,
  });
};
