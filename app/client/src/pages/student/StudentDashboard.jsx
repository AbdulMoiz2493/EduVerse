import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"; // Added useLocation
import { useAuth } from "../../contexts/AuthContext";
import { courseApi, enrollmentApi, paymentApi, api } from "../../utils/api";
import { useToast } from "../../hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import SpotlightCard from "../SpotlightCard/SpotlightCard";
import "../SpotlightCard/SpotlightCard.css";
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
  LogOut,
  Bell,
  Info,
  Contact,
  Menu,
  X,
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

// PlaceholdersAndVanishInput Component (Adapted for React)
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
    }, 5000);
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
      className={`w-full relative max-w-md mx-auto bg-gray-50 h-12 rounded-full overflow-hidden shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(255,255,255,0.5)] transition duration-200 ${
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

export const StudentDashboard = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [learningStats, setLearningStats] = useState({
    learningHours: 0,
    aiSessions: 0,
  });
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
  const location = useLocation();

  const fetchData = async () => {
    try {
      // Fetch payments to check for completed payments
      const paymentsRes = await paymentApi.getUserPayments();
      const completedPayments = paymentsRes.data.filter(
        (payment) => payment.status === "completed"
      );

      // Fetch enrollments
      const enrollmentsRes = await enrollmentApi.getStudentEnrollments();
      const enrolledCoursesData = enrollmentsRes.data
        .filter((enrollment) => enrollment?.course != null)
        .map((enrollment) => enrollment.course);
      const enrolledCourseIds = enrolledCoursesData.map((course) => course._id);

      // Handle enrollments for completed payments
      for (const payment of completedPayments) {
        if (!payment.course) {
          //console.warn(`Payment ${payment._id} has no associated course. Skipping enrollment.`);
          // toast({
          //   title: "Enrollment Skipped",
          //   description: "A completed payment has no associated course. Please contact support.",
          //   variant: "destructive",
          // });
          continue; // Skip this payment
        }
      
        if (!enrolledCourseIds.includes(payment.course._id)) {
          try {
            await enrollmentApi.enrollCourse(payment.course._id);
            enrolledCoursesData.push(payment.course);
            enrolledCourseIds.push(payment.course._id);
            toast({
              title: "Enrollment Confirmed!",
              description: `You have been enrolled in ${payment.course.title}.`,
            });
          } catch (error) {
            console.error(
              `Failed to enroll in course ${payment.course._id}:`,
              error
            );
            toast({
              title: "Enrollment Failed",
              description: `Could not enroll in ${payment.course.title}. Please contact support.`,
              variant: "destructive",
            });
          }
        }
      }

      setEnrolledCourses(enrolledCoursesData);

      // Fetch all courses
      const allCoursesRes = await courseApi.getAllCourses();
      const availableCoursesData = allCoursesRes.data.filter(
        (course) => course != null && !enrolledCourseIds.includes(course._id)
      );
      setAvailableCourses(availableCoursesData);

      // Fetch notifications
      const notificationsRes = await api.get("/api/notifications");
      setNotifications(notificationsRes.data);

      const unreadCountRes = await api.get("/api/notifications/unread-count");
      setUnreadCount(unreadCountRes.data.count);

      console.log("Enrolled Courses:", enrolledCoursesData);
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

  useEffect(() => {
    fetchData();
  }, [toast, navigate]);

  const handleEnroll = async (courseId) => {
    try {
      await enrollmentApi.enrollCourse(courseId);
      const course = availableCourses.find((c) => c._id === courseId);
      if (course) {
        setEnrolledCourses([...enrolledCourses, course]);
        setAvailableCourses(availableCourses.filter((c) => c._id !== courseId));
        toast({
          title: "Enrolled!",
          description: "You have successfully enrolled in this course",
        });
      }
    } catch (error) {
      console.error("Enrollment error:", error);
      toast({
        title: "Enrollment Failed",
        description:
          error.response?.data?.message || "Could not enroll in the course",
        variant: "destructive",
      });
    }
  };

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

  const filteredAvailableCourses = availableCourses.filter(
    (course) =>
      course &&
      (course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()))
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
    {
      name: "Courses",
      path: "/courses",
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      name: "Contact",
      path: "/contact",
      icon: <Contact className="w-4 h-4" />,
    },
    {
      name: "Dashboard",
      path: "/student",
      icon: <BookOpen className="w-4 h-4" />,
    },
  ];

  const searchPlaceholders = [
    "Search for ML courses",
    "Find Web Dev tutorials",
    "Explore DS programs",
    "Discover AI courses",
  ];

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // No additional action needed as search is handled by state change
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
                {user?.name?.charAt(0) || "S"}
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
        {/* Dashboard Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-indigo-100 text-indigo-600 py-1 px-5 shadow-md rounded-full">
            YOUR LEARNING JOURNEY
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Student Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Track your progress, discover new courses, and continue your
            personalized learning experience.
          </p>
        </motion.div>

        {/* Learning Stats */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
        >
          {[
            {
              icon: <BookOpen className="w-12 h-12 text-indigo-600" />,
              title: "Enrolled Courses",
              value: enrolledCourses.length || 0,
              color: "from-indigo-500 to-blue-500",
            },
            {
              icon: <Target className="w-12 h-12 text-purple-600" />,
              title: "Learning Hours",
              value: learningStats.learningHours || 0,
              color: "from-purple-500 to-pink-500",
            },
            {
              icon: <Brain className="w-12 h-12 text-blue-600" />,
              title: "AI-Enhanced Sessions",
              value: learningStats.aiSessions || 0,
              color: "from-blue-500 to-cyan-500",
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.6,
                delay: index * 0.2,
                ease: "easeOut",
              }}
            >
              <SpotlightCard
                spotlightColor="rgba(139, 92, 246, 0.25)"
                className="group bg-white rounded-xl shadow-lg border border-gray-100"
              >
                <div className="p-6">
                  <motion.div
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    className="bg-indigo-50 p-4 rounded-xl w-16 h-16 flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors"
                  >
                    {stat.icon}
                  </motion.div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {stat.title}
                  </h3>
                  <div className="flex items-center">
                    <span
                      className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                    >
                      {stat.value}
                    </span>
                  </div>
                </div>
                <div className={`h-1 bg-gradient-to-r ${stat.color}`}></div>
              </SpotlightCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Enrolled Courses Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="flex items-center mb-6">
            <BookOpen className="w-6 h-6 mr-2 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              My Enrolled Courses
            </h2>
          </div>

          {enrolledCourses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <SpotlightCard
                spotlightColor="rgba(139, 92, 246, 0.25)"
                className="bg-white rounded-xl shadow-lg p-8 text-center border border-dashed border-gray-300"
              >
                <GraduationCap className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  You haven't enrolled in any courses yet.
                </p>
                <p className="text-gray-600 mb-6">
                  Browse available courses below and start your learning
                  journey.
                </p>
                <Button
                  onClick={() =>
                    document
                      .getElementById("available-courses")
                      .scrollIntoView({ behavior: "smooth" })
                  }
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl"
                >
                  Explore Courses <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </SpotlightCard>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {enrolledCourses.map(
                (course) =>
                  course && (
                    <motion.div
                      key={course._id}
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                      <SpotlightCard
                        spotlightColor="rgba(139, 92, 246, 0.25)"
                        className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 group"
                      >
                        <div className="h-48 relative overflow-hidden">
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
                            <Badge className="bg-indigo-500/80 backdrop-blur-sm text-white">
                              {course.category || "Course"}
                            </Badge>
                          </div>
                        </div>
                        <div className="p-6 flex flex-col flex-1">
                          <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-indigo-700 transition-colors">
                            {course.title}
                          </h3>
                          <div className="mb-2 flex items-center">
                            <div className="flex space-x-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                  key={star}
                                  className="w-4 h-4 text-yellow-400"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784 .57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81 .588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"></path>
                                </svg>
                              ))}
                            </div>
                            <span className="text-sm text-gray-500 ml-2">
                              {(Math.random() * 1 + 4).toFixed(1)} (
                              {Math.floor(Math.random() * 100 + 50)})
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-4 flex-1">
                            {course.description?.length > 100
                              ? `${course.description.substring(0, 100)}...`
                              : course.description ||
                                "No description available"}
                          </p>
                          <div className="mt-auto">
                            <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                              <span className="flex items-center">
                                <Users className="w-4 h-4 mr-1" />
                                {Math.floor(Math.random() * 1000 + 100)}{" "}
                                students
                              </span>
                              <span className="flex items-center">
                                <BookOpen className="w-4 h-4 mr-1" />
                                {course.videos?.length ||
                                  Math.floor(Math.random() * 20 + 5)}{" "}
                                videos
                              </span>
                            </div>
                            <div className="bg-gray-100 h-2 rounded-full mb-4">
                              <div
                                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full"
                                style={{
                                  width: `${Math.floor(
                                    Math.random() * 80 + 10
                                  )}%`,
                                }}
                              ></div>
                            </div>
                            <Link to={`/course/${course._id}`}>
                              <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl group">
                                Continue Learning
                                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </SpotlightCard>
                    </motion.div>
                  )
              )}
            </div>
          )}
        </motion.section>

        {/* Search and Available Courses Section */}
        <motion.section
          id="available-courses"
          className="mt-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div className="flex items-center mb-4 md:mb-0">
              <Book className="w-6 h-6 mr-2 text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                Discover New Courses
              </h2>
            </div>

            <div className="w-full md:w-auto ">
              <PlaceholdersAndVanishInput
                placeholders={searchPlaceholders}
                onChange={handleSearchChange}
                onSubmit={handleSearchSubmit}
              />
            </div>
          </div>

          {filteredAvailableCourses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <SpotlightCard
                spotlightColor="rgba(139, 92, 246, 0.25)"
                className="bg-white rounded-xl shadow-lg p-8 text-center border border-dashed border-gray-300"
              >
                {searchTerm ? (
                  <>
                    <Search handshakeclassName="w-16 h-16 text-indigo-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      No courses found matching "{searchTerm}".
                    </p>
                    <p className="text-gray-600 mt-2">
                      Try adjusting your search terms or browse all courses.
                    </p>
                  </>
                ) : (
                  <>
                    <Book className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      No courses available at the moment.
                    </p>
                    <p className="text-gray-600 mt-2">
                      Please check back later for new course offerings.
                    </p>
                  </>
                )}
              </SpotlightCard>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAvailableCourses.map(
                (course) =>
                  course && (
                    <motion.div
                      key={course._id}
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                      <SpotlightCard
                        spotlightColor="rgba(139, 92, 246, 0.25)"
                        className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 group"
                      >
                        <div className="h-48 relative overflow-hidden">
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
                            <Badge className="bg-purple-500/80 backdrop-blur-sm text-white">
                              {course.category || "New"}
                            </Badge>
                          </div>
                        </div>
                        <div className="p-6 flex flex-col flex-1">
                          <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-indigo-700 transition-colors">
                            {course.title}
                          </h3>
                          <div className="mb-2 flex items-center">
                            <div className="flex space-x-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                  key={star}
                                  className="w-4 h-4 text-yellow-400"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784 .57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81 .588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"></path>
                                </svg>
                              ))}
                            </div>
                            <span className="text-sm text-gray-500 ml-2">
                              {(Math.random() * 1 + 4).toFixed(1)} (
                              {Math.floor(Math.random() * 100 + 50)})
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-4 flex-1">
                            {course.description?.length > 100
                              ? `${course.description.substring(0, 100)}...`
                              : course.description ||
                                "No description available"}
                          </p>
                          <div className="mt-auto">
                            <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                              <span className="flex items-center">
                                <Users className="w-4 h-4 mr-1" />
                                {Math.floor(Math.random() * 1000 + 100)}{" "}
                                students
                              </span>
                              <span className="flex items-center">
                                <BookOpen className="w-4 h-4 mr-1" />
                                {course.videos?.length ||
                                  Math.floor(Math.random() * 20 + 5)}{" "}
                                videos
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
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
                              <Button
                                onClick={() =>
                                  navigate(`/payment/${course._id}`)
                                }
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl group"
                              >
                                Enroll Now
                              </Button>
                            </div>
                          </div>
                        </div>
                      </SpotlightCard>
                    </motion.div>
                  )
              )}
            </div>
          )}
        </motion.section>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mt-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white text-center"
        >
          <div className="max-w-3xl mx-auto">
            <GraduationCap className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Unlock Your Full Potential with AI-Enhanced Learning
            </h2>
            <p className="mb-6 text-lg">
              Get personalized course recommendations, AI-generated study
              materials, and interactive learning experiences.
            </p>
            <Button className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-4 text-lg font-medium rounded-xl">
              Explore Premium Features
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
                Empowering learners worldwide with innovative education
                solutions.
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
