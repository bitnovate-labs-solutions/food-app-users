// Android supports the "beforeinstallprompt" event - which must be listened to - it's not triggered via user agent checks
// iOS does NOT support "beforeinstallprompt" - so checking "navigator.userAgent" and "display-mode" works!
// Android does not show install prompts unless:
// - The site is served over HTTPS
// - Has a valid manifest.json and serviceWorker
// - The user has interacted with the page
// - You listen for the beforeinstallprompt event and trigger it manually

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Share, Download } from "lucide-react";

export function PWAPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installable, setInstallable] = useState(false);

  useEffect(() => {
    // Check if already installed
    const checkIfInstalled = () => {
      const standalone = window.matchMedia("(display-mode: standalone)").matches;
      setIsStandalone(standalone);
      if (standalone) {
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
    if (dismissed === "true") return;

    // Check PWA criteria
    const checkPWACriteria = () => {
      const isSecure = window.location.protocol === 'https:';
      const hasManifest = document.querySelector('link[rel="manifest"]') !== null;
      const hasServiceWorker = 'serviceWorker' in navigator;
      
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
      if (checkPWACriteria() && !checkIfInstalled()) {
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
      if (!checkIfInstalled()) {
        setShowPrompt(true);
      }
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("click", showAfterInteraction);
      window.removeEventListener("scroll", showAfterInteraction);
    };
  }, []);

  // Handle install click
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

  // Handle dismiss
  const handleDismiss = () => {
    localStorage.setItem("pwa_install_dismissed", "true");
    setShowPrompt(false);
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-50">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <h3 className="font-semibold">Install TreatYourDate</h3>
          {isIOS ? (
            <div className="text-sm text-gray-600">
              <p>To install this app:</p>
              <ol className="ml-4 list-decimal space-y-1">
                <li>
                  Tap the share button <Share className="w-4 h-4 inline" />
                </li>
                <li>Scroll down and tap &quot;Add to Home Screen&quot;</li>
              </ol>
            </div>
          ) : (
            <div className="text-sm text-gray-600">
              <p>Install this app on your device for quick and easy access.</p>
              <Button 
                className="mt-2" 
                size="sm" 
                onClick={handleInstallClick}
                disabled={!deferredPrompt}
              >
                <Download className="w-4 h-4 mr-2" />
                {deferredPrompt ? "Install App" : "Installation not available"}
              </Button>
              {!deferredPrompt && installable && (
                <p className="text-xs text-gray-500 mt-1">
                  Try interacting with the page first
                </p>
              )}
            </div>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={handleDismiss}>
          Not now
        </Button>
      </div>
    </div>
  );
}
