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

type AdaptorErrorDetails = {
  cause?: {
    originalCode?: string;
  };
};

export const setUpReservation = async (input: ReservationInput) => {
  if (!input.customerName || !/^[a-zA-Z\s-]+$/.test(input.customerName)) {
    throw new AppError(400, "Please enter a valid name.");
  }

  if (input.partySize < 0) {
    throw new AppError(400, "Party size can't be negative.");
  }

  if (!input.startTime) {
    throw new AppError(400, "Please select a time you'd like to reserve.");
  }

  try {
    return await prisma.reservation.create({
      data: input,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      const adaptorError = error.meta?.driverAdapterError as
        | AdaptorErrorDetails
        | undefined;

      if (adaptorError?.cause?.originalCode === "23P01") {
        throw new AppError(409, "This table is already reserved at this time");
      }
    }

    throw error;
  }
};

export const getAllReservations = async () => {
  return await prisma.reservation.findMany({
    include: {
      table: {
        select: {
          number: true,
        },
      },
    },
  });
};

type UpdatedReservationInput = {
  customerName?: string;
  phone?: string;
  partySize?: number;
  startTime?: string;
};

export const updateReservationById = async (
  reservationId: string,
  data: UpdatedReservationInput,
) => {
  const reservation = await prisma.reservation.findUnique({
    where: {
      id: reservationId,
    },
    select: {
      partySize: true,
      startTime: true,
      endTime: true,
      status: true,
      table: true,
    },
  });

  if (!reservation) {
    throw new AppError(404, "Reservation not found.");
  }

  if (
    reservation?.status === "CANCELLED" ||
    reservation?.status === "COMPLETED"
  ) {
    throw new AppError(400, "The reservation has been cancelled or completed.");
  }

  const changes: Partial<ReservationInput> = {};

  if (data.customerName !== undefined) {
    if (!data.customerName || !/^[a-zA-Z\s-]+$/.test(data.customerName)) {
      throw new AppError(400, "Please enter a valid name.");
    }

    changes.customerName = data.customerName;
  }

  if (data.phone !== undefined) {
    changes.phone = data.phone;
  }

  if (data.startTime !== undefined) {
    changes.startTime = new Date(data.startTime);
    changes.endTime = setReservationTimer(changes.startTime);
  }

  if (data.partySize !== undefined) {
    if (data.partySize < 0) {
      throw new AppError(400, "Party size can't be negative.");
    }
    changes.partySize = data.partySize;

    if (changes.partySize !== reservation.partySize) {
      const table = await findFirstTable(
        changes.partySize,
        changes.startTime === undefined
          ? reservation.startTime
          : changes.startTime,
        changes.endTime === undefined ? reservation.endTime : changes.endTime,
      );

      if (!table) {
        if (changes.partySize > reservation.table.capacity) {
          throw new AppError(
            409,
            "No available tables right now, please consult our staff.",
          );
        }
      } else {
        changes.tableId = table.id;
      }
    }
  }

  if (Object.keys(changes).length === 0) {
    throw new AppError(400, "Please provide information to perform update.");
  }

  return await prisma.reservation.update({
    where: {
      id: reservationId,
    },
    data: changes,
    include: {
      table: {
        select: {
          number: true,
        },
      },
    },
  });
};

export const removeReservation = async (reservationId: string) => {
  return await prisma.reservation.findUnique({
    where: {
      id: reservationId,
    },
  });
};
