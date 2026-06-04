import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { useSocket } from './hooks/useSocket';
import { useEffect, useState } from 'react';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { Layout } from './components/layout/Layout';

// Admin
import { AdminDashboard } from './components/admin/AdminDashboard';
import { FlightManagement } from './components/admin/FlightManagement';
import { UserManagement } from './components/admin/UserManagement';
import { TurnaroundProgress } from './components/admin/TurnaroundProgress';

// Staff
import { StaffDashboard } from './components/staff/StaffDashboard';
import { StaffFlights } from './components/staff/StaffFlights';
import { ServiceVerification } from './components/staff/ServiceVerification';

// Vendor
import { VendorDashboard } from './components/vendor/VendorDashboard';
import { VendorTasks } from './components/vendor/VendorTasks';

// Finance
import { FinanceDashboard } from './components/finance/FinanceDashboard';
import { TariffManagement } from './components/finance/TariffManagement';
import { InvoiceManagement } from './components/finance/InvoiceManagement';
import { RevenueReports } from './components/finance/RevenueReports';

// Toast notification component
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 bg-slate-800 border border-cyan-400/30 border-l-4 border-l-cyan-400 rounded-md px-4 py-3 text-sm text-slate-200 shadow-[0_0_15px_rgba(34,211,238,0.2)] animate-[slideIn_0.3s_ease]">
      {message}
    </div>
  );
}

// Dashboard redirector based on role
function DashboardRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  const paths: Record<string, string> = {
    airport_admin: '/admin',
    airline_staff: '/staff',
    service_vendor: '/vendor',
    finance: '/finance',
  };
  return <Navigate to={paths[user.role] || '/login'} replace />;
}

function AppContent() {
  const { lastEvent } = useSocket();
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (lastEvent) {
      const msg = lastEvent.event.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      setToast(`⚡ ${msg}`);
    }
  }, [lastEvent]);

  return (
    <>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardRedirect />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['airport_admin']}><Layout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="flights" element={<FlightManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="turnaround" element={<TurnaroundProgress />} />
        </Route>

        {/* Staff Routes */}
        <Route path="/staff" element={<ProtectedRoute allowedRoles={['airline_staff']}><Layout /></ProtectedRoute>}>
          <Route index element={<StaffDashboard />} />
          <Route path="flights" element={<StaffFlights />} />
          <Route path="services" element={<ServiceVerification />} />
        </Route>

        {/* Vendor Routes */}
        <Route path="/vendor" element={<ProtectedRoute allowedRoles={['service_vendor']}><Layout /></ProtectedRoute>}>
          <Route index element={<VendorDashboard />} />
          <Route path="tasks" element={<VendorTasks />} />
        </Route>

        {/* Finance Routes */}
        <Route path="/finance" element={<ProtectedRoute allowedRoles={['finance']}><Layout /></ProtectedRoute>}>
          <Route index element={<FinanceDashboard />} />
          <Route path="tariffs" element={<TariffManagement />} />
          <Route path="invoices" element={<InvoiceManagement />} />
          <Route path="revenue" element={<RevenueReports />} />
        </Route>

        <Route path="/unauthorized" element={<div className="min-h-screen flex items-center justify-center text-red-400 text-xl">Access Denied</div>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
