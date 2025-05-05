// USAGE:
// FETCHES A LIST OF ALL OTHER USERS (EXCLUDING THE CURRENT USER)
// ===============================================================================================
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export const useUsers = (currentUserId) => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!currentUserId) return;

      try {
        const { data, error } = await supabase
          .from("user_profiles")
          .select(
            `
            *,
            user_profile_images!inner(
              id, 
              image_url,
              is_primary,
              position,
              scale,
              rotation,
              order
            )
          `
          )
          .neq("user_id", currentUserId);

        if (error) throw error;
        setUsers(data || []);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [currentUserId]);

  return { users, isLoading, error };
};
