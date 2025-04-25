import Notification from '../models/Notification.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';

// Create a notification
export const createNotification = async ({ userId, type, message, courseId }) => {
  try {
    const notification = new Notification({
      user: userId,
      type,
      message,
      course: courseId || null,
      read: false,
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Get notifications for a user
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.userId })
      .populate('course', 'title')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (req, res) => {
  const { notificationId } = req.params;

  try {
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    if (notification.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    notification.read = true;
    await notification.save();
    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.userId, read: false },
      { read: true }
    );
    const notifications = await Notification.find({ user: req.user.userId })
      .populate('course', 'title')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get unread notification count
export const getUnreadNotificationCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user.userId,
      read: false,
    });
    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread notification count:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to notify tutor on course enrollment
export const notifyTutorOnEnrollment = async (courseId, studentId) => {
  try {
    const course = await Course.findById(courseId).populate('tutor', 'name');
    if (!course) return;

    const student = await mongoose.model('User').findById(studentId);
    if (!student) return;

    await createNotification({
      userId: course.tutor._id,
      type: 'course_enrollment',
      message: `${student.name} has enrolled in your course: ${course.title}`,
      courseId,
    });
  } catch (error) {
    console.error('Error notifying tutor on enrollment:', error);
  }
};

// Helper function to notify students on video upload
export const notifyStudentsOnVideoUpload = async (courseId, videoTitle) => {
  try {
    const course = await Course.findById(courseId);
    if (!course) return;

    const enrollments = await Enrollment.find({ course: courseId }).populate('student', 'name');
    for (const enrollment of enrollments) {
      await createNotification({
        userId: enrollment.student._id,
        type: 'video_upload',
        message: `New video "${videoTitle}" uploaded to your course: ${course.title}`,
        courseId,
      });
    }
  } catch (error) {
    console.error('Error notifying students on video upload:', error);
  }
};

// controllers/notificationController.js
export const notifyUserOnMessage = async (courseId, senderId, recipientId, messageContent) => {
  try {
    const course = await Course.findById(courseId);
    if (!course) return;

    const sender = await mongoose.model('User').findById(senderId);
    if (!sender) return;

    const messagePreview = messageContent.length > 50 
      ? `${messageContent.substring(0, 50)}...` 
      : messageContent;

    await createNotification({
      userId: recipientId,
      type: 'new_message',
      message: `New message from ${sender.name} in course: ${course.title}: "${messagePreview}"`,
      courseId,
    });
  } catch (error) {
    console.error('Error notifying user on new message:', error);
  }
};