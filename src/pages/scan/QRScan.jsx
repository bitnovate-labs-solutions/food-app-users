import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { useNavigate, useLocation } from "react-router-dom";
import { AlertCircle, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import LoadingComponent from "@/components/LoadingComponent";

const QRScan = () => {
  const scannerRef = useRef(null);
  const isScanning = useRef(false);
  const lastScannedCode = useRef(null); // Track last scanned QR code to prevent duplicates
  const isStarting = useRef(false);
  const isStopping = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [error, setError] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Define startScanner first using useCallback
  // START SCANNER - use useCallback to prevent recreation on every render
  const startScanner = useCallback(async () => {
    // Prevent concurrent start operations
    if (isStarting.current) {
      return;
    }

    // Check current state
    const currentState = scannerRef.current?.getState();

    // If already started, verify it's actually working, otherwise restart
    if (currentState === Html5QrcodeScannerState.STARTED) {
      // Check if the video element exists and has a stream
      const qrReaderElement = document.getElementById("qr-reader");
      if (qrReaderElement) {
        const videoElement = qrReaderElement.querySelector("video");
        if (videoElement && videoElement.readyState >= 2) {
          return;
        } else {
          // Force stop and restart
          try {
            await scannerRef.current?.stop();
            await scannerRef.current?.clear();
          } catch (e) {
            // Ignore errors
          }
        }
      }
    }

    // If stopping, wait a bit before starting
    if (isStopping.current) {
      setTimeout(() => startScanner(), 500);
      return;
    }

    isStarting.current = true;

    try {
      const qrReaderElement = document.getElementById("qr-reader");
      if (!qrReaderElement) {
        isStarting.current = false;
        // Retry after a short delay
        setTimeout(() => startScanner(), 500);
        return;
      }

      // Get container dimensions
      let containerWidth = qrReaderElement.clientWidth;
      let containerHeight = qrReaderElement.clientHeight;

      // If dimensions are 0 or invalid, use defaults and retry
      if (
        !containerWidth ||
        !containerHeight ||
        containerWidth === 0 ||
        containerHeight === 0
      ) {
        containerWidth = 300;
        containerHeight = 300;
        isStarting.current = false;
        setTimeout(() => startScanner(), 500);
        return;
      }

      // Create scanner instance if it doesn't exist
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("qr-reader");
      }

      // Check state before starting
      const currentState = scannerRef.current.getState();

      if (currentState === Html5QrcodeScannerState.STARTED) {
        isStarting.current = false;
        return;
      }

      // We'll define handleScanSuccess and handleScanFailure later, but reference them here
      // For now, use placeholder functions that will be replaced
      // Make qrbox slightly smaller to ensure corner markers are visible
      const qrboxSize = Math.min(containerWidth, containerHeight) - 40;
      
      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          // Set qrbox slightly smaller than container to show corner markers
          qrbox: { width: qrboxSize, height: qrboxSize },
          // Disable default UI elements that might interfere
          showTorchButtonIfSupported: false,
          showZoomSliderIfSupported: false,
          // Remove aspect ratio constraint to fill container
          aspectRatio: undefined,
        },
        handleScanSuccessRef.current || (() => {}),
        handleScanFailureRef.current || (() => {})
      );

      // Clear any previous errors on successful start
      setError(null);
    } catch (error) {
      // Handle specific error types
      if (
        error.message?.includes("transition") ||
        error.message?.includes("state")
      ) {
        setTimeout(() => {
          isStarting.current = false;
          startScanner();
        }, 1000);
        return;
      }

      if (error.message && error.message.toLowerCase().includes("camera")) {
        setError("Unable to access camera. Please check permissions.");
      } else {
        // Don't show error for transition/state errors - these are handled by retry
        if (
          !error.message?.includes("transition") &&
          !error.message?.includes("state") &&
          !error.message?.includes("already")
        ) {
          setError(`Failed to start camera: ${error.message || "Unknown error"}`);
        }
      }
    } finally {
      isStarting.current = false;
    }
  }, []); // Empty deps - function doesn't depend on any props/state

  // Create refs for handlers (initialized as null, will be set later)
  const handleScanSuccessRef = useRef(null);
  const handleScanFailureRef = useRef(null);

  // Stop all media tracks (iOS-specific fix)
  // This function must be defined before useEffects that use it
  const stopAllMediaTracks = useCallback(() => {
    // Don't stop tracks if scanner is currently starting
    if (isStarting.current) {
      return;
    }

    try {
      // Get all video elements in the qr-reader container
      const qrReaderElement = document.getElementById("qr-reader");
      if (qrReaderElement) {
        const videoElements = qrReaderElement.querySelectorAll("video");
        videoElements.forEach((video) => {
          if (video.srcObject) {
            const stream = video.srcObject;
            if (stream instanceof MediaStream) {
              // Stop all tracks in the stream
              stream.getTracks().forEach((track) => {
                if (track.readyState !== "ended") {
                  track.stop();
                  track.enabled = false;
                }
              });
            }
            // Clear the srcObject
            video.srcObject = null;
          }
        });
      }

      // Also try to get all media tracks from navigator (fallback)
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // This is a fallback - we've already stopped tracks above
        // But we can also enumerate devices and stop any active tracks
        navigator.mediaDevices.enumerateDevices().catch(() => {
          // Ignore errors
        });
      }
    } catch (error) {
      // Ignore errors - tracks might already be stopped
      console.warn("Error stopping media tracks:", error);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    // Wait for DOM to be ready - use longer delay to ensure component is fully mounted
    const timer = setTimeout(() => {
      startScanner();
    }, 800);

    return () => {
      clearTimeout(timer);
      stopScanner();
      toast.dismiss();
    };
    // Only depend on user - startScanner is stable via useCallback
  }, [user, startScanner]);

  // iOS-specific fix: Stop camera when navigating away
  // This ensures the screen recording indicator disappears on iOS
  useEffect(() => {
    // Only cleanup if we're actually leaving the QR scan page
    const isOnScanPage = location.pathname === "/scan";
    
    if (!isOnScanPage) {
      // We've navigated away from scan page, cleanup immediately
      stopAllMediaTracks();
      if (scannerRef.current) {
        try {
          const currentState = scannerRef.current.getState();
          if (currentState === Html5QrcodeScannerState.STARTED) {
            scannerRef.current.stop().catch(() => {});
          }
        } catch (error) {
          // Ignore errors
        }
      }
      return;
    }

    // We're on the scan page, set up cleanup for when we leave
    const handleBeforeUnload = () => {
      stopAllMediaTracks();
      if (scannerRef.current) {
        try {
          scannerRef.current.stop().catch(() => {});
        } catch (error) {
          // Ignore errors
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      // Cleanup on unmount or when pathname changes away from /scan
      stopAllMediaTracks();
      if (scannerRef.current) {
        try {
          scannerRef.current.stop().catch(() => {});
        } catch (error) {
          // Ignore errors
        }
      }
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [location.pathname, stopAllMediaTracks]); // Re-run when route changes

  // STOP SCANNER
  const stopScanner = async () => {
    // Prevent concurrent stop operations
    if (isStopping.current) {
      return;
    }

    isStopping.current = true;

    try {
      if (!scannerRef.current) {
        isStopping.current = false;
        return;
      }

      const currentState = scannerRef.current.getState();

      // Only stop if actually started
      if (currentState === Html5QrcodeScannerState.STARTED) {
        await scannerRef.current.stop();
      }

      // Clear the scanner
      try {
        if (scannerRef.current) {
          await scannerRef.current.clear();
        }
      } catch (clearError) {
        // Ignore clear errors - scanner might already be cleared
      }

      // CRITICAL: Stop all media tracks explicitly (iOS fix)
      // This ensures the camera is fully released and screen recording indicator disappears
      stopAllMediaTracks();
    } catch (error) {
      // Ignore stop errors if scanner is already stopped or in transition
    } finally {
      isStopping.current = false;
    }
  };

  // RESTART SCANNER
  const restartScanner = async () => {
    isScanning.current = false;
    lastScannedCode.current = null; // Reset last scanned code
    setError(null);
    setScanResult(null);
    toast.dismiss();

    // Stop first, then start after a delay
    await stopScanner();

    // Wait a bit before restarting to ensure clean state
    setTimeout(() => {
      startScanner();
    }, 500);
  };

  // HANDLE SCAN SUCCESS
  const handleScanSuccess = useCallback(
    async (decodedText) => {
      // Prevent duplicate scans of the same QR code
      if (lastScannedCode.current === decodedText) {
        return;
      }

      if (isScanning.current || !user) return;

      // Stop scanner immediately to prevent infinite loop
      await stopScanner();
      
      // Mark this code as scanned
      lastScannedCode.current = decodedText;
      
      isScanning.current = true;
      setIsProcessing(true);

      // Play beep sound (optional)
      try {
        const beep = new Audio("/sounds/beep.mp3");
        beep.play().catch(() => {});
      } catch (e) {
        // Beep sound is optional, continue if it fails
      }

      try {
        toast.dismiss();
        setError(null);
        setScanResult(null);

        // 1. Parse QR code (Expect JSON format with point collection data)
        let qrData;
        try {
          qrData = JSON.parse(decodedText);
        } catch {
          // If not JSON, treat as simple code
          qrData = { code: decodedText };
        }

        // 2. Get user profile to collect points
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          throw new Error("User is not authenticated");
        }

        // 3. Get app_user record (not just profile)
        const { data: appUser } = await supabase
          .from("app_users")
          .select("id, profile_id, points_balance")
          .eq("profile_id", session.user.id)
          .single();

        if (!appUser) {
          throw new Error("User account not found. Please complete your profile setup.");
        }

        // 4. Process QR code scan directly using Supabase
        // QR code format: { "restaurant_id": "uuid" }
        
        const { restaurant_id } = qrData;
        
        if (!restaurant_id) {
          throw new Error("Invalid QR code: restaurant_id not found");
        }

        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        // 4a. Get restaurant config (from restaurants table - back office DB)
        const { data: restaurant, error: restaurantError } = await supabase
          .from("restaurants")
          .select("id, name, status, vendor_id, collection_set_id")
          .eq("id", restaurant_id)
          .single();

        if (restaurantError || !restaurant) {
          console.error("Restaurant fetch error:", restaurantError);
          throw new Error("Restaurant not found");
        }

        if (restaurant.status !== 'active') {
          throw new Error("Restaurant is not active");
        }

        // 4a.1 Get collection_set config (points come from collection_set)
        let collectionSet = null;
        let basePoints = 1; // Default
        let bonusPoints = 0; // Default

        if (restaurant.collection_set_id) {
          const { data: collectionSetData, error: collectionSetError } = await supabase
            .from("collection_sets")
            .select("id, title, base_points, bonus_points, status")
            .eq("id", restaurant.collection_set_id)
            .single();

          if (collectionSetError) {
            console.error("Collection set fetch error:", collectionSetError);
          } else if (collectionSetData) {
            collectionSet = collectionSetData;
            basePoints = collectionSetData.base_points ?? 1;
            bonusPoints = collectionSetData.bonus_points ?? 0;
          }
        }

        // Debug logging
        console.log("Restaurant config:", {
          name: restaurant.name,
          collection_set_id: restaurant.collection_set_id,
          collectionSet: collectionSet?.title,
          basePoints,
          bonusPoints,
        });

        // 4b. Check if already scanned TODAY
        const { data: existingScan } = await supabase
          .from("qr_code_scans")
          .select("id")
          .eq("app_user_id", appUser.id)
          .eq("restaurant_id", restaurant_id)
          .eq("scan_date", today)
          .single();

        if (existingScan) {
          // Stop scanner immediately to prevent loop
          await stopScanner();
          
          // Set error modal state
          setErrorMessage("You have already scanned this restaurant today. Come back tomorrow!");
          setShowErrorModal(true);
          setError(null); // Clear inline error
          
          // Don't restart scanner automatically
          return;
        }

        // 4c. Calculate points (already calculated above from collection_set)
        const pointsEarned = basePoints + bonusPoints;
        
        console.log("Points calculation:", { basePoints, bonusPoints, pointsEarned });

        // 4d. Determine mascot drop
        // Mascots drop from collection_set if it exists and has mascots
        let mascot = null;
        let isNewMascot = false;

        console.log("Mascot drop check:", {
          collection_set_id: restaurant.collection_set_id,
          hasCollectionSet: !!collectionSet,
        });

        // Enable mascot drops if restaurant has a collection_set_id
        // You can adjust the drop rate logic here (e.g., always drop, or use a fixed rate)
        if (restaurant.collection_set_id) {
          // For now, always attempt to drop a mascot if collection_set exists
          // You can add a drop_rate field to collection_sets if needed
          const dropRate = 100; // 100% drop rate - adjust as needed
          const randomRoll = Math.random() * 100;
          console.log("Mascot drop roll:", { dropRate, randomRoll, willDrop: randomRoll <= dropRate });
          
          if (randomRoll <= dropRate) {
            // Select random mascot from restaurant's assigned mascots
            // First try restaurant_mascots table (direct assignment)
            const { data: restaurantMascots, error: restaurantMascotsError } = await supabase
              .from("restaurant_mascots")
              .select("mascot_id, mascots(*)")
              .eq("restaurant_id", restaurant_id);

            console.log("Restaurant mascots query:", { restaurantMascots, error: restaurantMascotsError });

            let availableMascots = [];

            if (restaurantMascots && restaurantMascots.length > 0) {
              // Use directly assigned mascots
              availableMascots = restaurantMascots
                .map((rm) => rm.mascots)
                .filter(Boolean);
              console.log("Using restaurant_mascots:", availableMascots.length, "mascots");
            } else if (restaurant.collection_set_id) {
              // Fallback to collection set mascots if no direct assignments
              const { data: setMascots, error: setMascotsError } = await supabase
                .from("collection_set_mascots")
                .select("mascot_id, mascots(*)")
                .eq("collection_set_id", restaurant.collection_set_id);

              console.log("Collection set mascots query:", { 
                collection_set_id: restaurant.collection_set_id,
                setMascots, 
                error: setMascotsError 
              });

              if (setMascots && setMascots.length > 0) {
                availableMascots = setMascots
                  .map((sm) => sm.mascots)
                  .filter(Boolean);
                console.log("Using collection_set_mascots:", availableMascots.length, "mascots");
              } else {
                console.warn("No mascots found in collection_set_mascots for collection_set_id:", restaurant.collection_set_id);
              }
            } else {
              console.warn("No collection_set_id set for restaurant, cannot drop mascot");
            }

            if (availableMascots.length > 0) {
              const randomIndex = Math.floor(
                Math.random() * availableMascots.length
              );
              mascot = availableMascots[randomIndex];

              if (mascot) {
                console.log("Selected mascot:", mascot);
                
                // Check if user already has this mascot
                const { data: existingCollection, error: existingCollectionError } = await supabase
                  .from("user_mascot_collections")
                  .select("id")
                  .eq("app_user_id", appUser.id)
                  .eq("mascot_id", mascot.id)
                  .single();

                console.log("Existing collection check:", { existingCollection, error: existingCollectionError });

                isNewMascot = !existingCollection;

                // Add to collection if new
                if (isNewMascot) {
                  const { data: insertedCollection, error: insertError } = await supabase
                    .from("user_mascot_collections")
                    .insert({
                      app_user_id: appUser.id,
                      mascot_id: mascot.id,
                      collection_set_id: restaurant.collection_set_id,
                      collected_from: "qr_scan",
                      restaurant_id: restaurant_id,
                    })
                    .select();

                  console.log("Inserted mascot collection:", { insertedCollection, error: insertError });
                  
                  if (insertError) {
                    console.error("Error inserting mascot collection:", insertError);
                  }
                } else {
                  console.log("Mascot already in collection, not inserting");
                }
              }
            }
          }
        }

        // 4e. Update user points
        await supabase
          .from("app_users")
          .update({
            points_balance: (appUser.points_balance || 0) + pointsEarned,
            updated_at: new Date().toISOString(),
          })
          .eq("id", appUser.id);

        // 4f. Record scan (with today's date and vendor_id for analytics/RLS)
        await supabase.from("qr_code_scans").insert({
          app_user_id: appUser.id,
          restaurant_id: restaurant_id,
          vendor_id: restaurant.vendor_id,
          points_earned: pointsEarned,
          mascot_dropped: !!mascot,
          mascot_id: mascot?.id,
          collection_set_id: restaurant.collection_set_id,
          scan_date: today,
        });

        // 4g. Get collection progress
        let collectionProgress = { current: 0, total: 0 };
        let isCollectionComplete = false;

        if (restaurant.collection_set_id) {
          // Get total mascots in set
          const { data: setMascots } = await supabase
            .from("collection_set_mascots")
            .select("mascot_id")
            .eq("collection_set_id", restaurant.collection_set_id);

          const total = setMascots?.length || 0;

          // Get user's collected mascots from this set
          const { data: userCollections } = await supabase
            .from("user_mascot_collections")
            .select("mascot_id")
            .eq("app_user_id", appUser.id)
            .eq("collection_set_id", restaurant.collection_set_id);

          const current = userCollections?.length || 0;

          collectionProgress = {
            current,
            total,
            collection_set_id: restaurant.collection_set_id,
          };

          // Only mark as complete if total > 0 and current equals total
          isCollectionComplete = total > 0 && current === total;
        }

        // Success - navigate to redeemed success page
        toast.success(`✅ Collected ${pointsEarned} points!`);
        setScanResult("Points collected!");

        // Ensure scanner is stopped before navigation
        await stopScanner();
        isScanning.current = false;

        // Navigate away immediately to prevent re-scanning
        navigate("/redeemed-success", {
          state: {
            pointsEarned,
            mascot: mascot,
            isNewMascot: isNewMascot,
            collectionProgress: collectionProgress,
            isCollectionComplete: isCollectionComplete,
            qrData,
          },
          replace: true, // Use replace to prevent going back to scanner
        });
        return;
      } catch (error) {
        // Stop scanner immediately to prevent loop
        await stopScanner();
        
        // Check if it's an "already scanned" error
        const errorMsg = error.message || "Failed to process QR code";
        if (errorMsg.toLowerCase().includes("already scanned")) {
          setErrorMessage(errorMsg);
          setShowErrorModal(true);
          setError(null);
        } else {
          // For other errors, show toast and inline error
          toast.error(errorMsg);
          setError(errorMsg);
          // Restart scanner after delay for other errors
          setTimeout(() => {
            restartScanner();
          }, 3000);
        }
      } finally {
        isScanning.current = false;
        setIsProcessing(false);
      }
    },
    [user, navigate, restartScanner, stopScanner]
  ); // Dependencies for handleScanSuccess

  // HANDLE SCAN FAILURE
  const handleScanFailure = useCallback((error) => {
    // Ignore common non-critical errors
    if (
      error.includes("No barcode") ||
      error.includes("NotFoundException") ||
      error.includes("requestAnimationFrame")
    ) {
      return;
    }
  }, []);

  // Handle error modal close and restart scanner
  const handleErrorModalClose = useCallback(async () => {
    setShowErrorModal(false);
    setErrorMessage("");
    setError(null);
    // Restart scanner after closing modal
    setTimeout(() => {
      startScanner();
    }, 500);
  }, [startScanner]);

  // Update refs when handlers are defined
  useEffect(() => {
    handleScanSuccessRef.current = handleScanSuccess;
    handleScanFailureRef.current = handleScanFailure;
  }, [handleScanSuccess, handleScanFailure]);

  // Add CSS to make video fill the container and show corner markers
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      #qr-reader video {
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
      }
      #qr-reader {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }
      #qr-reader__dashboard {
        display: none !important;
      }
      /* Show corner markers - html5-qrcode creates these automatically */
      #qr-reader__scan_region {
        border: 2px solid rgba(255, 255, 255, 0.5) !important;
        border-radius: 8px !important;
      }
      /* Corner markers are typically SVG or div elements */
      #qr-reader__scan_region svg,
      #qr-reader__scan_region > div {
        display: block !important;
      }
      /* Ensure corner markers are visible */
      #qr-reader__camera_selection,
      #qr-reader__camera_permission_button {
        display: none !important;
      }
      /* Style the corner markers if they're SVG paths */
      #qr-reader__scan_region svg path {
        stroke: #00ff00 !important;
        stroke-width: 3 !important;
        fill: none !important;
      }
      /* Alternative: if corner markers are divs with borders */
      #qr-reader__scan_region > div[style*="border"] {
        border-color: #00ff00 !important;
        border-width: 3px !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (!user) {
    return <LoadingComponent type="screen" text="Loading..." />;
  }

  return (
    <div className="h-[calc(100vh-120px)] w-full flex flex-col items-center justify-center bg-white relative">
      <div className="w-full flex flex-col items-center justify-center px-6">
        {/* Instructional Text */}
        <div className="mb-4 text-center space-y-1">
          <p className="text-sm font-medium text-gray-700">
            Place QR code inside the frame to scan please
          </p>
          <p className="text-xs text-gray-500">
            Avoid shake to get results quickly
          </p>
        </div>

        <div
          id="qr-reader"
          className="w-full aspect-square max-w-sm mx-auto rounded-xl overflow-hidden"
          style={{
            minHeight: "280px",
            minWidth: "280px",
            position: "relative",
            backgroundColor: "#000",
          }}
        />

        {isProcessing && (
          <div className="mt-4 flex flex-col items-center justify-center space-y-2">
            <LoadingComponent type="inline" text="Processing..." />
            <p className="text-sm text-gray-300">Collecting points...</p>
          </div>
        )}

        {error && !isProcessing && (
          <div className="mt-4 bg-red-500/20 border border-red-400/50 text-red-200 text-sm text-center p-3 rounded">
            {error}
          </div>
        )}

        {scanResult && !isProcessing && (
          <div className="mt-4 bg-green-500/20 border border-green-400/50 text-green-200 text-sm text-center p-3 rounded">
            {scanResult}
          </div>
        )}
      </div>

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 p-6 relative">
            {/* Close Button */}
            <button
              onClick={handleErrorModalClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-orange-500" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
              Already Scanned
            </h2>

            {/* Message */}
            <p className="text-sm text-gray-600 text-center mb-6">
              {errorMessage}
            </p>

            {/* Action Button */}
            <button
              onClick={handleErrorModalClose}
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Scan Another QR Code
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRScan;
