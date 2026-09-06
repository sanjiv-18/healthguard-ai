import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

import { PatientLayout } from './layouts/PatientLayout';
import { DashboardPage } from './pages/patient/DashboardPage';
import { MyHealthPage } from './pages/patient/MyHealthPage';
import { AIHealthPage } from './pages/patient/AIHealthPage';
import { EnvironmentPage } from './pages/patient/EnvironmentPage';
import { DevicesPage } from './pages/patient/DevicesPage';
import { SimulationPage } from './pages/patient/SimulationPage';
import { HealthHistoryPage } from './pages/patient/HealthHistoryPage';
import { AnalyticsPage } from './pages/patient/AnalyticsPage';
import { AlertsPage } from './pages/patient/AlertsPage';
import { EmergencyPage } from './pages/patient/EmergencyPage';
import { DoctorAccessPage } from './pages/patient/DoctorAccessPage';
import { NotificationsPage } from './pages/patient/NotificationsPage';
import { PrivacyPage } from './pages/patient/PrivacyPage';
import { ProfilePage } from './pages/patient/ProfilePage';

import { DoctorLayout } from './layouts/DoctorLayout';
import { DoctorDashboardPage } from './pages/doctor/DashboardPage';
import { DoctorPatientsPage } from './pages/doctor/PatientsPage';
import { DoctorPatientDetailPage } from './pages/doctor/PatientDetailPage';
import { DoctorAlertsPage } from './pages/doctor/AlertsPage';
import { DoctorEmergencyPage } from './pages/doctor/EmergencyPage';
import { DoctorNotesPage } from './pages/doctor/NotesPage';
import { DoctorProfilePage } from './pages/doctor/ProfilePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      retry: 1,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RoleRoute({ children, role }: { children: React.ReactNode; role: string }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user?.role !== role) {
    return <Navigate to={user?.role === 'DOCTOR' ? '/doctor' : '/patient'} replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={user.role === 'DOCTOR' ? '/doctor' : '/patient'} replace /> : <LandingPage />} />
      <Route path="/login" element={user ? <Navigate to={user.role === 'DOCTOR' ? '/doctor' : '/patient'} replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to={user.role === 'DOCTOR' ? '/doctor' : '/patient'} replace /> : <RegisterPage />} />

      <Route path="/patient" element={<ProtectedRoute><PatientLayout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="health" element={<MyHealthPage />} />
        <Route path="ai" element={<AIHealthPage />} />
        <Route path="environment" element={<EnvironmentPage />} />
        <Route path="devices" element={<DevicesPage />} />
        <Route path="simulation" element={<SimulationPage />} />
        <Route path="history" element={<HealthHistoryPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="emergency" element={<EmergencyPage />} />
        <Route path="access" element={<DoctorAccessPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      <Route path="/doctor" element={<ProtectedRoute><RoleRoute role="DOCTOR"><DoctorLayout /></RoleRoute></ProtectedRoute>}>
        <Route index element={<DoctorDashboardPage />} />
        <Route path="patients" element={<DoctorPatientsPage />} />
        <Route path="patients/:id" element={<DoctorPatientDetailPage />} />
        <Route path="alerts" element={<DoctorAlertsPage />} />
        <Route path="emergency" element={<DoctorEmergencyPage />} />
        <Route path="notes" element={<DoctorNotesPage />} />
        <Route path="profile" element={<DoctorProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
