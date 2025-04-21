


import express from 'express'
import {  deleteUser, getUsers, getUserById, putUser } from '../controllers/userController'



const router = express.Router()


router.get("/",getUsers);
router.put("/",putUser );
router.delete("/:id", deleteUser);
router.get("/:id", getUserById);


export default router