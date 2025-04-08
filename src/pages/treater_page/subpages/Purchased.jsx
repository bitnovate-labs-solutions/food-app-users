import { useState, Suspense } from "react";
import { usePurchasedItems } from "@/hooks/usePurchases";

// COMPONENTS
import ErrorComponent from "@/components/ErrorComponent";
import PurchaseCard from "../components/PurchaseCard";
import RedeemQRModal from "../components/RedeemQRModal";
import PackageDetailsModal from "../components/PackageDetailsModal";

// Separate component for the purchase list to enable suspense
function PurchaseList() {
  const [showQRCode, setShowQRCode] = useState(null);
  const [showPackageDetails, setShowPackageDetails] = useState(null);
  const [selectedQRIndex, setSelectedQRIndex] = useState(0); // Track which QR code is being shown

  // HOOKS
  const { data: purchasedItems, error } = usePurchasedItems();

  // LOADING AND ERROR HANDLERS
  if (error) return <ErrorComponent message={error.message} />;

  // Process and group purchase items by menu package
  const processedItems =
    purchasedItems?.map((item) => {
      const purchaseItem = item.purchase_items?.[0];

      // Generate QR codes based on quantity
      const qrCodes = Array.from(
        { length: purchaseItem?.quantity || 0 },
        (_, index) => ({
          id: `${purchaseItem?.id}-${index}`,
          code: `${purchaseItem?.id}-${index}`,
          used: purchaseItem?.used || false,
        })
      );

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
  const combinedPurchase =
    selectedProcessedItem && selectedPurchases?.length
      ? {
          ...selectedPurchases[0],
          purchase_items: selectedPurchases
            .flatMap((p) => p.purchase_items)
            .filter(
              (item) =>
                item.menu_packages.id === selectedProcessedItem.menuPackageId
            ),
          currentQRCode: selectedProcessedItem.qrCodes[selectedQRIndex]?.code,
          totalQRCodes: selectedProcessedItem.qrCodes.length,
          unusedQRCodes: selectedProcessedItem.qrCodes.filter((qr) => !qr.used)
            .length,
          qrIndex: selectedQRIndex,
        }
      : null;

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

  // Reset QR index when closing modal
  const handleCloseQR = () => {
    setShowQRCode(null);
    setSelectedQRIndex(0);
  };

  return (
    <>
      {processedItems.map((item) => (
        <PurchaseCard
          key={item.id}
          item={item}
          onShowQR={(id) => setShowQRCode(id)}
          onShowDetails={(id) => setShowPackageDetails(id)}
        />
      ))}

      {processedItems.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No purchased items yet
        </div>
      )}

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
