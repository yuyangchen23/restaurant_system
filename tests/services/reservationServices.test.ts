import "dotenv/config";
import { afterAll, it, expect } from "vitest";
import { prisma } from "../../src/lib/prisma";
import { findFirstTable, setReservationTimer, setUpReservation } from "../../src/services/reservationServices";

afterAll(async() => {
  await prisma.$disconnect();
});

it("rejects double-booking for the same table", async () => {
  const table = await prisma.table.create({
    data: {
      number: 99999,
      capacity: 4,
      isActive: true,
    }
  });

  const startTime = new Date("2026-10-23T20:30:00Z");
  const endTime = setReservationTimer(startTime);

  expect(endTime).toBeInstanceOf(Date);
  expect(endTime).toEqual(new Date("2026-10-23T22:00:00Z"));

  try {
    const availableTables = await Promise.all([
      findFirstTable(4, startTime, endTime),
      findFirstTable(4, startTime, endTime),
    ]);

    expect(availableTables.map((t) => t?.id)).toEqual([
      table.id,
      table.id,
    ]);

    const attempts = await Promise.allSettled(
      ["Alice", "Jane Doe"].map((customerName) => 
        setUpReservation({
          customerName,
          phone: "0900000000",
          partySize: 3,
          startTime,
          endTime,
          tableId: table.id,
        })
      )
    );

    const successful = attempts.filter((r) => r.status === "fulfilled");
    const failed = attempts.filter((r) => r.status === "rejected");

    expect(successful).toHaveLength(1);
    expect(failed).toHaveLength(1);

    expect(failed[0]?.reason).toMatchObject({
      statusCode: 409,
    });

    const count = await prisma.reservation.count({
      where: {
        tableId: table.id,
      },
    });

    console.log("Reservations saved for the same table: ", count);

    expect(count).toBe(1);
  } finally {
    await prisma.reservation.deleteMany({
      where: {
        tableId: table.id,
      },
    });

    await prisma.table.delete({
      where: {
        id: table.id,
      },
    });
  }
}, 15_000);