import { AppError } from "../errors/AppError.js";
import { verifyPassword } from "../utils/password.js";
import { prisma } from "../lib/prisma.js";
import { randomBytes, createHash } from "node:crypto";
import { sessionCreate } from "../utils/session.js";

export const findUserByEmail = async (email: string) => {
  return await prisma.user.findUnique({
    where: {
      email,
    },
  });
};

export const login = async (email: string, password: string) => {
  if (!email || !password) {
    throw new AppError(400, "Email and Password are required");
  }

  const user = await findUserByEmail(email);

  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }

  const passwordMatches = verifyPassword(password, user.passwordHash);

  if (!passwordMatches) {
    throw new AppError(401, "Invalid email or password");
  }

  // assign session to the user
  const { sessionToken, expiresAt } = await sessionCreate(user.id);

  return {
    user: { id: user.id, email: user.email },
    sessionToken,
    expiresAt,
  };
};
