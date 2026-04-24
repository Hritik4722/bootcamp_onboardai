import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Plan30Day from './pages/Plan30Day';
import Onboarding from './pages/Onboarding';
import Profile from './pages/Profile';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const profile = localStorage.getItem('onboardProfile');
  if (!profile) {
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
}

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />
      <div className="flex-1">
        <TopBar />
        <div className="ml-70">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        
        <Route path="/*" element={
          <ProtectedRoute>
            <MainLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/plan" element={<Plan30Day />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </MainLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}
