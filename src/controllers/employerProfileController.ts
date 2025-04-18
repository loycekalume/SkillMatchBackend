import { Response } from "express";
import pool from "../db/db.config";
import asyncHandler from "../middlewares/asyncHandler";
import { UserRequest } from "../utils/types/userTypes";

// CREATE
export const createEmployerProfile = asyncHandler(async (req: UserRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { role, user_id } = req.user;

    if (role !== "employer") {
        return res.status(403).json({ message: "Only employers can create profiles" });
    }

    const {
        company_name,
        company_size,
        industry,
        company_description,
        website_url,
        logo_url,
        location
    } = req.body;

    const result = await pool.query(
        `INSERT INTO employer_profiles 
         (user_id, company_name, company_size, industry, company_description, website_url, logo_url, location)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [user_id, company_name, company_size, industry, company_description, website_url, logo_url, location]
    );

    res.status(201).json({ message: "Employer profile created", profile: result.rows[0] });
});

// GET ALL
export const getEmployerProfiles = asyncHandler(async (_req: UserRequest, res: Response) => {
    const result = await pool.query("SELECT * FROM employer_profiles ORDER BY profile_id ASC");
    res.status(200).json(result.rows);
});

// GET ONE
export const getEmployerProfileById = asyncHandler(async (req: UserRequest, res: Response) => {
    const { id } = req.params;

    const result = await pool.query("SELECT * FROM employer_profiles WHERE profile_id = $1", [id]);

    if (result.rows.length === 0) {
        return res.status(404).json({ message: "Employer profile not found" });
    }

    res.status(200).json(result.rows[0]);
});

// PUT
export const putEmployerProfile = asyncHandler(async (req: UserRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;
    const { role, user_id } = req.user;

    const check = await pool.query("SELECT * FROM employer_profiles WHERE profile_id = $1", [id]);

    if (check.rows.length === 0) {
        return res.status(404).json({ message: "Employer profile not found" });
    }

    const profile = check.rows[0];

    if (role !== "employer" || profile.user_id !== user_id) {
        return res.status(403).json({ message: "You can only update your own employer profile" });
    }

    const {
        company_name,
        company_size,
        industry,
        company_description,
        website_url,
        logo_url,
        location
    } = req.body;

    const result = await pool.query(
        `UPDATE employer_profiles
         SET company_name=$1, company_size=$2, industry=$3, company_description=$4, website_url=$5,
             logo_url=$6, location=$7, updated_at=CURRENT_TIMESTAMP
         WHERE profile_id=$8 RETURNING *`,
        [company_name, company_size, industry, company_description, website_url, logo_url, location, id]
    );

    res.status(200).json({ message: "Employer profile updated", profile: result.rows[0] });
});

// PATCH
export const patchEmployerProfile = asyncHandler(async (req: UserRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;
    const { role, user_id } = req.user;

    const check = await pool.query("SELECT * FROM employer_profiles WHERE profile_id = $1", [id]);

    if (check.rows.length === 0) {
        return res.status(404).json({ message: "Employer profile not found" });
    }

    const profile = check.rows[0];

    if (role !== "employer" || profile.user_id !== user_id) {
        return res.status(403).json({ message: "You can only update your own employer profile" });
    }

    const fields = Object.keys(req.body);
    const values = Object.values(req.body);

    if (fields.length === 0) {
        return res.status(400).json({ message: "No fields provided for update" });
    }

    const setQuery = fields.map((field, index) => `${field} = $${index + 1}`).join(", ");
    const query = `UPDATE employer_profiles SET ${setQuery}, updated_at=CURRENT_TIMESTAMP WHERE profile_id = $${fields.length + 1} RETURNING *`;

    const result = await pool.query(query, [...values, id]);

    res.status(200).json({ message: "Employer profile updated", profile: result.rows[0] });
});

// DELETE
export const deleteEmployerProfile = asyncHandler(async (req: UserRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;
    const { role, user_id } = req.user;

    const check = await pool.query("SELECT * FROM employer_profiles WHERE profile_id = $1", [id]);

    if (check.rows.length === 0) {
        return res.status(404).json({ message: "Employer profile not found" });
    }

    const profile = check.rows[0];

    if (role !== "employer" || profile.user_id !== user_id) {
        return res.status(403).json({ message: "You can only delete your own employer profile" });
    }

    await pool.query("DELETE FROM employer_profiles WHERE profile_id = $1", [id]);
    res.status(200).json({ message: "Employer profile deleted" });
});
