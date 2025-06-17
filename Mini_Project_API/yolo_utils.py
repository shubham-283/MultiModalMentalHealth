import os
import cv2
import numpy as np
import json
from ultralytics import YOLO
import time

# Resolve MKL error for some environments
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

# Load model once
model = YOLO('./VideoEmotionModel/best.pt')
CONFIDENCE_THRESHOLD = 0.4

# Emotion labels
emotion_labels = ['anger', 'content', 'disgust', 'fear', 'happy', 'neutral', 'sad', 'surprise']

def detect_yolo(frame):
    """
    Run YOLO on a frame and return annotated frame and detection metadata.
    """
    # Run YOLO inference
    results = model(frame)[0]

    metadata = []

    # Iterate over detections
    for box in results.boxes:
        conf = float(box.conf[0])
        if conf < CONFIDENCE_THRESHOLD:
            continue

        class_id = int(box.cls[0])
        emotion = emotion_labels[class_id] if class_id < len(emotion_labels) else f"Unknown_{class_id}"
        bbox = list(map(float, box.xyxy[0]))

        metadata.append({
            "class_id": class_id,
            "emotion": emotion,
            "confidence": conf,
            "bbox": bbox
        })

    # Plot boxes on frame
    annotated_frame = results.plot()

    return annotated_frame, metadata