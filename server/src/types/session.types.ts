export interface Session {
  session_id: string;
  admin_id: string;
  is_valid: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AccessTokenResponse {
  token: string;
  expiresIn: number;
}

export interface LogoutTokenResponse {
  accessToken: null;
  refreshToken: null;
}
