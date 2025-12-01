CREATE DATABASE IF NOT EXISTS my_food_site;
USE my_food_site;

-- Admins table (ایڈمن یوزر)
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- Default admin user: username = admin, password = admin123
INSERT INTO admins (username, password) VALUES ('admin', 'admin123');

-- Products table (Menu items)
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Settings table (ویب سائٹ کی basic info)
CREATE TABLE settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    site_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    address VARCHAR(255)
);

INSERT INTO settings (site_name, phone, address)
VALUES ('My Fast Food', '0300-0000000', 'آپ کا ایڈریس یہاں لکھیں');
