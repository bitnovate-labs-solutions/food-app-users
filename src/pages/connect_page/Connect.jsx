import { useState, useCallback } from "react";
import { useSwipeable } from "react-swipeable";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useImageCache } from "@/hooks/useImageCache";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  User,
  GraduationCap,
  Ruler,
  Cigarette,
  Wine,
  PawPrint,
  Baby,
  Telescope,
  Church,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import defaultImage from "@/assets/images/default-avatar.jpg";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import SwipeRight from "@/assets/images/swipe_right.png";
import SwipeLeft from "@/assets/images/swipe_left.png";
import LoadingComponent from "@/components/LoadingComponent";

const InstructionScreen = ({ onStart }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-sm mx-auto fixed inset-0 z-50 mb-[5rem] mt-[3.5rem] flex items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      <Card className="max-w-sm w-full mx-4 border-none shadow-none">
        <CardContent className="p-6 space-y-6">
          <div className="text-center space-y-2 mb-10">
            <h2 className="text-2xl font-bold text-primary">How It Works</h2>
            <p className="text-white">
              Find your perfect match with a simple swipe!
            </p>
          </div>

          <div className="space-y-4">
            {/* SWIPE RIGHT */}
            <div className="flex items-center justify-between bg-none mb-10">
              <div>
                <h3 className="font-semibold text-white text-xl mb-2">
                  Swipe Right if you{" "}
                  <span className="font-black text-green-400">Like</span>
                </h3>
                <p className="text-xs text-white">
                  {`If you're interested in connecting`}
                </p>
              </div>
              <img src={SwipeRight} alt="swipe-right" className="h-12 w-12" />
            </div>

            <div className="flex items-center mb-10">
              <div className="flex-1 border-t border-gray-300" />
              <span className="px-3 text-white text-sm">OR</span>
              <div className="flex-1 border-t border-gray-300" />
            </div>

            {/* SWIPE LEFT */}
            <div className="flex items-center justify-between bg-none mb-10">
              <img src={SwipeLeft} alt="swipe-left" className="h-12 w-12" />
              <div className="pl-10">
                <h3 className="font-semibold text-white text-xl mb-3">
                  Swipe Left to{" "}
                  <span className="font-black text-red-400">Pass</span>
                </h3>
                <p className="text-xs text-white">
                  {`If the person is not your cup of tea, simply pass. It's that
                  easy!`}
                </p>
              </div>
            </div>
          </div>

          <Button
            size="lg"
            onClick={onStart}
            className="w-full flex items-center justify-center gap-2 text-white"
          >
            Start Exploring <ArrowRight className="w-5 h-5" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const Connect = () => {
  const [hasSeenInstructions, setHasSeenInstructions] = useState(() => {
    return localStorage.getItem("hasSeenConnectInstructions") === "true";
  });
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipedUsers, setSwipedUsers] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const [isSwiping, setIsSwiping] = useState(false);
  const [direction, setDirection] = useState(0);
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });

  // Fetch potential matches
  const { data: potentialMatches, isLoading } = useQuery({
    queryKey: ["potentialMatches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .neq("user_id", user.id)
        .not("user_id", "in", `(${swipedUsers.join(",")})`);

      if (error) throw error;
      return data;
    },
  });

  const currentUser = potentialMatches?.[currentIndex];
  const cachedImageUrl = useImageCache(currentUser?.avatar_url);

  // HANDLE SWIPE
  const handleSwipe = useCallback(
    (direction) => {
      if (!currentUser || isSwiping) return;

      setIsSwiping(true);
      setShowDetails(false);
      setDirection(direction === "right" ? 1 : -1);

      if (direction === "right") {
        toast.success("Liked!", { duration: 1000 });
        setSwipedUsers((prev) => [...prev, currentUser.user_id]);
      } else if (direction === "left") {
        toast.info("Passed", { duration: 1000 });
        setSwipedUsers((prev) => [...prev, currentUser.user_id]);
      }

      // Move to next user after animation
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setIsSwiping(false);
        setDirection(0);
      }, 300);
    },
    [currentUser, isSwiping]
  );

  // SWIPE HANDLERS
  const handlers = useSwipeable({
    onSwipedLeft: () => handleSwipe("left"),
    onSwipedRight: () => handleSwipe("right"),
    onTouchStartOrOnMouseDown: (e) => {
      setTouchStart({
        x: e.touches ? e.touches[0].clientX : e.clientX,
        y: e.touches ? e.touches[0].clientY : e.clientY,
      });
    },
    onTouchMoveOrOnMouseMove: (e) => {
      if (!touchStart) return;

      const currentX = e.touches ? e.touches[0].clientX : e.clientX;
      const currentY = e.touches ? e.touches[0].clientY : e.clientY;

      const deltaX = Math.abs(currentX - touchStart.x);
      const deltaY = Math.abs(currentY - touchStart.y);

      // Only close details if the movement is more horizontal than vertical
      if (deltaX > deltaY && showDetails) {
        setShowDetails(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  const handleStartSwiping = () => {
    setHasSeenInstructions(true);
    localStorage.setItem("hasSeenConnectInstructions", "true");
  };

  if (isLoading) {
    return <LoadingComponent type="screen" text="Loading..." />;
  }

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-semibold mb-4">
          No more profiles to show
        </h2>
        <p className="text-gray-500">Check back later for more matches!</p>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {!hasSeenInstructions && (
          <InstructionScreen onStart={handleStartSwiping} />
        )}
      </AnimatePresence>

      <div className="min-h-full bg-gray-100 p-3 mb-22">
        <div className="max-w-md mx-auto">
          <div {...handlers} className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentUser.user_id}
                initial={{
                  scale: 0.95,
                  opacity: 0,
                  x: direction * 1000,
                  rotate: direction * 45,
                }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  x: 0,
                  rotate: 0,
                }}
                exit={{
                  scale: 0.95,
                  opacity: 0,
                  x: direction * 1000,
                  rotate: direction * 45,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.7}
                dragMomentum={false}
                dragDirectionLock
              >
                <Card className="overflow-hidden border-none shadow-2xl rounded-2xl">
                  {/* PROFILE IMAGE */}
                  <div className="h-[620px] w-full relative">
                    <img
                      src={cachedImageUrl || defaultImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/5 to-black/10" />

                    {/* USER NAME, AGE, GENDER */}
                    <div className="flex absolute bottom-22 left-6 text-white text-2xl font-bold">
                      <p>{currentUser.display_name || "-"}</p>
                      <span>,</span>
                      <p className="ml-2">{currentUser.age || "-"}</p>
                    </div>

                    <div className="flex absolute bottom-15 left-6">
                      {/* USER GENDER */}
                      <div
                        className={`px-3 py-0.5 rounded-full mr-2 ${
                          currentUser?.gender === "Male"
                            ? "bg-sky-200 text-sky-800"
                            : "bg-pink-200 text-pink-800"
                        }`}
                      >
                        <p className="text-sm capitalize">
                          {currentUser.gender || "-"}
                        </p>
                      </div>

                      {/* USER ROLE */}
                      <div
                        className={`px-3 py-0.5 rounded-full mr-2 ${
                          currentUser?.role === "treater"
                            ? "bg-blue-200 text-blue-800"
                            : "bg-secondary text-primary"
                        }`}
                      >
                        <p className="text-sm capitalize">
                          {currentUser.role || "-"}
                        </p>
                      </div>

                      {/* USER LOCATION */}
                      <div className="flex gap-1 px-3 py-0.5 bg-emerald-100 rounded-full max-w-[150px]">
                        <MapPin className="text-emerald-900 w-4 h-4 mr-1 my-auto flex-shrink-0" />
                        <p className="text-emerald-900 text-sm capitalize truncate">
                          {currentUser.location || "-"}
                        </p>
                      </div>
                    </div>

                    {/* USER OCCUPATION */}
                    <div className="flex absolute bottom-8 left-6">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 my-auto text-white" />
                      </div>
                      <p className="text-white text-sm capitalize">
                        {currentUser.occupation || "-"}
                      </p>
                    </div>

                    {/* VIEW DETAILS BUTTON */}
                    <div
                      className="absolute bottom-3 right-3 flex items-center gap-2 bg-white/30 backdrop-blur-sm rounded-full p-3 cursor-pointer"
                      onClick={() => !isSwiping && setShowDetails(!showDetails)}
                    >
                      <ChevronDown
                        className={`w-5 h-5 text-white transition-transform duration-200 ${
                          showDetails ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </div>

                  {/* USER DETAILS - COLLAPSIBLE */}
                  <motion.div
                    animate={{
                      height: showDetails ? "auto" : 0,
                      opacity: showDetails ? 1 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <CardContent className="space-y-3 p-4">
                      {/* ABOUT ME SECTION -------------------- */}
                      <Card className="bg-white border-gray-200 shadow-sm">
                        <CardContent className="p-4">
                          <h3 className="text-base font-semibold mb-3">
                            About Me
                          </h3>
                          <p className="text-sm text-gray-600">
                            {currentUser.about_me || "No description available"}
                          </p>
                        </CardContent>
                      </Card>

                      {/* MY DETAILS SECTION -------------------- */}
                      <Card className="bg-white border-gray-200 shadow-sm">
                        <CardContent className="p-4">
                          <h3 className="text-base font-semibold mb-3">
                            Details
                          </h3>
                          <div className="grid grid-cols-1 gap-2">
                            {/* EDUCATION */}
                            <div className="flex items-center justify-between py-1.5">
                              <div className="flex items-center gap-2">
                                <GraduationCap className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">
                                  Education
                                </span>
                              </div>
                              <span className="text-sm text-gray-600">
                                {currentUser.education || "-"}
                              </span>
                            </div>

                            {/* HEIGHT */}
                            <div className="flex items-center justify-between py-1.5">
                              <div className="flex items-center gap-2">
                                <Ruler className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">
                                  Height
                                </span>
                              </div>
                              <span className="text-sm text-gray-600">
                                {currentUser.height || "-"}
                              </span>
                            </div>

                            {/* SMOKING */}
                            <div className="flex items-center justify-between py-1.5">
                              <div className="flex items-center gap-2">
                                <Cigarette className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">
                                  Smoking
                                </span>
                              </div>
                              <span className="text-sm text-gray-600">
                                {currentUser.smoking || "-"}
                              </span>
                            </div>

                            {/* DRINKING */}
                            <div className="flex items-center justify-between py-1.5">
                              <div className="flex items-center gap-2">
                                <Wine className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">
                                  Drinking
                                </span>
                              </div>
                              <span className="text-sm text-gray-600">
                                {currentUser.drinking || "-"}
                              </span>
                            </div>

                            {/* PETS */}
                            <div className="flex items-center justify-between py-1.5">
                              <div className="flex items-center gap-2">
                                <PawPrint className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">
                                  Pets
                                </span>
                              </div>
                              <span className="text-sm text-gray-600">
                                {currentUser.pets || "-"}
                              </span>
                            </div>

                            {/* CHILDREN */}
                            <div className="flex items-center justify-between py-1.5">
                              <div className="flex items-center gap-2">
                                <Baby className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">
                                  Children
                                </span>
                              </div>
                              <span className="text-sm text-gray-600">
                                {currentUser.children || "-"}
                              </span>
                            </div>

                            {/* ZODIAC */}
                            <div className="flex items-center justify-between py-1.5">
                              <div className="flex items-center gap-2">
                                <Telescope className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">
                                  Zodiac Sign
                                </span>
                              </div>
                              <span className="text-sm text-gray-600">
                                {currentUser.zodiac || "-"}
                              </span>
                            </div>

                            {/* RELIGION */}
                            <div className="flex items-center justify-between py-1.5">
                              <div className="flex items-center gap-2">
                                <Church className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">
                                  Religion
                                </span>
                              </div>
                              <span className="text-sm text-gray-600">
                                {currentUser.religion || "-"}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* INTERESTS SECTION -------------------- */}
                      <Card className="bg-white border-gray-200 shadow-sm">
                        <CardContent className="p-4">
                          <h3 className="text-base font-semibold mb-3">
                            Interests
                          </h3>
                          {currentUser.interests &&
                          currentUser.interests.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {currentUser.interests.map((interest) => (
                                <div
                                  key={interest}
                                  className="flex items-center gap-2 bg-primary/80 rounded-full py-1 px-3"
                                >
                                  <span className="text-xs text-white">
                                    {interest}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground text-lightgray">
                              No interests added yet
                            </p>
                          )}
                        </CardContent>
                      </Card>

                      {/* LANGUAGES SECTION -------------------- */}
                      <Card className="bg-white border-gray-200 shadow-sm">
                        <CardContent className="p-4">
                          <h3 className="text-base font-semibold mb-3">
                            Languages
                          </h3>
                          {currentUser.languages &&
                          currentUser.languages.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {currentUser.languages.map((language) => (
                                <div
                                  key={language}
                                  className="flex items-center gap-2 bg-primary/80 rounded-full py-1 px-3"
                                >
                                  <span className="text-xs text-white">
                                    {language}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground text-lightgray">
                              No languages added yet
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </CardContent>
                  </motion.div>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
};

export default Connect;
