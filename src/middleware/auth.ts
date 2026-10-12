import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError.js";
import { prisma } from "../lib/prisma.js";
import { createHash } from "node:crypto";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // requires cookie-parser to read session_token from request
  const token = req.cookies?.session_token;

  if (typeof token !== "string" || !token) {
    throw new AppError(401, "Unauthorized. Please log in again.");
  }

  const tokenHash = createHash("sha256").update(token).digest("hex");

  const session = await prisma.session.findUnique({
    where: {
      tokenHash,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (
    !session ||
    session.revokedAt !== null ||
    session.expiresAt.getTime() <= Date.now()
  ) {
    throw new AppError(401, "Session Expired. Please log in again.");
  }

  req.user = session.user;
  next();
};

export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError(401, "Authentication required");
    }

    if (!allowedRoles.includes(req.user.role.name)) {
      throw new AppError(403, "Access denied");
    }

    next();
  };
};
