import { Request, Response } from "express";
import pool from "../db/db.config";
import asyncHandler from "../middlewares/asyncHandler";

// Create job seeker skill
export const addJobSeekerSkill = asyncHandler(async (req: Request, res: Response) => {
    const { job_seeker_id, skill_id, proficiency_level, years_experience } = req.body;

    try {
        const checkExisting = await pool.query(
            `SELECT id FROM job_seeker_skills WHERE job_seeker_id = $1 AND skill_id = $2`,
            [job_seeker_id, skill_id]
        );

        if (checkExisting.rows.length > 0) {
            return res.status(400).json({ message: "Skill already added to this job seeker" });
        }

        const result = await pool.query(
            `INSERT INTO job_seeker_skills (job_seeker_id, skill_id, proficiency_level, years_experience)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [job_seeker_id, skill_id, proficiency_level, years_experience]
        );

        res.status(201).json({ message: "Skill added to job seeker", skill: result.rows[0] });
    } catch (error) {
        console.error("Error adding skill to job seeker:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get all job seeker skills
export const getAllJobSeekerSkills = asyncHandler(async (_req: Request, res: Response) => {
    const result = await pool.query(
        `SELECT * FROM job_seeker_skills ORDER BY created_at DESC`
    );
    res.status(200).json(result.rows);
});

// Get skills for a specific job seeker
export const getSkillsByJobSeeker = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await pool.query(
        `SELECT jss.*, s.skill_name, s.category
         FROM job_seeker_skills jss
         JOIN skills s ON jss.skill_id = s.skill_id
         WHERE jss.job_seeker_id = $1`,
        [id]
    );

    res.status(200).json(result.rows);
});

// Update a skill for a job seeker
export const updateJobSeekerSkill = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { proficiency_level, years_experience } = req.body;

    const result = await pool.query(
        `UPDATE job_seeker_skills
         SET proficiency_level = $1,
             years_experience = $2,
             created_at = CURRENT_TIMESTAMP
         WHERE id = $3
         RETURNING *`,
        [proficiency_level, years_experience, id]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({ message: "Skill entry not found" });
    }

    res.status(200).json({ message: "Skill updated", skill: result.rows[0] });
});

// Delete a job seeker skill
export const deleteJobSeekerSkill = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await pool.query(`DELETE FROM job_seeker_skills WHERE id = $1 RETURNING *`, [id]);

    if (result.rows.length === 0) {
        return res.status(404).json({ message: "Skill entry not found" });
    }

    res.json({ message: "Skill deleted successfully" });
});
