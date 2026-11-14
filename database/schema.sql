-- =====================================================================
-- Travel & Tourism Management System with Smart Travel Planner
-- Database Schema Definition (MySQL 8.0+)
-- =====================================================================

DROP DATABASE IF EXISTS travel_planner_db;
CREATE DATABASE travel_planner_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE travel_planner_db;

-- 1. USERS TABLE
-- Supports Tourist, Operator, and Admin roles with secure password hashing (PBKDF2)
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(256) NOT NULL,
    salt VARCHAR(64) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role ENUM('TOURIST', 'OPERATOR', 'ADMIN') NOT NULL DEFAULT 'TOURIST',
    status ENUM('ACTIVE', 'PENDING_APPROVAL', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role),
    INDEX idx_user_status (status)
) ENGINE=InnoDB;

-- 2. OPERATOR PROFILES TABLE
-- Travel operators submit verification details for admin approval
CREATE TABLE operator_profiles (
    operator_id INT PRIMARY KEY,
    company_name VARCHAR(150) NOT NULL,
    license_number VARCHAR(100) NOT NULL UNIQUE,
    years_in_business INT DEFAULT 1,
    office_address TEXT,
    support_phone VARCHAR(20),
    support_email VARCHAR(120),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    admin_notes TEXT,
    verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (operator_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. DESTINATIONS TABLE
-- Destinations displayed in the Travivu exploration portal
CREATE TABLE destinations (
    destination_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    best_season VARCHAR(100),
    daily_budget_estimated DECIMAL(10, 2) NOT NULL DEFAULT 2500.00,
    currency VARCHAR(10) DEFAULT 'INR',
    image_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    popularity_score DECIMAL(3, 2) DEFAULT 4.50,
    total_reviews INT DEFAULT 0,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_dest_name (name),
    INDEX idx_dest_country_state (country, state),
    INDEX idx_dest_popularity (popularity_score)
) ENGINE=InnoDB;

-- 4. ATTRACTION CATEGORIES TABLE
CREATE TABLE attraction_categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(60) NOT NULL UNIQUE,
    icon_name VARCHAR(50),
    description VARCHAR(255)
) ENGINE=InnoDB;

-- 5. ATTRACTIONS TABLE
-- Attractions in each destination with operating hours and pricing for the Smart Planner
CREATE TABLE attractions (
    attraction_id INT AUTO_INCREMENT PRIMARY KEY,
    destination_id INT NOT NULL,
    category_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    estimated_duration_min INT NOT NULL DEFAULT 120,
    ticket_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    opening_time TIME DEFAULT '09:00:00',
    closing_time TIME DEFAULT '18:00:00',
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    image_url VARCHAR(500),
    popularity_rating DECIMAL(3, 2) DEFAULT 4.5,
    is_wheelchair_accessible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (destination_id) REFERENCES destinations(destination_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES attraction_categories(category_id) ON DELETE RESTRICT,
    INDEX idx_attraction_dest (destination_id),
    INDEX idx_attraction_cat (category_id)
) ENGINE=InnoDB;

-- 6. ATTRACTION DISTANCES / GRAPH EDGES TABLE
-- Stores distance and estimated travel times between attractions for Dijkstra's optimization
CREATE TABLE attraction_distances (
    distance_id INT AUTO_INCREMENT PRIMARY KEY,
    origin_attraction_id INT NOT NULL,
    dest_attraction_id INT NOT NULL,
    distance_km DECIMAL(6, 2) NOT NULL,
    travel_time_min INT NOT NULL,
    transport_mode ENUM('CAR', 'BIKE', 'PUBLIC_TRANSPORT', 'WALKING') DEFAULT 'CAR',
    estimated_fare DECIMAL(8, 2) DEFAULT 0.00,
    FOREIGN KEY (origin_attraction_id) REFERENCES attractions(attraction_id) ON DELETE CASCADE,
    FOREIGN KEY (dest_attraction_id) REFERENCES attractions(attraction_id) ON DELETE CASCADE,
    UNIQUE KEY uq_origin_dest_mode (origin_attraction_id, dest_attraction_id, transport_mode)
) ENGINE=InnoDB;

-- 7. TRAVEL PACKAGES TABLE
-- Packages created by Travel Operators in the Gotrips portal style
CREATE TABLE packages (
    package_id INT AUTO_INCREMENT PRIMARY KEY,
    operator_id INT NOT NULL,
    destination_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(220) UNIQUE,
    description TEXT NOT NULL,
    duration_days INT NOT NULL,
    duration_nights INT NOT NULL,
    base_price_per_person DECIMAL(10, 2) NOT NULL,
    max_travellers INT NOT NULL DEFAULT 30,
    included_services TEXT,
    excluded_services TEXT,
    accommodation_details VARCHAR(255),
    transportation_details VARCHAR(255),
    image_url VARCHAR(500) NOT NULL,
    rating DECIMAL(3, 2) DEFAULT 4.80,
    total_bookings INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (operator_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    FOREIGN KEY (destination_id) REFERENCES destinations(destination_id) ON DELETE RESTRICT,
    INDEX idx_pkg_operator (operator_id),
    INDEX idx_pkg_destination (destination_id),
    INDEX idx_pkg_price (base_price_per_person)
) ENGINE=InnoDB;

-- 8. PACKAGE ITINERARY DAYS TABLE
CREATE TABLE package_itinerary_days (
    itinerary_day_id INT AUTO_INCREMENT PRIMARY KEY,
    package_id INT NOT NULL,
    day_number INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    morning_activity VARCHAR(255),
    afternoon_activity VARCHAR(255),
    evening_activity VARCHAR(255),
    meals_included VARCHAR(100),
    FOREIGN KEY (package_id) REFERENCES packages(package_id) ON DELETE CASCADE,
    UNIQUE KEY uq_pkg_day (package_id, day_number)
) ENGINE=InnoDB;

-- 9. PACKAGE DEPARTURES TABLE
-- Manages slot availability and inventory for concurrent booking safety
CREATE TABLE package_departures (
    departure_id INT AUTO_INCREMENT PRIMARY KEY,
    package_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_slots INT NOT NULL,
    available_slots INT NOT NULL,
    status ENUM('OPEN', 'FULL', 'CANCELLED', 'COMPLETED') DEFAULT 'OPEN',
    FOREIGN KEY (package_id) REFERENCES packages(package_id) ON DELETE CASCADE,
    INDEX idx_dep_dates (start_date, end_date),
    INDEX idx_dep_slots (available_slots),
    CHECK (available_slots >= 0)
) ENGINE=InnoDB;

-- 10. BOOKINGS TABLE
-- Supports atomic reservations and prevents overbooking
CREATE TABLE bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_ref VARCHAR(36) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    departure_id INT NOT NULL,
    num_travelers INT NOT NULL,
    price_per_person DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    booking_status ENUM('CONFIRMED', 'PENDING', 'CANCELLED') DEFAULT 'PENDING',
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    FOREIGN KEY (departure_id) REFERENCES package_departures(departure_id) ON DELETE RESTRICT,
    INDEX idx_booking_user (user_id),
    INDEX idx_booking_ref (booking_ref)
) ENGINE=InnoDB;

-- 11. BOOKING TRAVELERS TABLE
CREATE TABLE booking_travelers (
    traveler_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    gender ENUM('MALE', 'FEMALE', 'OTHER') NOT NULL,
    id_proof_type VARCHAR(50),
    id_proof_number VARCHAR(100),
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 12. PAYMENTS TABLE (Simulated Payment System)
CREATE TABLE payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    transaction_ref VARCHAR(64) NOT NULL UNIQUE,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('CARD_SIMULATED', 'UPI_SIMULATED', 'NETBANKING_SIMULATED') NOT NULL,
    payment_status ENUM('SUCCESS', 'PENDING', 'FAILED', 'REFUNDED') DEFAULT 'PENDING',
    paid_at TIMESTAMP NULL,
    failure_reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 13. CANCELLATIONS TABLE
CREATE TABLE cancellations (
    cancellation_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL UNIQUE,
    reason TEXT NOT NULL,
    refund_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    refund_status ENUM('PROCESSED', 'PENDING', 'REJECTED') DEFAULT 'PENDING',
    cancelled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 14. REVIEWS AND RATINGS TABLE
CREATE TABLE reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    package_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_title VARCHAR(150),
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (package_id) REFERENCES packages(package_id) ON DELETE CASCADE,
    UNIQUE KEY uq_user_package_review (user_id, package_id)
) ENGINE=InnoDB;

-- 15. SAVED ITINERARIES (SMART TRAVEL PLANNER GENERATION)
CREATE TABLE saved_itineraries (
    itinerary_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    share_token VARCHAR(40) UNIQUE,
    title VARCHAR(150) NOT NULL,
    starting_location VARCHAR(100) NOT NULL,
    destination_id INT NOT NULL,
    travel_days INT NOT NULL,
    num_travelers INT NOT NULL DEFAULT 1,
    total_budget DECIMAL(10, 2) NOT NULL,
    estimated_cost DECIMAL(10, 2) NOT NULL,
    travel_pace ENUM('RELAXED', 'BALANCED', 'PACKED') DEFAULT 'BALANCED',
    preferred_transport ENUM('CAR', 'BIKE', 'PUBLIC_TRANSPORT', 'WALKING') DEFAULT 'CAR',
    interests_csv VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (destination_id) REFERENCES destinations(destination_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 16. ITINERARY DAYS TABLE
CREATE TABLE itinerary_days (
    itinerary_day_id INT AUTO_INCREMENT PRIMARY KEY,
    itinerary_id INT NOT NULL,
    day_number INT NOT NULL,
    day_date DATE NULL,
    estimated_day_cost DECIMAL(10, 2) DEFAULT 0.00,
    estimated_travel_time_min INT DEFAULT 0,
    FOREIGN KEY (itinerary_id) REFERENCES saved_itineraries(itinerary_id) ON DELETE CASCADE,
    UNIQUE KEY uq_itin_day (itinerary_id, day_number)
) ENGINE=InnoDB;

-- 17. ITINERARY PLACES TABLE
CREATE TABLE itinerary_places (
    itinerary_place_id INT AUTO_INCREMENT PRIMARY KEY,
    itinerary_day_id INT NOT NULL,
    attraction_id INT NOT NULL,
    visit_order INT NOT NULL,
    time_slot ENUM('MORNING', 'AFTERNOON', 'EVENING') NOT NULL,
    allocated_duration_min INT NOT NULL,
    travel_time_to_next_min INT DEFAULT 0,
    estimated_cost DECIMAL(10, 2) DEFAULT 0.00,
    notes VARCHAR(255),
    FOREIGN KEY (itinerary_day_id) REFERENCES itinerary_days(itinerary_day_id) ON DELETE CASCADE,
    FOREIGN KEY (attraction_id) REFERENCES attractions(attraction_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 18. WISHLIST TABLE
CREATE TABLE wishlist (
    wishlist_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    package_id INT NULL,
    destination_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (package_id) REFERENCES packages(package_id) ON DELETE CASCADE,
    FOREIGN KEY (destination_id) REFERENCES destinations(destination_id) ON DELETE CASCADE,
    UNIQUE KEY uq_user_wishlist_pkg (user_id, package_id),
    UNIQUE KEY uq_user_wishlist_dest (user_id, destination_id)
) ENGINE=InnoDB;

