import MentalHealthPredictor from './MentalHealth/MentalHeallthPredictor.jsx';
import VoiceEmotionPredictor from './VoiceEmotionPredictor/VoiceEmotionPredictor.jsx';
import EmotionDetector from './VideoEmotionPredictor/VideoEmotionPredictor.jsx';
import SummaryResults from './FinalSummary/FinalSummary.jsx';

function App() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-3 sm:px-5">
      <div className="w-full mx-auto">
        {/* Header with decorative elements */}
        <div className="relative mb-10 text-center">
          <div className="absolute left-1/2 transform -translate-x-1/2 top-0 w-24 h-1 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"></div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-800 pt-4 tracking-tight">
            AI-Powered Mental Health and Emotion Analyzer
          </h1>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
            Comprehensive analysis of emotional well-being through multiple detection methods
          </p>
          <div className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-16 h-1 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full mt-4"></div>
        </div>
        
        {/* Main Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column */}
          <div className="w-full lg:w-3/5 space-y-6">
            <section className="bg-white bg-opacity-70 backdrop-filter backdrop-blur-sm p-5 rounded-xl border-l-4 border-indigo-500 hover:border-l-6 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-100 rounded-bl-full opacity-50"></div>
              <h2 className="text-xl sm:text-2xl font-semibold text-indigo-700 mb-4 border-b border-indigo-100 pb-3 flex items-center">
                <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                Mental Health & Emotion Predictor
              </h2>
              <MentalHealthPredictor />
            </section>
            
            <section className="bg-white bg-opacity-70 backdrop-filter backdrop-blur-sm p-5 rounded-xl border-l-4 border-green-500 hover:border-l-6 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-green-100 rounded-bl-full opacity-50"></div>
              <h2 className="text-xl sm:text-2xl font-semibold text-green-700 mb-4 border-b border-green-100 pb-3 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Facial Emotion
              </h2>
              <EmotionDetector />
            </section>
          </div>
          
          {/* Right Column */}
          <div className="w-full lg:w-2/5 space-y-6">
            <section className="bg-white bg-opacity-70 backdrop-filter backdrop-blur-sm p-5 rounded-xl border-l-4 border-purple-500 hover:border-l-6 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-purple-100 rounded-bl-full opacity-50"></div>
              <h2 className="text-xl sm:text-2xl font-semibold text-purple-700 mb-4 border-b border-purple-100 pb-3 flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                Voice Emotion
              </h2>
              <VoiceEmotionPredictor />
            </section>
            
            <section className="bg-white bg-opacity-70 backdrop-filter backdrop-blur-sm p-5 rounded-xl border-l-4 border-blue-500 hover:border-l-6 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 rounded-bl-full opacity-50"></div>
              <h2 className="text-xl sm:text-2xl font-semibold text-blue-700 mb-4 border-b border-blue-100 pb-3 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Summary Results
              </h2>
              <SummaryResults />
            </section>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-10 text-center text-gray-500 text-sm">
          <div className="w-16 h-1 bg-gradient-to-r from-indigo-300 to-purple-300 rounded-full mx-auto mb-3"></div>
          <p>Analyze emotions through text, facial expressions, and voice patterns</p>
        </div>
      </div>
    </div>
  );
}

export default App;