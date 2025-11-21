// Checks if a user is authenticated
// Checks if the user has a profile
// Redirects to appropriate pages based on auth state:
// - unauthenticated users -> /auth
// - authenticated users without profile -> /create-profile
// - authenticated users with profile -> their role-specific page (/treater or /treatee)

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import LoadingComponent from "@/components/LoadingComponent";

export default function ProtectedRoute() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useUserProfile(user);
  const location = useLocation();

  // Show loading state
  if (isLoading) {
    return <LoadingComponent type="screen" text="Loading..." />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If on create-profile page, always allow access
  // The create-profile page will handle checking if app_users exists
  if (location.pathname === "/create-profile") {
    return <Outlet />;
  }

  // For all other protected routes...
  // If user has no profile, redirect to create-profile
  if (!profile) {
    return <Navigate to="/create-profile" replace />;
  }

  return <Outlet />;
}
