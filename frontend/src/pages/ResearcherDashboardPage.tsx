import React, { useState } from 'react';
import { useRealTimeDashboard, useRealTimeTrends } from '../hooks/useApi';
import { FieldMap } from '../components/FieldMap';
import { TrendsChart } from '../components/TrendsChart';
import GTranslateLoader from '../components/GTranslateLoader';
import { ErrorBoundary } from '../components/ErrorBoundary';
import AnimatedBackground from '../components/AnimatedBackground';
import HyperspectralAnalysisPage from './HyperspectralAnalysisPage';
import { AlertTriangle, RefreshCw, BarChart3, Map, Zap, Microscope, Database, FlaskConical } from 'lucide-react';

export const ResearcherDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'research-tools' | 'hyperspectral'>('overview');
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number} | null>(null);
  const { data: summary, loading: loadingSummary, error: summaryError, refetch: refetchSummary } = useRealTimeDashboard(600000); // 10 minutes
  const { data: trends, loading: loadingTrends, error: trendsError, refetch: refetchTrends } = useRealTimeTrends(1, 600000); // 10 minutes
  
  // Handle location selection from map
  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    // Trigger refetch with new location data
    refetchSummary();
    refetchTrends();
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'good':
      case 'optimal':
        return 'text-green-600';
      case 'warning':
      case 'medium':
        return 'text-yellow-600';
      case 'urgent':
      case 'high':
        return 'text-red-600';
      default:
        return 'text-gray-900';
    }
  };

  // Show loading state
  if (loadingSummary) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card">
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-1"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
            </div>
          ))}
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading research dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state with retry
  if (summaryError) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
            <h2 className="text-lg font-semibold text-red-800">Dashboard Error</h2>
          </div>
          <p className="text-red-700 mb-4">{summaryError}</p>
          <div className="flex gap-3">
            <button
              onClick={refetchSummary}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <AnimatedBackground variant="dashboard">
        <div className="space-y-6 animate-fade-in">
          <div className="gtranslate_wrapper"></div>
          <GTranslateLoader />

          {/* Tab Navigation */}
          <div className="rounded-lg shadow-sm border border-gray-200" style={{backgroundColor: 'var(--agricare-light)'}}>
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200" style={{background: 'linear-gradient(135deg, var(--agricare-primary) 0%, var(--agricare-secondary) 100%)'}}>
              <h1 className="text-xl font-heading font-semibold text-white flex items-center space-x-3">
                <Microscope className="h-6 w-6" />
                <span>Research & Academic Dashboard</span>
              </h1>
              <div className="text-green-100 text-sm">
                Advanced Agricultural Analysis Platform
              </div>
            </div>
            <nav className="flex space-x-8 px-6" aria-label="Dashboard tabs" style={{backgroundColor: 'var(--agricare-sage)'}}>
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'overview'
                    ? 'text-white'
                    : 'hover:text-white'
                }`}
                style={{
                  color: activeTab === 'overview' ? 'white' : 'var(--agricare-primary)',
                  borderBottomColor: activeTab === 'overview' ? 'white' : 'transparent'
                }}
              >
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Farm Overview</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('research-tools')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'research-tools'
                    ? 'text-white'
                    : 'hover:text-white'
                }`}
                style={{
                  color: activeTab === 'research-tools' ? 'white' : 'var(--agricare-primary)',
                  borderBottomColor: activeTab === 'research-tools' ? 'white' : 'transparent'
                }}
              >
                <div className="flex items-center space-x-2">
                  <FlaskConical className="h-5 w-5" />
                  <span>Research Tools</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <>
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card" style={{backgroundColor: 'var(--agricare-light)', border: '1px solid var(--agricare-sage)'}}>
                  <h3 className="text-sm" style={{color: 'var(--agricare-primary)'}}>Crop Health</h3>
                  {!summary ? (
                    <div className="mt-4 h-8 bg-gray-100 rounded animate-pulse" />
                  ) : (
                    <>
                      <p className={`text-3xl font-heading font-semibold mt-2 ${statusColor(summary.crop_health?.status?.toLowerCase() || 'unknown')}`}>
                        {summary.crop_health?.status || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">NDVI: {(summary.crop_health?.ndvi || 0).toFixed(2)}</p>
                    </>
                  )}
                </div>
                <div className="card" style={{backgroundColor: 'var(--agricare-light)', border: '1px solid var(--agricare-sage)'}}>
                  <h3 className="text-sm" style={{color: 'var(--agricare-primary)'}}>Soil Moisture</h3>
                  {!summary ? (
                    <div className="mt-4 h-8 bg-gray-100 rounded animate-pulse" />
                  ) : (
                    <>
                      <p className="text-3xl font-heading font-semibold mt-2">{summary.soil_moisture?.value || 0}%</p>
                      <p className={`text-sm mt-1 ${statusColor(summary.soil_moisture?.status || 'unknown')}`}>
                        {summary.soil_moisture?.status === 'optimal' ? 'Optimal' : (summary.soil_moisture?.status || 'Unknown')}
                      </p>
                    </>
                  )}
                </div>
                <div className="card" style={{backgroundColor: 'var(--agricare-light)', border: '1px solid var(--agricare-sage)'}}>
                  <h3 className="text-sm" style={{color: 'var(--agricare-primary)'}}>Pest Risk</h3>
                  {!summary ? (
                    <div className="mt-4 h-8 bg-gray-100 rounded animate-pulse" />
                  ) : (
                    <>
                      <p className={`text-3xl font-heading font-semibold mt-2 ${statusColor(summary.pest_risk?.level || 'unknown')}`}>
                        {summary.pest_risk?.level ? summary.pest_risk.level.charAt(0).toUpperCase() + summary.pest_risk.level.slice(1) : 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">{(summary.pest_risk?.detected_pests || []).join(', ') || 'No pests detected'}</p>
                    </>
                  )}
                </div>
                <div className="card" style={{backgroundColor: 'var(--agricare-light)', border: '1px solid var(--agricare-sage)'}}>
                  <h3 className="text-sm" style={{color: 'var(--agricare-primary)'}}>Irrigation Advice</h3>
                  {!summary ? (
                    <div className="mt-4 h-8 bg-gray-100 rounded animate-pulse" />
                  ) : (
                    <>
                      <p className={`text-3xl font-heading font-semibold mt-2 ${statusColor(summary.irrigation_advice?.status || 'unknown')}`}>
                        {summary.irrigation_advice?.recommendation || 'Maintain'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">{summary.irrigation_advice?.reason || 'Standard maintenance'}</p>
                    </>
                  )}
                </div>
              </section>

              <section className="card" style={{backgroundColor: 'var(--agricare-light)', border: '1px solid var(--agricare-sage)'}}>
                <h2 className="text-lg font-heading font-semibold flex items-center space-x-2">
                  <Map className="h-5 w-5" />
                  <span>Field Map</span>
                </h2>
                <p className="text-sm text-gray-600 mt-2">Interactive map with field boundaries and sensor locations</p>
                <div className="mt-4 h-96">
                  <FieldMap summary={summary} className="h-full" onLocationSelect={handleLocationSelect} />
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-heading font-semibold flex items-center space-x-2">
                      <Zap className="h-5 w-5" />
                      <span>Agricultural Trends</span>
                    </h2>
                    <p className="text-sm text-gray-600">Real-time monitoring of key agricultural metrics</p>
                  </div>
                </div>
                {trendsError ? (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <p className="text-orange-700 mb-2">Unable to load trends data: {trendsError}</p>
                    <button
                      onClick={refetchTrends}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <TrendsChart 
                    trends={trends} 
                    loading={loadingTrends} 
                    className=""
                  />
                )}
              </section>
            </>
          )}


          {activeTab === 'research-tools' && (
            <div className="space-y-6">
              {/* Research Tools Section */}
              <div className="card" style={{backgroundColor: 'var(--agricare-light)', border: '1px solid var(--agricare-sage)'}}>
                <div className="flex items-center space-x-3 mb-6">
                  <Database className="h-6 w-6" style={{color: 'var(--agricare-primary)'}} />
                  <h2 className="text-xl font-semibold" style={{color: 'var(--agricare-primary)'}}>Advanced Research Tools</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Microscope className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-800">Hyperspectral Analysis</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Advanced RGB to hyperspectral conversion using deep learning models</p>
                    <div className="space-y-2 text-xs text-gray-500">
                      <div>• 424-band spectral conversion</div>
                      <div>• MATLAB integration</div>
                      <div>• Vegetation indices (NDVI, SAVI, EVI)</div>
                    </div>
                    <button 
                      onClick={() => setActiveTab('hyperspectral')}
                      className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm"
                    >
                      Access Tool
                    </button>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <BarChart3 className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-gray-800">Statistical Analysis</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Comprehensive statistical tools for agricultural research</p>
                    <div className="space-y-2 text-xs text-gray-500">
                      <div>• Yield prediction models</div>
                      <div>• Correlation analysis</div>
                      <div>• Time series forecasting</div>
                    </div>
                    <button className="mt-3 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm">
                      Launch Analysis
                    </button>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <Database className="h-5 w-5 text-purple-600" />
                      </div>
                      <h3 className="font-semibold text-gray-800">Data Export</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Export research data in various formats for analysis</p>
                    <div className="space-y-2 text-xs text-gray-500">
                      <div>• CSV, JSON, Excel formats</div>
                      <div>• Custom date ranges</div>
                      <div>• Filtered datasets</div>
                    </div>
                    <button className="mt-3 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded text-sm">
                      Export Data
                    </button>
                  </div>
                </div>
              </div>

              {/* Academic Resources */}
              <div className="card" style={{backgroundColor: 'var(--agricare-light)', border: '1px solid var(--agricare-sage)'}}>
                <h2 className="text-lg font-semibold mb-4" style={{color: 'var(--agricare-primary)'}}>Academic Resources</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-800">Research Papers</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-gray-700">Hyperspectral Analysis in Precision Agriculture</p>
                          <p className="text-gray-500 text-xs">Published: Agricultural Science Journal, 2024</p>
                        </div>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-gray-700">Karnataka Crop Optimization Using AI</p>
                          <p className="text-gray-500 text-xs">Published: Indian Agricultural Research, 2024</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-800">Datasets</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-gray-700">Karnataka Agricultural Data 2020-2024</p>
                          <p className="text-gray-500 text-xs">8 locations, 10 crop types</p>
                        </div>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-gray-700">Hyperspectral Training Dataset</p>
                          <p className="text-gray-500 text-xs">424-band spectral data</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hyperspectral' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <button 
                  onClick={() => setActiveTab('research-tools')}
                  className="text-sm text-gray-600 hover:text-gray-800 flex items-center space-x-2"
                >
                  <span>← Back to Research Tools</span>
                </button>
              </div>
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <HyperspectralAnalysisPage />
              </div>
            </div>
          )}
        </div>
      </AnimatedBackground>
    </ErrorBoundary>
  );
};