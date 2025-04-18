import { Request, Response } from "express";
import pool from "../db/db.config";
import asyncHandler from "../middlewares/asyncHandler";

// Create a new job skill
export const createJobSkill = asyncHandler(async (req: Request, res: Response) => {
  const { job_id, skill_id } = req.body;

  // Check if the combo already exists
  const exists = await pool.query(
    "SELECT * FROM job_skills WHERE job_id = $1 AND skill_id = $1",
    [job_id, skill_id]
  );
  if (exists.rows.length > 0) {
    return res.status(400).json({ message: "This job already has that skill assigned" });
  }

  const result = await pool.query(
    `INSERT INTO job_skills (job_id, skill_id)
     VALUES ($1, $2)
     RETURNING *`,
    [job_id, skill_id]
  );

  res.status(201).json({ message: "Job skill added", jobSkill: result.rows[0] });
});

// Get all job skills
export const getJobSkills = asyncHandler(async (req: Request, res: Response) => {
  const result = await pool.query(
    `SELECT js.*, j.title AS job_title, s.skill_name 
     FROM job_skills js
     JOIN jobs j ON js.job_id = j.job_id
     JOIN skills s ON js.skill_id = s.skill_id
     ORDER BY js.id ASC`
  );
  res.status(200).json(result.rows);
});

// Get job skills by job ID
export const getSkillsByJobId = asyncHandler(async (req: Request, res: Response) => {
  const { jobId } = req.params;
  const result = await pool.query(
    `SELECT js.*, s.skill_name 
     FROM job_skills js
     JOIN skills s ON js.skill_id = s.skill_id
     WHERE js.job_id = $1`,
    [jobId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "No skills found for this job" });
  }

  res.status(200).json(result.rows);
});

// Delete a job skill
export const deleteJobSkill = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const exists = await pool.query("SELECT * FROM job_skills WHERE id = $1", [id]);
  if (exists.rows.length === 0) {
    return res.status(404).json({ message: "Job skill not found" });
  }

  await pool.query("DELETE FROM job_skills WHERE id = $1", [id]);
  res.status(200).json({ message: "Job skill deleted successfully" });
});
