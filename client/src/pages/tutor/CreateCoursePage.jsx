import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { courseApi } from "../../utils/api";
import { useToast } from "../../hooks/use-toast";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { ArrowLeft, Upload, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

export const CreateCoursePage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      toast({
        title: "Error",
        description: "Title and description are required",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const courseData = {
        title: title.trim(),
        description: description.trim(),
        thumbnail,
      };
      
      const res = await courseApi.createCourse(courseData);
      
      toast({
        title: "Success!",
        description: "Course created successfully",
      });
      
      navigate(`/tutor/edit-course/${res.data._id}`);
    } catch (error) {
      console.error("Error creating course:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create course",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-indigo-100 text-indigo-700 py-1 px-4">CREATE NEW COURSE</Badge>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
            Start Your Teaching Journey
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Craft an engaging course to share your knowledge with students worldwide.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-100"
        >
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Course Title */}
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

              {/* Course Description */}
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

              {/* Course Thumbnail */}
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
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white" 
                  disabled={loading}
                >
                  {loading ? "Creating Course..." : "Create Course"}
                </Button>
              </div>
            </div>
          </form>
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