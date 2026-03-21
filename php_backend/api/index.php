<?php
/**
 * Main API Router for PHP Backend
 */

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../classes/Database.php';
require_once __DIR__ . '/../classes/UserManager.php';
require_once __DIR__ . '/../classes/MLAPIClient.php';

use SignLanguagePlatform\Database;
use SignLanguagePlatform\UserManager;
use SignLanguagePlatform\MLAPIClient;

// Set headers for CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get request method and URI
$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = str_replace('/api', '', $uri);

// Initialize classes
$userManager = new UserManager();
$mlClient = new MLAPIClient();

// Route the request
try {
    switch ($uri) {
        case '/auth/register':
            if ($method === 'POST') {
                handleRegister($userManager);
            } else {
                sendError('Method not allowed', 405);
            }
            break;

        case '/auth/login':
            if ($method === 'POST') {
                handleLogin($userManager);
            } else {
                sendError('Method not allowed', 405);
            }
            break;

        case '/auth/profile':
            if ($method === 'GET') {
                handleGetProfile($userManager);
            } elseif ($method === 'PUT') {
                handleUpdateProfile($userManager);
            } else {
                sendError('Method not allowed', 405);
            }
            break;

        case '/auth/change-password':
            if ($method === 'POST') {
                handleChangePassword($userManager);
            } else {
                sendError('Method not allowed', 405);
            }
            break;

        case '/recognize':
            if ($method === 'POST') {
                handleRecognizeSign($mlClient, $userManager);
            } else {
                sendError('Method not allowed', 405);
            }
            break;

        case '/translate':
            if ($method === 'POST') {
                handleTranslateText($mlClient, $userManager);
            } else {
                sendError('Method not allowed', 405);
            }
            break;

        case '/vocabulary':
            if ($method === 'GET') {
                handleGetVocabulary($mlClient);
            } else {
                sendError('Method not allowed', 405);
            }
            break;

        case '/progress':
            if ($method === 'GET') {
                handleGetProgress($userManager);
            } else {
                sendError('Method not allowed', 405);
            }
            break;

        case '/health':
            if ($method === 'GET') {
                handleHealthCheck($mlClient);
            } else {
                sendError('Method not allowed', 405);
            }
            break;

        default:
            sendError('Endpoint not found', 404);
            break;
    }
} catch (Exception $e) {
    sendError('Internal server error: ' . $e->getMessage(), 500);
}

/**
 * Handle user registration
 */
function handleRegister($userManager)
{
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        sendError('Invalid JSON input', 400);
        return;
    }

    $result = $userManager->register($input);
    
    if ($result['success']) {
        sendSuccess($result['message'], $result);
    } else {
        sendError($result['message'], 400);
    }
}

/**
 * Handle user login
 */
function handleLogin($userManager)
{
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input || !isset($input['username']) || !isset($input['password'])) {
        sendError('Username and password required', 400);
        return;
    }

    $result = $userManager->login($input['username'], $input['password']);
    
    if ($result['success']) {
        sendSuccess($result['message'], $result);
    } else {
        sendError($result['message'], 401);
    }
}

/**
 * Handle get user profile
 */
function handleGetProfile($userManager)
{
    $userId = getUserIdFromToken();
    
    if (!$userId) {
        sendError('Authentication required', 401);
        return;
    }

    $result = $userManager->getUserProfile($userId);
    
    if ($result['success']) {
        sendSuccess('Profile retrieved successfully', $result['user']);
    } else {
        sendError($result['message'], 404);
    }
}

/**
 * Handle update user profile
 */
function handleUpdateProfile($userManager)
{
    $userId = getUserIdFromToken();
    
    if (!$userId) {
        sendError('Authentication required', 401);
        return;
    }

    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        sendError('Invalid JSON input', 400);
        return;
    }

    $result = $userManager->updateProfile($userId, $input);
    
    if ($result['success']) {
        sendSuccess($result['message']);
    } else {
        sendError($result['message'], 400);
    }
}

/**
 * Handle change password
 */
function handleChangePassword($userManager)
{
    $userId = getUserIdFromToken();
    
    if (!$userId) {
        sendError('Authentication required', 401);
        return;
    }

    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input || !isset($input['current_password']) || !isset($input['new_password'])) {
        sendError('Current password and new password required', 400);
        return;
    }

    $result = $userManager->changePassword(
        $userId, 
        $input['current_password'], 
        $input['new_password']
    );
    
    if ($result['success']) {
        sendSuccess($result['message']);
    } else {
        sendError($result['message'], 400);
    }
}

/**
 * Handle sign recognition
 */
function handleRecognizeSign($mlClient, $userManager)
{
    $userId = getUserIdFromToken();
    
    if (!$userId) {
        sendError('Authentication required', 401);
        return;
    }

    // Handle file upload
    if (!isset($_FILES['image'])) {
        sendError('Image file required', 400);
        return;
    }

    $uploadResult = handleFileUpload($_FILES['image']);
    
    if (!$uploadResult['success']) {
        sendError($uploadResult['message'], 400);
        return;
    }

    $result = $mlClient->recognizeSign($uploadResult['file_path'], $userId);
    
    if ($result['success']) {
        sendSuccess('Sign recognized successfully', $result['data']);
    } else {
        sendError($result['message'], 500);
    }

    // Clean up uploaded file
    if (file_exists($uploadResult['file_path'])) {
        unlink($uploadResult['file_path']);
    }
}

/**
 * Handle text to sign translation
 */
function handleTranslateText($mlClient, $userManager)
{
    $userId = getUserIdFromToken();
    
    if (!$userId) {
        sendError('Authentication required', 401);
        return;
    }

    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input || !isset($input['text'])) {
        sendError('Text input required', 400);
        return;
    }

    $language = $input['language'] ?? 'ASL';
    $result = $mlClient->translateTextToSign($input['text'], $language, $userId);
    
    if ($result['success']) {
        sendSuccess('Translation completed successfully', $result['data']);
    } else {
        sendError($result['message'], 500);
    }
}

/**
 * Handle get vocabulary
 */
function handleGetVocabulary($mlClient)
{
    $language = $_GET['language'] ?? 'ASL';
    $difficulty = isset($_GET['difficulty']) ? (int)$_GET['difficulty'] : null;
    $category = $_GET['category'] ?? null;

    $result = $mlClient->getSignVocabulary($language, $difficulty, $category);
    
    if ($result['success']) {
        sendSuccess('Vocabulary retrieved successfully', $result['data']);
    } else {
        sendError($result['message'], 500);
    }
}

/**
 * Handle get user progress
 */
function handleGetProgress($userManager)
{
    $userId = getUserIdFromToken();
    
    if (!$userId) {
        sendError('Authentication required', 401);
        return;
    }

    $result = $userManager->getUserProgress($userId);
    
    if ($result['success']) {
        sendSuccess('Progress retrieved successfully', $result['progress']);
    } else {
        sendError($result['message'], 500);
    }
}

/**
 * Handle health check
 */
function handleHealthCheck($mlClient)
{
    $result = $mlClient->healthCheck();
    
    if ($result['success']) {
        sendSuccess('Service is healthy', $result['data']);
    } else {
        sendError($result['message'], 503);
    }
}

/**
 * Handle file upload
 */
function handleFileUpload($file)
{
    $config = require __DIR__ . '/../config/config.php';
    
    // Validate file
    if ($file['error'] !== UPLOAD_ERR_OK) {
        return ['success' => false, 'message' => 'File upload error'];
    }

    if ($file['size'] > $config['upload']['max_file_size']) {
        return ['success' => false, 'message' => 'File too large'];
    }

    $fileType = mime_content_type($file['tmp_name']);
    if (!in_array($fileType, $config['upload']['allowed_types'])) {
        return ['success' => false, 'message' => 'Invalid file type'];
    }

    // Generate unique filename
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = uniqid() . '.' . $extension;
    $filePath = $config['upload']['upload_path'] . $filename;

    // Move uploaded file
    if (move_uploaded_file($file['tmp_name'], $filePath)) {
        return ['success' => true, 'file_path' => $filePath];
    } else {
        return ['success' => false, 'message' => 'Failed to save file'];
    }
}

/**
 * Get user ID from JWT token
 */
function getUserIdFromToken()
{
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';

    if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        return false;
    }

    $token = $matches[1];
    $userManager = new UserManager();
    
    return $userManager->verifyToken($token);
}

/**
 * Send success response
 */
function sendSuccess($message, $data = null)
{
    $response = ['success' => true, 'message' => $message];
    
    if ($data !== null) {
        $response['data'] = $data;
    }
    
    echo json_encode($response);
    exit();
}

/**
 * Send error response
 */
function sendError($message, $code = 400)
{
    http_response_code($code);
    echo json_encode(['success' => false, 'message' => $message]);
    exit();
}
