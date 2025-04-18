import { Request, Response } from "express";
import pool from "../db/db.config";
import asyncHandler from "../middlewares/asyncHandler";
import { UserRequest } from "../utils/types/userTypes";

// Create Job - Only Employers
export const createJob = asyncHandler(async (req: UserRequest, res: Response) => {
  if (req.user?.role !== "employer") {
    return res.status(403).json({ message: "Only employers can post jobs" });
  }

  const {
    title,
    description,
    location,
    salary,
    company_name,
    company_description,
    contact_email,
    contact_phone,
    employment_type,
    experience_level,
    is_remote,
    application_deadline
  } = req.body;

  const result = await pool.query(
    `INSERT INTO jobs (
      title,
      description,
      location,
      salary,
      company_name,
      company_description,
      contact_email,
      contact_phone,
      employment_type,
      experience_level,
      is_remote,
      application_deadline,
      employer_id
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
    RETURNING *`,
    [
      title,
      description,
      location,
      salary,
      company_name,
      company_description,
      contact_email,
      contact_phone,
      employment_type,
      experience_level,
      is_remote,
      application_deadline,
      req.user.user_id
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
export const updateJob = asyncHandler(async (req: UserRequest, res: Response) => {
  const { id } = req.params;

  const job = await pool.query("SELECT * FROM jobs WHERE job_id = $1", [id]);
  if (job.rows.length === 0) {
    return res.status(404).json({ message: "Job not found" });
  }

  const jobData = job.rows[0];
  if (req.user?.user_id !== jobData.employer_id) {
    return res.status(403).json({ message: "You can only update your own job postings" });
  }

  const {
    title,
    description,
    location,
    salary,
    company_name,
    company_description,
    contact_email,
    contact_phone,
    employment_type,
    experience_level,
    is_remote,
    application_deadline
  } = req.body;

  const updated = await pool.query(
    `UPDATE jobs SET
      title = $1,
      description = $2,
      location = $3,
      salary = $4,
      company_name = $5,
      company_description = $6,
      contact_email = $7,
      contact_phone = $8,
      employment_type = $9,
      experience_level = $10,
      is_remote = $11,
      application_deadline = $12,
      updated_at = CURRENT_TIMESTAMP
    WHERE job_id = $13
    RETURNING *`,
    [
      title,
      description,
      location,
      salary,
      company_name,
      company_description,
      contact_email,
      contact_phone,
      employment_type,
      experience_level,
      is_remote,
      application_deadline,
      id
    ]
  );

  res.status(200).json(updated.rows[0]);
});

// Delete Job - Employer Owns It or Admin
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
