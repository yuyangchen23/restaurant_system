import "dotenv/config";
import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
} from "vitest";
import { prisma } from "../../src/lib/prisma";
import {
  setUpReservation,
  checkInCustomer,
} from "../../src/services/reservationServices";
import {
  closeSession,
  findCurrentSession,
  isTableOccupied,
} from "../../src/services/diningSessionServices";

let tableId: string | undefined;
let reservation: Awaited<ReturnType<typeof setUpReservation>>;

beforeEach(async () => {
  tableId = undefined;

  const table = await prisma.table.create({
    data: {
      number: 99998,
      capacity: 4,
      isActive: true,
    },
  });

  tableId = table.id;

  reservation = await setUpReservation({
    customerName: "Tim",
    phone: "123456789",
    partySize: 3,
    startTime: new Date("2026-11-15T18:30:00Z"),
    endTime: new Date("2026-11-15T20:00:00Z"),
    tableId,
  });
});

afterEach(async () => {
  if (!tableId) return;

  await prisma.diningSession.deleteMany({ where: { tableId } });
  await prisma.reservation.deleteMany({ where: { tableId } });
  await prisma.table.deleteMany({ where: { id: tableId } });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Dining session checkpoint", () => {
  it.each(["COMPLETED", "CANCELLED"] as const)(
    "checks in a reservation and closes it as %s",
    async (outcome) => {
      expect(reservation.status).toBe("CONFIRMED");
      expect(await isTableOccupied(reservation.tableId)).toBe(false);

      await checkInCustomer(reservation.id);

      const session = await findCurrentSession(reservation.tableId);
      expect(session).not.toBeNull();
      if (!session) throw new Error("Check in did not create a session.");

      //match session return output
      expect(session).toMatchObject({
        reservationId: reservation.id,
        tableId: reservation.tableId,
        partySize: reservation.partySize,
        closeAt: null,
      });

      expect(await isTableOccupied(reservation.tableId)).toBe(true);

      const seatedReservation = await prisma.reservation.findUniqueOrThrow({
        where: { id: reservation.id },
      });

      expect(seatedReservation.status).toBe("SEATED");

      const closedSession = await closeSession(session.id, outcome);
      expect(closedSession.closeAt).toBeInstanceOf(Date);

      const updatedReservation = await prisma.reservation.findUniqueOrThrow({
        where: {
          id: reservation.id,
        },
      });

      expect(updatedReservation.status).toBe(outcome);

      expect(await findCurrentSession(reservation.tableId)).toBeNull();
      expect(await isTableOccupied(reservation.tableId)).toBe(false);

      await expect(closeSession(session.id, outcome)).rejects.toMatchObject({
        statusCode: 409,
      });
    },
  );
});
