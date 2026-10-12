import express, { Request, Response } from 'express';
import authRouter from './routes/auth.js';
import staffRouter from './routes/staff.js';
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cookieParser());

// authentication
app.use('/auth', authRouter);

// staff management
app.use('/staff', staffRouter);

app.get('/', (req, res) => {
  res.json({ message: "Hello" });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    "status": "UP"
  });
});

export default app;