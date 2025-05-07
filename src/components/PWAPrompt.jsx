// Android supports the "beforeinstallprompt" event - which must be listened to - it's not triggered via user agent checks
// iOS does NOT support "beforeinstallprompt" - so checking "navigator.userAgent" and "display-mode" works!
// Android does not show install prompts unless:
// - The site is served over HTTPS
// - Has a valid manifest.json and serviceWorker
// - The user has interacted with the page
// - You listen for the beforeinstallprompt event and trigger it manually

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Share } from "lucide-react";

export function PWAPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);

  // ANDROID EVENT LISTENER -----------------------------------------
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true); // manually show your Android install UI
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Trigger install when user clicks -----------------------------------------
  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  // AUTO-TRIGGER POPUP PROMPT (on iOS device)
  useEffect(() => {
    // AUTO-RUN ON FIRST LOAD (Check if device is iOS)
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);

    if (isIOSDevice) {
      const isStandalone = window.matchMedia(
        "(display-mode: standalone)"
      ).matches;
      if (!isStandalone) {
        setShowPrompt(true);
      }
    }
  }, []);

  // Only show for iOS devices that haven't installed the PWA
  if (!isIOS || !showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-50">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <h3 className="font-semibold">Install TreatYourDate</h3>
          <div className="text-sm text-gray-600">
            <p>To install this app:</p>
            <ol className="ml-4 list-decimal">
              <li>
                Tap the share button <Share className="w-4 h-4 inline" />
              </li>
              <li>Scroll down and tap &quot;Add to Home Screen&quot;</li>
            </ol>
          </div>
        </div>
        <Button variant="ghost" onClick={() => setShowPrompt(false)}>
          Not now
        </Button>
      </div>
    </div>
  );
}
