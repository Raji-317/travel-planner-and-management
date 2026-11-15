package com.travel.config;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

/**
 * Automatically initializes database tables and seeds demo accounts and destinations
 * if the database is newly provisioned on the cloud (e.g. Railway, Render, Aiven).
 */
public class DatabaseInitializer {

    private static final String DEFAULT_HASH = "a7c8b209d29ef1154562fa5342ec9a562ef0a28f7d98342111cbb9472e1ab5a69080512f45811c7908b98150f8c857d42cf38ec673efb4923f6630f9a2e6f42a";
    private static final String DEFAULT_SALT = "d9e8f7a6b5c4d3e2";

    public static void initDatabase() {
        System.out.println("[DB-AUTO-INIT] Checking database schema and tables...");
        try (Connection conn = DatabaseConfig.getConnection();
             Statement stmt = conn.createStatement()) {

            // 1. USERS
            stmt.execute("CREATE TABLE IF NOT EXISTS users ("
                    + "user_id INT AUTO_INCREMENT PRIMARY KEY, "
                    + "email VARCHAR(120) NOT NULL UNIQUE, "
                    + "password_hash VARCHAR(256) NOT NULL, "
                    + "salt VARCHAR(64) NOT NULL, "
                    + "full_name VARCHAR(100) NOT NULL, "
                    + "phone VARCHAR(20), "
                    + "role ENUM('TOURIST', 'OPERATOR', 'ADMIN') NOT NULL DEFAULT 'TOURIST', "
                    + "status ENUM('ACTIVE', 'PENDING_APPROVAL', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE', "
                    + "avatar_url VARCHAR(255), "
                    + "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "
                    + "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, "
                    + "INDEX idx_user_email (email), "
                    + "INDEX idx_user_role (role)"
                    + ") ENGINE=InnoDB;");

            // 2. OPERATOR PROFILES
            stmt.execute("CREATE TABLE IF NOT EXISTS operator_profiles ("
                    + "operator_id INT PRIMARY KEY, "
                    + "company_name VARCHAR(150) NOT NULL, "
                    + "license_number VARCHAR(100) NOT NULL UNIQUE, "
                    + "years_in_business INT DEFAULT 1, "
                    + "office_address TEXT, "
                    + "support_phone VARCHAR(20), "
                    + "support_email VARCHAR(120), "
                    + "is_verified BOOLEAN NOT NULL DEFAULT FALSE, "
                    + "admin_notes TEXT, "
                    + "verified_at TIMESTAMP NULL, "
                    + "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "
                    + "FOREIGN KEY (operator_id) REFERENCES users(user_id) ON DELETE CASCADE"
                    + ") ENGINE=InnoDB;");

            // 3. DESTINATIONS
            stmt.execute("CREATE TABLE IF NOT EXISTS destinations ("
                    + "destination_id INT AUTO_INCREMENT PRIMARY KEY, "
                    + "name VARCHAR(100) NOT NULL, "
                    + "state VARCHAR(100) NOT NULL, "
                    + "country VARCHAR(100) NOT NULL, "
                    + "description TEXT NOT NULL, "
                    + "best_season VARCHAR(100), "
                    + "daily_budget_estimated DECIMAL(10, 2) NOT NULL DEFAULT 2500.00, "
                    + "currency VARCHAR(10) DEFAULT 'INR', "
                    + "image_url VARCHAR(500) NOT NULL, "
                    + "thumbnail_url VARCHAR(500), "
                    + "popularity_score DECIMAL(3, 2) DEFAULT 4.50, "
                    + "total_reviews INT DEFAULT 0, "
                    + "latitude DECIMAL(10, 7), "
                    + "longitude DECIMAL(10, 7), "
                    + "is_featured BOOLEAN DEFAULT FALSE, "
                    + "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "
                    + "INDEX idx_dest_name (name)"
                    + ") ENGINE=InnoDB;");

            // 4. ATTRACTION CATEGORIES
            stmt.execute("CREATE TABLE IF NOT EXISTS attraction_categories ("
                    + "category_id INT AUTO_INCREMENT PRIMARY KEY, "
                    + "name VARCHAR(60) NOT NULL UNIQUE, "
                    + "icon_name VARCHAR(50), "
                    + "description VARCHAR(255)"
                    + ") ENGINE=InnoDB;");

            // 5. ATTRACTIONS
            stmt.execute("CREATE TABLE IF NOT EXISTS attractions ("
                    + "attraction_id INT AUTO_INCREMENT PRIMARY KEY, "
                    + "destination_id INT NOT NULL, "
                    + "category_id INT NOT NULL, "
                    + "name VARCHAR(150) NOT NULL, "
                    + "description TEXT, "
                    + "estimated_duration_min INT NOT NULL DEFAULT 120, "
                    + "ticket_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00, "
                    + "opening_time TIME DEFAULT '09:00:00', "
                    + "closing_time TIME DEFAULT '18:00:00', "
                    + "latitude DECIMAL(10, 7), "
                    + "longitude DECIMAL(10, 7), "
                    + "image_url VARCHAR(500), "
                    + "popularity_rating DECIMAL(3, 2) DEFAULT 4.5, "
                    + "is_wheelchair_accessible BOOLEAN DEFAULT TRUE, "
                    + "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "
                    + "FOREIGN KEY (destination_id) REFERENCES destinations(destination_id) ON DELETE CASCADE, "
                    + "FOREIGN KEY (category_id) REFERENCES attraction_categories(category_id) ON DELETE RESTRICT"
                    + ") ENGINE=InnoDB;");

            // 6. PACKAGES
            stmt.execute("CREATE TABLE IF NOT EXISTS packages ("
                    + "package_id INT AUTO_INCREMENT PRIMARY KEY, "
                    + "operator_id INT NOT NULL, "
                    + "destination_id INT NOT NULL, "
                    + "title VARCHAR(200) NOT NULL, "
                    + "slug VARCHAR(220) UNIQUE, "
                    + "description TEXT NOT NULL, "
                    + "duration_days INT NOT NULL, "
                    + "duration_nights INT NOT NULL, "
                    + "base_price_per_person DECIMAL(10, 2) NOT NULL, "
                    + "max_travellers INT NOT NULL DEFAULT 30, "
                    + "included_services TEXT, "
                    + "excluded_services TEXT, "
                    + "accommodation_details VARCHAR(255), "
                    + "transportation_details VARCHAR(255), "
                    + "image_url VARCHAR(500) NOT NULL, "
                    + "rating DECIMAL(3, 2) DEFAULT 4.80, "
                    + "total_bookings INT DEFAULT 0, "
                    + "is_active BOOLEAN DEFAULT TRUE, "
                    + "rejection_notes TEXT NULL, "
                    + "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "
                    + "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, "
                    + "FOREIGN KEY (operator_id) REFERENCES users(user_id) ON DELETE CASCADE, "
                    + "FOREIGN KEY (destination_id) REFERENCES destinations(destination_id) ON DELETE CASCADE"
                    + ") ENGINE=InnoDB;");

            // 7. PACKAGE ITINERARY DAYS
            stmt.execute("CREATE TABLE IF NOT EXISTS package_itinerary_days ("
                    + "itinerary_day_id INT AUTO_INCREMENT PRIMARY KEY, "
                    + "package_id INT NOT NULL, "
                    + "day_number INT NOT NULL, "
                    + "title VARCHAR(150) NOT NULL, "
                    + "description TEXT NOT NULL, "
                    + "morning_activity VARCHAR(255), "
                    + "afternoon_activity VARCHAR(255), "
                    + "evening_activity VARCHAR(255), "
                    + "meals_included VARCHAR(100), "
                    + "FOREIGN KEY (package_id) REFERENCES packages(package_id) ON DELETE CASCADE, "
                    + "UNIQUE KEY uq_pkg_day (package_id, day_number)"
                    + ") ENGINE=InnoDB;");

            // 8. PACKAGE DEPARTURES
            stmt.execute("CREATE TABLE IF NOT EXISTS package_departures ("
                    + "departure_id INT AUTO_INCREMENT PRIMARY KEY, "
                    + "package_id INT NOT NULL, "
                    + "start_date DATE NOT NULL, "
                    + "end_date DATE NOT NULL, "
                    + "total_slots INT NOT NULL, "
                    + "available_slots INT NOT NULL, "
                    + "status ENUM('OPEN', 'FULL', 'CANCELLED', 'COMPLETED') DEFAULT 'OPEN', "
                    + "FOREIGN KEY (package_id) REFERENCES packages(package_id) ON DELETE CASCADE"
                    + ") ENGINE=InnoDB;");

            // 9. BOOKINGS
            stmt.execute("CREATE TABLE IF NOT EXISTS bookings ("
                    + "booking_id INT AUTO_INCREMENT PRIMARY KEY, "
                    + "booking_ref VARCHAR(36) NOT NULL UNIQUE, "
                    + "user_id INT NOT NULL, "
                    + "departure_id INT NOT NULL, "
                    + "num_travelers INT NOT NULL, "
                    + "price_per_person DECIMAL(10, 2) NOT NULL, "
                    + "total_amount DECIMAL(10, 2) NOT NULL, "
                    + "booking_status ENUM('CONFIRMED', 'PENDING', 'CANCELLED') DEFAULT 'PENDING', "
                    + "special_requests TEXT, "
                    + "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "
                    + "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, "
                    + "FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT, "
                    + "FOREIGN KEY (departure_id) REFERENCES package_departures(departure_id) ON DELETE RESTRICT"
                    + ") ENGINE=InnoDB;");

            // 10. BOOKING TRAVELERS
            stmt.execute("CREATE TABLE IF NOT EXISTS booking_travelers ("
                    + "traveler_id INT AUTO_INCREMENT PRIMARY KEY, "
                    + "booking_id INT NOT NULL, "
                    + "full_name VARCHAR(100) NOT NULL, "
                    + "age INT NOT NULL, "
                    + "gender ENUM('MALE', 'FEMALE', 'OTHER') NOT NULL, "
                    + "id_proof_type VARCHAR(50), "
                    + "id_proof_number VARCHAR(100), "
                    + "FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE"
                    + ") ENGINE=InnoDB;");

            // 11. PAYMENTS
            stmt.execute("CREATE TABLE IF NOT EXISTS payments ("
                    + "payment_id INT AUTO_INCREMENT PRIMARY KEY, "
                    + "booking_id INT NOT NULL, "
                    + "transaction_ref VARCHAR(64) NOT NULL UNIQUE, "
                    + "amount DECIMAL(10, 2) NOT NULL, "
                    + "payment_method ENUM('CARD_SIMULATED', 'UPI_SIMULATED', 'NETBANKING_SIMULATED') NOT NULL, "
                    + "payment_status ENUM('SUCCESS', 'PENDING', 'FAILED', 'REFUNDED') DEFAULT 'PENDING', "
                    + "paid_at TIMESTAMP NULL, "
                    + "failure_reason VARCHAR(255), "
                    + "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "
                    + "FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE"
                    + ") ENGINE=InnoDB;");

            // 12. CANCELLATIONS
            stmt.execute("CREATE TABLE IF NOT EXISTS cancellations ("
                    + "cancellation_id INT AUTO_INCREMENT PRIMARY KEY, "
                    + "booking_id INT NOT NULL UNIQUE, "
                    + "reason TEXT NOT NULL, "
                    + "refund_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00, "
                    + "refund_status ENUM('PROCESSED', 'PENDING', 'REJECTED') DEFAULT 'PENDING', "
                    + "cancelled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "
                    + "FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE"
                    + ") ENGINE=InnoDB;");

            // 13. REVIEWS
            stmt.execute("CREATE TABLE IF NOT EXISTS reviews ("
                    + "review_id INT AUTO_INCREMENT PRIMARY KEY, "
                    + "user_id INT NOT NULL, "
                    + "package_id INT NOT NULL, "
                    + "rating INT NOT NULL, "
                    + "review_title VARCHAR(150), "
                    + "comment TEXT NOT NULL, "
                    + "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "
                    + "FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE, "
                    + "FOREIGN KEY (package_id) REFERENCES packages(package_id) ON DELETE CASCADE, "
                    + "UNIQUE KEY uq_user_package_review (user_id, package_id)"
                    + ") ENGINE=InnoDB;");

            // 14. SAVED ITINERARIES
            stmt.execute("CREATE TABLE IF NOT EXISTS saved_itineraries ("
                    + "itinerary_id INT AUTO_INCREMENT PRIMARY KEY, "
                    + "user_id INT NULL, "
                    + "share_token VARCHAR(40) UNIQUE, "
                    + "title VARCHAR(150) NOT NULL, "
                    + "starting_location VARCHAR(100) NOT NULL, "
                    + "destination_id INT NOT NULL, "
                    + "travel_days INT NOT NULL, "
                    + "num_travelers INT NOT NULL DEFAULT 1, "
                    + "total_budget DECIMAL(10, 2) NOT NULL, "
                    + "estimated_cost DECIMAL(10, 2) NOT NULL, "
                    + "travel_pace ENUM('RELAXED', 'BALANCED', 'PACKED') DEFAULT 'BALANCED', "
                    + "preferred_transport ENUM('CAR', 'BIKE', 'PUBLIC_TRANSPORT', 'WALKING') DEFAULT 'CAR', "
                    + "interests_csv VARCHAR(255), "
                    + "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "
                    + "FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL, "
                    + "FOREIGN KEY (destination_id) REFERENCES destinations(destination_id) ON DELETE CASCADE"
                    + ") ENGINE=InnoDB;");

            // 15. ITINERARY DAYS
            stmt.execute("CREATE TABLE IF NOT EXISTS itinerary_days ("
                    + "itinerary_day_id INT AUTO_INCREMENT PRIMARY KEY, "
                    + "itinerary_id INT NOT NULL, "
                    + "day_number INT NOT NULL, "
                    + "day_date DATE NULL, "
                    + "estimated_day_cost DECIMAL(10, 2) DEFAULT 0.00, "
                    + "estimated_travel_time_min INT DEFAULT 0, "
                    + "FOREIGN KEY (itinerary_id) REFERENCES saved_itineraries(itinerary_id) ON DELETE CASCADE, "
                    + "UNIQUE KEY uq_itin_day (itinerary_id, day_number)"
                    + ") ENGINE=InnoDB;");

            // 16. ITINERARY PLACES
            stmt.execute("CREATE TABLE IF NOT EXISTS itinerary_places ("
                    + "itinerary_place_id INT AUTO_INCREMENT PRIMARY KEY, "
                    + "itinerary_day_id INT NOT NULL, "
                    + "attraction_id INT NOT NULL, "
                    + "visit_order INT NOT NULL, "
                    + "time_slot ENUM('MORNING', 'AFTERNOON', 'EVENING') NOT NULL, "
                    + "allocated_duration_min INT NOT NULL, "
                    + "travel_time_to_next_min INT DEFAULT 0, "
                    + "estimated_cost DECIMAL(10, 2) DEFAULT 0.00, "
                    + "notes VARCHAR(255), "
                    + "FOREIGN KEY (itinerary_day_id) REFERENCES itinerary_days(itinerary_day_id) ON DELETE CASCADE, "
                    + "FOREIGN KEY (attraction_id) REFERENCES attractions(attraction_id) ON DELETE RESTRICT"
                    + ") ENGINE=InnoDB;");

            // 17. WISHLIST
            stmt.execute("CREATE TABLE IF NOT EXISTS wishlist ("
                    + "wishlist_id INT AUTO_INCREMENT PRIMARY KEY, "
                    + "user_id INT NOT NULL, "
                    + "package_id INT NULL, "
                    + "destination_id INT NULL, "
                    + "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "
                    + "FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE, "
                    + "FOREIGN KEY (package_id) REFERENCES packages(package_id) ON DELETE CASCADE, "
                    + "FOREIGN KEY (destination_id) REFERENCES destinations(destination_id) ON DELETE CASCADE, "
                    + "UNIQUE KEY uq_user_wishlist_pkg (user_id, package_id), "
                    + "UNIQUE KEY uq_user_wishlist_dest (user_id, destination_id)"
                    + ") ENGINE=InnoDB;");

            // 18. LOGGED EXPENSES
            stmt.execute("CREATE TABLE IF NOT EXISTS tour_logged_expenses ("
                    + "expense_id INT AUTO_INCREMENT PRIMARY KEY, "
                    + "itinerary_id INT NULL, "
                    + "booking_id INT NULL, "
                    + "user_id INT NULL, "
                    + "category VARCHAR(50) NOT NULL DEFAULT 'OTHER', "
                    + "title VARCHAR(150) NOT NULL, "
                    + "amount DECIMAL(10, 2) NOT NULL, "
                    + "expense_date VARCHAR(50) NULL, "
                    + "notes TEXT NULL, "
                    + "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
                    + ") ENGINE=InnoDB;");

            // 19. SEED DEFAULT USERS (If table is empty)
            boolean usersExist = false;
            try (ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM users")) {
                if (rs.next() && rs.getInt(1) > 0) {
                    usersExist = true;
                }
            }

            if (!usersExist) {
                System.out.println("[DB-AUTO-INIT] Seeding demo users and initial data...");
                stmt.execute("INSERT IGNORE INTO users (user_id, email, password_hash, salt, full_name, phone, role, status, avatar_url) VALUES "
                        + "(1, 'admin@edu.com', '" + DEFAULT_HASH + "', '" + DEFAULT_SALT + "', 'System Administrator', '+91 9876543210', 'ADMIN', 'ACTIVE', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'), "
                        + "(2, 'operator@travelplanner.com', '" + DEFAULT_HASH + "', '" + DEFAULT_SALT + "', 'Alex Morgan', '+91 9811223344', 'OPERATOR', 'ACTIVE', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'), "
                        + "(3, 'tourist@gmail.com', '" + DEFAULT_HASH + "', '" + DEFAULT_SALT + "', 'Rahul Sharma', '+91 9765432109', 'TOURIST', 'ACTIVE', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150');");

                stmt.execute("INSERT IGNORE INTO operator_profiles (operator_id, company_name, license_number, years_in_business, office_address, support_phone, support_email, is_verified, verified_at) VALUES "
                        + "(2, 'Incredible India Journeys Ltd', 'LIC-IND-2024-9988', 7, 'Beach Road, Visakhapatnam, AP, India', '+91 9811223344', 'operator@travelplanner.com', TRUE, NOW());");
            }

            // 20. SEED CATEGORIES
            stmt.execute("INSERT IGNORE INTO attraction_categories (category_id, name, icon_name, description) VALUES "
                    + "(1, 'Adventure', 'FaCompass', 'Trekking, water sports, safaris, and outdoor thrills'), "
                    + "(2, 'Nature & Scenery', 'FaMountain', 'Hills, waterfalls, national parks, and scenic viewpoints'), "
                    + "(3, 'Heritage & History', 'FaLandmark', 'Forts, palaces, museums, and archaeological marvels'), "
                    + "(4, 'Beach & Coastal', 'FaUmbrellaBeach', 'Sun-kissed beaches, promenades, and coastal islands'), "
                    + "(5, 'Religious & Spiritual', 'FaPray', 'Temples, shrines, historic churches, and pilgrim centres'), "
                    + "(6, 'Shopping & Bazaars', 'FaShoppingBag', 'Local handicraft markets, street shopping, and textiles'), "
                    + "(7, 'Food & Culinary', 'FaUtensils', 'Authentic regional cuisine, seafood spots, and food trails'), "
                    + "(8, 'Relaxation & Wellness', 'FaSpa', 'Resorts, sunset points, lakeside retreats, and quiet gardens');");

            // 21. SEED DESTINATIONS (If empty)
            boolean destExist = false;
            try (ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM destinations")) {
                if (rs.next() && rs.getInt(1) > 0) {
                    destExist = true;
                }
            }

            if (!destExist) {
                stmt.execute("INSERT INTO destinations (destination_id, name, state, country, description, best_season, daily_budget_estimated, currency, image_url, thumbnail_url, popularity_score, total_reviews, latitude, longitude, is_featured) VALUES "
                        + "(1, 'Visakhapatnam', 'Andhra Pradesh', 'India', 'The City of Destiny, famous for pristine beaches, scenic hill stations, maritime history, and Buddhist heritage.', 'October to March', 2200.00, 'INR', 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=1200', 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=400', 4.85, 1240, 17.6868, 83.2185, TRUE), "
                        + "(2, 'Araku Valley', 'Andhra Pradesh', 'India', 'Lush green eastern ghat hill station famed for organic coffee plantations, tribal culture, and Borra Caves.', 'September to February', 1800.00, 'INR', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400', 4.75, 890, 18.3273, 82.8775, TRUE), "
                        + "(3, 'Goa', 'Goa', 'India', 'Sun-drenched tropical paradise with golden beaches, Portuguese colonial cathedrals, and coastal vibrancy.', 'November to February', 3500.00, 'INR', 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200', 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400', 4.80, 2450, 15.2993, 74.1240, TRUE), "
                        + "(4, 'Tirupati', 'Andhra Pradesh', 'India', 'One of the world most revered pilgrimage destinations, home to the sacred Sri Venkateswara Swamy Temple on Tirumala hills.', 'September to March', 1900.00, 'INR', 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200', 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400', 4.95, 3420, 13.6288, 79.4192, TRUE), "
                        + "(5, 'Jaipur', 'Rajasthan', 'India', 'The historic Pink City, home to majestic Rajput forts, ornate palaces, colorful bazaars, and opulent royal heritage.', 'October to March', 3200.00, 'INR', 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1200', 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=400', 4.75, 1890, 26.9124, 75.7873, TRUE);");

                // Seed Attractions
                stmt.execute("INSERT IGNORE INTO attractions (attraction_id, destination_id, category_id, name, description, estimated_duration_min, ticket_price, opening_time, closing_time, latitude, longitude, image_url, popularity_rating) VALUES "
                        + "(101, 1, 4, 'Ramakrishna (RK) Beach & Promenade', 'Vibrant beachfront promenade with street food and ocean views.', 90, 0.00, '05:00:00', '23:00:00', 17.7142, 83.3235, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600', 4.7), "
                        + "(102, 1, 3, 'INS Kursura Submarine Museum', 'Historic real decommissioned Soviet-built submarine turned into a museum.', 60, 40.00, '14:00:00', '20:30:00', 17.7172, 83.3314, 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d17?w=600', 4.8), "
                        + "(103, 1, 2, 'Kailasagiri Hilltop Park', 'Scenic hill park offering panoramic coastal views and ropeway.', 120, 20.00, '06:00:00', '21:00:00', 17.7493, 83.3422, 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600', 4.6), "
                        + "(104, 1, 2, 'Rushikonda Beach & Water Sports', 'Pristine beach offering surfing, speed boating, and swimming.', 150, 0.00, '06:00:00', '19:00:00', 17.7825, 83.3852, 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600', 4.7), "
                        + "(201, 2, 2, 'Borra Caves & Stalactite Formations', 'Million-year-old limestone caves illuminated with colored lights.', 120, 80.00, '10:00:00', '17:00:00', 18.2804, 83.0396, 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600', 4.8), "
                        + "(202, 2, 2, 'Katiki Waterfalls & Trek', 'Spectacular natural 50-foot waterfall surrounded by dense foliage.', 90, 0.00, '06:00:00', '18:00:00', 18.2917, 83.0189, 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=600', 4.6), "
                        + "(401, 4, 5, 'Tirumala Sri Venkateswara Swamy Temple', 'Sacred ancient Hindu temple atop the Seshachalam Hills.', 240, 300.00, '03:00:00', '23:30:00', 13.6833, 79.3500, 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600', 4.95);");

                // Seed Packages
                stmt.execute("INSERT IGNORE INTO packages (package_id, operator_id, destination_id, title, slug, description, duration_days, duration_nights, base_price_per_person, max_travellers, included_services, excluded_services, accommodation_details, transportation_details, image_url, rating, total_bookings, is_active) VALUES "
                        + "(1, 2, 1, 'Vizag Coastal Splendour & Heritage Tour', 'vizag-coastal-splendour', 'Experience the best of the City of Destiny: beaches, submarine museum, and Kailasagiri views.', 3, 2, 8500.00, 20, 'Hotel stay, Breakfast, AC Cab, Sightseeing tickets', 'Flight/Train, Lunch/Dinner', '3-Star Beach Resort', 'Private AC Sedan', 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=800', 4.85, 24, TRUE), "
                        + "(2, 2, 2, 'Araku Valley Coffee Trail & Caves Explorer', 'araku-coffee-trail', 'Delightful hill escape through organic coffee plantations, Borra caves, and tribal arts.', 2, 1, 6200.00, 16, 'Eco-resort stay, Coffee tasting, Guided Cave tour', 'Personal shopping, Extra meals', 'Eco Nature Resort Araku', 'AC Tempo Traveler', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800', 4.78, 18, TRUE);");

                // Seed Departures
                stmt.execute("INSERT IGNORE INTO package_departures (departure_id, package_id, start_date, end_date, total_slots, available_slots, status) VALUES "
                        + "(1, 1, '2026-11-20', '2026-11-22', 20, 18, 'OPEN'), "
                        + "(2, 1, '2026-12-05', '2026-12-07', 20, 20, 'OPEN'), "
                        + "(3, 2, '2026-11-25', '2026-11-26', 16, 12, 'OPEN');");
            }

            System.out.println("[DB-AUTO-INIT] Database schema initialized and verified successfully!");
        } catch (SQLException e) {
            System.err.println("[DB-AUTO-INIT] Error during auto-initialization: " + e.getMessage());
        }
    }
}
