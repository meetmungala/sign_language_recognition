-- Sign Language Recognition Platform Database Schema
-- MySQL Database Schema

-- Create database
CREATE DATABASE IF NOT EXISTS sign_language_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sign_language_db;

-- Users table for authentication and profiles
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(80) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(128) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    is_disabled BOOLEAN DEFAULT FALSE,
    preferred_language VARCHAR(10) DEFAULT 'ASL',
    avatar_url VARCHAR(255),
    date_of_birth DATE,
    phone VARCHAR(20),
    address TEXT,
    emergency_contact VARCHAR(100),
    emergency_phone VARCHAR(20),
    accessibility_needs TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP NULL,
    
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_preferred_language (preferred_language),
    INDEX idx_created_at (created_at)
);

-- User progress tracking
CREATE TABLE user_progress (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    sign_language VARCHAR(10) NOT NULL,
    sign_learned VARCHAR(50) NOT NULL,
    accuracy DECIMAL(5,2) NOT NULL,
    attempts INT DEFAULT 1,
    mastered BOOLEAN DEFAULT FALSE,
    time_spent INT DEFAULT 0, -- in seconds
    difficulty_level INT DEFAULT 1,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_sign_language (sign_language),
    INDEX idx_mastered (mastered),
    INDEX idx_created_at (created_at)
);

-- Translation history
CREATE TABLE translation_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    input_text TEXT NOT NULL,
    output_signs TEXT NOT NULL,
    translation_type ENUM('text_to_sign', 'sign_to_text', 'speech_to_sign') NOT NULL,
    confidence DECIMAL(3,2) NOT NULL,
    input_language VARCHAR(10) DEFAULT 'ASL',
    output_language VARCHAR(10) DEFAULT 'ASL',
    processing_time INT, -- in milliseconds
    device_info JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_translation_type (translation_type),
    INDEX idx_created_at (created_at)
);

-- Sign language vocabulary database
CREATE TABLE sign_vocabulary (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sign_text VARCHAR(100) NOT NULL,
    sign_language VARCHAR(10) NOT NULL,
    description TEXT,
    difficulty_level INT DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
    category VARCHAR(50),
    subcategory VARCHAR(50),
    hand_shape VARCHAR(50),
    movement VARCHAR(100),
    location VARCHAR(50),
    orientation VARCHAR(50),
    facial_expression VARCHAR(100),
    video_url VARCHAR(255),
    image_url VARCHAR(255),
    audio_url VARCHAR(255),
    usage_frequency INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_sign_language (sign_language),
    INDEX idx_difficulty_level (difficulty_level),
    INDEX idx_category (category),
    INDEX idx_sign_text (sign_text),
    INDEX idx_is_active (is_active)
);

-- Learning modules
CREATE TABLE learning_modules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    sign_language VARCHAR(10) NOT NULL,
    difficulty_level INT DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
    category VARCHAR(50),
    estimated_duration INT, -- in minutes
    prerequisites JSON,
    learning_objectives JSON,
    content JSON, -- structured content data
    resources JSON, -- videos, images, audio files
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_sign_language (sign_language),
    INDEX idx_difficulty_level (difficulty_level),
    INDEX idx_category (category),
    INDEX idx_is_active (is_active)
);

-- Practice tests
CREATE TABLE practice_tests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    module_id INT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    test_type ENUM('multiple_choice', 'sign_recognition', 'text_to_sign', 'mixed') NOT NULL,
    difficulty_level INT DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
    time_limit INT, -- in seconds
    passing_score DECIMAL(5,2) DEFAULT 70.00,
    questions JSON NOT NULL, -- structured questions data
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (module_id) REFERENCES learning_modules(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_module_id (module_id),
    INDEX idx_test_type (test_type),
    INDEX idx_difficulty_level (difficulty_level),
    INDEX idx_is_active (is_active)
);

-- Practice test results
CREATE TABLE practice_test_results (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    test_id INT NOT NULL,
    score DECIMAL(5,2) NOT NULL,
    total_questions INT NOT NULL,
    correct_answers INT NOT NULL,
    time_taken INT NOT NULL, -- in seconds
    answers JSON, -- user's answers
    feedback TEXT,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (test_id) REFERENCES practice_tests(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_test_id (test_id),
    INDEX idx_score (score),
    INDEX idx_completed_at (completed_at)
);

-- User learning sessions
CREATE TABLE learning_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    module_id INT,
    session_type ENUM('practice', 'learning', 'assessment') NOT NULL,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP NULL,
    duration INT, -- in seconds
    progress_data JSON,
    achievements JSON,
    notes TEXT,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES learning_modules(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_module_id (module_id),
    INDEX idx_session_type (session_type),
    INDEX idx_start_time (start_time)
);

-- User achievements and badges
CREATE TABLE user_achievements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    achievement_type VARCHAR(50) NOT NULL,
    achievement_name VARCHAR(100) NOT NULL,
    description TEXT,
    badge_url VARCHAR(255),
    points INT DEFAULT 0,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_achievement_type (achievement_type),
    INDEX idx_unlocked_at (unlocked_at)
);

-- System settings and configuration
CREATE TABLE system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_setting_key (setting_key),
    INDEX idx_is_public (is_public)
);

-- API usage tracking
CREATE TABLE api_usage (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    endpoint VARCHAR(100) NOT NULL,
    method VARCHAR(10) NOT NULL,
    request_data JSON,
    response_data JSON,
    response_time INT, -- in milliseconds
    status_code INT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_endpoint (endpoint),
    INDEX idx_created_at (created_at),
    INDEX idx_status_code (status_code)
);

-- Create views for common queries

-- User progress summary view
CREATE VIEW user_progress_summary AS
SELECT 
    u.id as user_id,
    u.username,
    u.preferred_language,
    COUNT(up.id) as total_signs_learned,
    COUNT(CASE WHEN up.mastered = TRUE THEN 1 END) as mastered_signs,
    AVG(up.accuracy) as average_accuracy,
    SUM(up.time_spent) as total_time_spent,
    MAX(up.updated_at) as last_activity
FROM users u
LEFT JOIN user_progress up ON u.id = up.user_id
GROUP BY u.id, u.username, u.preferred_language;

-- Translation statistics view
CREATE VIEW translation_stats AS
SELECT 
    DATE(created_at) as date,
    translation_type,
    COUNT(*) as total_translations,
    AVG(confidence) as average_confidence,
    AVG(processing_time) as average_processing_time
FROM translation_history
GROUP BY DATE(created_at), translation_type;

-- Insert initial data

-- Insert basic sign vocabulary
INSERT INTO sign_vocabulary (sign_text, sign_language, description, difficulty_level, category) VALUES
('A', 'ASL', 'Letter A in American Sign Language', 1, 'alphabet'),
('B', 'ASL', 'Letter B in American Sign Language', 1, 'alphabet'),
('C', 'ASL', 'Letter C in American Sign Language', 1, 'alphabet'),
('D', 'ASL', 'Letter D in American Sign Language', 1, 'alphabet'),
('E', 'ASL', 'Letter E in American Sign Language', 1, 'alphabet'),
('F', 'ASL', 'Letter F in American Sign Language', 1, 'alphabet'),
('G', 'ASL', 'Letter G in American Sign Language', 1, 'alphabet'),
('H', 'ASL', 'Letter H in American Sign Language', 1, 'alphabet'),
('I', 'ASL', 'Letter I in American Sign Language', 1, 'alphabet'),
('J', 'ASL', 'Letter J in American Sign Language', 1, 'alphabet'),
('K', 'ASL', 'Letter K in American Sign Language', 1, 'alphabet'),
('L', 'ASL', 'Letter L in American Sign Language', 1, 'alphabet'),
('M', 'ASL', 'Letter M in American Sign Language', 1, 'alphabet'),
('N', 'ASL', 'Letter N in American Sign Language', 1, 'alphabet'),
('O', 'ASL', 'Letter O in American Sign Language', 1, 'alphabet'),
('P', 'ASL', 'Letter P in American Sign Language', 1, 'alphabet'),
('Q', 'ASL', 'Letter Q in American Sign Language', 1, 'alphabet'),
('R', 'ASL', 'Letter R in American Sign Language', 1, 'alphabet'),
('S', 'ASL', 'Letter S in American Sign Language', 1, 'alphabet'),
('T', 'ASL', 'Letter T in American Sign Language', 1, 'alphabet'),
('U', 'ASL', 'Letter U in American Sign Language', 1, 'alphabet'),
('V', 'ASL', 'Letter V in American Sign Language', 1, 'alphabet'),
('W', 'ASL', 'Letter W in American Sign Language', 1, 'alphabet'),
('X', 'ASL', 'Letter X in American Sign Language', 1, 'alphabet'),
('Y', 'ASL', 'Letter Y in American Sign Language', 1, 'alphabet'),
('Z', 'ASL', 'Letter Z in American Sign Language', 1, 'alphabet'),
('HELLO', 'ASL', 'Greeting - Hello', 1, 'greetings'),
('THANK YOU', 'ASL', 'Expression of gratitude', 1, 'greetings'),
('YES', 'ASL', 'Affirmative response', 1, 'responses'),
('NO', 'ASL', 'Negative response', 1, 'responses'),
('PLEASE', 'ASL', 'Polite request', 1, 'greetings'),
('SORRY', 'ASL', 'Apology', 1, 'greetings'),
('GOOD', 'ASL', 'Positive quality', 2, 'descriptions'),
('BAD', 'ASL', 'Negative quality', 2, 'descriptions'),
('LOVE', 'ASL', 'Expression of love', 2, 'emotions'),
('FAMILY', 'ASL', 'Family members', 2, 'family'),
('MOTHER', 'ASL', 'Mother', 2, 'family'),
('FATHER', 'ASL', 'Father', 2, 'family'),
('BROTHER', 'ASL', 'Brother', 2, 'family'),
('SISTER', 'ASL', 'Sister', 2, 'family'),
('FRIEND', 'ASL', 'Friend', 2, 'relationships'),
('TEACHER', 'ASL', 'Teacher', 2, 'professions'),
('STUDENT', 'ASL', 'Student', 2, 'professions'),
('DOCTOR', 'ASL', 'Doctor', 2, 'professions'),
('NURSE', 'ASL', 'Nurse', 2, 'professions');

-- Insert system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('app_name', 'Sign Language Recognition Platform', 'string', 'Application name', TRUE),
('app_version', '1.0.0', 'string', 'Application version', TRUE),
('max_file_size', '10485760', 'number', 'Maximum file upload size in bytes', FALSE),
('supported_languages', '["ASL", "ISL", "CSL", "WLASL"]', 'json', 'Supported sign languages', TRUE),
('recognition_confidence_threshold', '0.7', 'number', 'Minimum confidence for sign recognition', FALSE),
('session_timeout', '3600', 'number', 'Session timeout in seconds', FALSE),
('enable_offline_mode', 'true', 'boolean', 'Enable offline mode', TRUE),
('max_translation_history', '1000', 'number', 'Maximum translation history per user', FALSE);

-- Create indexes for better performance
CREATE INDEX idx_user_progress_user_sign ON user_progress(user_id, sign_learned);
CREATE INDEX idx_translation_history_user_type ON translation_history(user_id, translation_type);
CREATE INDEX idx_sign_vocabulary_lang_cat ON sign_vocabulary(sign_language, category);
CREATE INDEX idx_practice_test_results_user_score ON practice_test_results(user_id, score);
CREATE INDEX idx_learning_sessions_user_module ON learning_sessions(user_id, module_id);

-- Create stored procedures for common operations

DELIMITER //

-- Procedure to update user progress
CREATE PROCEDURE UpdateUserProgress(
    IN p_user_id INT,
    IN p_sign_language VARCHAR(10),
    IN p_sign_learned VARCHAR(50),
    IN p_accuracy DECIMAL(5,2),
    IN p_time_spent INT
)
BEGIN
    DECLARE existing_record INT DEFAULT 0;
    DECLARE current_attempts INT DEFAULT 1;
    DECLARE current_accuracy DECIMAL(5,2) DEFAULT 0;
    
    -- Check if record exists
    SELECT COUNT(*), COALESCE(MAX(attempts), 0), COALESCE(AVG(accuracy), 0)
    INTO existing_record, current_attempts, current_accuracy
    FROM user_progress 
    WHERE user_id = p_user_id AND sign_learned = p_sign_learned;
    
    IF existing_record > 0 THEN
        -- Update existing record
        UPDATE user_progress 
        SET 
            accuracy = (accuracy * attempts + p_accuracy) / (attempts + 1),
            attempts = attempts + 1,
            time_spent = time_spent + p_time_spent,
            mastered = CASE WHEN (accuracy * attempts + p_accuracy) / (attempts + 1) >= 80 THEN TRUE ELSE mastered END,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = p_user_id AND sign_learned = p_sign_learned;
    ELSE
        -- Insert new record
        INSERT INTO user_progress (user_id, sign_language, sign_learned, accuracy, attempts, time_spent, mastered)
        VALUES (p_user_id, p_sign_language, p_sign_learned, p_accuracy, 1, p_time_spent, p_accuracy >= 80);
    END IF;
END //

-- Procedure to get user statistics
CREATE PROCEDURE GetUserStatistics(IN p_user_id INT)
BEGIN
    SELECT 
        u.username,
        u.preferred_language,
        COUNT(DISTINCT up.sign_learned) as total_signs,
        COUNT(CASE WHEN up.mastered = TRUE THEN 1 END) as mastered_signs,
        AVG(up.accuracy) as average_accuracy,
        SUM(up.time_spent) as total_time_spent,
        COUNT(th.id) as total_translations,
        COUNT(ptr.id) as total_tests_taken,
        AVG(ptr.score) as average_test_score
    FROM users u
    LEFT JOIN user_progress up ON u.id = up.user_id
    LEFT JOIN translation_history th ON u.id = th.user_id
    LEFT JOIN practice_test_results ptr ON u.id = ptr.user_id
    WHERE u.id = p_user_id
    GROUP BY u.id, u.username, u.preferred_language;
END //

DELIMITER ;

-- Grant permissions (adjust as needed for your environment)
-- GRANT ALL PRIVILEGES ON sign_language_db.* TO 'sign_lang_user'@'localhost' IDENTIFIED BY 'secure_password';
-- FLUSH PRIVILEGES;
