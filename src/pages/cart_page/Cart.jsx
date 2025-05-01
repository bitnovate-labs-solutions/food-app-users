import { useState } from "react";
import ShoppingCart from "./subpages/ShoppingCart";
import OrderSuccess from "./subpages/OrderSuccess";
import useCartStore from "@/lib/cart_store";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
// import { mockApi } from "@/lib/mockData";

export default function Cart() {
  const [orderComplete, setOrderComplete] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { items, clearCart } = useCartStore();

  // HANDLE PURCHASE
  const handlePurchase = async () => {
    try {
      if (!user) {
        throw new Error("User must be logged in to make a purchase");
      }

      // Create a purchase record
      const { data: purchase, error: purchaseError } = await supabase
        .from("purchases")
        .insert({
          user_id: user.id,
          total_price: items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          ),
          status: "completed",
          image_url: items[0]?.menu_images?.[0]?.image_url || null, // Use the first item's image as the purchase image
        })
        .select()
        .single();

      if (purchaseError) throw purchaseError;

      // Create purchase items
      const purchaseItems = items.map((item) => ({
        purchase_id: purchase.id,
        package_id: item.package_id,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from("purchase_items")
        .insert(purchaseItems);

      if (itemsError) throw itemsError;

      // Clear the cart
      clearCart();

      // Invalidate relevant queries to trigger refetch
      queryClient.invalidateQueries(["foodItems"]);
      queryClient.invalidateQueries(["purchasedItems"]);

      // Show success state
      setOrderComplete(true);

      toast.success("Order placed successfully!", {
        duration: 2000,
      });
    } catch (error) {
      toast.error("Failed to place order. Please try again.");
      console.error("Purchase error:", error);
    }
  };

  if (orderComplete) {
    return <OrderSuccess />;
  }

  // return <ShoppingCart onSuccess={() => setOrderComplete(true)} />;
  return <ShoppingCart onSuccess={handlePurchase} />;
}
