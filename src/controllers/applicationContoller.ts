import { Request, Response } from "express";
import pool from "../db/db.config";
import asyncHandler from "../middlewares/asyncHandler";

// Create Application
export const createApplication = asyncHandler(async (req: Request, res: Response) => {
    const { job_id, job_seeker_id, cover_letter, resume_url, match_percentage } = req.body;

    const existing = await pool.query(
        `SELECT * FROM applications WHERE job_id = $1 AND job_seeker_id = $2`,
        [job_id, job_seeker_id]
    );
    if (existing.rows.length > 0) {
        return res.status(400).json({ message: "Application already exists for this job and job seeker" });
    }

    const result = await pool.query(
        `INSERT INTO applications (job_id, job_seeker_id, cover_letter, resume_url, match_percentage)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [job_id, job_seeker_id, cover_letter, resume_url, match_percentage]
    );

    res.status(201).json({ message: "Application submitted", application: result.rows[0] });
});

// Get All Applications
export const getApplications = asyncHandler(async (_req: Request, res: Response) => {
    const result = await pool.query("SELECT * FROM applications ORDER BY application_id ASC");
    res.status(200).json(result.rows);
});

// Get Application by ID
export const getApplicationById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM applications WHERE application_id = $1", [id]);

    if (result.rows.length === 0) {
        return res.status(404).json({ message: "Application not found" });
    }

    res.status(200).json(result.rows[0]);
});

// Update Application (Status, Cover Letter, etc.)
export const updateApplication = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { cover_letter, resume_url, status, match_percentage } = req.body;

    const check = await pool.query("SELECT * FROM applications WHERE application_id = $1", [id]);
    if (check.rows.length === 0) {
        return res.status(404).json({ message: "Application not found" });
    }

    const result = await pool.query(
        `UPDATE applications
         SET cover_letter = $1,
             resume_url = $2,
             status = $3,
             match_percentage = $4,
             updated_at = CURRENT_TIMESTAMP
         WHERE application_id = $5
         RETURNING *`,
        [cover_letter, resume_url, status, match_percentage, id]
    );

    res.json({ message: "Application updated", application: result.rows[0] });
});

// Delete Application
export const deleteApplication = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const check = await pool.query("SELECT * FROM applications WHERE application_id = $1", [id]);
    if (check.rows.length === 0) {
        return res.status(404).json({ message: "Application not found" });
    }

    await pool.query("DELETE FROM applications WHERE application_id = $1", [id]);
    res.json({ message: "Application deleted" });
});
