import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import Layout from "@/components/AppLayout";
// import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
// import { AppErrorBoundary } from "@/components/error-fallback";
import { CardSkeleton } from "@/components/LoadingSkeleton";

// Pages
import Onboarding from "@/pages/onboarding_page/Onboarding";
import Auth from "@/pages/auth/Auth";
import Profile from "@/pages/Profile";
import Treater from "@/pages/treater_page/Treater";
import Treatee from "@/pages/treatee/Treatee";
import ShoppingCart from "@/pages/cart_page/Cart";
import Messages from "@/pages/messages/Messages";
import Explore from "@/pages/explore/Explore";
import CreateProfile from "@/pages/CreateProfile";
import EditProfile from "@/pages/edit_profile_page/EditProfile";
import AuthCallback from "@/routes/AuthCallback";
import Connect from "@/pages/connect_page/Connect";
// import TestSkeletons from "@/pages/test-skeletons_temp";

// TEMP TESTING
// import LoadingComponent from "@/components/LoadingComponent";
// import ErrorComponent from "@/components/ErrorComponent";

export default function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* ----------------------------- PUBLIC ROUTES ----------------------------- */}

      <Route path="/" element={<Onboarding />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* FOR TESTING LOADING COMPONENT UI */}
      {/* <Route
        path="/loading-test"
        element={
          <LoadingComponent
            type="screen"
            text="Loading..."
            // text="Setting up your experience..."
          />
        }
      /> */}

      {/* FOR TESTING SKELETON COMPONENTS */}
      {/* <Route path="/test-skeletons" element={<TestSkeletons />} /> */}

      {/* WITH LAYOUT */}
      <Route element={<Layout title="Explore" />}>
        <Route
          path="/explore"
          element={
            <Suspense fallback={<CardSkeleton />}>
              <Explore />
            </Suspense>
          }
        />
      </Route>

      {/* Authentication route */}
      <Route
        path="/auth/*"
        element={!user ? <Auth /> : <Navigate to="/create-profile" />}
      />

      {/* ----------------------------- PROTECTED ROUTES ----------------------------- */}

      {/* WITHOUT LAYOUT */}
      <Route element={<ProtectedRoute />}>
        <Route path="/create-profile" element={<CreateProfile />} />
        <Route path="/edit-profile" element={<EditProfile />} />
      </Route>

      {/* WITH LAYOUT */}
      {/* Each route requires individual wrapping of <Layout /> to enable passing the title as props to each respective Header */}
      <Route element={<ProtectedRoute />}>
        {/* TREATER PAGE */}
        <Route element={<Layout title="Welcome back, Treater!" />}>
          <Route path="/treater" element={<Treater />} />
        </Route>
        {/* TREATEE PAGE */}
        <Route element={<Layout title="Welcome back, Treatee!" />}>
          <Route path="/treatee" element={<Treatee />} />
        </Route>
        {/* PROFILE PAGE */}
        <Route element={<Layout title="Profile" />}>
          <Route path="/profile" element={<Profile />} />
        </Route>
        {/* SHOPPING CART PAGE */}
        <Route element={<Layout title="My Cart" />}>
          <Route path="/my-cart" element={<ShoppingCart />} />
        </Route>
        {/* CONNECT PAGE */}
        <Route element={<Layout title="Connect" />}>
          <Route path="/connect" element={<Connect />} />
        </Route>
        {/* MESSAGES PAGE */}
        <Route element={<Layout title="Messages" />}>
          <Route path="/messages" element={<Messages />} />
          <Route path="/messages/:conversationId" element={<Messages />} />
        </Route>
      </Route>
    </Routes>
  );
}
