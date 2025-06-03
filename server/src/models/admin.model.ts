import { QueryResult } from "pg";
import pool from "../config/db";
import { Admin } from "../types/admin.types";
import logger from "../utils/logger";

export async function findAdminByID(
  adminId: string
): Promise<Omit<Admin, "password_hash"> | null> {
  const adminResult: QueryResult<Admin> = await pool.query(
    "SELECT admin_id, email FROM admin WHERE admin_id = $1",
    [adminId]
  );

  if (adminResult.rows.length === 0) {
    logger.info(`Admin with ID of ${adminId} not found`);
    return null;
  }

  return adminResult.rows[0];
}
