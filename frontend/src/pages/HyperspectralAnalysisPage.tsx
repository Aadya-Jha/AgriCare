import React, { useState, useEffect } from 'react';
import { Brain, Zap, MapPin, BarChart, Globe, Info } from 'lucide-react';
import HyperspectralImageUpload from '../components/HyperspectralImageUpload';
import apiService, { HyperspectralProcessingResult, LocationPrediction } from '../services/api';

interface ServiceStats {
  service: string;
  status: string;
  matlab_engine_available: boolean;
  simulation_mode: boolean;
  supported_locations: string[];
  timestamp: string;
}

const HyperspectralAnalysisPage: React.FC = () => {
  const [analysisResults, setAnalysisResults] = useState<HyperspectralProcessingResult | null>(null);
  const [serviceStats, setServiceStats] = useState<ServiceStats | null>(null);
  const [supportedLocations, setSupportedLocations] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'upload' | 'locations' | 'about'>('upload');

  useEffect(() => {
    const loadServiceInfo = async () => {
      try {
        const [healthResponse, locationsResponse] = await Promise.all([
          apiService.getHyperspectralHealth(),
          apiService.getSupportedLocations()
        ]);
        
        setServiceStats(healthResponse);
        setSupportedLocations(healthResponse.supported_locations || []);
      } catch (error) {
        console.error('Failed to load service info:', error);
      }
    };

    loadServiceInfo();
  }, []);

  const handleUploadComplete = (results: HyperspectralProcessingResult) => {
    setAnalysisResults(results);
    // Auto-switch to results view if needed
  };

  const predictLocationHealth = async (location: string) => {
    try {
      const result = await apiService.predictLocationHealth(location);
      console.log('Location prediction result:', result);
      // Handle location prediction results
    } catch (error) {
      console.error('Location prediction failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Brain className="w-10 h-10 text-purple-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Hyperspectral Crop Analysis</h1>
                <p className="text-gray-600">AI-powered RGB to hyperspectral conversion and crop health assessment</p>
              </div>
            </div>
            
            {/* Service Status Indicator */}
            {serviceStats && (
              <div className="flex items-center space-x-3">
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                  serviceStats.matlab_engine_available 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    serviceStats.matlab_engine_available ? 'bg-green-500' : 'bg-yellow-500'
                  }`}></div>
                  <span>{serviceStats.matlab_engine_available ? 'MATLAB Active' : 'Simulation Mode'}</span>
                </div>
                <div className="text-sm text-gray-500">
                  {supportedLocations.length} locations supported
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('upload')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'upload'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Zap className="w-4 h-4 inline mr-2" />
              Image Analysis
            </button>
            <button
              onClick={() => setActiveTab('locations')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'locations'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MapPin className="w-4 h-4 inline mr-2" />
              Location Predictions
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'about'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Info className="w-4 h-4 inline mr-2" />
              About
            </button>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="space-y-8">
            <HyperspectralImageUpload onUploadComplete={handleUploadComplete} />
            
            {/* Quick Stats */}
            {analysisResults && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="flex items-center">
                    <BarChart className="w-8 h-8 text-green-500" />
                    <div className="ml-3">
                      <p className="text-sm text-gray-600">Health Score</p>
                      <p className="text-2xl font-bold text-green-600">
                        {(analysisResults.health_analysis.overall_health_score * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="flex items-center">
                    <MapPin className="w-8 h-8 text-blue-500" />
                    <div className="ml-3">
                      <p className="text-sm text-gray-600">NDVI Mean</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {analysisResults.vegetation_indices.ndvi.mean.toFixed(3)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="flex items-center">
                    <Globe className="w-8 h-8 text-purple-500" />
                    <div className="ml-3">
                      <p className="text-sm text-gray-600">Spectral Bands</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {analysisResults.hyperspectral_bands}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="flex items-center">
                    <Brain className="w-8 h-8 text-orange-500" />
                    <div className="ml-3">
                      <p className="text-sm text-gray-600">Coverage</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {analysisResults.vegetation_indices.vegetation_coverage.toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Locations Tab */}
        {activeTab === 'locations' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Indian Agricultural Locations
              </h2>
              <p className="text-gray-600 mb-6">
                Predict crop health for specific Indian agricultural regions using our trained hyperspectral model.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {supportedLocations.map((location) => (
                  <div key={location} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-medium text-gray-800">{location}</h3>
                      <Globe className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Get AI-powered crop health predictions for {location} based on regional hyperspectral data.
                    </p>
                    <button
                      onClick={() => predictLocationHealth(location)}
                      className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors text-sm"
                    >
                      Predict Health
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                Hyperspectral Deep Learning Technology
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-medium text-gray-800 mb-3">How It Works</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2">•</span>
                      Upload regular RGB crop images
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2">•</span>
                      AI converts RGB to 424-band hyperspectral representation
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2">•</span>
                      Deep learning model analyzes crop health patterns
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2">•</span>
                      Calculate vegetation indices (NDVI, SAVI, EVI, GNDVI)
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-500 mr-2">•</span>
                      Generate actionable recommendations
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-800 mb-3">Key Features</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      MATLAB-powered deep learning engine
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      Trained on Indian agricultural data
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      Supports 5 major Indian crop regions
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      Real-time health scoring and classification
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      Location-specific recommendations
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">Technical Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Wavelength Range:</span>
                    <div className="font-medium">381-2500 nm</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Spectral Bands:</span>
                    <div className="font-medium">424 bands</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Health Classes:</span>
                    <div className="font-medium">4 categories</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Supported Locations:</span>
                    <div className="font-medium">Anand, Jhagdia, Kota, Maddur, Talala</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Model Architecture:</span>
                    <div className="font-medium">Deep CNN with 4 FC layers</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Processing Time:</span>
                    <div className="font-medium">~10-30 seconds</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HyperspectralAnalysisPage;
