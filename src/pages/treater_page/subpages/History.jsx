import { useRedeemedVouchers } from "@/hooks/useRedeemedVouchers";
// import { Loader2 } from "lucide-react";
import { useState } from "react";
import RedeemedVoucherCard from "../components/RedeemedVoucherCard";
import VoucherDetailsModal from "../components/VoucherDetailsModal";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";
import EmptyState from "@/components/common/EmptyState";

export default function HistoryPage() {
  const { data: redeemedVouchers, isLoading, error } = useRedeemedVouchers();
  const [showDetails, setShowDetails] = useState(null);

  // LOADING AND ERROR HANDLERS ----------------------------------------------
  if (isLoading) return <LoadingComponent type="screen" text="Loading..." />;
  if (error) return <ErrorComponent message={error.message} />;

  // SHOW EMPTY STATE COMPONENT IF NO REDEEMED VOUCHERS ----------------------------------------------
  if (redeemedVouchers.length === 0) {
    return (
      <EmptyState
        // imageSrc={NoData}
        icon="search"
        description={
          <>
            <p className="text-lightgray text-sm">
              You have not redeemed any vouchers yet.
            </p>
            <p className="text-lightgray text-sm mb-10 text-center px-10">
              Redeem your vouchers to see them here!
            </p>
          </>
        }
        fixed
      />
    );
  }

  return (
    <div className="space-y-4">
      {redeemedVouchers.map((voucher) => (
        <RedeemedVoucherCard
          key={voucher.id}
          voucher={voucher}
          onShowDetails={setShowDetails}
        />
      ))}

      <VoucherDetailsModal
        voucher={showDetails}
        open={!!showDetails}
        onOpenChange={() => setShowDetails(null)}
      />
    </div>
  );
}
