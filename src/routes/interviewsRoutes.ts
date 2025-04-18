import express from 'express';
import { createInterview, getInterviews, getInterviewById, updateInterview, deleteInterview } from '../controllers/interviewsController';
import { protect } from '../middlewares/auth/protect';

const router = express.Router();
router.use(protect);

router.post('/', createInterview);


router.get('/', getInterviews);


router.get('/:id', getInterviewById);


router.put('/:id', updateInterview);


router.delete('/:id', deleteInterview);

export default router;
