-- Insert sample users
INSERT INTO users (id, username, email, password, full_name, phone_number, role, enabled, account_non_expired, account_non_locked, credentials_non_expired, created_at, updated_at) VALUES
(1, 'admin', 'admin@parkandride.com', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kqjAqYWYGu5h9oWXhFf0Pw8nMce', 'System Administrator', '+91-9876543210', 'ADMIN', true, true, true, true, NOW(), NOW()),
(2, 'john_doe', 'john@example.com', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kqjAqYWYGu5h9oWXhFf0Pw8nMce', 'John Doe', '+91-9876543211', 'USER', true, true, true, true, NOW(), NOW()),
(3, 'jane_smith', 'jane@example.com', '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kqjAqYWYGu5h9oWXhFf0Pw8nMce', 'Jane Smith', '+91-9876543212', 'USER', true, true, true, true, NOW(), NOW());

-- Insert sample parking lots
INSERT INTO parking_lots (id, name, address, latitude, longitude, total_spots, available_spots, base_hourly_rate, metro_station_name, distance_from_metro, status, facilities, created_at, updated_at) VALUES
(1, 'Central Metro Parking', '123 Main Street, Connaught Place', 28.6328, 77.2195, 100, 85, 50.00, 'Rajiv Chowk', 200.0, 'ACTIVE', '{"cctv": true, "security": true, "covered": true}', NOW(), NOW()),
(2, 'Green Park Plaza', '456 Ring Road, Green Park', 28.5599, 77.2066, 150, 120, 45.00, 'Green Park', 150.0, 'ACTIVE', '{"cctv": true, "security": true, "electric_charging": true}', NOW(), NOW()),
(3, 'Kashmere Gate Complex', '789 GT Road, Kashmere Gate', 28.6677, 77.2274, 80, 65, 40.00, 'Kashmere Gate', 100.0, 'ACTIVE', '{"cctv": true, "covered": false}', NOW(), NOW()),
(4, 'Dwarka Sector 21', 'Plot 123, Dwarka Sector 21', 28.5521, 77.0591, 200, 180, 35.00, 'Dwarka Sector 21', 250.0, 'ACTIVE', '{"cctv": true, "security": true, "covered": true, "electric_charging": true}', NOW(), NOW());

-- Insert sample parking spots
INSERT INTO parking_spots (id, spot_number, parking_lot_id, spot_type, status, floor, section, created_at, updated_at) VALUES
(1, 'A001', 1, 'REGULAR', 'AVAILABLE', 'Ground', 'A', NOW(), NOW()),
(2, 'A002', 1, 'REGULAR', 'AVAILABLE', 'Ground', 'A', NOW(), NOW()),
(3, 'A003', 1, 'COMPACT', 'AVAILABLE', 'Ground', 'A', NOW(), NOW()),
(4, 'B001', 1, 'DISABLED', 'AVAILABLE', 'Ground', 'B', NOW(), NOW()),
(5, 'E001', 1, 'ELECTRIC', 'AVAILABLE', 'Ground', 'E', NOW(), NOW()),
(6, 'A001', 2, 'REGULAR', 'AVAILABLE', 'Ground', 'A', NOW(), NOW()),
(7, 'A002', 2, 'REGULAR', 'AVAILABLE', 'Ground', 'A', NOW(), NOW()),
(8, 'E001', 2, 'ELECTRIC', 'AVAILABLE', 'Ground', 'E', NOW(), NOW()),
(9, 'A001', 3, 'REGULAR', 'AVAILABLE', 'Ground', 'A', NOW(), NOW()),
(10, 'A002', 3, 'COMPACT', 'AVAILABLE', 'Ground', 'A', NOW(), NOW());

-- Insert sample parking bookings
INSERT INTO parking_bookings (id, user_id, parking_lot_id, parking_spot_id, start_time, end_time, total_amount, status, booking_type, vehicle_number, access_pin, created_at, updated_at) VALUES
(1, 2, 1, 1, '2025-01-20 09:00:00', '2025-01-20 18:00:00', 450.00, 'CONFIRMED', 'DAILY', 'DL01AB1234', '1234', NOW(), NOW()),
(2, 3, 2, 6, '2025-01-20 10:00:00', '2025-01-20 14:00:00', 180.00, 'CONFIRMED', 'HOURLY', 'DL02CD5678', '5678', NOW(), NOW());

-- Insert sample ride bookings
INSERT INTO ride_bookings (id, user_id, parking_booking_id, pickup_location, dropoff_location, pickup_latitude, pickup_longitude, dropoff_latitude, dropoff_longitude, requested_time, ride_type, status, estimated_fare, driver_name, driver_phone, vehicle_number, vehicle_model, max_passengers, is_shared, created_at, updated_at) VALUES
(1, 2, 1, 'Central Metro Parking', 'Gurgaon Cyber City', 28.6328, 77.2195, 28.4731, 77.0924, '2025-01-20 18:30:00', 'CAB', 'CONFIRMED', 350.00, 'Raj Kumar', '+91-9876543220', 'DL05MN9876', 'Maruti Swift', 4, false, NOW(), NOW()),
(2, 3, 2, 'Green Park Plaza', 'Noida Sector 62', 28.5599, 77.2066, 28.6271, 77.3717, '2025-01-20 14:15:00', 'SHUTTLE', 'CONFIRMED', 120.00, 'Amit Singh', '+91-9876543221', 'UP16PQ3456', 'Tata Winger', 12, true, NOW(), NOW());