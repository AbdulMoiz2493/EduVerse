import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { courseApi, enrollmentApi } from "../../utils/api";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import SpotlightCard from "../SpotlightCard/SpotlightCard";
import { api } from "../../utils/api";
import {
  ArrowLeft, Users, Mail, BookOpen, Calendar, CheckCircle, 
  GraduationCap, Home, Info, Contact, Book, LogOut, Bell, Menu, X
} from "lucide-react";

// Reusable Components (Copied from TutorDashboard for consistency)
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

// PlaceholdersAndVanishInput Component (Copied from TutorDashboard)
const PlaceholdersAndVanishInput = ({ placeholders, onChange, onSubmit }) => {
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const intervalRef = useRef(null);
  const canvasRef = useRef(null);
  const inputRef = useRef(null);
  const newDataRef = useRef([]);
  const [value, setValue] = useState("");
  const [animating, setAnimating] = useState(false);

  const startAnimation = () => {
    intervalRef.current = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
    }, 3000);
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState !== "visible" && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    } else if (document.visibilityState === "visible") {
      startAnimation();
    }
  };

  useEffect(() => {
    startAnimation();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [placeholders]);

  const draw = useCallback(() => {
    if (!inputRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 800;
    ctx.clearRect(0, 0, 800, 800);
    const computedStyles = getComputedStyle(inputRef.current);

    const fontSize = parseFloat(computedStyles.getPropertyValue("font-size"));
    ctx.font = `${fontSize * 2}px ${computedStyles.fontFamily}`;
    ctx.fillStyle = "#FFF";
    ctx.fillText(value, 16, 40);

    const imageData = ctx.getImageData(0, 0, 800, 800);
    const pixelData = imageData.data;
    const newData = [];

    for (let t = 0; t < 800; t++) {
      let i = 4 * t * 800;
      for (let n = 0; n < 800; n++) {
        let e = i + 4 * n;
        if (
          pixelData[e] !== 0 &&
          pixelData[e + 1] !== 0 &&
          pixelData[e + 2] !== 0
        ) {
          newData.push({
            x: n,
            y: t,
            color: [
              pixelData[e],
              pixelData[e + 1],
              pixelData[e + 2],
              pixelData[e + 3],
            ],
          });
        }
      }
    }

    newDataRef.current = newData.map(({ x, y, color }) => ({
      x,
      y,
      r: 1,
      color: `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`,
    }));
  }, [value]);

  useEffect(() => {
    draw();
  }, [value, draw]);

  const animate = (start) => {
    const animateFrame = (pos = 0) => {
      requestAnimationFrame(() => {
        const newArr = [];
        for (let i = 0; i < newDataRef.current.length; i++) {
          const current = newDataRef.current[i];
          if (current.x < pos) {
            newArr.push(current);
          } else {
            if (current.r <= 0) {
              current.r = 0;
              continue;
            }
            current.x += Math.random() > 0.5 ? 1 : -1;
            current.y += Math.random() > 0.5 ? 1 : -1;
            current.r -= 0.05 * Math.random();
            newArr.push(current);
          }
        }
        newDataRef.current = newArr;
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) {
          ctx.clearRect(pos, 0, 800, 800);
          newDataRef.current.forEach((t) => {
            const { x: n, y: i, r: s, color: color } = t;
            if (n > pos) {
              ctx.beginPath();
              ctx.rect(n, i, s, s);
              ctx.fillStyle = color;
              ctx.strokeStyle = color;
              ctx.stroke();
            }
          });
        }
        if (newDataRef.current.length > 0) {
          animateFrame(pos - 8);
        } else {
          setValue("");
          setAnimating(false);
        }
      });
    };
    animateFrame(start);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !animating) {
      vanishAndSubmit();
    }
  };

  const vanishAndSubmit = () => {
    setAnimating(true);
    draw();

    const value = inputRef.current?.value || "";
    if (value && inputRef.current) {
      const maxX = newDataRef.current.reduce(
        (prev, current) => (current.x > prev ? current.x : prev),
        0
      );
      animate(maxX);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    vanishAndSubmit();
    onSubmit && onSubmit(e);
  };

  return (
    <form
      className={`w-full relative max-w-md bg-gray-50 h-12 rounded-full overflow-hidden shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(255,255,255,0.5)] transition duration-200 ${
        value ? "bg-gray-100" : ""
      }`}
      onSubmit={handleSubmit}
    >
      <canvas
        className={`absolute pointer-events-none text-base transform scale-50 top-[20%] left-2 sm:left-8 origin-top-left filter invert dark:invert-0 pr-20 ${
          !animating ? "opacity-0" : "opacity-100"
        }`}
        ref={canvasRef}
      />
      <input
        onChange={(e) => {
          if (!animating) {
            setValue(e.target.value);
            onChange && onChange(e);
          }
        }}
        onKeyDown={handleKeyDown}
        ref={inputRef}
        value={value}
        type="text"
        className={`w-full relative text-sm sm:text-base z-50 border border-gray-300 focus:border-purple-500 focus:border-2 bg-transparent text-gray-900 h-full rounded-full focus:outline-none focus:ring-0 pl-4 sm:pl-10 pr-20 ${
          animating ? "text-transparent" : ""
        }`}
      />
      <button
        disabled={!value}
        type="submit"
        className="absolute right-2 top-1/2 z-50 -translate-y-1/2 h-8 w-8 rounded-full disabled:bg-gray-200 bg-indigo-600 transition duration-200 flex items-center justify-center"
      >
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white h-4 w-4"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <motion.path
            d="M5 12l14 0"
            initial={{ strokeDasharray: "50%", strokeDashoffset: "50%" }}
            animate={{ strokeDashoffset: value ? 0 : "50%" }}
            transition={{ duration: 0.3, ease: "linear" }}
          />
          <path d="M13 18l6 -6" />
          <path d="M13 6l6 6" />
        </motion.svg>
      </button>
      <div className="absolute inset-0 flex items-center rounded-full pointer-events-none">
        <AnimatePresence mode="wait">
          {!value && (
            <motion.p
              initial={{ y: 5, opacity: 0 }}
              key={`current-placeholder-${currentPlaceholder}`}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -15, opacity: 0 }}
              transition={{ duration: 0.3, ease: "linear" }}
              className="text-gray-400 text-sm sm:text-base font-normal pl-4 sm:pl-10 text-left w-[calc(100%-2rem)] truncate"
            >
              {placeholders[currentPlaceholder]}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
};

export const CourseEnrollmentsPage = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, enrollmentsRes, notificationsRes, unreadCountRes] = await Promise.all([
          courseApi.getCourse(id),
          enrollmentApi.getCourseEnrollments(id),
          api.get("/api/notifications"),
          api.get("/api/notifications/unread-count"),
        ]);
        
        setCourse(courseRes.data);
        setEnrollments(enrollmentsRes.data);
        setNotifications(notificationsRes.data);
        setUnreadCount(unreadCountRes.data.count);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load course data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, toast]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await api.post("/logout");
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
      console.error("Error marking all notifications as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read.",
        variant: "destructive",
      });
    }
  };

  const filteredEnrollments = enrollments.filter(
    (enrollment) =>
      enrollment.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const searchPlaceholders = ["Search students..."];

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  if (loading) {
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
        `}
      </style>

      {/* Navbar (Copied from TutorDashboard) */}
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-indigo-100 text-indigo-600 py-1 px-5 shadow-md rounded-full">
            COURSE MANAGEMENT
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Student Enrollments
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Monitor and manage the students enrolled in your course.
          </p>
        </motion.div>

        {/* Course Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <SpotlightCard
            spotlightColor="rgba(139, 92, 246, 0.25)"
            className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
          >
            <div className="px-6 py-5 flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-indigo-50 p-4 rounded-xl mr-4">
                  <BookOpen className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{course?.title}</h2>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm text-gray-500 flex items-center">
                      <Users className="w-4 h-4 mr-1 text-indigo-500" />
                      {enrollments.length} Students
                    </span>
                    <span className="text-sm text-gray-500 flex items-center">
                      <Calendar className="w-4 h-4 mr-1 text-indigo-500" />
                      Created {new Date(course?.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Link to={`/tutor/edit-course/${id}`}>
                  <Button
                    variant="outline"
                    className="border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 text-indigo-600 px-4 py-2 rounded-xl"
                  >
                    Edit Course
                  </Button>
                </Link>
                <Link to={`/course/${id}`}>
                  <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl">
                    Preview Course
                  </Button>
                </Link>
              </div>
            </div>
          </SpotlightCard>
        </motion.div>

        {/* Enrollments Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mt-12"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div className="flex items-center mb-4 md:mb-0">
              <GraduationCap className="w-6 h-6 mr-2 text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-900">Enrolled Students</h2>
            </div>
            <div className="w-full md:w-64">
              <PlaceholdersAndVanishInput
                placeholders={searchPlaceholders}
                onChange={handleSearchChange}
                onSubmit={handleSearchSubmit}
              />
            </div>
          </div>

          <SpotlightCard
            spotlightColor="rgba(139, 92, 246, 0.25)"
            className="bg-white rounded-xl shadow-lg overflow-hidden border border-indigo-50"
          >
            {filteredEnrollments.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-10 h-10 text-indigo-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? `No students found matching "${searchTerm}"` : "No students enrolled yet"}
                </h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  {searchTerm ? "Try adjusting your search terms." : "When students enroll in your course, they will appear here. Share your course link to get started!"}
                </p>
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl">
                  Share Course Link
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Enrolled On
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progress
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredEnrollments.map((enrollment) => (
                      <tr key={enrollment._id} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-500 flex items-center justify-center text-white mr-3">
                              {enrollment.student.name.charAt(0)}
                            </div>
                            <div className="font-medium text-gray-900">
                              {enrollment.student.name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {enrollment.student.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {new Date(enrollment.enrolledAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2.5 rounded-full" 
                              style={{ width: `${enrollment.progress || 0}%` }}
                            />
                          </div>
                          <div className="flex items-center mt-1">
                            <span className="text-xs text-gray-500 inline-block">
                              {enrollment.progress || 0}%
                            </span>
                            {enrollment.progress === 100 && (
                              <CheckCircle className="w-3 h-3 ml-1 text-green-500" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button
                            variant="outline"
                            className="border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 text-indigo-600 px-4 py-2 rounded-xl"
                          >
                            <Mail className="w-4 h-4 mr-1" /> Message
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SpotlightCard>
        </motion.section>
      </main>

      {/* Footer (Copied from TutorDashboard) */}
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