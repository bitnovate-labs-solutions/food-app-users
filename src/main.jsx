import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import AppErrorBoundary from "./components/AppErrorBoundary";
import { aggressiveCleanup, checkAndCleanupStorage } from "@/utils/storageCleanup";

// Run cleanup IMMEDIATELY on script load, before anything else
try {
  checkAndCleanupStorage();
} catch (error) {
  console.warn('Initial cleanup failed, will retry:', error);
}

// Global error handler for storage quota errors
window.addEventListener('error', (event) => {
  const error = event.error || event;
  const message = String(event.message || error?.message || '');
  const errorString = String(error || '');
  
  if (message.includes('quota') || message.includes('QuotaExceeded') || 
      message.includes('kQuotaBytes') || message.includes('QuotaExceededError') ||
      errorString.includes('quota') || errorString.includes('QuotaExceeded') ||
      error?.name === 'QuotaExceededError' || error?.code === 'QuotaExceededError') {
    console.warn('⚠️ Storage quota error detected, performing cleanup...');
    aggressiveCleanup();
    // Prevent error from showing in console
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
}, true); // Use capture phase

// Handle unhandled promise rejections (common for quota errors)
window.addEventListener('unhandledrejection', (event) => {
  const error = event.reason;
  const message = String(error?.message || '');
  const errorString = String(error || '');
  
  if (message.includes('quota') || message.includes('QuotaExceeded') ||
      message.includes('kQuotaBytes') || message.includes('QuotaExceededError') ||
      errorString.includes('quota') || errorString.includes('QuotaExceeded') ||
      errorString.includes('kQuotaBytes') ||
      error?.name === 'QuotaExceededError' || error?.code === 'QuotaExceededError') {
    console.warn('⚠️ Unhandled storage quota error, performing cleanup...');
    aggressiveCleanup();
    // Prevent the error from showing in console
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>
);
