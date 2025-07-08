import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import PatientDashboard from './pages/patient/PatientDashboard';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import PatientProfile from './pages/profile/PatientProfile';
import RemindersPage from './pages/shared/RemindersPage';
import SettingsPage from './pages/shared/SettingsPage';
import BookAppointmentPage from './pages/shared/BookAppointmentPage';
import PrescriptionPage from './pages/prescription/PrescriptionPage';
import PrescriptionViewPage from './pages/prescription/PrescriptionViewPage';
import CreatePrescriptionPage from './pages/prescription/CreatePrescriptionPage';
import ClinicPage from './pages/clinic/ClinicPage';
import NotFoundPage from './pages/NotFoundPage';
import AIChat from './components/shared/AIChat';

const ProtectedRoute = ({ 
  children, 
  allowedRoles = [] 
}: { 
  children: React.ReactNode, 
  allowedRoles?: string[] 
}) => {
  const { isAuthenticated, userRole } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole || '')) {
    if (userRole === 'patient') {
      return <Navigate to="/patient/dashboard" replace />;
    } else if (userRole === 'doctor') {
      return <Navigate to="/doctor/dashboard" replace />;
    }
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/book-appointment/:doctorId" element={<BookAppointmentPage />} />
      <Route path="/prescription/:prescriptionId" element={<PrescriptionPage />} />
      <Route path="/prescription/view" element={<PrescriptionViewPage />} />
      
      {/* Patient routes */}
      <Route 
        path="/patient/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <PatientDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/patient/ai-chat" 
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <AIChat />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/clinic" 
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <ClinicPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Doctor routes */}
      <Route 
        path="/doctor/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/doctor/create-prescription" 
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <CreatePrescriptionPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Shared routes */}
      <Route 
        path="/profile/:patientId" 
        element={
          <ProtectedRoute>
            <PatientProfile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/reminders" 
        element={
          <ProtectedRoute>
            <RemindersPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Catch-all route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;