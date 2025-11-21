-- ============================================================================
-- MOCK DATA FOR FOOD HUNTER APP
-- ============================================================================
-- This file contains sample data for vendors, restaurants, menu_packages, and menu_images
-- Run this after creating the tables
-- ============================================================================

-- ============================================================================
-- VENDORS
-- ============================================================================

INSERT INTO vendors (
  id, user_id, business_name, name, email, phone, business_logo_url, website, 
  social_links, business_address, city, state, country, payment_details, verified_status
) VALUES
-- Vendor 1: Asian Fusion Restaurant Group
(
  gen_random_uuid(),
  NULL,
  'Asian Fusion Restaurant Group',
  'John Chen',
  'john.chen@asianfusion.com',
  '+60123456789',
  'https://example.com/logos/asian-fusion.png',
  'https://asianfusion.com',
  '{"facebook": "https://facebook.com/asianfusion", "instagram": "https://instagram.com/asianfusion"}',
  '123 Jalan Bukit Bintang',
  'Kuala Lumpur',
  'Wilayah Persekutuan',
  'Malaysia',
  '{"bank": "Maybank", "account": "1234567890"}',
  'verified'
),
-- Vendor 2: Mediterranean Delights
(
  gen_random_uuid(),
  NULL,
  'Mediterranean Delights Sdn Bhd',
  'Ahmad Hassan',
  'ahmad@mediterraneandelights.com',
  '+60123456790',
  'https://example.com/logos/mediterranean.png',
  'https://mediterraneandelights.com',
  '{"facebook": "https://facebook.com/mediterraneandelights", "instagram": "https://instagram.com/mediterraneandelights"}',
  '456 Jalan Ampang',
  'Kuala Lumpur',
  'Wilayah Persekutuan',
  'Malaysia',
  '{"bank": "CIMB", "account": "9876543210"}',
  'verified'
),
-- Vendor 3: Western Grill House
(
  gen_random_uuid(),
  NULL,
  'Western Grill House',
  'Sarah Tan',
  'sarah@westerngrill.com',
  '+60123456791',
  'https://example.com/logos/western-grill.png',
  'https://westerngrill.com',
  '{"facebook": "https://facebook.com/westerngrill", "instagram": "https://instagram.com/westerngrill"}',
  '789 Jalan Petaling',
  'Kuala Lumpur',
  'Wilayah Persekutuan',
  'Malaysia',
  '{"bank": "Public Bank", "account": "5555555555"}',
  'verified'
),
-- Vendor 4: Mamak Corner
(
  gen_random_uuid(),
  NULL,
  'Mamak Corner Enterprise',
  'Ramesh Kumar',
  'ramesh@mamakcorner.com',
  '+60123456792',
  'https://example.com/logos/mamak-corner.png',
  NULL,
  '{"instagram": "https://instagram.com/mamakcorner"}',
  '321 Jalan Masjid India',
  'Kuala Lumpur',
  'Wilayah Persekutuan',
  'Malaysia',
  '{"bank": "RHB", "account": "1111111111"}',
  'verified'
),
-- Vendor 5: Japanese Sushi Bar
(
  gen_random_uuid(),
  NULL,
  'Sakura Sushi Bar',
  'Yuki Tanaka',
  'yuki@sakurasushi.com',
  '+60123456793',
  'https://example.com/logos/sakura-sushi.png',
  'https://sakurasushi.com',
  '{"facebook": "https://facebook.com/sakurasushi", "instagram": "https://instagram.com/sakurasushi"}',
  '654 Jalan Mont Kiara',
  'Kuala Lumpur',
  'Wilayah Persekutuan',
  'Malaysia',
  '{"bank": "Hong Leong", "account": "2222222222"}',
  'verified'
);

-- ============================================================================
-- RESTAURANTS
-- ============================================================================

-- Get vendor IDs (we'll use subqueries)
INSERT INTO restaurants (
  id, vendor_id, name, location, description, address, hours, phone_number, 
  image_url, cuisine_type, food_category, status
) VALUES
-- Restaurant 1: Chinese Restaurant (Vendor 1)
(
  gen_random_uuid(),
  (SELECT id FROM vendors WHERE business_name = 'Asian Fusion Restaurant Group' LIMIT 1),
  'Golden Dragon Chinese Restaurant',
  'Bukit Bintang',
  'Authentic Chinese cuisine with a modern twist. Specializing in Cantonese and Szechuan dishes.',
  '123 Jalan Bukit Bintang, 50200 Kuala Lumpur',
  'Mon-Sun: 11:00 AM - 10:00 PM',
  '+60123456789',
  'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=800&h=600&fit=crop',
  'Chinese',
  'Halal',
  'active'
),
-- Restaurant 2: Indian Restaurant (Vendor 1)
(
  gen_random_uuid(),
  (SELECT id FROM vendors WHERE business_name = 'Asian Fusion Restaurant Group' LIMIT 1),
  'Spice Garden Indian Cuisine',
  'Bukit Bintang',
  'Traditional North and South Indian dishes with aromatic spices and flavors.',
  '125 Jalan Bukit Bintang, 50200 Kuala Lumpur',
  'Mon-Sun: 10:00 AM - 11:00 PM',
  '+60123456790',
  'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop',
  'Indian',
  'Halal',
  'active'
),
-- Restaurant 3: Mediterranean Restaurant (Vendor 2)
(
  gen_random_uuid(),
  (SELECT id FROM vendors WHERE business_name = 'Mediterranean Delights Sdn Bhd' LIMIT 1),
  'Olive Tree Mediterranean',
  'Ampang',
  'Fresh Mediterranean cuisine featuring Greek, Turkish, and Middle Eastern specialties.',
  '456 Jalan Ampang, 50450 Kuala Lumpur',
  'Mon-Sun: 12:00 PM - 10:30 PM',
  '+60123456791',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop',
  'Mediterranean',
  'Halal',
  'active'
),
-- Restaurant 4: Western Restaurant (Vendor 3)
(
  gen_random_uuid(),
  (SELECT id FROM vendors WHERE business_name = 'Western Grill House' LIMIT 1),
  'The Steakhouse',
  'Petaling Street',
  'Premium steaks, burgers, and Western comfort food in a cozy atmosphere.',
  '789 Jalan Petaling, 50000 Kuala Lumpur',
  'Mon-Sun: 11:30 AM - 11:00 PM',
  '+60123456792',
  'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&h=600&fit=crop',
  'Western',
  'Non-Halal',
  'active'
),
-- Restaurant 5: Mamak Restaurant (Vendor 4)
(
  gen_random_uuid(),
  (SELECT id FROM vendors WHERE business_name = 'Mamak Corner Enterprise' LIMIT 1),
  'Mamak Corner 24/7',
  'Masjid India',
  'Classic Malaysian mamak food available 24/7. Roti canai, nasi lemak, and more.',
  '321 Jalan Masjid India, 50100 Kuala Lumpur',
  '24 Hours',
  '+60123456793',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop',
  'Mamak',
  'Halal',
  'active'
),
-- Restaurant 6: Japanese Restaurant (Vendor 5)
(
  gen_random_uuid(),
  (SELECT id FROM vendors WHERE business_name = 'Sakura Sushi Bar' LIMIT 1),
  'Sakura Sushi Bar',
  'Mont Kiara',
  'Fresh sushi, sashimi, and authentic Japanese dishes prepared by experienced chefs.',
  '654 Jalan Mont Kiara, 50480 Kuala Lumpur',
  'Mon-Sun: 12:00 PM - 10:00 PM',
  '+60123456794',
  'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop',
  'Japanese',
  'All',
  'active'
),
-- Restaurant 7: Thai Restaurant (Vendor 1)
(
  gen_random_uuid(),
  (SELECT id FROM vendors WHERE business_name = 'Asian Fusion Restaurant Group' LIMIT 1),
  'Thai Garden Restaurant',
  'Bukit Bintang',
  'Authentic Thai cuisine with bold flavors and fresh ingredients.',
  '127 Jalan Bukit Bintang, 50200 Kuala Lumpur',
  'Mon-Sun: 11:00 AM - 10:00 PM',
  '+60123456795',
  'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop',
  'Thai',
  'Halal',
  'active'
),
-- Restaurant 8: Italian Restaurant (Vendor 3)
(
  gen_random_uuid(),
  (SELECT id FROM vendors WHERE business_name = 'Western Grill House' LIMIT 1),
  'Bella Italia',
  'Petaling Street',
  'Traditional Italian pasta, pizza, and risotto made with authentic recipes.',
  '791 Jalan Petaling, 50000 Kuala Lumpur',
  'Mon-Sun: 12:00 PM - 10:00 PM',
  '+60123456796',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop',
  'Italian',
  'All',
  'active'
);

-- ============================================================================
-- MENU PACKAGES
-- ============================================================================

INSERT INTO menu_packages (
  id, restaurant_id, vendor_id, name, description, package_type, price, purchase_count
) VALUES
-- Menu packages for Golden Dragon Chinese Restaurant
(
  gen_random_uuid(),
  (SELECT id FROM restaurants WHERE name = 'Golden Dragon Chinese Restaurant' LIMIT 1),
  (SELECT vendor_id FROM restaurants WHERE name = 'Golden Dragon Chinese Restaurant' LIMIT 1),
  'Dim Sum Set for 2',
  'Assorted dim sum including har gow, siu mai, char siu bao, and spring rolls. Perfect for sharing.',
  'Set Meal',
  45.00,
  12
),
(
  gen_random_uuid(),
  (SELECT id FROM restaurants WHERE name = 'Golden Dragon Chinese Restaurant' LIMIT 1),
  (SELECT vendor_id FROM restaurants WHERE name = 'Golden Dragon Chinese Restaurant' LIMIT 1),
  'Peking Duck Combo',
  'Half Peking duck with pancakes, spring onions, and hoisin sauce. Served with fried rice.',
  'Main Course',
  88.00,
  8
),
(
  gen_random_uuid(),
  (SELECT id FROM restaurants WHERE name = 'Golden Dragon Chinese Restaurant' LIMIT 1),
  (SELECT vendor_id FROM restaurants WHERE name = 'Golden Dragon Chinese Restaurant' LIMIT 1),
  'Sweet and Sour Fish',
  'Fresh fish fillet in sweet and sour sauce with bell peppers and pineapple. Served with steamed rice.',
  'Main Course',
  32.00,
  15
),
-- Menu packages for Spice Garden Indian Cuisine
(
  gen_random_uuid(),
  (SELECT id FROM restaurants WHERE name = 'Spice Garden Indian Cuisine' LIMIT 1),
  (SELECT vendor_id FROM restaurants WHERE name = 'Spice Garden Indian Cuisine' LIMIT 1),
  'Butter Chicken Set',
  'Creamy butter chicken with basmati rice, naan bread, and vegetable curry. Includes dessert.',
  'Set Meal',
  38.00,
  20
),
(
  gen_random_uuid(),
  (SELECT id FROM restaurants WHERE name = 'Spice Garden Indian Cuisine' LIMIT 1),
  (SELECT vendor_id FROM restaurants WHERE name = 'Spice Garden Indian Cuisine' LIMIT 1),
  'Biryani Feast',
  'Fragrant basmati rice cooked with spices, choice of chicken or mutton, served with raita and pickle.',
  'Main Course',
  28.00,
  25
),
(
  gen_random_uuid(),
  (SELECT id FROM restaurants WHERE name = 'Spice Garden Indian Cuisine' LIMIT 1),
  (SELECT vendor_id FROM restaurants WHERE name = 'Spice Garden Indian Cuisine' LIMIT 1),
  'Thali Combo',
  'Complete vegetarian thali with dal, sabzi, rice, roti, papad, and dessert.',
  'Set Meal',
  22.00,
  18
),
-- Menu packages for Olive Tree Mediterranean
(
  gen_random_uuid(),
  (SELECT id FROM restaurants WHERE name = 'Olive Tree Mediterranean' LIMIT 1),
  (SELECT vendor_id FROM restaurants WHERE name = 'Olive Tree Mediterranean' LIMIT 1),
  'Mixed Grill Platter',
  'Chicken shish, lamb kebab, kofta, and grilled vegetables. Served with hummus, tabbouleh, and pita bread.',
  'Main Course',
  55.00,
  10
),
(
  gen_random_uuid(),
  (SELECT id FROM restaurants WHERE name = 'Olive Tree Mediterranean' LIMIT 1),
  (SELECT vendor_id FROM restaurants WHERE name = 'Olive Tree Mediterranean' LIMIT 1),
  'Greek Salad with Grilled Chicken',
  'Fresh mixed greens, feta cheese, olives, tomatoes, cucumbers, and grilled chicken breast.',
  'Main Course',
  28.00,
  14
),
(
  gen_random_uuid(),
  (SELECT id FROM restaurants WHERE name = 'Olive Tree Mediterranean' LIMIT 1),
  (SELECT vendor_id FROM restaurants WHERE name = 'Olive Tree Mediterranean' LIMIT 1),
  'Mezze Platter',
  'Assorted appetizers including hummus, baba ganoush, falafel, stuffed grape leaves, and pita bread.',
  'Appetizer',
  35.00,
  12
),
-- Menu packages for The Steakhouse
(
  gen_random_uuid(),
  (SELECT id FROM restaurants WHERE name = 'The Steakhouse' LIMIT 1),
  (SELECT vendor_id FROM restaurants WHERE name = 'The Steakhouse' LIMIT 1),
  'Ribeye Steak (300g)',
  'Premium ribeye steak cooked to your preference, served with mashed potatoes and seasonal vegetables.',
  'Main Course',
  85.00,
  6
),
(
  gen_random_uuid(),
  (SELECT id FROM restaurants WHERE name = 'The Steakhouse' LIMIT 1),
  (SELECT vendor_id FROM restaurants WHERE name = 'The Steakhouse' LIMIT 1),
  'Gourmet Burger Combo',
  'Angus beef patty with cheddar cheese, bacon, lettuce, tomato, and special sauce. Served with fries and drink.',
  'Set Meal',
  32.00,
  22
),
(
  gen_random_uuid(),
  (SELECT id FROM restaurants WHERE name = 'The Steakhouse' LIMIT 1),
  (SELECT vendor_id FROM restaurants WHERE name = 'The Steakhouse' LIMIT 1),
  'Grilled Salmon',
  'Fresh Atlantic salmon with lemon butter sauce, served with roasted vegetables and rice.',
  'Main Course',
  42.00,
  8
),
-- Menu packages for Mamak Corner 24/7
(
  gen_random_uuid(),
  (SELECT id FROM restaurants WHERE name = 'Mamak Corner 24/7' LIMIT 1),
  (SELECT vendor_id FROM restaurants WHERE name = 'Mamak Corner 24/7' LIMIT 1),
  'Roti Canai Set',
  '2 pieces of roti canai with dhal curry and chicken curry. Includes teh tarik.',
  'Set Meal',
  8.50,
  50
),
(
  gen_random_uuid(),
  (SELECT id FROM restaurants WHERE name = 'Mamak Corner 24/7' LIMIT 1),
  (SELECT vendor_id FROM restaurants WHERE name = 'Mamak Corner 24/7' LIMIT 1),
  'Nasi Lemak Special',
  'Fragrant coconut rice with sambal, fried chicken, anchovies, peanuts, and boiled egg.',
  'Main Course',
  12.00,
  40
),
(
  gen_random_uuid(),
  (SELECT id FROM restaurants WHERE name = 'Mamak Corner 24/7' LIMIT 1),
  (SELECT vendor_id FROM restaurants WHERE name = 'Mamak Corner 24/7' LIMIT 1),
  'Mee Goreng Mamak',
  'Spicy fried noodles with chicken, prawns, vegetables, and a fried egg on top.',
  'Main Course',
  10.50,
  35
),
-- Menu packages for Sakura Sushi Bar
(
  gen_random_uuid(),
  (SELECT id FROM restaurants WHERE name = 'Sakura Sushi Bar' LIMIT 1),
  (SELECT vendor_id FROM restaurants WHERE name = 'Sakura Sushi Bar' LIMIT 1),
  'Sushi Platter (12 pieces)',
  'Assorted fresh sushi including salmon, tuna, eel, and shrimp. Served with wasabi, ginger, and soy sauce.',
  'Main Course',
  65.00,
  15
),
(
  gen_random_uuid(),
  (SELECT id FROM restaurants WHERE name = 'Sakura Sushi Bar' LIMIT 1),
  (SELECT vendor_id FROM restaurants WHERE name = 'Sakura Sushi Bar' LIMIT 1),
  'Ramen Set',
  'Tonkotsu ramen with chashu pork, soft-boiled egg, nori, and spring onions. Includes gyoza.',
  'Set Meal',
  35.00,
  18
),
(
  gen_random_uuid(),
  (SELECT id FROM restaurants WHERE name = 'Sakura Sushi Bar' LIMIT 1),
  (SELECT vendor_id FROM restaurants WHERE name = 'Sakura Sushi Bar' LIMIT 1),
  'Teriyaki Chicken Bowl',
  'Grilled chicken with teriyaki sauce, served over steamed rice with vegetables and miso soup.',
  'Set Meal',
  28.00,
  12
),
-- Menu packages for Thai Garden Restaurant
(
  gen_random_uuid(),
  (SELECT id FROM restaurants WHERE name = 'Thai Garden Restaurant' LIMIT 1),
  (SELECT vendor_id FROM restaurants WHERE name = 'Thai Garden Restaurant' LIMIT 1),
  'Tom Yum Goong Set',
  'Spicy and sour prawn soup with mushrooms and herbs. Served with jasmine rice.',
  'Set Meal',
  32.00,
  16
),
(
  gen_random_uuid(),
  (SELECT id FROM restaurants WHERE name = 'Thai Garden Restaurant' LIMIT 1),
  (SELECT vendor_id FROM restaurants WHERE name = 'Thai Garden Restaurant' LIMIT 1),
  'Pad Thai',
  'Stir-fried rice noodles with prawns, bean sprouts, and peanuts. Classic Thai street food.',
  'Main Course',
  22.00,
  20
),
(
  gen_random_uuid(),
  (SELECT id FROM restaurants WHERE name = 'Thai Garden Restaurant' LIMIT 1),
  (SELECT vendor_id FROM restaurants WHERE name = 'Thai Garden Restaurant' LIMIT 1),
  'Green Curry Chicken',
  'Creamy green curry with chicken, Thai eggplant, and basil leaves. Served with jasmine rice.',
  'Main Course',
  28.00,
  14
),
-- Menu packages for Bella Italia
(
  gen_random_uuid(),
  (SELECT id FROM restaurants WHERE name = 'Bella Italia' LIMIT 1),
  (SELECT vendor_id FROM restaurants WHERE name = 'Bella Italia' LIMIT 1),
  'Margherita Pizza',
  'Classic pizza with tomato sauce, mozzarella cheese, and fresh basil. 12 inches.',
  'Main Course',
  35.00,
  25
),
(
  gen_random_uuid(),
  (SELECT id FROM restaurants WHERE name = 'Bella Italia' LIMIT 1),
  (SELECT vendor_id FROM restaurants WHERE name = 'Bella Italia' LIMIT 1),
  'Carbonara Pasta',
  'Creamy pasta with bacon, parmesan cheese, and black pepper. Authentic Italian recipe.',
  'Main Course',
  32.00,
  18
),
(
  gen_random_uuid(),
  (SELECT id FROM restaurants WHERE name = 'Bella Italia' LIMIT 1),
  (SELECT vendor_id FROM restaurants WHERE name = 'Bella Italia' LIMIT 1),
  'Seafood Risotto',
  'Creamy arborio rice with mixed seafood, white wine, and parmesan cheese.',
  'Main Course',
  42.00,
  10
);

-- ============================================================================
-- MENU IMAGES
-- ============================================================================

INSERT INTO menu_images (id, package_id, image_url)
VALUES
-- Images for Golden Dragon Chinese Restaurant packages
(
  gen_random_uuid(),
  (SELECT id FROM menu_packages WHERE name = 'Dim Sum Set for 2' LIMIT 1),
  'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop'
),
(
  gen_random_uuid(),
  (SELECT id FROM menu_packages WHERE name = 'Peking Duck Combo' LIMIT 1),
  'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&h=600&fit=crop'
),
(
  gen_random_uuid(),
  (SELECT id FROM menu_packages WHERE name = 'Sweet and Sour Fish' LIMIT 1),
  'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=800&h=600&fit=crop'
),
-- Images for Spice Garden Indian Cuisine packages
(
  gen_random_uuid(),
  (SELECT id FROM menu_packages WHERE name = 'Butter Chicken Set' LIMIT 1),
  'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop'
),
(
  gen_random_uuid(),
  (SELECT id FROM menu_packages WHERE name = 'Biryani Feast' LIMIT 1),
  'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&h=600&fit=crop'
),
(
  gen_random_uuid(),
  (SELECT id FROM menu_packages WHERE name = 'Thali Combo' LIMIT 1),
  'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop'
),
-- Images for Olive Tree Mediterranean packages
(
  gen_random_uuid(),
  (SELECT id FROM menu_packages WHERE name = 'Mixed Grill Platter' LIMIT 1),
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop'
),
(
  gen_random_uuid(),
  (SELECT id FROM menu_packages WHERE name = 'Greek Salad with Grilled Chicken' LIMIT 1),
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop'
),
(
  gen_random_uuid(),
  (SELECT id FROM menu_packages WHERE name = 'Mezze Platter' LIMIT 1),
  'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=600&fit=crop'
),
-- Images for The Steakhouse packages
(
  gen_random_uuid(),
  (SELECT id FROM menu_packages WHERE name = 'Ribeye Steak (300g)' LIMIT 1),
  'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&h=600&fit=crop'
),
(
  gen_random_uuid(),
  (SELECT id FROM menu_packages WHERE name = 'Gourmet Burger Combo' LIMIT 1),
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop'
),
(
  gen_random_uuid(),
  (SELECT id FROM menu_packages WHERE name = 'Grilled Salmon' LIMIT 1),
  'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=600&fit=crop'
),
-- Images for Mamak Corner 24/7 packages
(
  gen_random_uuid(),
  (SELECT id FROM menu_packages WHERE name = 'Roti Canai Set' LIMIT 1),
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop'
),
(
  gen_random_uuid(),
  (SELECT id FROM menu_packages WHERE name = 'Nasi Lemak Special' LIMIT 1),
  'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop'
),
(
  gen_random_uuid(),
  (SELECT id FROM menu_packages WHERE name = 'Mee Goreng Mamak' LIMIT 1),
  'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop'
),
-- Images for Sakura Sushi Bar packages
(
  gen_random_uuid(),
  (SELECT id FROM menu_packages WHERE name = 'Sushi Platter (12 pieces)' LIMIT 1),
  'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop'
),
(
  gen_random_uuid(),
  (SELECT id FROM menu_packages WHERE name = 'Ramen Set' LIMIT 1),
  'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop'
),
(
  gen_random_uuid(),
  (SELECT id FROM menu_packages WHERE name = 'Teriyaki Chicken Bowl' LIMIT 1),
  'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop'
),
-- Images for Thai Garden Restaurant packages
(
  gen_random_uuid(),
  (SELECT id FROM menu_packages WHERE name = 'Tom Yum Goong Set' LIMIT 1),
  'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop'
),
(
  gen_random_uuid(),
  (SELECT id FROM menu_packages WHERE name = 'Pad Thai' LIMIT 1),
  'https://images.unsplash.com/photo-1559314809-0d155014f29e?w=800&h=600&fit=crop'
),
(
  gen_random_uuid(),
  (SELECT id FROM menu_packages WHERE name = 'Green Curry Chicken' LIMIT 1),
  'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop'
),
-- Images for Bella Italia packages
(
  gen_random_uuid(),
  (SELECT id FROM menu_packages WHERE name = 'Margherita Pizza' LIMIT 1),
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop'
),
(
  gen_random_uuid(),
  (SELECT id FROM menu_packages WHERE name = 'Carbonara Pasta' LIMIT 1),
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop'
),
(
  gen_random_uuid(),
  (SELECT id FROM menu_packages WHERE name = 'Seafood Risotto' LIMIT 1),
  'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop'
);

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- Created:
-- - 5 vendors
-- - 8 restaurants (various cuisines)
-- - 24 menu packages (3 per restaurant on average)
-- - 24 menu images (1 image per menu package)
-- ============================================================================

