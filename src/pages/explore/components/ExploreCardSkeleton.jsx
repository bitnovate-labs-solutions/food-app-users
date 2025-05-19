import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Users } from "lucide-react";

export default function ExploreCardSkeleton() {
  return (
    <Card className="overflow-hidden mb-6 bg-white rounded-xl border border-gray-100">
      {/* CARD HEADER + IMAGE ====================================== */}
      <div className="relative w-full h-[180px]">
        <Skeleton className="w-full h-full" />

        {/* TOP LABELS */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <div className="flex gap-2">
            <Skeleton className="h-7 w-24 rounded-full" />
            <Skeleton className="h-7 w-24 rounded-full" />
          </div>
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>

        {/* MENU PACKAGE INFO */}
        <div className="absolute bottom-4 left-4 right-4 space-y-2">
          <div>
            <Skeleton className="h-4 w-32 mb-1" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3 mt-1" />
          </div>
          <Skeleton className="h-6 w-40 rounded-lg" />
        </div>
      </div>

      {/* CARD FOOTER ====================================== */}
      <div className="px-3 py-3 bg-white">
        {/* STATS GRID */}
        <div className="grid grid-cols-2 gap-2">
          {/* TREATERS SECTION */}
          <div className="bg-gray-50 rounded-xl p-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5 text-gray-300" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-5 w-12" />
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex -space-x-1.5">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="w-7 h-7 rounded-lg" />
                ))}
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          </div>

          {/* TREATEES SECTION */}
          <div className="bg-gray-50 rounded-xl p-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-gray-300" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-5 w-12" />
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex -space-x-1.5">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="w-7 h-7 rounded-lg" />
                ))}
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
} 