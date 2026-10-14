import express, { Request, Response } from "express";
import authRouter from "./routes/auth.js";
import staffRouter from "./routes/staff.js";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

// authentication
app.use("/auth", authRouter);

// staff management
app.use("/staff", staffRouter);

app.get("/", (req, res) => {
  res.json({ message: "Hello" });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP",
  });
});

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} was not found.`,
  });
});

// use error handler
app.use(errorHandler);

export default app;
