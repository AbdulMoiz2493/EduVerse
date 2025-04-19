import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { courseApi, api } from "../../utils/api";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../hooks/use-toast";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { 
  Plus, 
  Book, 
  Edit, 
  Users, 
  ArrowRight, 
  GraduationCap,
  BookOpen,
  Star,
  Trash2,
  Home,
  LayoutDashboard,
  LogOut
} from "lucide-react";
import { Play } from "../../components/Play";
import { Calendar } from "../../components/Calendar";
import { motion } from "framer-motion";

export const TutorDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await courseApi.getTutorCourses();
        setCourses(res.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast({
          title: "Error",
          description: "Failed to load your courses. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [toast]);

  // Function to handle course deletion
  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      return;
    }

    try {
      await courseApi.deleteCourse(courseId);
      setCourses(courses.filter(course => course._id !== courseId));
      toast({
        title: "Success",
        description: "Course deleted successfully",
        variant: "success",
      });
    } catch (error) {
      console.error("Error deleting course:", error);
      toast({
        title: "Error",
        description: "Failed to delete course. Please try again later.",
        variant: "destructive",
      });
    }
  };

  // Handle logout

    const handleLogout = async () => {
      try {
        await authApi.logout();
      } catch (error) {
        console.error('Logout failed:', error);
        // Fallback to manual logout if API call fails
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Header */}
      <header className="bg-white shadow sticky top-0 z-10 backdrop-blur-md bg-white/90">
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
            <div className="flex items-center space-x-4 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="hidden md:block"
              >
                <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-3 py-1">
                  Tutor
                </Badge>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-500 flex items-center justify-center text-white">
                  {user?.name?.charAt(0) || "T"}
                </div>
                <p className="text-gray-700 hidden md:block">
                  Welcome, {user?.name}
                </p>
              </motion.div>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-50"
                >
                  <Link to="/" className="flex items-center px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700">
                    <Home className="w-4 h-4 mr-2" />
                    Home
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-indigo-100 text-indigo-700 py-1 px-4">YOUR TEACHING PLATFORM</Badge>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
            Tutor Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Manage your courses, track student progress, and create engaging learning experiences.
          </p>
        </motion.div>
        
        {/* Create Course Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8 flex justify-end"
        >
          <Link to="/tutor/create-course">
            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all text-white">
              <Plus className="mr-2 h-5 w-5" /> Create New Course
            </Button>
          </Link>
        </motion.div>

        {/* Stats and Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition-all border border-indigo-50 group">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Total Courses</h3>
            <div className="flex items-center">
              <div className="bg-indigo-50 p-4 rounded-xl w-16 h-16 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                <Book className="w-8 h-8 text-indigo-600" />
              </div>
              <span className="text-3xl font-bold ml-4 bg-gradient-to-r from-indigo-700 to-purple-600 bg-clip-text text-transparent">{courses.length}</span>
            </div>
          </div>
          
          <div className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition-all border border-indigo-50 group">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Total Videos</h3>
            <div className="flex items-center">
              <div className="bg-indigo-50 p-4 rounded-xl w-16 h-16 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                <Play className="w-8 h-8 text-indigo-600" />
              </div>
              <span className="text-3xl font-bold ml-4 bg-gradient-to-r from-indigo-700 to-purple-600 bg-clip-text text-transparent">
                {courses.reduce((total, course) => total + (course.videos?.length || 0), 0)}
              </span>
            </div>
          </div>
          
          <div className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition-all border border-indigo-50 group">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Your Rating</h3>
            <div className="flex items-center">
              <div className="bg-indigo-50 p-4 rounded-xl w-16 h-16 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
              <span className="text-3xl font-bold ml-4 bg-gradient-to-r from-indigo-700 to-purple-600 bg-clip-text text-transparent">4.8</span>
            </div>
          </div>
        </motion.div>

        {/* Course List */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-center mb-6">
            <GraduationCap className="mr-2 w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">Your Courses</h2>
          </div>

          {courses.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-indigo-50">
              <div className="w-24 h-24 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-6">
                <Book className="w-12 h-12 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No courses yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Create your first course to start teaching students and share your knowledge
              </p>
              <Link to="/tutor/create-course">
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all text-white px-6">
                  <Plus className="mr-2 h-5 w-5" /> Create New Course
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {courses.map((course) => (
                <div 
                  key={course._id} 
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all border border-indigo-50 group"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Course Thumbnail */}
                    <div className="md:w-64 h-48 md:h-auto bg-indigo-50 relative overflow-hidden">
                      {course.thumbnail ? (
                        <img 
                          src={`https://web-dev-marathon-production.up.railway.app/${course.thumbnail}`} 
                          alt={course.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
                          <Book className="w-16 h-16 text-indigo-500" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 md:hidden">
                        <Badge className="bg-indigo-500/80 backdrop-blur-sm text-white">{course.category || "Course"}</Badge>
                      </div>
                    </div>
                    
                    {/* Course Details */}
                    <div className="p-6 flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">
                          {course.title}
                        </h3>
                        <Badge className="bg-indigo-500/80 text-white hidden md:flex">{course.category || "Course"}</Badge>
                      </div>
                      
                      <div className="mb-3 flex items-center">
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg key={star} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784 .57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81 .588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"></path>
                            </svg>
                          ))}
                        </div>
                        <span className="text-sm text-gray-500 ml-2">
                          {(Math.random() * 1 + 4).toFixed(1)} ({Math.floor(Math.random() * 100 + 50)} reviews)
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-4">
                        {course.description.length > 150
                          ? `${course.description.substring(0, 150)}...`
                          : course.description}
                      </p>
                      
                      <div className="flex flex-wrap items-center text-sm text-gray-500 gap-x-6 gap-y-2 mb-4">
                        <span className="flex items-center">
                          <Play className="w-4 h-4 mr-1 text-indigo-500" />
                          {course.videos?.length || 0} Videos
                        </span>
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1 text-indigo-500" />
                          {course.enrollments?.length || 0} Students
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1 text-indigo-500" />
                          Created {new Date(course.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-3">
                        <Link to={`/tutor/edit-course/${course._id}`}>
                          <Button variant="outline" size="sm" className="border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">
                            <Edit className="w-4 h-4 mr-1" /> Edit Course
                          </Button>
                        </Link>
                        <Link to={`/tutor/course/${course._id}/enrollments`}>
                          <Button variant="outline" size="sm" className="border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">
                            <Users className="w-4 h-4 mr-1" /> Students
                          </Button>
                        </Link>
                        <Link to={`/course/${course._id}`}>
                          <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white group">
                            Preview <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-red-200 hover:bg-red-50 hover:text-red-700 text-red-600"
                          onClick={() => handleDeleteCourse(course._id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" /> Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.section>
        
        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white text-center"
        >
          <div className="max-w-3xl mx-auto">
            <BookOpen className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Enhance Your Teaching with AI Tools</h2>
            <p className="mb-6">
              Create interactive lessons, generate engaging assessments, and leverage advanced analytics to improve student outcomes.
            </p>
            <Button 
              variant="outline" 
              className="border-white text-indigo-700 hover:bg-blue-100 hover:text-indigo-700"
            >
              Explore Teaching Tools
            </Button>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
             028
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