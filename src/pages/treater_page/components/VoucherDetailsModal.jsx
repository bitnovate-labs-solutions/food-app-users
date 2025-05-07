import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { MapPin, Clock, Phone } from "lucide-react";
import ImageWithFallback from "@/components/ImageWithFallback";

export default function VoucherDetailsModal({ voucher, open, onOpenChange }) {
  if (!voucher) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-0 bg-white border border-white/20 shadow-md rounded-2xl overflow-hidden">
        {/* Restaurant Image */}
        <div className="w-full h-48 relative">
          <ImageWithFallback
            src={voucher.menu_package?.restaurant?.image_url}
            alt={voucher.menu_package?.restaurant?.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="px-6 pb-6 pt-4">
          <DialogHeader>
            <DialogTitle className="text-xl text-gray-800 font-bold">
              {voucher.menu_package?.restaurant?.name}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 mt-2">
              {voucher.menu_package?.restaurant?.description}
            </DialogDescription>
          </DialogHeader>

          {/* Package Details */}
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary">
                Package Details
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900">
                  {voucher.menu_package?.name}
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  {voucher.menu_package?.description}
                </p>
                <p className="text-primary font-medium mt-2">
                  RM {voucher.menu_package?.price}
                </p>
              </div>
            </div>

            {/* Restaurant Info */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-primary">
                Restaurant Information
              </h3>

              {/* Location */}
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">
                    {voucher.menu_package?.restaurant?.location}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {voucher.menu_package?.restaurant?.address}
                  </p>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 mt-1 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">
                    Opening Hours
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {voucher.menu_package?.restaurant?.hours}
                  </p>
                </div>
              </div>

              {/* Contact */}
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-1 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Contact</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {voucher.menu_package?.restaurant?.phone_number}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 