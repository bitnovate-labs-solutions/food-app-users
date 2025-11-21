-- ============================================================================
-- INSERT MOCK DATA FOR BACK OFFICE TABLES
-- ============================================================================
-- Malaysian food vendors, restaurants, and menu items
-- Run this in your Back Office Supabase SQL Editor (VITE_SECOND_SUPABASE_URL)
-- ============================================================================
-- Note: user_id in vendors table is set to NULL (nullable field)
--       You can link vendors to actual auth.users later by updating the user_id column
-- ============================================================================

-- ============================================================================
-- VENDORS
-- ============================================================================

INSERT INTO vendors (id, user_id, business_name, name, email, phone, business_logo_url, website, business_address, city, state, country, verified_status) VALUES
-- Note: user_id is set to NULL since these are mock vendors without actual auth.users records
-- You can link vendors to actual users later by updating the user_id column
('550e8400-e29b-41d4-a716-446655440001', NULL, 'Nasi Lemak Pak Ali', 'Ali bin Ahmad', 'ali@nasilemak.com', '+60123456789', NULL, 'https://nasilemak.com', '123 Jalan Ampang', 'Kuala Lumpur', 'Wilayah Persekutuan', 'Malaysia', 'verified'),
('550e8400-e29b-41d4-a716-446655440002', NULL, 'Char Kuey Teow Master', 'Lim Ah Beng', 'lim@charkueyteow.com', '+60123456790', NULL, NULL, '456 Jalan Petaling', 'Kuala Lumpur', 'Wilayah Persekutuan', 'Malaysia', 'verified'),
('550e8400-e29b-41d4-a716-446655440003', NULL, 'Roti Canai Corner', 'Muthu a/l Ramasamy', 'muthu@roti.com', '+60123456791', NULL, NULL, '789 Jalan Brickfields', 'Kuala Lumpur', 'Wilayah Persekutuan', 'Malaysia', 'verified'),
('550e8400-e29b-41d4-a716-446655440004', NULL, 'Bak Kut Teh House', 'Tan Kim Seng', 'tan@bkt.com', '+60123456792', NULL, 'https://bkt.com', '321 Jalan Klang', 'Klang', 'Selangor', 'Malaysia', 'verified'),
('550e8400-e29b-41d4-a716-446655440005', NULL, 'Hainanese Chicken Rice', 'Wong Ah Fatt', 'wong@chickenrice.com', '+60123456793', NULL, NULL, '654 Jalan Imbi', 'Kuala Lumpur', 'Wilayah Persekutuan', 'Malaysia', 'verified'),
('550e8400-e29b-41d4-a716-446655440006', NULL, 'Laksa Penang', 'Fatimah binti Hassan', 'fatimah@laksa.com', '+60123456794', NULL, NULL, '987 Jalan Gurney', 'George Town', 'Penang', 'Malaysia', 'verified'),
('550e8400-e29b-41d4-a716-446655440007', NULL, 'Satay Kajang', 'Ahmad bin Ismail', 'ahmad@satay.com', '+60123456795', NULL, NULL, '147 Jalan Kajang', 'Kajang', 'Selangor', 'Malaysia', 'verified'),
('550e8400-e29b-41d4-a716-446655440008', NULL, 'Rendang Tok', 'Hassan bin Abdullah', 'hassan@rendang.com', '+60123456796', NULL, NULL, '258 Jalan Melaka', 'Melaka', 'Melaka', 'Malaysia', 'verified'),
('550e8400-e29b-41d4-a716-446655440009', NULL, 'Mamak Stall 24/7', 'Ravi a/l Subramaniam', 'ravi@mamak.com', '+60123456797', NULL, NULL, '369 Jalan SS2', 'Petaling Jaya', 'Selangor', 'Malaysia', 'verified'),
('550e8400-e29b-41d4-a716-446655440010', NULL, 'Cendol Durian', 'Siti binti Yusof', 'siti@cendol.com', '+60123456798', NULL, NULL, '741 Jalan Bukit Bintang', 'Kuala Lumpur', 'Wilayah Persekutuan', 'Malaysia', 'pending');

-- ============================================================================
-- RESTAURANTS
-- ============================================================================

INSERT INTO restaurants (id, vendor_id, name, location, description, address, hours, phone_number, image_url, cuisine_type, food_category, status) VALUES
-- Nasi Lemak Pak Ali
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Nasi Lemak Pak Ali', 'Ampang', 'Authentic Malaysian nasi lemak with fragrant coconut rice, sambal, and crispy anchovies', '123 Jalan Ampang, Ampang', 'Daily 6:00 AM - 2:00 PM', '+60123456789', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop', 'Mamak', 'Halal', 'active'),

-- Char Kuey Teow Master
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Char Kuey Teow Master', 'Petaling Street', 'Wok-fried flat rice noodles with prawns, cockles, and bean sprouts', '456 Jalan Petaling, Petaling Street', 'Daily 11:00 AM - 10:00 PM', '+60123456790', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop', 'Chinese', 'Non-Halal', 'active'),

-- Roti Canai Corner
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'Roti Canai Corner', 'Brickfields', 'Freshly made roti canai with various curries and dhal', '789 Jalan Brickfields, Brickfields', 'Daily 7:00 AM - 11:00 PM', '+60123456791', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop', 'Indian', 'Halal', 'active'),

-- Bak Kut Teh House
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 'Bak Kut Teh House', 'Klang', 'Traditional pork rib soup with herbs and spices', '321 Jalan Klang, Klang', 'Daily 8:00 AM - 9:00 PM', '+60123456792', 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=800&h=600&fit=crop', 'Chinese', 'Non-Halal', 'active'),

-- Hainanese Chicken Rice
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', 'Hainanese Chicken Rice', 'Imbi', 'Tender poached chicken with fragrant rice and ginger sauce', '654 Jalan Imbi, Imbi', 'Daily 10:00 AM - 8:00 PM', '+60123456793', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop', 'Chinese', 'Non-Halal', 'active'),

-- Laksa Penang
('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440006', 'Laksa Penang', 'Gurney Drive', 'Sour and spicy fish-based noodle soup with tamarind', '987 Jalan Gurney, George Town', 'Daily 9:00 AM - 6:00 PM', '+60123456794', 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop', 'Other', 'Non-Halal', 'active'),

-- Satay Kajang
('660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440007', 'Satay Kajang', 'Kajang', 'Grilled marinated meat skewers with peanut sauce', '147 Jalan Kajang, Kajang', 'Daily 5:00 PM - 12:00 AM', '+60123456795', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop', 'Mamak', 'Halal', 'active'),

-- Rendang Tok
('660e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440008', 'Rendang Tok', 'Melaka', 'Slow-cooked beef rendang with coconut and spices', '258 Jalan Melaka, Melaka', 'Daily 11:00 AM - 9:00 PM', '+60123456796', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop', 'Other', 'Halal', 'active'),

-- Mamak Stall 24/7
('660e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440009', 'Mamak Stall 24/7', 'SS2 Petaling Jaya', '24-hour mamak restaurant serving roti, nasi lemak, and teh tarik', '369 Jalan SS2, Petaling Jaya', '24 Hours', '+60123456797', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop', 'Mamak', 'Halal', 'active'),

-- Cendol Durian
('660e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440010', 'Cendol Durian', 'Bukit Bintang', 'Traditional shaved ice dessert with durian and coconut milk', '741 Jalan Bukit Bintang, Bukit Bintang', 'Daily 12:00 PM - 11:00 PM', '+60123456798', 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=600&fit=crop', 'Other', 'Halal', 'pending');

-- ============================================================================
-- MENU CATEGORIES (Optional - restaurants can have categories)
-- ============================================================================

INSERT INTO menu_categories (id, restaurant_id, name, description, sort_order) VALUES
-- Nasi Lemak Pak Ali categories
('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Nasi Lemak Sets', 'Complete nasi lemak meals', 1),
('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'Side Dishes', 'Additional items and sides', 2),
('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', 'Beverages', 'Drinks and beverages', 3),

-- Char Kuey Teow Master categories
('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440002', 'Char Kuey Teow', 'Wok-fried flat rice noodles', 1),
('770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440002', 'Noodles', 'Other noodle dishes', 2),
('770e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440002', 'Beverages', 'Drinks', 3),

-- Roti Canai Corner categories
('770e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440003', 'Roti', 'Various roti canai options', 1),
('770e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440003', 'Curries', 'Curry dishes', 2),
('770e8400-e29b-41d4-a716-446655440009', '660e8400-e29b-41d4-a716-446655440003', 'Beverages', 'Teh tarik and other drinks', 3),

-- Bak Kut Teh House categories
('770e8400-e29b-41d4-a716-446655440010', '660e8400-e29b-41d4-a716-446655440004', 'Bak Kut Teh', 'Pork rib soup', 1),
('770e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440004', 'Rice & Sides', 'Rice and side dishes', 2),
('770e8400-e29b-41d4-a716-446655440012', '660e8400-e29b-41d4-a716-446655440004', 'Beverages', 'Chinese tea and drinks', 3),

-- Hainanese Chicken Rice categories
('770e8400-e29b-41d4-a716-446655440013', '660e8400-e29b-41d4-a716-446655440005', 'Chicken Rice Sets', 'Complete chicken rice meals', 1),
('770e8400-e29b-41d4-a716-446655440014', '660e8400-e29b-41d4-a716-446655440005', 'Sides', 'Side dishes', 2),
('770e8400-e29b-41d4-a716-446655440015', '660e8400-e29b-41d4-a716-446655440005', 'Beverages', 'Drinks', 3),

-- Laksa Penang categories
('770e8400-e29b-41d4-a716-446655440016', '660e8400-e29b-41d4-a716-446655440006', 'Laksa', 'Penang laksa varieties', 1),
('770e8400-e29b-41d4-a716-446655440017', '660e8400-e29b-41d4-a716-446655440006', 'Add-ons', 'Additional toppings', 2),
('770e8400-e29b-41d4-a716-446655440018', '660e8400-e29b-41d4-a716-446655440006', 'Beverages', 'Drinks', 3),

-- Satay Kajang categories
('770e8400-e29b-41d4-a716-446655440019', '660e8400-e29b-41d4-a716-446655440007', 'Satay', 'Grilled meat skewers', 1),
('770e8400-e29b-41d4-a716-446655440020', '660e8400-e29b-41d4-a716-446655440007', 'Rice & Sides', 'Ketupat and sides', 2),
('770e8400-e29b-41d4-a716-446655440021', '660e8400-e29b-41d4-a716-446655440007', 'Beverages', 'Drinks', 3),

-- Rendang Tok categories
('770e8400-e29b-41d4-a716-446655440022', '660e8400-e29b-41d4-a716-446655440008', 'Rendang', 'Beef rendang dishes', 1),
('770e8400-e29b-41d4-a716-446655440023', '660e8400-e29b-41d4-a716-446655440008', 'Rice & Sides', 'Rice and accompaniments', 2),
('770e8400-e29b-41d4-a716-446655440024', '660e8400-e29b-41d4-a716-446655440008', 'Beverages', 'Drinks', 3),

-- Mamak Stall 24/7 categories
('770e8400-e29b-41d4-a716-446655440025', '660e8400-e29b-41d4-a716-446655440009', 'Roti', 'Various roti options', 1),
('770e8400-e29b-41d4-a716-446655440026', '660e8400-e29b-41d4-a716-446655440009', 'Nasi Lemak', 'Nasi lemak varieties', 2),
('770e8400-e29b-41d4-a716-446655440027', '660e8400-e29b-41d4-a716-446655440009', 'Mee Goreng', 'Fried noodles', 3),
('770e8400-e29b-41d4-a716-446655440028', '660e8400-e29b-41d4-a716-446655440009', 'Beverages', 'Teh tarik and drinks', 4),

-- Cendol Durian categories
('770e8400-e29b-41d4-a716-446655440029', '660e8400-e29b-41d4-a716-446655440010', 'Cendol', 'Shaved ice desserts', 1),
('770e8400-e29b-41d4-a716-446655440030', '660e8400-e29b-41d4-a716-446655440010', 'Durian Specials', 'Durian-based desserts', 2),
('770e8400-e29b-41d4-a716-446655440031', '660e8400-e29b-41d4-a716-446655440010', 'Beverages', 'Drinks', 3);

-- ============================================================================
-- MENU ITEMS
-- ============================================================================

-- Nasi Lemak Pak Ali menu items
INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_available) VALUES
('880e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'Nasi Lemak Ayam', 'Nasi lemak with fried chicken, sambal, cucumber, peanuts, and anchovies', 12.00, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop', true),
('880e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'Nasi Lemak Rendang', 'Nasi lemak with beef rendang, sambal, and sides', 15.00, 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop', true),
('880e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'Nasi Lemak Ikan Bilis', 'Classic nasi lemak with anchovies, sambal, and egg', 8.00, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop', true),
('880e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440002', 'Sambal Sotong', 'Spicy squid sambal', 10.00, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop', true),
('880e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440003', 'Teh Tarik', 'Pulled tea with condensed milk', 3.50, 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=600&fit=crop', true),
('880e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440003', 'Kopi O', 'Black coffee', 2.50, 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&h=600&fit=crop', true),

-- Char Kuey Teow Master menu items
('880e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440004', 'Char Kuey Teow', 'Wok-fried flat rice noodles with prawns, cockles, and bean sprouts', 10.00, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop', true),
('880e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440004', 'Char Kuey Teow Special', 'Char kuey teow with extra prawns and cockles', 15.00, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop', true),
('880e8400-e29b-41d4-a716-446655440009', '660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440005', 'Hokkien Mee', 'Thick noodles in dark soy sauce with pork and prawns', 12.00, 'https://images.unsplash.com/photo-1559314809-0d155014f29e?w=800&h=600&fit=crop', true),
('880e8400-e29b-41d4-a716-446655440010', '660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440006', 'Lime Juice', 'Fresh lime juice', 4.00, 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&h=600&fit=crop', true),

-- Roti Canai Corner menu items
('880e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440007', 'Roti Canai', 'Plain roti canai with dhal curry', 2.50, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop', true),
('880e8400-e29b-41d4-a716-446655440012', '660e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440007', 'Roti Telur', 'Roti canai with egg', 3.50, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop', true),
('880e8400-e29b-41d4-a716-446655440013', '660e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440007', 'Roti Bawang', 'Roti canai with onions', 3.00, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop', true),
('880e8400-e29b-41d4-a716-446655440014', '660e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440007', 'Roti Planta', 'Roti canai with margarine', 3.00, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop', true),
('880e8400-e29b-41d4-a716-446655440015', '660e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440008', 'Chicken Curry', 'Spicy chicken curry', 8.00, 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop', true),
('880e8400-e29b-41d4-a716-446655440016', '660e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440009', 'Teh Tarik', 'Pulled tea', 3.50, 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=600&fit=crop', true),

-- Bak Kut Teh House menu items
('880e8400-e29b-41d4-a716-446655440017', '660e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440010', 'Bak Kut Teh (Pork Ribs)', 'Pork rib soup with herbs and spices', 18.00, 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=800&h=600&fit=crop', true),
('880e8400-e29b-41d4-a716-446655440018', '660e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440010', 'Bak Kut Teh (Mixed)', 'Mixed pork parts in herbal soup', 20.00, 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=800&h=600&fit=crop', true),
('880e8400-e29b-41d4-a716-446655440019', '660e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440011', 'White Rice', 'Steamed white rice', 2.00, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop', true),
('880e8400-e29b-41d4-a716-446655440020', '660e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440011', 'You Char Kuey', 'Fried dough fritters', 3.00, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop', true),
('880e8400-e29b-41d4-a716-446655440021', '660e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440012', 'Chinese Tea', 'Hot Chinese tea', 2.50, 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&h=600&fit=crop', true),

-- Hainanese Chicken Rice menu items
('880e8400-e29b-41d4-a716-446655440022', '660e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440013', 'Chicken Rice (Quarter)', 'Quarter chicken with fragrant rice and soup', 12.00, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop', true),
('880e8400-e29b-41d4-a716-446655440023', '660e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440013', 'Chicken Rice (Half)', 'Half chicken with fragrant rice and soup', 22.00, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop', true),
('880e8400-e29b-41d4-a716-446655440024', '660e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440013', 'Chicken Rice (Whole)', 'Whole chicken with fragrant rice and soup', 40.00, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop', true),
('880e8400-e29b-41d4-a716-446655440025', '660e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440014', 'Steamed Chicken', 'Steamed chicken option', 15.00, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop', true),
('880e8400-e29b-41d4-a716-446655440026', '660e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440015', 'Barley Water', 'Cold barley drink', 3.50, 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=600&fit=crop', true),

-- Laksa Penang menu items
('880e8400-e29b-41d4-a716-446655440027', '660e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440016', 'Laksa Penang', 'Sour and spicy fish-based noodle soup', 8.00, 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop', true),
('880e8400-e29b-41d4-a716-446655440028', '660e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440016', 'Laksa Special', 'Laksa with extra fish and prawns', 12.00, 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop', true),
('880e8400-e29b-41d4-a716-446655440029', '660e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440017', 'Extra Fish', 'Additional fish pieces', 3.00, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop', true),
('880e8400-e29b-41d4-a716-446655440030', '660e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440018', 'Lime Juice', 'Fresh lime juice', 4.00, 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&h=600&fit=crop', true),

-- Satay Kajang menu items
('880e8400-e29b-41d4-a716-446655440031', '660e8400-e29b-41d4-a716-446655440007', '770e8400-e29b-41d4-a716-446655440019', 'Satay Ayam (10 sticks)', '10 chicken satay sticks with peanut sauce', 15.00, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop', true),
('880e8400-e29b-41d4-a716-446655440032', '660e8400-e29b-41d4-a716-446655440007', '770e8400-e29b-41d4-a716-446655440019', 'Satay Daging (10 sticks)', '10 beef satay sticks with peanut sauce', 18.00, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop', true),
('880e8400-e29b-41d4-a716-446655440033', '660e8400-e29b-41d4-a716-446655440007', '770e8400-e29b-41d4-a716-446655440019', 'Satay Kambing (10 sticks)', '10 mutton satay sticks with peanut sauce', 20.00, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop', true),
('880e8400-e29b-41d4-a716-446655440034', '660e8400-e29b-41d4-a716-446655440007', '770e8400-e29b-41d4-a716-446655440020', 'Ketupat', 'Compressed rice cakes', 2.00, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop', true),
('880e8400-e29b-41d4-a716-446655440035', '660e8400-e29b-41d4-a716-446655440007', '770e8400-e29b-41d4-a716-446655440021', 'Teh O Ais', 'Iced tea without milk', 3.00, 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=600&fit=crop', true),

-- Rendang Tok menu items
('880e8400-e29b-41d4-a716-446655440036', '660e8400-e29b-41d4-a716-446655440008', '770e8400-e29b-41d4-a716-446655440022', 'Rendang Daging', 'Beef rendang with coconut and spices', 16.00, 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop', true),
('880e8400-e29b-41d4-a716-446655440037', '660e8400-e29b-41d4-a716-446655440008', '770e8400-e29b-41d4-a716-446655440022', 'Rendang Ayam', 'Chicken rendang', 14.00, 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop', true),
('880e8400-e29b-41d4-a716-446655440038', '660e8400-e29b-41d4-a716-446655440008', '770e8400-e29b-41d4-a716-446655440023', 'Nasi Putih', 'Steamed white rice', 2.00, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop', true),
('880e8400-e29b-41d4-a716-446655440039', '660e8400-e29b-41d4-a716-446655440008', '770e8400-e29b-41d4-a716-446655440023', 'Acar', 'Pickled vegetables', 3.00, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop', true),
('880e8400-e29b-41d4-a716-446655440040', '660e8400-e29b-41d4-a716-446655440008', '770e8400-e29b-41d4-a716-446655440024', 'Air Bandung', 'Rose syrup drink with milk', 4.00, 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=600&fit=crop', true),

-- Mamak Stall 24/7 menu items
('880e8400-e29b-41d4-a716-446655440041', '660e8400-e29b-41d4-a716-446655440009', '770e8400-e29b-41d4-a716-446655440025', 'Roti Canai', 'Plain roti canai', 2.50, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop', true),
('880e8400-e29b-41d4-a716-446655440042', '660e8400-e29b-41d4-a716-446655440009', '770e8400-e29b-41d4-a716-446655440025', 'Roti Telur Bawang', 'Roti with egg and onions', 4.00, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop', true),
('880e8400-e29b-41d4-a716-446655440043', '660e8400-e29b-41d4-a716-446655440009', '770e8400-e29b-41d4-a716-446655440026', 'Nasi Lemak', 'Coconut rice with sambal and sides', 6.00, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop', true),
('880e8400-e29b-41d4-a716-446655440044', '660e8400-e29b-41d4-a716-446655440009', '770e8400-e29b-41d4-a716-446655440027', 'Mee Goreng', 'Fried noodles with vegetables', 8.00, 'https://images.unsplash.com/photo-1559314809-0d155014f29e?w=800&h=600&fit=crop', true),
('880e8400-e29b-41d4-a716-446655440045', '660e8400-e29b-41d4-a716-446655440009', '770e8400-e29b-41d4-a716-446655440028', 'Teh Tarik', 'Pulled tea', 3.50, 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=600&fit=crop', true),
('880e8400-e29b-41d4-a716-446655440046', '660e8400-e29b-41d4-a716-446655440009', '770e8400-e29b-41d4-a716-446655440028', 'Milo Dinosaur', 'Iced Milo with extra Milo powder', 5.00, 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=600&fit=crop', true),

-- Cendol Durian menu items
('880e8400-e29b-41d4-a716-446655440047', '660e8400-e29b-41d4-a716-446655440010', '770e8400-e29b-41d4-a716-446655440029', 'Cendol', 'Shaved ice with green jelly, red beans, and coconut milk', 5.00, 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=600&fit=crop', true),
('880e8400-e29b-41d4-a716-446655440048', '660e8400-e29b-41d4-a716-446655440010', '770e8400-e29b-41d4-a716-446655440030', 'Cendol Durian', 'Cendol with fresh durian', 12.00, 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=600&fit=crop', true),
('880e8400-e29b-41d4-a716-446655440049', '660e8400-e29b-41d4-a716-446655440010', '770e8400-e29b-41d4-a716-446655440030', 'Durian Pengat', 'Durian in sweet coconut milk', 15.00, 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=600&fit=crop', true),
('880e8400-e29b-41d4-a716-446655440050', '660e8400-e29b-41d4-a716-446655440010', '770e8400-e29b-41d4-a716-446655440031', 'Ice Kacang', 'Shaved ice with various toppings', 6.00, 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=600&fit=crop', true);

-- ============================================================================
-- NOTES:
-- ============================================================================
-- 1. user_id in vendors table is set to NULL (vendors.user_id is nullable)
--    To link vendors to actual users later, run:
--    UPDATE vendors SET user_id = '<auth_user_id>' WHERE id = '<vendor_id>';
-- 2. All prices are in Malaysian Ringgit (RM)
-- 3. Menu categories are optional - menu items can have category_id = NULL
-- 4. Some restaurants have categories, some don't (you can remove categories if not needed)
-- 5. Image URLs use Unsplash placeholder images for testing
--    Replace with actual Supabase Storage URLs when uploading real images
-- 6. All restaurants are set to 'active' except Cendol Durian which is 'pending'
-- 7. Food categories match Malaysian dietary requirements (Halal/Non-Halal)
-- ============================================================================

