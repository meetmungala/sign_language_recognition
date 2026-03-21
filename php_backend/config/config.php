<?php
/**
 * Configuration file for PHP Backend
 */

// Load environment variables
if (file_exists(__DIR__ . '/../.env')) {
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
    $dotenv->load();
}

return [
    'database' => [
        'host' => $_ENV['DB_HOST'] ?? 'localhost',
        'port' => $_ENV['DB_PORT'] ?? 3306,
        'name' => $_ENV['DB_NAME'] ?? 'sign_language_db',
        'user' => $_ENV['DB_USER'] ?? 'root',
        'password' => $_ENV['DB_PASSWORD'] ?? '',
        'charset' => 'utf8mb4',
        'options' => [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    ],
    
    'jwt' => [
        'secret' => $_ENV['JWT_SECRET'] ?? 'your-jwt-secret-key',
        'algorithm' => 'HS256',
        'expiration' => 86400, // 24 hours
    ],
    
    'api' => [
        'python_ml_url' => $_ENV['PYTHON_ML_URL'] ?? 'http://localhost:5000',
        'flask_api_url' => $_ENV['FLASK_API_URL'] ?? 'http://localhost:5000',
        'timeout' => 30,
    ],
    
    'upload' => [
        'max_file_size' => 10 * 1024 * 1024, // 10MB
        'allowed_types' => ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'],
        'upload_path' => __DIR__ . '/uploads/',
    ],
    
    'security' => [
        'password_min_length' => 8,
        'max_login_attempts' => 5,
        'lockout_duration' => 900, // 15 minutes
        'session_timeout' => 3600, // 1 hour
    ],
    
    'logging' => [
        'level' => $_ENV['LOG_LEVEL'] ?? 'INFO',
        'file' => __DIR__ . '/../logs/app.log',
    ],
    
    'cors' => [
        'allowed_origins' => [
            'http://localhost:3000',
            'http://localhost:8080',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:8080',
        ],
        'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        'allowed_headers' => ['Content-Type', 'Authorization', 'X-Requested-With'],
    ],
    
    'app' => [
        'name' => 'Sign Language Recognition Platform',
        'version' => '1.0.0',
        'debug' => $_ENV['APP_DEBUG'] ?? false,
        'timezone' => 'UTC',
    ]
];
