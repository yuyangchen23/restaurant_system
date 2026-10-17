import { describe, it, expect, vi } from "vitest";
import { prisma } from "../../src/lib/prisma";
import { getTable, updateTable } from "../../src/services/tableServices";

vi.mock("../../src/lib/prisma", () => ({
  prisma: {
    table: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe("Table test checkpoint", () => {
  it("Get table with a valid id", async () => {
    const fakeTable = {
      id: "test-test-id-1",
      number: 1,
      capacity: 2,
      isActive: true,
      createdAt: new Date(),
    };

    vi.mocked(prisma.table.findUnique).mockResolvedValue(fakeTable);

    const result = await getTable(fakeTable.id);

    expect(result).toMatchObject({
      number: fakeTable.number,
      capacity: fakeTable.capacity,
      isActive: fakeTable.isActive,
    });
  });

  it("Update table with a valid id", async () => {
    const fakeTable = {
      id: "test-test-id-1",
      number: 1,
      capacity: 2,
      isActive: false,
      createdAt: new Date(),
    };

    vi.mocked(prisma.table.update).mockResolvedValue(fakeTable);

    const result = await updateTable(fakeTable.id, true);

    expect(result).toMatchObject({
      isActive: fakeTable.isActive,
    });
  });
});
