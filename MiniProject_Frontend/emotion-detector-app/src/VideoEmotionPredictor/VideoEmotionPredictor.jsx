import React, { useState, useEffect, useRef } from 'react';
import { Camera, Square, BarChart2, Award, Timer } from 'lucide-react';
import { startEmotionDetection, stopEmotionDetection, getVideoFeedUrl } from '../Services/EmotionVideoAPI';

// Global variable to store highest emotion data
window.highestEmotion = {
  emotion: "",
  count: 0
};

// Prioritized emotions (neutral will be deprioritized)
const emotionPriority = {
  happy: 1.2,
  sad: 1.1,
  angry: 1.15,
  surprised: 1.1,
  neutral: 0.5,
  fear: 1.1,
  disgust: 1.1
};

const DETECTION_DURATION = 30; // detection duration in seconds

const LiveEmotionViewer = () => {
  const [streaming, setStreaming] = useState(false);
  const [summary, setSummary] = useState(null);
  const [videoSrc, setVideoSrc] = useState('');
  const [highestEmotionDisplay, setHighestEmotionDisplay] = useState({ emotion: "", count: 0 });
  const [processing, setProcessing] = useState(false);
  const [countdown, setCountdown] = useState(DETECTION_DURATION);
  const countdownRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (streaming) {
      setVideoSrc(getVideoFeedUrl());
      setProcessing(true);

      // Start countdown timer
      setCountdown(DETECTION_DURATION);
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Stop stream automatically after DETECTION_DURATION
      timeoutRef.current = setTimeout(() => {
        stopStream();
      }, DETECTION_DURATION * 1000);
    } else {
      setVideoSrc('');
      setProcessing(false);
      clearTimeout(timeoutRef.current);
      clearInterval(countdownRef.current);
    }
  }, [streaming]);

  useEffect(() => {
    if (summary) {
      let highestEmotion = "";
      let highestWeightedCount = 0;

      Object.entries(summary).forEach(([emotion, count]) => {
        const priority = emotionPriority[emotion.toLowerCase()] || 1;
        const weightedCount = count * priority;

        if (weightedCount > highestWeightedCount) {
          highestEmotion = emotion;
          highestWeightedCount = weightedCount;
        }
      });

      if (highestEmotion.toLowerCase() === "neutral" && Object.keys(summary).length > 1) {
        highestEmotion = "";
        highestWeightedCount = 0;

        Object.entries(summary).forEach(([emotion, count]) => {
          if (emotion.toLowerCase() !== "neutral") {
            const priority = emotionPriority[emotion.toLowerCase()] || 1;
            const weightedCount = count * priority;

            if (weightedCount > highestWeightedCount) {
              highestEmotion = emotion;
              highestWeightedCount = weightedCount;
            }
          }
        });
      }

      if (!highestEmotion && summary.neutral) {
        highestEmotion = "neutral";
        highestWeightedCount = summary.neutral;
      }

      window.highestEmotion = {
        emotion: highestEmotion,
        count: summary[highestEmotion] || 0
      };

      setHighestEmotionDisplay({
        emotion: highestEmotion,
        count: summary[highestEmotion] || 0
      });

      console.log("Highest emotion updated:", window.highestEmotion);
    }
  }, [summary]);

  const startStream = async () => {
    try {
      await startEmotionDetection();
      setSummary(null);
      setStreaming(true);
    } catch (error) {
      console.error("Failed to start stream:", error);
      alert("Failed to start stream. Check console for details.");
    }
  };

  const stopStream = async () => {
    try {
      const res = await stopEmotionDetection();
      setSummary(res.data.summary || {});
      setStreaming(false);
    } catch (error) {
      console.error("Failed to stop stream:", error);
      alert("Failed to stop stream. Check console for details.");
    }
  };

  const getEmotionColor = (emotion) => {
    const colors = {
      happy: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      sad: 'bg-blue-100 text-blue-800 border-blue-300',
      angry: 'bg-red-100 text-red-800 border-red-300',
      surprised: 'bg-purple-100 text-purple-800 border-purple-300',
      neutral: 'bg-gray-100 text-gray-800 border-gray-300',
      fear: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      disgust: 'bg-green-100 text-green-800 border-green-300'
    };
    return colors[emotion.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  return (
    <div className="w-full md:max-w-6xl mx-auto md:ml-0 p-4 md:p-6 bg-gray-50 rounded-lg shadow-xl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-300 pb-4 mb-6">
        <div className="mb-4 md:mb-0">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center">
            <Camera className="mr-2 text-blue-600" />
            Live Emotion Detection
          </h2>
          <p className="text-sm md:text-base text-gray-600 mt-1">Real-time facial emotion analysis system</p>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <button
            onClick={startStream}
            disabled={streaming}
            className={`flex items-center justify-center px-4 md:px-6 py-2 md:py-3 rounded-md font-bold text-base md:text-lg shadow-lg border-2 ${
              streaming 
                ? 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700 text-white border-green-700 hover:border-green-800 transition-all transform hover:scale-105'
            }`}
          >
            <Camera className="mr-2 h-4 w-4 md:h-5 md:w-5" />
            {streaming ? "Running" : "Start Detection"}
          </button>

          <button
            onClick={stopStream}
            disabled={!streaming}
            className={`flex items-center justify-center px-4 md:px-6 py-2 md:py-3 rounded-md font-bold text-base md:text-lg shadow-lg border-2 ${
              !streaming 
                ? 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed' 
                : 'bg-red-600 hover:bg-red-700 text-white border-red-700 hover:border-red-800 transition-all transform hover:scale-105'
            }`}
          >
            <Square className="mr-2 h-4 w-4 md:h-5 md:w-5" />
            Stop Detection
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
        <div className="w-full lg:w-2/3">
          <div className="bg-gray-900 rounded-lg p-2 md:p-3 h-64 md:h-96 flex items-center justify-center shadow-md">
            {streaming && videoSrc ? (
              <img
                src={videoSrc}
                alt="Live Video Feed"
                className="max-h-full object-contain rounded"
                key={videoSrc}
              />
            ) : (
              <div className="text-center">
                <Camera className="mx-auto h-12 w-12 md:h-16 md:w-16 text-gray-400" />
                <p className="mt-4 text-gray-300 text-base md:text-lg">Video feed inactive</p>
                <p className="text-gray-400 text-xs md:text-sm mt-2">Press the green "Start Detection" button to view camera feed</p>
              </div>
            )}
          </div>
          
          <div className="mt-2 md:mt-3 flex items-center justify-between p-2 bg-white rounded-md shadow-sm">
            <div className={`flex items-center`}>
              <div className={`w-3 h-3 md:w-4 md:h-4 rounded-full mr-2 ${streaming ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className={`text-xs md:text-sm font-medium ${streaming ? 'text-green-700' : 'text-red-700'}`}>
                {streaming ? 'Camera active - Processing video feed' : 'Camera inactive - Press Start Detection'}
              </span>
            </div>
            {streaming && (
              <div className="flex items-center text-sm md:text-base text-gray-700">
                <Timer className="mr-1 h-4 w-4" />
                {countdown}s left
              </div>
            )}
          </div>
        </div>

        <div className="w-full lg:w-1/3 bg-white rounded-lg p-3 md:p-4 shadow-md">
          <div className="flex items-center border-b border-gray-200 pb-2 md:pb-3 mb-3 md:mb-4">
            <BarChart2 className="text-blue-600 mr-2 h-4 w-4 md:h-5 md:w-5" />
            <h3 className="text-base md:text-lg font-semibold text-gray-800">Analysis Results</h3>
          </div>
          
          {summary ? (
            <div className="space-y-2 md:space-y-3">
              {highestEmotionDisplay.emotion && (
                <div className="mb-3 md:mb-4 p-3 md:p-4 border-2 border-dashed rounded-lg bg-blue-50 border-blue-300">
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center text-blue-700 font-bold">
                      <Award className="mr-1 h-4 w-4 md:h-5 md:w-5 text-blue-600" /> 
                      Dominant Emotion
                    </span>
                  </div>
                  <div className={`mt-1 rounded-lg border-2 px-3 md:px-4 py-2 md:py-3 flex justify-between items-center font-bold ${getEmotionColor(highestEmotionDisplay.emotion)}`}>
                    <div className="flex items-center">
                      <span className="text-base md:text-lg capitalize">{highestEmotionDisplay.emotion}</span>
                    </div>
                    <span className="text-lg md:text-xl">{highestEmotionDisplay.count}</span>
                  </div>
                </div>
              )}
              {Object.entries(summary).map(([emotion, count]) => (
                <div 
                  key={emotion}
                  className={`rounded-lg border px-3 md:px-4 py-2 md:py-3 flex justify-between items-center ${getEmotionColor(emotion)}`}
                >
                  <span className="font-medium capitalize text-sm md:text-base">{emotion}</span>
                  <span className="text-base md:text-lg font-bold">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 md:py-8 text-gray-500">
              <p className="text-sm md:text-base">No emotion data available yet</p>
              <p className="text-xs md:text-sm mt-2">
                {streaming ? 'Analysis in progress...' : 'Start detection to begin analysis'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveEmotionViewer;
