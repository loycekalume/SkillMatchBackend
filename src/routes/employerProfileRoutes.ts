
import express from 'express'

import { createEmployerProfile, deleteEmployerProfile, getEmployerProfileById, getEmployerProfiles, patchEmployerProfile, putEmployerProfile } from '../controllers/employerProfileController'
import { protect, requireRole } from '../middlewares/auth/protect';


const router = express.Router()
router.use(protect);


router.get("/", getEmployerProfiles),
router.post("/", createEmployerProfile),
router.put("/:id", putEmployerProfile),
router.patch("/:id", patchEmployerProfile),
router.delete("/:id", deleteEmployerProfile),
router.get("/:id", getEmployerProfileById)




export default router