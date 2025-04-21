import express from 'express'
import { createSkill, deleteSkill, getSkillById, getSkills, updateSkill } from '../controllers/skillsControllers'



const router = express.Router()



router.get("/",getSkills),
router.post("/", createSkill),
router.delete("/:id", deleteSkill),
router.get("/:id", getSkillById),
router.put("/:id", updateSkill)

export default router
