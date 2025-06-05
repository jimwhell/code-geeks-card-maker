import { Member } from './member';

export interface PaginatedMemberResponse {
  totalMembers: number;
  totalPages: number;
  members: Member[];
  currentPage: number;
  nextPage?: number;
  previousPage?: number;
}
