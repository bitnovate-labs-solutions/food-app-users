import { useEffect, useState } from "react";
import { Share } from "lucide-react";
import { Button } from "./ui/button";

export function InstallAppPrompt({ onBeforeInstallPrompt }) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Don't show if user previously dismissed
    const dismissed = localStorage.getItem("pwa_install_dismissed");
    if (dismissed === "true") return;

    const ua = navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua) && !window.MSStream;
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      navigator.standalone === true;

    setIsIOS(isIOSDevice);

    // iOS: show manually if not installed
    if (isIOSDevice && !isStandalone) {
      setShowPrompt(true);
    }

    // Android: listen for beforeinstallprompt
    const handler = (e) => {
      e.preventDefault(); // prevent automatic prompt
      setDeferredPrompt(e);
      onBeforeInstallPrompt?.(e);

      // Show after scroll or delay
      const showAfterInteraction = () => {
        setShowPrompt(true);
      };

      window.addEventListener("scroll", showAfterInteraction, { once: true });
      setTimeout(showAfterInteraction, 10000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // HANDLE INSTALL ---------------------------------------
  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        console.log("PWA installed");
      }
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  // HANDLE DISMISS ---------------------------------------
  const handleDismiss = () => {
    localStorage.setItem("pwa_install_dismissed", "true");
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    // <button
    //   onClick={handleInstall}
    //   className="w-full flex items-center px-2 py-1.5 text-sm text-primary hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
    //   disabled={!deferredPrompt}
    // >
    //   <Download className="w-4 h-4 mr-4" />
    //   Install
    // </button>
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
              <p>You can install this app on your device.</p>
              <Button className="mt-2" size="sm" onClick={handleInstallClick}>
                Install App
              </Button>
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
