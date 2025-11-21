import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { Layout } from "@/components/layout";

// PUBLIC PAGES
import Onboarding from "@/pages/onboarding_page/Onboarding";
import Auth from "@/pages/auth/Auth";
import ResetPassword from "@/pages/auth/components/ResetPassword";
import AuthCallback from "@/routes/AuthCallback";

// PROTECTED PAGES (require authentication)
import CreateProfile from "@/pages/create_profile/CreateProfile";
import Profile from "@/pages/profile/Profile";
import Explore from "@/pages/explore/Explore";
// import Treatee from "@/pages/treatee/Treatee";

// TREASURE HUNT PAGES
import Home from "@/pages/home/Home";
import InviteFriends from "@/pages/treasure_hunt/InviteFriends";
import TreasureHuntTeam from "@/pages/treasure_hunt/TreasureHuntTeam";
import TreasureHuntActive from "@/pages/treasure_hunt/TreasureHuntActive";
import Collection from "@/pages/collection/Collection";
import BonusRewards from "@/pages/rewards/BonusRewards";
import RedeemPoints from "@/pages/rewards/RedeemPoints";
import ShareFriends from "@/pages/social/ShareFriends";
import Leaderboard from "@/pages/leaderboard/Leaderboard";
import RestaurantDetail from "@/pages/restaurant/RestaurantDetail";
import RecommendedSpot from "@/pages/treasure_hunt/RecommendedSpot";
import QRScan from "@/pages/scan/QRScan";
import RedeemedSuccess from "@/pages/voucher/RedeemedSuccess";
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

        {/* TREASURE HUNT ROUTES (No Layout) */}
        {/* Redirect old treasure-hunt-solo route to home with treasure tab */}
        <Route
          path="/treasure-hunt-solo"
          element={<Navigate to="/home?tab=treasure" replace />}
        />
        <Route path="/invite-friends" element={<InviteFriends />} />
        <Route path="/treasure-hunt-team" element={<TreasureHuntTeam />} />
        <Route path="/bonus-rewards" element={<BonusRewards />} />
        <Route path="/redeem-points" element={<RedeemPoints />} />
        <Route path="/share-friends" element={<ShareFriends />} />
        <Route path="/leaderboard" element={<Leaderboard />} />

        {/* ROUTES WITH LAYOUT --------------------------------- */}
        {/* Each route requires individual wrapping of <Layout /> to enable passing the title as props to each respective Header */}

        {/* HOME PAGE */}
        <Route element={<Layout title="Home" />}>
          <Route path="/home" element={<Home />} />
        </Route>

        {/* EXPLORE PAGE (Map Explore) */}
        <Route element={<Layout title="Explore" />}>
          <Route path="/map-explore" element={<Explore />} />
        </Route>

        {/* TREASURE HUNT ACTIVE PAGE */}
        <Route element={<Layout title="Treasure Hunt" />}>
          <Route path="/treasure-hunt-active" element={<TreasureHuntActive />} />
        </Route>

        {/* TREATEE PAGE */}
        {/* <Route element={<Layout title="Welcome back, Treatee!" />}>
          <Route path="/treatee" element={<Treatee />} />
        </Route> */}

        {/* PROFILE PAGE */}
        <Route element={<Layout title="Profile" />}>
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* COLLECTION PAGE */}
        <Route element={<Layout title="Collection" />}>
          <Route path="/collection" element={<Collection />} />
        </Route>

        {/* QR SCAN PAGE */}
        <Route element={<Layout title="Scan QR Code" />}>
          <Route path="/scan" element={<QRScan />} />
        </Route>

        {/* VOUCHER REDEEMED SUCCESS PAGE */}
        <Route element={<Layout title="Voucher Redeemed" />}>
          <Route path="/redeemed-success" element={<RedeemedSuccess />} />
        </Route>

        {/* RESTAURANT DETAIL PAGE */}
        <Route element={<Layout title="Restaurant Details" />}>
          <Route path="/restaurant-detail" element={<RestaurantDetail />} />
        </Route>

        {/* RECOMMENDED SPOT PAGE */}
        <Route element={<Layout title="Recommended Spot" />}>
          <Route path="/recommended-spot" element={<RecommendedSpot />} />
        </Route>
      </Route>
    </Routes>
  );
}
