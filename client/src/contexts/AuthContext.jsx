
import { createContext, useState, useContext, useEffect } from "react";
import { api } from "../utils/api";
import { useToast } from "../hooks/use-toast";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const { toast } = useToast();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          // To verify token, we can make a request to fetch user profile
          // This depends on your API, for now we'll use the token stored in localStorage
          const userData = JSON.parse(localStorage.getItem("user"));
          if (userData) {
            setUser(userData);
          } else {
            // If no user data, clear token
            localStorage.removeItem("token");
            setToken(null);
          }
        } catch (error) {
          console.error("Auth error:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setToken(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await api.post("/api/auth/login", { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      
      setToken(token);
      setUser(user);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.name}!`,
      });
      
      return user;
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.response?.data?.message || "Invalid credentials",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Google login function
  const googleLogin = async (tokenId) => {
    try {
      const response = await api.post("/api/auth/google", { token: tokenId });
      const { token, user } = response.data;
      
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      
      setToken(token);
      setUser(user);
      
      toast({
        title: "Login successful",
        description: `Welcome, ${user.name}!`,
      });
      
      return user;
    } catch (error) {
      console.error("Google login error:", error);
      toast({
        title: "Login failed",
        description: error.response?.data?.message || "Google authentication failed",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Signup function
  const signup = async (name, email, password, role) => {
    try {
      const response = await api.post("/api/auth/signup", { name, email, password, role });
      const { token, user } = response.data;
      
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      
      setToken(token);
      setUser(user);
      
      toast({
        title: "Account created",
        description: `Welcome to EduVerse, ${user.name}!`,
      });
      
      return user;
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Signup failed",
        description: error.response?.data?.message || "Could not create account",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  const value = {
    user,
    token,
    loading,
    login,
    googleLogin,
    signup,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
