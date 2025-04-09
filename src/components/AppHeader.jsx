import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { sortOptions, states } from "@/lib/constants";
import { useCuisineTypeEnum, useFoodCategoryEnum } from "@/hooks/useEnumValues";
import { useFilters } from "@/context/FilterContext";
import { version } from "../../package.json";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

// COMPONENTS
import { ChevronDown, LogOut, Settings2, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { toast } from "sonner";
import LoadingComponent from "./LoadingComponent";
import ErrorComponent from "./ErrorComponent";

export default function AppHeader({ title, subtitle, isHomePage, isProfilePage }) {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get("tab") || "menu";
  const { filters, setFilters } = useFilters(); // Global filter state
  const { data: userProfile } = useUserProfile(user);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();

  // HOOKS
  const {
    data: cuisineTypes,
    isLoading: isLoadingCuisineTypes,
    error: errorCuisineTypes,
  } = useCuisineTypeEnum();
  const {
    data: foodCategories,
    isLoading: isLoadingFoodCategories,
    error: errorFoodCategories,
  } = useFoodCategoryEnum();

  // HANDLE TAB CHANGE
  const handleTabChange = (value) => {
    const newSearchParams = new URLSearchParams(location.search);
    newSearchParams.set("tab", value);
    navigate(`${location.pathname}?${newSearchParams.toString()}`);
  };

  // HANDLE SORT CHANGE
  const handleSortChange = (value) => {
    setFilters((prev) => ({ ...prev, sort: value }));
  };

  // HANDLE CUISINE CHANGE
  const handleCuisineChange = (value) => {
    setFilters((prev) => ({ ...prev, cuisine: value }));
  };

  // HANDLE CATEGORY CHANGE
  const handleCategoryChange = (value) => {
    setFilters((prev) => ({ ...prev, category: value }));
  };

  // HANDLE LOCATION CHANGE
  const handleLocationChange = (value) => {
    setFilters((prev) => ({ ...prev, location: value }));
  };

  // HANDLE REFRESH
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries();
      toast.success("Data refreshed successfully", {
        duration: 1000,
      });
    } catch (error) {
      toast.error("Failed to refresh data", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // HANDLE SIGN OUT
  const handleSignOut = async () => {
    try {
      // Remove all cached images
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("img_cache_")) {
          localStorage.removeItem(key);
        }
      });

      await signOut();
    } catch (error) {
      console.error("Sign-out error: ", error);
      toast.error("Error", {
        description: "Failed to sign out. Please try again.",
      });
    }
  };

  // LOADING AND ERROR HANDLING
  if (isLoadingCuisineTypes || isLoadingFoodCategories)
    return <LoadingComponent type="screen" text="Loading..." />;

  if (errorCuisineTypes)
    return <ErrorComponent message={errorCuisineTypes.message} />;
  if (errorFoodCategories)
    return <ErrorComponent message={errorFoodCategories.message} />;

  return (
    <div className="fixed top-0 left-0 right-0 max-w-sm mx-auto bg-white border-b border-gray-200 shadow-md z-10">
      <div className="pt-3">
        <div className="grid grid-cols-5">
          {/* LEFT SIDE BUTTONS -------------------- */}
          <div className="flex justify-start">
            {/* {user && isHomePage && <NotificationBell />} */}
          </div>

          <div className="col-span-3">
            {/* HEADER TITLE -------------------- */}
            <h1 className="text-base font-semibold mb-4 text-center text-gray-800">
              {title}
            </h1>
            {subtitle && (
              <div className="flex justify-center">
                {subtitle}
              </div>
            )}
          </div>

          {/* RIGHT SIDE BUTTONS -------------------- */}
          <div className="flex justify-end gap-2">
            {/* REFRESH BUTTON - Only show on main page */}
            {isHomePage && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="h-7 mr-2 text-primary"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </Button>
            )}

            {/* SETTINGS BUTTON -------------------- */}
            {isProfilePage && !isHomePage && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-white text-primary h-7 mr-2 shadow-none">
                    <Settings2 />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-white border-gray-100 shadow-2xl mr-2 space-y-2 py-4 rounded-xl"
                >
                  {/* REFRESH BUTTON */}
                  <DropdownMenuItem
                    onClick={handleRefresh}
                    className="text-primary"
                    disabled={isRefreshing}
                  >
                    <RefreshCw
                      className={`w-4 h-4 mr-2 ${
                        isRefreshing ? "animate-spin" : ""
                      }`}
                    />
                    {isRefreshing ? "Refreshing..." : "Refresh"}
                  </DropdownMenuItem>

                  {/* SIGN OUT BUTTON */}
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-primary"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>

                  {/* VERSION NUMBER */}
                  <DropdownMenuItem className="text-lightgray">
                    Version: {version}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* PAGE TABS -------------------- */}
        <div className="space-y-2">
          {/* Only show TabList and filters if isProfilePage is false and user is authenticated */}
          {isHomePage && (
            <div className="space-y-2">
              <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
                className="w-full px-4"
              >
                <TabsList
                  className={`grid ${
                    userProfile?.role === "treatee"
                      ? "grid-cols-2"
                      : "grid-cols-3"
                  } h-10 items-stretch px-1.5`}
                >
                  {/* MENU TAB */}
                  <TabsTrigger
                    value="menu"
                    className="text-sm text-primary data-[state=active]:bg-primary data-[state=active]:text-white border-primary rounded-r-none border-1"
                  >
                    Menu
                  </TabsTrigger>
                  {/* PURCHASED TAB - Only show if user is not a treatee */}
                  {userProfile?.role !== "treatee" && (
                    <TabsTrigger
                      value="purchased"
                      className="text-sm text-primary data-[state=active]:bg-primary data-[state=active]:text-white border-primary rounded-none border-1 border-l-0"
                    >
                      Purchased
                    </TabsTrigger>
                  )}
                  {/* BOOKED TAB */}
                  <TabsTrigger
                    value="booked"
                    className={`text-sm text-primary data-[state=active]:bg-primary data-[state=active]:text-white border-primary ${
                      userProfile?.role === "treatee"
                        ? "rounded-l-none"
                        : "rounded-l-none"
                    } border-1 border-l-0`}
                  >
                    Booked
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* FILTERS -------------------- */}
              <div className="flex gap-2 overflow-x-auto pb-2 pl-4">
                {/* SORT BY */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild className="h-7">
                    <Button
                      variant="outline"
                      className="rounded-full whitespace-nowrap text-[12px] font-light py-1 border-none bg-secondary hover:bg-secondary/80"
                    >
                      {sortOptions.find(
                        (option) => option.value === filters.sort
                      )?.label || "Sort by"}
                      <ChevronDown className="w-4 h-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-40 bg-white border-gray-100 shadow-2xl rounded-xl text-darkgray py-4"
                  >
                    <DropdownMenuItem
                      className="text-primary font-medium flex justify-center"
                      onClick={() => handleSortChange(null)}
                    >
                      Reset
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-200" />
                    {sortOptions.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        className={
                          filters.sort === option.value ? "bg-accent" : ""
                        }
                        onClick={() => handleSortChange(option.value)}
                      >
                        {option.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* CUISINE */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild className="h-7">
                    <Button
                      variant="outline"
                      className="rounded-full whitespace-nowrap text-[12px] font-light py-1 border-none bg-secondary hover:bg-secondary/80"
                    >
                      {filters.cuisine
                        ? (cuisineTypes || []).find(
                            (c) => c.value === filters.cuisine
                          )?.label
                        : "Cuisine"}
                      <ChevronDown className="w-4 h-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-40 bg-white border-gray-100 shadow-2xl rounded-xl text-darkgray py-4"
                  >
                    <DropdownMenuItem
                      className="text-primary font-medium flex justify-center"
                      onClick={() => handleCuisineChange(null)}
                    >
                      Reset
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-200" />
                    {[...(cuisineTypes || [])]
                      .sort((a, b) => a.label.localeCompare(b.label))
                      .map((option) => (
                        <DropdownMenuItem
                          key={option.value}
                          className={
                            filters.cuisine === option.value ? "bg-accent" : ""
                          }
                          onClick={() => handleCuisineChange(option.value)}
                        >
                          {option.label}
                        </DropdownMenuItem>
                      ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* FOOD CATEGORIES */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild className="h-7">
                    <Button
                      variant="outline"
                      className="rounded-full whitespace-nowrap text-[12px] font-light py-1 border-none bg-secondary hover:bg-secondary/80"
                    >
                      {filters.category
                        ? foodCategories.find(
                            (c) => c.value === filters.category
                          )?.label
                        : "Category"}
                      <ChevronDown className="w-4 h-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-35 bg-white border-gray-100 shadow-2xl rounded-xl text-darkgray py-4"
                  >
                    <DropdownMenuItem
                      className="text-primary font-medium flex justify-center"
                      onClick={() => handleCategoryChange(null)}
                    >
                      Reset
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-200" />
                    {[...foodCategories]
                      .sort((a, b) => a.label.localeCompare(b.label))
                      .map((option) => (
                        <DropdownMenuItem
                          key={option.value}
                          className={
                            filters.category === option.value ? "bg-accent" : ""
                          }
                          onClick={() => handleCategoryChange(option.value)}
                        >
                          {option.label}
                        </DropdownMenuItem>
                      ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* FAVOURITE */}
                <Button
                  variant="outline"
                  className="rounded-full whitespace-nowrap text-[12px] font-light py-1 h-7 border-none bg-secondary hover:bg-secondary/80"
                >
                  Favorite
                </Button>

                {/* LOCATION */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="rounded-full whitespace-nowrap text-[12px] font-light py-1 h-7 border-none bg-secondary hover:bg-secondary/80 mr-2"
                    >
                      {filters.location
                        ? states.find((s) => s.value === filters.location)
                            ?.label
                        : "Location"}
                      <ChevronDown className="w-4 h-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-35 bg-white border-gray-100 shadow-2xl rounded-xl text-darkgray py-4 mr-2"
                  >
                    <DropdownMenuItem
                      className="text-primary font-medium flex justify-center"
                      onClick={() => handleLocationChange(null)}
                    >
                      Reset
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-200" />
                    {states.map((state) => (
                      <DropdownMenuItem
                        key={state.value}
                        className={
                          filters.location === state.value ? "bg-accent" : ""
                        }
                        onClick={() => handleLocationChange(state.value)}
                      >
                        {state.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
