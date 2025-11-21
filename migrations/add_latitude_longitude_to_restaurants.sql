-- Add latitude and longitude fields to restaurants table
-- These fields are used to calculate distance from user's current location

ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS latitude numeric(10, 8),
  ADD COLUMN IF NOT EXISTS longitude numeric(11, 8);

-- Add index for location-based queries (for distance calculations and "near you" suggestions)
CREATE INDEX IF NOT EXISTS idx_restaurants_location ON restaurants(latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Notes:
-- - latitude: Decimal degrees, range -90 to 90 (e.g., 3.1390 for Kuala Lumpur)
-- - longitude: Decimal degrees, range -180 to 180 (e.g., 101.6869 for Kuala Lumpur)
-- - These fields are optional and can be populated via geocoding services or manual entry
-- - Use a geocoding service (e.g., Google Maps Geocoding API, Mapbox) to convert addresses to coordinates

