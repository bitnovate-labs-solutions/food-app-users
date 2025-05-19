import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Layout from "@/components/AppLayout";
import { Suspense } from "react";
import { CardSkeleton } from "@/components/LoadingSkeleton";

// PUBLIC PAGES
import Onboarding from "@/pages/onboarding_page/Onboarding";
import Auth from "@/pages/auth/Auth";
import ResetPassword from "@/pages/auth/components/ResetPassword";
import AuthCallback from "@/routes/AuthCallback";
import Explore from "@/pages/explore/Explore";

// PROTECTED PAGES (require authentication)
import CreateProfile from "@/pages/create_profile/CreateProfile";
import EditProfile from "@/pages/edit_profile/EditProfile";
import Profile from "@/pages/profile/Profile";
import Treater from "@/pages/treater_page/Treater";
import Treatee from "@/pages/treatee/Treatee";
import ShoppingCart from "@/pages/cart_page/Cart";
import Messages from "@/pages/messages/Messages";
import Connect from "@/pages/connect_page/Connect";
// import TestSkeletons from "@/pages/test-skeletons_temp";

// TEMP TESTING
// import LoadingComponent from "@/components/LoadingComponent";
// import ErrorComponent from "@/components/ErrorComponent";

export default function AppRoutes() {
  return (
    <Routes>
      {/* PUBLIC ROUTES =================================================== */}
      <Route path="/" element={<Onboarding />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/auth/login" element={<Auth initialMode="login" />} />
      <Route path="/auth/signup" element={<Auth initialMode="signup" />} />
      <Route path="/auth/reset-password" element={<ResetPassword />} />

      {/* EXPLORE PAGE - PUBLIC ROUTE WITH LAYOUT */}
      {/* New users from /explore will be redirected to SIGNUP PAGE ("/auth" with state: { mode: 'signup' } */}
      {/* Auth.jsx will detect this state and show the signup form */}
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

      {/* PROTECTED ROUTES =================================================== */}
      <Route element={<ProtectedRoute />}>
        {/* ROUTES WITHOUT LAYOUT --------------------------------- */}
        <Route path="/create-profile" element={<CreateProfile />} />
        <Route path="/edit-profile" element={<EditProfile />} />

        {/* ROUTES WITH LAYOUT --------------------------------- */}
        {/* Each route requires individual wrapping of <Layout /> to enable passing the title as props to each respective Header */}

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
