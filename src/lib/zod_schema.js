// FORM VALIDATION SCHEMAS FOR ZOD
// any field not marked with .optional() or .nullable() is required
// Use .optional() to make a field not required.

import * as z from "zod";

// SIGN UP (REGISTER) SCHEMA ----------------------------------------------
export const registerSchema = z
  .object({
    display_name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be less than 50 characters")
      .optional()
      .or(z.literal("")),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(/[A-Za-z]/, "Password must contain at least one letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine(
    (data) => {
      if (data.confirmPassword && data.password !== data.confirmPassword) {
        return false;
      }
      return true;
    },
    {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    }
  );

// SIGN IN (LOGIN) SCHEMA ----------------------------------------------
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"), // For login, no need to enforce complexity
});

// CREATE PROFILE SCHEMA ----------------------------------------------
// This schema matches the app_users table structure
export const createProfileSchema = z.object({
  // Basic profile fields
  display_name: z
    .string()
    .min(2, "Display name must be at least 2 characters")
    .max(50, "Display name must be less than 50 characters")
    .optional(),

  // Contact information
  phone_number: z
    .union([
      z.literal(""), // allow empty string
      z.string().regex(/^\+?[0-9]{7,15}$/, "Phone number must be valid"),
    ])
    .optional(),

  // Age and birthdate (either can be used)
  age: z
    .number()
    .int("Age must be an integer")
    .min(18, "Age must be at least 18")
    .max(120, "Age must be less than 120")
    .optional(),

  birthdate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Birthdate must be in YYYY-MM-DD format")
    .optional(),

  // Location tracking (for "near you" suggestions)
  current_latitude: z
    .number()
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90")
    .optional(),

  current_longitude: z
    .number()
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180")
    .optional(),

  // Treasure hunt preferences
  preferred_mode: z
    .enum(["solo", "team"], {
      errorMap: () => ({ message: "Preferred mode must be 'solo' or 'team'" }),
    })
    .default("solo"),

  // Referral system
  referred_by_user_id: z.string().uuid("Invalid referral user ID").optional(),

  // Note: The following fields are auto-generated or set by the system:
  // - id (uuid, auto-generated)
  // - profile_id (uuid, references profiles.id which equals auth.users.id)
  // - email (text, from profiles table)
  // - referral_code (text, auto-generated)
  // - points_balance (integer, default 0)
  // - total_points_earned (integer, default 0)
  // - location_updated_at (timestamptz, auto-set when location is updated)
  // - active_treasure_hunt_id (uuid, set when user starts a hunt)
  // - status (text, default 'active')
  // - created_at (timestamptz, auto-set)
  // - updated_at (timestamptz, auto-set)
});

// EDIT PROFILE SCHEMA ----------------------------------------------
// This schema matches the app_users table structure
export const editProfileSchema = z.object({
  // Basic profile fields
  display_name: z
    .string()
    .min(2, "Display name must be at least 2 characters")
    .max(50, "Display name must be less than 50 characters")
    .optional(),

  // Contact information
  phone_number: z
    .union([
      z.literal(""), // allows empty input
      z.string().regex(/^\+?[0-9]{7,15}$/, "Phone number must be valid"),
    ])
    .optional(),

  // Age and birthdate (either can be used)
  age: z
    .preprocess(
      (val) => {
        if (val === "" || val === null || val === undefined) return undefined;
        if (typeof val === "string") {
          const num = parseInt(val, 10);
          return isNaN(num) ? undefined : num;
        }
        return val;
      },
      z
        .number()
        .int("Age must be an integer")
        .min(18, "Age must be at least 18")
        .max(120, "Age must be less than 120")
        .optional()
        .nullable()
    ),

  birthdate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Birthdate must be in YYYY-MM-DD format")
    .optional()
    .nullable(),

  // Location tracking (for "near you" suggestions)
  current_latitude: z
    .number()
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90")
    .optional()
    .nullable(),

  current_longitude: z
    .number()
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180")
    .optional()
    .nullable(),

  // Treasure hunt preferences
  preferred_mode: z
    .enum(["solo", "team"], {
      errorMap: () => ({ message: "Preferred mode must be 'solo' or 'team'" }),
    })
    .optional(),

  // Note: The following fields are NOT editable via this schema (set by system or not in table):
  // - id (uuid, auto-generated)
  // - profile_id (uuid, references profiles.id which equals auth.users.id)
  // - email (text, from profiles table)
  // - referral_code (text, auto-generated)
  // - referred_by_profile_id (uuid, set during referral, references profiles.id)
  // - points_balance (integer, managed by points system)
  // - total_points_earned (integer, managed by points system)
  // - location_updated_at (timestamptz, auto-set when location is updated)
  // - active_treasure_hunt_id (uuid, set when user starts a hunt)
  // - status (text, managed by admin/system)
  // - created_at (timestamptz, auto-set)
  // - updated_at (timestamptz, auto-set)
});

// RESET PASSWORD SCHEMA ----------------------------------------------
export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// TREASURE HUNT PROFILE SCHEMA ----------------------------------------------
// Simplified schema for treasure hunt app profile creation
export const createTreasureHuntProfileSchema = z.object({
  display_name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be less than 50 characters")
    .optional()
    .or(z.literal("")), // Allow empty string, we'll use email prefix as fallback
  
  preferred_mode: z.enum(["solo", "team"], {
    required_error: "Please select a mode",
  }),
  
  referral_code: z
    .string()
    .max(12, "Referral code must be 12 characters or less")
    .optional()
    .or(z.literal("")),
  });
