import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { RoleGuard } from './components/RoleGuard';
import { MainLayout } from './layouts/MainLayout';

// Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { EventsList } from './pages/EventsList';
import { EventDetail } from './pages/EventDetail';
import { EventForm } from './pages/EventForm';
import { MyQR } from './pages/MyQR';
import { Scanner } from './pages/Scanner';
import { AttendanceDashboard } from './pages/AttendanceDashboard';
import { VenuesPage } from './pages/VenuesPage';
import { VendorsPage } from './pages/VendorsPage';
import { VolunteersPage } from './pages/VolunteersPage';
import { FinancePage } from './pages/FinancePage';
import { AnnouncementsPage } from './pages/AnnouncementsPage';
import { CertificatesPage } from './pages/CertificatesPage';
import { CertificateVerify } from './pages/CertificateVerify';
import { AIPlanner } from './pages/AIPlanner';
import { AIAssistant } from './pages/AIAssistant';
import { AIFoodPrediction } from './pages/AIFoodPrediction';
import { AIRecommendations } from './pages/AIRecommendations';
import { ReportsPage } from './pages/ReportsPage';
import { NotificationsPage } from './pages/NotificationsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Unauthenticated Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify/:certificateId" element={<CertificateVerify />} />

            {/* Authenticated Layout Routes */}
            <Route
              element={
                <RoleGuard>
                  <MainLayout />
                </RoleGuard>
              }
            >
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/events" element={<EventsList />} />
              <Route path="/events/:id" element={<EventDetail />} />
              
              {/* Event Management */}
              <Route
                path="/admin/events/create"
                element={
                  <RoleGuard allowedRoles={['ADMIN', 'ORGANIZER']}>
                    <EventForm />
                  </RoleGuard>
                }
              />
              <Route
                path="/admin/events/:id/edit"
                element={
                  <RoleGuard allowedRoles={['ADMIN', 'ORGANIZER']}>
                    <EventForm />
                  </RoleGuard>
                }
              />

              {/* Passes & Ticketing */}
              <Route path="/my-qr" element={<MyQR />} />

              {/* Scanner & Attendance */}
              <Route
                path="/scan"
                element={
                  <RoleGuard allowedRoles={['ADMIN', 'ORGANIZER', 'VOLUNTEER']}>
                    <Scanner />
                  </RoleGuard>
                }
              />
              <Route
                path="/attendance"
                element={
                  <RoleGuard allowedRoles={['ADMIN', 'ORGANIZER', 'VOLUNTEER']}>
                    <AttendanceDashboard />
                  </RoleGuard>
                }
              />

              {/* Logistics & Resources */}
              <Route
                path="/admin/venues"
                element={
                  <RoleGuard allowedRoles={['ADMIN', 'ORGANIZER']}>
                    <VenuesPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/admin/vendors"
                element={
                  <RoleGuard allowedRoles={['ADMIN', 'ORGANIZER']}>
                    <VendorsPage />
                  </RoleGuard>
                }
              />
              <Route path="/admin/volunteers" element={<VolunteersPage />} />
              <Route path="/volunteer/duties" element={<VolunteersPage />} />

              {/* Finance & Invoicing */}
              <Route
                path="/admin/finance"
                element={
                  <RoleGuard allowedRoles={['ADMIN', 'ORGANIZER']}>
                    <FinancePage />
                  </RoleGuard>
                }
              />

              {/* Announcements & Communication */}
              <Route path="/announcements" element={<AnnouncementsPage />} />

              {/* Certificates */}
              <Route path="/certificates" element={<CertificatesPage />} />

              {/* AI Suite */}
              <Route
                path="/ai/planner"
                element={
                  <RoleGuard allowedRoles={['ADMIN', 'ORGANIZER']}>
                    <AIPlanner />
                  </RoleGuard>
                }
              />
              <Route path="/ai/assistant" element={<AIAssistant />} />
              <Route
                path="/ai/food-prediction"
                element={
                  <RoleGuard allowedRoles={['ADMIN', 'ORGANIZER']}>
                    <AIFoodPrediction />
                  </RoleGuard>
                }
              />
              <Route
                path="/ai/recommendations"
                element={
                  <RoleGuard allowedRoles={['ADMIN', 'ORGANIZER']}>
                    <AIRecommendations />
                  </RoleGuard>
                }
              />

              {/* Reports & Audits */}
              <Route
                path="/reports"
                element={
                  <RoleGuard allowedRoles={['ADMIN', 'ORGANIZER']}>
                    <ReportsPage />
                  </RoleGuard>
                }
              />

              {/* Notifications */}
              <Route path="/notifications" element={<NotificationsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
