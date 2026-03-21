#!/usr/bin/env python3
"""
Simplified Flask API Application for Sign Language Recognition Platform

This is a working version that handles the core functionality without complex dependencies.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import base64
import cv2
import numpy as np
from datetime import datetime
import logging
import sys

# Add the python_ml directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'python_ml'))

# Try to import the sign recognition module
try:
    from sign_recognition import SignLanguageRecognizer
    RECOGNITION_AVAILABLE = True
except ImportError as e:
    print(f"Warning: Sign recognition not available: {e}")
    RECOGNITION_AVAILABLE = False

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-here')

# Enable CORS
CORS(app, origins="*")

# Initialize sign recognizer if available
recognizer = None
if RECOGNITION_AVAILABLE:
    try:
        recognizer = SignLanguageRecognizer()
        logger.info("Sign Language Recognizer initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize recognizer: {e}")
        RECOGNITION_AVAILABLE = False

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'service': 'Sign Language Recognition API',
        'version': '1.0.0',
        'recognition_available': RECOGNITION_AVAILABLE,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/recognize', methods=['POST'])
def recognize_sign():
    """Recognize sign language from image data."""
    try:
        if not RECOGNITION_AVAILABLE or recognizer is None:
            return jsonify({
                'error': 'Sign recognition not available',
                'message': 'The sign recognition system is not properly initialized'
            }), 503
        
        data = request.get_json()
        if not data or 'image_data' not in data:
            return jsonify({'error': 'No image data provided'}), 400
        
        # Decode base64 image
        try:
            image_data = base64.b64decode(data['image_data'])
            nparr = np.frombuffer(image_data, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return jsonify({'error': 'Invalid image data'}), 400
                
        except Exception as e:
            return jsonify({'error': f'Failed to decode image: {str(e)}'}), 400
        
        # Perform recognition
        result = recognizer.recognize_sign(image)
        
        return jsonify({
            'success': True,
            'result': result,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Recognition error: {e}")
        return jsonify({
            'error': 'Recognition failed',
            'message': str(e)
        }), 500

@app.route('/api/text-to-sign', methods=['POST'])
def text_to_sign():
    """Convert text to sign language sequence."""
    try:
        if not RECOGNITION_AVAILABLE or recognizer is None:
            return jsonify({
                'error': 'Text-to-sign conversion not available',
                'message': 'The sign recognition system is not properly initialized'
            }), 503
        
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({'error': 'No text provided'}), 400
        
        text = data['text']
        signs = recognizer.text_to_sign_sequence(text)
        
        return jsonify({
            'success': True,
            'text': text,
            'signs': signs,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Text-to-sign error: {e}")
        return jsonify({
            'error': 'Text-to-sign conversion failed',
            'message': str(e)
        }), 500

@app.route('/api/speech-to-sign', methods=['POST'])
def speech_to_sign():
    """Convert speech to sign language (placeholder)."""
    try:
        data = request.get_json()
        if not data or 'audio_data' not in data:
            return jsonify({'error': 'No audio data provided'}), 400
        
        # This is a placeholder - in a real implementation, you'd process the audio
        return jsonify({
            'success': True,
            'message': 'Speech-to-sign conversion is not yet implemented',
            'recognized_text': 'Hello World',  # Placeholder
            'signs': ['H', 'E', 'L', 'L', 'O', 'SPACE', 'W', 'O', 'R', 'L', 'D'],
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Speech-to-sign error: {e}")
        return jsonify({
            'error': 'Speech-to-sign conversion failed',
            'message': str(e)
        }), 500

@app.route('/api/learning-modules', methods=['GET'])
def get_learning_modules():
    """Get available learning modules."""
    modules = [
        {
            'id': 1,
            'title': 'Basic Alphabet',
            'description': 'Learn the sign language alphabet',
            'difficulty': 'beginner',
            'duration': '30 minutes',
            'lessons': 26
        },
        {
            'id': 2,
            'title': 'Common Words',
            'description': 'Learn frequently used words',
            'difficulty': 'intermediate',
            'duration': '45 minutes',
            'lessons': 50
        },
        {
            'id': 3,
            'title': 'Conversation Practice',
            'description': 'Practice conversational sign language',
            'difficulty': 'advanced',
            'duration': '60 minutes',
            'lessons': 20
        }
    ]
    
    return jsonify({
        'success': True,
        'modules': modules,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/practice-tests', methods=['GET'])
def get_practice_tests():
    """Get available practice tests."""
    tests = [
        {
            'id': 1,
            'title': 'Alphabet Recognition',
            'description': 'Test your knowledge of sign language alphabet',
            'questions': 10,
            'time_limit': 300  # 5 minutes
        },
        {
            'id': 2,
            'title': 'Word Recognition',
            'description': 'Test your word recognition skills',
            'questions': 15,
            'time_limit': 600  # 10 minutes
        }
    ]
    
    return jsonify({
        'success': True,
        'tests': tests,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/avatar-animations', methods=['GET'])
def get_avatar_animations():
    """Get available 3D avatar animations."""
    animations = [
        {
            'id': 1,
            'name': 'Hello',
            'description': 'Greeting gesture',
            'duration': 2.0,
            'difficulty': 'easy'
        },
        {
            'id': 2,
            'name': 'Thank You',
            'description': 'Expression of gratitude',
            'duration': 1.5,
            'difficulty': 'easy'
        },
        {
            'id': 3,
            'name': 'Goodbye',
            'description': 'Farewell gesture',
            'duration': 2.5,
            'difficulty': 'medium'
        }
    ]
    
    return jsonify({
        'success': True,
        'animations': animations,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/offline-data', methods=['GET'])
def get_offline_data():
    """Get data for offline mode."""
    offline_data = {
        'basic_signs': [
            {'sign': 'A', 'description': 'First letter of alphabet'},
            {'sign': 'B', 'description': 'Second letter of alphabet'},
            {'sign': 'C', 'description': 'Third letter of alphabet'},
            {'sign': 'HELLO', 'description': 'Common greeting'},
            {'sign': 'THANK YOU', 'description': 'Expression of gratitude'},
            {'sign': 'YES', 'description': 'Affirmative response'},
            {'sign': 'NO', 'description': 'Negative response'}
        ],
        'common_words': [
            'hello', 'thank you', 'please', 'sorry', 'yes', 'no',
            'help', 'water', 'food', 'home', 'family', 'friend'
        ]
    }
    
    return jsonify({
        'success': True,
        'data': offline_data,
        'timestamp': datetime.now().isoformat()
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print("🚀 Starting Sign Language Recognition API...")
    print(f"📊 Recognition available: {RECOGNITION_AVAILABLE}")
    print("🌐 API will be available at: http://localhost:5000")
    print("📋 Available endpoints:")
    print("   - GET  /api/health")
    print("   - POST /api/recognize")
    print("   - POST /api/text-to-sign")
    print("   - POST /api/speech-to-sign")
    print("   - GET  /api/learning-modules")
    print("   - GET  /api/practice-tests")
    print("   - GET  /api/avatar-animations")
    print("   - GET  /api/offline-data")
    print("\nPress Ctrl+C to stop the server")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
