import { useState, Suspense, useCallback } from "react";
import { usePurchasedItems } from "@/hooks/usePurchases";
import { useQueryClient } from "@tanstack/react-query";
import { useVoucherRealtimeUpdates } from "@/hooks/useVoucherRealtimeUpdates";
import { useAuth } from "@/context/AuthContext";

// COMPONENTS
import ErrorComponent from "@/components/ErrorComponent";
import PurchaseCard from "../components/PurchaseCard";
import RedeemQRModal from "../components/RedeemQRModal";
import PackageDetailsModal from "../components/PackageDetailsModal";
import { toast } from "sonner";

// Separate component for the purchase list to enable suspense
function PurchaseList() {
  const queryClient = useQueryClient();
  const [showQRCode, setShowQRCode] = useState(null);
  const [showPackageDetails, setShowPackageDetails] = useState(null);
  const [selectedQRIndex, setSelectedQRIndex] = useState(0); // Track which QR code is being shown

  // HOOKS
  const { data: purchasedItems, error, isLoading } = usePurchasedItems();
  const { user } = useAuth();

  // Reset QR index when closing modal
  const handleCloseQR = useCallback(() => {
    setShowQRCode(null);
    setSelectedQRIndex(0);
  }, []);

  // --- Realtime voucher updates ---
  const handleVoucherUpdate = useCallback(
    (updatedVoucher) => {
      queryClient.setQueryData(["purchasedItems"], (oldData) => {
        if (!oldData) return oldData;

        let voucherJustFullyRedeemed = false;

        const newData = oldData.map((purchaseGroup) => {
          const updatedPurchaseGroup = { ...purchaseGroup };

          updatedPurchaseGroup.purchase_items =
            updatedPurchaseGroup.purchase_items.map((item) => {
              const updatedItem = { ...item };

              updatedItem.voucher_instances = updatedItem.voucher_instances.map(
                (voucher) => {
                  if (voucher.id === updatedVoucher.id) {
                    return { ...voucher, ...updatedVoucher };
                  }
                  return voucher;
                }
              );

              // ✅ After updating vouchers, check if this item's vouchers are ALL used
              const hasUnused = updatedItem.voucher_instances.some(
                (v) => !v.used
              );

              if (!hasUnused) {
                voucherJustFullyRedeemed = true;
              }

              return updatedItem;
            });

          return updatedPurchaseGroup;
        });

        // ✅ Trigger toast AFTER cache update
        if (voucherJustFullyRedeemed) {
          handleCloseQR(); // ✅ Close the modal immediately
          toast.success("🎉 Voucher Fully Redeemed!");
        }

        return newData;
      });
    },
    [queryClient, handleCloseQR]
  );

  useVoucherRealtimeUpdates(user?.id, handleVoucherUpdate);

  // LOADING AND ERROR HANDLERS
  if (isLoading) return <PurchaseCardSkeleton />;
  if (error) return <ErrorComponent message={error.message} />;

  // Process and group purchase items by menu package
  const processedItems =
    purchasedItems?.map((item) => {
      const purchaseItem = item.purchase_items?.[0];

      // ✅ Now each QR code represents one actual voucher_instance.
      const qrCodes =
        purchaseItem?.voucher_instances?.map((instance) => ({
          id: instance.id,
          code: instance.id, // now QR code will carry voucher_instance id
          used: instance.used,
          redeemed_at: instance.redeemed_at,
        })) || [];

      return {
        ...item,
        id: item.id,
        purchaseIds: [item.id],
        menuPackageId: purchaseItem?.menu_packages?.id,
        qrCodes: qrCodes,
      };
    }) || [];

  // Find the selected item from processed items
  const selectedProcessedItem = processedItems.find(
    (item) => item.id === showQRCode || item.id === showPackageDetails
  );

  // Find all related purchases for the selected item
  const selectedPurchases = selectedProcessedItem
    ? purchasedItems?.filter((purchase) =>
        selectedProcessedItem.purchaseIds.includes(purchase.id)
      )
    : [];

  // Combine all related purchases into one purchase object and filter for the correct menu package
  // ✅ This ensures the modal only navigates among unused QR codes.
  const unusedQRCodes =
    selectedProcessedItem?.qrCodes.filter((qr) => !qr.used) || [];

  const combinedPurchase = {
    ...selectedPurchases[0],
    purchase_items: selectedPurchases
      .flatMap((p) => p.purchase_items)
      .filter(
        (item) => item.menu_packages.id === selectedProcessedItem.menuPackageId
      ),
    qrCodes: unusedQRCodes,
    currentQRCode: unusedQRCodes[selectedQRIndex]?.code,
    totalQRCodes: selectedProcessedItem?.qrCodes?.length || 0,
    unusedQRCodes: unusedQRCodes.length,
    qrIndex: selectedQRIndex,
  };

  // Handle QR code navigation
  const handleNextQR = () => {
    if (selectedProcessedItem) {
      const nextIndex =
        (selectedQRIndex + 1) % selectedProcessedItem.qrCodes.length;
      setSelectedQRIndex(nextIndex);
    }
  };

  const handlePrevQR = () => {
    if (selectedProcessedItem) {
      const prevIndex =
        selectedQRIndex === 0
          ? selectedProcessedItem.qrCodes.length - 1
          : selectedQRIndex - 1;
      setSelectedQRIndex(prevIndex);
    }
  };

  const hasNoPurchases = processedItems.length === 0;
  const allVouchersUsed = processedItems.every((item) =>
    item.qrCodes.every((qr) => qr.used)
  );

  return (
    <>
      {processedItems.map((item) => {
        const unusedVouchers = item.qrCodes.filter((qr) => !qr.used);

        if (unusedVouchers.length === 0) {
          return null; // Don't show this purchase anymore
        }

        return (
          <PurchaseCard
            key={item.id}
            item={item}
            onShowQR={(id) => setShowQRCode(id)}
            onShowDetails={(id) => setShowPackageDetails(id)}
          />
        );
      })}

      {hasNoPurchases ? (
        <div className="text-center py-8 text-muted-foreground">
          No purchased items yet.
        </div>
      ) : allVouchersUsed ? (
        <div className="text-center py-8 text-muted-foreground">
          All vouchers have been redeemed.
        </div>
      ) : null}

      <RedeemQRModal
        isOpen={!!showQRCode}
        onClose={handleCloseQR}
        purchaseItem={combinedPurchase}
        onNextQR={handleNextQR}
        onPrevQR={handlePrevQR}
      />

      <PackageDetailsModal
        isOpen={!!showPackageDetails}
        onClose={() => setShowPackageDetails(null)}
        purchaseItem={combinedPurchase}
      />
    </>
  );
}

// Loading skeleton for purchase cards
function PurchaseCardSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="h-32 bg-gray-100 rounded-xl animate-pulse"
        ></div>
      ))}
    </div>
  );
}

// Main Purchased component
export default function Purchased() {
  return (
    <div className="space-y-4 pb-22">
      <Suspense fallback={<PurchaseCardSkeleton />}>
        <PurchaseList />
      </Suspense>
    </div>
  );
}
