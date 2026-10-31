import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import DestinationsPage from '../pages/DestinationsPage';
import PackagesPage from '../pages/PackagesPage';
import PackageDetails from '../pages/PackageDetails';
import ExperiencesPage from '../pages/ExperiencesPage';
import BlogsPage from '../pages/BlogsPage';
import AboutPage from '../pages/AboutPage';
import ContactPage from '../pages/ContactPage';
import PlanTripPage from '../pages/PlanTripPage';
import GalleryPage from '../pages/GalleryPage';
import AdminLoginPage from '../pages/admin/AdminLoginPage';
import AdminForgotPassword from '../pages/admin/AdminForgotPassword';
import AdminResetPassword from '../pages/admin/AdminResetPassword';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/destinations" element={<DestinationsPage />} />
      <Route path="/destinations/:id" element={<PackageDetails />} />
      <Route path="/packages" element={<PackagesPage />} />
      <Route path="/packages/:id" element={<PackageDetails />} />
      <Route path="/experiences" element={<ExperiencesPage />} />
      <Route path="/blogs" element={<BlogsPage />} />
      <Route path="/blogs/:id" element={<BlogsPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/gallery" element={<GalleryPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/plan-trip" element={<PlanTripPage />} />

      {/* Admin Portal Routes */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
      <Route path="/admin/reset-password/:token" element={<AdminResetPassword />} />
      <Route path="/admin" element={<AdminDashboardPage />} />
      <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
