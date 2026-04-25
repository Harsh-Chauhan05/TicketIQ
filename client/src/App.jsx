import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import PrivateRoute from './routes/PrivateRoute';
import RoleRoute from './routes/RoleRoute';

// Layout
import AppLayout from './components/layout/AppLayout';

// Shared Pages
import Profile from './pages/shared/Profile';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerifyEmail from './pages/auth/VerifyEmail';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import SubmitTicket from './pages/customer/SubmitTicket';
import TicketDetail from './pages/customer/TicketDetail';
import CustomerNotifications from './pages/customer/Notifications';

// Agent Pages
import AgentDashboard from './pages/agent/AgentDashboard';
import TicketQueue from './pages/agent/TicketQueue';
import AgentTicketDetail from './pages/agent/AgentTicketDetail';
import SLAMonitor from './pages/agent/SLAMonitor';
import Notifications from './pages/agent/Notifications';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageTickets from './pages/admin/ManageTickets';
import DomainConfig from './pages/admin/DomainConfig';
import SLASettings from './pages/admin/SLASettings';
import UserManagement from './pages/admin/UserManagement';
import SLAReports from './pages/admin/SLAReports';
import AdminNotifications from './pages/admin/AdminNotifications';
import TenantSettings from './pages/admin/TenantSettings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Private App Routes wrapped in Layout */}
        <Route element={<PrivateRoute />}>
          <Route element={<AppLayout />}>
            
            {/* Customer Routes */}
            <Route element={<RoleRoute allowedRoles={['customer']} />}>
              <Route path="/customer/dashboard" element={<CustomerDashboard />} />
              <Route path="/customer/submit" element={<SubmitTicket />} />
              <Route path="/customer/tickets/:id" element={<TicketDetail />} />
              <Route path="/customer/notifications" element={<CustomerNotifications />} />
              <Route path="/customer/profile" element={<Profile />} />
            </Route>

            {/* Agent Routes */}
            <Route element={<RoleRoute allowedRoles={['agent']} />}>
              <Route path="/agent/dashboard" element={<AgentDashboard />} />
              <Route path="/agent/queue" element={<TicketQueue />} />
              <Route path="/agent/tickets/:id" element={<AgentTicketDetail />} />
              <Route path="/agent/sla-monitor" element={<SLAMonitor />} />
              <Route path="/agent/notifications" element={<Notifications />} />
              <Route path="/agent/profile" element={<Profile />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<RoleRoute allowedRoles={['admin']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/tickets" element={<ManageTickets />} />
              <Route path="/admin/tickets/:id" element={<AgentTicketDetail />} />
              <Route path="/admin/domain-config" element={<DomainConfig />} />
              <Route path="/admin/sla-settings" element={<SLASettings />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/reports" element={<SLAReports />} />
              <Route path="/admin/notifications" element={<AdminNotifications />} />
              <Route path="/admin/settings" element={<TenantSettings />} />
              <Route path="/admin/profile" element={<Profile />} />
            </Route>

          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
