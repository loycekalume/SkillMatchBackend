import { Router } from "express";
import {
    createApplication,
    getApplications,
    getApplicationById,
    updateApplication,
    deleteApplication
} from "../controllers/applicationContoller";
import { protect } from "../middlewares/auth/protect";

const router = Router();


router.post("/", createApplication);
router.get("/", getApplications);
router.get("/:id", getApplicationById);
router.put("/:id", updateApplication);
router.delete("/:id", deleteApplication);

export default router;
