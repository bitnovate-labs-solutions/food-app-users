import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

export function useVoucherRealtimeUpdates(userId, onVoucherUpdate) {
  useEffect(() => {
    if (!userId) return;

    const subscription = supabase
      .channel("voucher_instances_updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "voucher_instances",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log("Received realtime voucher change:", payload);

          // You can update UI directly here
          if (onVoucherUpdate) {
            onVoucherUpdate(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [userId, onVoucherUpdate]);
}
