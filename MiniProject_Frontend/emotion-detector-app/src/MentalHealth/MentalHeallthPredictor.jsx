import React, { useState } from "react";
import { predictEmotionFromText } from "../Services/EmotionTextAPI";
import { predictMentalHealth } from "../Services/MentalHealthAPI";
import { 
  Loader2, AlertCircle, Brain, HeartPulse, 
  ChevronRight, Check, MessageSquare, BarChart4,
  InfoIcon, Shield, ExternalLink
} from "lucide-react";

const EmotionMentalHealthAnalyzer = () => {
  const [text, setText] = useState("");
  const [emotionResult, setEmotionResult] = useState(null);
  const [mentalHealthResult, setMentalHealthResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  const emotionEmojis = {
    sad: "😢",
    angry: "😠",
    fear: "😨",
    surprise: "😲",
    love: "❤️",
    joy: "😄",
    neutral: "😐",
  };

  const accentColors = {
    sad: "text-blue-800 bg-blue-50 border-blue-200",
    angry: "text-red-800 bg-red-50 border-red-200",
    fear: "text-purple-800 bg-purple-50 border-purple-200",
    surprise: "text-amber-800 bg-amber-50 border-amber-200",
    love: "text-rose-800 bg-rose-50 border-rose-200",
    joy: "text-emerald-800 bg-emerald-50 border-emerald-200",
    neutral: "text-gray-800 bg-gray-50 border-gray-200",
  };

  const getStatusColor = (status) => {
    const colors = {
      Normal: "text-emerald-800 bg-emerald-50 border-emerald-200",
      Anxiety: "text-amber-800 bg-amber-50 border-amber-200",
      Depression: "text-blue-800 bg-blue-50 border-blue-200",
      Suicidal: "text-red-800 bg-red-50 border-red-200",
      Stress: "text-orange-800 bg-orange-50 border-orange-200",
      Bipolar: "text-purple-800 bg-purple-50 border-purple-200",
      "Personality disorder": "text-indigo-800 bg-indigo-50 border-indigo-200",
    };
    return colors[status] || "text-gray-800 bg-gray-50 border-gray-200";
  };

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError("Please share your thoughts to receive an assessment.");
      return;
    }

    setError("");
    setLoading(true);
    setEmotionResult(null);
    setMentalHealthResult(null);
    setAnalyzed(false);

    try {
      const [emotionData, mentalData] = await Promise.all([
        predictEmotionFromText(text),
        predictMentalHealth(text),
      ]);
      setEmotionResult(emotionData);
      setMentalHealthResult(mentalData);
      setAnalyzed(true);
    } catch (err) {
      console.error(err);
      setError("Analysis service unavailable. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const getEmotionDescription = (emotion) => {
    const descriptions = {
      sad: "Analysis indicates feelings of sadness or melancholy.",
      angry: "Analysis indicates feelings of frustration or anger.",
      fear: "Analysis indicates feelings of anxiety or apprehension.",
      surprise: "Analysis indicates feelings of surprise or astonishment.",
      love: "Analysis indicates feelings of affection or positive connection.",
      joy: "Analysis indicates feelings of happiness or contentment.",
      neutral: "Analysis indicates a balanced or neutral emotional state.",
    };
    return descriptions[emotion.toLowerCase()] || "Analysis indicates complex emotional states.";
  };

  const tips = [
    "Provide context about your current situation for more accurate analysis",
    "Include both thoughts and physical sensations in your description",
    "Be specific about the duration and intensity of your feelings",
    "Mention any triggering events or circumstances if applicable"
  ];

  return (
    <div className="max-w-4xl mx-auto my-10 rounded-lg shadow-md overflow-hidden bg-white border border-gray-200">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 mb-1 flex items-center">
              <BarChart4 className="mr-2 text-blue-700" size={24} />
              Emotional & Mental Health Assessment
            </h1>
            <p className="text-gray-600 max-w-lg">
              Professional analysis of emotional patterns and mental well-being indicators
            </p>
          </div>
          <div className="hidden md:flex items-center border-l border-gray-200 pl-4">
            <div className="flex items-center mr-4">
              <Brain className="text-blue-700 mr-2" size={20} />
              <span className="text-gray-700">Emotion Analysis</span>
            </div>
            <div className="flex items-center">
              <HeartPulse className="text-blue-700 mr-2" size={20} />
              <span className="text-gray-700">Mental Health</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 bg-gray-50">
        {/* Input Section */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <label htmlFor="thoughtsInput" className="font-medium text-gray-700 flex items-center">
              <MessageSquare size={18} className="mr-2 text-blue-700" />
              Express your thoughts and feelings
            </label>
            <button 
              onClick={() => setShowTips(!showTips)}
              className="text-sm text-blue-700 hover:text-blue-900 flex items-center"
            >
              <InfoIcon size={16} className="mr-1" />
              {showTips ? "Hide guidance" : "View guidance"}
            </button>
          </div>
          
          {showTips && (
            <div className="bg-blue-50 border-l-4 border-blue-700 p-4 rounded mb-4 text-sm">
              <h4 className="font-medium text-blue-900 mb-2">For optimal assessment accuracy:</h4>
              <ul className="space-y-2">
                {tips.map((tip, index) => (
                  <li key={index} className="flex items-start">
                    <Check size={16} className="mr-2 text-blue-700 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <textarea
            id="thoughtsInput"
            rows="5"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Please describe your current emotional state and any relevant thoughts or experiences..."
            className="w-full border border-gray-300 rounded p-4 resize-none focus:ring-1 focus:ring-blue-700 focus:border-blue-700 transition text-gray-700"
          />
          
          <div className="flex justify-between items-center mt-2">
            <div className="text-sm text-gray-500">
              {text.length} characters
            </div>
            <div className="text-sm text-gray-500">
              {text.split(/\s+/).filter(Boolean).length} words
            </div>
          </div>
        </div>

        {/* Button Section */}
        <button
          onClick={handleAnalyze}
          disabled={loading || !text.trim()}
          className={`w-full py-3 px-6 rounded font-medium transition-all flex items-center justify-center
            ${loading || !text.trim()
              ? "bg-gray-200 cursor-not-allowed text-gray-500 border border-gray-300"
              : "bg-blue-700 text-white hover:bg-blue-800 border border-blue-800"}
          `}
        >
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin mr-2" />
              Processing assessment...
            </>
          ) : (
            <>
              Generate Assessment Report
              <ChevronRight size={18} className="ml-2" />
            </>
          )}
        </button>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded flex items-center">
            <AlertCircle className="mr-2 flex-shrink-0" size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Results Section */}
        {analyzed && (
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <BarChart4 className="mr-2 text-blue-700" size={20} />
                Assessment Results
              </h2>
              <div className="text-sm text-gray-500">
                {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString()}
              </div>
            </div>
            
            {/* Results Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Emotion Result Card */}
              {emotionResult && emotionResult.predicted_emotion && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-blue-700 text-white px-4 py-3 font-medium flex items-center">
                    <Brain className="mr-2" size={18} />
                    Emotional Assessment
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-center mb-5">
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Primary Emotion</div>
                        <div className="text-xl font-medium text-gray-800 flex items-center">
                          <span className="capitalize">{emotionResult.predicted_emotion.toLowerCase()}</span>
                          <span className="ml-2 text-2xl" role="img" aria-label={emotionResult.predicted_emotion}>
                            {emotionEmojis[emotionResult.predicted_emotion.toLowerCase()] || "🔍"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Confidence</div>
                        <div className="text-xl font-medium text-gray-800">
                          {(emotionResult.confidence * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-full h-2 bg-gray-100 rounded overflow-hidden mb-4">
                      <div
                        className="h-full bg-blue-700 transition-all duration-1000 ease-out"
                        style={{ width: `${emotionResult.confidence * 100}%` }}
                      ></div>
                    </div>
                    
                    <div className={`p-3 rounded text-sm ${accentColors[emotionResult.predicted_emotion.toLowerCase()] || "text-gray-800 bg-gray-50 border-gray-200"}`}>
                      <p>{getEmotionDescription(emotionResult.predicted_emotion)}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Mental Health Assessment Card */}
              {mentalHealthResult && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-blue-700 text-white px-4 py-3 font-medium flex items-center">
                    <HeartPulse className="mr-2" size={18} />
                    Mental Health Indicators
                  </div>
                  <div className="p-5">
                    <div className="text-sm text-gray-500 mb-2">Based on statement analysis</div>
                    <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-4 text-sm text-gray-700">
                      "{mentalHealthResult.statement}"
                    </div>
                    
                    <div className="mb-4">
                      <div className="text-sm text-gray-500 mb-2">Assessment Classification</div>
                      <div className={`inline-block px-3 py-2 rounded font-medium text-sm ${getStatusColor(mentalHealthResult.predicted_status)}`}>
                        {mentalHealthResult.predicted_status}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 border-t border-gray-200">
                    <div className="flex items-start gap-2">
                      <InfoIcon size={16} className="text-blue-700 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-600">
                        This automated assessment should not replace professional medical advice. 
                        Consult with a qualified healthcare provider for definitive diagnoses.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Resources Section */}
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm mt-6">
              <div className="flex items-center mb-4">
                <Shield className="text-blue-700 mr-2" size={20} />
                <h3 className="font-medium text-gray-800">Professional Resources</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="border border-gray-200 rounded p-3">
                  <div className="font-medium text-gray-800 mb-1">Crisis Support Services</div>
                  <p className="text-sm text-gray-600 mb-2">24/7 professional support for immediate concerns</p>
                  <a href="#" className="text-sm text-blue-700 flex items-center hover:underline">
                    Access Services <ExternalLink size={14} className="ml-1" />
                  </a>
                </div>
                <div className="border border-gray-200 rounded p-3">
                  <div className="font-medium text-gray-800 mb-1">Mental Health Professionals</div>
                  <p className="text-sm text-gray-600 mb-2">Find qualified therapists and counselors</p>
                  <a href="#" className="text-sm text-blue-700 flex items-center hover:underline">
                    Provider Directory <ExternalLink size={14} className="ml-1" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="bg-white p-4 border-t border-gray-200">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <div>Emotional & Mental Health Assessment Tool</div>
          <div className="flex items-center">
            <Shield size={14} className="mr-1" />
            <span>Privacy Protected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmotionMentalHealthAnalyzer;