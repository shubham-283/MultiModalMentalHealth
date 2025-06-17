import axios from "axios";
import { setTextEmotionResult } from "../GlobalAPIResults/GlobalAPIResults"; // Adjust path if needed
const BASE_URL = process.env.REACT_APP_BASE_URL;

export const predictEmotionFromText = async (text) => {
  try {
    const response = await axios.post(`${BASE_URL}/predict-emotion-text-new`, {
      text: text,
    });

    // Store in global result (no need to return the setter itself)
    setTextEmotionResult(response.data);

    // Return the actual result for immediate usage if needed
    return response.data;
  } catch (error) {
    console.error("Text emotion prediction failed:", error);
    throw new Error("Prediction failed. Please try again.");
  }
};
