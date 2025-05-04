import { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { courseApi, enrollmentApi, paymentApi, api } from "../utils/api";
import { useToast } from "../hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import SpotlightCard from "./SpotlightCard/SpotlightCard";
import "./SpotlightCard/SpotlightCard.css";
import {
  Book,
  BookOpen,
  GraduationCap,
  Home,
  LogOut,
  Bell,
  Info,
  Contact,
  Menu,
  X,
  Users,
  CreditCard,
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

export const PaymentPage = () => {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch course details including enrollments and videos
        const courseRes = await courseApi.getCourse(id);
        setCourse(courseRes.data);

        // Fetch notifications
        const notificationsRes = await api.get("/api/notifications");
        setNotifications(notificationsRes.data);

        const unreadCountRes = await api.get("/api/notifications/unread-count");
        setUnreadCount(unreadCountRes.data.count);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load course data. Please try again later.",
          variant: "destructive",
        });
        navigate("/student");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, toast, navigate]);

  const generateInvoice = (paymentDetails) => {
    return {
      invoiceId: `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user: {
        name: user?.name || "Unknown",
        email: user?.email || "N/A",
      },
      course: {
        id: course._id,
        title: course.title,
        price: course.payment === "paid" ? course.price : 0,
      },
      payment: {
        status: "completed",
        amount: course.payment === "paid" ? course.price : 0,
        currency: "USD",
        paymentId: paymentDetails?.paymentId || "FREE",
        date: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
    };
  };

  const handleFreeEnrollment = async () => {
    try {
      await enrollmentApi.enrollCourse(id);
      const invoice = generateInvoice(null);

      toast({
        title: "Enrollment Successful",
        description: `You have successfully enrolled in ${course.title}!`,
      });

      // Simulate saving invoice to backend
      console.log("Generated Invoice:", invoice);

      navigate("/student");
    } catch (error) {
      console.error("Enrollment error:", error);
      toast({
        title: "Enrollment Failed",
        description:
          error.response?.data?.message || "Could not process enrollment",
        variant: "destructive",
      });
    }
  };

  const handlePayment = async () => {
    try {
      // Create payment link
      const paymentResponse = await paymentApi.createPaymentLink(id);
      const { paymentLink } = paymentResponse.data;

      if (!paymentLink) {
        throw new Error("Payment link not received from server");
      }

      // Redirect user to the Stripe payment link
      window.location.href = paymentLink;
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description:
          error.response?.data?.message || "Could not initiate payment",
        variant: "destructive",
      });
    }
  };

  const handleAction = () => {
    if (course.payment === "free") {
      handleFreeEnrollment();
    } else {
      handlePayment();
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
          visibility: "visible",
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
        {/* Payment Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-indigo-100 text-indigo-600 py-1 px-5 shadow-md rounded-full">
            SECURE CHECKOUT
          </Badge>
          <h1 className="text-4xl md:text-5xl pb-1 font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Course Payment
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Complete your purchase to start learning with EduVerse.
          </p>
        </motion.div>

        {/* Course Payment Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Course Card */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <SpotlightCard
                spotlightColor="rgba(139, 92, 246, 0.25)"
                className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 group"
              >
                <div className="h-64 relative overflow-hidden">
                  {course?.thumbnail ? (
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
                      {(course.rating || Math.random() * 1 + 4).toFixed(1)} (
                      {course.reviews?.length ||
                        Math.floor(Math.random() * 100 + 50)}
                      )
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 flex-1">
                    {course.description?.length > 100
                      ? `${course.description.substring(0, 100)}...`
                      : course.description || "No description available"}
                  </p>
                  <div className="mt-auto">
                    <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {course.enrollments?.length || 0} students
                      </span>
                      <span className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        {course.videos?.length || 0} videos
                      </span>
                    </div>
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
                  </div>
                </div>
              </SpotlightCard>
            </motion.div>

            {/* Payment Details */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <SpotlightCard
                spotlightColor="rgba(139, 92, 246, 0.25)"
                className="bg-white rounded-xl shadow-lg p-8 border border-gray-100"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {course.title}
                </h2>
                <p className="text-gray-600 mb-6">
                  {course.description || "No description available"}
                </p>
                <div className="mb-4 flex items-center">
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className="w-5 h-5 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784 .57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81 .588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"></path>
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500 ml-2">
                    {(course.rating || Math.random() * 1 + 4).toFixed(1)} (
                    {course.reviews?.length ||
                      Math.floor(Math.random() * 100 + 50)}{" "}
                    reviews)
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-500 mb-6">
                  <Users className="w-4 h-4 mr-1" />
                  <span>
                    {course.enrollments?.length || 0} students enrolled
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-500 mb-6">
                  <BookOpen className="w-4 h-4 mr-1" />
                  <span>{course.videos?.length || 0} videos</span>
                </div>
                <div className="mb-6">
                  {course.payment === "free" ? (
                    <span className="text-3xl font-bold text-green-600">
                      Free
                    </span>
                  ) : (
                    <>
                      <span className="text-3xl font-bold text-indigo-600">
                        ${course.price.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        one-time
                      </span>
                    </>
                  )}
                </div>
                <Button
                  onClick={handleAction}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-4 rounded-xl flex items-center justify-center"
                >
                  {course.payment === "free" ? (
                    <>
                      <BookOpen className="w-5 h-5 mr-2" />
                      Enroll Now
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      Pay Now
                    </>
                  )}
                </Button>
              </SpotlightCard>
            </motion.div>
          </div>
        </motion.section>
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
              © {new Date().getFullYear()} EduVerse. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
