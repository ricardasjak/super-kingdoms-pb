import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/query-client';
import { AuthProvider } from './context/auth-context';
import { ThemeProvider } from './context/theme.context';
import { KingdomMessageProvider } from './context/kingdom-message.context';
import { Layout } from './components/layout';

// Pages
import { HomePage } from './pages/home.page';
import { LoginPage } from './pages/login.page';
import { RegisterPage } from './pages/register.page';
import { CreateKingdomPage } from './pages/create-kingdom.page';
import { AdminPage } from './pages/admin.page';

// Kingdom Sub-pages & Layout
import { KingdomLayout } from './pages/kingdom-layout';
import { KingdomStatusPage } from './pages/kingdom-status.page';
import { KingdomGrowthPage } from './pages/kingdom-growth.page';
import { KingdomExplorePage } from './pages/kingdom-explore.page';
import { KingdomMilitaryPage } from './pages/kingdom-military.page';
import { KingdomResearchPage } from './pages/kingdom-research.page';
import { KingdomTargetsPage } from './pages/kingdom-targets.page';
import { KingdomReportsPage } from './pages/kingdom-reports.page';
import { KingdomProfilePage } from './pages/kingdom-profile.page';
import { KingdomSettingsPage } from './pages/kingdom-settings.page';
import { KingdomDeletePage } from './pages/kingdom-delete.page';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <KingdomMessageProvider>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/create" element={<CreateKingdomPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/admin" element={<AdminPage />} />

                {/* Kingdom Routes */}
                <Route path="/kingdom" element={<KingdomLayout />}>
                  <Route index element={<Navigate to="/kingdom/status" replace />} />
                  <Route path="status" element={<KingdomStatusPage />} />
                  <Route path="growth" element={<KingdomGrowthPage />} />
                  <Route path="explore" element={<KingdomExplorePage />} />
                  <Route path="military" element={<KingdomMilitaryPage />} />
                  <Route path="research" element={<KingdomResearchPage />} />
                  <Route path="targets" element={<KingdomTargetsPage />} />
                  <Route path="reports" element={<KingdomReportsPage />} />
                  <Route path="profile" element={<KingdomProfilePage />} />
                  <Route path="settings" element={<KingdomSettingsPage />} />
                  <Route path="delete" element={<KingdomDeletePage />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </KingdomMessageProvider>
        </AuthProvider>
      </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
