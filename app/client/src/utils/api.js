import axios from 'axios';

// Set the base URL for all API calls
const BASE_URL = 'http://localhost:5000'; // Change this to your backend URL

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to inject the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 (Unauthorized) globally
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authApi = {
  logout: () => {
    return api.post('api/auth/logout').then((response) => {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login page
      window.location.href = '/login';
      return response;
    });
  },
};

// Course API
export const courseApi = {
  getAllCourses: () => api.get('/api/courses'),
  getCourse: (id) => api.get(`/api/courses/${id}`),
  getTutorCourses: () => api.get('/api/courses/tutor'),
  createCourse: (data) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('payment', data.payment);
    formData.append('price', data.price);
    if (data.payment === 'paid') {
      formData.append('price', data.price);
    }
    if (data.thumbnail) {
      formData.append('thumbnail', data.thumbnail);
    }
    return api.post('/api/courses', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  updateCourse: (courseId, data) => {
    const formData = new FormData();
    if (data.title) formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.thumbnail) formData.append('thumbnail', data.thumbnail);
    if (data.payment) formData.append('payment', data.payment);
    if (data.price) formData.append('price', data.price);
    if (data.removeThumbnail) formData.append('removeThumbnail', data.removeThumbnail);
    
    return api.put(`/api/courses/${courseId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  uploadVideo: (courseId, data) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('video', data.video);
    
    return api.post(`/api/courses/${courseId}/videos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  reorderVideos: (courseId, videoOrder) => {
    return api.put(`/api/courses/${courseId}/videos/reorder`, {
      videoOrder,
    });
  },
  deleteVideo: (courseId, videoId) => {
    return api.delete(`/api/courses/${courseId}/videos/${videoId}`);
  },
  deleteCourse: (courseId) => {
    return api.delete(`/api/courses/${courseId}`);
  },
  generateTranscript: (courseId, videoId) => {
    return api.post(`/api/courses/${courseId}/videos/${videoId}/transcript`);
  },
};

// Enrollment API
export const enrollmentApi = {
  enrollCourse: (courseId) => api.post('/api/enrollment', { courseId }),
  getStudentEnrollments: () => api.get('/api/enrollment/student'),
  getCourseEnrollments: (courseId) => api.get(`/api/enrollment/course/${courseId}`),
};

// Chat API
export const chatApi = {
  getMessages: (courseId) => api.get(`/api/chat/${courseId}`),
};

// Payment API
export const paymentApi = {
  createPaymentLink: (courseId) => api.post('/api/payments/create', { courseId }), // Fixed endpoint
  getUserPayments: () => api.get('/api/payments/user'), // Fixed endpoint
  getPaymentById: (paymentId) => api.get(`/api/payments/${paymentId}`), // Fixed endpoint
  verifyEnrollment: (data) => api.post('/api/payments/verify-enrollment', data),
};