import React, { useState } from 'react';
import { Upload, Mic, Loader2 } from 'lucide-react';
import { predictVoiceEmotion } from '../Services/EmotionVoiceAPI'; // 👈 Import API function

const VoiceEmotionPredictor = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setPrediction(null);
    setError('');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an audio file first.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const result = await predictVoiceEmotion(selectedFile); // 👈 Use the separated API logic
      setPrediction(result);
    } catch (err) {
      console.error(err);
      setError('Failed to get prediction. Please check the server.');
    } finally {
      setLoading(false);
    }
  };

  const getEmotionEmoji = (emotion) => {
    const emojiMap = {
      happy: '😊',
      sad: '😢',
      angry: '😠',
      neutral: '😐',
      surprised: '😲',
      fearful: '😨',
      disgusted: '🤢',
    };
    return emojiMap[emotion?.toLowerCase()] || '🎭';
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-indigo-600 py-4 px-6">
        <div className="flex items-center justify-center space-x-2">
          <Mic className="h-6 w-6 text-white" />
          <h2 className="text-xl font-bold text-white">Voice Emotion Detector</h2>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="relative">
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="border-2 border-dashed border-indigo-300 rounded-lg p-6 flex flex-col items-center justify-center bg-white">
            <Upload className="h-8 w-8 text-indigo-500 mb-2" />
            <p className="text-sm text-gray-600 text-center">
              {selectedFile ? selectedFile.name : 'Drop your audio file here or click to browse'}
            </p>
            {selectedFile && (
              <span className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleUpload}
          disabled={loading}
          className="w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-md disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="h-5 w-5 mr-2" />
              Analyze Emotion
            </>
          )}
        </button>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {prediction && (
          <div className="bg-white rounded-xl shadow-md p-6 border border-indigo-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Analysis Results</h3>
              <div className="text-4xl">
                {getEmotionEmoji(prediction.emotion)}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 mb-1">Detected Emotion</p>
                <p className="text-lg font-medium text-indigo-700">{prediction.emotion}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Confidence</p>
                <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-indigo-600"
                    style={{ width: `${prediction.confidence * 100}%` }}
                  />
                </div>
                <p className="text-right text-sm font-medium mt-1">{(prediction.confidence * 100).toFixed(2)}%</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceEmotionPredictor;
