import { NextFunction, Request, Response } from "express";
import log from "../utils/logger";

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  log.error(err.stack);
  res.status(500).json({
    status: 500,
    message: "Internal server error",
    error: err.message,
  });
};

export default errorHandler;
