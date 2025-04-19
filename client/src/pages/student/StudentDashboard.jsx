import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { courseApi, enrollmentApi, api } from "../../utils/api";
import { useToast } from "../../hooks/use-toast";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { 
  Search, 
  Book, 
  BookOpen, 
  GraduationCap,
  Brain,
  Target,
  ArrowRight,
  Users,
  Home,
  LayoutDashboard,
  LogOut,
  Bell
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const StudentDashboard = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch enrolled courses, available courses, and notifications
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch enrollments
        const enrollmentsRes = await enrollmentApi.getStudentEnrollments();
        const enrolledCoursesData = enrollmentsRes.data.map(enrollment => enrollment.course);
        setEnrolledCourses(enrolledCoursesData);

        // Fetch all courses
        const allCoursesRes = await courseApi.getAllCourses();
        const enrolledCourseIds = enrolledCoursesData.map(course => course._id);
        const availableCoursesData = allCoursesRes.data.filter(
          course => !enrolledCourseIds.includes(course._id)
        );
        setAvailableCourses(availableCoursesData);

        // Fetch notifications
        const notificationsRes = await api.get('/api/notifications');
        setNotifications(notificationsRes.data);

        // Fetch unread notification count
        const unreadCountRes = await api.get('/api/notifications/unread-count');
        setUnreadCount(unreadCountRes.data.count);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Handle course enrollment
  const handleEnroll = async (courseId) => {
    try {
      await enrollmentApi.enrollCourse(courseId);
      
      const course = availableCourses.find(c => c._id === courseId);
      setEnrolledCourses([...enrolledCourses, course]);
      setAvailableCourses(availableCourses.filter(c => c._id !== courseId));
      
      toast({
        title: "Enrolled!",
        description: "You have successfully enrolled in this course",
      });
    } catch (error) {
      console.error("Enrollment error:", error);
      toast({
        title: "Enrollment Failed",
        description: error.response?.data?.message || "Could not enroll in the course",
        variant: "destructive",
      });
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  // Handle marking a notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.put(`/api/notifications/${notificationId}/read`);
      setNotifications(notifications.map(n => 
        n._id === notificationId ? { ...n, read: true } : n
      ));
      setUnreadCount(unreadCount - 1);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read.",
        variant: "destructive",
      });
    }
  };

  // Handle marking all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      const res = await api.put('/api/notifications/read-all');
      setNotifications(res.data);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read.",
        variant: "destructive",
      });
    }
  };

  // Filter courses based on search term
  const filteredAvailableCourses = availableCourses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Display loading state
  if (loading) {
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
            
            <div className="flex items-center space-x-4 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="hidden md:block"
              >
                <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-3 py-1">
                  {user?.role === 'student' ? 'Student' : 'User'}
                </Badge>
              </motion.div>
              {/* Notification Icon */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="relative cursor-pointer"
                onClick={() => setNotificationOpen(!notificationOpen)}
              >
                <Bell className="w-6 h-6 text-gray-700" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </motion.div>
              {/* Notification Dropdown */}
              <AnimatePresence>
                {notificationOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-100 z-50 max-h-96 overflow-y-auto"
                  >
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                      <span className="font-semibold text-gray-900">Notifications</span>
                      {unreadCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleMarkAllAsRead}
                          className="text-indigo-600 hover:text-indigo-700"
                        >
                          Mark all as read
                        </Button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-600">
                        No notifications
                      </div>
                    ) : (
                      notifications.map(notification => (
                        <div
                          key={notification._id}
                          className={`p-4 border-b border-gray-100 hover:bg-indigo-50 cursor-pointer flex justify-between items-start ${
                            notification.read ? 'bg-gray-50' : 'bg-white'
                          }`}
                          onClick={() => {
                            if (!notification.read) handleMarkAsRead(notification._id);
                            if (notification.course && notification.type !== 'new_message') {
                              navigate(`/course/${notification.course._id}`);
                            } else if (notification.type === 'new_message') {
                              navigate(`/course/${notification.course._id}`);
                            }
                            setNotificationOpen(false);
                          }}
                        >
                          <div>
                            <p className="text-sm text-gray-900">{notification.message}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(notification.createdAt).toLocaleString()}
                            </p>
                          </div>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-indigo-600 rounded-full mt-1"></span>
                          )}
                        </div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              {/* User Dropdown */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-500 flex items-center justify-center text-white">
                  {user?.name?.charAt(0) || "S"}
                </div>
                <p className="text-gray-700 font-medium hidden md:block">
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
          <Badge className="mb-4 bg-indigo-100 text-indigo-700 py-1 px-4">YOUR LEARNING JOURNEY</Badge>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
            Student Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Track your progress, discover new courses, and continue your personalized learning experience.
          </p>
        </motion.div>

        {/* Learning Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          {[
            {
              icon: <BookOpen className="w-8 h-8 text-indigo-600" />,
              title: "Enrolled Courses",
              value: enrolledCourses.length,
              color: "from-indigo-500 to-blue-500"
            },
            {
              icon: <Target className="w-8 h-8 text-purple-600" />,
              title: "Learning Hours",
              value: enrolledCourses.length * 12,
              color: "from-purple-500 to-pink-500"
            },
            {
              icon: <Brain className="w-8 h-8 text-blue-600" />,
              title: "AI-Enhanced Sessions",
              value: enrolledCourses.length * 4,
              color: "from-blue-500 to-cyan-500"
            }
          ].map((stat, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:border-indigo-100 transition-all group"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-indigo-50 p-3 rounded-lg group-hover:bg-indigo-100 transition-colors">
                    {stat.icon}
                  </div>
                  <div className="bg-gradient-to-r w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl shadow-md bg-gradient-to-r ${stat.color}"
                    style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }}
                  >
                    {stat.value}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">{stat.title}</h3>
              </div>
              <div className={`h-1 bg-gradient-to-rs ${stat.color}`}></div>
            </div>
          ))}
        </motion.div>

        {/* Enrolled Courses Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-center mb-6">
            <BookOpen className="mr-2 text-indigo-600" /> 
            <h2 className="text-2xl font-bold text-gray-900">My Enrolled Courses</h2>
          </div>
          
          {enrolledCourses.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center border border-dashed border-gray-300">
              <GraduationCap className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">You haven't enrolled in any courses yet.</p>
              <p className="text-gray-600 mb-6">Browse available courses below and start your learning journey.</p>
              <Button 
                onClick={() => document.getElementById('available-courses').scrollIntoView({ behavior: 'smooth' })}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
              >
                Explore Courses <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => (
                <div 
                  key={course._id} 
                  className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col border border-gray-100 hover:shadow-lg transition-all group"
                >
                  <div className="h-40 bg-indigo-50 relative overflow-hidden">
                    {course.thumbnail ? (
                      <img 
                        src={`http://localhost:5000/${course.thumbnail}`} 
                        alt={course.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
                        <Book className="w-12 h-12 text-indigo-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-indigo-500/80 backdrop-blur-sm text-white">{course.category || "Course"}</Badge>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-indigo-700 transition-colors">
                      {course.title}
                    </h3>
                    <div className="mb-2 flex items-center">
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg key={star} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784 .57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81 .588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"></path>
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm text-gray-500 ml-2">
                        {(Math.random() * 1 + 4).toFixed(1)} ({Math.floor(Math.random() * 100 + 50)})
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 flex-1">
                      {course.description.length > 100
                        ? `${course.description.substring(0, 100)}...`
                        : course.description}
                    </p>
                    <div className="mt-auto">
                      <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {Math.floor(Math.random() * 1000 + 100)} students
                        </span>
                        <span className="flex items-center">
                          <BookOpen className="w-4 h-4 mr-1" />
                          {course.videos?.length || Math.floor(Math.random() * 20 + 5)} videos
                        </span>
                      </div>
                      <div className="bg-gray-100 h-2 rounded-full mb-4">
                        <div 
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full" 
                          style={{ width: `${Math.floor(Math.random() * 80 + 10)}%` }}
                        ></div>
                      </div>
                      <Link to={`/course/${course._id}`}>
                        <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white group">
                          Continue Learning
                          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.section>

        {/* Search and Available Courses Section */}
        <motion.section 
          id="available-courses"
          className="mt-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div className="flex items-center mb-4 md:mb-0">
              <Book className="mr-2 text-indigo-600" /> 
              <h2 className="text-2xl font-bold text-gray-900">Discover New Courses</h2>
            </div>
            
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 focus:border-indigo-500 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-full md:w-64"
              />
            </div>
          </div>

          {filteredAvailableCourses.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center border border-dashed border-gray-300">
              {searchTerm ? (
                <>
                  <Search className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
                  <p className="text-gray-600">No courses found matching "{searchTerm}".</p>
                  <p className="text-gray-600 mt-2">Try adjusting your search terms or browse all courses.</p>
                </>
              ) : (
                <>
                  <Book className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
                  <p className="text-gray-600">No courses available at the moment.</p>
                  <p className="text-gray-600 mt-2">Please check back later for new course offerings.</p>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAvailableCourses.map((course) => (
                <div 
                  key={course._id} 
                  className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col border border-gray-100 hover:shadow-lg transition-all group"
                >
                  <div className="h-40 bg-indigo-50 relative overflow-hidden">
                    {course.thumbnail ? (
                      <img 
                        src={`http://localhost:5000/${course.thumbnail}`} 
                        alt={course.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
                        <Book className="w-12 h-12 text-indigo-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-purple-500/80 backdrop-blur-sm text-white">{course.category || "New"}</Badge>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-indigo-700 transition-colors">
                      {course.title}
                    </h3>
                    <div className="mb-2 flex items-center">
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg key={star} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784 .57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81 .588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"></path>
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm text-gray-500 ml-2">
                        {(Math.random() * 1 + 4).toFixed(1)} ({Math.floor(Math.random() * 100 + 50)})
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 flex-1">
                      {course.description.length > 100
                        ? `${course.description.substring(0, 100)}...`
                        : course.description}
                    </p>
                    <div className="mt-auto">
                      <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {Math.floor(Math.random() * 1000 + 100)} students
                        </span>
                        <span className="flex items-center">
                          <BookOpen className="w-4 h-4 mr-1" />
                          {course.videos?.length || Math.floor(Math.random() * 20 + 5)} videos
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gray-200 mr-2 flex items-center justify-center overflow-hidden">
                            {course.tutor?.profilePic ? (
                              <img 
                                src={`http://localhost:5000/${course.tutor.profilePic}`} 
                                alt={course.tutor.name} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="font-medium text-xs">{course.tutor?.name?.charAt(0)}</span>
                            )}
                          </div>
                          <span className="text-sm text-gray-700 font-medium">
                            {course.tutor?.name}
                          </span>
                        </div>
                        <Button 
                          onClick={() => handleEnroll(course._id)}
                          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white group"
                        >
                          Enroll Now
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
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white text-center"
        >
          <div className="max-w-3xl mx-auto">
            <GraduationCap className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Unlock Your Full Potential with AI-Enhanced Learning</h2>
            <p className="mb-6">
              Get personalized course recommendations, AI-generated study materials, and interactive learning experiences.
            </p>
            <Button 
              variant="outline" 
              className="border-white text-indigo-700 hover:bg-blue-100 hover:text-indigo-700"
            >
              Explore Premium Features
            </Button>
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