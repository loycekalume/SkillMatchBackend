import express from "express";
import { createCareerPath, getAllCareerPaths } from "../controllers/careerpathController";


const router = express.Router();

router.get("/", getAllCareerPaths);
router.post("/", createCareerPath);

export default router;
