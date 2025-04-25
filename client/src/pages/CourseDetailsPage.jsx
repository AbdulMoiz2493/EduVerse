import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { courseApi, chatApi, api } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import SpotlightCard from "./SpotlightCard/SpotlightCard";
import { 
  ArrowLeft, 
  Play, 
  Send, 
  BookOpen, 
  FileText, 
  Trash2, 
  Search, 
  Home, 
  Info, 
  Contact, 
  LogOut, 
  Bell, 
  Menu, 
  X 
} from "lucide-react";
import { io } from "socket.io-client";

// Reusable Components
const Badge = ({ children, className, ...props }) => {
  return (
    <motion.span
      className={`inline-flex items-center rounded-full px-4 py-1 text-sm font-medium ${className}`}
      whileHover={{ scale: 1.1, rotate: 3 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {children}
    </motion.span>
  );
};

const Button = ({ children, className, ...props }) => {
  return (
    <motion.button
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 ${className}`}
      whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export const CourseDetailsPage = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [isGeneratingTranscript, setIsGeneratingTranscript] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const chatContainerRef = useRef(null);

  // Fetch course details, messages, and notifications
  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseRes = await courseApi.getCourse(id);
        setCourse(courseRes.data);

        if (courseRes.data.videos?.length > 0) {
          setSelectedVideo(courseRes.data.videos[0]);
        }

        const messagesRes = await chatApi.getMessages(id);
        setMessages(messagesRes.data);

        // Fetch notifications
        const notificationsRes = await api.get("/api/notifications");
        setNotifications(notificationsRes.data);

        const unreadCountRes = await api.get("/api/notifications/unread-count");
        setUnreadCount(unreadCountRes.data.count);
      } catch (error) {
        console.error("Error fetching data:", error);
        let errorMessage = "Failed to load course data. Please try again later.";
        if (error.response) {
          if (error.response.status === 404) {
            errorMessage = "Course not found. It may have been deleted or does not exist.";
          } else if (error.response.status === 403) {
            errorMessage = "You do not have permission to access this course.";
          } else if (error.response.status === 500) {
            errorMessage = "Server error. Please try again later.";
          }
        } else if (error.request) {
          errorMessage = "Network error. Please check your connection and try again.";
        }
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, toast]);

  // Set up Socket.IO connection
  useEffect(() => {
    if (!course) return;

    const newSocket = io("http://localhost:5000", { 
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      newSocket.emit("joinRoom", { courseId: id });
    });

    newSocket.on("message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket.IO connection error:", error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to chat. Please try again.",
        variant: "destructive",
      });
    });

    newSocket.on("reconnect", (attempt) => {
      newSocket.emit("joinRoom", { courseId: id });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [course, id, toast]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle transcript generation
  const handleGenerateTranscript = async () => {
    if (!selectedVideo || isGeneratingTranscript) return;

    setIsGeneratingTranscript(true);
    try {
      const response = await api.post(`/courses/${id}/videos/${selectedVideo._id}/transcript`);
      const newTranscript = response.data.transcript;

      setCourse(prevCourse => ({
        ...prevCourse,
        videos: prevCourse.videos.map(video =>
          video._id === selectedVideo._id ? { ...video, transcript: newTranscript } : video
        ),
      }));

      setSelectedVideo(prevVideo => ({ ...prevVideo, transcript: newTranscript }));

      toast({
        title: "Success",
        description: "Transcript generated successfully",
        variant: "success",
      });
    } catch (error) {
      console.error("Transcript generation error:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to generate transcript",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingTranscript(false);
    }
  };

  // Handle video deletion
  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;

    try {
      await courseApi.deleteVideo(id, videoId);

      setCourse(prevCourse => ({
        ...prevCourse,
        videos: prevCourse.videos.filter(video => video._id !== videoId),
      }));

      if (selectedVideo?._id === videoId) {
        setSelectedVideo(course.videos.length > 1 ? course.videos[0] : null);
      }

      toast({
        title: "Success",
        description: "Video deleted successfully",
        variant: "success",
      });
    } catch (error) {
      console.error("Video deletion error:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete video",
        variant: "destructive",
      });
    }
  };

  // Handle sending messages
  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !socket || !user) return;

    const messageData = {
      courseId: id,
      userId: user._id,
      message: newMessage.trim(),
    };
    socket.emit("sendMessage", messageData);

    setNewMessage("");
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await api.post("api/auth/logout");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    } catch (error) {
      //console.error("Logout failed:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  // Handle notifications
  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.put(`/api/notifications/${notificationId}/read`);
      setNotifications(
        notifications.map((n) =>
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(unreadCount - 1);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read.",
        variant: "destructive",
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await api.put("/api/notifications/read-all");
      setNotifications(res.data);
      setUnreadCount(0);
    } catch (error) {
      console.error("Error Marking all notifications as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read.",
        variant: "destructive",
      });
    }
  };

  // Mobile menu effect
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const navItems = [
    { name: "Home", path: "/", icon: <Home className="w-4 h-4" /> },
    { name: "About", path: "/about", icon: <Info className="w-4 h-4" /> },
    { name: "Courses", path: "/courses", icon: <BookOpen className="w-4 h-4" /> },
    { name: "Contact", path: "/contact", icon: <Contact className="w-4 h-4" /> },
    {
      name: "Dashboard",
      path: user?.role === "tutor" ? "/tutor" : "/student",
      icon: <BookOpen className="w-4 h-4" />,
    },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Course not found
  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Course Not Found</h1>
          <p className="text-gray-600 mb-8">The requested course does not exist.</p>
          <Button
            asChild
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl"
          >
            <Link to={user?.role === "tutor" ? "/tutor" : "/student"}>Return to Dashboard</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  const filteredVideos = course.videos?.filter(
    (video) =>
      video &&
      (video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (video.transcript && video.transcript.toLowerCase().includes(searchTerm.toLowerCase())))
  ) || [];

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-x-hidden">
      <style>
        {`
          .section-bg {
            background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.3));
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
          }

          .nav-link {
            position: relative;
            overflow: hidden;
          }

          .nav-link::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 2px;
            background: linear-gradient(to right, #4f46e5, #a855f7);
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }

          .nav-link:hover::after {
            transform: translateX(0);
          }

          .video-player {
            transition: all 0.3s ease;
          }

          .video-player:hover {
            transform: scale(1.02);
            box-shadow: 0 15px 30px rgba(0,0,0,0.2);
          }

          .chat-container {
            background: linear-gradient(145deg, #ffffff, #f0f4ff);
            border: 1px solid rgba(79, 70, 229, 0.2);
            transition: all 0.3s ease;
          }

          .chat-container:hover {
            box-shadow: 0 20px 40px rgba(0,0,0,0.15);
            transform: translateY(-5px);
          }

          .chat-message {
            transition: all 0.2s ease;
          }

          .chat-message:hover {
            transform: translateY(-2px);
          }

          .chat-input {
            transition: all 0.3s ease;
          }

          .chat-input:focus {
            box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
            border-color: #4f46e5;
          }
        `}
      </style>

      {/* Navbar */}
      <div className="fixed top-4 left-0 right-0 flex justify-center z-50 px-6">
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="rounded-full py-1 px-3 bg-white/40 backdrop-blur-xl shadow-xl [backdrop-filter:blur(12px)] [-webkit-backdrop-filter:blur(12px)] flex items-center justify-between w-full max-w-4xl border border-white/20 h-11 relative"
        >
          <div className="flex items-center gap-1.5">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="bg-gradient-to-r from-indigo-600 to-purple-500 w-7 h-7 rounded-full flex items-center justify-center text-white shadow-lg"
            >
              <span className="font-bold text-base">E</span>
            </motion.div>
            <span className="font-bold text-base bg-gradient-to-r from-indigo-700 to-purple-600 bg-clip-text text-transparent">
              EduVerse
            </span>
          </div>

          <div className="hidden md:flex items-center justify-center absolute left-1/2 transform -translate-x-1/2 gap-0.5 z-50">
            {navItems.map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={item.path}
                  className="flex items-center gap-1 px-2.5 py-1 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all font-medium text-xs nav-link"
                >
                  {item.icon}
                  {item.name}
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <motion.div
              className="relative cursor-pointer"
              onClick={() => setNotificationOpen(!notificationOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bell className="w-5 h-5 text-gray-700" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </motion.div>

            <motion.div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-r from-indigo-600 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                {user?.name?.charAt(0) || "U"}
              </div>
              <span className="text-gray-700 font-medium hidden md:block text-xs">
                {user?.name}
              </span>
            </motion.div>

            <div className="relative z-50 md:hidden transition !hover:transform-none">
              <Button
                onClick={() => setMenuOpen(!menuOpen)}
                className="bg-transparent text-gray-600 hover:text-indigo-600"
              >
                {menuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </Button>
            </div>
          </div>

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
                  <span className="font-semibold text-gray-900">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMarkAllAsRead}
                      className="text-indigo-600 hover:text-indigo-700 text-xs"
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
                  notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`p-4 border-b border-gray-100 hover:bg-indigo-50 cursor-pointer flex justify-between items-start ${
                        notification.read ? "bg-gray-50" : "bg-white"
                      }`}
                      onClick={() => {
                        if (!notification.read)
                          handleMarkAsRead(notification._id);
                        if (
                          notification.course &&
                          notification.type !== "new_message"
                        ) {
                          navigate(`/course/${notification.course._id}`);
                        } else if (notification.type === "new_message") {
                          navigate(`/course/${notification.course._id}`);
                        }
                        setNotificationOpen(false);
                      }}
                    >
                      <div>
                        <p className="text-sm text-gray-900">
                          {notification.message}
                        </p>
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

          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-50"
            >
              {navItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 text-sm"
                  onClick={() => setDropdownOpen(false)}
                >
                  {item.icon}
                  <span className="ml-2">{item.name}</span>
                </Link>
              ))}
              <button
                onClick={() => {
                  handleLogout();
                  setDropdownOpen(false);
                }}
                className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 text-sm"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Mobile Navigation Overlay */}
      <div
        className={`mobile-nav-overlay ${menuOpen ? "active" : ""}`}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(10, 10, 10, 0.9)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          zIndex: 999,
          opacity: menuOpen ? 1 : 0,
          visibility: menuOpen ? "visible" : "hidden",
          transition: "opacity 0.3s ease, visibility 0.3s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: menuOpen ? "auto" : "none",
        }}
      >
        <div
          className={`mobile-menu-container ${menuOpen ? "active" : ""}`}
          style={{
            transform: menuOpen ? "scale(1)" : "scale(0.95)",
            opacity: menuOpen ? 1 : 0,
            transition: "transform 0.4s ease, opacity 0.4s ease",
          }}
        >
          <div className="flex flex-col items-center justify-center text-center w-full">
            {navItems.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: menuOpen ? 1 : 0, y: menuOpen ? 0 : 20 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className="my-4"
              >
                <Link
                  to={item.path}
                  onClick={() => setMenuOpen(false)}
                  className="text-white text-xl hover:text-indigo-400 transition-all flex items-center gap-2"
                >
                  {item.icon}
                  {item.name}
                </Link>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: menuOpen ? 1 : 0, y: menuOpen ? 0 : 20 }}
              transition={{ delay: navItems.length * 0.1, duration: 0.3 }}
              className="mt-4"
            >
              <Button
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-2 px-4 rounded-full"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Log Out
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-24 pb-24">
        {/* Course Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-indigo-100 text-indigo-600 py-1 px-5 shadow-md rounded-full">
            COURSE CONTENT
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {course.title}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Dive into your learning journey with interactive videos, real-time chat, and AI-generated transcripts.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player and Description */}
          <div className="lg:col-span-2 space-y-8">
            {selectedVideo ? (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <SpotlightCard
                  spotlightColor="rgba(139, 92, 246, 0.25)"
                  className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
                >
                  <div className="aspect-w-16 aspect-h-9 bg-black video-player">
                    <video 
                      src={`http://localhost:5000/${selectedVideo.videoUrl}`}
                      controls
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedVideo.title}
                    </h2>
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Transcribe</h3>
                        <Button
                          onClick={handleGenerateTranscript}
                          disabled={isGeneratingTranscript || selectedVideo.transcript}
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-sm py-1 px-3 rounded-xl"
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          {isGeneratingTranscript ? "Generating..." : "Generate Transcribe"}
                        </Button>
                      </div>
                      <div className="max-h-60 overflow-y-auto text-gray-600 text-sm whitespace-pre-line bg-gray-50 p-4 rounded-lg">
                        {selectedVideo.transcript || "No transcribe available for this video. Click 'Generate Transcribe' to create one."}
                      </div>
                    </div>
                  </div>
                </SpotlightCard>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <SpotlightCard
                  spotlightColor="rgba(139, 92, 246, 0.25)"
                  className="bg-white rounded-xl shadow-lg p-8 text-center border border-dashed border-gray-300"
                >
                  <BookOpen className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
                  <p className="text-gray-600">This course has no videos yet.</p>
                </SpotlightCard>
              </motion.div>
            )}

            {/* Course Description */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            >
              <SpotlightCard
                spotlightColor="rgba(139, 92, 246, 0.25)"
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">About this course</h3>
                <p className="text-gray-600 whitespace-pre-line">{course.description}</p>
                <div className="mt-4 flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-200 mr-2 flex items-center justify-center overflow-hidden">
                    {course.tutor?.profilePic ? (
                      <img
                        src={`http://localhost:5000/${course.tutor.profilePic}`}
                        alt={course.tutor.name || "Tutor"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-medium text-xs">
                        {course.tutor?.name?.charAt(0) || "T"}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-700 font-medium">
                    {course.tutor?.name || "Unknown Tutor"}
                  </span>
                </div>
              </SpotlightCard>
            </motion.div>
          </div>

          {/* Course Sidebar - Video List and Chat */}
          <div className="space-y-8">
            {/* Video List */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            >
              <SpotlightCard
                spotlightColor="rgba(139, 92, 246, 0.25)"
                className="bg-white rounded-xl shadow-lg p-4 border border-gray-100"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                  <div className="flex items-center mb-4 md:mb-0">
                    <BookOpen className="w-6 h-6 mr-2 text-indigo-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Course Videos</h3>
                  </div>
                  <div className="relative w-full md:w-auto">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="Search videos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 focus:border-indigo-500 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-full md:w-48 bg-white/80 backdrop-blur-sm"
                    />
                  </div>
                </div>
                {filteredVideos.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredVideos.map((video) => (
                      <div
                        key={video._id}
                        className="flex items-center justify-between p-3 rounded-md transition-colors"
                      >
                        <button
                          onClick={() => setSelectedVideo(video)}
                          className={`flex items-start flex-1 text-left transitioned-colors ${
                            selectedVideo?._id === video._id
                              ? "bg-indigo-50 text-indigo-700"
                              : "hover:bg-gray-100"
                          }`}
                        >
                          <Play className="w-5 h-5 mt-0.5 mr-2 flex-shrink-0" />
                          <span>{video.title}</span>
                        </button>
                        {user?.role === 'tutor' && course.tutor._id === user._id && (
                          <Button
                            onClick={() => handleDeleteVideo(video._id)}
                            variant="ghost"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1"
                            title="Delete video"
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center">No videos match your search.</p>
                )}
              </SpotlightCard>
            </motion.div>

            {/* Chat */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
              className="chat-container rounded-2xl shadow-xl overflow-hidden flex flex-col h-[32rem] lg:h-[40rem]"
            >
              <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <div className="flex items-center gap-2">
                  <Send className="w-6 h-6" />
                  <h3 className="text-xl font-semibold">Course Chat</h3>
                </div>
                <p className="text-sm opacity-80 mt-1">Connect with peers and instructors in real-time</p>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white/50" ref={chatContainerRef}>
                {messages.length > 0 ? (
                  messages.map((msg) => (
                    <motion.div
                      key={msg._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex flex-col chat-message ${
                        msg.user._id === user._id ? "items-end" : "items-start"
                      }`}
                    >
                      {/* Username and Profile Picture */}
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                          {msg.user._id === user._id ? "U" : msg.user.name?.charAt(0) || "U"}
                        </div>
                        <div className="font-semibold text-xs text-gray-800">
                          {msg.user._id === user._id ? "You" : msg.user.name || "Unknown"}
                        </div>
                      </div>
                      {/* Message Content */}
                      <div
                        className={`max-w-[70%] px-3 py-2 rounded-2xl shadow-sm ${
                          msg.user._id === user._id
                            ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                            : "bg-white text-gray-800 border border-gray-200"
                        }`}
                      >
                        <div className="text-xs">{msg.content}</div>
                        <div className="text-xs opacity-60 mt-0.5">
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 mt-12">
                    <Send className="w-12 h-12 mx-auto mb-4 text-indigo-400" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                )}
              </div>
              <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200 flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="chat-input flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
                />
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full p-3"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </form>
            </motion.div>
          </div>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mt-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white text-center"
        >
          <div className="max-w-3xl mx-auto">
            <BookOpen className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Enhance Your Learning Experience
            </h2>
            <p className="mb-6 text-lg">
              Unlock premium features like AI-enhanced study materials, personalized recommendations, and more.
            </p>
            <Button className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-4 text-lg font-medium rounded-xl">
              Explore Premium
            </Button>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-500 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg">
                  <span className="font-bold text-base">E</span>
                </div>
                <span className="font-bold text-lg bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  EduVerse
                </span>
              </div>
              <p className="text-sm opacity-80">
                Empowering learners worldwide with innovative education solutions.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            >
              <h4 className="text-lg font-semibold text-white mb-4">
                Quick Links
              </h4>
              <ul className="space-y-2">
                {[
                  { name: "Home", path: "/" },
                  { name: "About", path: "/about" },
                  { name: "Courses", path: "/courses" },
                  { name: "Contact", path: "/contact" },
                ].map((link, index) => (
                  <li key={index}>
                    <Link
                      to={link.path}
                      className="text-sm hover:text-indigo-400 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            >
              <h4 className="text-lg font-semibold text-white mb-4">
                Resources
              </h4>
              <ul className="space-y-2">
                {[
                  { name: "Blog", path: "/blog" },
                  { name: "FAQ", path: "/faq" },
                  { name: "Support", path: "/support" },
                ].map((link, index) => (
                  <li key={index}>
                    <Link
                      to={link.path}
                      className="text-sm hover:text-indigo-400 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
            >
              <h4 className="text-lg font-semibold text-white mb-4">
                Contact Us
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  Email:{" "}
                  <a
                    href="mailto:support@eduverse.com"
                    className="hover:text-indigo-400 transition-colors"
                  >
                    support@eduverse.com
                  </a>
                </li>
                <li>
                  Phone:{" "}
                  <a
                    href="tel:+1234567890"
                    className="hover:text-indigo-400 transition-colors"
                  >
                    +1 234 567 890
                  </a>
                </li>
                <li>Address: 123 Learning Lane, EduCity, 90210</li>
              </ul>
            </motion.div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-700 text-center">
            <p className="text-sm opacity-80">
              &copy; {new Date().getFullYear()} EduVerse. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};