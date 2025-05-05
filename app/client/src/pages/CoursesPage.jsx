import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Info,
  Home,
  BookOpen,
  Contact,
  Menu,
  X,
  LogOut,
  Code,
  Database,
  Palette,
  LayoutDashboard,
} from "lucide-react";
import Aurora from "./Aurora/Aurora";
import SpotlightCard from "./SpotlightCard/SpotlightCard";
import "./SpotlightCard/SpotlightCard.css";

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

function CoursesPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
    const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage?.getItem("token");
      setIsLoggedIn(!!token);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsLoggedIn(false);
      setUserRole(null);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsLoggedIn(false);
      setUserRole(null);
      navigate("/login");
    }
  };

  const navItems = [
    { name: "Home", path: "/", icon: <Home className="w-3 h-3" /> },
    { name: "About", path: "/about", icon: <Info className="w-3 h-3" /> },
    {
      name: "Courses",
      path: "/courses",
      icon: <BookOpen className="w-3 h-3" />,
    },
    {
      name: "Contact",
      path: "/contact",
      icon: <Contact className="w-3 h-3" />,
    },
    ...(isLoggedIn
      ? [
          {
            name: "Dashboard",
            path: userRole === "tutor" ? "/tutor" : "/student",
            icon: <LayoutDashboard className="w-4 h-4" />,
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen overflow-x-hidden relative bg-gray-50">
      <style>
        {`
          .aurora-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
            opacity: 0.2;
          }
          .mobile-menu-toggle {
            position: fixed;
            top: 24px;
            right: 16px;
            z-index: 1000;
          }
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
      <div className="relative min-h-screen transition-all duration-700 bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100">
        {/* Navbar */}
        <div className="fixed top-4 left-0 right-0 flex justify-center z-50 px-6">
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`rounded-full py-1 px-3 transition-all duration-300 
                      ${
                        isScrolled
                          ? "bg-white/40 backdrop-blur-xl shadow-xl [backdrop-filter:blur(12px)] [-webkit-backdrop-filter:blur(12px)]"
                          : "bg-white/30 backdrop-blur-xl shadow-xl [backdrop-filter:blur(12px)] [-webkit-backdrop-filter:blur(12px)]"
                      }
                      flex items-center justify-between w-full max-w-4xl border border-white/20 h-11 relative`}
          >
            {/* Logo on the Left */}
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

            {/* Centered Navigation Items */}
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

            {/* Authentication Buttons on the Right */}
            <div className="hidden md:flex items-center gap-0.5">
              {isLoggedIn ? (
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={handleLogout}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all text-white py-1 px-2.5 rounded-full text-xs"
                  >
                    <LogOut className="w-3 h-3 mr-1" />
                    Log Out
                  </Button>
                </motion.div>
              ) : (
                <div className="flex gap-0.5">
                  <motion.div
                    whileHover={{ scale: 1.0, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={() => navigate("/login")}
                      className="hover:bg-indigo-50 hover:text-indigo-600 font-medium text-gray-600 py-1 px-2.5 rounded-full transition-all text-xs"
                    >
                      Log In
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={() => navigate("/signup")}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all text-white py-1 px-2.5 rounded-full text-xs"
                    >
                      Sign Up
                    </Button>
                  </motion.div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="relative z-50 md:hidden mobile-menu-toggle -translate-y-3 transition !hover:transform-none">
              <Button
                onClick={() => setMenuOpen(!menuOpen)}
                className="relative z-50 bg-transparent text-gray-600 hover:text-indigo-600"
              >
                {menuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </Button>
            </div>
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
              {isLoggedIn ? (
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
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: menuOpen ? 1 : 0, y: menuOpen ? 0 : 20 }}
                  transition={{ delay: navItems.length * 0.1, duration: 0.3 }}
                  className="mt-4 flex flex-col gap-3"
                >
                  <Button
                    onClick={() => {
                      navigate("/login");
                      setMenuOpen(false);
                    }}
                    className="bg-white text-indigo-600 hover:bg-gray-100 py-2 px-4 rounded-full"
                  >
                    Log In
                  </Button>
                  <Button
                    onClick={() => {
                      navigate("/signup");
                      setMenuOpen(false);
                    }}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-2 px-4 rounded-full"
                  >
                    Sign Up
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 pt-24 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-indigo-100 text-indigo-600 py-1 px-5 shadow-md rounded-full">
              OUR COURSES
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Explore Our Courses
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover a wide range of courses designed to help you achieve your
              learning goals, from technology to creative arts.
            </p>
          </motion.div>

          {/* Featured Courses Section */}
          <div className="py-16 section-bg">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Featured Courses
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Start your learning journey with our most popular courses,
                  curated for success.
                </p>
              </motion.div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    icon: <Code className="w-12 h-12 text-indigo-600" />,
                    title: "Web Development Bootcamp",
                    description:
                      "Learn to build modern web applications with HTML, CSS, JavaScript, and React.",
                  },
                  {
                    icon: <Database className="w-12 h-12 text-indigo-600" />,
                    title: "Data Science Fundamentals",
                    description:
                      "Master data analysis, visualization, and machine learning with Python.",
                  },
                  {
                    icon: <Palette className="w-12 h-12 text-indigo-600" />,
                    title: "Digital Art & Design",
                    description:
                      "Create stunning visuals with tools like Photoshop, Illustrator, and Procreate.",
                  },
                ].map((course, index) => (
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
                      className="group bg-white"
                    >
                      <motion.div
                        whileHover={{ rotate: 5, scale: 1.1 }}
                        className="bg-indigo-50 p-4 rounded-xl w-20 h-20 flex items-center justify-center mb-6 group-hover:bg-indigo-100 transition-colors"
                      >
                        {course.icon}
                      </motion.div>
                      <h3 className="text-xl font-bold mb-3 text-gray-900">
                        {course.title}
                      </h3>
                      <p className="text-gray-600">{course.description}</p>
                      <Button
                        onClick={() => navigate("/signup")}
                        className="mt-4 bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-md"
                      >
                        Enroll Now
                      </Button>
                    </SpotlightCard>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Call to Action Section */}
          <div className="py-16 text-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent pb-1">
                Ready with Your Learning?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                Sign up today to access our full course library and start
                learning at your own pace.
              </p>
              <Button
                onClick={() => navigate("/signup")}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl"
              >
                Get Started
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Footer Section */}
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
    </div>
  );
}

export default CoursesPage;
