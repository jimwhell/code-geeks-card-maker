import { Request, Response, NextFunction } from "express";
import { getAllMembers } from "../models/member.model";
import {
  Member,
  MembersQuery,
  MembersQueryResult,
  PaginatedMemberResponse,
} from "../types/member.types";
import log from "../utils/logger";
import { off } from "process";
import { totalmem } from "os";

export async function getAllMembersHandler(
  req: Request<{}, {}, {}, MembersQuery>,
  res: Response<PaginatedMemberResponse>,
  next: NextFunction
) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const offset: number = (page - 1) * limit;

    const result: MembersQueryResult | null = await getAllMembers(
      limit,
      offset
    );

    if (!result) {
      throw new Error("Failed to retrieve members");
    }

    if (result === null) {
      throw new Error("No members found");
    }

    let paginatedResponse: PaginatedMemberResponse = {
      totalMembers: result.totalMembers,
      totalPages: result.totalPages,
      currentPage: page,
      members: result.members,
    };

    if (page * limit < paginatedResponse.totalMembers) {
      paginatedResponse.nextPage = page + 1;
    }

    if (offset > 0) {
      paginatedResponse.previousPage = page - 1;
    }

    res.status(200).json(paginatedResponse);
  } catch (error) {
    log.error("Error in retrieving members: ", error);
    next(error);
  }
}
