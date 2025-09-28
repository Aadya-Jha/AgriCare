import React, { useState } from 'react';
import { MapPin, Volume2, Cloud, Thermometer, Droplets, Calendar, TrendingUp, Wheat, Users, AlertCircle } from 'lucide-react';

// Comprehensive Indian states data with climate and crop information
const INDIAN_STATES_DATA = {
  'Andhra Pradesh': {
    climate: 'Tropical',
    majorCrops: {
      kharif: ['Rice', 'Cotton', 'Sugarcane', 'Maize', 'Groundnut'],
      rabi: ['Rice', 'Groundnut', 'Sunflower', 'Safflower', 'Castor'],
      zaid: ['Rice', 'Fodder Crops', 'Vegetables']
    },
    soilTypes: ['Black Cotton Soil', 'Red Sandy Soil', 'Coastal Sandy Soil'],
    avgRainfall: '916 mm',
    bestCrops: 'Rice, Cotton, Chilli, Turmeric'
  },
  'Arunachal Pradesh': {
    climate: 'Temperate to Alpine',
    majorCrops: {
      kharif: ['Rice', 'Maize', 'Millet', 'Pulses'],
      rabi: ['Wheat', 'Barley', 'Mustard'],
      zaid: ['Vegetables', 'Fodder']
    },
    soilTypes: ['Mountain Soil', 'Forest Soil'],
    avgRainfall: '2782 mm',
    bestCrops: 'Rice, Maize, Citrus fruits, Ginger'
  },
  'Assam': {
    climate: 'Tropical Monsoon',
    majorCrops: {
      kharif: ['Rice', 'Jute', 'Sugarcane', 'Tea'],
      rabi: ['Mustard', 'Lentil', 'Pea', 'Wheat'],
      zaid: ['Rice', 'Vegetables', 'Fodder']
    },
    soilTypes: ['Alluvial Soil', 'Red Loamy Soil'],
    avgRainfall: '2818 mm',
    bestCrops: 'Tea, Rice, Jute, Silk'
  },
  'Bihar': {
    climate: 'Subtropical',
    majorCrops: {
      kharif: ['Rice', 'Maize', 'Sugarcane', 'Jute'],
      rabi: ['Wheat', 'Barley', 'Gram', 'Mustard'],
      zaid: ['Fodder', 'Vegetables']
    },
    soilTypes: ['Alluvial Soil', 'Red Soil'],
    avgRainfall: '1205 mm',
    bestCrops: 'Rice, Wheat, Maize, Sugarcane'
  },
  'Chhattisgarh': {
    climate: 'Tropical',
    majorCrops: {
      kharif: ['Rice', 'Maize', 'Sugarcane', 'Groundnut'],
      rabi: ['Wheat', 'Gram', 'Lentil', 'Mustard'],
      zaid: ['Fodder', 'Vegetables']
    },
    soilTypes: ['Red Sandy Soil', 'Mixed Red and Black Soil'],
    avgRainfall: '1292 mm',
    bestCrops: 'Rice, Maize, Sugarcane'
  },
  'Goa': {
    climate: 'Tropical',
    majorCrops: {
      kharif: ['Rice', 'Ragi', 'Pulses'],
      rabi: ['Rice', 'Pulses'],
      zaid: ['Vegetables', 'Fodder']
    },
    soilTypes: ['Laterite Soil', 'Coastal Sandy Soil'],
    avgRainfall: '3005 mm',
    bestCrops: 'Rice, Coconut, Cashew, Spices'
  },
  'Gujarat': {
    climate: 'Arid to Semi-arid',
    majorCrops: {
      kharif: ['Cotton', 'Groundnut', 'Rice', 'Sugarcane'],
      rabi: ['Wheat', 'Barley', 'Gram', 'Mustard'],
      zaid: ['Fodder', 'Cotton', 'Vegetables']
    },
    soilTypes: ['Black Cotton Soil', 'Alluvial Soil', 'Sandy Soil'],
    avgRainfall: '1107 mm',
    bestCrops: 'Cotton, Groundnut, Wheat, Pearl Millet'
  },
  'Haryana': {
    climate: 'Semi-arid',
    majorCrops: {
      kharif: ['Rice', 'Cotton', 'Sugarcane', 'Bajra'],
      rabi: ['Wheat', 'Barley', 'Gram', 'Mustard'],
      zaid: ['Fodder', 'Rice', 'Vegetables']
    },
    soilTypes: ['Alluvial Soil', 'Sandy Soil'],
    avgRainfall: '617 mm',
    bestCrops: 'Wheat, Rice, Cotton, Sugarcane'
  },
  'Himachal Pradesh': {
    climate: 'Temperate',
    majorCrops: {
      kharif: ['Rice', 'Maize'],
      rabi: ['Wheat', 'Barley'],
      zaid: ['Vegetables', 'Fodder']
    },
    soilTypes: ['Hill Soil', 'Mountain Soil'],
    avgRainfall: '1251 mm',
    bestCrops: 'Apple, Rice, Wheat, Maize'
  },
  'Jharkhand': {
    climate: 'Tropical',
    majorCrops: {
      kharif: ['Rice', 'Maize', 'Pulses'],
      rabi: ['Wheat', 'Barley', 'Gram'],
      zaid: ['Vegetables', 'Fodder']
    },
    soilTypes: ['Red Soil', 'Sandy Soil'],
    avgRainfall: '1463 mm',
    bestCrops: 'Rice, Wheat, Maize, Pulses'
  },
  'Karnataka': {
    climate: 'Tropical to Semi-arid',
    majorCrops: {
      kharif: ['Rice', 'Ragi', 'Maize', 'Cotton'],
      rabi: ['Rice', 'Jowar', 'Groundnut', 'Sunflower'],
      zaid: ['Fodder', 'Vegetables']
    },
    soilTypes: ['Red Soil', 'Black Soil', 'Laterite Soil'],
    avgRainfall: '1139 mm',
    bestCrops: 'Coffee, Rice, Cotton, Sugarcane'
  },
  'Kerala': {
    climate: 'Tropical',
    majorCrops: {
      kharif: ['Rice', 'Coconut', 'Areca nut'],
      rabi: ['Rice', 'Pulses'],
      zaid: ['Vegetables', 'Fodder']
    },
    soilTypes: ['Laterite Soil', 'Forest Soil', 'Alluvial Soil'],
    avgRainfall: '3055 mm',
    bestCrops: 'Coconut, Rice, Spices, Rubber'
  },
  'Madhya Pradesh': {
    climate: 'Tropical to Subtropical',
    majorCrops: {
      kharif: ['Rice', 'Maize', 'Cotton', 'Sugarcane'],
      rabi: ['Wheat', 'Barley', 'Gram', 'Mustard'],
      zaid: ['Fodder', 'Vegetables']
    },
    soilTypes: ['Black Soil', 'Red Soil', 'Alluvial Soil'],
    avgRainfall: '1194 mm',
    bestCrops: 'Soybean, Wheat, Rice, Cotton'
  },
  'Maharashtra': {
    climate: 'Tropical to Semi-arid',
    majorCrops: {
      kharif: ['Cotton', 'Rice', 'Sugarcane', 'Soybean'],
      rabi: ['Wheat', 'Jowar', 'Gram', 'Sunflower'],
      zaid: ['Fodder', 'Vegetables']
    },
    soilTypes: ['Black Cotton Soil', 'Red Soil', 'Laterite Soil'],
    avgRainfall: '1181 mm',
    bestCrops: 'Cotton, Sugarcane, Rice, Soybean'
  },
  'Manipur': {
    climate: 'Subtropical',
    majorCrops: {
      kharif: ['Rice', 'Maize'],
      rabi: ['Wheat', 'Barley'],
      zaid: ['Vegetables']
    },
    soilTypes: ['Hill Soil', 'Valley Soil'],
    avgRainfall: '1467 mm',
    bestCrops: 'Rice, Maize, Pulses'
  },
  'Meghalaya': {
    climate: 'Subtropical',
    majorCrops: {
      kharif: ['Rice', 'Maize'],
      rabi: ['Wheat', 'Barley'],
      zaid: ['Vegetables']
    },
    soilTypes: ['Red Loamy Soil', 'Laterite Soil'],
    avgRainfall: '2818 mm',
    bestCrops: 'Rice, Maize, Potato, Citrus'
  },
  'Mizoram': {
    climate: 'Tropical',
    majorCrops: {
      kharif: ['Rice', 'Maize'],
      rabi: ['Mustard', 'Rapeseed'],
      zaid: ['Vegetables']
    },
    soilTypes: ['Red Loamy Soil', 'Hill Soil'],
    avgRainfall: '2663 mm',
    bestCrops: 'Rice, Maize, Banana, Orange'
  },
  'Nagaland': {
    climate: 'Subtropical',
    majorCrops: {
      kharif: ['Rice', 'Maize'],
      rabi: ['Wheat', 'Barley'],
      zaid: ['Vegetables']
    },
    soilTypes: ['Red Loamy Soil', 'Mountain Soil'],
    avgRainfall: '2593 mm',
    bestCrops: 'Rice, Maize, Pulses, Oilseeds'
  },
  'Odisha': {
    climate: 'Tropical',
    majorCrops: {
      kharif: ['Rice', 'Cotton', 'Sugarcane', 'Jute'],
      rabi: ['Rice', 'Wheat', 'Mustard', 'Sunflower'],
      zaid: ['Rice', 'Fodder', 'Vegetables']
    },
    soilTypes: ['Red Soil', 'Laterite Soil', 'Deltaic Alluvial Soil'],
    avgRainfall: '1451 mm',
    bestCrops: 'Rice, Coconut, Cotton, Sugarcane'
  },
  'Punjab': {
    climate: 'Semi-arid',
    majorCrops: {
      kharif: ['Rice', 'Cotton', 'Sugarcane', 'Maize'],
      rabi: ['Wheat', 'Barley', 'Gram', 'Mustard'],
      zaid: ['Fodder', 'Rice', 'Vegetables']
    },
    soilTypes: ['Alluvial Soil', 'Sandy Soil'],
    avgRainfall: '649 mm',
    bestCrops: 'Wheat, Rice, Cotton, Sugarcane'
  },
  'Rajasthan': {
    climate: 'Arid to Semi-arid',
    majorCrops: {
      kharif: ['Bajra', 'Jowar', 'Maize', 'Cotton'],
      rabi: ['Wheat', 'Barley', 'Gram', 'Mustard'],
      zaid: ['Fodder', 'Vegetables']
    },
    soilTypes: ['Desert Soil', 'Red Soil', 'Black Soil'],
    avgRainfall: '531 mm',
    bestCrops: 'Pearl Millet, Wheat, Mustard, Barley'
  },
  'Sikkim': {
    climate: 'Temperate',
    majorCrops: {
      kharif: ['Rice', 'Maize'],
      rabi: ['Wheat', 'Barley'],
      zaid: ['Vegetables']
    },
    soilTypes: ['Mountain Soil', 'Forest Soil'],
    avgRainfall: '3557 mm',
    bestCrops: 'Cardamom, Rice, Maize, Wheat'
  },
  'Tamil Nadu': {
    climate: 'Tropical',
    majorCrops: {
      kharif: ['Rice', 'Cotton', 'Sugarcane', 'Groundnut'],
      rabi: ['Rice', 'Pulses', 'Oilseeds'],
      zaid: ['Rice', 'Fodder', 'Vegetables']
    },
    soilTypes: ['Black Soil', 'Red Soil', 'Alluvial Soil'],
    avgRainfall: '947 mm',
    bestCrops: 'Rice, Cotton, Sugarcane, Groundnut'
  },
  'Telangana': {
    climate: 'Tropical',
    majorCrops: {
      kharif: ['Rice', 'Cotton', 'Maize', 'Sugarcane'],
      rabi: ['Rice', 'Wheat', 'Sunflower', 'Safflower'],
      zaid: ['Rice', 'Fodder', 'Vegetables']
    },
    soilTypes: ['Black Cotton Soil', 'Red Sandy Soil'],
    avgRainfall: '906 mm',
    bestCrops: 'Rice, Cotton, Maize, Turmeric'
  },
  'Tripura': {
    climate: 'Subtropical',
    majorCrops: {
      kharif: ['Rice', 'Jute'],
      rabi: ['Rice', 'Wheat'],
      zaid: ['Vegetables']
    },
    soilTypes: ['Red Loamy Soil', 'Hill Soil'],
    avgRainfall: '2663 mm',
    bestCrops: 'Rice, Jute, Cotton, Tea'
  },
  'Uttar Pradesh': {
    climate: 'Subtropical',
    majorCrops: {
      kharif: ['Rice', 'Sugarcane', 'Cotton', 'Jute'],
      rabi: ['Wheat', 'Barley', 'Gram', 'Mustard'],
      zaid: ['Rice', 'Fodder', 'Vegetables']
    },
    soilTypes: ['Alluvial Soil', 'Black Soil'],
    avgRainfall: '1025 mm',
    bestCrops: 'Wheat, Rice, Sugarcane, Potato'
  },
  'Uttarakhand': {
    climate: 'Temperate',
    majorCrops: {
      kharif: ['Rice', 'Maize', 'Sugarcane'],
      rabi: ['Wheat', 'Barley', 'Mustard'],
      zaid: ['Fodder', 'Vegetables']
    },
    soilTypes: ['Mountain Soil', 'Alluvial Soil'],
    avgRainfall: '1611 mm',
    bestCrops: 'Rice, Wheat, Sugarcane, Potato'
  },
  'West Bengal': {
    climate: 'Tropical',
    majorCrops: {
      kharif: ['Rice', 'Jute', 'Sugarcane'],
      rabi: ['Rice', 'Wheat', 'Mustard', 'Potato'],
      zaid: ['Rice', 'Fodder', 'Vegetables']
    },
    soilTypes: ['Alluvial Soil', 'Red Soil', 'Laterite Soil'],
    avgRainfall: '1582 mm',
    bestCrops: 'Rice, Jute, Tea, Potato'
  }
};

interface AllIndiaCropRecommendationsProps {
  selectedState: string;
  onStateChange: (state: string) => void;
  selectedLanguage: string;
  onSpeak: (text: string) => void;
}

export const AllIndiaCropRecommendations: React.FC<AllIndiaCropRecommendationsProps> = ({
  selectedState,
  onStateChange,
  selectedLanguage,
  onSpeak
}) => {
  const [activeView, setActiveView] = useState<'seasonal' | 'climate' | 'market'>('seasonal');
  
  const stateData = INDIAN_STATES_DATA[selectedState as keyof typeof INDIAN_STATES_DATA];

  if (!stateData) {
    return <div>State data not available</div>;
  }

  const getSeasonIcon = (season: string) => {
    switch (season.toLowerCase()) {
      case 'kharif': return <Cloud className="h-5 w-5 text-blue-500" />;
      case 'rabi': return <Thermometer className="h-5 w-5 text-orange-500" />;
      case 'zaid': return <Droplets className="h-5 w-5 text-green-500" />;
      default: return <Calendar className="h-5 w-5 text-gray-500" />;
    }
  };

  const getSeasonDescription = (season: string) => {
    switch (season.toLowerCase()) {
      case 'kharif': 
        return {
          period: 'June - November (Monsoon)',
          hindi: 'जून - नवंबर (मानसून)',
          description: 'Monsoon season crops that depend on rainfall'
        };
      case 'rabi':
        return {
          period: 'November - April (Winter)',
          hindi: 'नवंबर - अप्रैल (सर्दी)',
          description: 'Winter season crops grown in cool weather'
        };
      case 'zaid':
        return {
          period: 'April - June (Summer)',
          hindi: 'अप्रैल - जून (गर्मी)',
          description: 'Summer season crops requiring irrigation'
        };
      default:
        return {
          period: '',
          hindi: '',
          description: ''
        };
    }
  };

  const speakStateInfo = () => {
    const content = `
      Climate information for ${selectedState}:
      Climate type: ${stateData.climate}.
      Average rainfall: ${stateData.avgRainfall}.
      Best crops: ${stateData.bestCrops}.
      Soil types include ${stateData.soilTypes.join(', ')}.
    `;
    onSpeak(content);
  };

  return (
    <div className="space-y-6">
      {/* State Selection and Info */}
      <div className="card" style={{backgroundColor: 'var(--agricare-light)', border: '1px solid var(--agricare-sage)'}}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <MapPin className="h-6 w-6" style={{color: 'var(--agricare-primary)'}} />
            <div>
              <h2 className="text-xl font-semibold" style={{color: 'var(--agricare-primary)'}}>
                {selectedState} Agriculture Profile
              </h2>
              <p className="text-sm text-gray-600">{selectedState} की कृषि प्रोफाइल</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={speakStateInfo}
              className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
              title="Listen to state information"
            >
              <Volume2 className="h-4 w-4" />
            </button>
            
            <select 
              value={selectedState} 
              onChange={(e) => onStateChange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
            >
              {Object.keys(INDIAN_STATES_DATA).map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Climate Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Cloud className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold text-blue-800">Climate</h3>
            </div>
            <p className="text-sm text-blue-700">{stateData.climate}</p>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Droplets className="h-5 w-5 text-green-500" />
              <h3 className="font-semibold text-green-800">Rainfall</h3>
            </div>
            <p className="text-sm text-green-700">{stateData.avgRainfall}</p>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Wheat className="h-5 w-5 text-yellow-500" />
              <h3 className="font-semibold text-yellow-800">Best Crops</h3>
            </div>
            <p className="text-sm text-yellow-700">{stateData.bestCrops}</p>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="h-5 w-5 text-purple-500" />
              <h3 className="font-semibold text-purple-800">Soil Types</h3>
            </div>
            <p className="text-xs text-purple-700">{stateData.soilTypes.join(', ')}</p>
          </div>
        </div>
      </div>

      {/* View Selector */}
      <div className="card" style={{backgroundColor: 'var(--agricare-light)', border: '1px solid var(--agricare-sage)'}}>
        <div className="flex items-center space-x-6 mb-6">
          <button
            onClick={() => setActiveView('seasonal')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeView === 'seasonal' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Seasonal Crops</span>
          </button>
          
          <button
            onClick={() => setActiveView('climate')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeView === 'climate' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Cloud className="h-4 w-4" />
            <span>Climate Guide</span>
          </button>
          
          <button
            onClick={() => setActiveView('market')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeView === 'market' 
                ? 'bg-purple-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            <span>Market Insights</span>
          </button>
        </div>

        {/* Seasonal Crops View */}
        {activeView === 'seasonal' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(stateData.majorCrops).map(([season, crops]) => {
              const seasonInfo = getSeasonDescription(season);
              return (
                <div key={season} className="bg-white border border-gray-200 rounded-lg p-5">
                  <div className="flex items-center space-x-3 mb-4">
                    {getSeasonIcon(season)}
                    <div>
                      <h3 className="font-semibold text-gray-800 capitalize">
                        {season} Season
                      </h3>
                      <p className="text-xs text-gray-500">{seasonInfo.period}</p>
                      <p className="text-xs text-gray-500">{seasonInfo.hindi}</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{seasonInfo.description}</p>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700 text-sm">Recommended Crops:</h4>
                    <ul className="space-y-1">
                      {crops.map((crop, index) => (
                        <li key={index} className="flex items-center space-x-2 text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-gray-700">{crop}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <button
                    onClick={() => onSpeak(`${season} season crops for ${selectedState}: ${crops.join(', ')}`)}
                    className="mt-3 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs flex items-center justify-center space-x-1"
                  >
                    <Volume2 className="h-3 w-3" />
                    <span>Listen</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Climate Guide View */}
        {activeView === 'climate' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                  <Thermometer className="h-5 w-5 text-orange-500" />
                  <span>Climate Characteristics</span>
                </h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <div>
                    <span className="font-medium">Type:</span> {stateData.climate}
                  </div>
                  <div>
                    <span className="font-medium">Annual Rainfall:</span> {stateData.avgRainfall}
                  </div>
                  <div>
                    <span className="font-medium">Dominant Soils:</span>
                    <ul className="mt-1 ml-4">
                      {stateData.soilTypes.map((soil, index) => (
                        <li key={index} className="flex items-center space-x-1">
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          <span>{soil}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  <span>Growing Conditions</span>
                </h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <h4 className="font-medium text-blue-800 mb-1">Best Growing Period</h4>
                    <p className="text-blue-700">Primary: June-November (Kharif)</p>
                    <p className="text-blue-700">Secondary: November-April (Rabi)</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <h4 className="font-medium text-green-800 mb-1">Irrigation Needs</h4>
                    <p className="text-green-700">
                      {stateData.avgRainfall.replace('mm', '') > '1000' 
                        ? 'Moderate irrigation required' 
                        : 'High irrigation required'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Market Insights View */}
        {activeView === 'market' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span>Market Opportunities</span>
              </h3>
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <h4 className="font-medium text-green-800 mb-1">High Demand Crops</h4>
                  <p className="text-sm text-green-700">{stateData.bestCrops}</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <h4 className="font-medium text-blue-800 mb-1">Regional Specialties</h4>
                  <p className="text-sm text-blue-700">
                    Crops with local processing facilities and established supply chains
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-500" />
                <span>Government Support</span>
              </h3>
              <div className="space-y-3">
                <div className="bg-purple-50 border border-purple-200 rounded p-3">
                  <h4 className="font-medium text-purple-800 mb-1">Available Schemes</h4>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• PM-KISAN Direct Income Support</li>
                    <li>• Crop Insurance Schemes</li>
                    <li>• Minimum Support Price (MSP)</li>
                    <li>• Soil Health Card Programme</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-800 mb-1">
              Need More Information? • और जानकारी चाहिए?
            </h3>
            <p className="text-sm text-gray-600">
              Contact your local agricultural extension office or Krishi Vigyan Kendra
            </p>
          </div>
          <button
            onClick={() => onSpeak(`For more agricultural guidance in ${selectedState}, contact your local Krishi Vigyan Kendra or agricultural extension office`)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Volume2 className="h-4 w-4" />
            <span>Listen</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllIndiaCropRecommendations;