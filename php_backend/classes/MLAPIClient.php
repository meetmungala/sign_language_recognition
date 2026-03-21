<?php
/**
 * API Integration Class for Python ML Backend
 */

namespace SignLanguagePlatform;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Monolog\Logger;
use Monolog\Handler\StreamHandler;

class MLAPIClient
{
    private $client;
    private $config;
    private $logger;

    public function __construct()
    {
        $this->config = require __DIR__ . '/../config/config.php';
        $this->logger = new Logger('ml_api_client');
        $this->logger->pushHandler(new StreamHandler($this->config['logging']['file'], Logger::INFO));

        $this->client = new Client([
            'base_uri' => $this->config['api']['python_ml_url'],
            'timeout' => $this->config['api']['timeout'],
            'headers' => [
                'Content-Type' => 'application/json',
                'Accept' => 'application/json'
            ]
        ]);
    }

    /**
     * Recognize sign language from image
     */
    public function recognizeSign($imagePath, $userId = null)
    {
        try {
            if (!file_exists($imagePath)) {
                throw new \Exception('Image file not found');
            }

            // Prepare multipart form data
            $multipart = [
                [
                    'name' => 'image',
                    'contents' => fopen($imagePath, 'r'),
                    'filename' => basename($imagePath)
                ]
            ];

            if ($userId) {
                $multipart[] = [
                    'name' => 'user_id',
                    'contents' => $userId
                ];
            }

            $response = $this->client->post('/api/recognize', [
                'multipart' => $multipart
            ]);

            $result = json_decode($response->getBody()->getContents(), true);

            $this->logger->info('Sign recognition completed', [
                'image_path' => $imagePath,
                'result' => $result
            ]);

            return [
                'success' => true,
                'data' => $result
            ];

        } catch (RequestException $e) {
            $this->logger->error('ML API request failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Recognition service unavailable',
                'error' => $e->getMessage()
            ];
        } catch (\Exception $e) {
            $this->logger->error('Sign recognition failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Translate text to sign language
     */
    public function translateTextToSign($text, $language = 'ASL', $userId = null)
    {
        try {
            $data = [
                'text' => $text,
                'language' => $language
            ];

            if ($userId) {
                $data['user_id'] = $userId;
            }

            $response = $this->client->post('/api/translate', [
                'json' => $data
            ]);

            $result = json_decode($response->getBody()->getContents(), true);

            $this->logger->info('Text to sign translation completed', [
                'text' => $text,
                'language' => $language,
                'result' => $result
            ]);

            return [
                'success' => true,
                'data' => $result
            ];

        } catch (RequestException $e) {
            $this->logger->error('ML API request failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Translation service unavailable',
                'error' => $e->getMessage()
            ];
        } catch (\Exception $e) {
            $this->logger->error('Text to sign translation failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Get sign vocabulary
     */
    public function getSignVocabulary($language = 'ASL', $difficulty = null, $category = null)
    {
        try {
            $queryParams = ['language' => $language];

            if ($difficulty !== null) {
                $queryParams['difficulty'] = $difficulty;
            }

            if ($category !== null) {
                $queryParams['category'] = $category;
            }

            $response = $this->client->get('/api/signs', [
                'query' => $queryParams
            ]);

            $result = json_decode($response->getBody()->getContents(), true);

            return [
                'success' => true,
                'data' => $result
            ];

        } catch (RequestException $e) {
            $this->logger->error('ML API request failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Vocabulary service unavailable',
                'error' => $e->getMessage()
            ];
        } catch (\Exception $e) {
            $this->logger->error('Get vocabulary failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Get user progress from ML API
     */
    public function getUserProgress($userId)
    {
        try {
            $response = $this->client->get('/api/user/progress', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $this->getAuthToken($userId)
                ]
            ]);

            $result = json_decode($response->getBody()->getContents(), true);

            return [
                'success' => true,
                'data' => $result
            ];

        } catch (RequestException $e) {
            $this->logger->error('ML API request failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Progress service unavailable',
                'error' => $e->getMessage()
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
     * Health check for ML API
     */
    public function healthCheck()
    {
        try {
            $response = $this->client->get('/api/health');
            $result = json_decode($response->getBody()->getContents(), true);

            return [
                'success' => true,
                'data' => $result
            ];

        } catch (RequestException $e) {
            return [
                'success' => false,
                'message' => 'ML API is not available',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Upload file to ML API
     */
    public function uploadFile($filePath, $userId = null)
    {
        try {
            if (!file_exists($filePath)) {
                throw new \Exception('File not found');
            }

            $multipart = [
                [
                    'name' => 'file',
                    'contents' => fopen($filePath, 'r'),
                    'filename' => basename($filePath)
                ]
            ];

            if ($userId) {
                $multipart[] = [
                    'name' => 'user_id',
                    'contents' => $userId
                ];
            }

            $response = $this->client->post('/api/upload', [
                'multipart' => $multipart
            ]);

            $result = json_decode($response->getBody()->getContents(), true);

            return [
                'success' => true,
                'data' => $result
            ];

        } catch (RequestException $e) {
            $this->logger->error('File upload failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Upload service unavailable',
                'error' => $e->getMessage()
            ];
        } catch (\Exception $e) {
            $this->logger->error('File upload failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Get authentication token for API calls
     */
    private function getAuthToken($userId)
    {
        // This would typically generate a token or retrieve from session
        // For now, return a placeholder
        return 'user_' . $userId . '_token';
    }

    /**
     * Process batch recognition
     */
    public function processBatchRecognition($imagePaths, $userId = null)
    {
        try {
            $data = [
                'image_paths' => $imagePaths
            ];

            if ($userId) {
                $data['user_id'] = $userId;
            }

            $response = $this->client->post('/api/batch/recognize', [
                'json' => $data
            ]);

            $result = json_decode($response->getBody()->getContents(), true);

            return [
                'success' => true,
                'data' => $result
            ];

        } catch (RequestException $e) {
            $this->logger->error('Batch recognition failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Batch processing service unavailable',
                'error' => $e->getMessage()
            ];
        } catch (\Exception $e) {
            $this->logger->error('Batch recognition failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
}
