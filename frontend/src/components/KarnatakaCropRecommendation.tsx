import React, { useState, useEffect } from 'react';
import './KarnatakaCropRecommendation.css';
import { apiService } from '../services/api';

interface WeatherData {
  temperature: number;
  humidity: number;
  description: string;
  wind_speed: number;
  pressure: number;
  visibility: number;
  uv_index: number;
  last_updated: string;
}

interface LocationInfo {
  coordinates: [number, number];
  district: string;
  zone: string;
  soil_type: string;
  elevation: number;
}

interface CropDetails {
  seasons: string[];
  water_requirement: string;
  temperature_range: [number, number];
  rainfall_requirement: [number, number];
  soil_types: string[];
  growth_duration: number;
  yield_per_acre: string;
  investment: string;
}

interface CropRecommendation {
  crop: string;
  suitability_score: number;
  suitability_factors: string[];
  crop_details: CropDetails;
}

interface GrowthStage {
  stage_number: number;
  stage_name: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  activities: string[];
}

interface GrowthPlan {
  crop: string;
  total_duration: number;
  planting_date: string;
  expected_harvest: string;
  stages: GrowthStage[];
  investment_details: {
    initial_investment: string;
    expected_yield: string;
    water_requirement: string;
  };
}

interface DetailedRecommendation extends CropRecommendation {
  growth_plan: GrowthPlan;
}

interface ComprehensiveAnalysis {
  location: string;
  analysis_summary: {
    location_details: LocationInfo;
    weather_conditions: WeatherData;
    current_season: string;
    total_crops_analyzed: number;
    suitable_crops_found: number;
  };
  crop_recommendations: CropRecommendation[];
  detailed_recommendations_with_plans: DetailedRecommendation[];
  seasonal_advice: {
    current_season: string;
    season_description: string;
    general_recommendations: string[];
  };
  analysis_timestamp: string;
}

const KARNATAKA_LOCATIONS = [
  'Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum', 'Gulbarga', 'Shimoga', 'Hassan'
];

const KarnatakaCropRecommendation: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<string>('Bangalore');
  const [analysisData, setAnalysisData] = useState<ComprehensiveAnalysis | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [selectedCropPlan, setSelectedCropPlan] = useState<string>('');

  const fetchAnalysis = async (location: string) => {
    setLoading(true);
    setError('');
    
    try {
      const data = await apiService.getComprehensiveAnalysis(location);
      
      if (data.status === 'success') {
        setAnalysisData(data);
      } else {
        setError(data.message || 'Failed to fetch analysis');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis(selectedLocation);
  }, [selectedLocation]);

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
    setSelectedCropPlan('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getSuitabilityColor = (score: number) => {
    if (score >= 80) return '#28a745';
    if (score >= 60) return '#ffc107';
    if (score >= 40) return '#fd7e14';
    return '#dc3545';
  };

  if (loading) {
    return (
      <div className="karnataka-crop-recommendation">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Analyzing crop suitability for {selectedLocation}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="karnataka-crop-recommendation">
      <div className="header-section">
        <h2>🌾 Karnataka Crop Recommendation System</h2>
        <p className="subtitle">AI-powered crop suggestions based on current weather and local conditions</p>
      </div>

      <div className="location-selector">
        <h3>Select Location in Karnataka:</h3>
        <div className="location-grid">
          {KARNATAKA_LOCATIONS.map((location) => (
            <button
              key={location}
              className={`location-btn ${selectedLocation === location ? 'active' : ''}`}
              onClick={() => handleLocationChange(location)}
            >
              {location}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
          <button onClick={() => fetchAnalysis(selectedLocation)} className="retry-btn">
            Try Again
          </button>
        </div>
      )}

      {analysisData && (
        <div className="analysis-results">
          {/* Location & Weather Summary */}
          <div className="summary-section">
            <div className="location-info card">
              <h3>📍 {analysisData.location} Overview</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">District:</span>
                  <span className="value">{analysisData.analysis_summary.location_details.district}</span>
                </div>
                <div className="info-item">
                  <span className="label">Zone:</span>
                  <span className="value">{analysisData.analysis_summary.location_details.zone}</span>
                </div>
                <div className="info-item">
                  <span className="label">Soil Type:</span>
                  <span className="value">{analysisData.analysis_summary.location_details.soil_type}</span>
                </div>
                <div className="info-item">
                  <span className="label">Elevation:</span>
                  <span className="value">{analysisData.analysis_summary.location_details.elevation}m</span>
                </div>
              </div>
            </div>

            <div className="weather-info card">
              <h3>🌤️ Current Weather</h3>
              <div className="weather-grid">
                <div className="weather-item primary">
                  <span className="weather-value">{analysisData.analysis_summary.weather_conditions.temperature}°C</span>
                  <span className="weather-label">Temperature</span>
                </div>
                <div className="weather-item">
                  <span className="weather-value">{analysisData.analysis_summary.weather_conditions.humidity}%</span>
                  <span className="weather-label">Humidity</span>
                </div>
                <div className="weather-item">
                  <span className="weather-value">{analysisData.analysis_summary.weather_conditions.wind_speed} km/h</span>
                  <span className="weather-label">Wind Speed</span>
                </div>
                <div className="weather-item">
                  <span className="weather-value">{analysisData.analysis_summary.weather_conditions.uv_index}</span>
                  <span className="weather-label">UV Index</span>
                </div>
              </div>
              <div className="weather-description">
                {(analysisData.analysis_summary.weather_conditions as any).condition || (analysisData.analysis_summary.weather_conditions as any).description || 'Clear'}
              </div>
            </div>
          </div>

          {/* Seasonal Advice */}
          <div className="seasonal-advice card">
            <h3>📅 Current Season: {analysisData.seasonal_advice.current_season}</h3>
            <p className="season-description">{analysisData.seasonal_advice.season_description}</p>
            <div className="recommendations-list">
              <h4>General Recommendations:</h4>
              <ul>
                {analysisData.seasonal_advice.general_recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Crop Recommendations */}
          <div className="crop-recommendations">
            <h3>🌱 Recommended Crops ({analysisData.analysis_summary.suitable_crops_found} suitable crops found)</h3>
            <div className="crops-grid">
              {analysisData.crop_recommendations.map((crop, index) => (
                <div key={index} className="crop-card">
                  <div className="crop-header">
                    <h4>{crop.crop}</h4>
                    <div 
                      className="suitability-score"
                      style={{ backgroundColor: getSuitabilityColor(crop.suitability_score) }}
                    >
                      {(crop.suitability_score * 100).toFixed(1)}%
                    </div>
                  </div>
                  
                  <div className="crop-details">
                    <div className="detail-row">
                      <span>Duration:</span>
                      <span>{crop.crop_details.growth_duration} days</span>
                    </div>
                    <div className="detail-row">
                      <span>Water Need:</span>
                      <span>{crop.crop_details.water_requirement}</span>
                    </div>
                    <div className="detail-row">
                      <span>Expected Yield:</span>
                      <span>{crop.crop_details.yield_per_acre}</span>
                    </div>
                    <div className="detail-row">
                      <span>Investment:</span>
                      <span>{crop.crop_details.investment}</span>
                    </div>
                  </div>

                  <div className="suitability-factors">
                    <h5>Suitability Factors:</h5>
                    <ul>
                      {((crop as any).factors || (crop as any).suitability_factors || []).map((factor: string, fIndex: number) => (
                        <li key={fIndex}>{factor}</li>
                      ))}
                    </ul>
                  </div>

                  <button 
                    className="view-plan-btn"
                    onClick={() => setSelectedCropPlan(selectedCropPlan === crop.crop ? '' : crop.crop)}
                  >
                    {selectedCropPlan === crop.crop ? 'Hide Plan' : 'View Growth Plan'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Growth Plans */}
          {selectedCropPlan && (
            <div className="growth-plan-section">
              {(() => {
                // Find growth plan data from multiple possible sources
                let growthPlanData = null;
                
                // First try detailed recommendations with plans
                if (analysisData.detailed_recommendations_with_plans) {
                  const detailedRec = analysisData.detailed_recommendations_with_plans.find(rec => rec.crop === selectedCropPlan);
                  if (detailedRec && detailedRec.growth_plan) {
                    growthPlanData = detailedRec.growth_plan;
                  }
                }
                
                // If not found, try to get from regular recommendations
                if (!growthPlanData) {
                  const cropRec = analysisData.crop_recommendations.find(rec => rec.crop === selectedCropPlan);
                  if (cropRec) {
                    // Create a mock growth plan based on crop details
                    growthPlanData = {
                      crop_name: cropRec.crop,
                      total_duration_days: cropRec.crop_details.growth_duration,
                      expected_yield: cropRec.crop_details.yield_per_acre,
                      stages: [
                        {
                          name: 'Land Preparation',
                          duration: '7-10 days',
                          start_date: 'Week 1',
                          end_date: 'Week 1-2',
                          activities: ['Plowing', 'Soil testing', 'Fertilizer application', 'Field preparation']
                        },
                        {
                          name: 'Sowing',
                          duration: '3-5 days',
                          start_date: 'Week 2',
                          end_date: 'Week 2',
                          activities: ['Seed treatment', 'Sowing', 'Initial irrigation']
                        },
                        {
                          name: 'Vegetative Growth',
                          duration: '30-45 days',
                          start_date: 'Week 3',
                          end_date: 'Week 8',
                          activities: ['Regular irrigation', 'Weed control', 'Top dressing', 'Pest monitoring']
                        },
                        {
                          name: 'Reproductive Phase',
                          duration: '20-30 days',
                          start_date: 'Week 9',
                          end_date: 'Week 12',
                          activities: ['Flowering support', 'Pollination management', 'Disease control', 'Water management']
                        },
                        {
                          name: 'Maturity & Harvest',
                          duration: '7-14 days',
                          start_date: `Week ${Math.ceil(cropRec.crop_details.growth_duration / 7) - 1}`,
                          end_date: `Week ${Math.ceil(cropRec.crop_details.growth_duration / 7)}`,
                          activities: ['Harvest preparation', 'Harvesting', 'Post-harvest processing', 'Storage']
                        }
                      ],
                      investment_breakdown: {
                        seeds: '₹3,000 - ₹5,000',
                        fertilizers: '₹8,000 - ₹12,000',
                        labor: '₹10,000 - ₹15,000',
                        total_estimated: cropRec.crop_details.investment
                      }
                    };
                  }
                }
                
                return growthPlanData ? (
                  <div className="growth-plan card">
                    <h3>📋 Growth Plan for {selectedCropPlan}</h3>
                    
                    <div className="plan-summary">
                      <div className="summary-item">
                        <span className="label">Crop:</span>
                        <span className="value">{(growthPlanData as any).crop_name || selectedCropPlan}</span>
                      </div>
                      <div className="summary-item">
                        <span className="label">Total Duration:</span>
                        <span className="value">{(growthPlanData as any).total_duration_days || (growthPlanData as any).total_duration || 'N/A'} days</span>
                      </div>
                      <div className="summary-item">
                        <span className="label">Expected Yield:</span>
                        <span className="value">{(growthPlanData as any).expected_yield || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="growth-stages">
                      <h4>Growth Stages:</h4>
                      {((growthPlanData as any).stages || []).map((stage: any, stageIndex: number) => (
                        <div key={stageIndex} className="growth-stage">
                          <div className="stage-header">
                            <h5>Stage {stageIndex + 1}: {stage.name || stage.stage_name}</h5>
                            <span className="stage-duration">{stage.duration || stage.duration_days} {typeof stage.duration === 'number' ? 'days' : ''}</span>
                          </div>
                          
                          <div className="stage-dates">
                            {stage.start_date} - {stage.end_date}
                          </div>
                          
                          <div className="stage-activities">
                            <h6>Activities:</h6>
                            <ul>
                              {(stage.activities || []).map((activity: string, actIndex: number) => (
                                <li key={actIndex}>{activity}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="investment-summary">
                      <h4>Investment Breakdown:</h4>
                      <div className="investment-grid">
                        <div className="investment-item">
                          <span className="label">Seeds:</span>
                          <span className="value">{(growthPlanData as any).investment_breakdown?.seeds || 'N/A'}</span>
                        </div>
                        <div className="investment-item">
                          <span className="label">Fertilizers:</span>
                          <span className="value">{(growthPlanData as any).investment_breakdown?.fertilizers || 'N/A'}</span>
                        </div>
                        <div className="investment-item">
                          <span className="label">Labor:</span>
                          <span className="value">{(growthPlanData as any).investment_breakdown?.labor || 'N/A'}</span>
                        </div>
                        <div className="investment-item">
                          <span className="label">Total Estimated:</span>
                          <span className="value">{(growthPlanData as any).investment_breakdown?.total_estimated || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="growth-plan card">
                    <h3>📋 Growth Plan for {selectedCropPlan}</h3>
                    <div className="no-plan-message">
                      <p>Growth plan data is not available for this crop at the moment.</p>
                      <p>Please try refreshing the analysis or contact support for detailed growth plans.</p>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          <div className="analysis-footer">
            <p className="analysis-timestamp">
              Analysis completed on {formatDate(analysisData.analysis_timestamp)}
            </p>
            <button 
              onClick={() => fetchAnalysis(selectedLocation)} 
              className="refresh-btn"
            >
              🔄 Refresh Analysis
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KarnatakaCropRecommendation;
