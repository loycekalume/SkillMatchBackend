import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import asyncHandler from "../asyncHandler"; // Your existing async handler
import pool from "../../db/db.config"; 
import { UserRequest } from "../../utils/types/userTypes";
dotenv.config();

interface JwtPayload {
  userId: number;
  role: string;
}

// Middleware to protect routes
export const protect = asyncHandler(async (req:UserRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.access_token;

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    // Fetch user from DB and attach to req
    const userQuery = await pool.query(
      "SELECT user_id, email, first_name, last_name, role FROM users WHERE user_id = $1",
      [decoded.userId]
    );

    if (userQuery.rows.length === 0) {
      res.status(401).json({ message: "Not authorized, user not found" });
      return;
    }

    req.user = userQuery.rows[0]; // Attach user to req
    next();
  } catch (error) {
    res.status(401).json({ message: "Token failed" });
  }
});

// Middleware to allow only specific roles
export const requireRole = (allowedRoles: string | string[]) => {
  return (req:UserRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: "Access denied: insufficient permissions" });
      return;
    }

    next();
  };
};
