import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  videoUrl: { type: String, required: true },
  transcript: { type: String, default: "" },
  order: { type: Number, default: 0 },
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  thumbnail: { type: String },
  tutor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  videos: [videoSchema],
  createdAt: { type: Date, default: Date.now },
  payment: {
    type: String,
    enum: ["free", "paid"],
    default: "free",
  },
  price: { type: Number, default: 0 },
});

export default mongoose.model("Course", courseSchema);