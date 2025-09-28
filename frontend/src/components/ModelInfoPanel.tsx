import React from 'react';
import { HyperspectralModelInfo } from '../services/api';
import { Brain, Cpu, Satellite, CheckCircle, XCircle, Info } from 'lucide-react';

interface ModelInfoPanelProps {
  modelInfo: HyperspectralModelInfo;
  loading: boolean;
}

const ModelInfoPanel: React.FC<ModelInfoPanelProps> = ({ modelInfo, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    );
  }

  const InfoRow: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string | React.ReactNode;
    color?: string;
  }> = ({ icon, label, value, color = "text-gray-600" }) => (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center">
        <div className={`mr-2 ${color}`}>{icon}</div>
        <span className="text-sm text-gray-700">{label}</span>
      </div>
      <div className="text-sm font-medium text-gray-900">{value}</div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <Brain className="h-6 w-6 text-blue-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">
            AI Model Information
          </h3>
        </div>

        <div className="space-y-1 border-b border-gray-100 pb-4 mb-4">
          <InfoRow
            icon={<Cpu className="h-4 w-4" />}
            label="Model Type"
            value={modelInfo.model_type}
            color="text-blue-500"
          />
          
          <InfoRow
            icon={<Satellite className="h-4 w-4" />}
            label="Spectral Bands"
            value={`${modelInfo.num_bands} bands`}
            color="text-purple-500"
          />
          
          <InfoRow
            icon={<Info className="h-4 w-4" />}
            label="Wavelength Range"
            value={`${modelInfo.wavelength_range[0]} - ${modelInfo.wavelength_range[1]} nm`}
            color="text-indigo-500"
          />
          
          <InfoRow
            icon={<CheckCircle className="h-4 w-4" />}
            label="Health Classes"
            value={modelInfo.health_classes.join(', ')}
            color="text-green-500"
          />
        </div>

        {/* MATLAB Status */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={modelInfo.matlab_available ? 'text-green-500' : 'text-orange-500'}>
                {modelInfo.matlab_available ? 
                  <CheckCircle className="h-4 w-4 mr-2" /> : 
                  <XCircle className="h-4 w-4 mr-2" />
                }
              </div>
              <span className="text-sm text-gray-700">MATLAB Integration</span>
            </div>
            <span className={`text-sm font-medium ${modelInfo.matlab_available ? 'text-green-600' : 'text-orange-600'}`}>
              {modelInfo.matlab_available ? 'Available' : 'Simulated'}
            </span>
          </div>
          {!modelInfo.matlab_available && (
            <p className="text-xs text-orange-600 mt-1 ml-6">
              Using simulated data for demonstration
            </p>
          )}
        </div>

        {/* Supported Locations */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">
            Supported Locations ({modelInfo.supported_locations.length})
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {modelInfo.supported_locations.map((location, index) => (
              <div 
                key={index}
                className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
              >
                {location}
              </div>
            ))}
          </div>
        </div>

        {/* Model Status */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Model Status</span>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-green-600 font-medium">Active</span>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Last Updated: {new Date(modelInfo.last_updated).toLocaleString()}
          </p>
        </div>

        {/* Technical Specifications */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">
            Technical Specifications
          </h4>
          <div className="text-xs text-gray-600 space-y-1">
            <p>• Deep CNN architecture optimized for hyperspectral data</p>
            <p>• Multi-layer 1D convolutions with batch normalization</p>
            <p>• Trained on Indian agricultural datasets</p>
            <p>• Real-time prediction capabilities</p>
            <p>• Climate-aware seasonal adjustments</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelInfoPanel;
