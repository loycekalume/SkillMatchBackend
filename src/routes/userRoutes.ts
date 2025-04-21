


import express from 'express'
import {  deleteUser, getUsers, getUserById, putUser } from '../controllers/userController'
import { protect, requireRole } from '../middlewares/auth/protect';


const router = express.Router()
// router.use(protect); 

router.get("/",getUsers),
router.put("/",putUser ),
router.delete("/:id", deleteUser),
router.get("/:id", getUserById)


export default router