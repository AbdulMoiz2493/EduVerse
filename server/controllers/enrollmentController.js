import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import { Payment } from '../models/Payment.js'; // Import Payment model

export const enrollCourse = async (req, res) => {
  const { courseId } = req.body;
  const userId = req.user.userId;

  try {
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: userId,
      course: courseId,
    });
    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled' });
    }

    // For paid courses, verify payment
    if (course.payment === 'paid') {
      const payment = await Payment.findOne({
        user: userId,
        course: courseId,
        status: 'completed',
      });
      if (!payment) {
        return res.status(400).json({ message: 'Payment required for this course' });
      }
    }

    // Create enrollment
    const enrollment = new Enrollment({
      student: userId,
      course: courseId,
    });
    await enrollment.save();

    res.status(201).json(enrollment);
  } catch (error) {
    console.error('Error enrolling course:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getStudentEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user.userId }).populate(
      'course'
    );
    res.json(enrollments);
  } catch (error) {
    console.error('Error fetching student enrollments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCourseEnrollments = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course || course.tutor.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const enrollments = await Enrollment.find({ course: req.params.courseId }).populate(
      'student',
      'name email'
    );
    res.json(enrollments);
  } catch (error) {
    console.error('Error fetching course enrollments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};