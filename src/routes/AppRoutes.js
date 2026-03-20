import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/home/home';
import Login from '../pages/login/login';
import Register from '../pages/register/register';
import VerifyOTP from '../pages/register/VerifyOTP';
import ForgotPassword from '../pages/login/ForgotPassword';
import ResetPassword from '../pages/login/ResetPassword';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminLogin from '../pages/admin/AdminLogin';
import InstructorDashboard from '../pages/instructor/InstructorDashboard';
import Profile from '../pages/profile/Profile';
import About from '../pages/about/About';
import CourseList from '../pages/courses/CourseList';
import CourseDetail from '../pages/courses/CourseDetail';
import LessonPlayer from '../pages/courses/LessonPlayer';
import MyCourses from '../pages/student/MyCourses';
import StudentDashboard from '../pages/student/StudentDashboard';
import QuizList from '../pages/student/QuizList';
import CommunityChat from '../pages/chat/CommunityChat';
import ProtectedRoute from '../components/ProtectedRoute';

const AppRoutes = () => {
  console.log('AppRoutes: rendering');
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/courses" element={<CourseList />} />
      <Route path="/course/:id" element={<CourseDetail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['student', 'instructor', 'admin']}>
            <StudentDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/instructor" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'instructor']}>
            <InstructorDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/my-courses" 
        element={
          <ProtectedRoute allowedRoles={['student', 'instructor', 'admin']}>
            <MyCourses />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/quizzes" 
        element={
          <ProtectedRoute allowedRoles={['student', 'instructor', 'admin']}>
            <QuizList />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/course/:courseId/lesson/:lessonId?" 
        element={
          <ProtectedRoute allowedRoles={['student', 'instructor', 'admin']}>
            <LessonPlayer />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/community-chat" 
        element={
          <ProtectedRoute allowedRoles={['student', 'instructor', 'admin']}>
            <CommunityChat />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

export default AppRoutes;