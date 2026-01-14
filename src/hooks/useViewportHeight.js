import { useEffect, useState } from 'react';

/**
 * Custom hook to manage viewport height on mobile browsers
 * Prevents layout shifts caused by browser UI (address bar, bottom navigation)
 * 
 * @returns {Object} Object containing current viewport height and safe area insets
 */
export function useViewportHeight() {
  const [viewportHeight, setViewportHeight] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerHeight;
    }
    return 0;
  });

  const [safeAreaInsets, setSafeAreaInsets] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  useEffect(() => {
    // Function to update viewport height
    const updateViewportHeight = () => {
      // Use the actual innerHeight to account for browser UI
      const height = window.innerHeight;
      setViewportHeight(height);
      
      // Set CSS custom property for dynamic viewport height
      document.documentElement.style.setProperty('--vh', `${height * 0.01}px`);
    };

    // Get safe area insets if available
    const updateSafeAreaInsets = () => {
      const computedStyle = getComputedStyle(document.documentElement);
      setSafeAreaInsets({
        top: parseInt(computedStyle.getPropertyValue('--safe-area-inset-top')) || 0,
        right: parseInt(computedStyle.getPropertyValue('--safe-area-inset-right')) || 0,
        bottom: parseInt(computedStyle.getPropertyValue('--safe-area-inset-bottom')) || 0,
        left: parseInt(computedStyle.getPropertyValue('--safe-area-inset-left')) || 0,
      });
    };

    // Initial update
    updateViewportHeight();
    updateSafeAreaInsets();

    // Update on resize (handles orientation changes and browser UI changes)
    window.addEventListener('resize', updateViewportHeight);
    window.addEventListener('orientationchange', updateViewportHeight);
    
    // Update on scroll (address bar appears/disappears)
    let scrollTimeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(updateViewportHeight, 150);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Visual viewport API for better mobile support
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateViewportHeight);
      window.visualViewport.addEventListener('scroll', handleScroll);
    }

    return () => {
      window.removeEventListener('resize', updateViewportHeight);
      window.removeEventListener('orientationchange', updateViewportHeight);
      window.removeEventListener('scroll', handleScroll);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateViewportHeight);
        window.visualViewport.removeEventListener('scroll', handleScroll);
      }
      clearTimeout(scrollTimeout);
    };
  }, []);

  return {
    viewportHeight,
    safeAreaInsets,
  };
}
