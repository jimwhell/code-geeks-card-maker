import { NextFunction, Request, Response } from "express";
import {
  createSession,
  findSessions,
  updateSession,
  validatePassword,
} from "../models/session.model";
import { signJWT } from "../utils/jwt.utils";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { admin } from "googleapis/build/src/apis/admin";
import { Session } from "../types/session.types";
import log from "../utils/logger";
import { loginAdminInput } from "../schemas/session.schema";

dotenv.config();

const accessTokenTTL = process.env.ACCESS_TOKEN_TTL;
const refreshTokenTTL = process.env.REFRESH_TOKEN_TTL;

export async function createAdminSession(
  req: Request<{}, {}, loginAdminInput["body"]>,
  res: Response,
  next: NextFunction
) {
  //validate input credentials
  try {
    const admin = await validatePassword(req.body);

    if (!admin) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    //create a session
    const adminId = admin.admin_id;

    if (!adminId) {
      res.status(404).json({ message: "Admin id not found." });
      return;
    }

    const session: Session | null = await createSession(adminId);

    if (session === null) {
      throw new Error("Failed to create session");
    }

    //create an access token
    //and store admin details and session id in token
    const accessToken: string | undefined = signJWT(
      { ...admin, session: session.session_id },
      { expiresIn: accessTokenTTL } as jwt.SignOptions //15 minutes
    );

    if (!accessToken) {
      throw new Error("Failed to create access token");
    }

    //create a refresh token
    //and store admin details and session id in token
    const refreshToken: string | undefined = signJWT(
      { ...admin, session: session.session_id },
      { expiresIn: refreshTokenTTL } as jwt.SignOptions //1 year
    );

    if (!refreshToken) {
      throw new Error("Failed to create refresh token");
    }

    res.send({ accessToken, refreshToken });
  } catch (error) {
    log.error("Server error in creating a new session");
    next(error);
  }
}

export async function getAdminSessions(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const adminId: string = res.locals.admin.admin_id;

    if (!adminId) {
      res.status(400).json({ message: "Admin ID not found" });
      return;
    }

    const sessions: Session[] | null = await findSessions(adminId);

    if (sessions === null) {
      res.status(404).send("No sessions found for admin.");
      return;
    }
    res.status(200).json(sessions);
  } catch (error) {
    next(error);
  }
}

export async function deleteAdminSession(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const sessionId: string = res.locals.admin.session;

    if (!sessionId) {
      res.status(400).json({ message: "Missing session ID." });
      return;
    }

    //invalidate the admin's current session
    const sessionUpdateResult: null | Session = await updateSession(
      sessionId,
      false
    );

    if (sessionUpdateResult === null) {
      throw new Error("Failed to invalidate session");
    }

    res.status(200).send({
      accessToken: null,
      refreshToken: null,
    });
  } catch (error) {
    next(error);
  }
}
