import mongoose from "mongoose";
import Course from "../models/Course.js";
import { generateTranscript } from "../utils/transcriptGenerator.js";

export const createCourse = async (req, res) => {
  const { title, description, payment, price } = req.body;
  const thumbnail = req.file?.path;

  try {
    if (!title || !description || !payment) {
      return res.status(400).json({ message: "Title, description, and payment type are required" });
    }

    if (payment === "paid" && (!price || price <= 0)) {
      return res.status(400).json({ message: "Price is required for paid courses" });
    }

    const course = new Course({
      title,
      description,
      thumbnail,
      tutor: req.user.userId,
      payment,
      price: payment === "paid" ? parseFloat(price) : 0,
    });
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const uploadVideo = async (req, res) => {
  const { title } = req.body;
  const { courseId } = req.params;

  if (!req.file || !req.file.path) {
    return res.status(400).json({ message: "Video file is required" });
  }

  const videoUrl = req.file.path;

  try {
    const course = await Course.findById(courseId).populate("tutor", "name");

    if (!course || course.tutor._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    let transcript = "";
    try {
      if (videoUrl) {
        transcript = await generateTranscript(videoUrl);
      }
    } catch (transcriptionError) {
      console.error("Transcription error:", transcriptionError.message);
      transcript = "Transcription unavailable";
    }

    course.videos.push({
      title,
      videoUrl,
      transcript,
      order: course.videos.length,
    });

    await course.save();
    
    const updatedCourse = await Course.findById(courseId).populate("tutor", "name");
    res.json(updatedCourse);
  } catch (error) {
    console.error("Error uploading video:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateCourse = async (req, res) => {
  const { courseId } = req.params;
  const { title, description, removeThumbnail, payment, price } = req.body;
  const thumbnail = req.file?.path;

  try {
    const course = await Course.findById(courseId).populate("tutor", "name");

    if (!course || course.tutor._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (!title || !description || !payment) {
      return res.status(400).json({ message: "Title, description, and payment type are required" });
    }

    if (payment === "paid" && (!price || price <= 0)) {
      return res.status(400).json({ message: "Price is required for paid courses" });
    }

    course.title = title;
    course.description = description;
    course.payment = payment;
    course.price = payment === "paid" ? parseFloat(price) : 0;

    if (removeThumbnail === "true") {
      course.thumbnail = undefined;
    } else if (thumbnail) {
      course.thumbnail = thumbnail;
    }

    try {
      await course.save();
    } catch (saveError) {
      console.error("Error saving course:", saveError);
      return res.status(500).json({ message: "Failed to save course to database" });
    }

    const updatedCourse = await Course.findById(courseId).populate("tutor", "name");
    res.json(updatedCourse);
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const reorderVideos = async (req, res) => {
  const { videoOrder } = req.body;
  const { courseId } = req.params;

  try {
    const course = await Course.findById(courseId).populate("tutor", "name");

    if (!course || course.tutor._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    course.videos = videoOrder.map((id, index) => ({
      ...course.videos.find((v) => v._id.toString() === id),
      order: index,
    }));

    await course.save();
    const updatedCourse = await Course.findById(courseId).populate("tutor", "name");
    res.json(updatedCourse);
  } catch (error) {
    console.error("Error reordering videos:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteVideo = async (req, res) => {
  const { courseId, videoId } = req.params;

  try {
    const course = await Course.findById(courseId).populate("tutor", "name");

    if (!course || course.tutor._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    course.videos = course.videos.filter((v) => v._id.toString() !== videoId);
    await course.save();
    const updatedCourse = await Course.findById(courseId).populate("tutor", "name");
    res.json(updatedCourse);
  } catch (error) {
    console.error("Error deleting video:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getTutorCourses = async (req, res) => {
  try {
    const courses = await Course.find({ tutor: req.user.userId }).populate("tutor", "name");
    res.json(courses);
  } catch (error) {
    console.error("Error fetching tutor courses:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate("tutor", "name");
    res.json(courses);
  } catch (error) {
    console.error("Error fetching all courses:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getCourse = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    const course = await Course.findById(id).populate("tutor", "name").lean();
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json(course);
  } catch (error) {
    console.error("Error fetching course:", error.message);
    res.status(500).json({ message: "Server error while fetching course" });
  }
};

export const deleteCourse = async (req, res) => {
  const { courseId } = req.params;

  try {
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.tutor.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await course.deleteOne();
    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const generateVideoTranscript = async (req, res) => {
  const { courseId, videoId } = req.params;

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const video = course.videos.find((v) => v._id.toString() === videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    if (video.transcript && video.transcript !== "Transcription unavailable") {
      return res.status(200).json({ transcript: video.transcript });
    }

    const transcript = await generateTranscript(video.videoUrl);
    video.transcript = transcript;
    await course.save();

    res.status(200).json({ transcript });
  } catch (error) {
    console.error("Error generating transcript:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};