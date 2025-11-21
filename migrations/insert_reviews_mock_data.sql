-- Insert mock review data for restaurants
-- This file inserts sample reviews for testing purposes
-- Run this in your BACK OFFICE Supabase database

-- Note: user_id values are mock UUIDs. In production, these should be actual auth.users IDs from the main database.
-- For testing, you can use any UUID format, but RLS policies will only work if the user_id matches auth.uid()

-- Reviews for Nasi Lemak Pak Ali (660e8400-e29b-41d4-a716-446655440001)
INSERT INTO reviews (user_id, restaurant_id, rating, review_text, helpful_count, status, created_at) VALUES
('11111111-1111-1111-1111-111111111111', '660e8400-e29b-41d4-a716-446655440001', 5, 'Absolutely amazing nasi lemak! The coconut rice is so fragrant and the sambal has the perfect balance of sweet and spicy. The crispy anchovies add a great crunch. This is the best nasi lemak I''ve had in Ampang!', 12, 'active', '2025-08-15 10:30:00+00'),
('22222222-2222-2222-2222-222222222222', '660e8400-e29b-41d4-a716-446655440001', 5, 'Authentic Malaysian breakfast experience! The portion is generous and the price is very reasonable. The staff are friendly and service is quick. Highly recommend!', 8, 'active', '2025-07-20 08:15:00+00'),
('33333333-3333-3333-3333-333333333333', '660e8400-e29b-41d4-a716-446655440001', 4, 'Great nasi lemak, though I wish they had more variety in the side dishes. The sambal is excellent and the rice is perfectly cooked.', 5, 'active', '2025-06-10 09:00:00+00'),
('44444444-4444-4444-4444-444444444444', '660e8400-e29b-41d4-a716-446655440001', 5, 'Perfect for a quick breakfast! The food is always fresh and the quality is consistent. Love coming here every weekend!', 10, 'active', '2025-05-25 07:45:00+00'),
('55555555-5555-5555-5555-555555555555', '660e8400-e29b-41d4-a716-446655440001', 4, 'Good nasi lemak, but can get quite crowded during peak hours. The food quality makes up for the wait though.', 3, 'active', '2025-04-18 11:20:00+00');

-- Reviews for Char Kuey Teow Master (660e8400-e29b-41d4-a716-446655440002)
INSERT INTO reviews (user_id, restaurant_id, rating, review_text, helpful_count, status, created_at) VALUES
('11111111-1111-1111-1111-111111111111', '660e8400-e29b-41d4-a716-446655440002', 5, 'The best char kuey teow in Petaling Street! The wok hei (breath of the wok) is incredible. The noodles are perfectly cooked with just the right amount of char. The prawns are fresh and the cockles add great flavor.', 15, 'active', '2025-08-20 19:30:00+00'),
('22222222-2222-2222-2222-222222222222', '660e8400-e29b-41d4-a716-446655440002', 5, 'Amazing char kuey teow! The chef really knows how to work the wok. Every bite is packed with flavor. Worth the wait!', 11, 'active', '2025-07-25 18:45:00+00'),
('33333333-3333-3333-3333-333333333333', '660e8400-e29b-41d4-a716-446655440002', 4, 'Very good char kuey teow. The noodles are well-seasoned and the portion is generous. Only downside is the long queue during dinner time.', 7, 'active', '2025-06-15 20:00:00+00'),
('44444444-4444-4444-4444-444444444444', '660e8400-e29b-41d4-a716-446655440002', 5, 'Authentic Penang-style char kuey teow! The balance of sweet, savory, and spicy is perfect. Highly recommend trying this!', 9, 'active', '2025-05-30 19:15:00+00'),
('66666666-6666-6666-6666-666666666666', '660e8400-e29b-41d4-a716-446655440002', 4, 'Great food but the place can get quite hot and crowded. The char kuey teow is definitely worth it though!', 4, 'active', '2025-04-22 18:30:00+00');

-- Reviews for Roti Canai Corner (660e8400-e29b-41d4-a716-446655440003)
INSERT INTO reviews (user_id, restaurant_id, rating, review_text, helpful_count, status, created_at) VALUES
('11111111-1111-1111-1111-111111111111', '660e8400-e29b-41d4-a716-446655440003', 5, 'Fresh roti canai made to order! The roti is crispy on the outside and soft on the inside. The dhal curry is rich and flavorful. Best roti canai in Brickfields!', 13, 'active', '2025-08-18 09:00:00+00'),
('22222222-2222-2222-2222-222222222222', '660e8400-e29b-41d4-a716-446655440003', 5, 'Love the variety of curries here! The roti is always fresh and the service is quick. Great value for money.', 8, 'active', '2025-07-22 10:30:00+00'),
('33333333-3333-3333-3333-333333333333', '660e8400-e29b-41d4-a716-446655440003', 4, 'Good roti canai, though I prefer it a bit crispier. The curries are excellent and the staff are friendly.', 6, 'active', '2025-06-12 08:45:00+00'),
('44444444-4444-4444-4444-444444444444', '660e8400-e29b-41d4-a716-446655440003', 5, 'Perfect breakfast spot! The roti telur is my favorite. The curry is not too spicy and has great depth of flavor.', 10, 'active', '2025-05-28 09:15:00+00'),
('77777777-7777-7777-7777-777777777777', '660e8400-e29b-41d4-a716-446655440003', 4, 'Solid roti canai place. The food is good and the prices are reasonable. Can get busy during peak hours.', 5, 'active', '2025-04-20 10:00:00+00');

-- Reviews for Bak Kut Teh House (660e8400-e29b-41d4-a716-446655440004)
INSERT INTO reviews (user_id, restaurant_id, rating, review_text, helpful_count, status, created_at) VALUES
('11111111-1111-1111-1111-111111111111', '660e8400-e29b-41d4-a716-446655440004', 5, 'Authentic Klang-style bak kut teh! The soup is rich and flavorful with the perfect blend of herbs and spices. The pork ribs are tender and fall off the bone. This is the real deal!', 14, 'active', '2025-08-22 12:30:00+00'),
('22222222-2222-2222-2222-222222222222', '660e8400-e29b-41d4-a716-446655440004', 5, 'Best bak kut teh I''ve had outside of Klang! The soup is aromatic and the meat is perfectly cooked. Highly recommend!', 9, 'active', '2025-07-28 13:00:00+00'),
('33333333-3333-3333-3333-333333333333', '660e8400-e29b-41d4-a716-446655440004', 4, 'Very good bak kut teh. The soup is flavorful though I wish it was a bit stronger. The pork ribs are tender and well-seasoned.', 7, 'active', '2025-06-18 12:45:00+00'),
('44444444-4444-4444-4444-444444444444', '660e8400-e29b-41d4-a716-446655440004', 5, 'Excellent bak kut teh! The herbal soup is comforting and the portion is generous. Great for a hearty meal!', 11, 'active', '2025-05-30 13:15:00+00'),
('88888888-8888-8888-8888-888888888888', '660e8400-e29b-41d4-a716-446655440004', 4, 'Good bak kut teh, though the soup could be hotter. The meat quality is good and the service is friendly.', 4, 'active', '2025-04-25 12:20:00+00');

-- Reviews for Hainanese Chicken Rice (660e8400-e29b-41d4-a716-446655440005)
INSERT INTO reviews (user_id, restaurant_id, rating, review_text, helpful_count, status, created_at) VALUES
('11111111-1111-1111-1111-111111111111', '660e8400-e29b-41d4-a716-446655440005', 5, 'Perfect Hainanese chicken rice! The chicken is tender and juicy, the rice is fragrant with chicken fat, and the ginger sauce is amazing. This is how chicken rice should be!', 16, 'active', '2025-08-25 14:00:00+00'),
('22222222-2222-2222-2222-222222222222', '660e8400-e29b-41d4-a716-446655440005', 5, 'Best chicken rice in Imbi! The chicken is perfectly poached and the rice is so flavorful. The chili sauce is the perfect complement.', 12, 'active', '2025-07-30 14:30:00+00'),
('33333333-3333-3333-3333-333333333333', '660e8400-e29b-41d4-a716-446655440005', 4, 'Very good chicken rice. The chicken is tender and the rice is well-cooked. The portion is reasonable for the price.', 8, 'active', '2025-06-20 15:00:00+00'),
('44444444-4444-4444-4444-444444444444', '660e8400-e29b-41d4-a716-446655440005', 5, 'Excellent chicken rice! The quality is consistent and the service is quick. This is my go-to place for chicken rice!', 10, 'active', '2025-05-28 14:45:00+00'),
('99999999-9999-9999-9999-999999999999', '660e8400-e29b-41d4-a716-446655440005', 4, 'Good chicken rice, though I prefer the chicken a bit more tender. The rice and sauces are excellent though!', 5, 'active', '2025-04-28 15:15:00+00');

-- Reviews for Laksa Penang (660e8400-e29b-41d4-a716-446655440006)
INSERT INTO reviews (user_id, restaurant_id, rating, review_text, helpful_count, status, created_at) VALUES
('11111111-1111-1111-1111-111111111111', '660e8400-e29b-41d4-a716-446655440006', 5, 'Authentic Penang laksa! The sour and spicy fish-based soup is perfect. The tamarind gives it that signature tangy flavor. This brings back memories of Penang!', 15, 'active', '2025-08-28 11:00:00+00'),
('22222222-2222-2222-2222-222222222222', '660e8400-e29b-41d4-a716-446655440006', 5, 'Amazing laksa! The balance of sour, spicy, and savory is perfect. The fish is fresh and the noodles are cooked just right.', 11, 'active', '2025-08-01 11:30:00+00'),
('33333333-3333-3333-3333-333333333333', '660e8400-e29b-41d4-a716-446655440006', 4, 'Very good laksa, though I prefer it a bit spicier. The soup base is excellent and the ingredients are fresh.', 7, 'active', '2025-06-25 12:00:00+00'),
('44444444-4444-4444-4444-444444444444', '660e8400-e29b-41d4-a716-446655440006', 5, 'Perfect laksa for a hot day! The sour and spicy combination is refreshing. Highly recommend!', 9, 'active', '2025-06-02 11:45:00+00'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '660e8400-e29b-41d4-a716-446655440006', 4, 'Good laksa, though the portion could be bigger. The flavor is authentic and the price is reasonable.', 4, 'active', '2025-05-05 12:15:00+00');

-- Reviews for Satay Kajang (660e8400-e29b-41d4-a716-446655440007)
INSERT INTO reviews (user_id, restaurant_id, rating, review_text, helpful_count, status, created_at) VALUES
('11111111-1111-1111-1111-111111111111', '660e8400-e29b-41d4-a716-446655440007', 5, 'Best satay in Kajang! The meat is perfectly marinated and grilled to perfection. The peanut sauce is rich and creamy. This is the real Kajang satay experience!', 17, 'active', '2025-08-30 19:00:00+00'),
('22222222-2222-2222-2222-222222222222', '660e8400-e29b-41d4-a716-446655440007', 5, 'Amazing satay! The meat is tender and flavorful. The peanut sauce is the perfect complement. Great for dinner!', 13, 'active', '2025-08-05 19:30:00+00'),
('33333333-3333-3333-3333-333333333333', '660e8400-e29b-41d4-a716-446655440007', 4, 'Very good satay. The meat is well-marinated though I wish there were more options. The peanut sauce is excellent.', 8, 'active', '2025-07-10 20:00:00+00'),
('44444444-4444-4444-4444-444444444444', '660e8400-e29b-41d4-a716-446655440007', 5, 'Perfect satay for a late night meal! The grilling is done right and the sauce is delicious. Highly recommend!', 10, 'active', '2025-06-28 19:45:00+00'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '660e8400-e29b-41d4-a716-446655440007', 4, 'Good satay, though it can get quite smoky. The flavor is great and the price is reasonable.', 5, 'active', '2025-05-10 20:15:00+00');

-- Reviews for Rendang Tok (660e8400-e29b-41d4-a716-446655440008)
INSERT INTO reviews (user_id, restaurant_id, rating, review_text, helpful_count, status, created_at) VALUES
('11111111-1111-1111-1111-111111111111', '660e8400-e29b-41d4-a716-446655440008', 5, 'Authentic Melaka rendang! The beef is slow-cooked to perfection and the spices are well-balanced. The coconut gives it that rich, creamy texture. This is traditional rendang at its best!', 14, 'active', '2025-09-02 13:30:00+00'),
('22222222-2222-2222-2222-222222222222', '660e8400-e29b-41d4-a716-446655440008', 5, 'Best rendang I''ve had! The meat is so tender and the flavor is incredible. The spices are perfectly balanced. Highly recommend!', 11, 'active', '2025-08-08 14:00:00+00'),
('33333333-3333-3333-3333-333333333333', '660e8400-e29b-41d4-a716-446655440008', 4, 'Very good rendang. The beef is tender though I prefer it a bit spicier. The coconut flavor is excellent.', 7, 'active', '2025-07-15 13:45:00+00'),
('44444444-4444-4444-4444-444444444444', '660e8400-e29b-41d4-a716-446655440008', 5, 'Excellent rendang! The slow-cooking process really shows in the tenderness of the meat. Great traditional dish!', 9, 'active', '2025-06-30 14:15:00+00'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '660e8400-e29b-41d4-a716-446655440008', 4, 'Good rendang, though the portion could be bigger. The flavor is authentic and the meat quality is good.', 4, 'active', '2025-05-15 14:30:00+00');

-- Reviews for Mamak Stall 24/7 (660e8400-e29b-41d4-a716-446655440009)
INSERT INTO reviews (user_id, restaurant_id, rating, review_text, helpful_count, status, created_at) VALUES
('11111111-1111-1111-1111-111111111111', '660e8400-e29b-41d4-a716-446655440009', 5, 'Perfect 24/7 mamak experience! Great for late night cravings. The roti is fresh, the nasi lemak is good, and the teh tarik is excellent. Always open when you need it!', 18, 'active', '2025-09-05 02:00:00+00'),
('22222222-2222-2222-2222-222222222222', '660e8400-e29b-41d4-a716-446655440009', 5, 'Best late night spot! The food is always fresh even at 3am. The service is quick and the prices are reasonable. My go-to place!', 12, 'active', '2025-08-10 01:30:00+00'),
('33333333-3333-3333-3333-333333333333', '660e8400-e29b-41d4-a716-446655440009', 4, 'Good 24/7 mamak. The food quality is consistent though the variety could be better. Great for a quick meal anytime.', 8, 'active', '2025-07-20 02:15:00+00'),
('44444444-4444-4444-4444-444444444444', '660e8400-e29b-41d4-a716-446655440009', 5, 'Love this place! Open 24/7 and the food is always good. The roti canai and teh tarik are my favorites!', 10, 'active', '2025-07-05 01:45:00+00'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '660e8400-e29b-41d4-a716-446655440009', 4, 'Solid mamak stall. The food is good though it can get quite busy during peak hours. Great for a quick bite!', 5, 'active', '2025-06-10 02:30:00+00');

-- Note: Cendol Durian (660e8400-e29b-41d4-a716-446655440010) has status 'pending', so no reviews are inserted for it
-- Reviews should only be added for restaurants with status 'active'

