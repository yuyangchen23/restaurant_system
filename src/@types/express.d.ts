import "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: {
          name: string;
        };
      };
    }
  }
}

export {};