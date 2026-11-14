USE travel_planner_db;

CREATE TABLE IF NOT EXISTS tour_logged_expenses (
    expense_id INT AUTO_INCREMENT PRIMARY KEY,
    itinerary_id INT NULL,
    booking_id INT NULL,
    user_id INT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'OTHER',
    title VARCHAR(150) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    expense_date VARCHAR(50) NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_expense_itin (itinerary_id),
    INDEX idx_expense_user (user_id)
) ENGINE=InnoDB;

ALTER TABLE packages ADD COLUMN rejection_notes TEXT NULL;
