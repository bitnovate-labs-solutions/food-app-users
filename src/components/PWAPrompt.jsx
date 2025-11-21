import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Share, Download } from "lucide-react";

// SET to true / false DURING DEVELOPMENT
// true -> to force show the prompt during development
const FORCE_SHOW_PROMPT = false;

export function PWAPrompt() {
  const [showPrompt, setShowPrompt] = useState(FORCE_SHOW_PROMPT);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installable, setInstallable] = useState(false);

  useEffect(() => {
    // Check if already installed
    const checkIfInstalled = () => {
      const standalone = window.matchMedia(
        "(display-mode: standalone)"
      ).matches;
      setIsStandalone(standalone);
      if (standalone && !FORCE_SHOW_PROMPT) {
        setShowPrompt(false);
        return true;
      }
      return false;
    };

    // Check device type
    const ua = navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua) && !window.MSStream;
    setIsIOS(isIOSDevice);

    // Don't show if already installed
    if (checkIfInstalled()) return;

    // Don't show if previously dismissed
    const dismissed = localStorage.getItem("pwa_install_dismissed");
    if (dismissed === "true" && !FORCE_SHOW_PROMPT) return;

    // Check PWA criteria
    const checkPWACriteria = () => {
      const isSecure = window.location.protocol === "https:";
      const hasManifest =
        document.querySelector('link[rel="manifest"]') !== null;
      const hasServiceWorker = "serviceWorker" in navigator;

      setInstallable(isSecure && hasManifest && hasServiceWorker);
      return isSecure && hasManifest && hasServiceWorker;
    };

    // Android: listen for beforeinstallprompt
    const handler = (e) => {
      console.log("beforeinstallprompt event fired");
      e.preventDefault(); // prevent automatic prompt
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    // Function to show prompt after user interaction
    const showAfterInteraction = () => {
      if ((checkPWACriteria() && !checkIfInstalled()) || FORCE_SHOW_PROMPT) {
        setShowPrompt(true);
      }
    };

    if (!isIOSDevice) {
      // For Android/other devices, we need to wait for user interaction
      window.addEventListener("click", showAfterInteraction, { once: true });
      window.addEventListener("scroll", showAfterInteraction, { once: true });

      // Listen for install prompt
      window.addEventListener("beforeinstallprompt", handler);
    } else {
      // For iOS, show immediately if not installed
      if (!checkIfInstalled() || FORCE_SHOW_PROMPT) {
        setShowPrompt(true);
      }
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("click", showAfterInteraction);
      window.removeEventListener("scroll", showAfterInteraction);
    };
  }, []);

  // HANDLE INSTALL CLICK ---------------------------------
  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log("No install prompt available");
      return;
    }

    try {
      console.log("Triggering install prompt");
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log("Installation outcome:", outcome);

      if (outcome === "accepted") {
        console.log("PWA installed successfully");
        setShowPrompt(false);
      }
    } catch (error) {
      console.error("Error during installation:", error);
    } finally {
      setDeferredPrompt(null);
    }
  };

  // HANDLE DISMISS ---------------------------------
  const handleDismiss = () => {
    if (!FORCE_SHOW_PROMPT) {
      localStorage.setItem("pwa_install_dismissed", "true");
    }
    setShowPrompt(false);
  };

  if (!showPrompt || (isStandalone && !FORCE_SHOW_PROMPT)) return null;

  return (
    <div className="fixed max-w-sm mx-auto bottom-10 left-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-50">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-primary">Install Food Hunter</h3>
            <div className="flex flex-col justify-center space-y-2">
              {/* PROMPT FOR iOS --------------------------------- */}
              {isIOS ? (
                <div className="text-sm text-gray-600">
                  <p className="mb-3">To install this app:</p>
                  <ol className="ml-4 list-decimal space-y-1">
                    <li>
                      Tap the share button{" "}
                      <Share className="w-4 h-4 inline text-primary" />
                    </li>
                    <li>
                      Scroll down and tap{" "}
                      <span className="text-primary">
                        &quot;Add to Home Screen&quot;
                      </span>
                    </li>
                  </ol>
                </div>
              ) : (
                // PROMPT FOR ANDROID / OTHER DEVICES ---------------------------------
                <div className="text-xs text-gray-600 mt-2">
                  <p>
                    Install this app on your device for quick and easy access.
                  </p>
                  <Button
                    className="mt-4 w-full"
                    size="sm"
                    onClick={handleInstallClick}
                    disabled={!deferredPrompt}
                  >
                    <Download className="w-4 h-4 mr-2 text-white" />
                    <span className="text-white">
                      {deferredPrompt
                        ? "Install App"
                        : "Installation not available"}
                    </span>
                  </Button>
                  {!deferredPrompt && installable && (
                    <p className="text-xs text-gray-500 mt-1">
                      Try interacting with the page first
                    </p>
                  )}
                </div>
              )}
              <Button variant="ghost" size="sm" onClick={handleDismiss}>
                Not now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
