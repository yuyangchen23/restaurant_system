import { describe, it, expect, beforeEach, vi } from "vitest";
import { prisma } from "../src/lib/prisma";
import { getMenus } from "../src/controllers/menuControllers";
import request from "supertest";
import app from "../src/app";
import { getAllItems, addItem } from "../src/services/menuServices";
import { Decimal } from "@prisma/client/runtime/client";

const fakeItems = [
  {
    name: "Pasta",
    description: "Tomato pasta",
    price: new Decimal("15.75"),
  },
];

const input = {
  name: "Pasta",
  description: "Tomato pasta",
  price: 15.75,
  isAvailable: false,
};

vi.mock("../src/services/menuServices.js");

beforeEach(() => {
  vi.resetAllMocks();
});

describe("integration test for menu", () => {
  it("return all the menu items", async () => {
    vi.mocked(getAllItems).mockResolvedValue(fakeItems);

    const response = await request(app).get("/menu/items");

    expect(response.status).toBe(200);
    expect(getAllItems).toHaveBeenCalledOnce();
    expect(response.body).toEqual({
      success: true,
      data: [
        {
          name: "Pasta",
          description: "Tomato pasta",
          price: "15.75",
        },
      ],
    });
  });

  it("add item to menu items", async () => {
    const fakeCreatedItems = {
      ...input,
      price: new Decimal("15.75"),
    };
    vi.mocked(addItem).mockResolvedValue(fakeCreatedItems);

    const response = await request(app).post("/menu/items").send(input);
    expect(addItem).toHaveBeenCalledWith(
      input.name,
      input.description,
      input.price,
      input.isAvailable,
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: {
        ...input,
        price: "15.75",
      },
    });
  });

  it("return error when sending invalid input", async () => {
    const response = await request(app).post("/menu/items").send({
      name: "Pasta",
      price: 15.75,
      isAvailable: "false",
    });

    expect(response.status).toBe(400);
    expect(addItem).not.toHaveBeenCalled();
  });
});
