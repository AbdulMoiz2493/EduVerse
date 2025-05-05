
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import WelcomePage from "./pages/WelcomePage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { StudentDashboard } from "./pages/student/StudentDashboard";
import { TutorDashboard } from "./pages/tutor/TutorDashboard";
import { CourseDetailsPage } from "./pages/CourseDetailsPage";
import { CreateCoursePage } from "./pages/tutor/CreateCoursePage";
import { EditCoursePage } from "./pages/tutor/EditCoursePage";
import { CourseEnrollmentsPage } from "./pages/tutor/CourseEnrollmentsPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import AboutPage from "./pages/AboutPage";
import CoursesPage from "./pages/CoursesPage";
import ContactPage from "./pages/ContactPage";
import { PaymentPage } from "./pages/PaymentPage";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster />
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          {/* Student Routes */}
          <Route path="/student" element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/course/:id" element={
            <ProtectedRoute>
              <CourseDetailsPage />
            </ProtectedRoute>
          } />
          <Route path="/payment/:id" element={
            <ProtectedRoute>
              <PaymentPage />
            </ProtectedRoute>
          } />
          
          {/* Tutor Routes */}
          <Route path="/tutor" element={
            <ProtectedRoute role="tutor">
              <TutorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/tutor/create-course" element={
            <ProtectedRoute role="tutor">
              <CreateCoursePage />
            </ProtectedRoute>
          } />
          <Route path="/tutor/edit-course/:id" element={
            <ProtectedRoute role="tutor">
              <EditCoursePage />
            </ProtectedRoute>
          } />
          <Route path="/tutor/course/:id/enrollments" element={
            <ProtectedRoute role="tutor">
              <CourseEnrollmentsPage />
            </ProtectedRoute>
          } />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
