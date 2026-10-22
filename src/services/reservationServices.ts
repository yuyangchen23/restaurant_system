import { prisma } from "../lib/prisma.js";
import { Prisma, Table } from "../generated/prisma/client.js";
import { AppError } from "../errors/AppError.js";

export const setReservationTimer = (originalDate: Date): Date => {
  const newDate = new Date(originalDate);

  newDate.setMinutes(newDate.getMinutes() + 90);

  return newDate;
};

export const findFirstTable = async (
  partySize: number,
  startTime: Date,
  endTime: Date,
) => {
  return await prisma.table.findFirst({
    where: {
      reservations: {
        none: {
          startTime: { lt: endTime },
          endTime: { gt: startTime },
          status: { in: ["PENDING", "CONFIRMED"] },
        },
      },
      capacity: {
        gte: partySize,
      },
    },
    orderBy: {
      capacity: "asc",
    },
  });
};

type ReservationInput = {
  customerName: string;
  phone: string;
  partySize: number;
  startTime: Date;
  endTime: Date;
  tableId: string;
};

// concurrency not implemented
export const setUpReservation = async (input: ReservationInput) => {
  try {
    const reservation = await prisma.reservation.create({
      data: input,
    });

    return reservation;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new AppError(401, "This reservation already exists.");
    }
  }
}