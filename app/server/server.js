import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import courseRoutes from './routes/courses.js';
import chatRoutes from './routes/chat.js';
import enrollmentRoutes from './routes/enrollment.js';
import { Server } from 'socket.io';
import http from 'http';
import Message from './models/Message.js';
import { upload } from './middleware/multer.js'; // Adjust path as needed
import notificationRoutes from './routes/notificationRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js'; // Adjust path as needed

dotenv.config();

const app = express();
const server = http.createServer(app);

// Configure CORS for Express
app.use(cors({
  origin: 'http://localhost:5173', // Update to match the frontend's origin
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Configure Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // Update to match the frontend's origin
    credentials: true,
    methods: ['GET', 'POST'],
  },
});

app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/enrollment', enrollmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes); // Adjust path as needed

// Socket.IO for real-time chat
io.on('connection', (socket) => {
  console.log('New Socket.IO connection:', socket.id);

  socket.on('joinRoom', ({ courseId }) => {
    socket.join(courseId);
    console.log(`User joined room: ${courseId}`);
  });

  socket.on('sendMessage', async ({ courseId, userId, message }) => {
    try {
      console.log('Received sendMessage event:', { courseId, userId, message });

      // Save the message to the database
      const newMessage = new Message({
        course: courseId,
        user: userId,
        content: message,
      });
      await newMessage.save();
      console.log('Message saved to database:', newMessage);

      // Populate user details
      const populatedMessage = await Message.findById(newMessage._id)
        .populate('user', 'name')
        .lean();
      console.log('Populated message:', populatedMessage);

      // Ensure the populated user field exists
      if (!populatedMessage.user || !populatedMessage.user.name) {
        throw new Error('User population failed or user name not found');
      }

      // Construct the message to emit
      const messageToEmit = {
        _id: populatedMessage._id.toString(),
        user: {
          _id: userId,
          name: populatedMessage.user.name,
        },
        content: message,
        createdAt: newMessage.createdAt,
      };

      // Emit the message to the room
      io.to(courseId).emit('message', messageToEmit);
      console.log('Message emitted to room:', courseId, messageToEmit);
    } catch (error) {
      console.error('Error in sendMessage:', error.message);
    }
  });

  socket.on('error', (error) => {
    console.error('Socket.IO error:', error);
  });

  socket.on('disconnect', () => {
    console.log('Socket.IO disconnected:', socket.id);
  });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(process.env.PORT || 5000, () => {
      console.log('Server running on port 5000');
    });
  })
  .catch((err) => console.error('MongoDB connection error:', err));