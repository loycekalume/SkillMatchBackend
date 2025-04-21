import { Request, Response } from "express";
import pool from "../db/db.config";
import asyncHandler from "../middlewares/asyncHandler";

// GET all career paths
export const getAllCareerPaths = asyncHandler(async(req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM career_paths");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching career paths:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST create a new career path
export const createCareerPath = asyncHandler(async (req: Request, res: Response) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: "Title and description are required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO career_paths (title, description) VALUES ($1, $2) RETURNING *",
      [title, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating career path:", error);
    res.status(500).json({ message: "Server error" });
  }
});
