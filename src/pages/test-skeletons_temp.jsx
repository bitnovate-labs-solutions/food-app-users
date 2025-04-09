import {
  TreaterCardSkeleton,
  ExploreCardSkeleton,
  TreateeCardSkeleton,
  OrderCardSkeleton,
  ProfileSkeleton,
  CardSkeleton,
} from "@/components/LoadingSkeleton";

export default function TestSkeletons() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      <section>
        <ProfileSkeleton />
      </section>

      <h2>Card</h2>
      <CardSkeleton />

      {/* Food Card Skeleton */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Food Card Skeleton</h2>
        <div className="space-y-4">
          <TreaterCardSkeleton />
          <TreaterCardSkeleton />
          <TreaterCardSkeleton />
        </div>
      </section>

      {/* Explore Card Skeleton */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Explore Card Skeleton</h2>
        <div className="space-y-4">
          <ExploreCardSkeleton />
          <ExploreCardSkeleton />
          <ExploreCardSkeleton />
        </div>
      </section>

      {/* Treatee Card Skeleton */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Treatee Card Skeleton</h2>
        <div className="space-y-4">
          <TreateeCardSkeleton />
          <TreateeCardSkeleton />
          <TreateeCardSkeleton />
        </div>
      </section>

      {/* Order Card Skeleton */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Order Card Skeleton</h2>
        <div className="space-y-4">
          <OrderCardSkeleton />
          <OrderCardSkeleton />
          <OrderCardSkeleton />
        </div>
      </section>
    </div>
  );
}
