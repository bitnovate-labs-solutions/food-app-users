import { Suspense } from "react";
// import { useLocation } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";

import { ScrollArea } from "@/components/ui/scroll-area";
import { CardSkeleton } from "@/components/LoadingSkeleton";
import AppErrorBoundary from "@/components/AppErrorBoundary";

import Menu from "./subpages/Menu";

export default function Treatee() {
  // const location = useLocation();
  // const searchParams = new URLSearchParams(location.search);
  // const activeTab = searchParams.get("tab") || "menu";

  // CODES FOR POTENTIAL FUTURE IMPLEMENTATION
  // const renderContent = () => {
  //   switch (activeTab) {
  //     case "menu":
  //       return <Menu />;
  //     // case "booked":
  //     //   return <Booked />;
  //     default:
  //       return <Menu />;
  //   }
  // };

  return (
    <ScrollArea>
      <div className="bg-transparent py-4">
        <ErrorBoundary FallbackComponent={AppErrorBoundary}>
          <Suspense fallback={<CardSkeleton />}>
            {/* {renderContent()} */}
            <Menu />
          </Suspense>
        </ErrorBoundary>
      </div>
    </ScrollArea>
  );
}
