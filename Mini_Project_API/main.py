from fastapi import FastAPI, Request, UploadFile, File, Response, HTTPException,WebSocket,WebSocketDisconnect
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from yolo_utils import detect_yolo
import cv2
import numpy as np

from mental_health_predictor import predict_mental_health_status,device
from pydantic import BaseModel


app = FastAPI()

# Allow all origins for testing (restrict for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get("/")
def root():
    return {"message": "YOLO Object Detection API is running!"}




@app.post("/predict-emotion-voice/")
async def predict_emotion(file: UploadFile = File(...)):
    file_format = file.filename.split('.')[-1].lower()
    file_bytes = await file.read()
    emotion, confidence = process_audio_file(file_bytes, file_format)
    
    if emotion is None:
        return {"error": "Failed to process audio file"}
    
    return {"emotion": emotion, "confidence": confidence}

    



# Pydantic model for request validation
class InputText(BaseModel):
    text: str

@app.post("/predict-mental-health")
async def predict_mental_health(input: InputText):
    try:
        result = predict_mental_health_status(input.text)
        return {"result": result}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

# Add a basic health check endpoint ---- for api testing only
@app.get("/health")
async def health_check():
    return {"status": "healthy", "model_device": str(device)}






#voice
from fastapi import FastAPI, File, UploadFile
from emotion_voice import process_audio_file,capture_and_predict_live

from fastapi import FastAPI, UploadFile, File



@app.post("/predict-emotion-voice/")
async def predict_emotion(file: UploadFile = File(...)):
    # Get file format from filename
    file_format = file.filename.split('.')[-1].lower()
    
    # Read file bytes
    file_bytes = await file.read()
    
    # Process the audio and get prediction
    emotion, confidence = process_audio_file(file_bytes, file_format)
    
    if emotion is None:
        return {"error": "Failed to process audio file"}
    
    return {
        "emotion": emotion,
        "confidence": confidence
    }
    
  
  
  
  
  
    
from fastapi.responses import JSONResponse
import uvicorn


# For testing only
@app.get("/predict-live-audio")
def predict_live_audio():
    emotion, confidence = capture_and_predict_live()
    if emotion is None:
        return JSONResponse(status_code=500, content={"error": "Failed to capture or predict audio"})
    return {
        "predicted_emotion": emotion,
        "confidence": round(confidence, 4)
    }
    



import base64
import time

    
 
from collections import Counter
from ultralytics import YOLO
# Load YOLO model
model = YOLO(r"C:\My_Drive\MiniProjectCodes\best.pt")
CONFIDENCE_THRESHOLD = 0.4
emotion_labels = ['anger', 'content', 'disgust', 'fear', 'happy', 'neutral', 'sad', 'surprise']

stop_stream = False
emotion_summary = Counter()

@app.get("/start")
def start_stream():
    global stop_stream, emotion_summary
    stop_stream = False
    emotion_summary.clear()
    return {"status": "started"}

@app.get("/video-emotion-detection")
def video_feed():
    def generate():
        global stop_stream, emotion_summary
        cap = cv2.VideoCapture(0)

        if not cap.isOpened():
            return

        while not stop_stream:
            ret, frame = cap.read()
            if not ret:
                break

            results = model(frame)[0]

            for box in results.boxes:
                if box.conf[0] >= CONFIDENCE_THRESHOLD:
                    cls = int(box.cls[0])
                    if cls < len(emotion_labels):
                        label = emotion_labels[cls]
                        emotion_summary[label] += 1
                        x1, y1, x2, y2 = map(int, box.xyxy[0])
                        # Draw annotations
                        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                        cv2.putText(frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)

                        # Reduce frame size proportionally (same aspect ratio)
                        scale_percent = 80  # You can try 50, 40, etc.
                        width = int(frame.shape[1] * scale_percent / 100)
                        height = int(frame.shape[0] * scale_percent / 100)
                        frame = cv2.resize(frame, (width, height), interpolation=cv2.INTER_AREA)

            _, jpeg = cv2.imencode('.jpg', frame)
            frame_bytes = jpeg.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

        cap.release()

    return StreamingResponse(generate(), media_type="multipart/x-mixed-replace; boundary=frame")

@app.get("/stop")
def stop_streaming():
    global stop_stream
    stop_stream = True
    return JSONResponse(content={
        "status": "stopped",
        "summary": dict(emotion_summary),
        "total": sum(emotion_summary.values())
    })
    



 
from emotion_text_prediction import EmotionPredictor
# Load model once at startup
predictor = EmotionPredictor()

class TextInput(BaseModel):
    text: str

@app.post("/predict-emotion-text-new")
def predict_emotion(input: TextInput):
    result = predictor.predict(input.text)
    return result
