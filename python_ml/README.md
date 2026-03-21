# Python ML Backend for Sign Language Recognition

This module handles real-time sign language recognition using TensorFlow/PyTorch and MediaPipe.

## Features

- Real-time gesture recognition from webcam
- Support for multiple sign languages (ASL, ISL, CSL, WLASL)
- Pose estimation and hand tracking
- Model training and inference
- Data preprocessing and augmentation

## Dependencies

- TensorFlow/PyTorch
- MediaPipe
- OpenCV
- NumPy
- Pandas
- Scikit-learn

## Usage

```python
from sign_recognition import SignLanguageRecognizer

recognizer = SignLanguageRecognizer()
result = recognizer.recognize_from_camera()
print(f"Recognized sign: {result}")
```
