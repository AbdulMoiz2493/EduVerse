import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/multer.js';
import { generateTranscript } from '../utils/transcriptGenerator.js';
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
router.post('/:courseId/videos/:videoId/transcript', async (req, res) => {
  try {
    const { courseId, videoId } = req.params;
    // Fetch video details (assuming videoUrl is stored in the database)
    const video = await Video.findById(videoId); // Adjust based on your model
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Generate transcript
    const transcript = await generateTranscript(video.videoUrl);

    // Update video with transcript
    video.transcript = transcript;
    await video.save();

    res.json({ transcript });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

export default router;