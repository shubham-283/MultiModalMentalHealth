import React, { useState } from "react";
import { predictEmotionFromText } from "../Services/EmotionTextAPI";

function TextEmotionDetector() {
  const [text, setText] = useState("");
  const [emotionResult, setEmotionResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setError("Please enter some text.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setEmotionResult(null);
      const data = await predictEmotionFromText(text);
      setEmotionResult(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const emotionEmojis = {
    sad: "😢",
    angry: "😠",
    fear: "😨",
    surprise: "😲",
    love: "❤️",
    joy: "😄",
  };

  const getEmotionEmoji = (emotion) => {
    return emotionEmojis[emotion?.toLowerCase()] || "🔍";
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl">
      <div className="flex items-center justify-center mb-6">
        <div className="bg-indigo-100 p-3 rounded-full">
          <span className="text-3xl">🧠</span>
        </div>
        <h2 className="text-2xl font-bold ml-3 text-indigo-800">Emotion Detector</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows="4"
            placeholder="How are you feeling today? Share your thoughts..."
            className="w-full border border-indigo-200 rounded-lg p-4 resize-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none transition"
          />
          <div className="absolute bottom-3 right-3 text-gray-400 text-sm">
            {text.length} characters
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-3 w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-all transform hover:scale-[1.02] flex items-center justify-center font-medium disabled:opacity-70"
        >
          {loading ? (
            <>
              <span className="animate-pulse mr-2">⏳</span> Analyzing...
            </>
          ) : (
            <>Detect Emotion</>
          )}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center">
          <span className="mr-2">⚠️</span> {error}
        </div>
      )}

      {emotionResult && emotionResult.predicted_emotion && (
        <div className="mt-6 p-6 bg-white rounded-xl shadow-md text-center border-t-4 border-indigo-500 transform transition-all">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Detected Emotion</h3>
          <div className="text-4xl mb-2">
            {getEmotionEmoji(emotionResult.predicted_emotion)}
          </div>
          <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
            {emotionResult.predicted_emotion.toUpperCase()}
          </p>

          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-1">
              Confidence: {(emotionResult.confidence * 100).toFixed(2)}%
            </p>
            <div className="w-full h-3 bg-indigo-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 transition-all duration-500"
                style={{ width: `${emotionResult.confidence * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 text-center text-xs text-gray-500">
        Enter your text above to analyze the emotional tone
      </div>
    </div>
  );
}

export default TextEmotionDetector;
