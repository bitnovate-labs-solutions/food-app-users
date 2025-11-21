# Supabase Realtime Setup Guide

## Overview

This guide explains which tables should have Realtime enabled and why.

## Tables That NEED Realtime

### ✅ **Restaurants** (`restaurants`)
**Why:** Users need to see new restaurants and status changes immediately
- New restaurants appear in listings
- Status changes (active/inactive) affect visibility
- Location updates affect search results

### ✅ **Menu Items** (`menu_items`)
**Why:** Critical for restaurant detail pages - users need to see new menu items when vendors add them
- Vendors frequently add/update menu items
- Availability changes affect ordering
- Price updates need to be reflected immediately

### ✅ **Menu Categories** (`menu_categories`)
**Why:** Changes affect menu organization and display
- New categories appear in menus
- Sort order changes affect display

### ✅ **Vendors** (`vendors`)
**Why:** Vendor information changes affect restaurant displays
- Verification status changes
- Business details updates
- Logo/image updates

### ✅ **Vouchers** (`vouchers`)
**Why:** New vouchers and expiration updates
- New promotional vouchers appear
- Expiration affects availability
- Status changes affect visibility

### ✅ **Reviews** (`reviews`)
**Why:** User-generated content that benefits from live updates
- New reviews appear immediately
- Rating updates affect restaurant ratings
- Status changes (active/deleted) affect display

## Tables That MAY Need Realtime (Optional)

### ⚠️ **Transactions** (`transactions`)
**When to enable:** Only if you have real-time purchase notifications
- Users see purchase confirmations immediately
- Vendors see new transactions in real-time dashboard

### ⚠️ **Redemption Logs** (`redemption_logs`)
**When to enable:** Only if vendors have a real-time redemption dashboard
- Vendors see redemptions as they happen
- Status updates appear immediately

### ⚠️ **Mascots** (`mascots`)
**When to enable:** Only if mascots are added/updated frequently
- New mascots appear in collections
- Rarely changes, so polling may be sufficient

### ⚠️ **Collection Sets** (`collection_sets`)
**When to enable:** Only if collection sets change frequently
- New collections appear
- Status/availability updates
- Usually changes infrequently

## Tables That Should NOT Have Realtime

### ❌ **Profiles** (`profiles`)
**Why:** User identity data changes rarely
- Email/phone updates are infrequent
- Role changes are administrative
- No need for real-time updates

### ❌ **App Users** (`app_users`)
**Why:** User profile data changes infrequently
- Points updates can be handled via polling
- Location updates are frequent but not critical for real-time
- Status changes are rare

### ❌ **Feedbacks** (`feedbacks`)
**Why:** One-time submissions
- Users submit feedback once
- No need for real-time updates
- Admin reviews happen asynchronously

## How to Enable Realtime

### Method 1: SQL Migration (Recommended)
Run the migration file:
```sql
-- See migrations/enable_realtime_for_tables.sql
```

### Method 2: Supabase Dashboard
1. Go to **Database** → **Replication**
2. Find the table you want to enable
3. Toggle **Realtime** to ON

### Method 3: SQL Command
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE table_name;
```

## Verify Realtime is Enabled

Check which tables have Realtime enabled:
```sql
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```

## Disable Realtime

To remove a table from Realtime:
```sql
ALTER PUBLICATION supabase_realtime DROP TABLE table_name;
```

## Performance Considerations

1. **WebSocket Connections:** Each Realtime subscription uses a WebSocket connection
2. **Resource Usage:** Too many subscriptions can impact performance
3. **RLS Policies:** Realtime respects RLS - users can only subscribe to data they can read
4. **Frequency:** Only enable for tables that change frequently and need immediate updates

## Current Implementation

The following hooks use Realtime subscriptions:
- `useRestaurantsBO` - Listens to `menu_items` and `restaurants` changes
- `useConversations` - Listens to `conversations` and `messages` changes
- `useInterestedUsers` - Listens to `purchase_interests` changes
- `useVoucherRealtimeUpdates` - Listens to `voucher_instances` changes

## Troubleshooting

### Realtime not working?
1. Check if Realtime is enabled for the table
2. Verify RLS policies allow the user to read the data
3. Check browser console for WebSocket connection errors
4. Verify Supabase project has Realtime enabled (Settings → API)

### Too many subscriptions?
- Consider polling for infrequently changing data
- Use filters to limit subscription scope
- Clean up subscriptions in useEffect cleanup

