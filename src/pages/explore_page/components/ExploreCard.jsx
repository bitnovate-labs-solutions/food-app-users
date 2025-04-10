import { useState } from "react";
import { useNavigate } from "react-router-dom";

// COMPONENTS
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Star, MapPin, Clock, Users } from "lucide-react";

export default function ExploreCard({ item }) {
  const [isLiked, setIsLiked] = useState(false);
  // const [hasJoined, setHasJoined] = useState(false);
  const navigate = useNavigate();

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleJoin = () => {
    navigate("/auth", { state: { mode: "signup" } });
  };

  const handlePay = () => {
    navigate("/auth", { state: { mode: "signup" } });
  };

  // Format the date to display as "Feb 22, 2025"
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card className="overflow-hidden mb-6 bg-white rounded-xl hover:shadow-lg transition-all duration-300 border border-gray-100">
      {/* Card Header with Image */}
      <div className="relative w-full h-[200px] group">
        <img
          src={item.image_url}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Top Labels */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <div className="flex gap-2">
            <span className="bg-primary/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
              {item.cuisine_type}
            </span>
            <span className="bg-black/30 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
              {item.category}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full"
            onClick={handleLike}
          >
            <Heart
              className={`h-5 w-5 ${
                isLiked ? "text-red-500 fill-red-500" : "text-white"
              }`}
            />
          </Button>
        </div>

        {/* Restaurant Info */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-2xl font-bold text-white mb-2">{item.name}</h3>
          <div className="flex items-center gap-4 text-white/90 text-sm">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{item.rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{item.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatDate(item.created_at)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="p-4 bg-white">
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {item.description}
        </p>

        <div className="flex justify-between items-center gap-4">
          {/* TREATERS SECTION */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-medium text-gray-700">Treaters</h4>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 px-3 py-1.5 rounded-xl w-[72px] text-center">
                <span className="text-primary text-sm font-medium">
                  3 joined
                </span>
              </div>
              <Button
                variant="primary"
                size="sm"
                className="bg-primary text-white hover:bg-primary/90 rounded-full flex-1"
                onClick={handlePay}
              >
                Buy
              </Button>
            </div>
          </div>

          {/* Treatee Section */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-red-500" />
              <h4 className="text-sm font-medium text-gray-700">Treatee</h4>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-red-50 px-3 py-1.5 rounded-xl w-[72px] text-center">
                <span className="text-red-500 text-sm font-medium">
                  20 spots
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-primary text-primary hover:bg-primary/10 rounded-full flex-1"
                onClick={handleJoin}
              >
                Join
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
