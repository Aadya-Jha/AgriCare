import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { LocationPrediction } from '../services/api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet with React
try {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
} catch (error) {
  console.warn('Leaflet icon setup failed:', error);
}

interface HyperspectralMapProps {
  predictions: Record<string, LocationPrediction>;
  selectedLocation: string | null;
  onLocationSelect: (location: string | null) => void;
}

// Create custom markers based on health scores
const createHealthIcon = (healthScore: number) => {
  let color = '#10b981'; // green
  if (healthScore < 0.3) {
    color = '#ef4444'; // red
  } else if (healthScore < 0.5) {
    color = '#f59e0b'; // yellow
  } else if (healthScore < 0.7) {
    color = '#3b82f6'; // blue
  }

  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 10px;
        font-weight: bold;
      ">
        ${Math.round(healthScore * 100)}
      </div>
    `,
    className: 'custom-health-marker',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
};

const MapClickHandler: React.FC<{ onLocationSelect: (location: string | null) => void }> = ({ onLocationSelect }) => {
  useMapEvents({
    click: () => {
      onLocationSelect(null);
    },
  });
  return null;
};

const HyperspectralMap: React.FC<HyperspectralMapProps> = ({
  predictions,
  selectedLocation,
  onLocationSelect,
}) => {
  // Center the map on India
  const centerPosition: [number, number] = [20.5937, 78.9629];
  const zoomLevel = 5;

  return (
    <div className="h-96 w-full rounded-lg overflow-hidden border">
      <MapContainer
        center={centerPosition}
        zoom={zoomLevel}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapClickHandler onLocationSelect={onLocationSelect} />

        {Object.entries(predictions).map(([locationName, locationData]) => {
          const isSelected = selectedLocation === locationName;
          const healthScore = locationData.health_metrics.overall_health_score;
          
          return (
            <Marker
              key={locationName}
              position={[locationData.coordinates[0], locationData.coordinates[1]]}
              icon={createHealthIcon(healthScore)}
              eventHandlers={{
                click: () => {
                  onLocationSelect(locationName);
                },
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-lg mb-2">{locationName}</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>State:</strong> {locationData.state}</p>
                    <p><strong>Climate:</strong> {locationData.climate}</p>
                    <p><strong>Health Score:</strong> {Math.round(healthScore * 100)}%</p>
                    <p><strong>NDVI:</strong> {locationData.health_metrics.ndvi.toFixed(3)}</p>
                    <p><strong>Yield Factor:</strong> {locationData.health_metrics.predicted_yield.toFixed(2)}x</p>
                    <p><strong>Major Crops:</strong></p>
                    <ul className="list-disc list-inside ml-2">
                      {locationData.major_crops.map((crop, index) => (
                        <li key={index}>{crop}</li>
                      ))}
                    </ul>
                    <div className="mt-2 pt-2 border-t">
                      <button
                        onClick={() => onLocationSelect(locationName)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                      >
                        View Detailed Analysis →
                      </button>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default HyperspectralMap;
