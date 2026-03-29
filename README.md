# 3D Sign Language Recognition & Communication Platform

A comprehensive platform for sign language recognition, translation, and learning with 3D avatar animations, designed specifically for disabled persons and accessibility.

## 🚀 Features

### Core Functionality
- **Real-time Sign Language Recognition**: AI-powered gesture recognition using TensorFlow/PyTorch + MediaPipe
- **Multi-language Support**: ASL, ISL, CSL, WLASL datasets and recognition
- **3D Avatar Animations**: Interactive learning with Three.js/Blender models
- **Speech-to-Sign Translation**: Communication bridge for hearing-disabled persons
- **Interactive Learning Modules**: Practice tests and progress tracking
- **Offline Mode**: Basic recognition without internet connection
- **Multi-device Support**: Desktop and mobile responsive design

### Accessibility Features
- **High Contrast Mode**: Enhanced visibility for visually impaired users
- **Large Text Support**: Adjustable font sizes
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: ARIA labels and semantic HTML
- **Voice Feedback**: Text-to-speech for recognized signs
- **Customizable UI**: User preferences for accessibility needs

## 🏗️ Architecture

```
├── python_ml/          # Python ML backend (TensorFlow/PyTorch + MediaPipe)
├── flask_api/          # Flask REST API for ML predictions
├── php_backend/        # PHP backend for user management and authentication
├── react_frontend/     # React.js frontend with Three.js animations
├── database/           # MySQL database schemas and initialization scripts
├── deployment/         # Docker Compose and deployment configurations
├── FLASK_API_FIXED.md  # Fix notes for Flask API dependency issues
├── MEDIAPIPE_FIXED.md  # Fix notes for MediaPipe / Python 3.13 compatibility
└── start_project.bat   # Windows quick-start script (XAMPP + npm)
```

## 🛠️ Tech Stack

### Backend
- **ML/AI**: Python, TensorFlow/PyTorch, MediaPipe, OpenPose
- **API**: Flask (Python), PHP
- **Database**: MySQL/MongoDB
- **Cache**: Redis
- **Authentication**: JWT tokens

### Frontend
- **Framework**: React.js 18 with TypeScript
- **3D Graphics**: Three.js, React Three Fiber
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Real-time**: Socket.IO
- **Forms**: React Hook Form with Zod validation

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx
- **CI/CD**: GitHub Actions
- **Monitoring**: Application logs and health checks

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.8+ with pip
- **PHP** 7.4+ with Composer
- **MySQL** 8.0+ or MongoDB
- **Redis** 6.0+
- **Docker** and Docker Compose (optional)

## 🚀 Quick Start

### Option 1: Docker (Recommended)

> **Note:** Individual service Dockerfiles are required but not included in this repository. Build them per-service before running Docker Compose.

1. **Clone the repository**
   ```bash
   git clone https://github.com/meetmungala/sign_language_recognition.git
   cd sign_language_recognition
   ```

2. **Set up environment variables**
   ```bash
   cp react_frontend/env.example react_frontend/.env
   # Edit react_frontend/.env with your configuration
   ```

3. **Start all services**
   ```bash
   docker-compose -f deployment/docker-compose.yml up -d
   ```

4. **Initialize database**
   ```bash
   docker-compose -f deployment/docker-compose.yml exec mysql mysql -u root -p < database/schema.sql
   docker-compose -f deployment/docker-compose.yml exec python-ml python database/init_data.py
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - API: http://localhost:5000
   - PHP Backend: http://localhost:8080

### Option 2: Windows Quick Start (XAMPP)

A `start_project.bat` script is included for Windows developers using XAMPP.

1. **Prerequisites**: Install [XAMPP](https://www.apachefriends.org/) and start Apache + MySQL from the XAMPP Control Panel.
2. **Double-click `start_project.bat`** — it will open separate terminal windows for:
   - Python ML Backend
   - Flask API
   - React Frontend
3. Your browser will open **http://localhost:3000** automatically.

> **Note:** The `.bat` script contains hard-coded paths from the original developer's machine. Update the paths at the top of the file to match your local setup before running.

### Option 3: Manual Setup

1. **Python ML Backend**
   ```bash
   cd python_ml
   pip install -r requirements.txt
   python sign_recognition.py
   ```

2. **Flask API**
   ```bash
   cd flask_api
   pip install -r requirements.txt
   python app.py
   ```

3. **PHP Backend**
   ```bash
   cd php_backend
   composer install
   php -S localhost:8080
   ```

4. **React Frontend**
   ```bash
   cd react_frontend
   npm install
   npm start
   ```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Recognition Endpoints
- `POST /api/recognize` - Sign language recognition
- `POST /api/translate` - Text to sign translation
- `GET /api/signs` - Available sign vocabulary
- `GET /api/user/progress` - User learning progress

### WebSocket Events
- `recognize_sign` - Real-time sign recognition
- `recognition_result` - Recognition results
- `recognition_error` - Error handling

## 🎯 Usage Examples

### Real-time Recognition
```javascript
// Start camera and recognition
const { startStream, captureFrame } = useWebcam();
const { socket } = useSocket();

// Capture frame and send for recognition
const frame = captureFrame();
socket.emit('recognize_sign', { image: frame });

// Listen for results
socket.on('recognition_result', (result) => {
  console.log(`Recognized: ${result.sign} (${result.confidence}%)`);
});
```

### 3D Avatar Animation
```jsx
<SignAvatar
  signData={recognitionResult}
  isAnimating={isRecognizing}
  onAnimationComplete={() => {
    console.log('Animation completed');
  }}
/>
```

### Offline Mode
```javascript
// Check online status
const isOnline = useOnlineStatus();

if (!isOnline) {
  // Use offline recognition
  const result = performOfflineRecognition();
}
```

## 🔧 Configuration

### Environment Variables
```bash
# Database
DB_HOST=localhost
DB_USER=sign_lang_user
DB_PASSWORD=your_password
DB_NAME=sign_language_db

# API URLs
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_PHP_API_URL=http://localhost:8080

# Security
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret

# Features
REACT_APP_ENABLE_OFFLINE_MODE=true
REACT_APP_ENABLE_SPEECH_SYNTHESIS=true
REACT_APP_ENABLE_3D_AVATAR=true
```

## 🧪 Testing

### Run Tests
```bash
# Python tests
cd python_ml
python -m pytest tests/

# React tests
cd react_frontend
npm test

# PHP tests
cd php_backend
composer test
```

### Test Coverage
- Unit tests for ML models
- Integration tests for API endpoints
- E2E tests for user workflows
- Accessibility tests for disabled users

## 📊 Performance

### Optimization Features
- **Model Compression**: Quantized models for faster inference
- **Caching**: Redis caching for frequent requests
- **CDN**: Static asset delivery
- **Lazy Loading**: Component-based code splitting
- **Image Optimization**: Compressed images and videos

### Monitoring
- **Health Checks**: Service availability monitoring
- **Performance Metrics**: Response times and throughput
- **Error Tracking**: Comprehensive error logging
- **User Analytics**: Usage patterns and accessibility metrics

## 🔒 Security

### Security Features
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Comprehensive input sanitization
- **CORS Protection**: Cross-origin request security
- **Rate Limiting**: API request throttling
- **HTTPS**: Encrypted communication
- **Data Privacy**: GDPR compliance for user data

## 🌍 Internationalization

### Supported Languages
- **Sign Languages**: ASL, ISL, CSL, WLASL
- **Interface Languages**: English, Spanish, French, German
- **Accessibility**: Screen reader support in multiple languages

## 🛠️ Troubleshooting

### MediaPipe / Python 3.13 Compatibility
MediaPipe does not yet support Python 3.13. A fallback recognition system is built in. See [`MEDIAPIPE_FIXED.md`](MEDIAPIPE_FIXED.md) for details and workarounds.

### Flask API Dependency Issues
If you encounter dependency conflicts when installing the Flask API requirements, refer to [`FLASK_API_FIXED.md`](FLASK_API_FIXED.md) for the resolved configuration.

### Common Issues
| Issue | Solution |
|-------|----------|
| `ModuleNotFoundError: mediapipe` | Use Python 3.10 or 3.11, or rely on the built-in fallback recognizer |
| `docker-compose: command not found` | Install Docker Desktop or run `docker compose` (v2 syntax) |
| React app fails to connect to API | Verify `REACT_APP_API_URL` in `react_frontend/.env` matches your Flask port |
| `start_project.bat` opens wrong paths | Update hard-coded paths at the top of the file to match your local setup |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow accessibility best practices
- Write comprehensive tests
- Update documentation
- Ensure mobile responsiveness
- Test with disabled users

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **MediaPipe** team for pose estimation
- **Three.js** community for 3D graphics
- **React** team for the frontend framework
- **Accessibility** advocates and disabled users for feedback
- **Sign Language** communities for dataset contributions

## 📞 Support

- **Documentation**: [Wiki](https://github.com/meetmungala/sign_language_recognition/wiki)
- **Issues**: [GitHub Issues](https://github.com/meetmungala/sign_language_recognition/issues)
- **Discussions**: [GitHub Discussions](https://github.com/meetmungala/sign_language_recognition/discussions)
- **Email**: support@signlangplatform.com

## 🗺️ Roadmap

### Version 2.0
- [ ] Advanced ML models with better accuracy
- [ ] More sign languages support
- [ ] Mobile app (React Native)
- [ ] Voice recognition integration
- [ ] AR/VR support

### Version 3.0
- [ ] AI-powered sign language generation
- [ ] Real-time translation between sign languages
- [ ] Community features and sharing
- [ ] Advanced analytics and insights
- [ ] Integration with assistive technologies

---

**Made with ❤️ for the disabled community**

> Last updated: March 2026 — see [FLASK_API_FIXED.md](FLASK_API_FIXED.md) and [MEDIAPIPE_FIXED.md](MEDIAPIPE_FIXED.md) for the latest compatibility fixes.