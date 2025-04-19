import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';

export const enrollCourse = async (req, res) => {
  const { courseId } = req.body;

  try {
    const existingEnrollment = await Enrollment.findOne({
      student: req.user.userId,
      course: courseId,
    });

    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled' });
    }

    const enrollment = new Enrollment({
      student: req.user.userId,
      course: courseId,
    });

        

    await enrollment.save();
    
    res.status(201).json(enrollment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getStudentEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user.userId })
      .populate('course');
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCourseEnrollments = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    
    if (!course || course.tutor.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const enrollments = await Enrollment.find({ course: req.params.courseId })
      .populate('student', 'name email');
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

