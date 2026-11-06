import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import PackagesPage from '../pages/PackagesPage';
import PackageDetails from '../pages/PackageDetails';
import BookingPage from '../pages/BookingPage';
import ExperiencesPage from '../pages/ExperiencesPage';
import BlogsPage from '../pages/BlogsPage';
import AboutPage from '../pages/AboutPage';
import ContactPage from '../pages/ContactPage';
import TermsPage from '../pages/TermsPage';
import CancellationPolicyPage from '../pages/CancellationPolicyPage';
import PaymentReturnPage from '../pages/PaymentReturnPage';
import PhonePeCheckoutPage from '../pages/PhonePeCheckoutPage';
import GalleryPage from '../pages/GalleryPage';
import AdminLoginPage from '../pages/admin/AdminLoginPage';
import AdminForgotPassword from '../pages/admin/AdminForgotPassword';
import AdminResetPassword from '../pages/admin/AdminResetPassword';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/destinations" element={<Navigate to="/packages" replace />} />
      <Route path="/destinations/:id" element={<PackageDetails />} />
      <Route path="/packages" element={<PackagesPage />} />
      <Route path="/packages/:id" element={<PackageDetails />} />
      <Route path="/package/:id" element={<PackageDetails />} />
      <Route path="/packages/:id/book" element={<BookingPage />} />
      <Route path="/package/:id/book" element={<BookingPage />} />
      <Route path="/book/:id" element={<BookingPage />} />
      <Route path="/experiences" element={<PackagesPage scrollToExperiences={true} />} />
      <Route path="/blogs" element={<BlogsPage />} />
      <Route path="/blogs/:id" element={<BlogsPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/gallery" element={<GalleryPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/terms-and-conditions" element={<TermsPage />} />
      <Route path="/cancellation-policy" element={<CancellationPolicyPage />} />
      <Route path="/cancellation" element={<CancellationPolicyPage />} />
      <Route path="/refund-policy" element={<CancellationPolicyPage />} />
      <Route path="/cancellation-and-refund-policy" element={<CancellationPolicyPage />} />
      <Route path="/checkout/phonepe" element={<PhonePeCheckoutPage />} />
      <Route path="/payment/phonepe/return" element={<PaymentReturnPage />} />
      <Route path="/plan-trip" element={<Navigate to="/" replace />} />

      {/* Admin Portal Routes */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
      <Route path="/admin/reset-password/:token" element={<AdminResetPassword />} />
      <Route path="/admin" element={<AdminDashboardPage />} />
      <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />
      <Route path="/admin/:tab" element={<AdminDashboardPage />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
