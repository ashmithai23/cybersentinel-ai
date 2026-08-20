import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { DashboardPage } from './pages/DashboardPage';
import { ThreatDetectionPage } from './pages/ThreatDetectionPage';
import { SecurityEventsPage } from './pages/SecurityEventsPage';
import { VulnerabilityFindingsPage } from './pages/VulnerabilityFindingsPage';
import { NetworkAnalysisPage } from './pages/NetworkAnalysisPage';
import { ApiSecurityPage } from './pages/ApiSecurityPage';
import { AiModelsPage } from './pages/AiModelsPage';
import { ReportsPage } from './pages/ReportsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ProjectInfoPage } from './pages/ProjectInfoPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/detection" element={<ThreatDetectionPage />} />
          <Route path="/events" element={<SecurityEventsPage />} />
          <Route path="/findings" element={<VulnerabilityFindingsPage />} />
          <Route path="/network" element={<NetworkAnalysisPage />} />
          <Route path="/api-security" element={<ApiSecurityPage />} />
          <Route path="/models" element={<AiModelsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/info" element={<ProjectInfoPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </MainLayout>
    </Router>
  );
};

export default App;
