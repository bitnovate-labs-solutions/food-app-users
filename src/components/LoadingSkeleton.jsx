import { Skeleton } from "@/components/ui/skeleton";

// GENERAL CARD SKELETION
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6 p-4">
      {/* Image Skeleton */}
      <Skeleton className="w-auto h-[130px]" />

      {/* Content Skeleton */}
      <div className="px-1 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Food Card Skeleton
export function MenuCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-3">
        <div className="flex gap-3">
          {/* Image Skeleton */}
          <Skeleton className="w-26 h-26 rounded-lg flex-shrink-0" />

          {/* Content Skeleton */}
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>

            <div className="grid grid-cols-5 mt-2">
              <div className="mr-2 col-span-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-8" />
                </div>
                <div className="mt-1">
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
              <div className="flex items-end col-span-2 ml-2">
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Explore Card Skeleton
export function ExploreCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
      {/* Image Skeleton */}
      <Skeleton className="w-full h-[130px]" />

      {/* Content Skeleton */}
      <div className="p-4">
        <div className="flex justify-between items-center">
          {/* Treaters Section */}
          <div className="w-1/2">
            <Skeleton className="h-4 w-16 mb-2" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-12" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>

          {/* Treatee Section */}
          <div className="w-1/2 ml-4">
            <Skeleton className="h-4 w-16 mb-2" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-12" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Treatee Card Skeleton
export function TreateeCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Image Skeleton */}
      <div className="relative w-full h-[130px]">
        <Skeleton className="w-full h-full" />
      </div>

      {/* Content Skeleton */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-4 w-24" />
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  );
}

// Order Card Skeleton
export function OrderCardSkeleton() {
  return (
    <div className="flex p-3 shadow-lg rounded-lg">
      {/* Image Skeleton */}
      <Skeleton className="w-24 h-24 rounded-lg flex-shrink-0" />

      {/* Content Skeleton */}
      <div className="flex-1 ml-2 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>

        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  );
}

// Profile Page Skeleton
export function ProfileSkeleton() {
  return (
    <div>
      <div className="bg-white border-none rounded-none pb-20">
        <div className="space-y-4 p-3">
          {/* Profile Image Section */}
          <div className="h-[450px] w-full relative">
            <Skeleton className="w-full h-full rounded-2xl" />

            {/* User Info Overlay */}
            <div className="absolute bottom-20 left-6 space-y-2">
              <Skeleton className="h-8 w-48" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          </div>

          {/* Header Title */}
          <div className="border border-gray-100 shadow-lg rounded-2xl py-5 mt-12 space-y-2">
            <Skeleton className="h-6 w-48 mx-auto" />
            <div className="flex justify-center">
              <Skeleton className="h-4 w-32" />
            </div>
          </div>

          <div className="space-y-4 mt-8">
            {/* About Me Section */}
            <div className="space-y-6 mb-8">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
            </div>

            {/* My Details Section */}
            <div className="space-y-6 mb-8">
              <Skeleton className="h-6 w-32" />
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>

            {/* Interests Section */}
            <div className="space-y-4 mb-8">
              <Skeleton className="h-6 w-32" />
              <div className="flex flex-wrap gap-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-6 w-20 rounded-full" />
                ))}
              </div>
            </div>

            {/* Languages Section */}
            <div className="space-y-4 mb-8">
              <Skeleton className="h-6 w-48" />
              <div className="flex flex-wrap gap-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-6 w-20 rounded-full" />
                ))}
              </div>
            </div>

            {/* Social Links Section */}
            <div className="space-y-6 mb-8">
              <Skeleton className="h-6 w-40" />
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>

            {/* Member Since Section */}
            <div className="space-y-6 mb-8">
              <Skeleton className="h-6 w-32" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
