import express from "express";
import {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
} from "../controllers/jobsControllers";
import { protect, requireRole } from "../middlewares/auth/protect";

const router = express.Router();
router.use(protect);
router.get("/", getJobs);
router.get("/:id", getJobById);

// Protected (only employer or admin can modify jobs)
router.post("/", protect, requireRole(["employer"]), createJob);
router.put("/:id", protect, requireRole(["employer"]), updateJob);
router.delete("/:id", protect, requireRole(["employer", "admin"]), deleteJob);

export default router;
