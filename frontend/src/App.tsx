import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { Shield } from 'lucide-react';

const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const ThreatDetectionPage = lazy(() => import('./pages/ThreatDetectionPage').then(m => ({ default: m.ThreatDetectionPage })));
const SecurityEventsPage = lazy(() => import('./pages/SecurityEventsPage').then(m => ({ default: m.SecurityEventsPage })));
const VulnerabilityFindingsPage = lazy(() => import('./pages/VulnerabilityFindingsPage').then(m => ({ default: m.VulnerabilityFindingsPage })));
const NetworkAnalysisPage = lazy(() => import('./pages/NetworkAnalysisPage').then(m => ({ default: m.NetworkAnalysisPage })));
const ApiSecurityPage = lazy(() => import('./pages/ApiSecurityPage').then(m => ({ default: m.ApiSecurityPage })));
const AiModelsPage = lazy(() => import('./pages/AiModelsPage').then(m => ({ default: m.AiModelsPage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then(m => ({ default: m.ReportsPage })));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const ProjectInfoPage = lazy(() => import('./pages/ProjectInfoPage').then(m => ({ default: m.ProjectInfoPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));

const LoadingFallback: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
    <div className="relative flex items-center justify-center">
      <div className="w-14 h-14 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
      <Shield className="w-6 h-6 text-cyan-400 absolute animate-pulse" />
    </div>
    <div className="text-slate-400 text-sm font-medium tracking-wide">
      Loading CyberSentinel Module...
    </div>
  </div>
);

export const App: React.FC = () => {
  return (
    <Router>
      <MainLayout>
        <Suspense fallback={<LoadingFallback />}>
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
        </Suspense>
      </MainLayout>
    </Router>
  );
};

export default App;

