import React, { useState } from 'react';
import { ErrorBoundary } from '../components/ErrorBoundary';
import AnimatedBackground from '../components/AnimatedBackground';
import GTranslateLoader from '../components/GTranslateLoader';
import { FieldMap } from '../components/FieldMap';
import { TrendsChart } from '../components/TrendsChart';
import AgricultureImageUpload from '../components/AgricultureImageUpload';
import ImageAnalysisResultsPanel from '../components/ImageAnalysisResultsPanel';
import AllIndiaCropRecommendations from '../components/AllIndiaCropRecommendations';
import { useRealTimeDashboard, useRealTimeTrends } from '../hooks/useApi';
import { ImageAnalysisResult } from '../services/api';
import { Truck, Map, Zap, BarChart3, Brain, Bug, Globe, Volume2, VolumeX, Languages, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react';

// All Indian states data is now handled in AllIndiaCropRecommendations component

// Indian languages for translation
const INDIAN_LANGUAGES = [
  { code: 'hi', name: 'हिन्दी (Hindi)', flag: '🇮🇳' },
  { code: 'te', name: 'తెలుగు (Telugu)', flag: '🇮🇳' },
  { code: 'ta', name: 'தமிழ் (Tamil)', flag: '🇮🇳' },
  { code: 'kn', name: 'ಕನ್ನಡ (Kannada)', flag: '🇮🇳' },
  { code: 'ml', name: 'മലയാളം (Malayalam)', flag: '🇮🇳' },
  { code: 'gu', name: 'ગુજરાતી (Gujarati)', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी (Marathi)', flag: '🇮🇳' },
  { code: 'bn', name: 'বাংলা (Bengali)', flag: '🇮🇳' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)', flag: '🇮🇳' },
  { code: 'or', name: 'ଓଡ଼ିଆ (Odia)', flag: '🇮🇳' },
  { code: 'as', name: 'অসমীয়া (Assamese)', flag: '🇮🇳' },
  { code: 'ur', name: 'اردو (Urdu)', flag: '🇮🇳' },
  { code: 'en', name: 'English', flag: '🇬🇧' }
];

export const FarmerDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'crop-recommendations' | 'disease-analysis'>('dashboard');
  const [selectedState, setSelectedState] = useState<string>('Karnataka');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [currentDiseaseAnalysis, setCurrentDiseaseAnalysis] = useState<ImageAnalysisResult | null>(null);

  // API hooks for real-time data
  const { data: summary, loading: loadingSummary, error: summaryError, refetch: refetchSummary } = useRealTimeDashboard(300000); // 5 minutes
  const { data: trends, loading: loadingTrends, error: trendsError, refetch: refetchTrends } = useRealTimeTrends(1, 300000); // 5 minutes

  // Text-to-speech functionality
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = selectedLanguage;
      utterance.rate = 0.8;
      utterance.pitch = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-speech is not supported in your browser');
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const readPageContent = () => {
    const pageContent = `Welcome to your Farm Dashboard. 
      Current crop health status is ${summary?.crop_health?.status || 'unknown'}. 
      Soil moisture is ${summary?.soil_moisture?.value || 0} percent, ${summary?.soil_moisture?.status || 'unknown'}. 
      Pest risk level is ${summary?.pest_risk?.level || 'unknown'}. 
      Irrigation advice: ${summary?.irrigation_advice?.recommendation || 'maintain current schedule'}.`;
    speak(pageContent);
  };

  // Handle location selection from map
  const handleLocationSelect = (lat: number, lng: number) => {
    // Location selected - refresh data for new location
    refetchSummary();
    refetchTrends();
  };

  const handleDiseaseAnalysisComplete = (results: ImageAnalysisResult) => {
    setCurrentDiseaseAnalysis(results);
  };

  // Status color helper
  const statusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'good':
      case 'optimal':
        return 'text-green-600';
      case 'warning':
      case 'medium':
        return 'text-yellow-600';
      case 'urgent':
      case 'high':
        return 'text-red-600';
      default:
        return 'text-gray-900';
    }
  };

  // Trend analysis sidebar content
  const getTrendSummary = () => {
    if (!trends) return 'No trend data available';
    
    const soilMoisture = trends.trends?.soil_moisture || [];
    const temperature = trends.trends?.air_temperature || [];
    const humidity = trends.trends?.humidity || [];
    
    const recentSoilMoisture = soilMoisture.slice(-5).map(d => d.value);
    const recentTemp = temperature.slice(-5).map(d => d.value);
    const recentHumidity = humidity.slice(-5).map(d => d.value);
    
    const avgSoilMoisture = recentSoilMoisture.reduce((a, b) => a + b, 0) / recentSoilMoisture.length || 0;
    const avgTemp = recentTemp.reduce((a, b) => a + b, 0) / recentTemp.length || 0;
    const avgHumidity = recentHumidity.reduce((a, b) => a + b, 0) / recentHumidity.length || 0;
    
    let analysis = 'Recent trends show ';
    
    if (avgSoilMoisture > 60) {
      analysis += 'high soil moisture levels - consider reducing irrigation. ';
    } else if (avgSoilMoisture < 30) {
      analysis += 'low soil moisture - increase watering frequency. ';
    } else {
      analysis += 'optimal soil moisture levels. ';
    }
    
    if (avgTemp > 35) {
      analysis += 'High temperatures detected - monitor for heat stress. ';
    } else if (avgTemp < 15) {
      analysis += 'Cool temperatures - protect crops from cold. ';
    }
    
    if (avgHumidity > 80) {
      analysis += 'High humidity may increase disease risk.';
    }
    
    return analysis;
  };

  // Loading state
  if (loadingSummary && activeTab === 'dashboard') {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card">
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-1"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
            </div>
          ))}
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading your farm dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (summaryError && activeTab === 'dashboard') {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
            <h2 className="text-lg font-semibold text-red-800">Dashboard Error</h2>
          </div>
          <p className="text-red-700 mb-4">{summaryError}</p>
          <button
            onClick={refetchSummary}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <AnimatedBackground variant="dashboard">
        <div className="space-y-6 animate-fade-in">
          <div className="gtranslate_wrapper"></div>
          <GTranslateLoader />

          {/* Header with Language and Speech Controls */}
          <div className="rounded-lg shadow-sm border border-gray-200" style={{backgroundColor: 'var(--agricare-light)'}}>
            <div className="px-6 py-4 border-b border-gray-200" style={{background: 'linear-gradient(135deg, var(--agricare-primary) 0%, var(--agricare-secondary) 100%)'}}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Truck className="h-8 w-8 text-white" />
                  <div>
                    <h1 className="text-2xl font-heading font-semibold text-white">किसान डैशबोर्ड - Farmer Dashboard</h1>
                    <p className="text-green-100 mt-1">Your comprehensive farming companion • आपका व्यापक कृषि साथी</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {/* Language Selector */}
                  <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2">
                    <Languages className="h-5 w-5 text-white" />
                    <select 
                      value={selectedLanguage} 
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="bg-transparent text-white border-none outline-none text-sm"
                    >
                      {INDIAN_LANGUAGES.map(lang => (
                        <option key={lang.code} value={lang.code} className="text-gray-900">
                          {lang.flag} {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Speech Controls */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={isSpeaking ? stopSpeaking : readPageContent}
                      className={`p-2 rounded-lg transition-colors ${
                        isSpeaking 
                          ? 'bg-red-500 hover:bg-red-600' 
                          : 'bg-blue-500 hover:bg-blue-600'
                      } text-white`}
                      title={isSpeaking ? 'Stop Reading' : 'Read Page Content'}
                    >
                      {isSpeaking ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tab Navigation */}
            <nav className="flex space-x-8 px-6" style={{backgroundColor: 'var(--agricare-sage)'}}>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'dashboard' ? 'text-white' : 'hover:text-white'
                }`}
                style={{
                  color: activeTab === 'dashboard' ? 'white' : 'var(--agricare-primary)',
                  borderBottomColor: activeTab === 'dashboard' ? 'white' : 'transparent'
                }}
              >
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Farm Overview • खेत का सिंहावलोकन</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('crop-recommendations')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'crop-recommendations' ? 'text-white' : 'hover:text-white'
                }`}
                style={{
                  color: activeTab === 'crop-recommendations' ? 'white' : 'var(--agricare-primary)',
                  borderBottomColor: activeTab === 'crop-recommendations' ? 'white' : 'transparent'
                }}
              >
                <div className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Crop Recommendations • फसल सिफारिशें</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('disease-analysis')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'disease-analysis' ? 'text-white' : 'hover:text-white'
                }`}
                style={{
                  color: activeTab === 'disease-analysis' ? 'white' : 'var(--agricare-primary)',
                  borderBottomColor: activeTab === 'disease-analysis' ? 'white' : 'transparent'
                }}
              >
                <div className="flex items-center space-x-2">
                  <Bug className="h-5 w-5" />
                  <span>Disease Analysis • रोग विश्लेषण</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Main Dashboard Content */}
              <div className="lg:col-span-3 space-y-6">
                {/* Quick Overview Cards */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="card" style={{backgroundColor: 'var(--agricare-light)', border: '1px solid var(--agricare-sage)'}}>
                    <h3 className="text-sm" style={{color: 'var(--agricare-primary)'}}>Crop Health • फसल स्वास्थ्य</h3>
                    {!summary ? (
                      <div className="mt-4 h-8 bg-gray-100 rounded animate-pulse" />
                    ) : (
                      <>
                        <p className={`text-3xl font-heading font-semibold mt-2 ${statusColor(summary.crop_health?.status?.toLowerCase() || 'unknown')}`}>
                          {summary.crop_health?.status || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">NDVI: {(summary.crop_health?.ndvi || 0).toFixed(2)}</p>
                      </>
                    )}
                  </div>
                  <div className="card" style={{backgroundColor: 'var(--agricare-light)', border: '1px solid var(--agricare-sage)'}}>
                    <h3 className="text-sm" style={{color: 'var(--agricare-primary)'}}>Soil Moisture • मिट्टी की नमी</h3>
                    {!summary ? (
                      <div className="mt-4 h-8 bg-gray-100 rounded animate-pulse" />
                    ) : (
                      <>
                        <p className="text-3xl font-heading font-semibold mt-2">{summary.soil_moisture?.value || 0}%</p>
                        <p className={`text-sm mt-1 ${statusColor(summary.soil_moisture?.status || 'unknown')}`}>
                          {summary.soil_moisture?.status === 'optimal' ? 'Optimal • उत्तम' : (summary.soil_moisture?.status || 'Unknown')}
                        </p>
                      </>
                    )}
                  </div>
                  <div className="card" style={{backgroundColor: 'var(--agricare-light)', border: '1px solid var(--agricare-sage)'}}>
                    <h3 className="text-sm" style={{color: 'var(--agricare-primary)'}}>Pest Risk • कीट जोखिम</h3>
                    {!summary ? (
                      <div className="mt-4 h-8 bg-gray-100 rounded animate-pulse" />
                    ) : (
                      <>
                        <p className={`text-3xl font-heading font-semibold mt-2 ${statusColor(summary.pest_risk?.level || 'unknown')}`}>
                          {summary.pest_risk?.level ? summary.pest_risk.level.charAt(0).toUpperCase() + summary.pest_risk.level.slice(1) : 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">{(summary.pest_risk?.detected_pests || []).join(', ') || 'No pests detected'}</p>
                      </>
                    )}
                  </div>
                  <div className="card" style={{backgroundColor: 'var(--agricare-light)', border: '1px solid var(--agricare-sage)'}}>
                    <h3 className="text-sm" style={{color: 'var(--agricare-primary)'}}>Irrigation • सिंचाई</h3>
                    {!summary ? (
                      <div className="mt-4 h-8 bg-gray-100 rounded animate-pulse" />
                    ) : (
                      <>
                        <p className={`text-3xl font-heading font-semibold mt-2 ${statusColor(summary.irrigation_advice?.status || 'unknown')}`}>
                          {summary.irrigation_advice?.recommendation || 'Maintain'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">{summary.irrigation_advice?.reason || 'Standard maintenance'}</p>
                      </>
                    )}
                  </div>
                </section>

                {/* Field Map */}
                <section className="card" style={{backgroundColor: 'var(--agricare-light)', border: '1px solid var(--agricare-sage)'}}>
                  <h2 className="text-lg font-heading font-semibold flex items-center space-x-2">
                    <Map className="h-5 w-5" />
                    <span>Field Map • खेत का नक्शा</span>
                  </h2>
                  <p className="text-sm text-gray-600 mt-2">Interactive map with field boundaries and sensor locations</p>
                  <div className="mt-4 h-96">
                    <FieldMap summary={summary} className="h-full" onLocationSelect={handleLocationSelect} />
                  </div>
                </section>

                {/* Trends Section */}
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-heading font-semibold flex items-center space-x-2">
                        <Zap className="h-5 w-5" />
                        <span>Agricultural Trends • कृषि रुझान</span>
                      </h2>
                      <p className="text-sm text-gray-600">Real-time monitoring of key agricultural metrics</p>
                    </div>
                  </div>
                  {trendsError ? (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <p className="text-orange-700 mb-2">Unable to load trends data: {trendsError}</p>
                      <button
                        onClick={refetchTrends}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Retry
                      </button>
                    </div>
                  ) : (
                    <TrendsChart 
                      trends={trends} 
                      loading={loadingTrends} 
                      className=""
                    />
                  )}
                </section>
              </div>

              {/* Sidebar with Trend Summary */}
              <div className="lg:col-span-1 space-y-6">
                <div className="card" style={{backgroundColor: 'var(--agricare-light)', border: '1px solid var(--agricare-sage)'}}>
                  <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Trend Analysis</span>
                  </h3>
                  <div className="text-sm text-gray-700 space-y-3">
                    <p>{getTrendSummary()}</p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <h4 className="font-medium text-blue-800 mb-2">Smart Recommendations</h4>
                      <ul className="text-xs text-blue-700 space-y-1">
                        <li>• Monitor soil moisture levels closely</li>
                        <li>• Check for pest activity in high humidity</li>
                        <li>• Adjust irrigation based on weather patterns</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="card" style={{backgroundColor: 'var(--agricare-light)', border: '1px solid var(--agricare-sage)'}}>
                  <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => speak(getTrendSummary())}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm flex items-center space-x-2"
                    >
                      <Volume2 className="h-4 w-4" />
                      <span>Read Trends</span>
                    </button>
                    <button
                      onClick={() => refetchSummary()}
                      className="w-full bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm flex items-center space-x-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span>Refresh Data</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'crop-recommendations' && (
            <AllIndiaCropRecommendations 
              selectedState={selectedState}
              onStateChange={setSelectedState}
              selectedLanguage={selectedLanguage}
              onSpeak={speak}
            />
          )}

          {activeTab === 'disease-analysis' && (
            <div className="space-y-6">
              <div className="card" style={{backgroundColor: 'var(--agricare-light)', border: '1px solid var(--agricare-sage)'}}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold flex items-center space-x-2">
                    <Brain className="h-6 w-6" />
                    <span>AI Crop Disease Analysis • एआई फसल रोग विश्लेषण</span>
                  </h2>
                  <button
                    onClick={() => speak('Upload a photo of your crop to get instant AI-powered disease detection and treatment recommendations')}
                    className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <AgricultureImageUpload 
                      onAnalysisComplete={handleDiseaseAnalysisComplete}
                      analysisType="disease"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h3 className="font-semibold text-green-800 mb-2">How to Use • कैसे उपयोग करें</h3>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• Take clear photos of affected crop leaves</li>
                        <li>• Upload the image using the button above</li>
                        <li>• Get instant AI analysis and recommendations</li>
                        <li>• Follow treatment suggestions for better crop health</li>
                      </ul>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-800 mb-2">Supported Crops • समर्थित फसलें</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
                        <div>• Rice (धान)</div>
                        <div>• Wheat (गेहूं)</div>
                        <div>• Cotton (कपास)</div>
                        <div>• Tomato (टमाटर)</div>
                        <div>• Potato (आलू)</div>
                        <div>• Maize (मक्का)</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {currentDiseaseAnalysis && (
                  <div className="mt-6">
                    <ImageAnalysisResultsPanel 
                      result={currentDiseaseAnalysis}
                      analysisType="disease"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </AnimatedBackground>
    </ErrorBoundary>
  );
};
