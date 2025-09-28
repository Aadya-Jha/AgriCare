import React from 'react';
import { LocationPrediction } from '../services/api';
import { Activity, TrendingUp, Droplets, Leaf, Bug, Thermometer } from 'lucide-react';

interface HealthMetricsOverviewProps {
  locationData: LocationPrediction;
}

const HealthMetricsOverview: React.FC<HealthMetricsOverviewProps> = ({ locationData }) => {
  const metrics = locationData.health_metrics;

  const MetricCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string;
    color: string;
    description?: string;
  }> = ({ icon, label, value, color, description }) => (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex items-center">
        <div className={`flex-shrink-0 ${color}`}>
          {icon}
        </div>
        <div className="ml-3 flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          <p className={`text-lg font-bold ${color}`}>{value}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
      </div>
    </div>
  );

  const getHealthColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-blue-600';
    if (score >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskColor = (score: number) => {
    if (score >= 0.7) return 'text-red-600';
    if (score >= 0.4) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Health Metrics - {locationData.location}
        </h3>
        
        <div className="grid grid-cols-1 gap-4">
          <MetricCard
            icon={<Activity className="h-5 w-5" />}
            label="Overall Health Score"
            value={`${Math.round(metrics.overall_health_score * 100)}%`}
            color={getHealthColor(metrics.overall_health_score)}
            description="Combined health assessment"
          />
          
          <MetricCard
            icon={<TrendingUp className="h-5 w-5" />}
            label="NDVI"
            value={metrics.ndvi.toFixed(3)}
            color="text-green-600"
            description="Vegetation health indicator"
          />
          
          <MetricCard
            icon={<TrendingUp className="h-5 w-5" />}
            label="SAVI"
            value={metrics.savi.toFixed(3)}
            color="text-blue-600"
            description="Soil-adjusted vegetation index"
          />
          
          <MetricCard
            icon={<TrendingUp className="h-5 w-5" />}
            label="EVI"
            value={metrics.evi.toFixed(3)}
            color="text-purple-600"
            description="Enhanced vegetation index"
          />
          
          <MetricCard
            icon={<Droplets className="h-5 w-5" />}
            label="Water Stress Index"
            value={`${Math.round(metrics.water_stress_index * 100)}%`}
            color={getRiskColor(metrics.water_stress_index)}
            description="Water availability stress"
          />
          
          <MetricCard
            icon={<Leaf className="h-5 w-5" />}
            label="Chlorophyll Content"
            value={`${Math.round(metrics.chlorophyll_content)} mg/m²`}
            color="text-green-500"
            description="Leaf chlorophyll density"
          />
          
          <MetricCard
            icon={<Thermometer className="h-5 w-5" />}
            label="Predicted Yield"
            value={`${metrics.predicted_yield.toFixed(2)}x`}
            color="text-purple-600"
            description="Yield multiplier factor"
          />
          
          <MetricCard
            icon={<Bug className="h-5 w-5" />}
            label="Pest Risk"
            value={`${Math.round(metrics.pest_risk_score * 100)}%`}
            color={getRiskColor(metrics.pest_risk_score)}
            description="Pest infestation probability"
          />
          
          <MetricCard
            icon={<Activity className="h-5 w-5" />}
            label="Disease Risk"
            value={`${Math.round(metrics.disease_risk_score * 100)}%`}
            color={getRiskColor(metrics.disease_risk_score)}
            description="Disease occurrence probability"
          />
        </div>

        {/* Risk Assessment Summary */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">Risk Assessment</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-blue-700">Pest Risk Level:</p>
              <p className={`text-sm font-medium ${getRiskColor(metrics.pest_risk_score)}`}>
                {metrics.pest_risk_score > 0.7 ? 'High' : 
                 metrics.pest_risk_score > 0.4 ? 'Medium' : 'Low'}
              </p>
            </div>
            <div>
              <p className="text-xs text-blue-700">Disease Risk Level:</p>
              <p className={`text-sm font-medium ${getRiskColor(metrics.disease_risk_score)}`}>
                {metrics.disease_risk_score > 0.7 ? 'High' : 
                 metrics.disease_risk_score > 0.4 ? 'Medium' : 'Low'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthMetricsOverview;
