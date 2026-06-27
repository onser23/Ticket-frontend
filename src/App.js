import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import ProtectedUser from './components/ProtectedUser';
import ProtectedAdmin from './components/ProtectedAdmin';
import PublicUser from './components/PublicUser';
import PublicAdmin from './components/PublicAdmin';

import UserLayout from './components/layout/UserLayout';
import AdminLayout from './components/layout/AdminLayout';

import UserLogin from './pages/UserLogin';
import UserRegister from './pages/UserRegister';
import UserVerifyOtp from './pages/UserVerifyOtp';
import UserForgotPassword from './pages/UserForgotPassword';
import UserResetPassword from './pages/UserResetPassword';
import UserDashboard from './pages/UserDashboard';
import UserTickets from './pages/user/UserTickets';
import UserTicketDetail from './pages/user/UserTicketDetail';
import UserProfile from './pages/UserProfile';

import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminProfile from './pages/AdminProfile';
import AdminCompanies from './pages/AdminCompanies';
import AdminTickets from './pages/admin/AdminTickets';
import AdminTicketDetail from './pages/admin/AdminTicketDetail';

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<PublicUser><UserLogin /></PublicUser>} />
      <Route path="/register" element={<PublicUser><UserRegister /></PublicUser>} />
      <Route path="/verify-otp" element={<PublicUser><UserVerifyOtp /></PublicUser>} />
      <Route path="/forgot-password" element={<PublicUser><UserForgotPassword /></PublicUser>} />
      <Route path="/reset-password" element={<PublicUser><UserResetPassword /></PublicUser>} />

      <Route path="/admin/login" element={<PublicAdmin><AdminLogin /></PublicAdmin>} />

      <Route element={<ProtectedUser><UserLayout /></ProtectedUser>}>
        <Route path="/" element={<UserDashboard />} />
        <Route path="/tickets" element={<UserTickets />} />
        <Route path="/tickets/:id" element={<UserTicketDetail />} />
        <Route path="/profile" element={<UserProfile />} />
      </Route>

      <Route element={<ProtectedAdmin><AdminLayout /></ProtectedAdmin>}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/tickets" element={<AdminTickets />} />
        <Route path="/admin/tickets/:id" element={<AdminTicketDetail />} />
        <Route path="/admin/profile" element={<AdminProfile />} />
        <Route path="/admin/companies" element={<AdminCompanies />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
