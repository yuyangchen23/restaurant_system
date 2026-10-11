import { Request, Response } from "express";
import { AppError } from "../errors/AppError.js";
import { login } from "../services/staffServices.js";


export const createStaff = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError(400, "Email or password are required");
  }

  const { user, sessionToken, expiresAt } = await login(email, password);

  res.cookie("session_token", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  })

  return res.status(200).json({
    success: true,
    message: "Login Success",
    user,
  });
}