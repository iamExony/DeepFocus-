# Face Detection Models

This directory contains the TensorFlow.js models used by face-api.js for real-time face detection during focus sessions.

## Models Included

1. **Tiny Face Detector** - Lightweight model optimized for real-time face detection
   - `tiny_face_detector_model-weights_manifest.json`
   - `tiny_face_detector_model-shard1`

2. **Face Landmark 68** - 68-point facial landmark detection
   - `face_landmark_68_model-weights_manifest.json`
   - `face_landmark_68_model-shard1`

## How It Works

The Timer component uses these models to:
- Detect faces in real-time from the webcam feed
- Verify user presence during focus sessions
- Trigger alerts when no face is detected

## Performance

- Detection runs every 1 second
- Input size: 224x224 pixels
- Score threshold: 0.5 (50% confidence)

## Source

Models are from the official face-api.js repository:
https://github.com/justadudewhohacks/face-api.js/tree/master/weights
