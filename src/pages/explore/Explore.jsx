import { Suspense } from "react";

// Components and UI
import MapView from "./subpages/MapView";

// Error and Loading Handlers
import { ErrorBoundary } from "react-error-boundary";

import { CardSkeleton } from "@/components/LoadingSkeleton";
import AppErrorBoundary from "@/components/AppErrorBoundary";

export default function Explore() {
  return (
    <div className="w-full h-full relative" style={{ height: '100%' }}>
        <ErrorBoundary FallbackComponent={AppErrorBoundary}>
        <Suspense fallback={<CardSkeleton />}>
          <MapView />
        </Suspense>
        </ErrorBoundary>
      </div>
  );
}
