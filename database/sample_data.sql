-- =====================================================================
-- Travel & Tourism Management System with Smart Travel Planner
-- Sample Seed Data (MySQL 8.0+)
-- =====================================================================

USE travel_planner_db;

-- 1. SEED ATTRACTION CATEGORIES
INSERT INTO attraction_categories (category_id, name, icon_name, description) VALUES
(1, 'Adventure', 'FaCompass', 'Trekking, water sports, safaris, and outdoor thrills'),
(2, 'Nature & Scenery', 'FaMountain', 'Hills, waterfalls, national parks, and scenic viewpoints'),
(3, 'Heritage & History', 'FaLandmark', 'Forts, palaces, museums, and archaeological marvels'),
(4, 'Beach & Coastal', 'FaUmbrellaBeach', 'Sun-kissed beaches, promenades, and coastal islands'),
(5, 'Religious & Spiritual', 'FaPray', 'Temples, shrines, historic churches, and pilgrim centres'),
(6, 'Shopping & Bazaars', 'FaShoppingBag', 'Local handicraft markets, street shopping, and textiles'),
(7, 'Food & Culinary', 'FaUtensils', 'Authentic regional cuisine, seafood spots, and food trails'),
(8, 'Relaxation & Wellness', 'FaSpa', 'Resorts, sunset points, lakeside retreats, and quiet gardens');

-- 2. SEED USERS
-- PBKDF2 Password for all users: "Password@123"
-- Salt: "d9e8f7a6b5c4d3e2"
-- PBKDF2WithHmacSHA512 hash representation:
-- "a7c8b209d29ef1154562fa5342ec9a562ef0a28f7d98342111cbb9472e1ab5a69080512f45811c7908b98150f8c857d42cf38ec673efb4923f6630f9a2e6f42a"
INSERT INTO users (user_id, email, password_hash, salt, full_name, phone, role, status, avatar_url) VALUES
(1, 'admin@travivu.com', 'a7c8b209d29ef1154562fa5342ec9a562ef0a28f7d98342111cbb9472e1ab5a69080512f45811c7908b98150f8c857d42cf38ec673efb4923f6630f9a2e6f42a', 'd9e8f7a6b5c4d3e2', 'Administrator', '+91 9876543210', 'ADMIN', 'ACTIVE', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
(2, 'operator@gotrips.com', 'a7c8b209d29ef1154562fa5342ec9a562ef0a28f7d98342111cbb9472e1ab5a69080512f45811c7908b98150f8c857d42cf38ec673efb4923f6630f9a2e6f42a', 'd9e8f7a6b5c4d3e2', 'Alex Morgan', '+91 9811223344', 'OPERATOR', 'ACTIVE', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
(3, 'tourist@gmail.com', 'a7c8b209d29ef1154562fa5342ec9a562ef0a28f7d98342111cbb9472e1ab5a69080512f45811c7908b98150f8c857d42cf38ec673efb4923f6630f9a2e6f42a', 'd9e8f7a6b5c4d3e2', 'Rahul Sharma', '+91 9765432109', 'TOURIST', 'ACTIVE', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'),
(4, 'pending.operator@trips.com', 'a7c8b209d29ef1154562fa5342ec9a562ef0a28f7d98342111cbb9472e1ab5a69080512f45811c7908b98150f8c857d42cf38ec673efb4923f6630f9a2e6f42a', 'd9e8f7a6b5c4d3e2', 'Priya Patel', '+91 9922334455', 'OPERATOR', 'PENDING_APPROVAL', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150');

-- 3. SEED OPERATOR PROFILES
INSERT INTO operator_profiles (operator_id, company_name, license_number, years_in_business, office_address, support_phone, support_email, is_verified, admin_notes, verified_at) VALUES
(2, 'GoTrips Global Travels Ltd', 'OP-LIC-2023-8941', 7, 'Suite 402, Marina Heights, Visakhapatnam, AP, India', '+91 9811223344', 'support@gotrips.com', TRUE, 'All business documents, GST and tourism certifications verified.', NOW()),
(4, 'Himalayan Nomads Pvt Ltd', 'OP-LIC-2024-1102', 2, 'Mall Road, Old Manali, Himachal Pradesh, India', '+91 9922334455', 'hello@himalayannomads.com', FALSE, 'Pending PAN and commercial transport permit verification.', NULL);

-- 4. SEED DESTINATIONS (Matches UI Screen References 1 & 2)
INSERT INTO destinations (destination_id, name, state, country, description, best_season, daily_budget_estimated, currency, image_url, thumbnail_url, popularity_score, total_reviews, latitude, longitude, is_featured) VALUES
(1, 'Visakhapatnam', 'Andhra Pradesh', 'India', 'The City of Destiny, famous for pristine beaches, scenic hill stations, maritime history, and Buddhist heritage.', 'October to March', 2800.00, 'INR', 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=1200', 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=400', 4.85, 1240, 17.6868, 83.2185, TRUE),
(2, 'Goa', 'Goa', 'India', 'India tropical haven with sun-drenched golden beaches, Portuguese colonial architecture, vibrant shacks, and water sports.', 'November to February', 3500.00, 'INR', 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200', 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400', 4.80, 2450, 15.2993, 74.1240, TRUE),
(3, 'Jaipur', 'Rajasthan', 'India', 'The historic Pink City, home to majestic Rajput forts, ornate palaces, colorful bazaars, and opulent royal heritage.', 'October to March', 3200.00, 'INR', 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1200', 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=400', 4.75, 1890, 26.9124, 75.7873, TRUE),
(4, 'Santorini', 'Cyclades', 'Greece', 'Picturesque whitewashed cliffside towns, cobalt blue domes, dramatic volcanic caldera vistas, and world-class Aegean sunsets.', 'May to October', 9500.00, 'INR', 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200', 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400', 4.88, 1200, 36.3932, 25.4615, TRUE),
(5, 'Bali', 'Bali', 'Indonesia', 'The Island of the Gods, known for emerald terraced rice fields, sacred sea temples, coral reefs, and tranquil wellness culture.', 'April to October', 5500.00, 'INR', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400', 4.74, 980, -8.3405, 115.0920, TRUE),
(6, 'Switzerland', 'Bernese Alps', 'Switzerland', 'Magnificent snow-capped alpine peaks, turquoise glacial lakes, cogwheel mountain railways, and charming chalet villages.', 'June to September & Dec to March', 14500.00, 'INR', 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=1200', 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=400', 4.92, 1500, 46.8182, 8.2275, TRUE),
(7, 'Dubai', 'Dubai', 'UAE', 'A breathtaking futuristic metropolis boasting record-breaking skyscrapers, luxury mega malls, desert dunes, and marina yachting.', 'November to March', 11000.00, 'INR', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400', 4.68, 870, 25.2048, 55.2708, TRUE),
(8, 'Maldives', 'Kaafu Atoll', 'Maldives', 'Exclusive overwater villas, crystal clear turquoise lagoons, vibrant marine biodiversity, and world-class luxury snorkeling.', 'November to April', 16000.00, 'INR', 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1200', 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400', 4.89, 1100, 3.2028, 73.2207, TRUE),
(9, 'London', 'Greater London', 'United Kingdom', 'Historic global cultural capital filled with iconic monuments, royal parks, world-renowned museums, and thriving West End theatres.', 'May to September', 13000.00, 'INR', 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200', 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400', 4.90, 1680, 51.5074, -0.1278, TRUE);

-- 5. SEED ATTRACTIONS (Visakhapatnam & Goa for Smart Planner Route Optimization)
-- Visakhapatnam Attractions
INSERT INTO attractions (attraction_id, destination_id, category_id, name, description, estimated_duration_min, ticket_price, opening_time, closing_time, latitude, longitude, image_url, popularity_rating) VALUES
(101, 1, 4, 'Ramakrishna (RK) Beach & Promenade', 'Vibrant city beachfront with scenic walking promenades, street food, and calm ocean breezes.', 90, 0.00, '05:00:00', '23:00:00', 17.7142, 83.3235, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600', 4.7),
(102, 1, 3, 'INS Kursura Submarine Museum', 'A real decommissioned Russian submarine preserved on the sands of RK Beach, showcasing naval warfare history.', 75, 70.00, '14:00:00', '20:30:00', 17.7175, 83.3312, 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600', 4.9),
(103, 1, 3, 'TU 142 Aircraft Museum', 'Iconic long-range maritime anti-submarine reconnaissance aircraft converted into an interactive museum.', 60, 70.00, '14:00:00', '20:30:00', 17.7188, 83.3325, 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600', 4.8),
(104, 1, 2, 'Kailasagiri Hilltop Park', 'Scenic hill with panoramic views of the Bay of Bengal, ropeway cable car, and massive Shiva-Parvati statues.', 120, 50.00, '08:00:00', '20:00:00', 17.7490, 83.3423, 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600', 4.8),
(105, 1, 1, 'Rishikonda Beach & Watersports', 'Blue flag certified beach with golden sands, water scooters, speedboats, and beachside cafes.', 150, 250.00, '06:00:00', '18:30:00', 17.7818, 83.3852, 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=600', 4.7),
(106, 1, 5, 'Simhachalam Temple', 'Famous 11th-century hill shrine dedicated to Lord Narasimha, featuring intricately carved Kalinga architecture.', 120, 100.00, '07:00:00', '19:00:00', 17.7667, 83.2500, 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600', 4.9),
(107, 1, 2, 'Yarada Beach & Dolphin Nose', 'Secluded beach flanked by lush green hills on three sides and a historic lighthouse overlooking the bay.', 150, 40.00, '07:00:00', '17:30:00', 17.6534, 83.2689, 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600', 4.6),
(108, 1, 6, 'Jagadamba Centre & Lepakshi Emporium', 'Bustling commercial hub for Andhra silk sarees, Kondapalli wooden toys, and regional handicrafts.', 90, 0.00, '10:30:00', '21:30:00', 17.7120, 83.3005, 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600', 4.5);

-- Goa Attractions
INSERT INTO attractions (attraction_id, destination_id, category_id, name, description, estimated_duration_min, ticket_price, opening_time, closing_time, latitude, longitude, image_url, popularity_rating) VALUES
(201, 2, 3, 'Aguada Fort & Lighthouse', 'Historic 17th-century Portuguese fortress with panoramic Arabian Sea views and deep freshwater cisterns.', 90, 50.00, '09:00:00', '17:30:00', 15.4920, 73.7737, 'https://images.unsplash.com/photo-1588416936097-41850ab3d86d?w=600', 4.8),
(202, 2, 4, 'Baga Beach & Water Sports', 'Famous beach known for parasailing, lively beachfront shacks, beach music, and sunset sports.', 150, 400.00, '06:00:00', '22:00:00', 15.5553, 73.7517, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600', 4.7),
(203, 2, 5, 'Basilica of Bom Jesus', 'UNESCO World Heritage church holding the sacred relics of St. Francis Xavier, stunning baroque design.', 60, 0.00, '09:00:00', '18:30:00', 15.5009, 73.9116, 'https://images.unsplash.com/photo-1548625361-16a8d8e75db7?w=600', 4.9),
(204, 2, 2, 'Dudhsagar Waterfalls', 'Spectacular four-tiered waterfall cascading through dense Western Ghats jungle into a natural pool.', 240, 500.00, '08:00:00', '16:00:00', 15.3144, 74.3143, 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=600', 4.9),
(205, 2, 6, 'Anjuna Flea Market', 'Iconic beachfront market offering bohemian clothing, handmade jewelry, spices, and souvenirs.', 120, 0.00, '10:00:00', '20:00:00', 15.5804, 73.7431, 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600', 4.5);

-- 6. SEED ATTRACTION DISTANCES / GRAPH EDGES (For Dijkstra's Algorithm in Visakhapatnam)
-- Distances in km and travel time in minutes (by Car)
INSERT INTO attraction_distances (origin_attraction_id, dest_attraction_id, distance_km, travel_time_min, transport_mode, estimated_fare) VALUES
-- RK Beach <-> Submarine Museum
(101, 102, 1.2, 5, 'CAR', 40.00),
(102, 101, 1.2, 5, 'CAR', 40.00),
-- Submarine Museum <-> TU 142 Museum (across the road)
(102, 103, 0.2, 2, 'WALKING', 0.00),
(103, 102, 0.2, 2, 'WALKING', 0.00),
-- Submarine Museum <-> Kailasagiri Hill
(102, 104, 5.5, 14, 'CAR', 90.00),
(104, 102, 5.5, 14, 'CAR', 90.00),
-- Kailasagiri <-> Rishikonda Beach
(104, 105, 7.8, 16, 'CAR', 130.00),
(105, 104, 7.8, 16, 'CAR', 130.00),
-- RK Beach <-> Jagadamba Centre
(101, 108, 3.4, 10, 'CAR', 60.00),
(108, 101, 3.4, 10, 'CAR', 60.00),
-- Jagadamba <-> Simhachalam Temple
(108, 106, 16.5, 35, 'CAR', 260.00),
(106, 108, 16.5, 35, 'CAR', 260.00),
-- RK Beach <-> Yarada Beach
(101, 107, 18.2, 40, 'CAR', 290.00),
(107, 101, 18.2, 40, 'CAR', 290.00),
-- Simhachalam Temple <-> Kailasagiri Hill
(106, 104, 18.0, 38, 'CAR', 280.00),
(104, 106, 18.0, 38, 'CAR', 280.00);

-- 7. SEED PACKAGES (Matches Gotrips UI Screen Reference 2)
INSERT INTO packages (package_id, operator_id, destination_id, title, slug, description, duration_days, duration_nights, base_price_per_person, max_travellers, included_services, excluded_services, accommodation_details, transportation_details, image_url, rating, total_bookings, is_active) VALUES
(1, 2, 9, 'London City Explorer', 'london-city-explorer', 'Explore the historic British capital covering Tower of London, Big Ben, Westminster Abbey, Buckingham Palace, and the London Eye.', 5, 4, 78500.00, 25, '4-Star Central Hotel, Daily Breakfast, Metro Pass, Fast-track Palace Tickets, Guided Tour', 'International Airfare, Visa Fees, Personal Shopping, Travel Insurance', 'The Strand Palace Hotel or similar', 'London Underground Pass + Executive Coach', 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800', 4.90, 168, TRUE),
(2, 2, 9, 'Scottish Highlands Adventure', 'scottish-highlands-adventure', 'Journey through majestic glens, mysterious lochs, Isle of Skye, and historic castles of Inverness and Edinburgh.', 7, 6, 103000.00, 20, 'Boutique Highland Inns, Breakfast & Dinners, Luxury Coach, Loch Ness Cruise, Whiskey Tasting', 'Flights to Edinburgh, Personal Expenses, Gratuities', 'Highland Country Lodges', 'Private Luxury Mini-Coach with WiFi', 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800', 4.70, 210, TRUE),
(3, 2, 9, 'Royal Castles & Countryside', 'royal-castles-countryside', 'Experience royal British opulence with tours of Windsor Castle, the stone colleges of Oxford, and fairytale Cotswold villages.', 3, 2, 91000.00, 30, 'Luxury Manor Hotel, All Meals, Royal Entrance Tickets, English Afternoon Tea', 'Airfare, Alcoholic Beverages, Personal Purchases', 'Cotswold Country Manor Estate', 'Mercedes Sprinter Chauffeur Service', 'https://images.unsplash.com/photo-1526129318478-62ed807ebdf9?w=800', 4.80, 95, TRUE),
(4, 2, 9, 'Shakespeare''s England Tour', 'shakespeares-england-tour', 'Immerse yourself in Tudor heritage, Stratford-upon-Avon, Warwick Castle, and Roman baths in Bath.', 6, 5, 64500.00, 25, 'Heritage Hotels, Daily Breakfast, Theatre Tickets, Museum Entry Passes', 'Airfare, Lunch, Personal Expenses', 'Historic Coaching Inns', 'Comfort AC Coach', 'https://images.unsplash.com/photo-1543832923-44667a44c804?w=800', 4.60, 123, TRUE),
(5, 2, 1, 'Visakhapatnam Coastal Escape', 'visakhapatnam-coastal-escape', 'Unwind by the Bay of Bengal with visits to Submarine Museum, Kailasagiri hilltop, Rishikonda water adventures, and Yarada cliffs.', 3, 2, 8500.00, 30, 'Beachfront Resort, Buffet Breakfast, AC Cab Transfers, Museum Entries, Boat Ride', 'Train/Flight Tickets, Personal Expenses, Water Sports Extras', 'The Gateway Hotel Beach Road', 'Private AC Sedan for all 3 days', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800', 4.90, 172, TRUE),
(6, 2, 2, 'Goa Sun & Heritage Getaway', 'goa-sun-heritage-getaway', 'The best of Goa: North Goa water activities & Portuguese forts paired with serene South Goa heritage cathedrals and spice plantations.', 4, 3, 14500.00, 35, '4-Star Beach Resort, Breakfast, North & South Goa Sightseeing, Mandovi River Cruise', 'Flight Tickets, Water Sports Charges, Late Night Shacks', 'Resort Rio or similar, Arpora', 'AC Coach / Private Tempo Traveler', 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800', 4.80, 240, TRUE);

-- 8. SEED PACKAGE ITINERARY DAYS (Example for Visakhapatnam Coastal Escape)
INSERT INTO package_itinerary_days (package_id, day_number, title, description, morning_activity, afternoon_activity, evening_activity, meals_included) VALUES
(5, 1, 'Arrival & Beach Promenade', 'Arrive in Visakhapatnam, check in to hotel, and explore the city beachfront.', 'Hotel Check-in & Welcome Refreshment', 'INS Kursura Submarine Museum & TU 142 Aircraft Museum', 'Sunset stroll at RK Beach with coastal snacks', 'Welcome Dinner'),
(5, 2, 'Heights & Watersports Thrills', 'Ascend scenic Kailasagiri and enjoy golden sands and water adventures at Rishikonda.', 'Kailasagiri Ropeway and Hilltop Panorama', 'Seafood lunch followed by Rishikonda Beach jet-skiing', 'Boutique shopping at Jagadamba Emporium', 'Breakfast, Dinner'),
(5, 3, 'Spiritual Heritage & Departure', 'Visit the ancient Simhachalam temple and dolphin-viewpoint before farewell.', 'Simhachalam Temple Darshan', 'Scenic drive past Dolphin''s Nose Lighthouse', 'Transfer to Vizag Airport / Railway Station', 'Breakfast');

-- 9. SEED PACKAGE DEPARTURES (Concurrency inventory test slots)
INSERT INTO package_departures (departure_id, package_id, start_date, end_date, total_slots, available_slots, status) VALUES
(1, 1, '2026-12-01', '2026-12-05', 25, 12, 'OPEN'),
(2, 1, '2026-12-15', '2026-12-19', 25, 4, 'OPEN'),
(3, 5, '2026-12-05', '2026-12-07', 30, 18, 'OPEN'),
(4, 5, '2026-12-20', '2026-12-22', 30, 2, 'OPEN'), -- Peak departure with only 2 slots to test overbooking guard!
(5, 6, '2026-12-10', '2026-12-13', 35, 22, 'OPEN');

-- 10. SEED SAMPLE BOOKING & SIMULATED PAYMENT
INSERT INTO bookings (booking_id, booking_ref, user_id, departure_id, num_travelers, price_per_person, total_amount, booking_status, special_requests) VALUES
(1, 'BK-2026-894101', 3, 3, 2, 8500.00, 17000.00, 'CONFIRMED', 'Sea-facing rooms requested, vegetarian breakfast.');

INSERT INTO booking_travelers (booking_id, full_name, age, gender, id_proof_type, id_proof_number) VALUES
(1, 'Rahul Sharma', 28, 'MALE', 'AADHAAR', 'XXXX-XXXX-4512'),
(1, 'Ananya Sharma', 26, 'FEMALE', 'AADHAAR', 'XXXX-XXXX-8921');

INSERT INTO payments (payment_id, booking_id, transaction_ref, amount, payment_method, payment_status, paid_at) VALUES
(1, 1, 'TXN-SIM-20261102-8941', 17000.00, 'CARD_SIMULATED', 'SUCCESS', NOW());

-- 11. SEED REVIEWS
INSERT INTO reviews (user_id, package_id, rating, review_title, comment) VALUES
(3, 5, 5, 'Unforgettable Coastal Holiday!', 'The submarine museum and Rishikonda beach activities were exceptionally planned. Hotels and private cab were top notch!');

