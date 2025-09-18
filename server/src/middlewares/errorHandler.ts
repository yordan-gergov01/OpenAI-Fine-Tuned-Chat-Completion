import { Request, Response, NextFunction } from "express";
import AppError from "../utils/appError";

export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let status = "error";
  let message = "Something went wrong!";

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    status = err.status;
    message = err.message;
  } else if (err.message) {
    message = err.message;
  }

  console.error(`ERROR: ${message}`);

  res.status(statusCode).json({
    status: "error",
    message,
  });
};

export default globalErrorHandler;
