import React, { useEffect, useState } from 'react';
import { getAllResults, subscribeToResults } from '../GlobalAPIResults/GlobalAPIResults';
import { Smile, Brain, MessageSquare, Volume2, CircleAlert, Gauge } from 'lucide-react';

const SummaryCard = () => {
  const [results, setResults] = useState(getAllResults());
  const [highestEmotion, setHighestEmotion] = useState(window.highestEmotion || {});
  const [happinessScore, setHappinessScore] = useState(50);

  // Calculate happiness score whenever any of the data sources changes
  useEffect(() => {
    const calculateHappinessScore = () => {
      const { textEmotion, voiceEmotion, mentalHealth } = results;
      
      const emotionScores = {
        'joy': 90,
        'happy': 85,
        'content': 75,
        'surprise': 65,
        'neutral': 50,
        'fear': 30,
        'sadness': 20,
        'anger': 10
      };
      
      let score = 50; // Default neutral
      let factors = 0;
      
      // Factor 1: Text emotion
      if (textEmotion?.predicted_emotion) {
        const textScore = emotionScores[textEmotion.predicted_emotion.toLowerCase()] || 50;
        score += textScore * (textEmotion.confidence || 0.5);
        factors += (textEmotion.confidence || 0.5);
      }
      
      // Factor 2: Voice emotion
      if (voiceEmotion?.emotion) {
        const voiceScore = emotionScores[voiceEmotion.emotion.toLowerCase()] || 50;
        score += voiceScore * (voiceEmotion.confidence || 0.5);
        factors += (voiceEmotion.confidence || 0.5);
      }
      
      // Factor 3: Most common emotion (weight by count)
      if (highestEmotion?.emotion) {
        const trendScore = emotionScores[highestEmotion.emotion.toLowerCase()] || 50;
        const trendWeight = Math.min(1, (highestEmotion.count || 0) / 100);
        score += trendScore * trendWeight;
        factors += trendWeight;
      }
      
      // Factor 4: Mental health - lower score if potential concerns detected
      if (mentalHealth) {
        const normalScore = mentalHealth.probability_Normal || 0;
        score = score * (0.5 + normalScore * 0.5);
      }
      
      // Calculate final weighted score
      return factors > 0 ? Math.round(score / (factors + 1)) : 50;
    };

    const newScore = calculateHappinessScore();
    setHappinessScore(newScore);
  }, [results, highestEmotion]); // Dependencies ensure recalculation when either changes

  // Set up subscriptions to data updates
  useEffect(() => {
    // Subscribe to API results changes
    const unsubscribe = subscribeToResults((newResults) => {
      console.log("Updated Results:", newResults);
      // Make sure we're getting a fresh copy rather than a reference
      setResults({...newResults});
    });

    // Set up polling for highestEmotion changes with a more robust check
    const interval = setInterval(() => {
      if (window.highestEmotion) {
        // Deep comparison to avoid unnecessary updates
        const currentHighestEmotion = JSON.stringify(highestEmotion);
        const newHighestEmotion = JSON.stringify(window.highestEmotion);
        
        if (currentHighestEmotion !== newHighestEmotion) {
          console.log("Emotion trend updated:", window.highestEmotion);
          setHighestEmotion({...window.highestEmotion});
        }
      }
    }, 300); // Poll every 300ms

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [highestEmotion]); // Only react to changes in highestEmotion

  const { textEmotion, voiceEmotion, mentalHealth } = results;
  
  // Helper function to determine color based on score
  const getScoreColor = (score) => {
    if (score >= 75) return '#22c55e'; // Green
    if (score >= 50) return '#3b82f6'; // Blue
    if (score >= 30) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };
  
  const scoreColor = getScoreColor(happinessScore);
  
  // Calculate gauge rotation based on score
  const gaugeRotation = (happinessScore / 100) * 180 - 90;
  
  // Get emotion description based on score range
  const getEmotionDescription = (score) => {
    if (score >= 85) return "Very Happy";
    if (score >= 70) return "Happy";
    if (score >= 55) return "Content";
    if (score >= 45) return "Neutral";
    if (score >= 30) return "Concerned";
    if (score >= 15) return "Sad";
    return "Distressed";
  };
  
  // Get concern list from mentalHealth
  const getConcerns = () => {
    if (!mentalHealth) return [];
    
    return Object.entries(mentalHealth)
      .filter(([key, value]) => key.startsWith('probability_') && key !== 'probability_Normal' && value > 0.01)
      .sort((a, b) => b[1] - a[1])
      .map(([key, value]) => ({
        name: key.replace('probability_', ''),
        probability: value
      }));
  };
  
  const concerns = getConcerns();
  
  // Animation for score updates
  const [prevScore, setPrevScore] = useState(happinessScore);
  const [isScoreIncreasing, setIsScoreIncreasing] = useState(null);
  
  useEffect(() => {
    if (prevScore !== happinessScore) {
      setIsScoreIncreasing(happinessScore > prevScore);
      setPrevScore(happinessScore);
      
      // Reset the state after animation
      const timeout = setTimeout(() => {
        setIsScoreIncreasing(null);
      }, 1000);
      
      return () => clearTimeout(timeout);
    }
  }, [happinessScore, prevScore]);
  
  // Get color for concern severity
  const getConcernColor = (probability) => {
    if (probability >= 0.75) return 'bg-red-500';
    if (probability >= 0.5) return 'bg-orange-500';
    if (probability >= 0.25) return 'bg-amber-500';
    return 'bg-yellow-500';
  };
  
  return (
    <div className="bg-gray-50 rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-center mb-6">
        <Brain className="text-indigo-600 mr-2" size={28} />
        <h2 className="text-2xl font-bold text-gray-800">Emotional & Mental Health Summary</h2>
      </div>
      
      {/* Happiness Gauge */}
      <div className="bg-white rounded-xl p-4 mb-8 shadow-sm">
        <div className="text-center mb-2">
          <h3 className="text-lg font-medium text-gray-700 flex items-center justify-center">
            <Gauge className="mr-2" size={20} />
            Happiness Level
          </h3>
        </div>
        
        <div className="relative h-40 w-64 mx-auto">
          {/* Gauge background */}
          <div className="absolute h-32 w-64 overflow-hidden rounded-t-full bg-gray-100">
            {/* Color segments */}
            <div className="absolute h-32 w-32 -left-16 rounded-tr-full bg-red-200"></div>
            <div className="absolute h-32 w-16 left-16 bg-amber-200"></div>
            <div className="absolute h-32 w-16 left-32 bg-blue-200"></div>
            <div className="absolute h-32 w-32 left-48 rounded-tl-full bg-green-200"></div>
          </div>
          
          {/* Gauge indicator */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div 
              className="absolute bottom-0 left-32 h-28 w-1 bg-gray-800 origin-bottom transition-transform duration-700"
              style={{ transform: `rotate(${gaugeRotation}deg)` }}
            >
              <div className="w-5 h-5 rounded-full bg-gray-800 border-2 border-white shadow-md -ml-2 -mt-2.5"></div>
            </div>
          </div>
          
          {/* Gauge markers */}
          <div className="absolute top-4 left-5 text-xs text-red-600 font-medium">Distressed</div>
          <div className="absolute top-4 right-5 text-xs text-green-600 font-medium">Very Happy</div>
          
          {/* Score display with animation */}
          <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 transition-all duration-500 ${
            isScoreIncreasing === true ? 'scale-110' : 
            isScoreIncreasing === false ? 'scale-90' : ''
          }`}>
            <div className="text-3xl font-bold mb-1 text-center" style={{ color: scoreColor }}>
              {happinessScore}%
            </div>
            <div className="text-sm font-medium text-gray-600 text-center">
              {getEmotionDescription(happinessScore)}
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Overall Emotion Trend */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-indigo-100">
          <h3 className="flex items-center text-lg font-medium text-indigo-700 mb-3">
            <Smile className="mr-2" size={18} />
            Facial Analysis
          </h3>
          
          {highestEmotion && highestEmotion.emotion ? (
            <div className="bg-indigo-50 rounded-md p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Most Common:</span>
                <span className="font-semibold text-gray-800 capitalize">{highestEmotion.emotion}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Frequency:</span>
                <div className="bg-indigo-100 px-2 py-1 rounded-md font-medium">
                  {highestEmotion.count || 0} times
                </div>
              </div>
              
              {/* Trend visualization */}
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (highestEmotion.count || 0))}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500 italic">No data available</div>
          )}
        </div>
        
        {/* Text Analysis */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
          <h3 className="flex items-center text-lg font-medium text-blue-700 mb-3">
            <MessageSquare className="mr-2" size={18} />
            Text Analysis
          </h3>
          
          {textEmotion ? (
            <div className="bg-blue-50 rounded-md p-3">
              <div className="text-xs text-gray-500 mb-2 line-clamp-1">{textEmotion.text}</div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Emotion:</span>
                <span className="font-semibold text-gray-800 capitalize">{textEmotion.predicted_emotion}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Confidence:</span>
                <div className="bg-blue-100 px-2 py-1 rounded-md font-medium">
                  {((textEmotion.confidence || 0) * 100).toFixed(0)}%
                </div>
              </div>
              
              {/* Confidence visualization */}
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${(textEmotion.confidence || 0) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500 italic">No text analyzed</div>
          )}
        </div>
        
        {/* Voice Analysis */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-green-100">
          <h3 className="flex items-center text-lg font-medium text-green-700 mb-3">
            <Volume2 className="mr-2" size={18} />
            Voice Analysis
          </h3>
          
          {voiceEmotion ? (
            <div className="bg-green-50 rounded-md p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Detected:</span>
                <span className="font-semibold text-gray-800">{voiceEmotion.emotion}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Confidence:</span>
                <div className="bg-green-100 px-2 py-1 rounded-md font-medium">
                  {((voiceEmotion.confidence || 0) * 100).toFixed(0)}%
                </div>
              </div>
              
              {/* Confidence visualization */}
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-green-600 h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${(voiceEmotion.confidence || 0) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500 italic">No voice analyzed</div>
          )}
        </div>
        
        {/* Mental Health */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-amber-100">
          <h3 className="flex items-center text-lg font-medium text-amber-700 mb-3">
            <Brain className="mr-2" size={18} />
            Mental Health Status
          </h3>
          
          {mentalHealth ? (
            <div className="bg-amber-50 rounded-md p-3">
              {mentalHealth.statement && (
                <div className="text-xs text-gray-500 mb-2 line-clamp-1">{mentalHealth.statement}</div>
              )}
              
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Status:</span>
                <span className={`font-semibold px-2 py-0.5 rounded ${
                  mentalHealth.predicted_status === 'Normal' 
                    ? 'text-green-800 bg-green-100' 
                    : 'text-amber-800 bg-amber-100'
                }`}>
                  {mentalHealth.predicted_status || 'Unknown'}
                </span>
              </div>
              
              {/* Normal probability visualization */}
              <div className="mt-3 mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>Normal state:</span>
                  <span>{((mentalHealth.probability_Normal || 0) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${(mentalHealth.probability_Normal || 0) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              {concerns && concerns.length > 0 && (
                <div className="mt-3 pt-2 border-t border-amber-200">
                  <div className="text-gray-600 text-sm font-medium mb-2">Potential concerns:</div>
                  {concerns.map((item, index) => (
                    <div key={index} className="mb-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <div className="flex items-center">
                          <CircleAlert size={12} className="text-amber-500 mr-1" />
                          <span>{item.name}:</span>
                        </div>
                        <span>{(item.probability * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`${getConcernColor(item.probability)} h-1.5 rounded-full transition-all duration-500`}
                          style={{ width: `${item.probability * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-500 italic">No data available</div>
          )}
        </div>
      </div>
      
      {/* Last update indicator */}
      <div className="mt-4 text-xs text-gray-400 text-right">
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default SummaryCard;