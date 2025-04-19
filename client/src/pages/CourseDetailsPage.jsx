import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { courseApi, chatApi, api } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../hooks/use-toast";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { io } from "socket.io-client";
import { ArrowLeft, Play, Send, BookOpen, FileText, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export const CourseDetailsPage = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [isGeneratingTranscript, setIsGeneratingTranscript] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const chatContainerRef = useRef(null);

  // Fetch course details and chat messages
  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseRes = await courseApi.getCourse(id);
        console.log('Fetched course:', courseRes.data);
        setCourse(courseRes.data);

        if (courseRes.data.videos?.length > 0) {
          setSelectedVideo(courseRes.data.videos[0]);
        }

        const messagesRes = await chatApi.getMessages(id);
        console.log('Fetched messages:', messagesRes.data);
        setMessages(messagesRes.data);
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

  // Set up Socket.IO connection only if course is loaded
  useEffect(() => {
    if (!course) return;

    const newSocket = io("", { 
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    setSocket(newSocket);

    console.log("Attempting to connect to Socket.IO...");
    newSocket.on("connect", () => {
      console.log("Successfully connected to Socket.IO server");
      newSocket.emit("joinRoom", { courseId: id });
      console.log(`Joined room: ${id}`);
    });

    newSocket.on("message", (message) => {
      console.log("New message received:", message);
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, message];
        console.log("Updated messages state:", updatedMessages);
        return updatedMessages;
      });
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
      console.log(`Socket.IO reconnected after ${attempt} attempts`);
      newSocket.emit("joinRoom", { courseId: id });
    });

    newSocket.on("error", (error) => {
      console.error("Socket.IO error:", error);
    });

    return () => {
      console.log("Disconnecting Socket.IO...");
      newSocket.disconnect();
    };
  }, [course, id, toast]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      console.log("Scrolled to bottom of chat");
    }
  }, [messages]);

  // Handle transcript generation
  const handleGenerateTranscript = async () => {
    if (!selectedVideo || isGeneratingTranscript) return;

    setIsGeneratingTranscript(true);
    try {
      const response = await api.post(`/courses/${id}/videos/${selectedVideo._id}/transcript`);
      const newTranscript = response.data.transcript;

      // Update the course state with the new transcript
      setCourse(prevCourse => ({
        ...prevCourse,
        videos: prevCourse.videos.map(video =>
          video._id === selectedVideo._id ? { ...video, transcript: newTranscript } : video
        ),
      }));

      // Update the selected video state
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

      // Update course state
      setCourse(prevCourse => ({
        ...prevCourse,
        videos: prevCourse.videos.filter(video => video._id !== videoId),
      }));

      // If the deleted video was selected, select the first video or null
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

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !socket || !user) {
      console.log("Cannot send message:", { newMessage: newMessage.trim(), socket: !!socket, user: !!user });
      return;
    }

    const messageData = {
      courseId: id,
      userId: user._id,
      message: newMessage.trim(),
    };
    console.log("Sending message:", messageData);
    socket.emit("sendMessage", messageData);

    setNewMessage("");
  };

  // Display loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-indigo-50">
        <div className="animate-spin rounded-full h-12擦w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Display 404 if course not found
  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-indigo-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Course Not Found</h1>
          <p className="text-gray-600 mb-8">The requested course does not exist.</p>
          <Button asChild className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
            <Link to="/student">Return to Dashboard</Link>
          </Button>
        </div>
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
            
            <div className="flex items-center space-x-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-3 py-1">
                  {user?.role === 'student' ? 'Student' : 'User'}
                </Badge>
              </motion.div>
              <Link to={`/${user.role}`}>
                <Button 
                  variant="outline" 
                  className="border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Badge className="mb-4 bg-indigo-100 text-indigo-700 py-1 px-4">COURSE CONTENT</Badge>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
            {course.title}
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player and Description */}
          <div className="lg:col-span-2 space-y-8">
            {selectedVideo ? (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
              >
                <div className="aspect-w-16 aspect-h-9 bg-black">
                  <video 
                    src={`https://web-dev-marathon-production.up.railway.app/${selectedVideo.videoUrl}`}
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
                      <h3 className="text-lg font-semibold">Transcript</h3>
                      <Button
                        onClick={handleGenerateTranscript}
                        disabled={isGeneratingTranscript || selectedVideo.transcript}
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-sm py-1 px-3"
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        {isGeneratingTranscript ? "Generating..." : "Generate Transcript"}
                      </Button>
                    </div>
                    <div className="max-h-60 overflow-y-auto text-gray-600 text-sm whitespace-pre-line">
                      {selectedVideo.transcript || "No transcript available for this video. Click 'Generate Transcript' to create one."}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white rounded-xl shadow-lg p-8 text-center border border-dashed border-gray-300"
              >
                <p className="text-gray-600">This course has no videos yet.</p>
              </motion.div>
            )}

            {/* Course Description */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">About this course</h3>
              <p className="text-gray-600 whitespace-pre-line">{course.description}</p>
            </motion.div>
          </div>

          {/* Course Sidebar - Video List and Chat */}
          <div className="space-y-8">
            {/* Video List */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-white rounded-xl shadow-lg p-4 border border-gray-100"
            >
              <div className="flex items-center mb-4">
                <BookOpen className="mr-2 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900">Course Videos</h3>
              </div>
              {course.videos?.length > 0 ? (
                <div className="space-y-2">
                  {course.videos.map((video) => (
                    <div
                      key={video._id}
                      className="flex items-center justify-between p-3 rounded-md transition-colors"
                    >
                      <button
                        onClick={() => setSelectedVideo(video)}
                        className={`flex items-start flex-1 text-left transition-colors ${
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
                <p className="text-gray-500 text-center">No videos available yet.</p>
              )}
            </motion.div>

            {/* Chat */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-96 border border-gray-100"
            >
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Course Chat</h3>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={chatContainerRef}>
                {messages.length > 0 ? (
                  messages.map((msg) => {
                    console.log("Rendering message:", msg);
                    return (
                      <div 
                        key={msg._id}
                        className={`flex ${
                          msg.user._id === user._id ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] px-4 py-2 rounded-lg ${
                            msg.user._id === user._id
                              ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                              : "bg-gray-100"
                          }`}
                        >
                          <div className="font-semibold text-xs mb-1">
                            {msg.user._id === user._id ? "You" : msg.user.name || "Unknown"}
                          </div>
                          <div>{msg.content}</div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-gray-500 mt-10">
                    No messages yet. Start the conversation!
                  </div>
                )}
              </div>
              
              <form onSubmit={handleSendMessage} className="p-4 border-t flex">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border rounded-l-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <Button 
                  type="submit" 
                  className="rounded-l-none bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
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