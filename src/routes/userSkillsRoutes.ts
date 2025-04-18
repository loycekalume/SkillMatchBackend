import express from "express";
import {
    addJobSeekerSkill,
    getAllJobSeekerSkills,
    getSkillsByJobSeeker,
    updateJobSeekerSkill,
    deleteJobSeekerSkill
} from "../controllers/userSkillsContollers";
import { protect } from "../middlewares/auth/protect";

const router = express.Router();
router.use(protect);

router.post("/", addJobSeekerSkill);
router.get("/", getAllJobSeekerSkills);
router.get("/:id", getSkillsByJobSeeker);
router.put("/:id", updateJobSeekerSkill);
router.delete("/:id", deleteJobSeekerSkill);

export default router;
