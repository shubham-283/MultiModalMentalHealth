import axios from "axios";
import { setMentalHealthResult, getMentalHealthResult } from "../GlobalAPIResults/GlobalAPIResults"; // Adjust path if needed

const BASE_URL = process.env.REACT_APP_BASE_URL;

export const predictMentalHealth = async (text) => {
  try {
    const response = await axios.post(`${BASE_URL}/predict-mental-health`, {
      text: text.trim(),
    });

    const result = response.data.result[0];

    // Store result in global state
    setMentalHealthResult(result);

    return result;
  } catch (error) {
    console.error("API Error (predictMentalHealth):", error);
    throw new Error("Mental health prediction failed. Please try again.");
  }
};

// Usage elsewhere:
// const result = getMentalHealthResult();
