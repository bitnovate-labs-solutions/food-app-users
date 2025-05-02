// COMPONENTS
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";

export default function RedeemQRModal({ isOpen, onClose, purchaseItem }) {
  if (
    !purchaseItem ||
    !purchaseItem.qrCodes ||
    purchaseItem.qrCodes.length === 0
  ) {
    return null;
  }

  const { qrCodes, qrIndex } = purchaseItem;
  const currentQR = qrCodes[qrIndex];
  const menuPackage = purchaseItem.purchase_items[0]?.menu_packages;

  if (!currentQR) return null;

  // 🔥 Generate proper JSON-encoded QR payload
  const qrPayload = JSON.stringify({
    voucher_instance_id: currentQR.id,
  });

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[425px] bg-white rounded-2xl shadow-2xl border-none">
        <DialogHeader>
          <DialogTitle className="text-center text-primary">
            Redeem QR Code
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4">
          {/* QR Code Display */}
          <div className="flex justify-center">
            <QRCodeSVG
              value={qrPayload}
              size={300}
              level="H"
              includeMargin={true}
              className="bg-white p-4"
            />
          </div>

          {/* Package Info */}
          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold text-primary">
              {menuPackage?.name}
            </h3>
            <p className="text-sm text-muted-foreground text-darkgray">
              {menuPackage?.restaurant?.name}
            </p>
          </div>

          {/* QR Code Progress */}
          <div className="text-center text-sm text-muted-foreground">
            <p>
              QR Code {qrIndex + 1} of {qrCodes.length}
            </p>
            <p>{qrCodes.length} remaining</p>
          </div>

          {/* Instructions */}
          <div className="text-center text-sm text-muted-foreground text-lightgray">
            <p>
              Show this QR code to the restaurant staff to redeem your purchase.
            </p>
            <p>Each QR code can only be used once.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
