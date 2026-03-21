<?php
/**
 * User Management Class
 */

namespace SignLanguagePlatform;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Respect\Validation\Validator as v;
use Monolog\Logger;
use Monolog\Handler\StreamHandler;

class UserManager
{
    private $db;
    private $config;
    private $logger;

    public function __construct()
    {
        $this->db = Database::getInstance();
        $this->config = require __DIR__ . '/../config/config.php';
        $this->logger = new Logger('user_manager');
        $this->logger->pushHandler(new StreamHandler($this->config['logging']['file'], Logger::INFO));
    }

    /**
     * Register a new user
     */
    public function register($userData)
    {
        try {
            // Validate input data
            $this->validateRegistrationData($userData);

            // Check if user already exists
            if ($this->userExists($userData['username'], $userData['email'])) {
                throw new \Exception('User already exists');
            }

            // Hash password
            $hashedPassword = password_hash($userData['password'], PASSWORD_DEFAULT);

            // Prepare user data
            $user = [
                'username' => $userData['username'],
                'email' => $userData['email'],
                'password_hash' => $hashedPassword,
                'first_name' => $userData['first_name'] ?? null,
                'last_name' => $userData['last_name'] ?? null,
                'is_disabled' => $userData['is_disabled'] ?? false,
                'preferred_language' => $userData['preferred_language'] ?? 'ASL',
                'created_at' => date('Y-m-d H:i:s'),
                'is_active' => true,
                'email_verified' => false
            ];

            // Insert user
            $userId = $this->db->insert('users', $user);

            $this->logger->info('User registered successfully', ['user_id' => $userId, 'username' => $userData['username']]);

            return [
                'success' => true,
                'user_id' => $userId,
                'message' => 'User registered successfully'
            ];

        } catch (\Exception $e) {
            $this->logger->error('User registration failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Authenticate user login
     */
    public function login($username, $password)
    {
        try {
            // Find user
            $user = $this->db->fetch(
                'SELECT * FROM users WHERE username = :username AND is_active = 1',
                ['username' => $username]
            );

            if (!$user) {
                throw new \Exception('Invalid credentials');
            }

            // Verify password
            if (!password_verify($password, $user['password_hash'])) {
                throw new \Exception('Invalid credentials');
            }

            // Update last login
            $this->db->update(
                'users',
                ['last_login' => date('Y-m-d H:i:s')],
                'id = :id',
                ['id' => $user['id']]
            );

            // Generate JWT token
            $token = $this->generateJWT($user['id']);

            $this->logger->info('User logged in successfully', ['user_id' => $user['id'], 'username' => $username]);

            return [
                'success' => true,
                'token' => $token,
                'user' => $this->formatUserData($user),
                'message' => 'Login successful'
            ];

        } catch (\Exception $e) {
            $this->logger->error('User login failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Get user profile
     */
    public function getUserProfile($userId)
    {
        try {
            $user = $this->db->fetch(
                'SELECT * FROM users WHERE id = :id AND is_active = 1',
                ['id' => $userId]
            );

            if (!$user) {
                throw new \Exception('User not found');
            }

            return [
                'success' => true,
                'user' => $this->formatUserData($user)
            ];

        } catch (\Exception $e) {
            $this->logger->error('Get user profile failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Update user profile
     */
    public function updateProfile($userId, $updateData)
    {
        try {
            // Validate update data
            $this->validateUpdateData($updateData);

            // Remove sensitive fields
            unset($updateData['password'], $updateData['password_hash']);

            // Add updated timestamp
            $updateData['updated_at'] = date('Y-m-d H:i:s');

            // Update user
            $affectedRows = $this->db->update(
                'users',
                $updateData,
                'id = :id',
                ['id' => $userId]
            );

            if ($affectedRows === 0) {
                throw new \Exception('User not found or no changes made');
            }

            $this->logger->info('User profile updated', ['user_id' => $userId]);

            return [
                'success' => true,
                'message' => 'Profile updated successfully'
            ];

        } catch (\Exception $e) {
            $this->logger->error('Update profile failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Change user password
     */
    public function changePassword($userId, $currentPassword, $newPassword)
    {
        try {
            // Get current user
            $user = $this->db->fetch(
                'SELECT password_hash FROM users WHERE id = :id',
                ['id' => $userId]
            );

            if (!$user) {
                throw new \Exception('User not found');
            }

            // Verify current password
            if (!password_verify($currentPassword, $user['password_hash'])) {
                throw new \Exception('Current password is incorrect');
            }

            // Validate new password
            if (!v::stringType()->length(8, null)->validate($newPassword)) {
                throw new \Exception('New password must be at least 8 characters long');
            }

            // Hash new password
            $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

            // Update password
            $this->db->update(
                'users',
                [
                    'password_hash' => $hashedPassword,
                    'updated_at' => date('Y-m-d H:i:s')
                ],
                'id = :id',
                ['id' => $userId]
            );

            $this->logger->info('Password changed successfully', ['user_id' => $userId]);

            return [
                'success' => true,
                'message' => 'Password changed successfully'
            ];

        } catch (\Exception $e) {
            $this->logger->error('Change password failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Get user progress
     */
    public function getUserProgress($userId)
    {
        try {
            $progress = $this->db->fetchAll(
                'SELECT * FROM user_progress WHERE user_id = :user_id ORDER BY updated_at DESC',
                ['user_id' => $userId]
            );

            // Calculate statistics
            $totalSigns = count($progress);
            $masteredSigns = count(array_filter($progress, function($p) { return $p['mastered']; }));
            $averageAccuracy = $totalSigns > 0 ? array_sum(array_column($progress, 'accuracy')) / $totalSigns : 0;

            return [
                'success' => true,
                'progress' => [
                    'total_signs' => $totalSigns,
                    'mastered_signs' => $masteredSigns,
                    'average_accuracy' => round($averageAccuracy, 2),
                    'recent_progress' => array_slice($progress, 0, 10)
                ]
            ];

        } catch (\Exception $e) {
            $this->logger->error('Get user progress failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Verify JWT token
     */
    public function verifyToken($token)
    {
        try {
            $decoded = JWT::decode($token, new Key($this->config['jwt']['secret'], $this->config['jwt']['algorithm']));
            return $decoded->user_id;
        } catch (\Exception $e) {
            $this->logger->error('Token verification failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Generate JWT token
     */
    private function generateJWT($userId)
    {
        $payload = [
            'user_id' => $userId,
            'iat' => time(),
            'exp' => time() + $this->config['jwt']['expiration']
        ];

        return JWT::encode($payload, $this->config['jwt']['secret'], $this->config['jwt']['algorithm']);
    }

    /**
     * Check if user exists
     */
    private function userExists($username, $email)
    {
        $user = $this->db->fetch(
            'SELECT id FROM users WHERE username = :username OR email = :email',
            ['username' => $username, 'email' => $email]
        );

        return $user !== false;
    }

    /**
     * Validate registration data
     */
    private function validateRegistrationData($data)
    {
        if (!v::stringType()->notEmpty()->validate($data['username'])) {
            throw new \Exception('Username is required');
        }

        if (!v::email()->validate($data['email'])) {
            throw new \Exception('Valid email is required');
        }

        if (!v::stringType()->length(8, null)->validate($data['password'])) {
            throw new \Exception('Password must be at least 8 characters long');
        }

        if (!v::stringType()->length(3, 20)->validate($data['username'])) {
            throw new \Exception('Username must be between 3 and 20 characters');
        }
    }

    /**
     * Validate update data
     */
    private function validateUpdateData($data)
    {
        if (isset($data['email']) && !v::email()->validate($data['email'])) {
            throw new \Exception('Valid email is required');
        }

        if (isset($data['first_name']) && !v::stringType()->length(1, 50)->validate($data['first_name'])) {
            throw new \Exception('First name must be between 1 and 50 characters');
        }

        if (isset($data['last_name']) && !v::stringType()->length(1, 50)->validate($data['last_name'])) {
            throw new \Exception('Last name must be between 1 and 50 characters');
        }
    }

    /**
     * Format user data for response
     */
    private function formatUserData($user)
    {
        // Remove sensitive data
        unset($user['password_hash'], $user['verification_token'], $user['reset_token']);

        return $user;
    }
}
