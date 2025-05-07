// Detect whether the user is on mobile vs desktop using the navigator.userAgent

export const detectSource = () => {
  const ua = navigator.userAgent.toLowerCase();
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;

  const isMobileUA = /android|iphone|ipad|ipod/.test(ua);

  // Desktop platform check — prefer accuracy
  const isDesktop = /windows|macintosh|linux/.test(ua);

  if (isMobileUA && !isDesktop) {
    return isStandalone ? "pwa-mobile" : "mobile";
  }

  // Prioritize desktop if platform matches
  return isStandalone ? "pwa-web" : "web";
};
