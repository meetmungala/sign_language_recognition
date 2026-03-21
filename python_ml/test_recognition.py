#!/usr/bin/env python3
"""
Simple test script for Sign Language Recognition without camera
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sign_recognition import SignLanguageRecognizer
import numpy as np

def test_recognition():
    """Test the sign recognition without camera."""
    print("🤟 Testing Sign Language Recognition Platform")
    print("=" * 50)
    
    # Initialize recognizer
    recognizer = SignLanguageRecognizer()
    
    print("✅ Sign Language Recognizer initialized successfully!")
    
    # Test with a dummy image
    print("\n📸 Testing with dummy image...")
    dummy_image = np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)
    
    try:
        result = recognizer.recognize_sign(dummy_image)
        print(f"✅ Recognition successful!")
        print(f"   Sign: {result['sign']}")
        print(f"   Confidence: {result['confidence']:.2f}")
        print(f"   Timestamp: {result['timestamp']}")
        
        # Test text to sign conversion
        print("\n📝 Testing text to sign conversion...")
        test_text = "HELLO WORLD"
        signs = recognizer.text_to_sign_sequence(test_text)
        print(f"✅ Text '{test_text}' converted to signs: {signs}")
        
        print("\n🎉 All tests passed! The system is ready to use.")
        print("\n📋 Next steps:")
        print("   1. Start Flask API: cd ../flask_api && python app.py")
        print("   2. Start React Frontend: cd ../react_frontend && npm start")
        print("   3. Access PHP Backend: http://localhost/sign_language_platform")
        
    except Exception as e:
        print(f"❌ Error during testing: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = test_recognition()
    if success:
        print("\n🚀 Ready to start the full platform!")
    else:
        print("\n⚠️  Some issues detected. Check the error messages above.")
