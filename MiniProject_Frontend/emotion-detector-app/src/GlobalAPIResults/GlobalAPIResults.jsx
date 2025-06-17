// This file acts as a singleton store for global API results

// Internal state
let globalEmotionResultText = null;
let voiceEmotionResult = null;
let mentalHealthResult = null;

// Listeners
const listeners = new Set();

const notifyListeners = () => {
  for (const listener of listeners) {
    listener(getAllResults());
  }
};

// Setters
export const setTextEmotionResult = (result) => {
  globalEmotionResultText = result;
  notifyListeners();
};

export const setVoiceEmotionResult = (result) => {
  voiceEmotionResult = result;
  notifyListeners();
};

export const setMentalHealthResult = (result) => {
  mentalHealthResult = result;
  notifyListeners();
};

// Getters
export const getTextEmotionResult = () => globalEmotionResultText;
export const getVoiceEmotionResult = () => voiceEmotionResult;
export const getMentalHealthResult = () => mentalHealthResult;

// Get all results
export const getAllResults = () => ({
  textEmotion: globalEmotionResultText,
  voiceEmotion: voiceEmotionResult,
  mentalHealth: mentalHealthResult,
});

// Clear all
export const clearAllResults = () => {
  globalEmotionResultText = null;
  voiceEmotionResult = null;
  mentalHealthResult = null;
  notifyListeners();
};

// Subscribe to changes
export const subscribeToResults = (callback) => {
  listeners.add(callback);
  return () => listeners.delete(callback); // Unsubscribe
};
