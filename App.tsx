
import React from 'react';
import { MemoryRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Contacts } from './pages/Contacts';
import { Deals } from './pages/Deals';
import { Email } from './pages/Email';
import { Settings } from './pages/Settings';
import { Companies } from './pages/Companies';
import { CompanyDetail } from './pages/CompanyDetail';
import { Documents } from './pages/Documents';
import { Projects } from './pages/Projects';
import { ProjectDetail } from './pages/ProjectDetail';
import { Chat } from './pages/Chat';
import { CalendarPage } from './pages/Calendar';
import { Notifications } from './pages/Notifications';
import { AcceptInvite } from './pages/AcceptInvite';
import { Profile } from './pages/Profile';
import { Helpdesk } from './pages/Helpdesk';
import { Finance } from './pages/Finance';
import { InvoicePrint } from './pages/InvoicePrint';
import { CustomFieldsProvider } from './contexts/CustomFieldsContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { UserProvider, useUser } from './contexts/UserContext';
import { ConfigProvider } from './contexts/ConfigContext';

// Auth Guard Component
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useUser();
    if (!isAuthenticated) {
        return <Navigate to="/accept-invite" replace />;
    }
    return <>{children}</>;
};

const AppRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/accept-invite" element={<AcceptInvite />} />
            
            {/* Protected Routes */}
            <Route path="/" element={<RequireAuth><Layout><Dashboard /></Layout></RequireAuth>} />
            <Route path="/profile" element={<RequireAuth><Layout><Profile /></Layout></RequireAuth>} />
            <Route path="/chat" element={<RequireAuth><Layout><Chat /></Layout></RequireAuth>} />
            <Route path="/calendar" element={<RequireAuth><Layout><CalendarPage /></Layout></RequireAuth>} />
            <Route path="/notifications" element={<RequireAuth><Layout><Notifications /></Layout></RequireAuth>} />
            <Route path="/helpdesk" element={<RequireAuth><Layout><Helpdesk /></Layout></RequireAuth>} />
            <Route path="/finance" element={<RequireAuth><Layout><Finance /></Layout></RequireAuth>} />
            <Route path="/finance/invoice/:id/print" element={<RequireAuth><Layout><InvoicePrint /></Layout></RequireAuth>} />
            <Route path="/companies" element={<RequireAuth><Layout><Companies /></Layout></RequireAuth>} />
            <Route path="/companies/:id" element={<RequireAuth><Layout><CompanyDetail /></Layout></RequireAuth>} />
            <Route path="/contacts" element={<RequireAuth><Layout><Contacts /></Layout></RequireAuth>} />
            <Route path="/deals" element={<RequireAuth><Layout><Deals /></Layout></RequireAuth>} />
            <Route path="/projects" element={<RequireAuth><Layout><Projects /></Layout></RequireAuth>} />
            <Route path="/projects/:id" element={<RequireAuth><Layout><ProjectDetail /></Layout></RequireAuth>} />
            <Route path="/email" element={<RequireAuth><Layout><Email /></Layout></RequireAuth>} />
            <Route path="/settings" element={<RequireAuth><Layout><Settings /></Layout></RequireAuth>} />
            <Route path="/documents" element={<RequireAuth><Layout><Documents /></Layout></RequireAuth>} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

const App: React.FC = () => {
  return (
    <ConfigProvider>
      <UserProvider>
        <CustomFieldsProvider>
          <NotificationProvider>
            <Router>
                <AppRoutes />
            </Router>
          </NotificationProvider>
        </CustomFieldsProvider>
      </UserProvider>
    </ConfigProvider>
  );
};

export default App;
