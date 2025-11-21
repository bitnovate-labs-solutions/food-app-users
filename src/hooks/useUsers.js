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
          .from("app_users")
          .select("*")
          .neq("profile_id", currentUserId);

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
