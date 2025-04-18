import { Request, Response, NextFunction } from "express";
import pool from "../db/db.config";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/helpers/generateToken";
import asyncHandler from "../middlewares/asyncHandler";

// Register User
export const registerUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { first_name, last_name, email, password, role } = req.body;

    if (!first_name || !last_name || !email || !password || !role) {
        return res.status(400).json({ message: "Please provide all required fields" });
    }

    if (!['job_seeker', 'employer', 'admin'].includes(role)) {
        return res.status(400).json({ message: "Invalid role provided" });
    }

    const userExists = await pool.query("SELECT user_id FROM users WHERE email = $1", [email]);

    if (userExists.rows.length > 0) {
        return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUserQuery = `
        INSERT INTO users (email, password_hash, first_name, last_name, role)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING user_id, email, first_name, last_name, role
    `;
    const newUser = await pool.query(newUserQuery, [email, hashedPassword, first_name, last_name, role]);

    await generateToken(res, newUser.rows[0].user_id, newUser.rows[0].role);

    res.status(201).json({
        message: "User registered successfully",
        user: newUser.rows[0],
    });
});

// Login User
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const userQuery = `
        SELECT user_id, email, password_hash, first_name, last_name, role
        FROM users WHERE email = $1
    `;
    const result = await pool.query(userQuery, [email]);

    if (result.rows.length === 0) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    await generateToken(res, user.user_id, user.role);

    res.status(200).json({
        message: "Login successful",
        user: {
            id: user.user_id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role,
        },
    });
});

// Logout User
export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
    res.cookie("access_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "strict",
        expires: new Date(0),
    });

    res.cookie("refresh_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "strict",
        expires: new Date(0),
    });

    res.status(200).json({ message: "User logged out successfully" });
});
