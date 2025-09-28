import React from 'react';
import { LocationPrediction } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface VegetationIndicesChartProps {
  locationData: LocationPrediction;
}

const VegetationIndicesChart: React.FC<VegetationIndicesChartProps> = ({ locationData }) => {
  const metrics = locationData.health_metrics;

  const data = [
    {
      name: 'NDVI',
      value: metrics.ndvi,
      fullName: 'Normalized Difference Vegetation Index',
      range: '0.0 - 1.0',
      description: 'Overall vegetation health'
    },
    {
      name: 'SAVI',
      value: metrics.savi,
      fullName: 'Soil Adjusted Vegetation Index',
      range: '0.0 - 1.0',
      description: 'Vegetation accounting for soil brightness'
    },
    {
      name: 'EVI',
      value: metrics.evi,
      fullName: 'Enhanced Vegetation Index',
      range: '0.0 - 1.0',
      description: 'Enhanced sensitivity in high biomass regions'
    }
  ];

  const getBarColor = (value: number) => {
    if (value >= 0.7) return '#10b981'; // green
    if (value >= 0.5) return '#3b82f6'; // blue
    if (value >= 0.3) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-semibold text-gray-900">{data.fullName}</p>
          <p className="text-sm text-gray-600 mb-2">{data.description}</p>
          <p className="text-lg font-bold" style={{ color: getBarColor(data.value) }}>
            {data.value.toFixed(3)}
          </p>
          <p className="text-xs text-gray-500">Range: {data.range}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Vegetation Indices
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Spectral indices derived from hyperspectral analysis for {locationData.location}
        </p>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                domain={[0, 1]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.value)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Index Interpretations */}
        <div className="mt-4 space-y-2">
          <div className="grid grid-cols-3 gap-4 text-sm">
            {data.map((item) => (
              <div key={item.name} className="text-center">
                <div className="font-medium text-gray-900">{item.name}</div>
                <div 
                  className="text-lg font-bold"
                  style={{ color: getBarColor(item.value) }}
                >
                  {item.value.toFixed(3)}
                </div>
                <div className="text-xs text-gray-500">
                  {item.value >= 0.7 ? 'Excellent' :
                   item.value >= 0.5 ? 'Good' :
                   item.value >= 0.3 ? 'Fair' : 'Poor'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Health Status Indicator */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Overall Vegetation Health:
            </span>
            <span 
              className="font-bold text-lg"
              style={{ color: getBarColor(metrics.overall_health_score) }}
            >
              {Math.round(metrics.overall_health_score * 100)}%
            </span>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${metrics.overall_health_score * 100}%`,
                  backgroundColor: getBarColor(metrics.overall_health_score)
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VegetationIndicesChart;
