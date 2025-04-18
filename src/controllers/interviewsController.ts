import { Request, Response } from "express";
import pool from "../db/db.config";
import asyncHandler from "../middlewares/asyncHandler";
import { UserRequest } from "../utils/types/userTypes";

// Create Interview - only employers
export const createInterview = asyncHandler(async (req: UserRequest, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized: no user info found" });
    }

    const {
        application_id,
        employer_id,
        job_seeker_id,
        interview_type,
        scheduled_date,
        duration_minutes,
        location,
        meeting_link,
        notes,
        status
    } = req.body;

    const { role, user_id } = req.user;

    if (role !== "employer") {
        return res.status(403).json({ message: "Only employers can schedule interviews" });
    }

    if (user_id !== employer_id) {
        return res.status(403).json({ message: "You can only create interviews linked to your account" });
    }

    const result = await pool.query(
        `INSERT INTO interviews (
            application_id, employer_id, job_seeker_id,
            interview_type, scheduled_date, duration_minutes,
            location, meeting_link, notes, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`,
        [
            application_id, employer_id, job_seeker_id,
            interview_type, scheduled_date, duration_minutes,
            location, meeting_link, notes, status
        ]
    );

    res.status(201).json({ message: "Interview scheduled", interview: result.rows[0] });
});

// Get All Interviews - public
export const getInterviews = asyncHandler(async (_req: UserRequest, res: Response) => {
    const result = await pool.query("SELECT * FROM interviews ORDER BY scheduled_date ASC");
    res.status(200).json(result.rows);
});

// Get Interview by ID
export const getInterviewById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM interviews WHERE interview_id = $1", [id]);

    if (result.rows.length === 0) {
        return res.status(404).json({ message: "Interview not found" });
    }

    res.status(200).json(result.rows[0]);
});

// Update Interview - only the owning employer
export const updateInterview = asyncHandler(async (req: UserRequest, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized: no user info found" });
    }

    const { id } = req.params;
    const {
        interview_type, scheduled_date, duration_minutes,
        location, meeting_link, notes, status
    } = req.body;

    const { role, user_id } = req.user;

    const check = await pool.query("SELECT * FROM interviews WHERE interview_id = $1", [id]);

    if (check.rows.length === 0) {
        return res.status(404).json({ message: "Interview not found" });
    }

    const interview = check.rows[0];

    if (role !== "employer" || interview.employer_id !== user_id) {
        return res.status(403).json({ message: "You can only update your own interviews" });
    }

    const result = await pool.query(
        `UPDATE interviews SET
            interview_type = $1,
            scheduled_date = $2,
            duration_minutes = $3,
            location = $4,
            meeting_link = $5,
            notes = $6,
            status = $7,
            updated_at = CURRENT_TIMESTAMP
         WHERE interview_id = $8
         RETURNING *`,
        [
            interview_type, scheduled_date, duration_minutes,
            location, meeting_link, notes, status, id
        ]
    );

    res.json({ message: "Interview updated", interview: result.rows[0] });
});

// Delete Interview - employer can delete their own, admin can delete any
export const deleteInterview = asyncHandler(async (req: UserRequest, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized: no user info found" });
    }

    const { id } = req.params;
    const { role, user_id } = req.user;

    const check = await pool.query("SELECT * FROM interviews WHERE interview_id = $1", [id]);
    if (check.rows.length === 0) {
        return res.status(404).json({ message: "Interview not found" });
    }

    const interview = check.rows[0];

    if (role === "admin" || (role === "employer" && interview.employer_id === user_id)) {
        await pool.query("DELETE FROM interviews WHERE interview_id = $1", [id]);
        res.json({ message: "Interview deleted" });
    } else {
        res.status(403).json({ message: "Unauthorized to delete this interview" });
    }
});
