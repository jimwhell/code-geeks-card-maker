import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import logger from "./logger";

dotenv.config();

const privateKey: string | undefined = process.env.PRIVATE_KEY;
const publicKey: string | undefined = process.env.PUBLIC_KEY;

export function signJWT(
  object: Object,
  options?: jwt.SignOptions
): string | undefined {
  if (privateKey) {
    return jwt.sign(object, privateKey, {
      ...(options && options),
      algorithm: "RS256", //allow to use public and private keys
    });
  }
  throw new Error("Private key not found");
}

export function verifyJWT(token: string) {
  if (publicKey) {
    try {
      const decoded = jwt.verify(token, publicKey, { algorithms: ["RS256"] });

      if (typeof decoded === "string") {
        logger.error("Expected JWT payload to be an object, got a string");
        throw new Error("Expected JWT payload to be an object, got string.");
      }
      return {
        valid: true,
        expired: false,
        decoded: decoded,
      };
    } catch (e: any) {
      return {
        valid: false,
        expired: e.message === "jwt expired",
        decoded: null,
      };
    }
  }
  throw new Error("Public key not found");
}
