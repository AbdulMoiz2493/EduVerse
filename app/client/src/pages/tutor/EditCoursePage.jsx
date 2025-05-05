import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { courseApi } from "../../utils/api";
import { useToast } from "../../hooks/use-toast";
import { useAuth } from "../../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Upload,
  Plus,
  Save,
  Trash2,
  GripVertical,
  Video,
  GraduationCap,
  Home,
  Info,
  BookOpen,
  Contact,
  Bell,
  LogOut,
  Menu,
  X,
  CheckCircle,
} from "lucide-react";

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

export const EditCoursePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [course, setCourse] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [payment, setPayment] = useState("free");
  const [price, setPrice] = useState("");
  const [videos, setVideos] = useState([]);
  const [newVideo, setNewVideo] = useState({
    title: "",
    file: null,
  });
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [savingCourse, setSavingCourse] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications] = useState([]);
  const [unreadCount] = useState(0);
    const { user, setUser } = useAuth();
  const [successMessage, setSuccessMessage] = useState({
    saveCourse: "",
    addVideo: "",
    deleteVideo: "",
    reorderVideos: "",
  });

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await courseApi.getCourse(id);
        setCourse(res.data);
        setTitle(res.data.title);
        setDescription(res.data.description);
        setPayment(res.data.payment);
        setPrice(res.data.price.toString());
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
    if (payment === "paid" && (!price || parseFloat(price) <= 0)) {
      toast({
        title: "Error",
        description: "Price is required for paid courses",
        variant: "destructive",
      });
      return;
    }
    setSavingCourse(true);
    try {
      const courseData = {
        title: title.trim(),
        description: description.trim(),
        payment,
        price: payment === "paid" ? parseFloat(price) : 0,
      };
      if (thumbnail) {
        courseData.thumbnail = thumbnail;
      }
      await courseApi.updateCourse(id, courseData);
      setSuccessMessage((prev) => ({
        ...prev,
        saveCourse: "Course details updated successfully",
      }));
      toast({
        title: "Success!",
        description: "Course details updated successfully",
      });
      setTimeout(() => {
        setSuccessMessage((prev) => ({ ...prev, saveCourse: "" }));
      }, 3000);
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
      setSuccessMessage((prev) => ({
        ...prev,
        addVideo: "Video uploaded successfully",
      }));
      toast({
        title: "Success!",
        description: "Video uploaded successfully",
      });
      setTimeout(() => {
        setSuccessMessage((prev) => ({ ...prev, addVideo: "" }));
      }, 3000);
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
      setVideos(videos.filter((video) => video._id !== videoId));
      setSuccessMessage((prev) => ({
        ...prev,
        deleteVideo: "Video deleted successfully",
      }));
      toast({
        title: "Success!",
        description: "Video deleted successfully",
      });
      setTimeout(() => {
        setSuccessMessage((prev) => ({ ...prev, deleteVideo: "" }));
      }, 3000);
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
      await courseApi.reorderVideos(id, items.map((item) => item._id));
      setSuccessMessage((prev) => ({
        ...prev,
        reorderVideos: "Video order saved successfully",
      }));
      setTimeout(() => {
        setSuccessMessage((prev) => ({ ...prev, reorderVideos: "" }));
      }, 3000);
    } catch (error) {
      console.error("Error reordering videos:", error);
      toast({
        title: "Error",
        description: "Failed to save video order",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

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
    { name: "Dashboard", path: "/tutor", icon: <BookOpen className="w-4 h-4" /> },
  ];

  if (loadingCourse) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-x-hidden">
      <style>
        {`
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
                {user?.name?.charAt(0) || "T"}
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
        <motion.div
          initial={{ opacity: 0, y:50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-indigo-100 text-indigo-600 py-1 px-5 shadow-md rounded-full">
            EDIT COURSE
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Refine Your Course
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Update course details and add videos to enhance the learning experience.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Course Details Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2 text-indigo-600" /> Course Details
                </h2>
                <Link to="/tutor">
                  <Button
                    variant="outline"
                    className="border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 text-indigo-600 px-4 py-2 rounded-xl"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                  </Button>
                </Link>
              </div>
              <form onSubmit={handleSaveCourse}>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Course Title *
                    </label>
                    <input
                      id="title"
                      type="text"
                      placeholder="Enter a descriptive title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
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
                    <label htmlFor="payment" className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Type *
                    </label>
                    <select
                      id="payment"
                      value={payment}
                      onChange={(e) => setPayment(e.target.value)}
                      className="w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      required
                    >
                      <option value="free">Free</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>
                  {payment === "paid" && (
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                        Price (USD) *
                      </label>
                      <input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Enter course price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                        className="w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                  )}
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
                          <label
                            htmlFor="thumbnail"
                            className="cursor-pointer bg-indigo-50 py-2 px-4 border border-indigo-200 rounded-md shadow-sm text-sm font-medium text-indigo-700 hover:bg-indigo-100"
                          >
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
                      className="flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl"
                      disabled={savingCourse}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {savingCourse ? "Saving..." : "Save Course Details"}
                    </Button>
                    <AnimatePresence>
                      {successMessage.saveCourse && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.3 }}
                          className="mt-3 flex items-center text-sm text-green-700 bg-green-100 p-2 rounded-md"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {successMessage.saveCourse}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </form>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 mt-8 hover:shadow-xl transition-shadow duration-300"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Video className="w-5 h-5 mr-2 text-indigo-600" /> Add New Video
              </h2>
              <form onSubmit={handleAddVideo}>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="videoTitle" className="block text-sm font-medium text-gray-700 mb-1">
                      Video Title *
                    </label>
                    <input
                      id="videoTitle"
                      type="text"
                      placeholder="Enter a title for this video"
                      value={newVideo.title}
                      onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                      required
                      className="w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
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
                          <label
                            htmlFor="videoFile"
                            className="cursor-pointer bg-indigo-50 py-2 px-4 border border-indigo-200 rounded-md shadow-sm text-sm font-medium text-indigo-700 hover:bg-indigo-100"
                          >
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
                          MP4 format only
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4">
                    <Button
                      type="submit"
                      className="flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl"
                      disabled={uploadingVideo || !newVideo.file}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {uploadingVideo ? "Uploading..." : "Add Video"}
                    </Button>
                    <AnimatePresence>
                      {successMessage.addVideo && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.3 }}
                          className="mt-3 flex items-center text-sm text-green-700 bg-green-100 p-2 rounded-md"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {successMessage.addVideo}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>

          {/* Course Videos List */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
              className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 sticky top-24 hover:shadow-xl transition-shadow duration-300"
            >
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
              <AnimatePresence>
                {(successMessage.deleteVideo || successMessage.reorderVideos) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 flex items-center text-sm text-green-700 bg-green-100 p-2 rounded-md"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {successMessage.deleteVideo || successMessage.reorderVideos}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
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
              <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
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
              <h4 className="text-lg font-semibold text-white mb-4">Resources</h4>
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
              <h4 className="text-lg font-semibold text-white mb-4">Contact Us</h4>
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