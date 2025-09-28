import React, { useState, useMemo } from 'react';
import { 
  useHyperspectralPredictions, 
  useHyperspectralModelInfo, 
  useHyperspectralTraining 
} from '../hooks/useApi';
// import HyperspectralMap from '../components/HyperspectralMap';
// import LocationCard from '../components/LocationCard';
// import VegetationIndicesChart from '../components/VegetationIndicesChart';
// import HealthMetricsOverview from '../components/HealthMetricsOverview';
// import ModelInfoPanel from '../components/ModelInfoPanel';
import { Activity, Satellite, TrendingUp, AlertTriangle, RefreshCw, Play } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';

const HyperspectralPage: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const { data: predictions, loading, error, refetch } = useHyperspectralPredictions();
  const { data: modelInfo } = useHyperspectralModelInfo();
  const { startTraining, loading: training } = useHyperspectralTraining();

  // Helper function to get health metrics (handle both object and array formats)
  const getHealthMetrics = (healthMetrics: any) => {
    if (!healthMetrics) return null;
    return Array.isArray(healthMetrics) ? healthMetrics[0] : healthMetrics;
  };

  // Calculate overall statistics - MUST be at the top level
  const overallStats = useMemo(() => {
    if (!predictions || !predictions.predictions) return null;

    const locationData = Object.values(predictions.predictions);
    if (locationData.length === 0) return null;

    // Calculate with proper null checks
    const avgHealth = locationData.reduce((sum, loc) => {
      const metrics = getHealthMetrics(loc.health_metrics);
      const score = metrics?.overall_health_score;
      return sum + (typeof score === 'number' ? score : 0);
    }, 0) / locationData.length;
    
    const avgNDVI = locationData.reduce((sum, loc) => {
      const metrics = getHealthMetrics(loc.health_metrics);
      const ndvi = metrics?.ndvi;
      return sum + (typeof ndvi === 'number' ? ndvi : 0);
    }, 0) / locationData.length;
    
    const avgYield = locationData.reduce((sum, loc) => {
      const metrics = getHealthMetrics(loc.health_metrics);
      const yield_val = metrics?.predicted_yield;
      return sum + (typeof yield_val === 'number' ? yield_val : 1);
    }, 0) / locationData.length;
    
    const highRiskCount = locationData.filter(loc => {
      const metrics = getHealthMetrics(loc.health_metrics);
      const score = metrics?.overall_health_score;
      return typeof score === 'number' && score < 0.5;
    }).length;
    
    return {
      avgHealth: typeof avgHealth === 'number' ? avgHealth * 100 : 0,
      avgNDVI: typeof avgNDVI === 'number' ? avgNDVI : 0,
      avgYield: typeof avgYield === 'number' ? avgYield : 1,
      highRiskCount,
      totalLocations: locationData.length
    };
  }, [predictions]);

  const locations = predictions ? Object.keys(predictions.predictions) : [];
  const selectedLocationData = selectedLocation && predictions ? 
    predictions.predictions[selectedLocation] : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading hyperspectral analysis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <AnimatedBackground variant="hyperspectral">
      <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Satellite className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Hyperspectral Analysis
                  </h1>
                  <p className="text-sm text-gray-500">
                    AI-powered crop health monitoring using hyperspectral imaging
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => startTraining()}
                  disabled={training}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  {training ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Training...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Train Model
                    </>
                  )}
                </button>
                <button
                  onClick={refetch}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Overall Statistics */}
        {overallStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Activity className="h-8 w-8 text-green-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Average Health Score
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {typeof overallStats?.avgHealth === 'number' ? overallStats.avgHealth.toFixed(1) : '0.0'}%
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-blue-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Average NDVI
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {typeof overallStats?.avgNDVI === 'number' ? overallStats.avgNDVI.toFixed(3) : '0.000'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Activity className="h-8 w-8 text-purple-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Predicted Yield Factor
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {typeof overallStats?.avgYield === 'number' ? overallStats.avgYield.toFixed(2) : '1.00'}x
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle className={`h-8 w-8 ${overallStats.highRiskCount > 0 ? 'text-red-500' : 'text-gray-400'}`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      High Risk Locations
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {overallStats.highRiskCount} / {overallStats.totalLocations}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Simple Location List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Indian Agricultural Locations ({locations.length})
          </h2>
          
          {predictions && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {locations.map((locationName) => {
                const locationData = predictions.predictions[locationName];
                const healthMetrics = getHealthMetrics(locationData?.health_metrics);
                const healthScore = healthMetrics?.overall_health_score;
                
                return (
                  <div 
                    key={locationName}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedLocation === locationName 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedLocation(locationName)}
                  >
                    <h3 className="font-semibold text-lg mb-2">{locationName}</h3>
                    <div className="space-y-1 text-sm">
                      <p><strong>State:</strong> {locationData?.state || 'Unknown'}</p>
                      <p><strong>Climate:</strong> {locationData?.climate || 'Unknown'}</p>
                      <p><strong>Health Score:</strong> {typeof healthScore === 'number' ? Math.round(healthScore * 100) : 0}%</p>
                      <p><strong>NDVI:</strong> {typeof healthMetrics?.ndvi === 'number' ? healthMetrics.ndvi.toFixed(3) : '0.000'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Location Details */}
        {selectedLocationData && (() => {
          const selectedHealthMetrics = getHealthMetrics(selectedLocationData.health_metrics);
          return (
            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Detailed Analysis - {selectedLocationData.location}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Health Metrics</h4>
                  <div className="space-y-2 text-sm">
                    <p>Overall Health: {typeof selectedHealthMetrics?.overall_health_score === 'number' ? Math.round(selectedHealthMetrics.overall_health_score * 100) : 0}%</p>
                    <p>NDVI: {typeof selectedHealthMetrics?.ndvi === 'number' ? selectedHealthMetrics.ndvi.toFixed(3) : '0.000'}</p>
                    <p>SAVI: {typeof selectedHealthMetrics?.savi === 'number' ? selectedHealthMetrics.savi.toFixed(3) : '0.000'}</p>
                    <p>EVI: {typeof selectedHealthMetrics?.evi === 'number' ? selectedHealthMetrics.evi.toFixed(3) : '0.000'}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Risk Assessment</h4>
                  <div className="space-y-2 text-sm">
                    <p>Water Stress: {typeof selectedHealthMetrics?.water_stress_index === 'number' ? Math.round(selectedHealthMetrics.water_stress_index * 100) : 0}%</p>
                    <p>Pest Risk: {typeof selectedHealthMetrics?.pest_risk_score === 'number' ? Math.round(selectedHealthMetrics.pest_risk_score * 100) : 0}%</p>
                    <p>Disease Risk: {typeof selectedHealthMetrics?.disease_risk_score === 'number' ? Math.round(selectedHealthMetrics.disease_risk_score * 100) : 0}%</p>
                    <p>Yield Factor: {typeof selectedHealthMetrics?.predicted_yield === 'number' ? selectedHealthMetrics.predicted_yield.toFixed(2) : '1.00'}x</p>
                  </div>
                </div>
              
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Major Crops</h4>
                  <div className="flex flex-wrap gap-1">
                    {(selectedLocationData?.major_crops || []).map((crop, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                      >
                        {crop}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-medium text-gray-900 mb-2">AI Recommendations</h4>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {(() => {
                    if (Array.isArray(selectedLocationData?.health_metrics)) {
                      // Handle array format - collect all unique recommendations
                      const allRecommendations: string[] = selectedLocationData.health_metrics.reduce((acc: string[], metrics: any) => {
                        if (metrics.recommendations) {
                          if (Array.isArray(metrics.recommendations)) {
                            acc.push(...metrics.recommendations.filter((r: any) => typeof r === 'string'));
                          } else if (typeof metrics.recommendations === 'string') {
                            acc.push(metrics.recommendations);
                          }
                        }
                        return acc;
                      }, []);
                      const uniqueRecommendations = Array.from(new Set(allRecommendations));
                      return uniqueRecommendations.map((rec: string, index: number) => (
                        <li key={index}>{rec}</li>
                      ));
                    } else {
                      // Handle object format
                      const recommendations = selectedHealthMetrics?.recommendations || [];
                      const recArray: string[] = Array.isArray(recommendations) 
                        ? recommendations.filter((r: any) => typeof r === 'string')
                        : typeof recommendations === 'string' ? [recommendations] : [];
                      return recArray.map((rec: string, index: number) => (
                        <li key={index}>{rec}</li>
                      ));
                    }
                  })()}
                </ul>
              </div>
            </div>
          );
        })()}

        {/* Model Information */}
        {modelInfo && (
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Model Type:</strong> {modelInfo.model_type}</p>
                <p><strong>Spectral Bands:</strong> {modelInfo.num_bands}</p>
                <p><strong>Wavelength Range:</strong> {modelInfo.wavelength_range[0]} - {modelInfo.wavelength_range[1]} nm</p>
              </div>
              <div>
                <p><strong>Health Classes:</strong> {modelInfo.health_classes.join(', ')}</p>
                <p><strong>MATLAB Available:</strong> {modelInfo.matlab_available ? 'Yes' : 'No (Simulated)'}</p>
                <p><strong>Last Updated:</strong> {new Date(modelInfo.last_updated).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Timestamp */}
        {predictions && (
          <div className="mt-6 text-center text-sm text-gray-500">
            Last analysis: {new Date(predictions.analysis_timestamp).toLocaleString()}
            {predictions.note && (
              <span className="ml-2 text-orange-600">({predictions.note})</span>
            )}
          </div>
        )}
      </div>
      </div>
    </AnimatedBackground>
  );
};

export default HyperspectralPage;
