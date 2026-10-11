import { createHash, randomBytes } from "node:crypto";
import { prisma } from "../lib/prisma.js";
import { User } from "../generated/prisma/client.js";

export const sessionCreate = async (userId: User["id"]) => {
  const sessionToken = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(sessionToken).digest("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      userId: userId,
      tokenHash: tokenHash,
      expiresAt: expiresAt,
    },
  });

  return {
    sessionToken,
    expiresAt,
  };
};
