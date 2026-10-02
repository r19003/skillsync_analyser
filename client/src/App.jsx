import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ui/ProtectedRoute';

import Login          from './pages/Login';
import Register       from './pages/Register';
import Dashboard      from './pages/Dashboard';
import UploadResume   from './pages/UploadResume';
import AnalysisResult from './pages/AnalysisResult';
import History        from './pages/History';
import Landing        from './pages/Landing';
import Report         from './pages/Report';
import StudyPlan      from './pages/StudyPlan';
import Progress       from './pages/Progress';
import MultiCompare   from './pages/MultiCompare';
import DeepReport     from './pages/DeepReport';
import AdvStudyPlan   from './pages/AdvStudyPlan';
import CareerAnalytics from './pages/CareerAnalytics';

// Career Workspace Pages (Lazy-loaded for progressive disclosure)
const CareerOverviewPage = lazy(() => import('./pages/career/CareerOverviewPage'));
const CareerSkillGapsPage = lazy(() => import('./pages/career/CareerSkillGapsPage'));
const CareerKeywordsPage = lazy(() => import('./pages/career/CareerKeywordsPage'));
const CareerEvidencePage = lazy(() => import('./pages/career/CareerEvidencePage'));
const CareerMarketPage = lazy(() => import('./pages/career/CareerMarketPage'));
const CareerRoadmapPage = lazy(() => import('./pages/career/CareerRoadmapPage'));
const CareerResourcesPage = lazy(() => import('./pages/career/CareerResourcesPage'));
const CareerAssessmentsPage = lazy(() => import('./pages/career/CareerAssessmentsPage'));
const CareerProgressPage = lazy(() => import('./pages/career/CareerProgressPage'));
const CareerSettingsPage = lazy(() => import('./pages/career/CareerSettingsPage'));

const WorkspaceLoader = () => (
  <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const CareerRedirect = () => {
  const { analysisId } = useParams();
  return <Navigate to={`/career/${analysisId}/overview`} replace />;
};

const CareerAnalyticsRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/career/${id}/overview`} replace />;
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a2235',
              color: '#f1f5f9',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.875rem',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#1a2235' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#1a2235' } },
            duration: 3500,
          }}
        />

        {/* Route definitions */}
        <AnimatePresence mode="wait">
          <Routes>
            {/* Public routes */}
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/upload" element={
              <ProtectedRoute><UploadResume /></ProtectedRoute>
            } />
            <Route path="/analysis/:id" element={
              <ProtectedRoute><AnalysisResult /></ProtectedRoute>
            } />
            <Route path="/history" element={
              <ProtectedRoute><History /></ProtectedRoute>
            } />
            <Route path="/report/:id" element={
              <ProtectedRoute><Report /></ProtectedRoute>
            } />
            <Route path="/study-plan/:id" element={
              <ProtectedRoute><StudyPlan /></ProtectedRoute>
            } />
            <Route path="/progress/:id" element={
              <ProtectedRoute><Progress /></ProtectedRoute>
            } />
            <Route path="/compare" element={
              <ProtectedRoute><MultiCompare /></ProtectedRoute>
            } />
            <Route path="/deep-report/:id" element={
              <ProtectedRoute><DeepReport /></ProtectedRoute>
            } />
            <Route path="/adv-study-plan/:planId" element={
              <ProtectedRoute><AdvStudyPlan /></ProtectedRoute>
            } />
            <Route path="/career-analytics" element={
              <ProtectedRoute><CareerAnalytics /></ProtectedRoute>
            } />
            <Route path="/career-analytics/:id" element={
              <ProtectedRoute><CareerAnalyticsRedirect /></ProtectedRoute>
            } />

            {/* Career Workspace 10 Dedicated Routes */}
            <Route path="/career/:analysisId/overview" element={
              <ProtectedRoute>
                <Suspense fallback={<WorkspaceLoader />}>
                  <CareerOverviewPage />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/career/:analysisId/skills" element={
              <ProtectedRoute>
                <Suspense fallback={<WorkspaceLoader />}>
                  <CareerSkillGapsPage />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/career/:analysisId/keywords" element={
              <ProtectedRoute>
                <Suspense fallback={<WorkspaceLoader />}>
                  <CareerKeywordsPage />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/career/:analysisId/evidence" element={
              <ProtectedRoute>
                <Suspense fallback={<WorkspaceLoader />}>
                  <CareerEvidencePage />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/career/:analysisId/market" element={
              <ProtectedRoute>
                <Suspense fallback={<WorkspaceLoader />}>
                  <CareerMarketPage />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/career/:analysisId/roadmap" element={
              <ProtectedRoute>
                <Suspense fallback={<WorkspaceLoader />}>
                  <CareerRoadmapPage />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/career/:analysisId/resources" element={
              <ProtectedRoute>
                <Suspense fallback={<WorkspaceLoader />}>
                  <CareerResourcesPage />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/career/:analysisId/assessments" element={
              <ProtectedRoute>
                <Suspense fallback={<WorkspaceLoader />}>
                  <CareerAssessmentsPage />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/career/:analysisId/progress" element={
              <ProtectedRoute>
                <Suspense fallback={<WorkspaceLoader />}>
                  <CareerProgressPage />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/career/:analysisId/settings" element={
              <ProtectedRoute>
                <Suspense fallback={<WorkspaceLoader />}>
                  <CareerSettingsPage />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/career/:analysisId" element={
              <ProtectedRoute><CareerRedirect /></ProtectedRoute>
            } />

            {/* Default route */}
            <Route path="/" element={<Landing />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
