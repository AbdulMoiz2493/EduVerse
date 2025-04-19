import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { courseApi, enrollmentApi } from "../../utils/api";
import { useToast } from "../../hooks/use-toast";
import { Button } from "../../components/ui/button";
import { ArrowLeft, Users, Mail, BookOpen, Calendar, CheckCircle, GraduationCap } from "lucide-react";

export const CourseEnrollmentsPage = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, enrollmentsRes] = await Promise.all([
          courseApi.getCourse(id),
          enrollmentApi.getCourseEnrollments(id),
        ]);
        
        setCourse(courseRes.data);
        setEnrollments(enrollmentsRes.data);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Header */}
      <header className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center gap-2 mr-8">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-500 w-10 h-10 rounded-xl flex items-center justify-center text-white">
                  <span className="font-bold text-xl">E</span>
                </div>
                <span className="font-bold text-xl bg-gradient-to-r from-indigo-700 to-purple-600 bg-clip-text text-transparent">EduVerse</span>
              </div>
              
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
                <Users className="w-6 h-6 mr-2 text-indigo-600" /> 
                Student Enrollments
              </h1>
            </div>
            
            <Link to="/tutor">
              <Button variant="outline" size="sm" className="border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Info Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 border border-indigo-50">
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
                <Button variant="outline" size="sm" className="border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">
                  Edit Course
                </Button>
              </Link>
              <Link to={`/course/${id}`}>
                <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
                  Preview Course
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Enrollments */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-indigo-50">
          <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <GraduationCap className="w-5 h-5 mr-2 text-indigo-600" />
              Enrolled Students
            </h3>
          </div>

          {/* Enrollments Table */}
          {enrollments.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-indigo-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No students enrolled yet</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                When students enroll in your course, they will appear here. Share your course link to get started!
              </p>
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
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
                  {enrollments.map((enrollment) => (
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
                        <Button variant="outline" size="sm" className="border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">
                          <Mail className="w-4 h-4 mr-1" /> Message
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};