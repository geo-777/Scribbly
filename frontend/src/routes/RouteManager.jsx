import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Feather } from 'lucide-react';

/**
 * Editorial loading screen displayed while verifying token validity via /auth/me
 */
export function AppLoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#090b0e] text-white">
      <div className="relative flex items-center justify-center mb-6">
        <div className="absolute w-20 h-20 rounded-full bg-amber-500/10 blur-xl animate-pulse-glow" />
        <div className="w-14 h-14 rounded-2xl bg-[#14171f] border border-amber-500/30 flex items-center justify-center shadow-2xl relative">
          <Feather className="w-7 h-7 text-amber-400 animate-bounce" />
        </div>
      </div>
      <h2 className="font-syne text-xl font-bold tracking-tight text-white mb-2">
        Scribbly<span className="text-amber-400">.</span>
      </h2>
      <p className="text-xs uppercase tracking-widest text-slate-400 font-mono-code flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
        Authenticating session
      </p>
    </div>
  );
}

/**
 * Protects private application routes.
 * Redirects unauthenticated users to /login and preserves their intended target route.
 */
export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <AppLoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
}

/**
 * For routes accessible only when logged out (e.g. /login, /register).
 * Redirects authenticated users to the main dashboard.
 */
export function PublicOnlyRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <AppLoadingScreen />;
  }

  if (isAuthenticated) {
    const destination = location.state?.from?.pathname || '/';
    return <Navigate to={destination} replace />;
  }

  return children ? children : <Outlet />;
}
