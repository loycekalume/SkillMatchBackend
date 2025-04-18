import { Response } from "express";
import pool from "../db/db.config";
import asyncHandler from "../middlewares/asyncHandler";
import { UserRequest } from "../utils/types/userTypes";

// CREATE
export const createProfile = asyncHandler(async (req: UserRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { role, user_id } = req.user;

    if (role !== "job_seeker") {
        return res.status(403).json({ message: "Only job seekers can create profiles" });
    }

    const {
        experience_years,
        education_level,
        current_position,
        current_company,
        location,
        job_preference,
        resume_url,
        portfolio_url
    } = req.body;

    const result = await pool.query(
        `INSERT INTO job_seeker_profiles 
         (user_id, experience_years, education_level, current_position, current_company, location, job_preference, resume_url, portfolio_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         RETURNING *`,
        [
            user_id, experience_years, education_level,
            current_position, current_company, location,
            job_preference, resume_url, portfolio_url
        ]
    );

    res.status(201).json({ message: "Profile created successfully", profile: result.rows[0] });
});

// GET ALL
export const getProfiles = asyncHandler(async (_req: UserRequest, res: Response) => {
    const result = await pool.query("SELECT * FROM job_seeker_profiles ORDER BY profile_id ASC");
    res.status(200).json(result.rows);
});

// GET ONE
export const getProfileById = asyncHandler(async (req: UserRequest, res: Response) => {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM job_seeker_profiles WHERE profile_id = $1", [id]);

    if (result.rows.length === 0) {
        return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json(result.rows[0]);
});

// UPDATE (PUT)
export const putProfile = asyncHandler(async (req: UserRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;
    const { role, user_id } = req.user;

    const check = await pool.query("SELECT * FROM job_seeker_profiles WHERE profile_id = $1", [id]);

    if (check.rows.length === 0) {
        return res.status(404).json({ message: "Profile not found" });
    }

    const profile = check.rows[0];

    if (role !== "job_seeker" || profile.user_id !== user_id) {
        return res.status(403).json({ message: "You can only update your own profile" });
    }

    const {
        experience_years,
        education_level,
        current_position,
        current_company,
        location,
        job_preference,
        resume_url,
        portfolio_url
    } = req.body;

    const result = await pool.query(
        `UPDATE job_seeker_profiles
         SET experience_years=$1, education_level=$2, current_position=$3, current_company=$4, 
             location=$5, job_preference=$6, resume_url=$7, portfolio_url=$8, updated_at=CURRENT_TIMESTAMP
         WHERE profile_id=$9 RETURNING *`,
        [
            experience_years, education_level, current_position,
            current_company, location, job_preference,
            resume_url, portfolio_url, id
        ]
    );

    res.status(200).json({ message: "Profile updated", profile: result.rows[0] });
});

// PATCH
export const patchProfile = asyncHandler(async (req: UserRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;
    const { role, user_id } = req.user;

    const check = await pool.query("SELECT * FROM job_seeker_profiles WHERE profile_id = $1", [id]);

    if (check.rows.length === 0) {
        return res.status(404).json({ message: "Profile not found" });
    }

    const profile = check.rows[0];

    if (role !== "job_seeker" || profile.user_id !== user_id) {
        return res.status(403).json({ message: "You can only update your own profile" });
    }

    const fields = Object.keys(req.body);
    const values = Object.values(req.body);

    if (fields.length === 0) {
        return res.status(400).json({ message: "No fields provided for update" });
    }

    const setQuery = fields.map((field, index) => `${field} = $${index + 1}`).join(", ");
    const query = `UPDATE job_seeker_profiles SET ${setQuery}, updated_at=CURRENT_TIMESTAMP WHERE profile_id = $${fields.length + 1} RETURNING *`;

    const result = await pool.query(query, [...values, id]);

    res.status(200).json({ message: "Profile updated successfully", profile: result.rows[0] });
});

// DELETE
export const deleteProfile = asyncHandler(async (req: UserRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;
    const { role, user_id } = req.user;

    const check = await pool.query("SELECT * FROM job_seeker_profiles WHERE profile_id = $1", [id]);

    if (check.rows.length === 0) {
        return res.status(404).json({ message: "Profile not found" });
    }

    const profile = check.rows[0];

    if (role !== "job_seeker" || profile.user_id !== user_id) {
        return res.status(403).json({ message: "You can only delete your own profile" });
    }

    await pool.query("DELETE FROM job_seeker_profiles WHERE profile_id = $1", [id]);
    res.status(200).json({ message: "Profile deleted" });
});
