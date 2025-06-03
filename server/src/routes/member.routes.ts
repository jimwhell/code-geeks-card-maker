import express from "express";
import { getAllMembersHandler } from "../controllers/member.controlller";
import deserializeUser from "../middlewares/deserializeUser";
import requireAdmin from "../middlewares/requireAdmin";

const router = express.Router();

//get all members route
router.get("/", deserializeUser, requireAdmin, getAllMembersHandler);

export default router;
