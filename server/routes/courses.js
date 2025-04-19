import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/multer.js';
import {
  createCourse,
  uploadVideo,
  updateCourse,
  reorderVideos,
  deleteVideo,
  getTutorCourses,
  getAllCourses,
  getCourse,
  deleteCourse,
} from '../controllers/courseController.js';

const router = express.Router();

router.use(authenticate);

router.post('/', upload.single('thumbnail'), createCourse);
router.post('/:courseId/videos', upload.single('video'), uploadVideo);
router.put('/:courseId', upload.single('thumbnail'), updateCourse);
router.put('/:courseId/videos/reorder', reorderVideos);
router.delete('/:courseId/videos/:videoId', deleteVideo);
router.delete('/:courseId', deleteCourse);
router.get('/tutor', getTutorCourses);
router.get('/', getAllCourses);
router.get('/:id', getCourse);

export default router;