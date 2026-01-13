import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  PerspectiveCamera,
  Html,
  Text,
} from "@react-three/drei";
import * as THREE from "three";
import { Home } from "lucide-react";

// Shared map constants
const MAP_TILE_SIZE = 2;
const MAP_GRID_SIZE = 100;
const MAP_TOTAL_SIZE = MAP_TILE_SIZE * MAP_GRID_SIZE;
const MAP_HALF_SIZE = MAP_TOTAL_SIZE / 2;
const METERS_PER_UNIT = 100; // 1 unit in scene ≈ 100 meters in real life
const MAP_SAFE_BORDER = MAP_HALF_SIZE - 5;

// Sky dome removed - using 2D background instead

// Simple seeded random function for deterministic values
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Monster Hunter Now style tiled ground with grid lines
function MapGround() {
  const groundRef = useRef();
  const totalSize = MAP_TOTAL_SIZE;
  const groundRadius = totalSize * 1.75; // Make ground much larger and circular

  return (
    <group ref={groundRef}>
      {/* Main smooth green ground - circular */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[groundRadius, 64]} />
        <meshStandardMaterial
          color="#a5d6a7"
          wireframe={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Low poly hills/mounds - evenly distributed */}
      {Array.from({ length: 46 }).map((_, i) => {
        // Use golden angle spiral for even distribution
        const goldenAngle = Math.PI * (3 - Math.sqrt(5));
        const angle = i * goldenAngle;
        const radius = 20 + (i / 46) * 300; // Spread from 20 to 320 units
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const height = 0.6 + (seededRandom(i * 7) * 0.6); // Height between 0.6 and 1.2
        const size = 3.5 + (seededRandom(i * 11) * 2.5); // Size between 3.5 and 6
        return (
          <mesh key={`hill-${i}`} position={[x, height / 2, z]}>
            <coneGeometry args={[size, height, 8]} />
            <meshStandardMaterial color="#81c784" flatShading />
          </mesh>
        );
      })}

      {/* Water/pond features - evenly distributed */}
      {Array.from({ length: 48 }).map((_, i) => {
        // Use golden angle spiral for even distribution
        const goldenAngle = Math.PI * (3 - Math.sqrt(5));
        const angle = i * goldenAngle + Math.PI / 4; // Offset by 45 degrees from hills
        const radius = 25 + (i / 48) * 310; // Spread from 25 to 335 units
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const size = 2.5 + (seededRandom(i * 13) * 1.8); // Size between 2.5 and 4.3
        return (
          <mesh
            key={`water-${i}`}
            position={[x, 0.03, z]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <circleGeometry args={[size, 16]} />
            <meshStandardMaterial
              color="#64b5f6"
              flatShading
              transparent
              opacity={0.6}
            />
          </mesh>
        );
      })}

      {/* Rocky areas - evenly distributed */}
      {Array.from({ length: 56 }).map((_, i) => {
        // Use golden angle spiral for even distribution
        const goldenAngle = Math.PI * (3 - Math.sqrt(5));
        const angle = i * goldenAngle + Math.PI / 2; // Offset by 90 degrees from hills
        const radius = 15 + (i / 56) * 305; // Spread from 15 to 320 units
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const size = 1.7 + (seededRandom(i * 17) * 1.2); // Size between 1.7 and 2.9
        return (
          <mesh key={`rock-${i}`} position={[x, 0.15, z]}>
            <dodecahedronGeometry args={[size, 0]} />
            <meshStandardMaterial color="#78909c" flatShading />
          </mesh>
        );
      })}

      {/* Decorative terrain details - small bushes/patches - evenly distributed */}
      {Array.from({ length: 100 }).map((_, i) => {
        // Use golden angle spiral for even distribution
        const goldenAngle = Math.PI * (3 - Math.sqrt(5));
        const angle = i * goldenAngle + Math.PI / 3; // Offset by 60 degrees
        const radius = 10 + (i / 100) * 330; // Spread from 10 to 340 units
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        return (
          <mesh key={`bush-${i}`} position={[x, 0.05, z]}>
            <sphereGeometry args={[0.5, 6, 6]} />
            <meshStandardMaterial color="#66bb6a" flatShading />
          </mesh>
        );
      })}

      {/* Trees - low poly style - evenly distributed */}
      {Array.from({ length: 65 }).map((_, i) => {
        // Use golden angle spiral for even distribution
        const goldenAngle = Math.PI * (3 - Math.sqrt(5));
        const angle = i * goldenAngle + Math.PI / 6; // Offset by 30 degrees
        const radius = 20 + (i / 65) * 320; // Spread from 20 to 340 units
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        return (
          <group key={`tree-${i}`} position={[x, 0, z]}>
            {/* Tree trunk */}
            <mesh position={[0, 0.3, 0]}>
              <cylinderGeometry args={[0.15, 0.15, 0.6, 8]} />
              <meshStandardMaterial color="#8b4513" flatShading />
            </mesh>
            {/* Tree foliage */}
            <mesh position={[0, 0.7, 0]}>
              <coneGeometry args={[0.4, 0.6, 6]} />
              <meshStandardMaterial color="#4a7c59" flatShading />
            </mesh>
          </group>
        );
      })}

      {/* Small decorative stones scattered around - evenly distributed */}
      {Array.from({ length: 55 }).map((_, i) => {
        // Use golden angle spiral for even distribution
        const goldenAngle = Math.PI * (3 - Math.sqrt(5));
        const angle = i * goldenAngle + Math.PI / 5; // Offset by 36 degrees
        const radius = 18 + (i / 55) * 322; // Spread from 18 to 340 units
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        return (
          <mesh key={`stone-${i}`} position={[x, 0.08, z]}>
            <octahedronGeometry args={[0.3, 0]} />
            <meshStandardMaterial color="#9e9e9e" flatShading />
          </mesh>
        );
      })}
    </group>
  );
}

function latLngToScenePosition(lat, lng, referenceLat, referenceLng) {
  if (
    typeof lat !== "number" ||
    typeof lng !== "number" ||
    typeof referenceLat !== "number" ||
    typeof referenceLng !== "number"
  ) {
    return null;
  }

  const earthRadiusMeters = 6371000; // approximate Earth radius
  const deltaLatRad = THREE.MathUtils.degToRad(lat - referenceLat);
  const deltaLngRad = THREE.MathUtils.degToRad(lng - referenceLng);
  const meanLatRad = THREE.MathUtils.degToRad((lat + referenceLat) / 2);

  const zMeters = deltaLatRad * earthRadiusMeters;
  const xMeters = deltaLngRad * earthRadiusMeters * Math.cos(meanLatRad);

  return {
    x: THREE.MathUtils.clamp(
      xMeters / METERS_PER_UNIT,
      -MAP_SAFE_BORDER,
      MAP_SAFE_BORDER
    ),
    // Negative so that north appears upward (matching standard maps)
    z: THREE.MathUtils.clamp(
      -zMeters / METERS_PER_UNIT,
      -MAP_SAFE_BORDER,
      MAP_SAFE_BORDER
    ),
  };
}

// Different shop types - 6 different styles for up to 6 locations
// Currently unused but kept for future shop type variations
// const SHOP_TYPES = [
//   {
//     name: "restaurant",
//     baseColor: "#ef4444",
//     roofColor: "#dc2626",
//     accentColor: "#fbbf24",
//   },
//   {
//     name: "cafe",
//     baseColor: "#8b5cf6",
//     roofColor: "#7c3aed",
//     accentColor: "#fbbf24",
//   },
//   {
//     name: "bistro",
//     baseColor: "#f59e0b",
//     roofColor: "#d97706",
//     accentColor: "#ffffff",
//   },
//   {
//     name: "diner",
//     baseColor: "#ec4899",
//     roofColor: "#db2777",
//     accentColor: "#fbbf24",
//   },
//   {
//     name: "eatery",
//     baseColor: "#10b981",
//     roofColor: "#059669",
//     accentColor: "#ffffff",
//   },
//   {
//     name: "grill",
//     baseColor: "#6366f1",
//     roofColor: "#4f46e5",
//     accentColor: "#fbbf24",
//   },
// ];

// Banner component to show restaurant info above shop
function ShopBanner({ restaurant, distance, onBannerClick }) {
  const bannerRef = useRef();
  const bannerGroupRef = useRef();

  useFrame((state) => {
    if (bannerRef.current && state.camera) {
      // Make banner always face the camera (billboard effect)
      bannerRef.current.lookAt(state.camera.position);
    }

    // Floating animation for banner
    if (bannerGroupRef.current) {
      const baseY = 2.2;
      bannerGroupRef.current.position.y =
        baseY + Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
    }
  });

  const handleBannerInteraction = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (onBannerClick) {
      onBannerClick();
    }
  };

  return (
    <group ref={bannerGroupRef} position={[0, 2.2, 0]}>
      <group ref={bannerRef}>
        <Html
          position={[0, 0, 0]}
          center
          transform
          occlude
          style={{
            pointerEvents: "auto",
            userSelect: "none",
            cursor: "pointer",
          }}
          onClick={handleBannerInteraction}
          onTouchStart={handleBannerInteraction}
        >
          <div 
            className="bg-primary rounded shadow-sm px-2 py-1.5 border border-primary/20 min-w-[160px] max-w-[200px] hover:shadow-md transition-shadow"
            onClick={handleBannerInteraction}
            onTouchStart={handleBannerInteraction}
          >
            <div className="text-[11px] font-bold text-white truncate">
              {restaurant.name || "Restaurant"}
            </div>
            <div className="flex items-center justify-between mt-1 gap-1.5">
              <span className="text-[10px] text-primary bg-white px-1.5 py-0.5 rounded">
                {restaurant.cuisine_type || "Food"}
              </span>
              {distance !== null && (
                <span className="text-[10px] font-semibold text-white">
                  {distance.toFixed(1)} km
                </span>
              )}
            </div>
          </div>
        </Html>
      </group>
    </group>
  );
}

// Coffee shop style building (like the image)
function AnimatedShop({
  position,
  index,
  restaurant,
  userLocation,
  onShopClick,
}) {
  const groupRef = useRef();
  const signRef = useRef();

  useFrame((state) => {
    // Removed floating animation - store stays in place
    if (signRef.current) {
      // Subtle sign animation
      signRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 1.5 + index) * 0.05;
    }
  });

  // Calculate distance if userLocation and restaurant coordinates are available
  let distance = null;
  if (userLocation && restaurant?.latitude && restaurant?.longitude) {
    const R = 6371; // Earth's radius in km
    const dLat = ((restaurant.latitude - userLocation.lat) * Math.PI) / 180;
    const dLon = ((restaurant.longitude - userLocation.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((userLocation.lat * Math.PI) / 180) *
        Math.cos((restaurant.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    distance = R * c;
  } else if (restaurant?.distance) {
    // Use pre-calculated distance if available
    distance = restaurant.distance;
  }

  const handleClick = (e) => {
    e.stopPropagation();
    if (onShopClick) {
      onShopClick(position);
    }
  };

  return (
    <group
      position={position}
      ref={groupRef}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "default";
      }}
    >
      {/* Banner above shop */}
      {restaurant && (
        <ShopBanner
          restaurant={restaurant}
          distance={distance}
          onBannerClick={() => {
            if (onShopClick) {
              onShopClick(position);
            }
          }}
        />
      )}

      {/* Ground shadow for better definition */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.2, 32]} />
        <meshStandardMaterial color="#000000" transparent opacity={0.25} />
      </mesh>

      {/* Main building - single storey white facade - made bigger */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 1.0, 1.2]} />
        <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.7} />
      </mesh>

      {/* Building edges/trim for definition */}
      <mesh position={[-0.75, 0.5, 0.6]}>
        <boxGeometry args={[0.02, 1.0, 0.02]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>
      <mesh position={[0.75, 0.5, 0.6]}>
        <boxGeometry args={[0.02, 1.0, 0.02]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>
      <mesh position={[0, 0.5, 0.6]}>
        <boxGeometry args={[1.5, 0.02, 0.02]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>
      <mesh position={[0, 1.0, 0.6]}>
        <boxGeometry args={[1.5, 0.02, 0.02]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>

      {/* Red roof - bigger */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <boxGeometry args={[1.6, 0.15, 1.3]} />
        <meshStandardMaterial color="#dc2626" metalness={0.2} roughness={0.6} />
      </mesh>

      {/* Shop banner above door and window */}
      <mesh position={[0, 1.15, 0.65]} castShadow>
        <boxGeometry args={[1.0, 0.35, 0.08]} />
        <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.7} />
      </mesh>
      {/* Banner border/frame */}
      <mesh position={[0, 1.15, 0.69]}>
        <boxGeometry args={[1.04, 0.39, 0.02]} />
        <meshStandardMaterial color="#ffffff" metalness={0.2} roughness={0.6} />
      </mesh>
      {/* Banner mounting brackets */}
      <mesh position={[-0.52, 1.15, 0.65]}>
        <boxGeometry args={[0.04, 0.35, 0.08]} />
        <meshStandardMaterial color="#ffffff" metalness={0.2} roughness={0.6} />
      </mesh>
      <mesh position={[0.52, 1.15, 0.65]}>
        <boxGeometry args={[0.04, 0.35, 0.08]} />
        <meshStandardMaterial color="#ffffff" metalness={0.2} roughness={0.6} />
      </mesh>
      {/* Banner text */}
      <Text
        position={[0, 1.15, 0.72]}
        fontSize={0.25}
        color="#1f2937"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#ffffff"
      >
        STALL
      </Text>

      {/* Primary color door - bigger and more visible */}
      <mesh position={[-0.4, 0.4, 0.62]} castShadow>
        <boxGeometry args={[0.45, 0.8, 0.05]} />
        <meshStandardMaterial color="#ffa500" metalness={0.2} roughness={0.7} />
      </mesh>
      {/* Door frame */}
      <mesh position={[-0.4, 0.4, 0.65]}>
        <boxGeometry args={[0.48, 0.82, 0.02]} />
        <meshStandardMaterial color="#e69500" metalness={0.3} roughness={0.6} />
      </mesh>
      {/* Door handle */}
      <mesh position={[-0.22, 0.4, 0.66]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Window frame */}
      <mesh position={[0.3, 0.58, 0.62]} castShadow>
        <boxGeometry args={[0.7, 0.45, 0.05]} />
        <meshStandardMaterial color="#1e40af" metalness={0.3} roughness={0.5} />
      </mesh>
      {/* Window glass - transparent */}
      <mesh position={[0.3, 0.58, 0.65]}>
        <boxGeometry args={[0.65, 0.4, 0.02]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.1}
          metalness={0.0}
          roughness={0.0}
        />
      </mesh>
      {/* Window cross frame */}
      <mesh position={[0.3, 0.58, 0.66]}>
        <boxGeometry args={[0.025, 0.45, 0.01]} />
        <meshStandardMaterial color="#1e40af" metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[0.3, 0.58, 0.66]}>
        <boxGeometry args={[0.7, 0.025, 0.01]} />
        <meshStandardMaterial color="#1e40af" metalness={0.4} roughness={0.4} />
      </mesh>

      {/* Spot letter indicator on roof - bigger */}
      <mesh position={[0.5, 1.3, 0]} castShadow>
        <boxGeometry args={[0.4, 0.4, 0.15]} />
        <meshStandardMaterial color="#ffffff" metalness={0.2} roughness={0.6} />
      </mesh>
    </group>
  );
}

// Character/Player marker - Better design
function PlayerMarker({ position }) {
  const markerRef = useRef();

  useFrame((state) => {
    if (markerRef.current) {
      // Gentle pulsing animation
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      markerRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group position={position} ref={markerRef}>
      {/* Base circle/platform */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.8, 64]} />
        <meshStandardMaterial color="#3b82f6" transparent opacity={0.3} />
      </mesh>

      {/* Outer ring */}
      <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 1.0, 64]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>

      {/* Pin/Arrow pointing up */}
      <mesh position={[0, 0.4, 0]}>
        <coneGeometry args={[0.15, 0.6, 32]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>

      {/* Pin head */}
      <mesh position={[0, 0.75, 0]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Inner glow */}
      <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.5, 64]} />
        <meshStandardMaterial color="#60a5fa" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

// Camera controller component to handle reset functionality and zoom to shop
function CameraController({ onResetReady, onZoomReady, controlsRef }) {
  const { camera } = useThree();
  const isAnimatingRef = useRef(false);
  const animationStartRef = useRef(null);
  const startPositionRef = useRef(null);
  const startTargetRef = useRef(null);
  const targetPositionRef = useRef(null);
  const targetTargetRef = useRef(null);

  const animateCamera = (targetPos, targetLookAt) => {
    if (!controlsRef.current || isAnimatingRef.current) return;

    // Store starting values
    startPositionRef.current = camera.position.clone();
    startTargetRef.current = controlsRef.current.target.clone();
    targetPositionRef.current = targetPos.clone();
    targetTargetRef.current = targetLookAt.clone();
    animationStartRef.current = Date.now();
    isAnimatingRef.current = true;
  };

  const resetCamera = () => {
    const homePosition = new THREE.Vector3(12, 10, 12);
    const homeTarget = new THREE.Vector3(0, 0, 0);
    animateCamera(homePosition, homeTarget);
  };

  const zoomToShop = (shopPosition) => {
    // Convert position array to Vector3 if needed
    const shopPos = Array.isArray(shopPosition)
      ? new THREE.Vector3(shopPosition[0], shopPosition[1], shopPosition[2])
      : shopPosition;

    // Calculate direction from shop to current camera position
    const directionToCamera = new THREE.Vector3().subVectors(
      camera.position,
      shopPos
    );

    const currentDistance = directionToCamera.length();

    // If camera is too close or direction is invalid, use default angle
    if (currentDistance < 0.1) {
      // Default viewing angle: slightly elevated and offset
      directionToCamera.set(3, 4, 3).normalize();
    } else {
      directionToCamera.normalize();
    }

    // Calculate zoom distance - closer to the shop but maintaining perspective
    // Use a fraction of current distance (e.g., 30-40% of current distance)
    const zoomDistance = Math.max(3, currentDistance * 0.35);

    // Calculate zoom position maintaining the same viewing angle from current perspective
    const zoomPosition = new THREE.Vector3()
      .copy(shopPos)
      .add(directionToCamera.multiplyScalar(zoomDistance));

    // Ensure minimum height for good viewing angle
    if (zoomPosition.y < 2) {
      zoomPosition.y = 2;
    }

    // Target is the shop center (slightly above ground where banner is)
    const zoomTarget = new THREE.Vector3(
      shopPos.x,
      shopPos.y + 2.2, // Look at banner height (banner is at y=2.2)
      shopPos.z
    );

    animateCamera(zoomPosition, zoomTarget);
  };

  useFrame(() => {
    if (!isAnimatingRef.current || !controlsRef.current) return;

    const duration = 1000; // 1 second animation
    const elapsed = Date.now() - animationStartRef.current;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function (ease-in-out)
    const eased =
      progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

    // Interpolate position
    camera.position.lerpVectors(
      startPositionRef.current,
      targetPositionRef.current,
      eased
    );

    // Interpolate target
    controlsRef.current.target.lerpVectors(
      startTargetRef.current,
      targetTargetRef.current,
      eased
    );
    controlsRef.current.update();

    if (progress >= 1) {
      isAnimatingRef.current = false;
    }
  });

  useEffect(() => {
    if (onResetReady) {
      onResetReady(resetCamera);
    }
    if (onZoomReady) {
      onZoomReady(zoomToShop);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onResetReady, onZoomReady]);

  return null;
}

// Subtle fog component for horizon fade effect
function SceneFog() {
  const { scene } = useThree();
  
  useEffect(() => {
    // Add subtle exponential fog for a gentle fade at the horizon
    // Using a light cyan-blue color that matches the sky gradient
    // Lower density (0.004) pushes the fog effect farther out
    const fog = new THREE.FogExp2(0xb0e0e6, 0.004);
    scene.fog = fog;
    
    return () => {
      scene.fog = null;
    };
  }, [scene]);
  
  return null;
}

// Main scene component
function SceneContent({ restaurants, userLocation, onZoomToShop }) {
  const lightRef = useRef();

  useFrame((state) => {
    if (lightRef.current) {
      lightRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.5) * 5;
      lightRef.current.position.z = Math.cos(state.clock.elapsedTime * 0.5) * 5;
    }
  });

  // Debug: Log restaurants count
  useEffect(() => {
    console.log("LowPolyScene - Restaurants count:", restaurants?.length || 0);
    console.log("LowPolyScene - Restaurants:", restaurants);
  }, [restaurants]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        ref={lightRef}
        position={[5, 10, 5]}
        intensity={0.8}
        castShadow
      />
      <pointLight position={[-5, 5, -5]} intensity={0.4} color="#fff8dc" />

      {/* Map-style Ground */}
      <MapGround />

      {/* Player marker at center */}
      <PlayerMarker position={[0, 0, 0]} />

      {/* Animated Shops - One per restaurant */}
      {restaurants && restaurants.length > 0 ? (
        restaurants.map((restaurant, index) => {
          let x = 0;
          let z = 0;

          if (
            userLocation?.lat &&
            userLocation?.lng &&
            restaurant?.latitude &&
            restaurant?.longitude
          ) {
            const position = latLngToScenePosition(
              restaurant.latitude,
              restaurant.longitude,
              userLocation.lat,
              userLocation.lng
            );

            if (position) {
              x = position.x;
              z = position.z;
            }
          }

          // Fallback circular placement if no coordinates available
          if (x === 0 && z === 0) {
            const angle =
              (index / Math.max(restaurants.length, 1)) * Math.PI * 2;
            const radius = 3 + (index % 3) * 0.5;
            x = Math.cos(angle) * radius;
            z = Math.sin(angle) * radius;
          }

          return (
            <AnimatedShop
              key={restaurant.id || `restaurant-${index}`}
              position={[x, 0, z]}
              index={index}
              restaurant={restaurant}
              userLocation={userLocation}
              onShopClick={onZoomToShop}
            />
          );
        })
      ) : (
        // Show test shops if no restaurants (for debugging)
        <>
          <AnimatedShop
            key="test-1"
            position={[3, 0, 0]}
            index={0}
            onShopClick={onZoomToShop}
          />
          <AnimatedShop
            key="test-2"
            position={[-3, 0, 0]}
            index={1}
            onShopClick={onZoomToShop}
          />
        </>
      )}
    </>
  );
}

export default function LowPolyScene({ restaurants = [], userLocation }) {
  const [isClient, setIsClient] = useState(false);
  const [hasZoomed, setHasZoomed] = useState(false);
  const resetCameraRef = useRef(null);
  const zoomToShopRef = useRef(null);
  const controlsRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleResetCamera = () => {
    if (resetCameraRef.current) {
      resetCameraRef.current();
    }
    // Reset zoom limit when Home button is clicked
    setHasZoomed(false);
  };

  const handleZoomToShop = (shopPosition) => {
    if (hasZoomed) {
      return; // Prevent zooming if already zoomed once
    }
    if (zoomToShopRef.current) {
      zoomToShopRef.current(shopPosition);
      setHasZoomed(true);
    }
  };

  if (!isClient) {
    return (
      <div className="w-full h-full bg-gradient-to-b from-blue-200 to-green-200 flex items-center justify-center">
        <div className="text-gray-600">Loading 3D scene...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full pointer-events-auto relative overflow-hidden">
      {/* 2D Pokemon Go style sky background */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, #5B9BD5 0%, #6BB6FF 30%, #7EC8E3 60%, #B0E0E6 100%)',
        }}
      />
      
      <Canvas
        camera={{ position: [12, 10, 12], fov: 55 }}
        gl={{ antialias: true, alpha: true }}
        style={{ touchAction: "none", position: 'relative', zIndex: 1, background: 'transparent' }}
      >

        <PerspectiveCamera makeDefault position={[12, 10, 12]} />
        <OrbitControls
          ref={controlsRef}
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          panSpeed={1.0}
          zoomSpeed={1.0}
          rotateSpeed={0.5}
          screenSpacePanning={false}
          mouseButtons={{
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN,
          }}
          touches={{
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.DOLLY_PAN,
          }}
          minDistance={3}
          maxDistance={60}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.2}
        />
        <CameraController
          onResetReady={(resetFn) => {
            resetCameraRef.current = resetFn;
          }}
          onZoomReady={(zoomFn) => {
            zoomToShopRef.current = zoomFn;
          }}
          controlsRef={controlsRef}
        />
        <SceneFog />
        <SceneContent
          restaurants={restaurants}
          userLocation={userLocation}
          onZoomToShop={handleZoomToShop}
        />
      </Canvas>

      {/* Translucent Home Button */}
      <button
        onClick={handleResetCamera}
        className="absolute top-18 right-4 z-[100] bg-white/80 backdrop-blur-md rounded-full p-3.5 shadow-xl hover:bg-white/95 transition-all duration-200 active:scale-95 pointer-events-auto border border-white/50"
        aria-label="Return to player marker"
      >
        <Home className="w-5 h-5 text-gray-800" />
      </button>
    </div>
  );
}
