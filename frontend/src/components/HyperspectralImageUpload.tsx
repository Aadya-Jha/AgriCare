import React, { useState, useCallback, useEffect } from 'react';
import { Upload, FileText, CheckCircle, XCircle, Clock, AlertTriangle, Eye, Brain, Zap, MapPin } from 'lucide-react';
import apiService, { HyperspectralProcessingResult, VegetationIndices, HyperspectralHealthAnalysis } from '../services/api';

interface UploadProgress {
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  message: string;
}

interface HyperspectralImageUploadProps {
  onUploadComplete?: (results: HyperspectralProcessingResult) => void;
  className?: string;
}

const HyperspectralImageUpload: React.FC<HyperspectralImageUploadProps> = ({ 
  onUploadComplete, 
  className = "" 
}) => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    status: 'idle',
    progress: 0,
    message: 'Ready to analyze crop images with AI-powered hyperspectral conversion'
  });
  const [processingResults, setProcessingResults] = useState<HyperspectralProcessingResult | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [serviceHealth, setServiceHealth] = useState<any>(null);

  // Check hyperspectral service health on component mount
  useEffect(() => {
    const checkServiceHealth = async () => {
      try {
        const health = await apiService.getHyperspectralHealth();
        setServiceHealth(health);
      } catch (error) {
        console.warn('Hyperspectral service health check failed:', error);
      }
    };

    checkServiceHealth();
  }, []);

  const processImage = useCallback(async (file: File) => {
    try {
      setUploadProgress({
        status: 'uploading',
        progress: 10,
        message: 'Uploading image for hyperspectral analysis...'
      });

      const formData = new FormData();
      formData.append('image', file);

      setUploadProgress({
        status: 'processing',
        progress: 30,
        message: 'Converting RGB to hyperspectral representation using deep learning...'
      });

      try {
        const response = await apiService.processHyperspectralImage(formData);
        
        if (response.status === 'success' && response.results) {
          setUploadProgress({
            status: 'processing',
            progress: 70,
            message: 'Analyzing crop health and calculating vegetation indices...'
          });

          // Simulate additional processing time for better UX
          setTimeout(() => {
            setUploadProgress({
              status: 'completed',
              progress: 100,
              message: 'Hyperspectral analysis completed successfully!'
            });
            
            setProcessingResults(response.results);
            onUploadComplete?.(response.results);
          }, 1500);
        } else {
          throw new Error(response.message || 'Processing failed');
        }
      } catch (apiError) {
        console.warn('Backend API not available, using simulation mode:', apiError);
        
        // Fallback to simulation when backend is not available
        setUploadProgress({
          status: 'processing',
          progress: 50,
          message: 'Backend unavailable - generating simulated analysis...'
        });

        // Generate mock results based on filename and basic properties
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time
        
        const mockResults: HyperspectralProcessingResult = {
          status: 'success',
          input_image: file.name,
          conversion_method: 'Simulated Deep Learning Conversion',
          health_analysis: {
            overall_health_score: 0.75 + Math.random() * 0.2, // Random between 0.75-0.95
            dominant_health_status: Math.random() > 0.7 ? 'Good' : 'Fair',
            confidence: 0.85 + Math.random() * 0.1,
            excellent_percent: Math.random() * 30,
            good_percent: 40 + Math.random() * 30,
            fair_percent: 20 + Math.random() * 20,
            poor_percent: Math.random() * 10,
            pixels_analyzed: Math.floor(100000 + Math.random() * 50000)
          },
          vegetation_indices: {
            ndvi: {
              mean: 0.4 + Math.random() * 0.4,
              std: 0.1 + Math.random() * 0.05,
              min: 0.2 + Math.random() * 0.1,
              max: 0.7 + Math.random() * 0.2
            },
            savi: {
              mean: 0.3 + Math.random() * 0.3,
              std: 0.08 + Math.random() * 0.04,
              min: 0.15 + Math.random() * 0.1,
              max: 0.6 + Math.random() * 0.2
            },
            evi: {
              mean: 0.25 + Math.random() * 0.25,
              std: 0.06 + Math.random() * 0.03,
              min: 0.1 + Math.random() * 0.05,
              max: 0.5 + Math.random() * 0.2
            },
            gndvi: {
              mean: 0.2 + Math.random() * 0.3,
              std: 0.05 + Math.random() * 0.03,
              min: 0.05 + Math.random() * 0.05,
              max: 0.4 + Math.random() * 0.2
            },
            vegetation_coverage: 60 + Math.random() * 35
          },
          hyperspectral_bands: 424,
          wavelength_range: [400, 2500] as [number, number],
          analysis_timestamp: new Date().toISOString(),
          recommendations: [
            'Monitor crop health regularly for optimal yield',
            'Consider irrigation if soil moisture levels drop',
            'Apply balanced fertilizers based on growth stage',
            'Implement integrated pest management practices'
          ],
          original_filename: file.name,
          file_size_mb: file.size / (1024 * 1024)
        };
        
        setUploadProgress({
          status: 'completed',
          progress: 100,
          message: 'Simulated hyperspectral analysis completed! (Backend unavailable)'
        });
        
        setProcessingResults(mockResults);
        onUploadComplete?.(mockResults);
      }

    } catch (error) {
      console.error('Processing error:', error);
      setUploadProgress({
        status: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : 'Processing failed. Please try again.'
      });
    }
  }, [onUploadComplete]);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/tiff', 'image/tif'];
    
    if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().match(/\.(jpg|jpeg|png|tiff|tif)$/)) {
      setUploadProgress({
        status: 'error',
        progress: 0,
        message: 'Please select a valid image file (JPEG, PNG, or TIFF)'
      });
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit for hyperspectral processing
      setUploadProgress({
        status: 'error',
        progress: 0,
        message: 'File size too large. Please select a file under 50MB'
      });
      return;
    }

    processImage(file);
  }, [processImage]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const resetUpload = () => {
    setUploadProgress({
      status: 'idle',
      progress: 0,
      message: 'Ready to analyze crop images with AI-powered hyperspectral conversion'
    });
    setProcessingResults(null);
  };

  const getStatusIcon = () => {
    switch (uploadProgress.status) {
      case 'uploading':
        return <Upload className="w-6 h-6 text-blue-500 animate-bounce" />;
      case 'processing':
        return <Brain className="w-6 h-6 text-purple-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Eye className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (uploadProgress.status) {
      case 'uploading':
        return 'bg-blue-500';
      case 'processing':
        return 'bg-purple-500';
      case 'completed':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    if (score >= 0.4) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatNumber = (value: number, decimals: number = 3) => {
    return value.toFixed(decimals);
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <Zap className="w-8 h-8 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-800">Hyperspectral Crop Analysis</h2>
        </div>
        <p className="text-gray-600">
          Upload regular RGB images to convert them into hyperspectral data using deep learning. 
          Get detailed crop health analysis with vegetation indices and recommendations.
        </p>
        
        {/* Service Status */}
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <span className="text-sm text-yellow-800 font-medium">Simulation Mode Active</span>
          </div>
          <p className="text-xs text-yellow-700 mt-1">
            Backend service not available. The system will generate simulated hyperspectral analysis results for demonstration purposes.
          </p>
        </div>
        
        {serviceHealth && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${serviceHealth.matlab_engine_available ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className="text-sm text-gray-600">
                  {serviceHealth.matlab_engine_available ? 'MATLAB Engine Active' : 'Simulation Mode'}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {serviceHealth.hyperspectral_bands || '424'} bands • {serviceHealth.supported_locations?.length || 5} locations
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver
            ? 'border-purple-400 bg-purple-50'
            : uploadProgress.status === 'error'
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="flex flex-col items-center space-y-4">
          {getStatusIcon()}
          
          <div>
            <p className="text-lg font-medium text-gray-700">
              {uploadProgress.status === 'idle' ? 'Drop your crop image here or click to select' : uploadProgress.message}
            </p>
            {uploadProgress.status === 'idle' && (
              <p className="text-sm text-gray-500 mt-1">
                Supports JPEG, PNG, and TIFF formats • Max 50MB
              </p>
            )}
          </div>

          {uploadProgress.status === 'idle' && (
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
              id="hyperspectral-upload"
            />
          )}
          
          {uploadProgress.status === 'idle' ? (
            <label
              htmlFor="hyperspectral-upload"
              className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 cursor-pointer transition-colors flex items-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>Analyze Image</span>
            </label>
          ) : uploadProgress.status === 'error' ? (
            <button
              onClick={resetUpload}
              className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          ) : null}
        </div>
      </div>

      {/* Progress Bar */}
      {(uploadProgress.status === 'uploading' || uploadProgress.status === 'processing') && (
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{uploadProgress.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${getStatusColor()}`}
              style={{ width: `${uploadProgress.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Results Display */}
      {processingResults && (
        <div className="mt-8 border-t pt-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Hyperspectral Analysis Results
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Health Analysis */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
              <h4 className="font-medium text-green-800 mb-4 flex items-center">
                <Brain className="w-4 h-4 mr-2" />
                Crop Health Assessment
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Overall Health Score:</span>
                  <span className={`font-bold text-lg ${getHealthColor(processingResults.health_analysis.overall_health_score)}`}>
                    {formatNumber(processingResults.health_analysis.overall_health_score, 2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dominant Status:</span>
                  <span className={`font-medium ${getHealthColor(processingResults.health_analysis.overall_health_score)}`}>
                    {processingResults.health_analysis.dominant_health_status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Confidence:</span>
                  <span className="font-medium">{formatNumber(processingResults.health_analysis.confidence * 100, 1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pixels Analyzed:</span>
                  <span className="font-medium">{processingResults.health_analysis.pixels_analyzed.toLocaleString()}</span>
                </div>
              </div>
              
              {/* Health Distribution */}
              <div className="mt-4">
                <div className="text-sm text-gray-600 mb-2">Health Distribution:</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-green-600">Excellent:</span>
                    <span>{formatNumber(processingResults.health_analysis.excellent_percent, 1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-yellow-600">Good:</span>
                    <span>{formatNumber(processingResults.health_analysis.good_percent, 1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-orange-600">Fair:</span>
                    <span>{formatNumber(processingResults.health_analysis.fair_percent, 1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-600">Poor:</span>
                    <span>{formatNumber(processingResults.health_analysis.poor_percent, 1)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Vegetation Indices */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
              <h4 className="font-medium text-blue-800 mb-4 flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                Vegetation Indices
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">NDVI (Mean):</span>
                  <span className="font-medium">{formatNumber(processingResults.vegetation_indices.ndvi.mean)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">SAVI (Mean):</span>
                  <span className="font-medium">{formatNumber(processingResults.vegetation_indices.savi.mean)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">EVI (Mean):</span>
                  <span className="font-medium">{formatNumber(processingResults.vegetation_indices.evi.mean)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">GNDVI (Mean):</span>
                  <span className="font-medium">{formatNumber(processingResults.vegetation_indices.gndvi.mean)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Vegetation Coverage:</span>
                  <span className="font-medium">{formatNumber(processingResults.vegetation_indices.vegetation_coverage, 1)}%</span>
                </div>
              </div>
              
              {/* Hyperspectral Info */}
              <div className="mt-4 pt-4 border-t border-blue-200">
                <div className="text-sm text-blue-700 space-y-1">
                  <div className="flex justify-between">
                    <span>Spectral Bands:</span>
                    <span className="font-medium">{processingResults.hyperspectral_bands}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wavelength Range:</span>
                    <span className="font-medium">
                      {processingResults.wavelength_range[0]}-{processingResults.wavelength_range[1]} nm
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Conversion Method:</span>
                    <span className="font-medium text-xs">{processingResults.conversion_method}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {processingResults.recommendations && processingResults.recommendations.length > 0 && (
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-6">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-orange-800 mb-3">AI-Generated Recommendations</h4>
                  <ul className="text-sm text-orange-700 space-y-2">
                    {processingResults.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-orange-500 mr-2">•</span>
                        <span>{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Processing Details */}
          <div className="mt-4 text-xs text-gray-500 border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="font-medium">Original File:</span> {processingResults.original_filename}
              </div>
              <div>
                <span className="font-medium">File Size:</span> {processingResults.file_size_mb} MB
              </div>
              <div>
                <span className="font-medium">Processed:</span> {new Date(processingResults.analysis_timestamp).toLocaleString()}
              </div>
            </div>
          </div>

          <button
            onClick={resetUpload}
            className="mt-6 w-full bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>Analyze Another Image</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default HyperspectralImageUpload;
