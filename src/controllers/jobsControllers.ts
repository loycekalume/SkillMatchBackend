import { Request, Response } from "express";
import pool from "../db/db.config";
import asyncHandler from "../middlewares/asyncHandler";
import { UserRequest } from "../utils/types/userTypes";

// Create Job - Only Employers
// Create Job - Only Employers
export const createJob = asyncHandler(async (req: UserRequest, res: Response) => {
    if (req.user?.role !== "employer") {
      return res.status(403).json({ message: "Only employers can post jobs" });
    }
  
    const {
      title,
      description,
      location,
      job_type,
      work_arrangement,
      experience_level,
      education_required,
      salary_min,
      salary_max,
      application_deadline
    } = req.body;
  
    // ✅ Step 1: Get employer's profile_id using user_id
    const profileQuery = await pool.query(
      `SELECT profile_id FROM employer_profiles WHERE user_id = $1`,
      [req.user.user_id]
    );
  
    if (profileQuery.rows.length === 0) {
      return res.status(404).json({ message: "Employer profile not found. Please complete your profile first." });
    }
  
    const employerId = profileQuery.rows[0].profile_id;
  
    // ✅ Step 2: Use profile_id as employer_id in the INSERT query
    const result = await pool.query(
      `INSERT INTO jobs (
        title,
        description,
        location,
        job_type,
        work_arrangement,
        experience_level,
        education_required,
        salary_min,
        salary_max,
        application_deadline,
        employer_id
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *`,
      [
        title,
        description,
        location,
        job_type,
        work_arrangement,
        experience_level,
        education_required,
        salary_min,
        salary_max,
        application_deadline,
        employerId // <-- this is the correct foreign key
      ]
    );
  
    res.status(201).json(result.rows[0]);
  });
  
  

// Get All Jobs - Public
export const getJobs = asyncHandler(async (req: Request, res: Response) => {
  const result = await pool.query("SELECT * FROM jobs ORDER BY created_at DESC");
  res.status(200).json(result.rows);
});

// Get Single Job
export const getJobById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await pool.query("SELECT * FROM jobs WHERE job_id = $1", [id]);
  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Job not found" });
  }
  res.status(200).json(result.rows[0]);
});

// Update Job - Employer Owns It
// Update Job - Employer Owns It
export const updateJob = asyncHandler(async (req: UserRequest, res: Response) => {
    const { id } = req.params;
  
    // ✅ Step 1: Get the employer's profile_id
    const profileQuery = await pool.query(
      `SELECT profile_id FROM employer_profiles WHERE user_id = $1`,
      [req.user?.user_id]
    );
  
    if (profileQuery.rows.length === 0) {
      return res.status(404).json({ message: "Employer profile not found. Please complete your profile first." });
    }
  
    const employerId = profileQuery.rows[0].profile_id;
  
    const job = await pool.query("SELECT * FROM jobs WHERE job_id = $1", [id]);
    if (job.rows.length === 0) {
      return res.status(404).json({ message: "Job not found" });
    }
  
    const jobData = job.rows[0];
    if (employerId !== jobData.employer_id) {
      return res.status(403).json({ message: "You can only update your own job postings" });
    }
  
    const {
      title,
      description,
      location,
      job_type,
      work_arrangement,
      experience_level,
      education_required,
      salary_min,
      salary_max,
      application_deadline
    } = req.body;
  
    
    const updated = await pool.query(
      `UPDATE jobs SET
        title = $1,
        description = $2,
        location = $3,
        job_type = $4,
        work_arrangement = $5,
        experience_level = $6,
        education_required = $7,
        salary_min = $8,
        salary_max = $9,
        application_deadline = $10,
        updated_at = CURRENT_TIMESTAMP
      WHERE job_id = $11
      RETURNING *`,
      [
        title,
        description,
        location,
        job_type,
        work_arrangement,
        experience_level,
        education_required,
        salary_min,
        salary_max,
        application_deadline,
        id
      ]
    );
  
    res.status(200).json(updated.rows[0]);
  });
  


export const deleteJob = asyncHandler(async (req: UserRequest, res: Response) => {
  const { id } = req.params;

  const job = await pool.query("SELECT * FROM jobs WHERE job_id = $1", [id]);
  if (job.rows.length === 0) {
    return res.status(404).json({ message: "Job not found" });
  }

  const jobData = job.rows[0];
  const isOwner = req.user?.user_id === jobData.employer_id;
  const isAdmin = req.user?.role === "admin";

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: "Not authorized to delete this job" });
  }

  await pool.query("DELETE FROM jobs WHERE job_id = $1", [id]);
  res.json({ message: "Job deleted successfully" });
});
