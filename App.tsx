

import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import { CustomFieldsProvider } from './contexts/CustomFieldsContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { UserProvider } from './contexts/UserContext';
import { ConfigProvider } from './contexts/ConfigContext';

const App: React.FC = () => {
  return (
    <ConfigProvider>
      <UserProvider>
        <CustomFieldsProvider>
          <NotificationProvider>
            <Router>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/accept-invite" element={<AcceptInvite />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/calendar" element={<CalendarPage />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/companies" element={<Companies />} />
                  <Route path="/companies/:id" element={<CompanyDetail />} />
                  <Route path="/contacts" element={<Contacts />} />
                  <Route path="/deals" element={<Deals />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/projects/:id" element={<ProjectDetail />} />
                  <Route path="/email" element={<Email />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/documents" element={<Documents />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            </Router>
          </NotificationProvider>
        </CustomFieldsProvider>
      </UserProvider>
    </ConfigProvider>
  );
};

export default App;