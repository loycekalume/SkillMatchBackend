import { Request, Response } from "express";
import pool from "../db/db.config";
import asyncHandler from "../middlewares/asyncHandler";

// Create a skill
export const createSkill = asyncHandler(async (req: Request, res: Response) => {
    const { skill_name, category } = req.body;

    const existing = await pool.query("SELECT skill_id FROM skills WHERE skill_name = $1", [skill_name]);
    if (existing.rows.length > 0) {
        return res.status(400).json({ message: "Skill already exists" });
    }

    const result = await pool.query(
        `INSERT INTO skills (skill_name, category) 
         VALUES ($1, $2) 
         RETURNING *`,
        [skill_name, category]
    );

    res.status(201).json({ message: "Skill created", skill: result.rows[0] });
});

// Get all skills
export const getSkills = asyncHandler(async (_req: Request, res: Response) => {
    const result = await pool.query("SELECT * FROM skills ORDER BY skill_id ASC");
    res.status(200).json(result.rows);
});

// Get skill by ID
export const getSkillById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await pool.query("SELECT * FROM skills WHERE skill_id = $1", [id]);
    if (result.rows.length === 0) {
        return res.status(404).json({ message: "Skill not found" });
    }

    res.status(200).json(result.rows[0]);
});

// Update a skill
export const updateSkill = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { skill_name, category } = req.body;

    const result = await pool.query(
        `UPDATE skills 
         SET skill_name = $1, category = $2, created_at = CURRENT_TIMESTAMP 
         WHERE skill_id = $3 
         RETURNING *`,
        [skill_name, category, id]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({ message: "Skill not found or update failed" });
    }

    res.json({ message: "Skill updated", skill: result.rows[0] });
});

// Delete a skill
export const deleteSkill = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await pool.query("DELETE FROM skills WHERE skill_id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
        return res.status(404).json({ message: "Skill not found" });
    }

    res.json({ message: "Skill deleted", deletedSkill: result.rows[0] });
});
