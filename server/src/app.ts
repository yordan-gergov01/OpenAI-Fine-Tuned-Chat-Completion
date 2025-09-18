import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

import AppError from "./utils/appError";
import globalErrorHandler from "./middlewares/errorHandler";

import createJsonlRouter from "./routes/createJsonlFileRouter";
import getFineTuneRouter from "./routes/getFineTunedModellRouter";
import getModelsRouter from "./routes/getModelsRouter";

const app: Application = express();

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

app.use(helmet());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});

app.use("/", limiter);

app.use("/upload", createJsonlRouter);
app.use("/fine-tune", getFineTuneRouter);
app.use("/models", getModelsRouter);

app.get("/health", (req: Request, res: Response) => {
  res.json({ message: "OK" });
});

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server.`, 404));
});

app.use(globalErrorHandler);

export default app;
