import { Types, Document, mongo } from "mongoose";

// JWT payload
export interface JWTPayload {
  userId: string;
  email: string;
}

// Auth response returned by signup/login
export interface AuthResponse {
  message: string; // Added to match your returned body
  user: {
    id: Types.ObjectId;
    fullName: string;
    email: string;
    phone: string | undefined | null;
    avatarUrl: string | undefined | null;
  };
  accessToken: string;
  refreshToken: string;
}

// Login request
export interface ILoginRequest {
  email: string;
  password: string;
}

// Signup request
export interface ISignupRequest {
  fullName: string; 
  email: string;
  password: string;
  phone?: string;
  avatarUrl?: string;
}
// Generic service response
export interface IServiceResponse<T> {
  status: number;
  body: T;
}
