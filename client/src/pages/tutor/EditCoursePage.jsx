import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { courseApi } from "../../utils/api";
import { useToast } from "../../hooks/use-toast";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  ArrowLeft,
  Upload,
  Plus,
  Save,
  Trash2,
  GripVertical,
  Video,
  GraduationCap
} from "lucide-react";
import { motion } from "framer-motion";

export const EditCoursePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [course, setCourse] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [videos, setVideos] = useState([]);
  const [newVideo, setNewVideo] = useState({
    title: "",
    file: null,
  });
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [savingCourse, setSavingCourse] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await courseApi.getCourse(id);
        setCourse(res.data);
        setTitle(res.data.title);
        setDescription(res.data.description);
        setVideos(res.data.videos || []);
        if (res.data.thumbnail) {
          setThumbnailPreview(`http://localhost:5000/${res.data.thumbnail}`);
        }
      } catch (error) {
        console.error("Error fetching course:", error);
        toast({
          title: "Error",
          description: "Failed to load course details",
          variant: "destructive",
        });
        navigate("/tutor");
      } finally {
        setLoadingCourse(false);
      }
    };

    fetchCourse();
  }, [id, navigate, toast]);

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      const reader = new FileReader();
      reader.onload = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewVideo({ ...newVideo, file });
    }
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast({
        title: "Error",
        description: "Title and description are required",
        variant: "destructive",
      });
      return;
    }
    setSavingCourse(true);
    try {
      const courseData = {
        title: title.trim(),
        description: description.trim(),
      };
      if (thumbnail) {
        courseData.thumbnail = thumbnail;
      }
      await courseApi.updateCourse(id, courseData);
      toast({
        title: "Success!",
        description: "Course details updated successfully",
      });
    } catch (error) {
      console.error("Error updating course:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update course",
        variant: "destructive",
      });
    } finally {
      setSavingCourse(false);
    }
  };

  const handleAddVideo = async (e) => {
    e.preventDefault();
    if (!newVideo.title.trim() || !newVideo.file) {
      toast({
        title: "Error",
        description: "Video title and file are required",
        variant: "destructive",
      });
      return;
    }
    setUploadingVideo(true);
    try {
      const videoData = {
        title: newVideo.title.trim(),
        video: newVideo.file,
      };
      const res = await courseApi.uploadVideo(id, videoData);
      setVideos(res.data.videos || []);
      setNewVideo({ title: "", file: null });
      toast({
        title: "Success!",
        description: "Video uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading video:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to upload video",
        variant: "destructive",
      });
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    try {
      await courseApi.deleteVideo(id, videoId);
      setVideos(videos.filter(video => video._id !== videoId));
      toast({
        title: "Success!",
        description: "Video deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting video:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete video",
        variant: "destructive",
      });
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const items = Array.from(videos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setVideos(items);
    try {
      await courseApi.reorderVideos(id, items.map(item => item._id));
    } catch (error) {
      console.error("Error reordering videos:", error);
      toast({
        title: "Error",
        description: "Failed to save video order",
        variant: "destructive",
      });
    }
  };

  if (loadingCourse) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-indigo-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow sticky top-0 z-50 backdrop-blur-md bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-2"
            >
              <div className="bg-gradient-to-r from-indigo-600 to-purple-500 w-10 h-10 rounded-xl flex items-center justify-center text-white">
                <span className="font-bold text-xl">E</span>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-indigo-700 to-purple-600 bg-clip-text text-transparent">EduVerse</span>
            </motion.div>
            <div className="flex items-center space-x-4">
              <Link to="/tutor">
                <Button variant="outline" className="border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-indigo-100 text-indigo-700 py-1 px-4">EDIT COURSE</Badge>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
            Refine Your Course
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Update course details and add videos to enhance the learning experience.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Course Details Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <GraduationCap className="w-5 h-5 mr-2 text-indigo-600" /> Course Details
              </h2>
              <form onSubmit={handleSaveCourse}>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Course Title *
                    </label>
                    <Input
                      id="title"
                      type="text"
                      placeholder="Enter a descriptive title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Course Description *
                    </label>
                    <textarea
                      id="description"
                      placeholder="Provide detailed information about your course"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={6}
                      className="w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Course Thumbnail Image
                    </label>
                    <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-xl">
                      <div className="space-y-2 text-center">
                        {thumbnailPreview ? (
                          <div className="mb-3">
                            <img
                              src={thumbnailPreview}
                              alt="Thumbnail preview"
                              className="h-40 mx-auto object-cover rounded-lg"
                            />
                          </div>
                        ) : (
                          <Upload className="mx-auto h-12 w-12 text-indigo-400" />
                        )}
                        <div className="flex justify-center">
                          <label htmlFor="thumbnail" className="cursor-pointer bg-indigo-50 py-2 px-4 border border-indigo-200 rounded-md shadow-sm text-sm font-medium text-indigo-700 hover:bg-indigo-100">
                            {thumbnailPreview ? "Change image" : "Upload image"}
                            <input
                              id="thumbnail"
                              name="thumbnail"
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={handleThumbnailChange}
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 5MB
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      className="flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white" 
                      disabled={savingCourse}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {savingCourse ? "Saving..." : "Save Course Details"}
                    </Button>
                  </div>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mt-8 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Video className="w-5 h-5 mr-2 text-indigo-600" /> Add New Video
              </h2>
              <form onSubmit={handleAddVideo}>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="videoTitle" className="block text-sm font-medium text-gray-700 mb-1">
                      Video Title *
                    </label>
                    <Input
                      id="videoTitle"
                      type="text"
                      placeholder="Enter a title for this video"
                      value={newVideo.title}
                      onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                      required
                      className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Video File *
                    </label>
                    <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-xl">
                      <div className="space-y-2 text-center">
                        {newVideo.file ? (
                          <div>
                            <Video className="mx-auto h-12 w-12 text-indigo-600" />
                            <p className="mt-2 text-sm text-gray-600">
                              {newVideo.file.name}
                            </p>
                          </div>
                        ) : (
                          <>
                            <Upload className="mx-auto h-12 w-12 text-indigo-400" />
                            <p className="mt-2 text-sm text-gray-600">
                              Click to upload or drag and drop
                            </p>
                          </>
                        )}
                        <div className="flex justify-center">
                          <label htmlFor="videoFile" className="cursor-pointer bg-indigo-50 py-2 px-4 border border-indigo-200 rounded-md shadow-sm text-sm font-medium text-indigo-700 hover:bg-indigo-100">
                            {newVideo.file ? "Change video" : "Upload video"}
                            <input
                              id="videoFile"
                              name="videoFile"
                              type="file"
                              accept="video/mp4,video/quicktime"
                              className="sr-only"
                              onChange={handleVideoFileChange}
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500">
                          MP4 or MOV format only
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      className="flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white" 
                      disabled={uploadingVideo || !newVideo.file}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {uploadingVideo ? "Uploading..." : "Add Video"}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Course Videos List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 sticky top-4 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Video className="w-5 h-5 mr-2 text-indigo-600" /> Course Videos
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Drag to reorder videos. Click the trash icon to delete.
              </p>
              {videos.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <Video className="w-12 h-12 text-indigo-400 mx-auto mb-2" />
                  <p>No videos added yet</p>
                  <p className="text-sm mt-2">Add your first video using the form</p>
                </div>
              ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="videos">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-2"
                      >
                        {videos.map((video, index) => (
                          <Draggable key={video._id} draggableId={video._id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className="bg-indigo-50 p-3 rounded-md border border-indigo-200 flex items-center hover:bg-indigo-100 transition-colors"
                              >
                                <div {...provided.dragHandleProps} className="mr-3 text-indigo-400">
                                  <GripVertical className="w-4 h-4" />
                                </div>
                                <div className="flex-1 truncate">
                                  <span className="font-medium text-indigo-700">{index + 1}.</span> {video.title}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteVideo(video._id)}
                                  className="text-indigo-400 hover:text-red-500 transition-colors ml-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-500 w-8 h-8 rounded-lg flex items-center justify-center text-white">
                <span className="font-bold">E</span>
              </div>
              <span className="font-bold text-white">EduVerse</span>
            </div>
            <div className="flex flex-wrap justify-center gap-8">
              <a href="#" className="hover:text-white transition-colors">Help Center</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Contact Us</a>
            </div>
          </div>
          <div className="mt-6 text-center md:text-left">
            <p className="text-sm">© 2025 EduVerse. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};