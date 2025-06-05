export interface Member {
  member_id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  student_no: string;
  email: string;
  hau_email: string;
  program: string;
  card_id: string | null;
  has_card: boolean;
  membership_code: string;
}
