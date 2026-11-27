-- ============================================================
-- BankEase – Mini Net Banking Application
-- Database Initialization Script
-- ============================================================

CREATE DATABASE IF NOT EXISTS bankease_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bankease_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone_number VARCHAR(15) UNIQUE,
    address VARCHAR(255),
    role ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active TINYINT(1) NOT NULL DEFAULT 1
);

-- Bank Accounts Table
CREATE TABLE IF NOT EXISTS bank_accounts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    account_number VARCHAR(16) NOT NULL UNIQUE,
    ifsc_code VARCHAR(20) NOT NULL,
    account_type ENUM('SAVINGS', 'CURRENT', 'FIXED_DEPOSIT') NOT NULL DEFAULT 'SAVINGS',
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    user_id BIGINT NOT NULL UNIQUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    transaction_ref VARCHAR(50) NOT NULL UNIQUE,
    amount DECIMAL(15, 2) NOT NULL,
    description VARCHAR(255),
    transaction_type ENUM('CREDIT', 'DEBIT', 'TRANSFER') NOT NULL,
    status ENUM('SUCCESS', 'FAILED', 'PENDING') NOT NULL DEFAULT 'SUCCESS',
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    balance_after_transaction DECIMAL(15, 2),
    sender_account_id BIGINT,
    receiver_account_id BIGINT,
    FOREIGN KEY (sender_account_id) REFERENCES bank_accounts(id),
    FOREIGN KEY (receiver_account_id) REFERENCES bank_accounts(id)
);

-- ============================================================
-- Demo Data (Optional - for testing)
-- ============================================================
-- Password: "password123" (BCrypt encoded)
INSERT IGNORE INTO users (full_name, email, password, phone_number, address, role) VALUES
('Ravi Kumar',    'ravi@example.com',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh8y', '9876543210', 'MG Road, Bangalore', 'USER'),
('Priya Sharma',  'priya@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh8y', '9876543211', 'Anna Nagar, Chennai', 'USER'),
('Admin User',    'admin@bankease.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh8y', '9000000000', 'Head Office, Mumbai', 'ADMIN');

INSERT IGNORE INTO bank_accounts (account_number, ifsc_code, account_type, balance, user_id) VALUES
('123400000001', 'BKEZ0001234', 'SAVINGS', 25000.00, (SELECT id FROM users WHERE email = 'ravi@example.com')),
('123400000002', 'BKEZ0001234', 'SAVINGS', 15000.00, (SELECT id FROM users WHERE email = 'priya@example.com')),
('123400000003', 'BKEZ0001234', 'SAVINGS', 50000.00, (SELECT id FROM users WHERE email = 'admin@bankease.com'));

