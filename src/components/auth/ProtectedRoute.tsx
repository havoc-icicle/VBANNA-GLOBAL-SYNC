import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { isAuthenticated, isLoading, user, onboardingSkippedThisSession } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user needs onboarding
  const needsOnboarding = user && (user.onboarding_status === 'pending' || user.onboarding_status === 'skipped');
  
  console.log(`[ProtectedRoute.tsx] Checking onboarding status for path: ${location.pathname}`);
  console.log(`[ProtectedRoute.tsx] User onboarding_status: ${user?.onboarding_status}`);
  console.log(`[ProtectedRoute.tsx] Onboarding skipped this session: ${onboardingSkippedThisSession}`);

  if (needsOnboarding && !onboardingSkippedThisSession && location.pathname !== '/onboarding') {
    console.log(`[ProtectedRoute.tsx] Redirecting to /onboarding.`);
    return <Navigate to="/onboarding" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};