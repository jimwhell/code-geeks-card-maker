import { NextFunction, Request, Response } from "express";
import { Admin } from "../types/admin.types";

const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const admin: Omit<Admin, "password_hash"> = res.locals.admin;

  if (!admin || admin === null) {
    res.status(403).send("Unauthorized access");
    return;
  }

  next();
};

export default requireAdmin;
