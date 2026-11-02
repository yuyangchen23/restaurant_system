import { Decimal } from "@prisma/client/runtime/client";
import { prisma } from "../lib/prisma.js";
import { Prisma } from "../generated/prisma/client.js";
import { AppError } from "../errors/AppError.js";

export const getAllItems = async () => {
  return await prisma.menuItem.findMany({
    select: {
      name: true,
      description: true,
      price: true,
    },
  });
};

export const addItem = async (
  name: string,
  description: string,
  price: number,
  isAvailable: boolean = true,
) => {
  try {
    return await prisma.menuItem.create({
      data: {
        name,
        description,
        price,
        isAvailable,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new AppError(409, "The item already exists.");
    }
  }
};

export const getItem = async (id: string) => {
  return await prisma.menuItem.findUnique({
    where: {
      id,
    },
    select: {
      name: true,
      description: true,
      price: true,
    },
  });
};

export const updateItem = async (
  id: string,
  name?: string,
  description?: string | null,
  price?: number,
) => {
  const data: Prisma.MenuItemUpdateInput = {};

  if (name !== undefined) data.name = name;
  if (description !== undefined) data.description = description;
  if (price !== undefined) data.price = price;

  if (Object.keys(data).length === 0) {
    throw new AppError(400, "Please provide fields to update.");
  }

  return await prisma.menuItem.update({
    where: {
      id,
    },
    data,
  });
};

export const updateItemAvailById = async (id: string, isAvailable: boolean) => {
  return await prisma.menuItem.update({
    where: {
      id,
    },
    data: {
      isAvailable,
    },
  });
};
