import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Navigation, Radius } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ExploreModal({ open, onOpenChange }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchRadius, setSearchRadius] = useState(5);

  // Suggested destinations
  const suggestedDestinations = [
    {
      id: "nearby",
      name: "Nearby",
      description: "Find what's around you",
      icon: <Navigation className="w-5 h-5" />,
      value: "nearby",
    },
  ];

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSearch = () => {
    navigate("/map-explore", {
      state: {
        location: selectedLocation,
        radius: searchRadius,
      },
    });
    onOpenChange(false);
  };

  const handleClearAll = () => {
    setSelectedLocation(null);
    setSearchQuery("");
    setSearchRadius(5);
  };

  const handleDestinationClick = (destination) => {
    setSelectedLocation(destination.value);
    setSearchQuery(destination.name);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[calc(100%-2rem)] max-h-[90vh] bg-white rounded-3xl p-0 flex flex-col fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 data-[state=closed]:scale-95 data-[state=closed]:opacity-0 [&>button]:hidden border-none">
        <DialogHeader className="px-6 pt-6 relative">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold text-black">
                Where?
              </DialogTitle>
              <DialogDescription className="sr-only">
                Search for restaurants by location and set your search radius
              </DialogDescription>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center transition-colors z-10"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto no-scrollbar px-6 py-4">
          {/* Search Input */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search locations"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 rounded-xl border-gray-100 text-sm font-light"
              />
            </div>
          </div>

          {/* Suggested Destinations */}
          <div className="space-y-1">
            {suggestedDestinations.map((destination) => (
              <button
                key={destination.id}
                onClick={() => handleDestinationClick(destination)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-colors text-left ${
                  selectedLocation === destination.value
                    ? "bg-gray-100"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="text-gray-600 flex-shrink-0">
                  {destination.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {destination.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {destination.description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Search Radius Section */}
          <div className="w-full flex items-start gap-4 px-4 py-3 rounded-xl transition-colors">
            <div className="text-gray-600 flex-shrink-0 mt-0.5">
              <Radius className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 mb-1">
                Search radius
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Distance from your location
              </p>
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className="text-lg font-semibold text-gray-900">
                    {searchRadius} km
                  </div>
                </div>
                <div className="relative h-2">
                  <style>{`
                    input[type="range"] {
                      -webkit-appearance: none;
                      appearance: none;
                      background: transparent;
                      cursor: pointer;
                    }
                    input[type="range"]::-webkit-slider-thumb {
                      -webkit-appearance: none;
                      appearance: none;
                      height: 20px;
                      width: 20px;
                      border-radius: 50%;
                      background: white;
                      border: 2px solid #000;
                      cursor: pointer;
                      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    }
                    input[type="range"]::-moz-range-thumb {
                      height: 20px;
                      width: 20px;
                      border-radius: 50%;
                      background: white;
                      border: 2px solid #000;
                      cursor: pointer;
                      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    }
                  `}</style>
                  {/* Background track */}
                  <div className="absolute w-full h-2 bg-gray-200 rounded-lg"></div>
                  {/* Active range */}
                  <div
                    className="absolute h-2 bg-black rounded-lg"
                    style={{
                      width: `${(searchRadius / 30) * 100}%`,
                    }}
                  ></div>
                  {/* Radius slider */}
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={searchRadius}
                    onChange={(e) => {
                      setSearchRadius(Number(e.target.value));
                    }}
                    className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer z-10"
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>1 km</span>
                  <span>30 km</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="px-6 py-4 border-t border-gray-200 space-y-3">
          <button
            onClick={handleClearAll}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors w-full text-left"
          >
            Clear all
          </button>
          <Button
            onClick={handleSearch}
            className="w-full h-12 bg-primary text-white hover:bg-primary-hover/90 rounded-xl shadow-xl font-medium"
          >
            Search
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

