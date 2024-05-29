export interface TokenPayload {
  sub: string;
  username: string;
  role: string;
}

export interface JwtPayload {
  sub: string;
  username?: string;
  hash?: string;
  createAt?: Date;
  iat: number;
  exp: number;
}

export interface TokenData {
  accessToken: string;
  refreshToken: string;
  accessExpires: Date;
  refreshExpires: Date;
}

export interface JwtResponse {
  access_token: string;
  refresh_token: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}
