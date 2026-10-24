import "dotenv/config";
import { prisma } from "../lib/prisma.js";
import { Prisma } from "../generated/prisma/client.js";
import { AppError } from "../errors/AppError.js";

export const createATable = async (number: number, capacity: number) => {
  try {
    const table = await prisma.table.create({
      data: {
        number: number,
        capacity: capacity,
      },
      select: {
        number: true,
        capacity: true,
      },
    });

    return table;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new AppError(409, "A table with this number already exists");
    }
  }
};

export const getAllTables = async () => {
  return await prisma.table.findMany({
    select: {
      number: true,
      capacity: true,
      isActive: true,
    },
    orderBy: {
      number: "desc",
    },
  });
};

export const getTable = async (id: string) => {
  return await prisma.table.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      number: true,
      capacity: true,
      isActive: true,
    },
  });
};

export const updateTable = async (number: number, status: boolean) => {
  const table = await prisma.table.findUnique({
    where: {
      number,
    },
  });

  if (!table) {
    throw new AppError(400, "Table does not exist.");
  }

  if (!status) {
    throw new AppError(401, "Please provide the status of the table");
  }

  return await prisma.table.update({
    where: {
      number,
    },
    data: {
      isActive: status,
    },
  });
};
