import "dotenv/config";
import { Request, Response } from "express";
import { loginUser, findOwner, logoutUser } from "../services/authServices.js";
import { sessionCreate } from "../utils/session.js";
import { AppError } from "../errors/AppError.js";
import { createHash } from "node:crypto";

export const login = async (req: Request, res: Response) => {
  const user = await loginUser(req.body.email, req.body.password);

  const { sessionToken, expiresAt } = await sessionCreate(user.id);

  res.cookie("session_token", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return res.status(200).json({
    success: true,
    message: "Login endpoint reached",
    data: {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      expiresAt: expiresAt,
    },
  });
};

export const ownerCred = async (req: Request, res: Response) => {
  const owner = await findOwner();

  return res.status(200).json({
    success: true,
    data: owner,
  });
};

export const logout = async (req: Request, res: Response) => {
  const token = req.cookies?.session_token;

  if (!token || typeof token !== "string") {
    throw new AppError(401, "Authentication required")
  }

  const tokenHash = createHash("sha256").update(token).digest("hex");

  const user = await logoutUser(req.body.email, tokenHash);

  res.clearCookie("session_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  res.status(200).json({
    success: true,
    message: "Logout successful",
    data: {
      id: user.id,
      email: user.email,
      role: user.role,
      updatedAt: user.updatedAt,
    },
  });
};

// development
// clearSession
// deleteUser
// 