import "dotenv/config";
import express from "express";
import { Request, Response } from "express";
import { registerUser, loginUser, findOwner } from "../services/authServices.js";
import { sessionCreate } from "../utils/session.js";

// export const register = async (req: Request, res: Response) => {
//   const { email, password } = req.body;

//   const newUser = await registerUser(email, password);

//   return res.status(200).json({
//     success: true,
//     message: "Successfully registered a user",
//     data: newUser
//   });
// };

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
