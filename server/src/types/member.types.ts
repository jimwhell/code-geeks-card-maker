//member
export interface Member {
  member_id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  student_no: string;
  email: string;
  hau_email: string;
  program: string;
  card_id: string;
}

//data returned by the getAllMembers function in the members model
export interface MembersQueryResult {
  totalMembers: number;
  totalPages: number;
  members: Member[];
}

//get all members response body
export interface PaginatedMemberResponse extends MembersQueryResult {
  currentPage: number;
  nextPage?: number;
  previousPage?: number;
}

//get all members query parameters
export interface MembersQuery {
  page: number;
  limit: number;
}
