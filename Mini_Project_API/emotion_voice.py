import numpy as np
import librosa
import tensorflow as tf
from tensorflow.keras.models import load_model
import io
import soundfile as sf
import wave
import scipy.io.wavfile as wavfile

# Constants
SAMPLE_RATE = 22050
DURATION = 5
MAX_SAMPLES = SAMPLE_RATE * DURATION

# Load model and label encoder
MODEL_PATH = './voicemodel/emotion_recognition_model.keras'
LABEL_ENCODER_PATH = './voicemodel/label_encoder_classes.npy'

model = load_model(MODEL_PATH)
label_classes = np.load(LABEL_ENCODER_PATH)

def extract_features_from_bytes(audio_bytes):
    """
    Extract audio features from raw byte input.
    Accepts audio file bytes (e.g., from API upload) and returns 2D feature array.
    """
    try:
        audio, sample_rate = sf.read(io.BytesIO(audio_bytes))
        if len(audio.shape) > 1:  # stereo to mono
            audio = np.mean(audio, axis=1)
        
        audio = librosa.resample(audio, orig_sr=sample_rate, target_sr=SAMPLE_RATE)
        
        if len(audio) < MAX_SAMPLES:
            audio = np.pad(audio, (0, MAX_SAMPLES - len(audio)), 'constant')
        else:
            audio = audio[:MAX_SAMPLES]
        
        # Extract features
        mfccs = librosa.feature.mfcc(y=audio, sr=SAMPLE_RATE, n_mfcc=13)
        spectral_contrast = librosa.feature.spectral_contrast(y=audio, sr=SAMPLE_RATE)
        chroma = librosa.feature.chroma_stft(y=audio, sr=SAMPLE_RATE)
        mel_spec = librosa.feature.melspectrogram(y=audio, sr=SAMPLE_RATE)
        mel_spec_db = librosa.power_to_db(mel_spec, ref=np.max)
        
        features = np.concatenate([mfccs, spectral_contrast, chroma, mel_spec_db], axis=0)
        return features.T
    
    except Exception as e:
        return None

def convert_using_librosa(file_bytes, file_format):
    """
    Convert audio bytes to WAV format using librosa
    
    Parameters:
    - file_bytes (bytes): The audio file as bytes
    - file_format (str): Format of the audio file
    
    Returns:
    - bytes: WAV format audio bytes
    """
    try:
        # Load audio using librosa
        audio, sample_rate = librosa.load(io.BytesIO(file_bytes), sr=SAMPLE_RATE, mono=True)
        
        # Create a BytesIO object to hold the WAV data
        wav_bytes_io = io.BytesIO()
        
        # Write WAV file to the BytesIO object
        wavfile.write(wav_bytes_io, SAMPLE_RATE, (audio * 32767).astype(np.int16))
        
        # Get the bytes
        wav_bytes_io.seek(0)
        wav_bytes = wav_bytes_io.read()
        
        return wav_bytes
    
    except Exception as e:
        return None

def process_audio_file(file_bytes, file_format):
    """
    Process audio file for emotion recognition, converting format if needed
    
    Parameters:
    - file_bytes (bytes): The audio file as bytes
    - file_format (str): Format of the audio file (wav, mp3, m4a, etc.)
    
    Returns:
    - tuple: (predicted_emotion, confidence)
    """
    try:
        # Check if format is already WAV
        if file_format.lower() == 'wav':
            wav_bytes = file_bytes
        else:
            # Convert to WAV if it's another format
            wav_bytes = convert_using_librosa(file_bytes, file_format.lower())
            if wav_bytes is None:
                return None, None
        
        # Predict emotion using the WAV bytes
        return predict_emotion_from_bytes(wav_bytes)
    
    except Exception as e:
        return None, None

def predict_emotion_from_bytes(audio_bytes):
    """
    Predicts the emotion from audio byte stream (WAV file).
    Returns predicted label and confidence score.
    """
    if model is None or label_classes is None:
        return None, None
    
    features = extract_features_from_bytes(audio_bytes)
    if features is None:
        return None, None
    
    features = np.expand_dims(features, axis=0)
    prediction = model.predict(features, verbose=0)[0]
    predicted_index = np.argmax(prediction)
    predicted_emotion = label_classes[predicted_index]
    confidence = float(prediction[predicted_index])
    
    return predicted_emotion, confidence







import numpy as np
import librosa
import tensorflow as tf
import sounddevice as sd
import wave
import io

def capture_and_predict_live(duration=3, sample_rate=22050):
    """
    Captures live audio from microphone and predicts emotion in real-time.
    
    Parameters:
    - duration (float): Duration in seconds to record (default: 3 seconds)
    - sample_rate (int): Sample rate for audio recording (default: 22050 Hz)
    
    Returns:
    - tuple: (predicted_emotion, confidence)
    """
    try:
        # Record audio
        audio = sd.rec(int(duration * sample_rate), samplerate=sample_rate, channels=1, dtype='float32')
        sd.wait()  # Wait until recording is finished
        
        # Reshape to match expected input
        audio = audio.flatten()
        
        # Ensure audio is the right length
        if len(audio) < sample_rate * duration:
            audio = np.pad(audio, (0, sample_rate * duration - len(audio)), 'constant')
        else:
            audio = audio[:sample_rate * duration]
        
        # Create WAV bytes from audio
        wav_bytes_io = io.BytesIO()
        with wave.open(wav_bytes_io, 'wb') as wav_file:
            wav_file.setnchannels(1)
            wav_file.setsampwidth(2)  # 2 bytes for 'int16'
            wav_file.setframerate(sample_rate)
            wav_file.writeframes((audio * 32767).astype(np.int16).tobytes())
        
        wav_bytes_io.seek(0)
        wav_bytes = wav_bytes_io.read()
        
        # Use the existing function to predict emotion
        return predict_emotion_from_bytes(wav_bytes)
    
    except Exception as e:
        return None, None

# Usage example:
# Install the sounddevice library first: pip install sounddevice
# 
# def main():
#     print("Recording audio for 3 seconds...")
#     emotion, confidence = capture_and_predict_live()
#     if emotion:
#         print(f"Predicted emotion: {emotion} (Confidence: {confidence:.2f})")
#     else:
#         print("Failed to predict emotion")
# 
# if __name__ == "__main__":
#     main()