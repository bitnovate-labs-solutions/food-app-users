# Back Office RLS Policies Setup Guide

## Overview

This guide explains the Row Level Security (RLS) policies for all back office tables. These policies control who can view, create, update, and delete data in your Supabase back office database.

## Quick Setup

1. Go to your **Back Office Supabase Dashboard** (VITE_SECOND_SUPABASE_URL)
2. Navigate to **SQL Editor**
3. Copy and paste the entire contents of `migrations/setup_back_office_rls.sql`
4. Click **"Run"** to execute all policies

## Policy Summary by Table

### 1. **vendors** Table

**Public Access:**
- ✅ View verified vendors only

**Authenticated Users:**
- ✅ View their own vendor record
- ✅ Create their own vendor record (for registration)
- ✅ Update their own vendor record

**Rationale:** Vendors need to manage their own business information, but only verified vendors are visible to the public.

---

### 2. **restaurants** Table

**Public Access:**
- ✅ View active restaurants only

**Authenticated Users:**
- ✅ View all restaurants (for browsing)

**Vendors:**
- ✅ View their own restaurants
- ✅ Create restaurants for their vendor account
- ✅ Update their own restaurants
- ✅ Delete their own restaurants

**Rationale:** Public users should only see active restaurants. Vendors can fully manage their own restaurants.

---

### 3. **menu_categories** Table

**Public Access:**
- ✅ View categories for active restaurants only

**Authenticated Users:**
- ✅ View all categories

**Vendors:**
- ✅ Full CRUD access to categories for their restaurants

**Rationale:** Menu categories are public for active restaurants, but only vendors can manage them.

---

### 4. **menu_items** Table

**Public Access:**
- ✅ View available menu items for active restaurants only

**Authenticated Users:**
- ✅ View all menu items

**Vendors:**
- ✅ Full CRUD access to menu items for their restaurants

**Rationale:** Only available menu items from active restaurants are public. Vendors manage their full menu.

---

### 5. **redemption_logs** Table

**Vendors:**
- ✅ View redemption logs for their restaurants
- ✅ Create redemption logs
- ✅ Update redemption logs

**Note:** This table is vendor-only. Regular users cannot access redemption logs directly (they would access through purchase_items or voucher_instances in the main database).

**Rationale:** Redemption logs are sensitive business data that should only be accessible to the restaurant vendor.

---

### 6. **vouchers** Table

**Public Access:**
- ✅ View active vouchers (not expired) for active restaurants

**Authenticated Users:**
- ✅ View all vouchers

**Vendors:**
- ✅ Full CRUD access to vouchers for their restaurants

**Rationale:** Active vouchers are public for marketing, but vendors control voucher creation and management.

---

### 7. **transactions** Table

**Vendors:**
- ✅ View transactions for their restaurants
- ✅ Create transactions (consider restricting to service role)
- ✅ Update transactions for their restaurants

**Important Note:** Transactions are typically created by the system/backend during purchase processing. You may want to restrict INSERT to service role only by removing the INSERT policy and using a database function instead.

**Rationale:** Transactions are sensitive financial data that should only be accessible to the restaurant vendor.

---

## Access Control Pattern

All policies follow this pattern:

1. **Public Access:** Limited to active/verified content only
2. **Authenticated Users:** Can view more content than public
3. **Vendors:** Can manage content for their own restaurants only

The vendor check uses:
```sql
EXISTS (
  SELECT 1 FROM restaurants
  JOIN vendors ON vendors.id = restaurants.vendor_id
  WHERE restaurants.id = [table].restaurant_id
  AND vendors.user_id = auth.uid()
)
```

This ensures vendors can only access data for restaurants they own.

---

## Important Considerations

### 1. **Service Role Access**
- Service role bypasses all RLS policies
- Use service role for backend operations that need full access
- Consider creating database functions for sensitive operations (like transaction creation)

### 2. **Admin Roles**
- Current policies don't include admin/superuser access
- If you need admins to access all data, add policies like:
  ```sql
  CREATE POLICY "Admins can access all"
  ON [table] FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE auth_user_id = auth.uid()
      AND role = 'admin'
    )
  );
  ```

### 3. **Transaction Creation**
- The INSERT policy for transactions allows vendors to create transactions
- Consider restricting this to service role only and using a database function
- Example function:
  ```sql
  CREATE OR REPLACE FUNCTION create_transaction(...)
  RETURNS uuid
  SECURITY DEFINER
  AS $$
  -- Insert transaction logic
  $$;
  ```

### 4. **User Access to Their Own Data**
- Current policies don't allow users to view their own purchases/transactions
- If users need to view their purchase history, you'll need to:
  - Join with the main database's `purchases` table
  - Or add policies that check `purchaser_id = auth.uid()`

### 5. **Testing**
- Test policies with different user roles:
  - Unauthenticated (public)
  - Regular authenticated user
  - Vendor user
  - Service role (if applicable)

---

## Troubleshooting

### Error: "new row violates row-level security policy"
- Check that the user has the correct permissions
- Verify the vendor relationship exists
- Ensure the restaurant status is correct (for public access)

### Error: "permission denied for table"
- Make sure RLS is enabled: `ALTER TABLE [table] ENABLE ROW LEVEL SECURITY;`
- Verify policies are created correctly
- Check that the user is authenticated (for authenticated policies)

### Can't see data that should be visible
- Check the USING clause matches your data
- Verify restaurant status is 'active' (for public access)
- Ensure vendor relationship is correct

---

## Next Steps

1. ✅ Run the RLS setup SQL
2. ✅ Test policies with different user roles
3. ✅ Adjust policies based on your specific business logic
4. ✅ Consider adding admin roles if needed
5. ✅ Restrict transaction creation to service role if needed
6. ✅ Add user-facing policies if users need to view their own data

---

## Related Files

- `migrations/setup_back_office_rls.sql` - Main RLS policies file
- `migrations/setup_restaurant_images_storage.sql` - Storage policies for restaurant images
- `migrations/RESTAURANT_IMAGES_SETUP.md` - Restaurant images setup guide

