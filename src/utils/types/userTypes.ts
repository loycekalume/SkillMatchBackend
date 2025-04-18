import { Request } from "express";

/**
 * User type defining structure of a user record in PostgreSQL
 * Since these timestamps are mostly used for database records but are not critical for authentication, we can make them optional in our User type.
 */
export interface User {
    user_id: string;
    email: string;
    password_hash?: string; // Optional for security when returning user data
    first_name: string;
    last_name: string;
    role: "job_seeker" | "employer" | "admin";
    is_active: boolean;
    created_at: string; // or Date if you prefer
    updated_at?: string; // or Date
  }
  

/**
 * Custom Express Request Type to include `user` object
 */
export interface UserRequest extends Request {
    user?: User;
}
