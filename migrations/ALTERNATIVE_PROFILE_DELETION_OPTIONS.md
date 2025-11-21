# Profile Deletion Cleanup - Alternative Approaches

## Current Issue
The current approach using `pg_net` to call an Edge Function has several drawbacks:
- Requires pg_net extension
- Requires HTTP configuration (edge_url, service_role_key)
- Asynchronous (no guarantee of completion)
- More complex error handling
- Additional latency

## Recommended Solutions (Ranked)

### ✅ Option 1: Direct Storage Deletion (BEST)
**File:** `migrations/create_profile_deletion_cleanup_improved.sql`

**How it works:**
- Database trigger directly deletes files from `storage.objects` table
- Uses `SECURITY DEFINER` to bypass RLS
- Pattern matching: `profile_id/file_name`

**Pros:**
- ✅ Simple and fast (no HTTP calls)
- ✅ Synchronous (guaranteed execution)
- ✅ No external dependencies
- ✅ Already proven pattern (used for feedback images)
- ✅ Works immediately, no configuration needed

**Cons:**
- ⚠️ Requires `SECURITY DEFINER` (but safe in this context)
- ⚠️ Direct database access to storage (standard Supabase pattern)

**When to use:** Always - this is the simplest and most reliable approach.

---

### Option 2: Supabase Database Webhooks
**How it works:**
- Configure webhook in Supabase Dashboard
- Webhook triggers Edge Function automatically on DELETE
- Edge Function handles storage cleanup

**Setup:**
1. Go to Supabase Dashboard > Database > Webhooks
2. Create new webhook:
   - Table: `profiles`
   - Events: `DELETE`
   - Type: `HTTP Request`
   - URL: `https://your-project.supabase.co/functions/v1/cleanup-user-storage`
   - HTTP Method: `POST`
   - HTTP Headers: `Authorization: Bearer YOUR_SERVICE_ROLE_KEY`

**Pros:**
- ✅ Native Supabase feature
- ✅ No pg_net needed
- ✅ Can handle complex cleanup logic
- ✅ Retry mechanism built-in

**Cons:**
- ⚠️ Requires webhook configuration
- ⚠️ Still uses HTTP (async)
- ⚠️ More moving parts

**When to use:** If you need complex cleanup logic beyond storage deletion.

---

### Option 3: Application-Level Cleanup
**How it works:**
- Delete storage files in application code before deleting profile
- Use Supabase Storage API directly

**Example:**
```javascript
// In DeleteAccountDrawer.jsx or similar
const cleanupStorage = async (profileId) => {
  const buckets = ['user-avatars', 'feedback-images'];
  
  for (const bucket of buckets) {
    // List files
    const { data: files } = await supabase.storage
      .from(bucket)
      .list(profileId + '/', { recursive: true });
    
    if (files && files.length > 0) {
      const paths = files.map(f => `${profileId}/${f.name}`);
      await supabase.storage.from(bucket).remove(paths);
    }
  }
};

// Then delete profile
await cleanupStorage(user.id);
await supabase.from('profiles').delete().eq('id', user.id);
```

**Pros:**
- ✅ Full control over cleanup process
- ✅ Can show progress to user
- ✅ Easy to debug

**Cons:**
- ⚠️ Must remember to call in all deletion paths
- ⚠️ If app code fails, cleanup doesn't happen
- ⚠️ More code to maintain

**When to use:** If you need user feedback during cleanup or complex UI flows.

---

### Option 4: Hybrid Approach (Soft Delete + Cron Job)
**How it works:**
- Mark profile as deleted (soft delete)
- Background job periodically cleans up soft-deleted profiles
- Can be Edge Function with cron trigger or database function

**Pros:**
- ✅ Allows recovery period
- ✅ Can batch cleanup operations
- ✅ Doesn't slow down user deletion

**Cons:**
- ⚠️ Storage not cleaned immediately
- ⚠️ More complex setup
- ⚠️ Requires cron/scheduler

**When to use:** If you want a grace period for account recovery.

---

## Recommendation

**Use Option 1 (Direct Storage Deletion)** because:
1. It's the simplest and most reliable
2. Already proven in your codebase (feedbacks pattern)
3. No external dependencies or configuration
4. Synchronous execution guarantees cleanup
5. Matches Supabase best practices
6. **Handles both soft deletes (your current behavior) and hard deletes**

### Important Note About Your Current Implementation

Your app currently uses **soft deletes** - when users delete their account, `app_users.status` is set to `'deleted'`, but the profile row is never actually deleted. The improved solution handles this by:

1. **Soft Delete Trigger**: Fires when `app_users.status` changes to `'deleted'` (your current flow)
2. **Hard Delete Trigger**: Fires when `profiles` row is actually deleted (for admin actions or future cleanup)

This means the cleanup will work immediately with your existing `DeleteAccountDrawer` component without any code changes!

The current `pg_net` approach is over-engineered for this use case. Direct deletion is faster, simpler, and more reliable.

## Migration Path

1. **If you haven't deployed the pg_net solution yet:**
   - Use `create_profile_deletion_cleanup_improved.sql` directly

2. **If you already deployed the pg_net solution:**
   ```sql
   -- Drop old trigger
   DROP TRIGGER IF EXISTS on_profile_deleted ON public.profiles;
   DROP FUNCTION IF EXISTS handle_profile_deleted();
   
   -- Run the improved version
   \i migrations/create_profile_deletion_cleanup_improved.sql
   ```

3. **Optional: Remove pg_net extension** (if not used elsewhere)
   ```sql
   DROP EXTENSION IF EXISTS pg_net;
   ```

