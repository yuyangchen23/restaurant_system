import { AppError } from "../errors/AppError.js";
import { Prisma, ReservationStatus } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { allowedTransitions, findReservationById } from "./reservationServices.js";
import { getTable } from "./tableServices.js";

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

export const createSession = async (
  tableId: string,
  partySize: number,
  reservationId?: string,
) => {
  const table = await getTable(tableId);
  if (!table || !table.isActive) {
    throw new AppError(404, "Table not found.");
  }

  if (reservationId) {
    const reservation = await findReservationById(reservationId);
    
    if (!reservation) {
      throw new AppError(404, "Reservation not found.");
    }

    if (reservation.tableId !== tableId) {
      throw new AppError(400, "The table is linked to another reservation.");
    }
  }

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
      error.code === "P2002"
    ) {
      throw new AppError(400, "The dining session has already created.");
    }
    throw error;
  }
};

export const closeSession = async (
  sessionId: string,
  outcome: ReservationStatus,
) => {

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
      return await tx.diningSession.update({
        where: {
          id: session.id,
          closeAt: null,
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
