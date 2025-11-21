import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Html } from "@react-three/drei";
import * as THREE from "three";

// Shared map constants
const MAP_TILE_SIZE = 2;
const MAP_GRID_SIZE = 100;
const MAP_TOTAL_SIZE = MAP_TILE_SIZE * MAP_GRID_SIZE;
const MAP_HALF_SIZE = MAP_TOTAL_SIZE / 2;
const METERS_PER_UNIT = 100; // 1 unit in scene ≈ 100 meters in real life
const MAP_SAFE_BORDER = MAP_HALF_SIZE - 5;

// Monster Hunter Now style tiled ground with grid lines
function MapGround() {
  const groundRef = useRef();
  const tileSize = MAP_TILE_SIZE;
  const gridSize = MAP_GRID_SIZE;
  const totalSize = MAP_TOTAL_SIZE;

  return (
    <group ref={groundRef}>
      {/* Main tiled ground base - light blue/off-white with segments for grid effect */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[totalSize, totalSize, gridSize, gridSize]} />
        <meshStandardMaterial 
          color="#e8f4f8" 
          flatShading
          wireframe={false}
        />
      </mesh>
      
      {/* Grid lines - faint pink/purple using thin planes */}
      <group>
        {/* Horizontal grid lines */}
        {Array.from({ length: gridSize + 1 }).map((_, i) => {
          const z = (i - gridSize / 2) * tileSize;
          return (
            <mesh
              key={`grid-h-${i}`}
              position={[0, 0.02, z]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[totalSize, 0.01]} />
              <meshStandardMaterial 
                color="#d8a8e8" 
                flatShading
                transparent
                opacity={0.3}
              />
            </mesh>
          );
        })}
        
        {/* Vertical grid lines */}
        {Array.from({ length: gridSize + 1 }).map((_, i) => {
          const x = (i - gridSize / 2) * tileSize;
          return (
            <mesh
              key={`grid-v-${i}`}
              position={[x, 0.02, 0]}
              rotation={[-Math.PI / 2, 0, Math.PI / 2]}
            >
              <planeGeometry args={[totalSize, 0.01]} />
              <meshStandardMaterial 
                color="#d8a8e8" 
                flatShading
                transparent
                opacity={0.3}
              />
            </mesh>
          );
        })}
      </group>
      
      {/* Subtle tile pattern using alternating colored patches */}
      {Array.from({ length: Math.floor(gridSize / 2) }).map((_, i) => {
        return Array.from({ length: Math.floor(gridSize / 2) }).map((_, j) => {
          const x = (i * 2 - gridSize / 2 + 1) * tileSize;
          const z = (j * 2 - gridSize / 2 + 1) * tileSize;
          const isEven = (i + j) % 2 === 0;
          return (
            <mesh
              key={`tile-patch-${i}-${j}`}
              position={[x, 0.01, z]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[tileSize * 1.8, tileSize * 1.8]} />
              <meshStandardMaterial 
                color={isEven ? "#e8f4f8" : "#f0f8fa"} 
                flatShading
                transparent
                opacity={0.6}
              />
            </mesh>
          );
        });
      })}
      
      {/* Map terrain features - grass patches */}
      {[
        { x: -16, z: -16, color: "#a5d6a7", size: 8 },
        { x: 16, z: -16, color: "#c8e6c9", size: 6 },
        { x: -16, z: 16, color: "#b2dfdb", size: 7 },
        { x: 16, z: 16, color: "#a5d6a7", size: 6 },
        { x: 0, z: -24, color: "#81c784", size: 5 },
        { x: 0, z: 24, color: "#a5d6a7", size: 5 },
        { x: -24, z: 0, color: "#c8e6c9", size: 5 },
        { x: 24, z: 0, color: "#a5d6a7", size: 5 },
      ].map((patch, i) => (
        <mesh
          key={`grass-patch-${i}`}
          position={[patch.x, 0.02, patch.z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[patch.size, patch.size]} />
          <meshStandardMaterial color={patch.color} flatShading transparent opacity={0.7} />
        </mesh>
      ))}
      
      {/* Low poly hills/mounds */}
      {[
        { x: -28, z: -28, height: 0.8, size: 5 },
        { x: 28, z: -28, height: 1.0, size: 4.5 },
        { x: -28, z: 28, height: 0.9, size: 5.5 },
        { x: 28, z: 28, height: 0.8, size: 4.8 },
        { x: -14, z: -32, height: 0.6, size: 3.5 },
        { x: 14, z: 32, height: 0.7, size: 3.8 },
        { x: -32, z: -14, height: 0.6, size: 3.5 },
        { x: 32, z: 14, height: 0.7, size: 3.8 },
      ].map((hill, i) => (
        <mesh
          key={`hill-${i}`}
          position={[hill.x, hill.height / 2, hill.z]}
        >
          <coneGeometry args={[hill.size, hill.height, 8]} />
          <meshStandardMaterial color="#81c784" flatShading />
        </mesh>
      ))}
      
      {/* Water/pond features */}
      {[
        { x: -30, z: -30, size: 4 },
        { x: 30, z: 30, size: 3.5 },
        { x: -30, z: 30, size: 3.2 },
        { x: 30, z: -30, size: 3.8 },
        { x: 0, z: -36, size: 2.5 },
        { x: -36, z: 0, size: 3 },
      ].map((water, i) => (
        <mesh
          key={`water-${i}`}
          position={[water.x, 0.03, water.z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <circleGeometry args={[water.size, 16]} />
          <meshStandardMaterial 
            color="#64b5f6" 
            flatShading
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
      
      {/* Rocky areas */}
      {[
        { x: -18, z: -8, size: 2.5 },
        { x: 18, z: 8, size: 2 },
        { x: -8, z: 18, size: 2.2 },
        { x: 8, z: -18, size: 2.3 },
        { x: -22, z: 4, size: 1.8 },
        { x: 22, z: -4, size: 2 },
      ].map((rock, i) => (
        <mesh
          key={`rock-${i}`}
          position={[rock.x, 0.15, rock.z]}
        >
          <dodecahedronGeometry args={[rock.size, 0]} />
          <meshStandardMaterial color="#78909c" flatShading />
        </mesh>
      ))}
      
      {/* Decorative terrain details - small bushes/patches */}
      {Array.from({ length: 25 }).map((_, i) => {
        const angle = (i / 25) * Math.PI * 2;
        const radius = 12 + (i % 4) * 3;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        return (
          <mesh
            key={`bush-${i}`}
            position={[x, 0.05, z]}
          >
            <sphereGeometry args={[0.5, 6, 6]} />
            <meshStandardMaterial color="#66bb6a" flatShading />
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
const SHOP_TYPES = [
  {
    name: "restaurant",
    baseColor: "#ef4444",
    roofColor: "#dc2626",
    accentColor: "#fbbf24",
  },
  {
    name: "cafe",
    baseColor: "#8b5cf6",
    roofColor: "#7c3aed",
    accentColor: "#fbbf24",
  },
  {
    name: "bistro",
    baseColor: "#f59e0b",
    roofColor: "#d97706",
    accentColor: "#ffffff",
  },
  {
    name: "diner",
    baseColor: "#ec4899",
    roofColor: "#db2777",
    accentColor: "#fbbf24",
  },
  {
    name: "eatery",
    baseColor: "#10b981",
    roofColor: "#059669",
    accentColor: "#ffffff",
  },
  {
    name: "grill",
    baseColor: "#6366f1",
    roofColor: "#4f46e5",
    accentColor: "#fbbf24",
  },
];

// Banner component to show restaurant info above shop
function ShopBanner({ restaurant, distance }) {
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
      bannerGroupRef.current.position.y = baseY + Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
    }
  });

  return (
    <group ref={bannerGroupRef} position={[0, 2.2, 0]}>
      <group ref={bannerRef}>
      <Html
        position={[0, 0, 0]}
        center
        transform
        occlude
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <div className="bg-primary rounded shadow-sm px-2 py-1.5 border border-primary/20 min-w-[160px] max-w-[200px]">
          <div className="text-[11px] font-bold text-white truncate">
            {restaurant.name || 'Restaurant'}
          </div>
          <div className="flex items-center justify-between mt-1 gap-1.5">
            <span className="text-[10px] text-primary bg-white px-1.5 py-0.5 rounded">
              {restaurant.cuisine_type || 'Food'}
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
function AnimatedShop({ position, shopType, index, restaurant, userLocation }) {
  const groupRef = useRef();
  const signRef = useRef();

  useFrame((state) => {
    // Removed floating animation - store stays in place
    if (signRef.current) {
      // Subtle sign animation
      signRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 1.5 + index) * 0.05;
    }
  });

  const shop = SHOP_TYPES[index % SHOP_TYPES.length];

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

  return (
    <group
      position={position}
      ref={groupRef}
    >
      {/* Banner above shop */}
      {restaurant && (
        <ShopBanner restaurant={restaurant} distance={distance} />
      )}

      {/* Ground shadow for better definition */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.2, 32]} />
        <meshStandardMaterial 
          color="#000000" 
          transparent 
          opacity={0.25}
        />
      </mesh>

      {/* Main building - single storey white facade - made bigger */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 1.0, 1.2]} />
        <meshStandardMaterial 
          color="#ffffff" 
          metalness={0.1}
          roughness={0.7}
        />
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
        <meshStandardMaterial 
          color="#dc2626" 
          metalness={0.2}
          roughness={0.6}
        />
      </mesh>
      
      {/* Roof overhang shadow */}
      <mesh position={[0, 1.075, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.75, 0.8, 32]} />
        <meshStandardMaterial 
          color="#000000" 
          transparent 
          opacity={0.15}
        />
      </mesh>
      
      {/* Simple canopy - red and white striped - bigger */}
      <mesh position={[0, 1.0, 0.7]} castShadow>
        <boxGeometry args={[1.5, 0.15, 0.6]} />
        <meshStandardMaterial 
          color="#ef4444" 
          metalness={0.1}
          roughness={0.7}
        />
      </mesh>
      {/* Simple stripes */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh key={`stripe-${i}`} position={[-0.6 + i * 0.24, 1.0, 0.73]}>
          <boxGeometry args={[0.2, 0.15, 0.6]} />
          <meshStandardMaterial 
            color="#ffffff" 
            metalness={0.1}
            roughness={0.8}
          />
        </mesh>
      ))}
      
      {/* Blue door - bigger and more visible */}
      <mesh position={[-0.45, 0.3, 0.62]} castShadow>
        <boxGeometry args={[0.45, 0.7, 0.05]} />
        <meshStandardMaterial 
          color="#3b82f6" 
          metalness={0.3}
          roughness={0.5}
        />
      </mesh>
      {/* Door frame */}
      <mesh position={[-0.45, 0.3, 0.65]}>
        <boxGeometry args={[0.48, 0.72, 0.02]} />
        <meshStandardMaterial 
          color="#1e40af" 
          metalness={0.4}
          roughness={0.4}
        />
      </mesh>
      {/* Door handle */}
      <mesh position={[-0.22, 0.3, 0.66]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial 
          color="#ffffff" 
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Window - bigger and more visible */}
      <mesh position={[0.45, 0.65, 0.62]} castShadow>
        <boxGeometry args={[0.5, 0.45, 0.05]} />
        <meshStandardMaterial 
          color="#3b82f6" 
          metalness={0.3}
          roughness={0.5}
        />
      </mesh>
      {/* Window glass with reflection */}
      <mesh position={[0.45, 0.65, 0.65]}>
        <boxGeometry args={[0.42, 0.38, 0.02]} />
        <meshStandardMaterial 
          color="#1e3a8a" 
          transparent 
          opacity={0.5}
          metalness={0.8}
          roughness={0.2}
          envMapIntensity={1.0}
        />
      </mesh>
      {/* Reflection highlight */}
      <mesh position={[0.55, 0.75, 0.66]}>
        <boxGeometry args={[0.15, 0.12, 0.01]} />
        <meshStandardMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.4} 
        />
      </mesh>
      {/* Window cross frame */}
      <mesh position={[0.45, 0.65, 0.66]}>
        <boxGeometry args={[0.025, 0.45, 0.01]} />
        <meshStandardMaterial 
          color="#1e40af" 
          metalness={0.4}
          roughness={0.4}
        />
      </mesh>
      <mesh position={[0.45, 0.65, 0.66]}>
        <boxGeometry args={[0.5, 0.025, 0.01]} />
        <meshStandardMaterial 
          color="#1e40af" 
          metalness={0.4}
          roughness={0.4}
        />
      </mesh>
      
      {/* Spot letter indicator on roof - bigger */}
      <mesh position={[0, 1.3, 0]} castShadow>
        <boxGeometry args={[0.4, 0.4, 0.15]} />
        <meshStandardMaterial 
          color="#ffffff" 
          metalness={0.2}
          roughness={0.6}
        />
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

// Main scene component
function SceneContent({ restaurants, userLocation }) {
  const lightRef = useRef();

  useFrame((state) => {
    if (lightRef.current) {
      lightRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.5) * 5;
      lightRef.current.position.z = Math.cos(state.clock.elapsedTime * 0.5) * 5;
    }
  });

  // Debug: Log restaurants count
  useEffect(() => {
    console.log('LowPolyScene - Restaurants count:', restaurants?.length || 0);
    console.log('LowPolyScene - Restaurants:', restaurants);
  }, [restaurants]);

  return (
    <>
      {/* Sky dome/sphere for seamless horizon */}
      <mesh>
        <sphereGeometry args={[200, 32, 16]} />
        <meshBasicMaterial 
          color="#b3d9ff" 
          side={THREE.BackSide}
          fog={false}
          transparent
          opacity={0.3}
        />
      </mesh>
      
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
            const angle = (index / Math.max(restaurants.length, 1)) * Math.PI * 2;
            const radius = 3 + (index % 3) * 0.5;
            x = Math.cos(angle) * radius;
            z = Math.sin(angle) * radius;
          }

          return (
            <AnimatedShop
              key={restaurant.id || `restaurant-${index}`}
              position={[x, 0, z]}
              shopType={SHOP_TYPES[index % SHOP_TYPES.length]}
              index={index}
              restaurant={restaurant}
              userLocation={userLocation}
            />
          );
        })
      ) : (
        // Show test shops if no restaurants (for debugging)
        <>
          <AnimatedShop
            key="test-1"
            position={[3, 0, 0]}
            shopType={SHOP_TYPES[0]}
            index={0}
          />
          <AnimatedShop
            key="test-2"
            position={[-3, 0, 0]}
            shopType={SHOP_TYPES[1]}
            index={1}
          />
        </>
      )}
    </>
  );
}

export default function LowPolyScene({ restaurants = [], userLocation }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="w-full h-full bg-gradient-to-b from-blue-200 to-green-200 flex items-center justify-center">
        <div className="text-gray-600">Loading 3D scene...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-b from-sky-300 via-blue-200 to-green-200 pointer-events-auto">
      <Canvas
        camera={{ position: [12, 10, 12], fov: 55 }}
        gl={{ antialias: false }}
        style={{ touchAction: 'none' }}
      >
        {/* Fog for smooth horizon fade - starts at 80, fully fogged at 150 */}
        <fog attach="fog" args={["#b3d9ff", 80, 150]} />
        
        <PerspectiveCamera makeDefault position={[12, 10, 12]} />
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          panSpeed={1.0}
          zoomSpeed={1.0}
          rotateSpeed={0.5}
          screenSpacePanning={true}
          mouseButtons={{
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN
          }}
          touches={{
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.DOLLY_PAN
          }}
          minDistance={3}
          maxDistance={60}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.2}
        />
        <SceneContent
          restaurants={restaurants}
          userLocation={userLocation}
        />
      </Canvas>
    </div>
  );
}

