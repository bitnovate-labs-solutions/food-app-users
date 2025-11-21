# Admin & Vendor Management Architecture for Mascots CRUD

## Overview

This document outlines the recommended architecture for managing admin and vendor roles together with CRUD operations for mascots in the Food Hunter application.

## Important: Dual Database Architecture

This application uses **two separate Supabase databases**:

1. **Main Database (`supabase`)**: User-facing data
   - `app_users` table
   - User authentication
   - User collections, points, treasure hunt data
   - **Mascots belong here** (user-facing feature)

2. **Back Office Database**: Business/vendor data
   - `vendors` table
   - `restaurants` table
   - `menu_items`, `menu_categories`
   - `reviews`, `vouchers`
   - All vendor/restaurant-related data

**Key Principle**: Mascots are **user-facing features** (collections, treasure hunt rewards), not vendor/restaurant data. Therefore, mascots should be stored in the **main database**, not the back office database.

This separation follows common best practices:
- **Data locality**: User data with users, business data with businesses
- **Security isolation**: Vendor data separate from user data
- **Scalability**: Can scale databases independently
- **Clear boundaries**: Easier to understand and maintain

## 1. Database Schema Design

### 1.1 Database Location Decision

**Mascots → Main Database (`supabase`)**
- User-facing feature (collections, treasure hunt)
- Directly related to `app_users`
- Accessed by all users
- Managed by admins (who have access to main DB)

**Vendor Management → Back Office Database**
- Already exists in back office database
- Vendors manage restaurants, menus, etc.
- Separate from user-facing features

**Admin Roles → Main Database (`supabase`)**
- Admins manage user-facing features (mascots)
- Admins also need access to back office (for vendor management)
- Role stored in main DB, but admin can access both databases

### 1.2 User Roles Table (Main Database)

```sql
-- Run this in MAIN Supabase database (supabase)
-- Extend app_users or create separate role management
CREATE TABLE user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES app_users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'vendor', 'admin', 'super_admin')),
  permissions jsonb DEFAULT '{}', -- Flexible permission system
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Index for fast role lookups
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);
```

**Note**: Vendors are identified by having a record in the `vendors` table in the back office database. The `user_roles` table in the main database can have a `vendor` role for quick frontend checks, but the actual vendor data lives in the back office database.

### 1.3 Mascots Schema (Main Database)

**Important**: These tables go in the **MAIN Supabase database**, not the back office database.

```sql
-- Run this in MAIN Supabase database (supabase)
-- Mascot themes/categories
CREATE TABLE mascot_themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  display_name text NOT NULL,
  description text,
  total_mascots integer DEFAULT 0,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_by uuid REFERENCES app_users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Individual mascots
CREATE TABLE mascots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id uuid REFERENCES mascot_themes(id) ON DELETE CASCADE,
  name text NOT NULL,
  display_name text NOT NULL,
  description text,
  image_url text NOT NULL,
  rarity text DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  points_value integer DEFAULT 10, -- Points awarded when collected
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES app_users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User mascot collections (tracking what users have collected)
CREATE TABLE user_mascot_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES app_users(id) ON DELETE CASCADE,
  mascot_id uuid REFERENCES mascots(id) ON DELETE CASCADE,
  collected_at timestamptz DEFAULT now(),
  collected_from text, -- 'treasure_hunt', 'purchase', 'reward', etc.
  UNIQUE(user_id, mascot_id)
);

-- Indexes
CREATE INDEX idx_mascots_theme_id ON mascots(theme_id);
CREATE INDEX idx_mascots_is_active ON mascots(is_active);
CREATE INDEX idx_user_collections_user_id ON user_mascot_collections(user_id);
CREATE INDEX idx_user_collections_mascot_id ON user_mascot_collections(mascot_id);
```

### 1.4 RLS Policies for Mascots (Main Database)

**Important**: These policies go in the **MAIN Supabase database**.

```sql
-- Run this in MAIN Supabase database (supabase)
-- Enable RLS
ALTER TABLE mascot_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mascots ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_mascot_collections ENABLE ROW LEVEL SECURITY;

-- Public can view active themes and mascots
CREATE POLICY "Public can view active themes"
ON mascot_themes FOR SELECT
TO public
USING (is_active = true);

CREATE POLICY "Public can view active mascots"
ON mascots FOR SELECT
TO public
USING (is_active = true);

-- Users can view their own collections
CREATE POLICY "Users can view own collections"
ON user_mascot_collections FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admins can do everything
CREATE POLICY "Admins can manage themes"
ON mascot_themes FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = (SELECT id FROM app_users WHERE auth_user_id = auth.uid())
    AND role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "Admins can manage mascots"
ON mascots FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = (SELECT id FROM app_users WHERE auth_user_id = auth.uid())
    AND role IN ('admin', 'super_admin')
  )
);

-- Note: Vendors don't need mascot access in main DB
-- If vendors need to see mascots (for rewards integration), they can view via public policies
```

## 2. Frontend Architecture

### 2.1 Directory Structure
```
src/
├── pages/
│   ├── admin/                    # Admin-only pages
│   │   ├── AdminDashboard.jsx
│   │   ├── mascots/
│   │   │   ├── MascotThemesList.jsx
│   │   │   ├── MascotThemeForm.jsx
│   │   │   ├── MascotsList.jsx
│   │   │   └── MascotForm.jsx
│   │   └── vendors/
│   │       └── VendorManagement.jsx
│   ├── vendor/                   # Vendor-only pages
│   │   ├── VendorDashboard.jsx
│   │   └── RestaurantManagement.jsx
│   └── collection/               # Public user pages
│       └── Collection.jsx
├── hooks/
│   ├── useUserRole.js           # Check user roles
│   ├── useMascotThemes.js       # Fetch themes
│   ├── useMascots.js            # Fetch mascots
│   └── useUserCollection.js     # User's collected mascots
├── context/
│   └── RoleContext.jsx          # Role-based access control
├── components/
│   ├── admin/                   # Admin components
│   │   ├── AdminLayout.jsx
│   │   ├── MascotThemeCard.jsx
│   │   └── MascotCard.jsx
│   └── protected/
│       └── RoleGuard.jsx        # Route protection
└── lib/
    └── permissions.js           # Permission utilities
```

### 2.2 Role-Based Route Protection

```jsx
// src/components/protected/RoleGuard.jsx
import { useAuth } from "@/context/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Navigate } from "react-router-dom";

export default function RoleGuard({ 
  children, 
  allowedRoles = [], 
  redirectTo = "/home" 
}) {
  const { user } = useAuth();
  const { role, isLoading } = useUserRole(user);

  if (isLoading) {
    return <LoadingComponent type="screen" text="Loading..." />;
  }

  if (!user || !allowedRoles.includes(role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
```

### 2.3 Admin Routes Setup

```jsx
// src/routes/AppRoutes.jsx additions
import RoleGuard from "@/components/protected/RoleGuard";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import MascotThemesList from "@/pages/admin/mascots/MascotThemesList";
import MascotThemeForm from "@/pages/admin/mascots/MascotThemeForm";
import MascotsList from "@/pages/admin/mascots/MascotsList";
import MascotForm from "@/pages/admin/mascots/MascotForm";

// In your Routes:
<Route element={<ProtectedRoute />}>
  {/* Admin Routes */}
  <Route element={<Layout title="Admin" />}>
    <Route 
      path="/admin" 
      element={
        <RoleGuard allowedRoles={['admin', 'super_admin']}>
          <AdminDashboard />
        </RoleGuard>
      } 
    />
    <Route 
      path="/admin/mascots/themes" 
      element={
        <RoleGuard allowedRoles={['admin', 'super_admin']}>
          <MascotThemesList />
        </RoleGuard>
      } 
    />
    <Route 
      path="/admin/mascots/themes/new" 
      element={
        <RoleGuard allowedRoles={['admin', 'super_admin']}>
          <MascotThemeForm />
        </RoleGuard>
      } 
    />
    <Route 
      path="/admin/mascots/themes/:id/edit" 
      element={
        <RoleGuard allowedRoles={['admin', 'super_admin']}>
          <MascotThemeForm />
        </RoleGuard>
      } 
    />
    <Route 
      path="/admin/mascots" 
      element={
        <RoleGuard allowedRoles={['admin', 'super_admin']}>
          <MascotsList />
        </RoleGuard>
      } 
    />
    <Route 
      path="/admin/mascots/new" 
      element={
        <RoleGuard allowedRoles={['admin', 'super_admin']}>
          <MascotForm />
        </RoleGuard>
      } 
    />
    <Route 
      path="/admin/mascots/:id/edit" 
      element={
        <RoleGuard allowedRoles={['admin', 'super_admin']}>
          <MascotForm />
        </RoleGuard>
      } 
    />
  </Route>

  {/* Vendor Routes */}
  <Route element={<Layout title="Vendor" />}>
    <Route 
      path="/vendor" 
      element={
        <RoleGuard allowedRoles={['vendor']}>
          <VendorDashboard />
        </RoleGuard>
      } 
    />
  </Route>
</Route>
```

## 3. Hooks for Data Management

### 3.1 useUserRole Hook

```jsx
// src/hooks/useUserRole.js
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

export function useUserRole(user) {
  return useQuery({
    queryKey: ["userRole", user?.id],
    queryFn: async () => {
      if (!user) return { role: null, permissions: {}, isVendor: false };

      // Get user profile from main database
      const { data: profile } = await supabase
        .from("app_users")
        .select("id")
        .eq("auth_user_id", user.id)
        .single();

      if (!profile) return { role: "user", permissions: {}, isVendor: false };

      // Check roles in main database
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role, permissions")
        .eq("user_id", profile.id)
        .order("role", { ascending: false }); // super_admin > admin > vendor > user

      // Check if user is a vendor in back office database
      const { data: vendor } = await supabase
        .from("vendors")
        .select("id, verified_status")
        .eq("user_id", user.id)
        .single();

      const primaryRole = roles?.[0]?.role || (vendor ? "vendor" : "user");
      const permissions = roles?.[0]?.permissions || {};
      const isVendor = !!vendor;

      return { 
        role: primaryRole, 
        permissions, 
        allRoles: roles,
        isVendor,
        vendorId: vendor?.id,
        vendorVerified: vendor?.verified_status === 'verified'
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

**Key Points**:
- Checks `user_roles` in **main database** for admin/user roles
- Checks `vendors` table in **back office database** for vendor status
- Combines both to determine full user role

### 3.2 useMascotThemes Hook

**Important**: Mascots are in the **main database**, so use `supabase` (not `backOfficeSupabase`).

```jsx
// src/hooks/useMascotThemes.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase"; // Main database for mascots
import { toast } from "sonner";

export function useMascotThemes() {
  return useQuery({
    queryKey: ["mascotThemes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mascot_themes")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

export function useCreateMascotTheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (themeData) => {
      const { data, error } = await supabase
        .from("mascot_themes")
        .insert(themeData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mascotThemes"] });
      toast.success("Theme created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create theme: ${error.message}`);
    },
  });
}

export function useUpdateMascotTheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...themeData }) => {
      const { data, error } = await supabase
        .from("mascot_themes")
        .update(themeData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mascotThemes"] });
      toast.success("Theme updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update theme: ${error.message}`);
    },
  });
}

export function useDeleteMascotTheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from("mascot_themes")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mascotThemes"] });
      toast.success("Theme deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete theme: ${error.message}`);
    },
  });
}
```

### 3.3 useMascots Hook

**Important**: Mascots are in the **main database**, so use `supabase` (not `backOfficeSupabase`).

```jsx
// src/hooks/useMascots.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase"; // Main database for mascots
import { toast } from "sonner";

export function useMascots(themeId = null) {
  return useQuery({
    queryKey: ["mascots", themeId],
    queryFn: async () => {
      let query = supabase
        .from("mascots")
        .select("*")
        .order("display_order", { ascending: true });

      if (themeId) {
        query = query.eq("theme_id", themeId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });
}

export function useCreateMascot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mascotData) => {
      // Handle image upload first if needed
      const { data, error } = await supabase
        .from("mascots")
        .insert(mascotData)
        .select()
        .single();

      if (error) throw error;

      // Update theme total count
      await supabase.rpc("increment_theme_total", {
        theme_id: mascotData.theme_id,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mascots"] });
      queryClient.invalidateQueries({ queryKey: ["mascotThemes"] });
      toast.success("Mascot created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create mascot: ${error.message}`);
    },
  });
}

export function useUpdateMascot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...mascotData }) => {
      const { data, error } = await supabase
        .from("mascots")
        .update(mascotData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mascots"] });
      toast.success("Mascot updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update mascot: ${error.message}`);
    },
  });
}

export function useDeleteMascot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, themeId }) => {
      const { error } = await supabase
        .from("mascots")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Decrement theme total count
      await supabase.rpc("decrement_theme_total", {
        theme_id: themeId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mascots"] });
      queryClient.invalidateQueries({ queryKey: ["mascotThemes"] });
      toast.success("Mascot deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete mascot: ${error.message}`);
    },
  });
}
```

## 4. Admin Interface Components

### 4.1 Mascot Themes List

```jsx
// src/pages/admin/mascots/MascotThemesList.jsx
import { useNavigate } from "react-router-dom";
import { useMascotThemes, useDeleteMascotTheme } from "@/hooks/useMascotThemes";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function MascotThemesList() {
  const navigate = useNavigate();
  const { data: themes, isLoading } = useMascotThemes();
  const deleteTheme = useDeleteMascotTheme();

  if (isLoading) return <LoadingComponent />;

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Mascot Themes</h1>
        <Button onClick={() => navigate("/admin/mascots/themes/new")}>
          <Plus className="w-4 h-4 mr-2" />
          New Theme
        </Button>
      </div>

      <div className="grid gap-4">
        {themes?.map((theme) => (
          <div key={theme.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{theme.display_name}</h3>
                <p className="text-sm text-gray-500">{theme.description}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {theme.total_mascots} mascots
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigate(`/admin/mascots/themes/${theme.id}/edit`)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    if (confirm("Delete this theme?")) {
                      deleteTheme.mutate(theme.id);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <Button
              variant="ghost"
              className="mt-2"
              onClick={() => navigate(`/admin/mascots?theme=${theme.id}`)}
            >
              View Mascots
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 5. Database Functions (Optional but Recommended)

```sql
-- Function to update theme total count
CREATE OR REPLACE FUNCTION increment_theme_total(theme_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE mascot_themes
  SET total_mascots = total_mascots + 1
  WHERE id = theme_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_theme_total(theme_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE mascot_themes
  SET total_mascots = GREATEST(0, total_mascots - 1)
  WHERE id = theme_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-update total_mascots
CREATE OR REPLACE FUNCTION update_theme_total_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE mascot_themes
    SET total_mascots = total_mascots + 1
    WHERE id = NEW.theme_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE mascot_themes
    SET total_mascots = GREATEST(0, total_mascots - 1)
    WHERE id = OLD.theme_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mascot_count_trigger
AFTER INSERT OR DELETE ON mascots
FOR EACH ROW EXECUTE FUNCTION update_theme_total_count();
```

## 6. Image Upload Strategy

For mascot images, use Supabase Storage from the **main database**:

```jsx
// src/lib/mascotImageUpload.js
import { supabase } from "@/lib/supabase"; // Main database storage

export async function uploadMascotImage(file, mascotId) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${mascotId}-${Date.now()}.${fileExt}`;
  const filePath = `mascots/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('mascot-images')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('mascot-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
}
```

**Storage Setup**:
1. Go to **Main Supabase Dashboard** (VITE_SUPABASE_URL)
2. Create a storage bucket named `mascot-images`
3. Set bucket to public (or use RLS policies for authenticated users)

## 7. Permission System

```jsx
// src/lib/permissions.js
export const PERMISSIONS = {
  // Mascot permissions
  MASCOT_VIEW: 'mascot:view',
  MASCOT_CREATE: 'mascot:create',
  MASCOT_UPDATE: 'mascot:update',
  MASCOT_DELETE: 'mascot:delete',
  
  // Theme permissions
  THEME_VIEW: 'theme:view',
  THEME_CREATE: 'theme:create',
  THEME_UPDATE: 'theme:update',
  THEME_DELETE: 'theme:delete',
  
  // Vendor permissions
  VENDOR_VIEW: 'vendor:view',
  VENDOR_MANAGE: 'vendor:manage',
};

export function hasPermission(userPermissions, permission) {
  return userPermissions?.[permission] === true;
}
```

## 8. Recommended Implementation Order

1. **Phase 1: Database Setup**
   - **Main Database (`supabase`)**:
     - Create `user_roles` table
     - Create `mascot_themes` table
     - Create `mascots` table
     - Create `user_mascot_collections` table
     - Set up RLS policies
     - Create database functions
   - **Back Office Database**:
     - Already has vendor/restaurant tables (no changes needed)

2. **Phase 2: Role Management**
   - Implement `useUserRole` hook (checks both databases)
   - Create `RoleGuard` component
   - Set up role-based routing

3. **Phase 3: Admin Interface**
   - Build admin dashboard (access to both databases)
   - Create mascot theme CRUD pages (main DB)
   - Create mascot CRUD pages (main DB)
   - Add vendor management link (back office DB)

4. **Phase 4: Integration**
   - Update `Collection.jsx` to fetch from main database
   - Connect treasure hunt to award mascots
   - Add image upload functionality (main DB storage)

5. **Phase 5: Vendor Features** (if needed)
   - Vendors can view mascots via public policies
   - Potential integration with vendor rewards (would need cross-database logic)

## 9. Security Considerations

1. **Always validate permissions on the backend** - Don't rely solely on frontend checks
2. **Use RLS policies** - Supabase RLS is your first line of defense in both databases
3. **Database separation** - Keep user data (mascots) in main DB, business data in back office DB
4. **Cross-database access** - Admins need access to both databases; ensure proper authentication
5. **Audit logs** - Consider adding an `audit_log` table in main DB for admin actions on mascots
6. **Image validation** - Validate file types and sizes for mascot images
7. **Rate limiting** - Implement rate limiting for admin operations
8. **Vendor isolation** - Vendors in back office DB should not have direct access to user data in main DB

## 10. Database Access Pattern Summary

### Main Database (`supabase`) - User-facing
- ✅ Mascot themes, mascots, user collections
- ✅ User roles (admin, user)
- ✅ User authentication
- ✅ Points, treasure hunt data

### Back Office Database - Business-facing
- ✅ Vendors, restaurants, menus
- ✅ Reviews, vouchers
- ✅ Vendor authentication (separate from main DB)

### Admin Access Pattern
```jsx
// Admin needs to access BOTH databases
import { supabase } from "@/lib/supabase"; // For mascots
 // For vendors

// Manage mascots (main DB)
const { data: themes } = await supabase.from("mascot_themes").select("*");

// Manage vendors (back office DB)
const { data: vendors } = await supabase.from("vendors").select("*");
```

## 11. Testing Strategy

1. **Unit tests** for hooks and utilities
2. **Integration tests** for CRUD operations
3. **E2E tests** for admin workflows
4. **Permission tests** - Verify role-based access works correctly

