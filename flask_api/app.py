"""
Flask API Application for Sign Language Recognition Platform

This module provides REST API endpoints for sign language recognition,
translation, user management, and real-time communication.
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from flask_bcrypt import Bcrypt
from werkzeug.utils import secure_filename
import os
import json
import base64
import cv2
import numpy as np
from datetime import datetime, timedelta
import redis
from celery import Celery
import logging
from typing import Dict, List, Optional
import sys
sys.path.append('../python_ml')

from sign_recognition import SignLanguageRecognizer
from model_training import SignLanguageModelTrainer

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-here')
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-string')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
    'DATABASE_URL', 
    'mysql+pymysql://root:root@localhost:3306/sign_language_db'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Redis configuration
redis_url = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')

# Initialize extensions
CORS(app, origins=['http://localhost:3000', 'http://localhost:8080'])
socketio = SocketIO(app, cors_allowed_origins=['http://localhost:3000', 'http://localhost:8080'])
db = SQLAlchemy(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)
bcrypt = Bcrypt(app)

# Initialize Redis
redis_client = redis.from_url(redis_url)

# Initialize Celery
celery = Celery(
    app.import_name,
    backend=redis_url,
    broker=redis_url
)

# Initialize ML components
sign_recognizer = SignLanguageRecognizer()
model_trainer = SignLanguageModelTrainer()

# Database Models
class User(db.Model):
    """User model for authentication and profile management."""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    first_name = db.Column(db.String(50), nullable=True)
    last_name = db.Column(db.String(50), nullable=True)
    is_disabled = db.Column(db.Boolean, default=False)
    preferred_language = db.Column(db.String(10), default='ASL')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    progress_records = db.relationship('UserProgress', backref='user', lazy=True)
    translation_history = db.relationship('TranslationHistory', backref='user', lazy=True)
    
    def set_password(self, password):
        """Hash and set password."""
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    
    def check_password(self, password):
        """Check password against hash."""
        return bcrypt.check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        """Convert user to dictionary."""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'is_disabled': self.is_disabled,
            'preferred_language': self.preferred_language,
            'created_at': self.created_at.isoformat(),
            'last_login': self.last_login.isoformat() if self.last_login else None
        }

class UserProgress(db.Model):
    """User learning progress tracking."""
    __tablename__ = 'user_progress'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    sign_language = db.Column(db.String(10), nullable=False)
    sign_learned = db.Column(db.String(50), nullable=False)
    accuracy = db.Column(db.Float, nullable=False)
    attempts = db.Column(db.Integer, default=1)
    mastered = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class TranslationHistory(db.Model):
    """Translation history for users."""
    __tablename__ = 'translation_history'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    input_text = db.Column(db.Text, nullable=False)
    output_signs = db.Column(db.Text, nullable=False)
    translation_type = db.Column(db.String(20), nullable=False)  # 'text_to_sign' or 'sign_to_text'
    confidence = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class SignVocabulary(db.Model):
    """Sign language vocabulary database."""
    __tablename__ = 'sign_vocabulary'
    
    id = db.Column(db.Integer, primary_key=True)
    sign_text = db.Column(db.String(100), nullable=False)
    sign_language = db.Column(db.String(10), nullable=False)
    description = db.Column(db.Text, nullable=True)
    difficulty_level = db.Column(db.Integer, default=1)  # 1-5 difficulty scale
    category = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# API Routes

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0'
    })

@app.route('/api/auth/register', methods=['POST'])
def register():
    """User registration endpoint."""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['username', 'email', 'password']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Check if user already exists
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already exists'}), 400
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already exists'}), 400
        
        # Create new user
        user = User(
            username=data['username'],
            email=data['email'],
            first_name=data.get('first_name', None),
            last_name=data.get('last_name', None),
            is_disabled=data.get('is_disabled', False),
            preferred_language=data.get('preferred_language', 'ASL')
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # Create access token
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'success': True,
            'message': 'User registered successfully',
            'access_token': access_token,
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        logger.error(f"Registration error: {e}")
        return jsonify({'success': False, 'error': 'Registration failed'}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """User login endpoint."""
    try:
        data = request.get_json()
        
        if not data or not data.get('username') or not data.get('password'):
            return jsonify({'error': 'Username and password required'}), 400
        
        # Find user
        user = User.query.filter_by(username=data['username']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'success': False, 'error': 'Invalid credentials'}), 401
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        # Create access token
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'access_token': access_token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Login error: {e}")
        return jsonify({'success': False, 'error': 'Login failed'}), 500

@app.route('/api/recognize', methods=['POST'])
@jwt_required()
def recognize_sign():
    """Sign language recognition endpoint."""
    try:
        user_id = get_jwt_identity()
        
        # Get image data from request
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        image_file = request.files['image']
        
        # Read image
        image_bytes = image_file.read()
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            return jsonify({'error': 'Invalid image format'}), 400
        
        # Recognize sign
        result = sign_recognizer.recognize_sign(image)
        
        # Save to translation history
        if result['sign'] != 'UNKNOWN' and result['confidence'] > 0.5:
            translation = TranslationHistory(
                user_id=user_id,
                input_text='',  # Image input
                output_signs=result['sign'],
                translation_type='sign_to_text',
                confidence=result['confidence']
            )
            db.session.add(translation)
            db.session.commit()
        
        return jsonify({
            'sign': result['sign'],
            'confidence': result['confidence'],
            'timestamp': result['timestamp']
        }), 200
        
    except Exception as e:
        logger.error(f"Recognition error: {e}")
        return jsonify({'error': 'Recognition failed'}), 500

@app.route('/api/translate', methods=['POST'])
@jwt_required()
def translate_text_to_sign():
    """Text to sign language translation endpoint."""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({'error': 'Text input required'}), 400
        
        text = data['text']
        language = data.get('language', 'ASL')
        
        # Convert text to sign sequence
        signs = sign_recognizer.text_to_sign_sequence(text)
        
        # Save to translation history
        translation = TranslationHistory(
            user_id=user_id,
            input_text=text,
            output_signs=json.dumps(signs),
            translation_type='text_to_sign',
            confidence=0.8  # Default confidence for text-to-sign
        )
        db.session.add(translation)
        db.session.commit()
        
        return jsonify({
            'text': text,
            'signs': signs,
            'language': language,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Translation error: {e}")
        return jsonify({'error': 'Translation failed'}), 500

@app.route('/api/user/progress', methods=['GET'])
@jwt_required()
def get_user_progress():
    """Get user learning progress."""
    try:
        user_id = get_jwt_identity()
        
        # Get progress records
        progress_records = UserProgress.query.filter_by(user_id=user_id).all()
        
        # Calculate statistics
        total_signs = len(progress_records)
        mastered_signs = len([p for p in progress_records if p.mastered])
        average_accuracy = np.mean([p.accuracy for p in progress_records]) if progress_records else 0
        
        # Group by sign language
        progress_by_language = {}
        for record in progress_records:
            lang = record.sign_language
            if lang not in progress_by_language:
                progress_by_language[lang] = {
                    'total': 0,
                    'mastered': 0,
                    'average_accuracy': 0
                }
            progress_by_language[lang]['total'] += 1
            if record.mastered:
                progress_by_language[lang]['mastered'] += 1
        
        # Calculate average accuracy per language
        for lang in progress_by_language:
            lang_records = [p for p in progress_records if p.sign_language == lang]
            progress_by_language[lang]['average_accuracy'] = np.mean([p.accuracy for p in lang_records])
        
        return jsonify({
            'total_signs': total_signs,
            'mastered_signs': mastered_signs,
            'overall_accuracy': float(average_accuracy),
            'progress_by_language': progress_by_language,
            'recent_progress': [
                {
                    'sign': p.sign_learned,
                    'language': p.sign_language,
                    'accuracy': p.accuracy,
                    'mastered': p.mastered,
                    'date': p.updated_at.isoformat()
                }
                for p in progress_records[-10:]  # Last 10 records
            ]
        }), 200
        
    except Exception as e:
        logger.error(f"Progress retrieval error: {e}")
        return jsonify({'error': 'Failed to retrieve progress'}), 500

@app.route('/api/signs', methods=['GET'])
def get_sign_vocabulary():
    """Get available sign language vocabulary."""
    try:
        language = request.args.get('language', 'ASL')
        difficulty = request.args.get('difficulty', type=int)
        category = request.args.get('category')
        
        query = SignVocabulary.query.filter_by(sign_language=language)
        
        if difficulty:
            query = query.filter_by(difficulty_level=difficulty)
        
        if category:
            query = query.filter_by(category=category)
        
        signs = query.all()
        
        return jsonify({
            'signs': [
                {
                    'id': sign.id,
                    'text': sign.sign_text,
                    'language': sign.sign_language,
                    'description': sign.description,
                    'difficulty': sign.difficulty_level,
                    'category': sign.category
                }
                for sign in signs
            ],
            'total': len(signs)
        }), 200
        
    except Exception as e:
        logger.error(f"Vocabulary retrieval error: {e}")
        return jsonify({'error': 'Failed to retrieve vocabulary'}), 500

@app.route('/api/user/profile', methods=['GET'])
@jwt_required()
def get_user_profile():
    """Get user profile information."""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify(user.to_dict()), 200
        
    except Exception as e:
        logger.error(f"Profile retrieval error: {e}")
        return jsonify({'error': 'Failed to retrieve profile'}), 500

# WebSocket Events

@socketio.on('connect')
def handle_connect():
    """Handle client connection."""
    logger.info(f"Client connected: {request.sid}")
    emit('connected', {'message': 'Connected to Sign Language Recognition API'})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection."""
    logger.info(f"Client disconnected: {request.sid}")

@socketio.on('join_room')
def handle_join_room(data):
    """Handle joining a room."""
    room = data.get('room', 'default')
    join_room(room)
    emit('joined_room', {'room': room})

@socketio.on('leave_room')
def handle_leave_room(data):
    """Handle leaving a room."""
    room = data.get('room', 'default')
    leave_room(room)
    emit('left_room', {'room': room})

@socketio.on('recognize_sign')
def handle_sign_recognition(data):
    """Handle real-time sign recognition via WebSocket."""
    try:
        # Decode base64 image
        image_data = data.get('image')
        if not image_data:
            emit('recognition_error', {'error': 'No image data provided'})
            return
        
        # Remove data URL prefix if present
        if image_data.startswith('data:image'):
            image_data = image_data.split(',')[1]
        
        # Decode image
        image_bytes = base64.b64decode(image_data)
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            emit('recognition_error', {'error': 'Invalid image format'})
            return
        
        # Recognize sign
        result = sign_recognizer.recognize_sign(image)
        
        # Emit result
        emit('recognition_result', {
            'sign': result['sign'],
            'confidence': result['confidence'],
            'timestamp': result['timestamp']
        })
        
    except Exception as e:
        logger.error(f"WebSocket recognition error: {e}")
        emit('recognition_error', {'error': str(e)})

# Celery Tasks

@celery.task
def process_batch_recognition(image_paths, user_id):
    """Process batch sign recognition."""
    results = []
    
    for image_path in image_paths:
        try:
            image = cv2.imread(image_path)
            if image is not None:
                result = sign_recognizer.recognize_sign(image)
                results.append({
                    'image_path': image_path,
                    'result': result
                })
        except Exception as e:
            logger.error(f"Batch processing error for {image_path}: {e}")
    
    return results

# Error Handlers

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    return jsonify({'error': 'Internal server error'}), 500

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    """Handle expired JWT tokens."""
    return jsonify({'error': 'Token has expired'}), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    """Handle invalid JWT tokens."""
    return jsonify({'error': 'Invalid token'}), 401



def initialize_sign_vocabulary():
    """Initialize basic sign language vocabulary."""
    basic_signs = [
        ('A', 'ASL', 'Letter A', 1, 'alphabet'),
        ('B', 'ASL', 'Letter B', 1, 'alphabet'),
        ('C', 'ASL', 'Letter C', 1, 'alphabet'),
        ('HELLO', 'ASL', 'Greeting', 1, 'greetings'),
        ('THANK YOU', 'ASL', 'Expression of gratitude', 1, 'greetings'),
        ('YES', 'ASL', 'Affirmative response', 1, 'responses'),
        ('NO', 'ASL', 'Negative response', 1, 'responses'),
        ('PLEASE', 'ASL', 'Polite request', 1, 'greetings'),
        ('SORRY', 'ASL', 'Apology', 1, 'greetings'),
        ('LOVE', 'ASL', 'Expression of love', 2, 'emotions'),
        ('FAMILY', 'ASL', 'Family members', 2, 'family'),
    ]
    
    for sign_text, language, description, difficulty, category in basic_signs:
        sign = SignVocabulary(
            sign_text=sign_text,
            sign_language=language,
            description=description,
            difficulty_level=difficulty,
            category=category
        )
        db.session.add(sign)
    
    db.session.commit()
    logger.info("Sign vocabulary initialized")

if __name__ == '__main__':
    # Create database tables
    with app.app_context():
        db.create_all()
        initialize_sign_vocabulary()
    
    # Run the application
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
