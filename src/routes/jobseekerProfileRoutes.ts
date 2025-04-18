
import express from 'express'
import {  createProfile, deleteProfile, getProfileById, getProfiles, patchProfile, putProfile } from '../controllers/jobseekerProfileController'
import { protect, requireRole } from '../middlewares/auth/protect';


const router = express.Router()
router.use(protect);


router.get("/", getProfiles),
router.post("/", createProfile),
router.put("/:id", putProfile),
router.patch("/:id", patchProfile),
router.delete("/:id", deleteProfile),
router.get("/:id", getProfileById)




export default router