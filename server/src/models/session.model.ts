import { admin } from "googleapis/build/src/apis/admin";
import pool from "../config/db";
import bcrypt from "bcrypt";
import { Session } from "../types/session.types";
import { QueryResult } from "pg";
import { signJWT, verifyJWT } from "../utils/jwt.utils";
import log from "../utils/logger";
import { findAdminByID } from "../models/admin.model";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { Admin } from "../types/admin.types";

dotenv.config();

export async function createSession(
  admin_id: boolean
): Promise<Session | null> {
  try {
    const session: QueryResult<Session> = await pool.query(
      "INSERT INTO sessions (admin_id) VALUES($1) RETURNING *",
      [admin_id]
    );

    if (session.rows.length === 0) {
      log.error("Failed to create session for admin");
      return null;
    }

    return session.rows[0];
  } catch (error) {
    log.error("Error creating session: ", error);
    throw new Error("Server error");
  }
}

export async function validatePassword({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<Omit<Admin, "password_hash"> | null> {
  try {
    const matchResult: QueryResult<Admin> = await pool.query(
      "SELECT * FROM admin WHERE email = $1",
      [email]
    );

    if (matchResult.rows.length === 0) {
      log.info("No admin found with an email of: ", email);
      return null;
    }

    //retrieve the hash of the matched record
    const matchedResultHash: string = matchResult.rows[0].password_hash;

    if (!matchedResultHash) {
      log.error("Failed to retrieve password hash");
      return null;
    }

    //compare hash from db to the inputted hash
    const isValid: boolean = await bcrypt.compare(password, matchedResultHash);

    if (!isValid) {
      log.info("Invalid password");
      return null;
    }

    return {
      admin_id: matchResult.rows[0].admin_id,
      email: matchResult.rows[0].email,
    };
  } catch (error) {
    log.error("Error in validating password: ", error);
    throw new Error("Server error");
  }
}

export async function findSessions(query: string): Promise<Session[] | null> {
  try {
    const adminId: string = query;

    if (!adminId) {
      log.info("Admin ID not found");
      return null;
    }

    const sessions: QueryResult<Session> = await pool.query(
      "SELECT * FROM sessions where admin_id = $1 AND is_valid = true",
      [adminId]
    );

    if (sessions.rows.length === 0) {
      log.info("No sessions found for admin");
      return null;
    }

    return sessions.rows;
  } catch (error) {
    log.error("Error in retrieving sessions: ", error);
    throw new Error("Server error");
  }
}

export async function findValidSession(
  sessionId: string
): Promise<Session | null> {
  try {
    //query for a valid session that matches the given session ID
    const session: QueryResult<Session> = await pool.query(
      "SELECT * FROM sessions where session_id = $1 AND is_valid = true",
      [sessionId]
    );

    if (!session || session.rows.length === 0) {
      log.info(
        "No valid session found for request with session ID of: ",
        sessionId
      );
      return null;
    }

    return session.rows[0];
  } catch (error) {
    log.error("Error in retrieving valid sessions for admin: ", error);
    throw new Error("Server error");
  }
}

export async function updateSession(
  query: string,
  update: boolean
): Promise<Session | null> {
  try {
    const updateResult = await pool.query(
      "UPDATE sessions SET is_valid = $1 WHERE session_id = $2 RETURNING *",
      [update, query]
    );

    if (updateResult.rows.length === 0) {
      log.info("Failed to update sessions");
      return null;
    }

    return updateResult.rows[0];
  } catch (error) {
    log.error("Error in updating session status: ", error);
    throw new Error("Server error");
  }
}

export async function reIssueAccessToken({
  refreshToken,
}: {
  refreshToken: string;
}): Promise<string | null> {
  //verify if refresh token is valid
  const verifyResult = verifyJWT(refreshToken);

  if (!verifyResult) {
    log.info("Error verifying refresh token");
    return null;
  }

  //fetch decoded data from verification result
  const { decoded } = verifyResult;

  if (!decoded || !decoded.session) {
    log.info("Invalid session");
    return null;
  }

  const sessionId: string = decoded.session;

  const session: Session | null = await findValidSession(sessionId);

  if (session === null) {
    log.info("Session is invalid or not found for this refresh token");
    return null;
  }

  const adminId: string = session.admin_id;

  const admin: Omit<Admin, "password_hash"> | null = await findAdminByID(
    adminId
  );

  console.log("Admin: ", admin);

  if (admin === null) {
    log.info(`Admin with ID of ${adminId} not found.`);
    return null;
  }

  //create new access token
  console.log("Expires in: ", process.env.ACCESS_TOKEN_TTL);
  const accessToken = signJWT(
    { ...admin, session: session.session_id },
    { expiresIn: process.env.ACCESS_TOKEN_TTL } as jwt.SignOptions //15 minutes
  );

  console.log("Access token: ", accessToken);

  if (!accessToken) {
    log.error("Error creating new access token");
    return null;
  }

  return accessToken;
}
