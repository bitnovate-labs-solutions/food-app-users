import { Suspense } from "react";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { supabase } from "@/lib/supabase";

import { ScrollArea } from "@/components/ui/scroll-area";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "@/components/ErrorFallback";
import { CardSkeleton } from "@/components/LoadingSkeleton";
// import TreateeCard from "./components/TreateeCard";
// import { useAuth } from "@/context/AuthContext";
// import { toast } from "sonner";
import { useLocation } from "react-router-dom";
import Menu from "./subpages/Menu";

// function FoodItems() {
//   const queryClient = useQueryClient();
//   const { user } = useAuth();

//   const fetchFoodItems = useCallback(async () => {
//     // Try to get from cache first
//     const cached = queryClient.getQueryData(["foodItems"]);
//     if (cached) return cached;

//     const { data: userLikes } = await supabase
//       .from("food_likes")
//       .select("food_id")
//       .eq("user_id", user.id);

//     const likedFoodIds = new Set(userLikes?.map((like) => like.food_id) || []);

//     // If not in cache, fetch from API
//     const { data, error } = await supabase
//       .from("foods")
//       .select(
//         `
//         *,
//         restaurants (
//           id,
//           name,
//           location,
//           image_url
//         ),
//         user_selections (
//           id,
//           user_profile_id,
//           role,
//           user_profiles (
//             id,
//             display_name,
//             avatar_url
//           )
//         )
//       `
//       )
//       .order("available_date", { ascending: true });

//     if (error) throw error;

//     return data.map((item) => ({
//       ...item,
//       isLiked: likedFoodIds.has(item.id),
//     }));
//   }, [user.id]);

//   const likeMutation = useMutation({
//     mutationFn: async (foodId) => {
//       const { data: existingLike } = await supabase
//         .from("food_likes")
//         .select("id")
//         .eq("food_id", foodId)
//         .eq("user_id", user.id)
//         .single();

//       if (existingLike) {
//         await supabase
//           .from("food_likes")
//           .delete()
//           .eq("food_id", foodId)
//           .eq("user_id", user.id);

//         await supabase
//           .from("foods")
//           .update({ likes: supabase.raw("likes - 1") })
//           .eq("id", foodId);

//         return { foodId, action: "unliked" };
//       } else {
//         await supabase
//           .from("food_likes")
//           .insert({ food_id: foodId, user_id: user.id });

//         await supabase
//           .from("foods")
//           .update({ likes: supabase.raw("likes + 1") })
//           .eq("id", foodId);

//         return { foodId, action: "liked" };
//       }
//     },
//     onSuccess: ({ foodId, action }) => {
//       queryClient.setQueryData(["foodItems"], (old) =>
//         old?.map((item) =>
//           item.id === foodId
//             ? {
//                 ...item,
//                 isLiked: action === "liked",
//                 likes: item.likes + (action === "liked" ? 1 : -1),
//               }
//             : item
//         )
//       );

//       toast.success(
//         action === "liked" ? "Added to favorites" : "Removed from favorites"
//       );
//     },
//     onError: (error) => {
//       toast.error("Failed to update like status", {
//         description: error.message,
//       });
//     },
//   });

//   const { data: foodItems } = useQuery({
//     queryKey: ["foodItems"],
//     queryFn: fetchFoodItems,
//     staleTime: 5 * 60 * 1000, // Cache for 5 minutes
//     cacheTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
//     suspense: true,
//     refetchOnWindowFocus: false,
//     refetchOnMount: false,
//   });

//   const handleLike = (foodId) => {
//     likeMutation.mutate(foodId);
//   };

//   return (
//     <div className="space-y-4">
//       <div className="grid grid-cols-1 gap-4">
//         {foodItems?.map((item) => (
//           <TreateeCard
//             key={item.id}
//             item={item}
//             isLiked={item.isLiked}
//             onLike={handleLike}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }

export default function Treatee() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get("tab") || "menu";

  const renderContent = () => {
    switch (activeTab) {
      case "menu":
        return <Menu />;
      // case "booked":
      //   return <Booked />;
      default:
        return <Menu />;
    }
  };

  return (
    <ScrollArea>
      <div className="bg-transparent py-4">
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<CardSkeleton />}>
            {/* <FoodItems /> */}
            {renderContent()}
          </Suspense>
        </ErrorBoundary>
      </div>
    </ScrollArea>
  );
}
