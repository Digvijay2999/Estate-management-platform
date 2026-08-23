import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import RoleShell from '../components/RoleShell.jsx';
import HomePage from '../pages/HomePage.jsx';
import PropertiesPage from '../pages/PropertiesPage.jsx';
import PropertyDetailPage from '../pages/PropertyDetailPage.jsx';
import SearchPage from '../pages/SearchPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import CustomerDashboard from '../pages/CustomerDashboard.jsx';
import AgentDashboard from '../pages/AgentDashboard.jsx';
import SellerDashboard from '../pages/SellerDashboard.jsx';
import AdminDashboard from '../pages/AdminDashboard.jsx';
import CustomerProfilePage from '../pages/CustomerProfilePage.jsx';
import CustomerFavoritesPage from '../pages/CustomerFavoritesPage.jsx';
import CustomerInquiriesPage from '../pages/CustomerInquiriesPage.jsx';
import CustomerAppointmentsPage from '../pages/CustomerAppointmentsPage.jsx';
import AgentPropertiesPage from '../pages/AgentPropertiesPage.jsx';
import AgentLeadsPage from '../pages/AgentLeadsPage.jsx';
import SellerPropertiesPage from '../pages/SellerPropertiesPage.jsx';
import PropertySubmissionPage from '../pages/PropertySubmissionPage.jsx';
import AdminUsersPage from '../pages/AdminUsersPage.jsx';

const userRole = localStorage.getItem('userRole') || 'customer';

function DashboardLayout({ role, title, children }) {
  return <RoleShell role={role} title={title}>{children}</RoleShell>;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/properties" element={<PropertiesPage />} />
      <Route path="/properties/:id" element={<PropertyDetailPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['customer']} userRole={userRole}>
            <DashboardLayout role="customer" title="Customer Dashboard"><CustomerDashboard /></DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route path="/dashboard/favorites" element={<ProtectedRoute allowedRoles={['customer']} userRole={userRole}><DashboardLayout role="customer" title="Favorites"><CustomerFavoritesPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/dashboard/inquiries" element={<ProtectedRoute allowedRoles={['customer']} userRole={userRole}><DashboardLayout role="customer" title="Inquiries"><CustomerInquiriesPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/dashboard/appointments" element={<ProtectedRoute allowedRoles={['customer']} userRole={userRole}><DashboardLayout role="customer" title="Appointments"><CustomerAppointmentsPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/dashboard/profile" element={<ProtectedRoute allowedRoles={['customer']} userRole={userRole}><DashboardLayout role="customer" title="Profile"><CustomerProfilePage /></DashboardLayout></ProtectedRoute>} />

      <Route path="/agent/dashboard" element={<ProtectedRoute allowedRoles={['agent']} userRole={userRole}><DashboardLayout role="agent" title="Agent Dashboard"><AgentDashboard /></DashboardLayout></ProtectedRoute>} />
      <Route path="/agent/properties" element={<ProtectedRoute allowedRoles={['agent']} userRole={userRole}><DashboardLayout role="agent" title="Properties"><AgentPropertiesPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/agent/properties/new" element={<ProtectedRoute allowedRoles={['agent']} userRole={userRole}><DashboardLayout role="agent" title="Create Listing"><PropertySubmissionPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/agent/properties/:id/edit" element={<ProtectedRoute allowedRoles={['agent']} userRole={userRole}><DashboardLayout role="agent" title="Edit Listing"><PropertySubmissionPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/agent/leads" element={<ProtectedRoute allowedRoles={['agent']} userRole={userRole}><DashboardLayout role="agent" title="Leads"><AgentLeadsPage /></DashboardLayout></ProtectedRoute>} />

      <Route path="/seller/dashboard" element={<ProtectedRoute allowedRoles={['seller']} userRole={userRole}><DashboardLayout role="seller" title="Seller Dashboard"><SellerDashboard /></DashboardLayout></ProtectedRoute>} />
      <Route path="/seller/properties" element={<ProtectedRoute allowedRoles={['seller']} userRole={userRole}><DashboardLayout role="seller" title="My Properties"><SellerPropertiesPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/seller/properties/new" element={<ProtectedRoute allowedRoles={['seller']} userRole={userRole}><DashboardLayout role="seller" title="Create Listing"><PropertySubmissionPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/seller/properties/:id/edit" element={<ProtectedRoute allowedRoles={['seller']} userRole={userRole}><DashboardLayout role="seller" title="Edit Listing"><PropertySubmissionPage /></DashboardLayout></ProtectedRoute>} />

      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']} userRole={userRole}><DashboardLayout role="admin" title="Admin Dashboard"><AdminDashboard /></DashboardLayout></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']} userRole={userRole}><DashboardLayout role="admin" title="Users"><AdminUsersPage /></DashboardLayout></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
