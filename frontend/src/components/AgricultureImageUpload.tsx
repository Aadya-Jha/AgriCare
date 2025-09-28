import React, { useState, useRef } from 'react';
import { Upload, Camera, X, CheckCircle, AlertCircle, Loader, Image as ImageIcon, Bug, Leaf, TrendingUp } from 'lucide-react';
import apiService, { ImageAnalysisResult } from '../services/api';

interface Props {
  onAnalysisComplete: (result: ImageAnalysisResult) => void;
  analysisType?: 'disease' | 'hyperspectral';
}

const AgricultureImageUpload: React.FC<Props> = ({ onAnalysisComplete, analysisType = 'disease' }) => {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cropType, setCropType] = useState<string>('General');
  const [supportedCrops, setSupportedCrops] = useState<string[]>([]);
  const [processingMessage, setProcessingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<ImageAnalysisResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    // Load supported crop types
    const loadCropTypes = async () => {
      try {
        const response = await apiService.getSupportedCropTypes();
        setSupportedCrops(Object.keys(response.supported_crops));
      } catch (err) {
        console.warn('Could not load crop types:', err);
        // Fallback to common crops
        setSupportedCrops(['Rice', 'Wheat', 'Maize', 'Cotton', 'Tomato', 'General']);
      }
    };
    
    loadCropTypes();
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/tiff'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPG, PNG, BMP, or TIFF)');
      return;
    }

    // Validate file size (16MB max)
    const maxSize = 16 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size must be less than 16MB');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setUploadStatus('idle');
    setCurrentResult(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setUploadStatus('uploading');
    setError(null);
    setProcessingMessage('Uploading image...');

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('crop_type', cropType);

      setUploadStatus('processing');
      setProcessingMessage(analysisType === 'disease' ? 
        'Analyzing for diseases and health conditions...' : 
        'Converting to hyperspectral and analyzing...'
      );

      let result: ImageAnalysisResult;
      
      if (analysisType === 'disease') {
        result = await apiService.analyzeAgricultureImage(formData);
      } else {
        // Use hyperspectral analysis
        const hyperspectralResult = await apiService.processHyperspectralImage(formData);
        // Convert hyperspectral result to ImageAnalysisResult format for consistency
        result = {
          status: hyperspectralResult.status,
          crop_type: 'General',
          analysis_summary: {
            primary_detection: {
              disease: hyperspectralResult.health_analysis.dominant_health_status,
              confidence: hyperspectralResult.health_analysis.confidence,
              description: `Health status: ${hyperspectralResult.health_analysis.dominant_health_status}`,
              recommended_actions: hyperspectralResult.recommendations || []
            },
            all_detections: [],
            overall_health_score: hyperspectralResult.health_analysis.overall_health_score,
            health_status: hyperspectralResult.health_analysis.dominant_health_status,
            confidence: hyperspectralResult.health_analysis.confidence
          },
          image_properties: {
            format: 'RGB',
            resolution: '1024x768',
            file_size_kb: hyperspectralResult.file_size_mb ? hyperspectralResult.file_size_mb * 1024 : 0,
            quality_score: 0.9
          },
          recommendations: {
            immediate_actions: hyperspectralResult.recommendations || [],
            monitoring_advice: ['Continue regular monitoring', 'Track vegetation indices'],
            preventive_measures: ['Maintain optimal growing conditions']
          },
          analysis_metadata: {
            model_version: 'Hyperspectral-v1.0',
            processing_time_ms: 2000,
            analysis_timestamp: hyperspectralResult.analysis_timestamp,
            accuracy_estimate: 0.85
          }
        };
      }

      setUploadStatus('success');
      setCurrentResult(result);
      onAnalysisComplete(result);
      setProcessingMessage('Analysis complete!');

    } catch (err) {
      console.error('Analysis failed:', err);
      setUploadStatus('error');
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
      setProcessingMessage('');
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadStatus('idle');
    setError(null);
    setCurrentResult(null);
    setProcessingMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          {analysisType === 'disease' ? (
            <Bug className="w-6 h-6 text-red-500" />
          ) : (
            <Leaf className="w-6 h-6 text-green-500" />
          )}
          <h2 className="text-xl font-semibold text-gray-800">
            {analysisType === 'disease' ? 'Disease Analysis' : 'Hyperspectral Analysis'}
          </h2>
        </div>
        {uploadStatus === 'success' && (
          <button
            onClick={clearSelection}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Crop Type Selector */}
      {analysisType === 'disease' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Crop Type (Optional)
          </label>
          <select
            value={cropType}
            onChange={(e) => setCropType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={uploadStatus === 'processing'}
          >
            {supportedCrops.map(crop => (
              <option key={crop} value={crop}>{crop}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Select specific crop for targeted disease detection or use "General" for all conditions
          </p>
        </div>
      )}

      {/* Upload Area */}
      {!selectedFile ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver
              ? 'border-green-400 bg-green-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileInputChange}
            accept="image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploadStatus === 'processing'}
          />
          
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className={`p-4 rounded-full ${dragOver ? 'bg-green-100' : 'bg-gray-100'}`}>
                <Upload className={`w-8 h-8 ${dragOver ? 'text-green-600' : 'text-gray-600'}`} />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Upload Crop Image for {analysisType === 'disease' ? 'Disease' : 'Hyperspectral'} Analysis
              </h3>
              <p className="text-gray-600 mb-4">
                Drag and drop your image here, or click to browse
              </p>
              
              <div className="flex justify-center">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                  disabled={uploadStatus === 'processing'}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Choose Image
                </button>
              </div>
              
              <p className="text-xs text-gray-500 mt-3">
                Supports: JPG, PNG, BMP, TIFF • Max size: 16MB
              </p>
            </div>
          </div>
        </div>
      ) : (
        // Preview and Analysis Section
        <div className="space-y-4">
          {/* Image Preview */}
          <div className="relative">
            <img
              src={previewUrl || ''}
              alt="Selected crop"
              className="w-full h-64 object-cover rounded-lg border"
            />
            <div className="absolute top-2 right-2">
              <button
                onClick={clearSelection}
                className="bg-white rounded-full p-1 shadow-md hover:shadow-lg transition-shadow"
                disabled={uploadStatus === 'processing'}
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* File Info */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <ImageIcon className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">{selectedFile.name}</span>
              <span className="text-xs text-gray-500">
                ({(selectedFile.size / 1024).toFixed(1)} KB)
              </span>
            </div>
            {analysisType === 'disease' && (
              <div className="mt-2 text-xs text-gray-600">
                Crop Type: <span className="font-medium">{cropType}</span>
              </div>
            )}
          </div>

          {/* Analysis Button */}
          {uploadStatus === 'idle' && (
            <button
              onClick={handleAnalyze}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
            >
              <TrendingUp className="w-5 h-5" />
              <span>
                Start {analysisType === 'disease' ? 'Disease' : 'Hyperspectral'} Analysis
              </span>
            </button>
          )}

          {/* Processing Status */}
          {(uploadStatus === 'uploading' || uploadStatus === 'processing') && (
            <div className="text-center py-4">
              <Loader className="w-8 h-8 animate-spin text-green-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">{processingMessage}</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-green-600 h-2 rounded-full transition-all duration-1000 w-2/3"></div>
              </div>
            </div>
          )}

          {/* Success Status */}
          {uploadStatus === 'success' && currentResult && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-medium text-green-800">Analysis Complete!</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Primary Detection:</span>
                  <div className="font-medium text-gray-800">
                    {currentResult.analysis_summary.primary_detection.disease}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Confidence:</span>
                  <div className="font-medium text-gray-800">
                    {(currentResult.analysis_summary.confidence * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Health Score:</span>
                  <div className="font-medium text-gray-800">
                    {(currentResult.analysis_summary.overall_health_score * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <div className={`font-medium ${
                    currentResult.analysis_summary.health_status === 'Excellent' ? 'text-green-600' :
                    currentResult.analysis_summary.health_status === 'Good' ? 'text-green-500' :
                    currentResult.analysis_summary.health_status === 'Fair' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {currentResult.analysis_summary.health_status}
                  </div>
                </div>
              </div>
              
              {currentResult.recommendations.immediate_actions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-green-200">
                  <span className="text-xs text-gray-600 block mb-1">Immediate Actions:</span>
                  <ul className="text-xs text-gray-700 space-y-1">
                    {currentResult.recommendations.immediate_actions.slice(0, 2).map((action, idx) => (
                      <li key={idx}>• {action}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Error Status */}
          {uploadStatus === 'error' && error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h3 className="font-medium text-red-800">Analysis Failed</h3>
              </div>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={() => setUploadStatus('idle')}
                className="mt-3 text-sm text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AgricultureImageUpload;
