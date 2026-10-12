import { Request, Response } from "express";
import { AppError } from "../errors/AppError.js";
import { findUserByEmail, registerUser } from "../services/authServices.js";

export const createStaff = async (req: Request, res: Response) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    throw new AppError(400, "Email or password are required");
  }

  if (await findUserByEmail(email)) {
    throw new AppError(400, "Email already exists");
  }

  if (!role) {
    throw new AppError(400, "User's role is missing");
  }

  const user = await registerUser(email, password, role);

  return res.status(200).json({
    success: true,
    message: "Register success",
    role: user.role?.name,
    user,
  });
}