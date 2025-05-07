import { useRedeemedVouchers } from "@/hooks/useRedeemedVouchers";
// import { Loader2 } from "lucide-react";
import { useState } from "react";
import RedeemedVoucherCard from "../components/RedeemedVoucherCard";
import VoucherDetailsModal from "../components/VoucherDetailsModal";
import LoadingComponent from "@/components/LoadingComponent";
import ImageWithFallback from "@/components/ImageWithFallback";

// ASSETS
import NoData from "@/assets/images/no-data.svg";

export default function HistoryPage() {
  const { data: redeemedVouchers, isLoading, error } = useRedeemedVouchers();
  const [showDetails, setShowDetails] = useState(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        {/* <Loader2 className="animate-spin h-8 w-8 text-primary" /> */}
        <LoadingComponent />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 mt-10">
        Failed to load redeemed vouchers.
      </div>
    );
  }

  if (redeemedVouchers.length === 0) {
    return (
      <div className="fixed inset-0 max-w-sm mx-auto flex flex-col items-center justify-center px-6">
        <ImageWithFallback src={NoData} className="w-50 h-auto mb-6" />
        <p className="text-lightgray text-sm">
          You have not redeemed any vouchers yet.
        </p>
        <p className="text-lightgray text-sm mb-10 text-center px-10">
          Redeem your vouchers to see them here!
        </p>
      </div>
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
