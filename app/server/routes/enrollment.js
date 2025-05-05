import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  enrollCourse,
  getStudentEnrollments,
  getCourseEnrollments,
} from '../controllers/enrollmentController.js';

const router = express.Router();

router.use(authenticate);

router.post('/', enrollCourse);
router.get('/student', getStudentEnrollments);
router.get('/course/:courseId', getCourseEnrollments);

export default router;