- React Query Caching Terms:
    -> staleTime (5 minutes = 300,000ms):
        - How long data is considered "fresh"
        - During this time, React Query won't refetch the data
        - After this time, data is marked as "stale" but still used
        Example: If you fetch menu packages, they'll be considered fresh for 5 minutes
    -> cacheTime (30 minutes = 1,800,000ms):
        - How long inactive data remains in cache
        - After this time, unused data is garbage collected
        Example: If you navigate away from a page using menu packages, the data stays in cache for 30 minutes

1. useMenuPackages ->
    - Fetches menu packages directly with pagination and filtering
    - Uses React Query for caching and state management
    - Uses pagination or filtering to fetch only needed packages
    - Includes restaurant and menu image data
    - Can be used as a base for both restaurant and purchase contexts
2. useRestaurantsBO -> 
    - For restaurant-centric views (treater menu and explore)
    - Uses the useMenuPackages hook
    - has menu packages nested under restaurants
3. useTreaterPurchases -> 
    - for purchase-centric views (treatee menu)
    - Use the new useMenuPackages hook
    - Fetch purchase and interest data only when needed
    - Use separate queries for purchase and interest data

