export interface UserPayload {
  email: string;
  password: string;
  username: string;
  role: string;
}

export interface UserResponse {
  email: string;
  username: string;
  role: string;
  createAt: Date;
}

export interface ValidateUsername {
  username: string;
}
