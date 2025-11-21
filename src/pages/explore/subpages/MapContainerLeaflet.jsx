import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom marker icons - Google Maps/Airbnb style
const createCustomIcon = (color = "#F59E0B") => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        position: relative;
        width: 40px;
        height: 40px;
      ">
        <!-- Shadow -->
        <div style="
          position: absolute;
          bottom: -2px;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 8px;
          background: rgba(0,0,0,0.2);
          border-radius: 50%;
          filter: blur(4px);
        "></div>
        <!-- Marker pin -->
        <div style="
          position: relative;
          width: 40px;
          height: 40px;
          background-color: ${color};
          border: 3px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            transform: rotate(45deg);
            font-size: 18px;
            color: white;
            font-weight: bold;
          ">🍽️</div>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

// User location marker - Minimalist modern style with subtle pulse
const userLocationIcon = L.divIcon({
  className: "user-location-marker",
  html: `
    <div style="
      position: relative;
      width: 24px;
      height: 24px;
    ">
      <!-- Subtle pulsing ring -->
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 24px;
        height: 24px;
        background-color: #3B82F6;
        border-radius: 50%;
        opacity: 0.2;
        animation: subtlePulse 2.5s ease-in-out infinite;
      "></div>
      <!-- Inner dot -->
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 12px;
        height: 12px;
        background-color: #3B82F6;
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      "></div>
    </div>
    <style>
      @keyframes subtlePulse {
        0%, 100% {
          transform: translate(-50%, -50%) scale(1);
          opacity: 0.2;
        }
        50% {
          transform: translate(-50%, -50%) scale(1.8);
          opacity: 0;
        }
      }
    </style>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

export default function MapContainerLeaflet({
  center,
  restaurants,
  onRestaurantSelect,
  radius,
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const circleRef = useRef(null);
  const markersRef = useRef([]);

  // Calculate zoom level based on radius (km)
  // Larger radius = lower zoom, smaller radius = higher zoom
  const calculateZoom = (radiusKm) => {
    if (radiusKm <= 1) return 15;
    if (radiusKm <= 3) return 14;
    if (radiusKm <= 5) return 13;
    if (radiusKm <= 10) return 12;
    if (radiusKm <= 20) return 11;
    if (radiusKm <= 30) return 10;
    return 9;
  };

  // Initialize map (only once)
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) {
      return;
    }

    // Create new map instance
    const map = L.map(mapRef.current, {
      center: [center.lat, center.lng],
      zoom: calculateZoom(radius),
      zoomControl: false,
      scrollWheelZoom: true,
      attributionControl: false,
    });

    // Add Google Maps-like tile layer (CartoDB Positron - clean, modern, Google-like)
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update center location
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    map.setView([center.lat, center.lng], calculateZoom(radius));
  }, [center.lat, center.lng, radius]);

  // Update radius circle and zoom
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Remove existing circle
    if (circleRef.current) {
      map.removeLayer(circleRef.current);
    }

    // Add new search radius circle
    const circle = L.circle([center.lat, center.lng], {
      radius: radius * 1000, // Convert km to meters
      color: "#3B82F6",
      fillColor: "#3B82F6",
      fillOpacity: 0.1,
      weight: 2,
    }).addTo(map);

    circleRef.current = circle;

    // Update zoom to fit the radius
    const zoom = calculateZoom(radius);
    map.setZoom(zoom);
  }, [radius, center.lat, center.lng]);

  // Update user location marker
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Remove existing user marker if any
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker && layer.options.icon === userLocationIcon) {
        map.removeLayer(layer);
      }
    });

    // Add user location marker
    const userMarker = L.marker([center.lat, center.lng], {
      icon: userLocationIcon,
    }).addTo(map);

    userMarker.bindPopup(
      '<div style="padding: 8px; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif;"><h3 style="font-size: 14px; font-weight: 600; margin: 0; color: #1f2937;">Your Location</h3></div>',
      { className: "custom-popup" }
    );
  }, [center.lat, center.lng]);

  // Update restaurant markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Remove existing restaurant markers
    markersRef.current.forEach((marker) => {
      map.removeLayer(marker);
    });
    markersRef.current = [];

    // Add restaurant markers
    restaurants.forEach((restaurant) => {
      // Get restaurant coordinates
      const lat = restaurant.coordinates?.lat || restaurant.current_latitude || restaurant.latitude || center.lat;
      const lng = restaurant.coordinates?.lng || restaurant.current_longitude || restaurant.longitude || center.lng;

      // Use custom icon for all restaurants
      const marker = L.marker([lat, lng], {
        icon: createCustomIcon("#F59E0B"),
      }).addTo(map);

      const hasPrice = restaurant.averagePrice !== null && restaurant.averagePrice !== undefined;
      const rating = restaurant.rating ? parseFloat(restaurant.rating).toFixed(1) : null;
      const popupContent = `
        <div style="
          padding: 12px;
          max-width: 250px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        ">
          <h3 style="
            font-size: 16px;
            font-weight: 600;
            margin: 0 0 6px 0;
            color: #1f2937;
          ">${restaurant.name || "Restaurant"}</h3>
          ${rating ? `
            <div style="
              display: flex;
              align-items: center;
              gap: 4px;
              margin-bottom: 6px;
            ">
              <span style="
                color: #f59e0b;
                font-size: 14px;
              ">★</span>
              <span style="
                font-size: 14px;
                font-weight: 500;
                color: #374151;
              ">${rating}</span>
            </div>
          ` : ""}
          <p style="
            font-size: 13px;
            color: #6b7280;
            margin: 0 0 6px 0;
          ">${restaurant.cuisine_type || ""} ${restaurant.food_category ? `• ${restaurant.food_category}` : ""}</p>
          ${restaurant.address ? `
            <p style="
              font-size: 12px;
              color: #9ca3af;
              margin: 0 0 8px 0;
              line-height: 1.4;
            ">${restaurant.address}</p>
          ` : ""}
          ${hasPrice ? `
            <p style="
              font-size: 14px;
              font-weight: 600;
              color: #111827;
              margin: 8px 0 0 0;
              padding-top: 8px;
              border-top: 1px solid #e5e7eb;
            ">Avg. Price: RM${parseFloat(restaurant.averagePrice || 0).toFixed(2)}</p>
          ` : ""}
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: "custom-popup",
        maxWidth: 280,
        closeButton: true,
      });

      marker.on("click", () => {
        if (onRestaurantSelect) {
          onRestaurantSelect(restaurant);
        }
      });

      // Open popup on hover for better UX (like Google Maps)
      marker.on("mouseover", function() {
        this.openPopup();
      });

      markersRef.current.push(marker);
    });
  }, [restaurants, center.lat, center.lng, onRestaurantSelect]);

  return (
    <>
      <style>{`
        .leaflet-control-attribution {
          display: none !important;
        }
        .leaflet-attribution-flag {
          display: none !important;
        }
        /* Google Maps/Airbnb style popup */
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          padding: 0;
          overflow: hidden;
        }
        .custom-popup .leaflet-popup-content {
          margin: 0;
        }
        .custom-popup .leaflet-popup-tip {
          background: white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .custom-popup .leaflet-popup-close-button {
          padding: 8px;
          font-size: 18px;
          color: #6b7280;
          font-weight: 300;
        }
        .custom-popup .leaflet-popup-close-button:hover {
          color: #111827;
        }
        /* Smooth marker animations */
        .custom-marker {
          transition: transform 0.2s ease;
        }
        .custom-marker:hover {
          transform: scale(1.1);
          z-index: 1000;
        }
      `}</style>
      <div
        ref={mapRef}
        className="w-full h-full z-0"
        style={{ height: "100%", width: "100%" }}
      />
    </>
  );
}

