import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { ThemeProvider } from './context/ThemeContext.js';
import { ProtectedRoute } from './routes/ProtectedRoute.js';
import { RoleRoute } from './routes/RoleRoute.js';

// Auth & Landing Pages
import { LoginPage } from './pages/auth/LoginPage.js';
import { LandingPage } from './pages/landing/LandingPage.js';

// Layouts
import { AdminLayout } from './layouts/AdminLayout.js';
import { PMLayout } from './layouts/PMLayout.js';
import { DeveloperLayout } from './layouts/DeveloperLayout.js';

// Admin Pages
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage.js';
import { AdminProjectsPage } from './pages/admin/AdminProjectsPage.js';
import { AdminTasksPage } from './pages/admin/AdminTasksPage.js';
import { AdminClientsPage } from './pages/admin/AdminClientsPage.js';
import { AdminUsersPage } from './pages/admin/AdminUsersPage.js';
import { AdminActivityPage } from './pages/admin/AdminActivityPage.js';

// PM Pages
import { PMDashboardPage } from './pages/pm/PMDashboardPage.js';
import { PMTeamBoardPage } from './pages/pm/PMTeamBoardPage.js';
import { PMActivityPage } from './pages/pm/PMActivityPage.js';

// Developer Pages
import { DevTasksPage } from './pages/developer/DevTasksPage.js';
import { DevActivityPage } from './pages/developer/DevActivityPage.js';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Landing & Auth Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes Pipeline */}
            <Route element={<ProtectedRoute />}>
              {/* 1. Admin Area */}
              <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminOverviewPage />} />
                  <Route path="projects" element={<AdminProjectsPage />} />
                  <Route path="tasks" element={<AdminTasksPage />} />
                  <Route path="clients" element={<AdminClientsPage />} />
                  <Route path="users" element={<AdminUsersPage />} />
                  <Route path="activity" element={<AdminActivityPage />} />
                </Route>
              </Route>

              {/* 2. Project Manager Area */}
              <Route element={<RoleRoute allowedRoles={['ADMIN', 'PROJECT_MANAGER']} />}>
                <Route path="/pm" element={<PMLayout />}>
                  <Route index element={<PMDashboardPage />} />
                  <Route path="board" element={<PMTeamBoardPage />} />
                  <Route path="activity" element={<PMActivityPage />} />
                </Route>
              </Route>

              {/* 3. Developer Area */}
              <Route element={<RoleRoute allowedRoles={['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER']} />}>
                <Route path="/dev" element={<DeveloperLayout />}>
                  <Route index element={<DevTasksPage />} />
                  <Route path="activity" element={<DevActivityPage />} />
                </Route>
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};
