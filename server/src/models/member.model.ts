import { QueryResult } from "pg";
import pool from "../config/db";
import { Member, MembersQueryResult } from "../types/member.types";
import log from "../utils/logger";

//Retrieve all member data along with their card_IDs
export async function getAllMembers(
  limit: number = 1,
  offset: number
): Promise<MembersQueryResult | null> {
  const members: QueryResult<Member> = await pool.query(
    `
      SELECT 
        m.*,
        CASE
          WHEN m.card_id IS NOT NULL THEN TRUE
          ELSE FALSE
        END AS has_card
        FROM 
          members m
          LEFT JOIN cards c ON c.card_id = m.card_id
          ORDER BY m.member_id
          LIMIT $1 OFFSET $2;
      `,
    [limit, offset]
  );

  if (!members) {
    log.error("Error in retrieving members");
    return null;
  }

  //query total number of member rows
  const countResult = await pool.query(`
    SELECT COUNT(*)
    AS total
      FROM
        members
    `);

  if (!countResult) {
    log.error("Error in retrieving members total");
    return null;
  }

  if (members.rows.length === 0) {
    log.info("No members found");
    return null;
  }

  const totalMembers = countResult.rows[0].total;
  //derive totalPages from member total
  const totalPages = Math.ceil(totalMembers / limit);

  return {
    totalMembers,
    totalPages,
    members: members.rows,
  };
}
