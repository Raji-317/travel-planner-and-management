USE travel_planner_db;

UPDATE users 
SET role = 'ADMIN', 
    password_hash = 'a7c8b209d29ef1154562fa5342ec9a562ef0a28f7d98342111cbb9472e1ab5a69080512f45811c7908b98150f8c857d42cf38ec673efb4923f6630f9a2e6f42a', 
    salt = 'd9e8f7a6b5c4d3e2' 
WHERE email = 'admin@edu.com';

INSERT IGNORE INTO users (user_id, email, password_hash, salt, full_name, role, status, avatar_url)
VALUES 
(10, 'admin@travelplanner.com', 'a7c8b209d29ef1154562fa5342ec9a562ef0a28f7d98342111cbb9472e1ab5a69080512f45811c7908b98150f8c857d42cf38ec673efb4923f6630f9a2e6f42a', 'd9e8f7a6b5c4d3e2', 'System Administrator', 'ADMIN', 'ACTIVE', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'),
(11, 'operator@travelplanner.com', 'a7c8b209d29ef1154562fa5342ec9a562ef0a28f7d98342111cbb9472e1ab5a69080512f45811c7908b98150f8c857d42cf38ec673efb4923f6630f9a2e6f42a', 'd9e8f7a6b5c4d3e2', 'Alex Morgan', 'OPERATOR', 'ACTIVE', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100');

INSERT IGNORE INTO operator_profiles (operator_id, company_name, license_number, office_address, support_phone, support_email, is_verified)
VALUES (11, 'Incredible India Journeys', 'LIC-IND-2024-9988', 'Beach Road, Visakhapatnam', '+91 891 255 4321', 'support@incredibleindia.com', TRUE);
