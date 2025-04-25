import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useToast } from "../hooks/use-toast";
import { motion } from "framer-motion";
import { ChevronLeft, Mail, Lock, LogIn } from "lucide-react";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await login(email, password);
      navigate(`/${user.role}`);
      toast({
        title: "Welcome back!",
        description: "Successfully logged into your account.",
        variant: "success",
      });
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "Invalid email or password. Please try again.",
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
              <span className="font-bold text-base bg-gradient-to-r from-indigo-700 to-purple-600 bg-clip-text text-transparent">EduVerse</span>
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

      <div className="flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8 border border-indigo-100"
        >
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="bg-indigo-50 p-4 rounded-full">
                <LogIn className="w-10 h-10 text-indigo-600" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600">
              Continue your learning journey with EduVerse
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
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
                  autoComplete="current-password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 py-6 bg-gray-50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full py-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all text-white"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
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
                Continue with Google
              </Button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Sign up for free
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Background education-themed decorative elements */}
      <div className="absolute bottom-10 left-10 opacity-20 hidden lg:block">
        <div className="text-indigo-600 text-9xl">📚</div>
      </div>
      <div className="absolute top-20 right-10 opacity-20 hidden lg:block">
        <div className="text-purple-600 text-9xl">🎓</div>
      </div>
    </div>
  );
};
