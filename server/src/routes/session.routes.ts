import express from "express";
import {
  createAdminSession,
  deleteAdminSession,
  getAdminSessions,
} from "../controllers/sessions.controller";
import { createSessionSchema } from "../schemas/session.schema";
import validateResource from "../middlewares/validateResource";
import requireAdmin from "../middlewares/requireAdmin";
import deserializeUser from "../middlewares/deserializeUser";

const router = express.Router();

// login route
router.post(
  "/login",
  validateResource(createSessionSchema),
  createAdminSession
);
//get all admin sessions
router.get("/", deserializeUser, requireAdmin, getAdminSessions);
//delete admin session (logout)
router.delete("/", deserializeUser, requireAdmin, deleteAdminSession);
export default router;
