import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import HeroScene from "../components/HeroScene";
import { 
  Play, 
  GraduationCap, 
  BookOpen, 
  Users, 
  CheckCircle, 
  ArrowRight, 
  Brain,
  Target,
  Clock,
  RefreshCw,
  LogOut
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { authApi } from "../utils/api";

const slides = [
  {
    title: "Experience Personalized Learning",
    subtitle: "Connect with expert tutors who will guide your unique educational journey.",
    icon: <GraduationCap className="w-16 h-16 text-indigo-600" />,
    bgGradient: "from-indigo-100 via-purple-50 to-blue-100",
    badge: "Smart Tutoring"
  },
  {
    title: "Learn Without Limits",
    subtitle: "Access course videos with AI-powered transcripts, summaries, and personalized recommendations.",
    icon: <Brain className="w-16 h-16 text-blue-600" />,
    bgGradient: "from-blue-100 via-indigo-50 to-purple-100",
    badge: "AI-Enhanced Learning"
  },
  {
    title: "Join a Thriving Community",
    subtitle: "Engage with tutors and fellow learners through interactive sessions and real-time discussions.",
    icon: <Users className="w-16 h-16 text-purple-600" />,
    bgGradient: "from-purple-100 via-indigo-50 to-blue-100",
    badge: "Community-Driven",
    final: true
  },
];

// Features for the scrolling section
const features = [
  {
    icon: <Target className="w-6 h-6 text-indigo-600" />,
    title: "Personalized Learning Paths",
    description: "AI algorithms create custom learning journeys based on your goals and progress."
  },
  {
    icon: <Clock className="w-6 h-6 text-indigo-600" />,
    title: "Flexible Scheduling",
    description: "Book sessions with tutors that fit your calendar and learning preferences."
  },
  {
    icon: <RefreshCw className="w-6 h-6 text-indigo-600" />,
    title: "Continuous Improvement",
    description: "Analytics and feedback help optimize your learning experience over time."
  },
  {
    icon: <BookOpen className="w-6 h-6 text-indigo-600" />,
    title: "Comprehensive Library",
    description: "Access thousands of courses, tutorials, and resources across disciplines."
  }
];

export const WelcomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track login status
  const navigate = useNavigate();
  const featuresRef = useRef(null);

  // Check if user is logged in on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token); // Set isLoggedIn to true if token exists
  }, []);

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
      
      // Check if features section is in view for animation
      if (featuresRef.current) {
        const rect = featuresRef.current.getBoundingClientRect();
        const isInView = rect.top <= window.innerHeight && rect.bottom >= 0;
        if (isInView) {
          featuresRef.current.classList.add('features-visible');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle slide transitions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentSlide < slides.length - 1) {
        setCurrentSlide(currentSlide + 1);
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [currentSlide]);

  const slide = slides[currentSlide];

  const handleSlideChange = (index) => {
    setCurrentSlide(index);
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

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Hero Section with 3D Background */}
      <div className={`relative min-h-screen bg-gradient-to-b ${slide.bgGradient} transition-all duration-700`}>
        <div className="absolute inset-0 -z-10">
          <HeroScene />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 py-6">
          {/* Header/Navigation */}
          <header className={`py-4 fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : ''}`}>
            <div className="container mx-auto px-4">
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
                
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="flex gap-4"
                >
                  {isLoggedIn ? (
                    <Button
                      onClick={handleLogout}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all text-white"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Log Out
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        onClick={() => navigate("/login")}
                        className="hover:bg-indigo-50 hover:text-indigo-700 font-medium"
                      >
                        Log In
                      </Button>
                      <Button 
                        onClick={() => navigate("/signup")}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all text-white"
                      >
                        Sign Up
                      </Button>
                    </>
                  )}
                </motion.div>
              </div>
            </div>
          </header>

          {/* Main Hero Content */}
          <div className="flex flex-col justify-center items-center text-center pt-32 pb-20 min-h-screen">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto"
              >
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="mb-8 flex justify-center"
                >
                  {slide.icon}
                </motion.div>
                
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <Badge variant="gradient" className="mb-6 py-1.5 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium text-sm">
                    {slide.badge}
                  </Badge>
                  
                  <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                    {slide.title}
                  </h1>
                  
                  <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto mb-10 leading-relaxed">
                    {slide.subtitle}
                  </p>
                  
                  {slide.final && (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                    >
                      <Button
                        onClick={() => navigate("/signup")}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-6 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transition-all group"
                        size="lg"
                      >
                        Start Your Learning Journey
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Slide Indicators */}
            <div className="absolute bottom-10 left-0 right-0 flex justify-center space-x-3">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleSlideChange(index)}
                  className={`h-3 w-12 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? "bg-indigo-600 w-16" 
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Scroll Down Indicator */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, y: [0, 10, 0] }}
              transition={{ delay: 1, duration: 1.5, repeat: Infinity }}
              className="absolute bottom-6 left-0 right-0 flex justify-center"
            >
              <div className="flex flex-col items-center cursor-pointer" onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>
                <span className="text-sm text-gray-600 mb-2">Scroll to explore</span>
                <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center pt-2">
                  <div className="w-1.5 h-3 bg-gray-400 rounded-full animate-bounce"></div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white" ref={featuresRef}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-indigo-100 text-indigo-700 py-1 px-4">WHY CHOOSE EDUVERSE</Badge>
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">Transform Your Learning Experience</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform combines cutting-edge technology with expert instruction to create a truly personalized educational journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100 hover:border-indigo-100 group"
              >
                <div className="bg-indigo-50 p-4 rounded-xl w-16 h-16 flex items-center justify-center mb-6 group-hover:bg-indigo-100 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonial Section */}
      <div className="py-24 bg-gradient-to-b from-white to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-100 text-purple-700 py-1 px-4">TESTIMONIALS</Badge>
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">What Our Users Say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "EduVerse transformed my learning experience. The personalized approach and expert tutors helped me master complex topics in half the time.",
                author: "Sarah J.",
                role: "Data Science Student"
              },
              {
                quote: "As an educator, I'm impressed by the platform's intelligent features. The AI transcripts and analytics help me tailor my teaching to each student's needs.",
                author: "Prof. Michael R.",
                role: "Computer Science Instructor"
              },
              {
                quote: "The community aspect sets EduVerse apart. I've connected with fellow learners and industry experts who've become valuable parts of my professional network.",
                author: "Alex T.",
                role: "Software Engineer"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 relative"
              >
                <div className="absolute -top-4 left-8 text-6xl text-indigo-200">"</div>
                <p className="text-gray-700 mb-6 pt-6 relative z-10">
                  {testimonial.quote}
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <h4 className="font-bold text-gray-900">{testimonial.author}</h4>
                    <p className="text-gray-500 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-24 bg-indigo-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Learning?</h2>
            <p className="text-xl text-indigo-200 max-w-2xl mx-auto mb-10">
              Join thousands of students and educators who are already experiencing the future of education with EduVerse.
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => navigate("/signup")}
                className="bg-white text-indigo-900 hover:bg-indigo-100 px-8 py-6 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                size="lg"
              >
                Create Free Account
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/about")}
                className="border-white text-white bg-indigo-700 hover:bg-indigo-800 hover:text-white px-8 py-6 text-lg font-bold rounded-xl"
                size="lg"
              >
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2" CHOOSE EDUVERSE></div></div>
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">Transform Your Learning Experience</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform combines cutting-edge technology with expert instruction to create a truly personalized educational journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100 hover:border-indigo-100 group"
              >
                <div className="bg-indigo-50 p-4 rounded-xl w-16 h-16 flex items-center justify-center mb-6 group-hover:bg-indigo-100 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </footer>

      {/* Testimonial Section */}
      <div className="py-24 bg-gradient-to-b from-white to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-100 text-purple-700 py-1 px-4">TESTIMONIALS</Badge>
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">What Our Users Say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "EduVerse transformed my learning experience. The personalized approach and expert tutors helped me master complex topics in half the time.",
                author: "Sarah J.",
                role: "Data Science Student"
              },
              {
                quote: "As an educator, I'm impressed by the platform's intelligent features. The AI transcripts and analytics help me tailor my teaching to each student's needs.",
                author: "Prof. Michael R.",
                role: "Computer Science Instructor"
              },
              {
                quote: "The community aspect sets EduVerse apart. I've connected with fellow learners and industry experts who've become valuable parts of my professional network.",
                author: "Alex T.",
                role: "Software Engineer"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 relative"
              >
                <div className="absolute -top-4 left-8 text-6xl text-indigo-200">"</div>
                <p className="text-gray-700 mb-6 pt-6 relative z-10">
                  {testimonial.quote}
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <h4 className="font-bold text-gray-900">{testimonial.author}</h4>
                    <p className="text-gray-500 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-24 bg-indigo-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Learning?</h2>
            <p className="text-xl text-indigo-200 max-w-2xl mx-auto mb-10">
              Join thousands of students and educators who are already experiencing the future of education with EduVerse.
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => navigate("/signup")}
                className="bg-white text-indigo-900 hover:bg-indigo-100 px-8 py-6 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                size="lg"
              >
                Create Free Account
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/about")}
                className="border-white text-white bg-indigo-700 hover:bg-indigo-800 hover:text-white px-8 py-6 text-lg font-bold rounded-xl"
                size="lg"
              >
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-500 w-8 h-8 rounded-lg flex items-center justify-center text-white">
                  <span className="font-bold">E</span>
                </div>
                <span className="font-bold text-xl text-white">EduVerse</span>
              </div>
              <p className="text-sm">
                Transforming education through personalized learning experiences and expert guidance.
              </p>
            </div>
            
            {[
              {
                title: "Platform",
                links: ["Features", "Pricing", "Integrations", "FAQ"]
              },
              {
                title: "Company",
                links: ["About Us", "Careers", "Blog", "Contact"]
              },
              {
                title: "Resources",
                links: ["Documentation", "Tutorials", "Help Center", "Community"]
              }
            ].map((section, index) => (
              <div key={index}>
                <h3 className="font-bold text-white mb-4">{section.title}</h3>
                <ul className="space-y-2">
                  {section.links.map((link, i) => (
                    <li key={i}>
                      <a href="#" className="hover:text-white transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm">© 2025 EduVerse. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};