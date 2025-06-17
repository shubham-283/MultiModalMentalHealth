import axios from 'axios';
import {
  setVoiceEmotionResult,
  getVoiceEmotionResult,
} from "../GlobalAPIResults/GlobalAPIResults.jsx"; // Adjust path as needed
const BASE_URL = process.env.REACT_APP_BASE_URL;

export const predictVoiceEmotion = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post(`${BASE_URL}/predict-emotion-voice/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Store the result globally
    setVoiceEmotionResult(response.data);

    // Return the result for immediate usage if needed
    return response.data;
  } catch (error) {
    console.error("Voice emotion prediction failed:", error);
    throw new Error("Voice emotion prediction failed. Please try again.");
  }
};

// Usage example elsewhere:
// const voiceResult = getVoiceEmotionResult();
