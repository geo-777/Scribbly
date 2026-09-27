import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute, PublicOnlyRoute } from './routes/RouteManager';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PublicNotePage from './pages/PublicNotePage';
import { Feather, ArrowLeft } from 'lucide-react';

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#080a0d] flex flex-col items-center justify-center p-6 text-center text-slate-100">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6 shadow-2xl">
        <Feather className="w-8 h-8" />
      </div>
      <span className="font-mono-code text-xs text-amber-400 uppercase tracking-widest mb-2">
        Error 404
      </span>
      <h1 className="font-syne text-3xl font-extrabold text-white mb-2">
        Page Not Found
      </h1>
      <p className="text-slate-400 text-sm max-w-sm mb-6 font-sans">
        The page or note you are looking for does not exist or has wandered off the notebook.
      </p>
      <Link
        to="/"
        className="px-5 py-2.5 rounded-xl bg-[#161a22] border border-white/10 text-white font-syne font-semibold text-xs flex items-center gap-2 hover:border-amber-400/50 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public reader for shared notes */}
            <Route path="/notes/public/:id" element={<PublicNotePage />} />

            {/* Public only routes for guest users */}
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <LoginPage />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicOnlyRoute>
                  <RegisterPage />
                </PublicOnlyRoute>
              }
            />

            {/* Protected application routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notes"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trash"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            {/* 404 Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
