import { useRedeemedVouchers } from "@/hooks/useRedeemedVouchers";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react"; // optional loading spinner
import dayjs from "dayjs"; // format date
// import { Suspense } from "react";

export default function HistoryPage() {
  const { data: redeemedVouchers, isLoading, error } = useRedeemedVouchers();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
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
      <div className="text-center text-muted-foreground mt-10">
        You have not redeemed any vouchers yet.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Redeemed Vouchers</h1>

      {redeemedVouchers.map((voucher) => (
        <Card
          key={voucher.id}
          className="border border-gray-200 rounded-xl shadow-md p-4"
        >
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg">
                  {voucher.purchase_items?.menu_packages?.name || "Package"}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {voucher.purchase_items?.menu_packages?.restaurant?.name ||
                    "Restaurant"}
                </p>
              </div>

              <div className="text-xs text-right text-muted-foreground">
                {voucher.redeemed_at
                  ? dayjs(voucher.redeemed_at).format("MMM DD, YYYY")
                  : "Unknown date"}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
