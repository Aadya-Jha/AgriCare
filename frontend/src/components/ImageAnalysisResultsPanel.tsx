import React, { useState } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  TrendingUp, 
  Eye, 
  Target,
  Zap,
  BarChart3,
  Palette,
  Layers,
  ChevronDown,
  ChevronUp,
  Bug,
  Pill
} from 'lucide-react';
import { ImageAnalysisResult } from '../services/api';

interface Props {
  result: ImageAnalysisResult;
  analysisType?: 'disease' | 'hyperspectral';
}

const ImageAnalysisResultsPanel: React.FC<Props> = ({ result, analysisType = 'disease' }) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    detection: true,
    recommendations: true,
    features: false,
    metadata: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'Excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'Good': return 'text-green-500 bg-green-50 border-green-200';
      case 'Fair': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Poor': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getDiseaseRiskColor = (disease: string) => {
    if (disease === 'Healthy') return 'text-green-600 bg-green-100';
    if (disease.includes('Blight') || disease.includes('Blast')) return 'text-red-600 bg-red-100';
    if (disease.includes('Spot') || disease.includes('Rust')) return 'text-orange-600 bg-orange-100';
    if (disease.includes('Pest') || disease.includes('Damage')) return 'text-purple-600 bg-purple-100';
    return 'text-yellow-600 bg-yellow-100';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Activity className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">
            Analysis Results - {analysisType === 'disease' ? 'Disease Detection' : 'Hyperspectral'}
          </h2>
        </div>
        <div className="text-xs text-gray-500">
          {new Date(result.analysis_metadata.analysis_timestamp).toLocaleString()}
        </div>
      </div>

      {/* Overall Health Score */}
      <div className="mb-6">
        <div className={`rounded-lg p-4 border-2 ${getHealthStatusColor(result.analysis_summary.health_status)}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Overall Health Assessment</h3>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-2xl font-bold">
                {(result.analysis_summary.overall_health_score * 100).toFixed(1)}%
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">{result.analysis_summary.health_status}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span className="text-sm">
                Confidence: {(result.analysis_summary.confidence * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span className="text-sm">
                Crop: {result.crop_type}
              </span>
            </div>
          </div>

          {/* Health Score Bar */}
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-1000"
                style={{ 
                  width: `${result.analysis_summary.overall_health_score * 100}%`,
                  backgroundColor: result.analysis_summary.overall_health_score > 0.8 ? '#10b981' : 
                                   result.analysis_summary.overall_health_score > 0.6 ? '#f59e0b' : '#ef4444'
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Detection */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('detection')}
          className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Bug className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-800">Primary Detection</h3>
          </div>
          {expandedSections.detection ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {expandedSections.detection && (
          <div className="mt-4 p-4 border border-gray-200 rounded-lg">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-3 ${getDiseaseRiskColor(result.analysis_summary.primary_detection.disease)}`}>
              {result.analysis_summary.primary_detection.disease}
            </div>
            
            <p className="text-gray-700 mb-4">
              {result.analysis_summary.primary_detection.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Confidence Score</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {(result.analysis_summary.primary_detection.confidence * 100).toFixed(1)}%
                </div>
                <div className="w-full bg-blue-200 rounded-full h-1 mt-2">
                  <div 
                    className="bg-blue-600 h-1 rounded-full transition-all duration-1000"
                    style={{ width: `${result.analysis_summary.primary_detection.confidence * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Model Accuracy</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {(result.analysis_metadata.accuracy_estimate * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-green-700 mt-1">
                  Model: {result.analysis_metadata.model_version}
                </div>
              </div>
            </div>

            {/* All Detections */}
            {result.analysis_summary.all_detections.length > 1 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">All Detected Conditions:</h4>
                <div className="space-y-2">
                  {result.analysis_summary.all_detections.slice(0, 3).map((detection, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">{detection.disease}</span>
                      <span className="text-xs text-gray-500">
                        {(detection.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('recommendations')}
          className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Pill className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-semibold text-gray-800">Treatment Recommendations</h3>
          </div>
          {expandedSections.recommendations ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {expandedSections.recommendations && (
          <div className="mt-4 space-y-4">
            {/* Immediate Actions */}
            {result.recommendations.immediate_actions.length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <h4 className="font-medium text-red-800">Immediate Actions Required</h4>
                </div>
                <ul className="space-y-1">
                  {result.recommendations.immediate_actions.map((action, idx) => (
                    <li key={idx} className="text-sm text-red-700">
                      • {action}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Monitoring Advice */}
            {result.recommendations.monitoring_advice.length > 0 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <Eye className="w-4 h-4 text-yellow-600" />
                  <h4 className="font-medium text-yellow-800">Monitoring & Follow-up</h4>
                </div>
                <ul className="space-y-1">
                  {result.recommendations.monitoring_advice.map((advice, idx) => (
                    <li key={idx} className="text-sm text-yellow-700">
                      • {advice}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Preventive Measures */}
            {result.recommendations.preventive_measures.length > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <h4 className="font-medium text-blue-800">Preventive Measures</h4>
                </div>
                <ul className="space-y-1">
                  {result.recommendations.preventive_measures.map((measure, idx) => (
                    <li key={idx} className="text-sm text-blue-700">
                      • {measure}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image Features */}
      {result.image_features && (
        <div className="mb-6">
          <button
            onClick={() => toggleSection('features')}
            className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Palette className="w-5 h-5 text-purple-500" />
              <h3 className="text-lg font-semibold text-gray-800">Image Analysis Features</h3>
            </div>
            {expandedSections.features ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          {expandedSections.features && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Color Distribution */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                  <Palette className="w-4 h-4 mr-2" />
                  Color Distribution
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Green</span>
                    <span className="text-sm font-medium text-green-600">
                      {result.image_features.color_distribution.green_percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Brown</span>
                    <span className="text-sm font-medium text-yellow-600">
                      {result.image_features.color_distribution.brown_percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Yellow</span>
                    <span className="text-sm font-medium text-yellow-500">
                      {result.image_features.color_distribution.yellow_percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Texture Analysis */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                  <Layers className="w-4 h-4 mr-2" />
                  Texture Analysis
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Smoothness</span>
                    <span className="text-sm font-medium text-blue-600">
                      {result.image_features.texture_analysis.smoothness.toFixed(3)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Roughness</span>
                    <span className="text-sm font-medium text-orange-600">
                      {result.image_features.texture_analysis.roughness.toFixed(3)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Uniformity</span>
                    <span className="text-sm font-medium text-green-600">
                      {result.image_features.texture_analysis.uniformity.toFixed(3)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shape Analysis */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Shape Analysis
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Leaf Coverage</span>
                    <span className="text-sm font-medium text-green-600">
                      {result.image_features.shape_analysis.leaf_area_coverage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Edge Quality</span>
                    <span className="text-sm font-medium text-blue-600">
                      {result.image_features.shape_analysis.edge_detection_score.toFixed(3)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Statistical Measures */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Statistical Measures
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Mean Intensity</span>
                    <span className="text-sm font-medium text-gray-600">
                      {result.image_features.statistical_measures.mean_intensity}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Std Deviation</span>
                    <span className="text-sm font-medium text-gray-600">
                      {result.image_features.statistical_measures.standard_deviation.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Technical Metadata */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('metadata')}
          className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Info className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-800">Technical Details</h3>
          </div>
          {expandedSections.metadata ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {expandedSections.metadata && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-3">Processing Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Processing Time</span>
                  <span className="font-medium">{result.analysis_metadata.processing_time_ms}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Model Version</span>
                  <span className="font-medium">{result.analysis_metadata.model_version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Accuracy</span>
                  <span className="font-medium">
                    {(result.analysis_metadata.accuracy_estimate * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-3">Image Properties</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Resolution</span>
                  <span className="font-medium">{result.image_properties.resolution}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">File Size</span>
                  <span className="font-medium">{result.image_properties.file_size_kb} KB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quality Score</span>
                  <span className="font-medium">
                    {(result.image_properties.quality_score * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageAnalysisResultsPanel;
