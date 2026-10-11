import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError.js";

export const authenticate = (req: Request, res: Response, next: NextFunction) => {

}

export const authorize = (...allowedRoles) => {
  
}