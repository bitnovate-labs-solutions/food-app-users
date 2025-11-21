import { useState } from "react";
import SlideDrawer from "@/components/SlideDrawer";
import { Trash2, ChevronRight, Lock } from "lucide-react";
import DeleteAccountDrawer from "./DeleteAccountDrawer";
import ChangePasswordDrawer from "./ChangePasswordDrawer";
import { version } from "@/lib/version";

export default function SettingsDrawer({ open, onOpenChange }) {
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <>
      <SlideDrawer
        open={open}
        onClose={handleClose}
        title="Settings"
        direction="right"
        zIndex={{ overlay: 59, drawer: 60 }}
      >
        <div className="px-6 py-6 overflow-y-auto">
          <div className="space-y-4">
            {/* CHANGE PASSWORD OPTION */}
            <div
              className="flex items-center justify-between py-3 cursor-pointer hover:bg-gray-50 transition-colors rounded-lg"
              onClick={() => {
                setIsChangePasswordOpen(true);
              }}
            >
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-gray-800" />
                <span className="text-sm font-light text-gray-800">
                  Change password
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>

            {/* DELETE ACCOUNT OPTION */}
            <div
              className="flex items-center justify-between py-3 cursor-pointer hover:bg-gray-50 transition-colors rounded-lg"
              onClick={() => {
                setIsDeleteAccountOpen(true);
              }}
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5 text-gray-800" />
                <span className="text-sm font-light text-gray-800">
                  Delete account
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* VERSION */}
          <div className="border-t border-gray-200 mt-6 pt-6 pb-8 text-center">
            <p className="text-xs text-gray-400">Version: {version}</p>
          </div>
        </div>
      </SlideDrawer>

      {/* CHANGE PASSWORD DRAWER */}
      <ChangePasswordDrawer
        open={isChangePasswordOpen}
        onOpenChange={setIsChangePasswordOpen}
      />

      {/* DELETE ACCOUNT DRAWER */}
      <DeleteAccountDrawer
        open={isDeleteAccountOpen}
        onOpenChange={setIsDeleteAccountOpen}
      />
    </>
  );
}

