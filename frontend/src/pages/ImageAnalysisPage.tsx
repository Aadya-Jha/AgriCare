import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertTriangle, ArrowLeft, Zap, BarChart, Globe, MapPin, Bug, Microscope } from 'lucide-react';
import { Link } from 'react-router-dom';
import HyperspectralImageUpload from '../components/HyperspectralImageUpload';
import AgricultureImageUpload from '../components/AgricultureImageUpload';
import ImageAnalysisResultsPanel from '../components/ImageAnalysisResultsPanel';
import apiService, { HyperspectralProcessingResult, ImageAnalysisResult, ImageAnalysisHealthResponse } from '../services/api';
import AnimatedBackground from '../components/AnimatedBackground';

interface ServiceStatus {
  service: string;
  status: string;
  matlab_engine_available: boolean;
  simulation_mode: boolean;
  supported_locations: string[];
}

const ImageAnalysisPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'disease' | 'hyperspectral'>('disease');
  const [recentResults, setRecentResults] = useState<HyperspectralProcessingResult[]>([]);
  const [recentDiseaseResults, setRecentDiseaseResults] = useState<ImageAnalysisResult[]>([]);
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus | null>(null);
  const [diseaseServiceStatus, setDiseaseServiceStatus] = useState<ImageAnalysisHealthResponse | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<HyperspectralProcessingResult | null>(null);
  const [currentDiseaseAnalysis, setCurrentDiseaseAnalysis] = useState<ImageAnalysisResult | null>(null);

  useEffect(() => {
    const checkServiceStatus = async () => {
      try {
        // Check hyperspectral service
        const hyperStatus = await apiService.getHyperspectralHealth();
        setServiceStatus(hyperStatus);
        
        // Check disease analysis service
        const diseaseStatus = await apiService.getImageAnalysisHealth();
        setDiseaseServiceStatus(diseaseStatus);
      } catch (error) {
        console.warn('Service health check failed:', error);
      }
    };
    checkServiceStatus();
  }, []);

  const handleUploadComplete = (results: HyperspectralProcessingResult) => {
    setRecentResults(prev => [results, ...prev.slice(0, 4)]); // Keep last 5 results
    setCurrentAnalysis(results);
  };

  const handleDiseaseAnalysisComplete = (results: ImageAnalysisResult) => {
    setRecentDiseaseResults(prev => [results, ...prev.slice(0, 4)]); // Keep last 5 results
    setCurrentDiseaseAnalysis(results);
  };

  return (
    <AnimatedBackground variant="imageAnalysis">
      <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                to="/dashboard" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div className="flex items-center space-x-3">
                <Brain className="w-8 h-8 text-purple-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">AI-Powered Crop Analysis</h1>
                  <p className="text-sm text-gray-600">Disease Detection & Hyperspectral Health Assessment</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {diseaseServiceStatus && (
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs ${
                  diseaseServiceStatus.model_available 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    diseaseServiceStatus.model_available ? 'bg-green-500' : 'bg-yellow-500'
                  }`}></div>
                  <span>Disease AI {diseaseServiceStatus.model_available ? 'Active' : 'Sim Mode'}</span>
                </div>
              )}
              {serviceStatus && (
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs ${
                  serviceStatus.matlab_engine_available 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    serviceStatus.matlab_engine_available ? 'bg-blue-500' : 'bg-gray-500'
                  }`}></div>
                  <span>Hyperspectral {serviceStatus.matlab_engine_available ? 'Active' : 'Sim'}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Analysis Type Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('disease')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'disease'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Bug className="w-4 h-4" />
                  <span>Disease Analysis</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('hyperspectral')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'hyperspectral'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Microscope className="w-4 h-4" />
                  <span>Hyperspectral Analysis</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-2">
            {activeTab === 'disease' ? (
              <AgricultureImageUpload 
                onAnalysisComplete={handleDiseaseAnalysisComplete} 
                analysisType="disease"
              />
            ) : (
              <HyperspectralImageUpload onUploadComplete={handleUploadComplete} />
            )}
            
            {/* Disease Analysis Results */}
            {activeTab === 'disease' && currentDiseaseAnalysis && (
              <div className="mt-6">
                <ImageAnalysisResultsPanel 
                  result={currentDiseaseAnalysis} 
                  analysisType="disease"
                />
              </div>
            )}

            {/* Hyperspectral Quick Results Summary */}
            {activeTab === 'hyperspectral' && currentAnalysis && (
              <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="flex items-center">
                    <BarChart className="w-6 h-6 text-green-500" />
                    <div className="ml-3">
                      <p className="text-xs text-gray-600">Health Score</p>
                      <p className="text-lg font-bold text-green-600">
                        {(currentAnalysis.health_analysis.overall_health_score * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="flex items-center">
                    <MapPin className="w-6 h-6 text-blue-500" />
                    <div className="ml-3">
                      <p className="text-xs text-gray-600">NDVI</p>
                      <p className="text-lg font-bold text-blue-600">
                        {currentAnalysis.vegetation_indices.ndvi.mean.toFixed(3)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="flex items-center">
                    <Globe className="w-6 h-6 text-purple-500" />
                    <div className="ml-3">
                      <p className="text-xs text-gray-600">Bands</p>
                      <p className="text-lg font-bold text-purple-600">
                        {currentAnalysis.hyperspectral_bands}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="flex items-center">
                    <Zap className="w-6 h-6 text-orange-500" />
                    <div className="ml-3">
                      <p className="text-xs text-gray-600">Coverage</p>
                      <p className="text-lg font-bold text-orange-600">
                        {currentAnalysis.vegetation_indices.vegetation_coverage.toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            {/* AI Analysis Features */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Brain className="w-5 h-5 mr-2 text-purple-600" />
                AI Analysis Features
              </h3>
              
              {activeTab === 'disease' ? (
                <div className="space-y-4 text-sm text-gray-600">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium text-gray-800">Disease Detection</h4>
                      <p>AI-powered identification of 8+ crop diseases and conditions</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium text-gray-800">Multi-Crop Support</h4>
                      <p>Specialized analysis for Rice, Wheat, Cotton, Tomato, and more</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium text-gray-800">Treatment Recommendations</h4>
                      <p>Actionable treatment plans and preventive measures</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium text-gray-800">Feature Analysis</h4>
                      <p>Color, texture, and shape analysis for comprehensive assessment</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-sm text-gray-600">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium text-gray-800">RGB to Hyperspectral</h4>
                      <p>Deep learning conversion from RGB to 424-band hyperspectral data</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium text-gray-800">Multi-Index Analysis</h4>
                      <p>NDVI, SAVI, EVI, GNDVI calculation with statistical analysis</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium text-gray-800">Health Classification</h4>
                      <p>4-class crop health assessment with confidence scoring</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium text-gray-800">Indian Locations</h4>
                      <p>Trained on data from 5 major Indian agricultural regions</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Disease Analysis Results */}
            {activeTab === 'disease' && recentDiseaseResults.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-red-600" />
                  Recent Disease Analysis
                </h3>
                <div className="space-y-3">
                  {recentDiseaseResults.map((result, index) => (
                    <div key={`disease-${result.input_file?.filename}-${index}`} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-800 text-sm truncate">
                          {result.input_file?.filename || 'Unknown'}
                        </h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          result.analysis_summary.health_status === 'Excellent' ? 'bg-green-100 text-green-800' :
                          result.analysis_summary.health_status === 'Good' ? 'bg-green-100 text-green-700' :
                          result.analysis_summary.health_status === 'Fair' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {result.analysis_summary.health_status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <div>Disease: {result.analysis_summary.primary_detection.disease}</div>
                        <div>Confidence: {(result.analysis_summary.confidence * 100).toFixed(0)}%</div>
                        <div>Health: {(result.analysis_summary.overall_health_score * 100).toFixed(0)}%</div>
                        <div>Crop: {result.crop_type}</div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {result.analysis_summary.primary_detection.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Hyperspectral Results */}
            {activeTab === 'hyperspectral' && recentResults.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                  Recent Hyperspectral Analysis
                </h3>
                <div className="space-y-3">
                  {recentResults.map((result, index) => (
                    <div key={`${result.original_filename}-${index}`} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-800 text-sm truncate">
                          {result.original_filename || 'Unknown'}
                        </h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          result.health_analysis.dominant_health_status === 'Excellent' ? 'bg-green-100 text-green-800' :
                          result.health_analysis.dominant_health_status === 'Good' ? 'bg-green-100 text-green-700' :
                          result.health_analysis.dominant_health_status === 'Fair' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {result.health_analysis.dominant_health_status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <div>NDVI: {result.vegetation_indices.ndvi.mean.toFixed(3)}</div>
                        <div>SAVI: {result.vegetation_indices.savi.mean.toFixed(3)}</div>
                        <div>Health: {(result.health_analysis.overall_health_score * 100).toFixed(0)}%</div>
                        <div>Bands: {result.hyperspectral_bands}</div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Coverage: {result.vegetation_indices.vegetation_coverage.toFixed(1)}% • {result.conversion_method}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Help Section */}
            <div className="bg-gradient-to-r from-green-50 to-yellow-50 rounded-lg p-6 border border-green-200">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    Tips for {activeTab === 'disease' ? 'Disease Analysis' : 'Hyperspectral Analysis'}
                  </h3>
                  {activeTab === 'disease' ? (
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Upload clear, well-lit crop images showing leaves or affected areas</li>
                      <li>• Select specific crop type for more accurate disease detection</li>
                      <li>• Focus on problem areas - spots, discoloration, or damage</li>
                      <li>• Take photos from multiple angles for better analysis</li>
                      <li>• AI detects 8+ diseases including blight, rust, and pest damage</li>
                      <li>• Get immediate treatment recommendations and preventive tips</li>
                    </ul>
                  ) : (
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Upload regular RGB images - no special equipment needed!</li>
                      <li>• Use images from 800x800 pixels for optimal AI conversion</li>
                      <li>• Capture during clear weather with good natural lighting</li>
                      <li>• Focus on crop areas with minimal soil background</li>
                      <li>• AI converts RGB to 424 hyperspectral bands automatically</li>
                      <li>• Works best with green, leafy crop images</li>
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* Processing Stats */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Deep Learning Pipeline</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-semibold">1</div>
                  <div className="text-sm">
                    <div className="font-medium text-gray-800">RGB Image Upload</div>
                    <div className="text-gray-600">Secure upload and preprocessing of regular crop images</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-sm font-semibold">2</div>
                  <div className="text-sm">
                    <div className="font-medium text-gray-800">AI Conversion</div>
                    <div className="text-gray-600">Deep learning RGB to 424-band hyperspectral conversion</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 text-sm font-semibold">3</div>
                  <div className="text-sm">
                    <div className="font-medium text-gray-800">MATLAB Analysis</div>
                    <div className="text-gray-600">Advanced spectral processing and vegetation indices</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-sm font-semibold">4</div>
                  <div className="text-sm">
                    <div className="font-medium text-gray-800">Health Assessment</div>
                    <div className="text-gray-600">4-class health classification and recommendations</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </AnimatedBackground>
  );
};

export default ImageAnalysisPage;
