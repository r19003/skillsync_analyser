import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
