import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useToast } from "../hooks/use-toast";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  User,
  Mail,
  Lock,
  UserPlus,
  GraduationCap,
  BookOpen,
} from "lucide-react";

export const SignupPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("student"); // Default role
  const [loading, setLoading] = useState(false);
  const { signup, googleLogin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Password validation
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please ensure both passwords are identical",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const user = await signup(name, email, password, role);
      navigate(`/${user.role}`);
      toast({
        title: "Account created!",
        description: "Welcome to EduVerse! Your learning journey begins now.",
        variant: "success",
      });
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Signup failed",
        description:
          error.message || "Could not create your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 via-purple-50 to-blue-100">
      {/* Header/Navigation */}
      <header className="py-4 px-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
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

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="hover:bg-indigo-50 hover:text-indigo-600 font-medium text-gray-600 py-1 px-2.5 rounded-full transition-all text-xs"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to home
              </Button>
            </motion.div>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8 border border-indigo-100"
        >
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="bg-indigo-50 p-4 rounded-full">
                <UserPlus className="w-10 h-10 text-indigo-600" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Join EduVerse
            </h2>
            <p className="text-gray-600">
              Start your personalized learning journey today
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 py-6 bg-gray-50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <Input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 py-6 bg-gray-50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 py-6 bg-gray-50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <Input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 py-6 bg-gray-50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  I want to join as:
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setRole("student")}
                    className={`cursor-pointer rounded-xl border ${
                      role === "student"
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 bg-gray-50"
                    } p-4 flex flex-col items-center justify-center transition-all`}
                  >
                    <GraduationCap
                      className={`w-6 h-6 ${
                        role === "student" ? "text-indigo-600" : "text-gray-400"
                      } mb-2`}
                    />
                    <span
                      className={
                        role === "student"
                          ? "text-indigo-700 font-medium"
                          : "text-gray-600"
                      }
                    >
                      Student
                    </span>
                    <input
                      type="radio"
                      name="role"
                      value="student"
                      checked={role === "student"}
                      onChange={() => setRole("student")}
                      className="sr-only"
                    />
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setRole("tutor")}
                    className={`cursor-pointer rounded-xl border ${
                      role === "tutor"
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 bg-gray-50"
                    } p-4 flex flex-col items-center justify-center transition-all`}
                  >
                    <BookOpen
                      className={`w-6 h-6 ${
                        role === "tutor" ? "text-indigo-600" : "text-gray-400"
                      } mb-2`}
                    />
                    <span
                      className={
                        role === "tutor"
                          ? "text-indigo-700 font-medium"
                          : "text-gray-600"
                      }
                    >
                      Tutor
                    </span>
                    <input
                      type="radio"
                      name="role"
                      value="tutor"
                      checked={role === "tutor"}
                      onChange={() => setRole("tutor")}
                      className="sr-only"
                    />
                  </motion.div>
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label
                htmlFor="terms"
                className="ml-2 block text-sm text-gray-700"
              >
                I accept the{" "}
                <Link
                  to="/terms"
                  className="text-indigo-600 hover:text-indigo-500"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  to="/privacy"
                  className="text-indigo-600 hover:text-indigo-500"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full py-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all text-white"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Button
                type="button"
                variant="outline"
                className="w-full py-6 border border-gray-300 hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                <img
                  src="https://developers.google.com/identity/images/g-logo.png"
                  alt="Google"
                  className="w-5 h-5 mr-2"
                />
                Sign up with Google
              </Button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Background education-themed decorative elements */}
      <div className="absolute top-16 left-10 opacity-20 hidden lg:block">
        <div className="text-purple-600 text-9xl">🎯</div>
      </div>
      <div className="absolute bottom-20 right-10 opacity-20 hidden lg:block">
        <div className="text-indigo-600 text-9xl">🧠</div>
      </div>
    </div>
  );
};
