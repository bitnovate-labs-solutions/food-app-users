import { Suspense } from "react";
import { useLocation } from "react-router-dom";

// Components and UI
import { ScrollArea } from "@/components/ui/scroll-area";
import Menu from "./subpages/Menu";
import Purchased from "./subpages/Purchased";
import HistoryPage from "./subpages/History";

// Error and Loading Handlers
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "@/components/ErrorFallback";
import { CardSkeleton } from "@/components/LoadingSkeleton";

export default function Treater() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get("tab") || "menu";

  const renderContent = () => {
    switch (activeTab) {
      case "menu":
        return <Menu />;
      case "purchased":
        return <Purchased />;
      case "history":
        return <HistoryPage />;
      default:
        return <Menu />;
    }
  };

  return (
    <ScrollArea>
      <div className="bg-transparent py-4">
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<CardSkeleton />}>{renderContent()}</Suspense>
        </ErrorBoundary>
      </div>
    </ScrollArea>
  );
}
