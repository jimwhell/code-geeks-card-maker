import { NextFunction, Request, Response } from "express";
import { verifyJWT } from "../utils/jwt.utils";
import { findValidSession, reIssueAccessToken } from "../models/session.model";
import log from "../utils/logger";

const deserializeUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authorizationHeader: string | undefined = req.headers.authorization;
  if (!authorizationHeader) {
    log.info("No authorization header found");
    res.status(403).send("Unauthorized access");
    return;
  }

  //retrieve the access token and the refresh token from the headers
  const accessToken = authorizationHeader.replace(/^Bearer\s/, "");
  const refreshToken = req.headers["x-refresh"];

  //verify access token
  const jwtResult = verifyJWT(accessToken);

  if (!jwtResult) {
    log.info("Invalid access token");
    res.status(401).send("Invalid access token");
    return;
  }

  //extract decoded data from access token
  const { decoded, expired } = jwtResult;

  if (decoded === null && !refreshToken) {
    res.status(401).send("Unauthorized access.");
    return;
  }

  //if access token is expired, verify refreshToken then create a new one.
  if (expired && refreshToken && typeof refreshToken === "string") {
    const newAccessToken = await reIssueAccessToken({ refreshToken });

    //a null result means that the current decoded data from the refresh token
    //holds a session that is invalid

    if (newAccessToken === null) {
      res.status(401).send("Session revoked. Authentication required.");
      return;
    }

    //set new access token to header
    res.setHeader("x-access-token", newAccessToken);

    //verify new access token
    const result = verifyJWT(newAccessToken);

    if (!result) {
      res.status(401).send("Invalid access token");
      return;
    }

    //if token is valid:
    //include admin details to res.locals
    res.locals.admin = result.decoded;
    next();
    return;
  }

  //extract session id from access token
  const sessionId: string = decoded!.session;

  //find a valid session that matches the ID of the current session
  const session = await findValidSession(sessionId);

  //if no valid session was found, even if the token was valid, restrict access
  if (!session) {
    res.status(401).send("Session revoked. Authentication required.");
    return;
  }

  //if token is valid:
  //include admin details to res.locals
  res.locals.admin = decoded;
  next();
};

export default deserializeUser;
