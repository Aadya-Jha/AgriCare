import React, { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import apiService from '../services/api';

interface UploadProgress {
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  message: string;
}

interface ProcessingResults {
  image_id: number;
  filename: string;
  indices: {
    ndvi: number;
    savi: number;
    evi: number;
    mcari: number;
    red_edge_position: number;
  };
  analysis_results: {
    processing_status: string;
    health_assessment: {
      overall_health: string;
      stress_indicators: string;
      vegetation_coverage: string;
    };
  };
}

interface ImageUploadProps {
  fieldId?: number;
  onUploadComplete?: (results: ProcessingResults) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ fieldId = 1, onUploadComplete }) => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    status: 'idle',
    progress: 0,
    message: 'Ready to upload hyperspectral images'
  });
  const [processingResults, setProcessingResults] = useState<ProcessingResults | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  const pollProcessingStatus = useCallback(async (jobId: string) => {
    const maxAttempts = 60; // 5 minutes with 5-second intervals
    let attempts = 0;

    const checkStatus = async () => {
      try {
        const data = await apiService.getImageStatus(jobId);

        if (data.status === 'completed' && data.result) {
          setUploadProgress({
            status: 'completed',
            progress: 100,
            message: 'Processing completed successfully!'
          });
          
          setProcessingResults(data.result);
          onUploadComplete?.(data.result);
          return;
        } else if (data.status === 'processing') {
          const progress = Math.min(50 + (attempts * 45) / maxAttempts, 95);
          setUploadProgress({
            status: 'processing',
            progress: data.progress || progress,
            message: 'Processing hyperspectral data with MATLAB engine...'
          });
          
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(checkStatus, 5000); // Check every 5 seconds
          } else {
            setUploadProgress({
              status: 'error',
              progress: 0,
              message: 'Processing timeout - please try again'
            });
          }
        } else if (data.status === 'error') {
          setUploadProgress({
            status: 'error',
            progress: 0,
            message: data.error || 'Processing failed'
          });
        }
      } catch (error) {
        setUploadProgress({
          status: 'error',
          progress: 0,
          message: 'Error checking processing status'
        });
      }
    };

    checkStatus();
  }, [onUploadComplete]);

  const uploadFile = useCallback(async (file: File) => {
    try {
      setUploadProgress({
        status: 'uploading',
        progress: 25,
        message: 'Uploading image...'
      });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('field_id', fieldId.toString());

      const data = await apiService.uploadImage(formData);
      setCurrentJobId(data.job_id);
      
      setUploadProgress({
        status: 'processing',
        progress: 50,
        message: 'Upload complete. Starting hyperspectral analysis...'
      });

      // Start polling for processing results
      pollProcessingStatus(data.job_id);

    } catch (error) {
      setUploadProgress({
        status: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : 'Upload failed'
      });
    }
  }, [fieldId, pollProcessingStatus]);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/tiff', 'image/tif'];
    
    if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().match(/\.(jpg|jpeg|png|tiff|tif|hdr|bil|bsq|bip)$/)) {
      setUploadProgress({
        status: 'error',
        progress: 0,
        message: 'Please select a valid image file (JPEG, PNG, TIFF, or hyperspectral format)'
      });
      return;
    }

    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      setUploadProgress({
        status: 'error',
        progress: 0,
        message: 'File size too large. Please select a file under 100MB'
      });
      return;
    }

    uploadFile(file);
  }, [uploadFile]);

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
      message: 'Ready to upload hyperspectral images'
    });
    setProcessingResults(null);
  };

  const getStatusIcon = () => {
    switch (uploadProgress.status) {
      case 'uploading':
      case 'processing':
        return <Clock className="w-6 h-6 text-yellow-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Upload className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (uploadProgress.status) {
      case 'uploading':
      case 'processing':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Hyperspectral Image Analysis</h2>
        <p className="text-gray-600">Upload crop images for AI-powered vegetation analysis using MATLAB processing</p>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver
            ? 'border-green-400 bg-green-50'
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
              {uploadProgress.status === 'idle' ? 'Drop your image here or click to select' : uploadProgress.message}
            </p>
            {uploadProgress.status === 'idle' && (
              <p className="text-sm text-gray-500 mt-1">
                Supports JPEG, PNG, TIFF, and hyperspectral formats (HDR, BIL, BSQ, BIP)
              </p>
            )}
          </div>

          {uploadProgress.status === 'idle' && (
            <input
              type="file"
              accept="image/*,.hdr,.bil,.bsq,.bip"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
              id="file-upload"
            />
          )}
          
          {uploadProgress.status === 'idle' ? (
            <label
              htmlFor="file-upload"
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 cursor-pointer transition-colors"
            >
              Select Image
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
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getStatusColor()}`}
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
            Analysis Results
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vegetation Indices */}
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-3">Vegetation Indices</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">NDVI:</span>
                  <span className="font-medium">{processingResults.indices.ndvi.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">SAVI:</span>
                  <span className="font-medium">{processingResults.indices.savi.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">EVI:</span>
                  <span className="font-medium">{processingResults.indices.evi.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">MCARI:</span>
                  <span className="font-medium">{processingResults.indices.mcari.toFixed(3)}</span>
                </div>
              </div>
            </div>

            {/* Health Assessment */}
            <div className="bg-yellow-50 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-3">Health Assessment</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Overall Health:</span>
                  <span className={`font-medium ${
                    processingResults.analysis_results.health_assessment.overall_health === 'Excellent' ? 'text-green-600' :
                    processingResults.analysis_results.health_assessment.overall_health === 'Good' ? 'text-green-500' :
                    processingResults.analysis_results.health_assessment.overall_health === 'Fair' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {processingResults.analysis_results.health_assessment.overall_health}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Stress Level:</span>
                  <span className="font-medium">{processingResults.analysis_results.health_assessment.stress_indicators}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Coverage:</span>
                  <span className="font-medium">{processingResults.analysis_results.health_assessment.vegetation_coverage}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {processingResults.analysis_results.health_assessment.overall_health !== 'Excellent' && (
            <div className="mt-4 bg-blue-50 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 mr-2" />
                <div>
                  <h4 className="font-medium text-blue-800 mb-2">Recommendations</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Monitor crop development closely</li>
                    <li>• Consider adjusting irrigation schedule</li>
                    <li>• Check for pest or disease signs</li>
                    {processingResults.indices.ndvi < 0.5 && (
                      <li>• Consider nutrient supplementation</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={resetUpload}
            className="mt-4 w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
          >
            Upload Another Image
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
