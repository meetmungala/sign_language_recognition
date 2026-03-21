# Flask API Backend

This module provides REST API endpoints for the Sign Language Recognition platform.

## Features

- Real-time sign language recognition API
- Speech-to-sign translation endpoints
- User progress tracking
- Translation history management
- Authentication and authorization
- WebSocket support for real-time communication

## Endpoints

- `POST /api/recognize` - Sign language recognition
- `POST /api/translate` - Speech to sign translation
- `GET /api/user/progress` - User learning progress
- `POST /api/auth/login` - User authentication
- `GET /api/signs` - Available sign language vocabulary
- `WebSocket /ws` - Real-time communication

## Dependencies

- Flask
- Flask-CORS
- Flask-SocketIO
- SQLAlchemy
- PyMySQL
- Redis
- Celery
