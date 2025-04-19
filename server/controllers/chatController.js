import mongoose from 'mongoose';
import Message from '../models/Message.js';



// Get all messages for a course
export const getMessages = async (req, res) => {
  try {
    const { courseId } = req.params;
    console.log(`Fetching messages for course: ${courseId}`);

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      console.log(`Invalid course ID: ${courseId}`);
      return res.status(400).json({ message: 'Invalid course ID' });
    }

    const messages = await Message.find({ course: courseId })
      .populate('user', 'name')
      .lean();

    if (!messages) {
      console.log(`No messages found for course: ${courseId}`);
      return res.status(200).json([]);
    }

    console.log(`Found ${messages.length} messages`);
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error.message);
    res.status(500).json({ message: 'Server error while fetching messages', error: error.message });
  }
};