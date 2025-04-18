import express from "express";
import {
  createJobSkill,
  getJobSkills,
  getSkillsByJobId,
  deleteJobSkill,
} from "../controllers/jobskillController";
import { protect, requireRole } from "../middlewares/auth/protect";

const router = express.Router();
router.use(protect);
router.use(requireRole(["employer", "admin"]));

router.post("/", createJobSkill);
router.get("/", getJobSkills);
router.get("/:jobId", getSkillsByJobId);
router.delete("/:id", deleteJobSkill);

export default router;
