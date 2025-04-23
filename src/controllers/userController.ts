import { Request, Response } from "express"
import pool from "../db/db.config"
import asyncHandler from "../middlewares/asyncHandler"



// export const createUser = asyncHandler( async (req: Request, res: Response) => {
//     try {
//         const { email, password_hash, first_name, last_name, role, profile_image_url } = req.body;

//         const emailCheck = await pool.query("SELECT user_id FROM users WHERE email = $1", [email]);
//         if (emailCheck.rows.length > 0) {
//             res.status(400).json({ message: "Email already in use" });
//             return;
//         }

//         const result = await pool.query(
//             `INSERT INTO users (email, password_hash, first_name, last_name, role, profile_image_url)
//              VALUES ($1, $2, $3, $4, $5, $6)
//              RETURNING *`,
//             [email, password_hash, first_name, last_name, role, profile_image_url]
//         );

//         res.status(201).json({ message: "User created successfully", user: result.rows[0] });
//     } catch (error) {
//         console.error("Error creating user:", error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// });


export const getUsers = asyncHandler( async (req: Request, res: Response) => {
    try {
        const result = await pool.query("SELECT * FROM users ORDER BY user_id ASC");
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
export const getUserById = asyncHandler( async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await pool.query("SELECT * FROM users WHERE user_id = $1", [id]);

        if (result.rows.length === 0) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export const putUser = asyncHandler( async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { email, password_hash, first_name, last_name, role, profile_image_url, is_active } = req.body;

        const checkUser = await pool.query("SELECT * FROM users WHERE user_id = $1", [id]);
        if (checkUser.rows.length === 0) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const result = await pool.query(
            `UPDATE users 
             SET email = $1, password_hash = $2, first_name = $3, last_name = $4, role = $5, 
                 profile_image_url = $6, is_active = $7, updated_at = CURRENT_TIMESTAMP 
             WHERE user_id = $8
             RETURNING *`,
            [email, password_hash, first_name, last_name, role, profile_image_url, is_active, id]
        );

        res.json({ message: "User updated", user: result.rows[0] });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});





export const deleteUser = asyncHandler( async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const checkUser = await pool.query("SELECT * FROM users WHERE user_id = $1", [id]);
        if (checkUser.rows.length === 0) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        await pool.query("DELETE FROM users WHERE user_id = $1", [id]);
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

