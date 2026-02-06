-- IJITEST Database Update Script
-- This script adds tables for advanced journal management.

-- 1. Volumes and Issues Tracking
CREATE TABLE IF NOT EXISTS volumes_issues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    volume_number INT NOT NULL,
    issue_number INT NOT NULL,
    year INT NOT NULL,
    month_range VARCHAR(100), -- e.g., 'Jan - Mar'
    status ENUM('open', 'published') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Link Submissions to Issues
ALTER TABLE submissions ADD COLUMN issue_id INT NULL;
ALTER TABLE submissions ADD FOREIGN KEY (issue_id) REFERENCES volumes_issues(id);

-- 3. Peer Review Tracking
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    submission_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
    deadline DATE,
    feedback TEXT,
    feedback_file_path VARCHAR(500),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES submissions(id),
    FOREIGN KEY (reviewer_id) REFERENCES users(id)
);

-- 4. Payment Tracking
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    submission_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    status ENUM('unpaid', 'paid', 'verified') DEFAULT 'unpaid',
    transaction_id VARCHAR(255),
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES submissions(id)
);

-- 5. Contact Messages (Inbox)
CREATE TABLE IF NOT EXISTS contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status ENUM('unread', 'read', 'archived') DEFAULT 'unread',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. System Settings
CREATE TABLE IF NOT EXISTS settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Initial Settings
INSERT INTO settings (setting_key, setting_value) VALUES 
('journal_name', 'International Journal of Innovative Trends in Engineering Science and Technology'),
('journal_short_name', 'IJITEST'),
('issn_number', 'XXXX-XXXX'),
('apc_inr', '2500'),
('apc_usd', '50')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);
