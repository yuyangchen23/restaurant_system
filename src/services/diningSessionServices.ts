import { AppError } from "../errors/AppError.js";
import { Prisma, ReservationStatus } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { allowedTransitions } from "./reservationServices.js";

export const findCurrentSession = async (tableId: string) => {
  return await prisma.diningSession.findFirst({
    where: {
      tableId,
      closeAt: null,
    },
    include: {
      table: {
        select: {
          number: true,
        },
      },
    },
  });
};

export const isTableOccupied = async (tableId: string) => {
  const activeSession = await prisma.diningSession.findFirst({
    where: {
      tableId,
      closeAt: null,
    },
    select: {
      id: true,
    },
  });
  return activeSession !== null;
};

export const createDiningSession = async (
  tableId: string,
  partySize: number,
  reservationId: string,
) => {
  try {
    return await prisma.diningSession.create({
      data: {
        tableId,
        partySize,
        reservationId: reservationId ?? null,
      },
      select: {
        id: true,
        table: {
          select: {
            number: true,
          },
        },
        partySize: true,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "2002"
    ) {
      throw new AppError(400, "The dining session has already created.");
    }
  }
};

export const closeSession = async (
  sessionId: string,
  outcome: ReservationStatus,
) => {
  if (outcome !== "COMPLETED" && outcome !== "CANCELLED") {
    throw new AppError(400, "Outcome muse be COMPLETED or CANCELLED.");
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const session = await tx.diningSession.findUnique({
        where: {
          id: sessionId,
        },
        include: {
          reservation: true,
        },
      });

      if (!session) {
        throw new AppError(404, "Dining session not found.");
      }

      if (session.closeAt !== null) {
        throw new AppError(409, "Dining session has already closed.");
      }

      // update reservation's status
      const reservation = session.reservation;

      if (reservation) {
        if (!allowedTransitions[reservation.status].includes(outcome)) {
          throw new AppError(409, "Transition not allowed.");
        }

        await tx.reservation.update({
          where: {
            id: reservation.id,
            status: reservation.status,
          },
          data: {
            status: outcome,
          },
        });
      }

      // update dining session: closeAt
      await tx.diningSession.update({
        where: {
          id: session.id,
        },
        data: {
          closeAt: new Date(),
        },
      });
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new AppError(
        409,
        "The session or reservation changed. Refresh and try again.",
      );
    }
    throw error;
  }
};
