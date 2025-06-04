import { NextFunction, Request, Response } from "express";
import {
  createSession,
  findSessions,
  reIssueAccessToken,
  updateSession,
  validatePassword,
} from "../models/session.model";
import { signJWT } from "../utils/jwt.utils";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import {
  AccessTokenResponse,
  LogoutTokenResponse,
  Session,
} from "../types/session.types";
import log from "../utils/logger";
import { loginAdminInput } from "../schemas/session.schema";
import { convertToSeconds } from "../utils/timeConverter";
import { findAdminByID } from "../models/admin.model";
import { Admin } from "../types/admin.types";

dotenv.config();

const accessTokenTTL = process.env.ACCESS_TOKEN_TTL;
const refreshTokenTTL = process.env.REFRESH_TOKEN_TTL;

export async function createAdminSession(
  req: Request<{}, {}, loginAdminInput["body"]>,
  res: Response<AccessTokenResponse>,
  next: NextFunction
) {
  //validate input credentials
  try {
    const admin = await validatePassword(req.body);

    if (!admin) {
      throw new Error("Admin ID not found");
    }

    //create a session
    const adminId = admin.admin_id;

    if (!adminId) {
      throw new Error("Admin ID not found");
    }

    const session: Session | null = await createSession(adminId);

    if (session === null) {
      throw new Error("Failed to create session");
    }

    if (!accessTokenTTL) {
      throw new Error("Access token TTL not found");
    }

    if (!refreshTokenTTL) {
      throw new Error("Refresh token TTL not found");
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

    const accessTokenExpiresAt: number = convertToSeconds(accessTokenTTL);
    const refreshTokenExpiresAt: number = convertToSeconds(refreshTokenTTL);

    res.cookie("refresh_token", refreshToken, {
      path: "/api/sessions/refresh",
      httpOnly: true,
      maxAge: 365 * 24 * 60 * 60 * 1000,
      sameSite: "lax",
    });

    res.status(200).json({
      token: accessToken,
      expiresIn: accessTokenExpiresAt,
    });
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
      throw new Error("Admin ID not found");
    }

    const sessions: Session[] | null = await findSessions(adminId);

    if (sessions === null) {
      throw new Error("No sessions found for admin");
    }
    res.status(200).json(sessions);
  } catch (error) {
    next(error);
  }
}

export async function deleteAdminSession(
  req: Request,
  res: Response<LogoutTokenResponse>,
  next: NextFunction
) {
  try {
    const sessionId: string = res.locals.admin.session;

    if (!sessionId) {
      throw new Error("Session id not found");
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

export async function refreshAccessToken(
  req: Request,
  res: Response<AccessTokenResponse>,
  next: NextFunction
) {
  try {
    const refreshToken: string = req.cookies["refresh_token"];
    console.log("Req cookies: ", req.cookies);

    if (!refreshToken) {
      throw new Error("Refresh token not found");
    }

    const accessToken = await reIssueAccessToken({
      refreshToken,
    });

    if (!accessToken || accessToken === null) {
      throw new Error("Access token not found");
    }

    res.status(200).json({
      token: accessToken.token,
      expiresIn: accessToken.expiresIn,
    });
  } catch (error) {
    log.error("Server error: ", error);
    next(error);
  }
}
