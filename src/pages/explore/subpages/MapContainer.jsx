import { useEffect, useState } from "react";

// Dynamically import Leaflet to avoid SSR issues
let MapContainerLeaflet = null;

export default function MapContainer({
  center,
  restaurants,
  onRestaurantSelect,
  radius,
}) {
  const [isClient, setIsClient] = useState(false);
  const [MapComponent, setMapComponent] = useState(null);

  useEffect(() => {
    setIsClient(true);
    
    // Dynamically import the Leaflet component
    import("./MapContainerLeaflet").then((module) => {
      setMapComponent(() => module.default);
    });
  }, []);

  if (!isClient || !MapComponent) {
    return (
      <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  return (
    <div
      key={`map-wrapper-${center.lat}-${center.lng}`}
      className="w-full h-full"
    >
      <MapComponent
        center={center}
        restaurants={restaurants}
        onRestaurantSelect={onRestaurantSelect}
        radius={radius}
      />
    </div>
  );
}

