import React from 'react';
import { LocationPrediction } from '../services/api';
import { MapPin, Thermometer, Droplets, TrendingUp, AlertTriangle } from 'lucide-react';

interface LocationCardProps {
  location: LocationPrediction;
  isSelected: boolean;
  onClick: () => void;
}

const LocationCard: React.FC<LocationCardProps> = ({ location, isSelected, onClick }) => {
  const healthScore = location.health_metrics.overall_health_score;
  const getHealthColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-blue-600 bg-blue-100';
    if (score >= 0.4) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getHealthStatus = (score: number) => {
    if (score >= 0.8) return 'Excellent';
    if (score >= 0.6) return 'Good';
    if (score >= 0.4) return 'Fair';
    return 'Poor';
  };

  const getRiskLevel = () => {
    const pestRisk = location.health_metrics.pest_risk_score;
    const diseaseRisk = location.health_metrics.disease_risk_score;
    const maxRisk = Math.max(pestRisk, diseaseRisk);
    
    if (maxRisk > 0.7) return { level: 'High', color: 'text-red-600' };
    if (maxRisk > 0.5) return { level: 'Medium', color: 'text-yellow-600' };
    return { level: 'Low', color: 'text-green-600' };
  };

  const riskInfo = getRiskLevel();

  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer p-4 border-2
        ${isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-transparent hover:border-gray-200'}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <MapPin className="h-5 w-5 text-gray-500 mr-2" />
          <h3 className="font-semibold text-lg text-gray-900">{location.location}</h3>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(healthScore)}`}>
          {Math.round(healthScore * 100)}%
        </div>
      </div>

      {/* Location Details */}
      <div className="text-sm text-gray-600 mb-3">
        <p><strong>State:</strong> {location.state}</p>
        <p><strong>Climate:</strong> {location.climate}</p>
      </div>

      {/* Health Status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
          <span className="text-sm font-medium">Health: {getHealthStatus(healthScore)}</span>
        </div>
        <div className="flex items-center">
          <AlertTriangle className={`h-4 w-4 mr-1 ${riskInfo.color}`} />
          <span className={`text-sm font-medium ${riskInfo.color}`}>
            {riskInfo.level} Risk
          </span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div className="flex items-center">
          <TrendingUp className="h-4 w-4 text-blue-500 mr-2" />
          <div>
            <p className="text-xs text-gray-500">NDVI</p>
            <p className="text-sm font-medium">{location.health_metrics.ndvi.toFixed(3)}</p>
          </div>
        </div>
        <div className="flex items-center">
          <Droplets className="h-4 w-4 text-blue-400 mr-2" />
          <div>
            <p className="text-xs text-gray-500">Water Stress</p>
            <p className="text-sm font-medium">
              {Math.round(location.health_metrics.water_stress_index * 100)}%
            </p>
          </div>
        </div>
      </div>

      {/* Major Crops */}
      <div className="mb-3">
        <p className="text-xs text-gray-500 mb-1">Major Crops:</p>
        <div className="flex flex-wrap gap-1">
          {location.major_crops.slice(0, 3).map((crop, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
            >
              {crop}
            </span>
          ))}
          {location.major_crops.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
              +{location.major_crops.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Yield Prediction */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Thermometer className="h-4 w-4 text-purple-500 mr-2" />
          <span className="text-sm text-gray-600">Yield Factor:</span>
        </div>
        <span className="font-medium text-purple-600">
          {location.health_metrics.predicted_yield.toFixed(2)}x
        </span>
      </div>

      {/* Last Updated */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          Updated: {new Date(location.analysis_timestamp).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default LocationCard;
