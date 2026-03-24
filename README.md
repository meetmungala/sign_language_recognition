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
├── database/           # MySQL/MongoDB database schemas and migrations
├── docs/              # Documentation and API specifications
└── deployment/        # Docker and deployment configurations
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

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sign-language-platform
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Initialize database**
   ```bash
   docker-compose exec mysql mysql -u root -p < database/schema.sql
   docker-compose exec python-ml python database/init_data.py
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - API: http://localhost:5000
   - PHP Backend: http://localhost:8080

### Option 2: Manual Setup

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

- **Documentation**: [Wiki](https://github.com/your-repo/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)
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

Updated for improvements. Minor documentation update.