import { Decimal } from "@prisma/client/runtime/client";
import { AppError } from "../errors/AppError.js";
import { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";

export type orderItemInput = {
  menuItemId: string;
  quantity: number;
};

const checkValidSession = async (diningSessionId: string) => {
  const session = await prisma.diningSession.findUnique({
    where: {
      id: diningSessionId,
    },
  });

  if (!session) {
    throw new AppError(404, "Session Not found.");
  }

  return true;
};

export const createOrderById = async (
  diningSessionId: string,
  items: orderItemInput[],
) => {
  try {
    if (!(await checkValidSession(diningSessionId))) {
      throw new AppError(501, "Session error.");
    }
    // collect their IDs
    const menuItemsIds = [...new Set(items.map((item) => item.menuItemId))];

    // retrieve ids from database
    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: {
          in: menuItemsIds,
        },
      },
      select: {
        id: true,
        name: true,
        price: true,
        isAvailable: true,
      },
    });

    const menuMap = new Map(
      menuItems.map((menuItem) => [menuItem.id, menuItem]),
    );

    let total = new Prisma.Decimal(0);

    const orderItems: Prisma.OrderItemCreateWithoutOrderInput[] = [];

    // loop through the menuById and calculate the total
    for (const item of items) {
      const menuItem = menuMap.get(item.menuItemId);

      if (!menuItem) {
        throw new AppError(404, `Menu item ${item.menuItemId} not found.`);
      }

      if (!menuItem.isAvailable) {
        throw new AppError(409, `Menu item ${item.menuItemId} is unavailable.`);
      }

      total = total.plus(menuItem.price.mul(item.quantity));

      orderItems.push({
        menuItem: {
          connect: {
            id: menuItem.id,
          },
        },
        quantity: item.quantity,
        unitPrice: menuItem.price,
        itemName: menuItem.name,
      });
    }

    return await prisma.order.create({
      data: {
        diningSession: {
          connect: {
            id: diningSessionId,
          },
        },
        totalAmount: total,
        item: {
          create: orderItems,
        },
      },
      include: {
        item: true,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new AppError(409, "The order has already placed.");
    }

    throw error;
  }
};

export const findOrderById = async (id: string) => {
  return await prisma.order.findUnique({
    where: {
      id,
    },
    select: {
      status: true,
      totalAmount: true,
      discount: true,
    },
  });
};

export const cancelOrderById = async (id: string) => {
  return await prisma.order.update({
    where: {
      id,
      status: {
        in: ["PENDING", "PLACED"],
      },
    },
    data: {
      status: "CANCELLED",
    },
    include: {
      item: true,
    },
  });
};

