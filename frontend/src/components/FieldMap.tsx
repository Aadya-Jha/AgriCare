/**
 * FieldMap Component
 * Location-aware interactive Leaflet map with user location detection
 * Shows field boundaries and sensor data based on user's location
 */

import React, { useMemo, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, CircleMarker, Popup, useMap, Rectangle, LayersControl, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { DashboardSummary } from '../services/api';
import { MapPin, Target, AlertTriangle, Navigation, Layers } from 'lucide-react';

// Fix Leaflet default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface FieldMapProps {
  summary?: DashboardSummary | null;
  className?: string;
  onLocationSelect?: (lat: number, lng: number) => void;
}

interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface LocationError {
  code: number;
  message: string;
}

// Generate field boundary around a center point
const generateFieldBoundary = (centerLat: number, centerLng: number): [number, number][] => {
  const offset = 0.002; // ~200m offset
  return [
    [centerLat - offset, centerLng - offset],
    [centerLat - offset, centerLng + offset],
    [centerLat + offset, centerLng + offset],
    [centerLat + offset, centerLng - offset],
    [centerLat - offset, centerLng - offset]
  ];
};

// Generate sensor locations around a center point
const generateSensorLocations = (centerLat: number, centerLng: number) => {
  const sensors = [
    { id: 1, type: 'soil_moisture', value: 29.7 + Math.random() * 20, status: 'optimal', ndvi: 0.82 },
    { id: 2, type: 'temperature', value: 22.0 + Math.random() * 8, status: 'good', ndvi: 0.75 },
    { id: 3, type: 'ph', value: 6.8 + Math.random() * 0.8, status: 'optimal', ndvi: 0.89 },
    { id: 4, type: 'humidity', value: 67.0 + Math.random() * 15, status: 'good', ndvi: 0.65 },
    { id: 5, type: 'soil_moisture', value: 18.2 + Math.random() * 12, status: 'warning', ndvi: 0.45 },
  ];
  
  return sensors.map(sensor => ({
    ...sensor,
    position: [
      centerLat + (Math.random() - 0.5) * 0.003,
      centerLng + (Math.random() - 0.5) * 0.003
    ] as [number, number]
  }));
};

// Generate NDVI zones around a center point
const generateNDVIZones = (centerLat: number, centerLng: number) => [
  {
    id: 'high_ndvi',
    bounds: [[centerLat - 0.001, centerLng - 0.001], [centerLat, centerLng]] as [[number, number], [number, number]],
    ndvi: 0.85,
    health: 'Excellent',
    color: '#10b981'
  },
  {
    id: 'medium_ndvi',
    bounds: [[centerLat, centerLng - 0.001], [centerLat + 0.001, centerLng]] as [[number, number], [number, number]],
    ndvi: 0.67,
    health: 'Good',
    color: '#22c55e'
  },
  {
    id: 'low_ndvi',
    bounds: [[centerLat - 0.001, centerLng], [centerLat, centerLng + 0.001]] as [[number, number], [number, number]],
    ndvi: 0.42,
    health: 'Fair',
    color: '#eab308'
  },
];

// Generate pest risk zones around a center point
const generatePestRiskZones = (centerLat: number, centerLng: number) => [
  {
    id: 'pest_high_risk',
    bounds: [[centerLat + 0.0005, centerLng - 0.0005], [centerLat + 0.0015, centerLng + 0.0005]] as [[number, number], [number, number]],
    risk: 'High',
    pests: ['Corn Borer', 'Aphids'],
    color: '#ef4444',
    opacity: 0.3
  },
  {
    id: 'pest_medium_risk',
    bounds: [[centerLat - 0.0015, centerLng - 0.0008], [centerLat - 0.0005, centerLng + 0.0002]] as [[number, number], [number, number]],
    risk: 'Medium',
    pests: ['Cutworms'],
    color: '#f97316',
    opacity: 0.2
  },
];

// Component to fit map bounds
const FitBounds: React.FC<{ bounds: [number, number][] }> = ({ bounds }) => {
  const map = useMap();
  
  React.useEffect(() => {
    if (bounds.length > 0) {
      const latLngs = bounds.map(coord => [coord[0], coord[1]] as [number, number]);
      const leafletBounds = L.latLngBounds(latLngs);
      map.fitBounds(leafletBounds.pad(0.1));
    }
  }, [map, bounds]);
  
  return null;
};

// Component to handle map clicks
const MapClickHandler: React.FC<{ onMapClick: (e: any) => void }> = ({ onMapClick }) => {
  const map = useMap();
  
  React.useEffect(() => {
    map.on('click', onMapClick);
    return () => {
      map.off('click', onMapClick);
    };
  }, [map, onMapClick]);
  
  return null;
};

export const FieldMap: React.FC<FieldMapProps> = ({ summary, className = '', onLocationSelect }) => {
  const [showNDVIZones, setShowNDVIZones] = useState(true);
  const [showPestRisk, setShowPestRisk] = useState(false);
  const [showSensors, setShowSensors] = useState(true);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationError, setLocationError] = useState<LocationError | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const [permissionRequested, setPermissionRequested] = useState(false);
  
  // Default location (Hyderabad, India - central location)
  const defaultLocation: [number, number] = [17.3850, 78.4867];
  
  // Current map center (user location or selected location or default)
  const mapCenter = useMemo(() => {
    if (selectedLocation) return selectedLocation;
    if (userLocation) return [userLocation.latitude, userLocation.longitude] as [number, number];
    return defaultLocation;
  }, [userLocation, selectedLocation]);
  
  // Request user location
  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError({ code: 0, message: 'Geolocation is not supported by this browser' });
      return;
    }
    
    setIsLoadingLocation(true);
    setPermissionRequested(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setLocationError(null);
        setIsLoadingLocation(false);
      },
      (error) => {
        setLocationError({ code: error.code, message: error.message });
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };
  
  // Auto-request location on component mount
  useEffect(() => {
    if (!permissionRequested) {
      setTimeout(() => requestLocation(), 1000); // Delay to show the component first
    }
  }, [permissionRequested]);
  
  // Handle map click to select location
  const handleMapClick = (e: any) => {
    const { lat, lng } = e.latlng;
    setSelectedLocation([lat, lng]);
    if (onLocationSelect) {
      onLocationSelect(lat, lng);
    }
  };
  
  // Generate dynamic data based on current location
  const fieldCoordinates = useMemo(() => generateFieldBoundary(mapCenter[0], mapCenter[1]), [mapCenter]);
  const sensorLocations = useMemo(() => generateSensorLocations(mapCenter[0], mapCenter[1]), [mapCenter]);
  const ndviZones = useMemo(() => generateNDVIZones(mapCenter[0], mapCenter[1]), [mapCenter]);
  const pestRiskZones = useMemo(() => generatePestRiskZones(mapCenter[0], mapCenter[1]), [mapCenter]);

  // Determine field color based on health status
  const getFieldColor = () => {
    if (!summary) return '#22c55e'; // default green
    
    const status = summary.crop_health.status.toLowerCase();
    switch (status) {
      case 'poor':
      case 'critical':
        return '#ef4444'; // red
      case 'fair':
      case 'warning':
        return '#fbbf24'; // yellow
      case 'good':
      case 'excellent':
      default:
        return '#22c55e'; // green
    }
  };

  // Get sensor marker color based on status
  const getSensorColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'critical':
      case 'poor':
        return '#ef4444'; // red
      case 'warning':
      case 'fair':
        return '#fbbf24'; // yellow
      case 'optimal':
      case 'good':
      default:
        return '#22c55e'; // green
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Location Controls */}
      <div className="absolute top-4 right-4 z-20 bg-white p-3 rounded-lg shadow-lg">
        <div className="flex flex-col space-y-2">
          <button
            onClick={requestLocation}
            disabled={isLoadingLocation}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoadingLocation ? (
              <Navigation className="w-4 h-4 animate-spin" />
            ) : (
              <Target className="w-4 h-4" />
            )}
            <span>{isLoadingLocation ? 'Getting Location...' : 'Use My Location'}</span>
          </button>
          
          {locationError && (
            <div className="bg-red-50 border border-red-200 rounded p-2 text-xs text-red-700">
              <div className="flex items-center space-x-1">
                <AlertTriangle className="w-3 h-3" />
                <span>Location Error</span>
              </div>
              <p className="mt-1">{locationError.message}</p>
              <p className="mt-1 text-gray-600">Click on the map to select a location</p>
            </div>
          )}
          
          {userLocation && (
            <div className="bg-green-50 border border-green-200 rounded p-2 text-xs text-green-700">
              <div className="flex items-center space-x-1">
                <MapPin className="w-3 h-3" />
                <span>Your Location</span>
              </div>
              <p className="mt-1">
                {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
              </p>
              <p className="text-gray-600">Accuracy: ±{Math.round(userLocation.accuracy)}m</p>
            </div>
          )}
          
          {selectedLocation && (
            <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs text-blue-700">
              <div className="flex items-center space-x-1">
                <MapPin className="w-3 h-3" />
                <span>Selected Location</span>
              </div>
              <p className="mt-1">
                {selectedLocation[0].toFixed(4)}, {selectedLocation[1].toFixed(4)}
              </p>
            </div>
          )}
        </div>
      </div>
      
      <MapContainer
        center={mapCenter}
        zoom={16}
        style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Satellite overlay option */}
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="OpenStreetMap">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellite">
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>
        </LayersControl>
        
        <FitBounds bounds={fieldCoordinates} />
        <MapClickHandler onMapClick={handleMapClick} />
        
        {/* User Location Marker */}
        {userLocation && (
          <CircleMarker
            center={[userLocation.latitude, userLocation.longitude]}
            radius={12}
            pathOptions={{
              color: '#3b82f6',
              weight: 3,
              opacity: 1,
              fillColor: '#3b82f6',
              fillOpacity: 0.8,
            }}
          >
            <Popup>
              <div className="p-2">
                <h4 className="font-medium text-blue-700">Your Location</h4>
                <p className="text-sm text-gray-600">Accuracy: ±{Math.round(userLocation.accuracy)}m</p>
              </div>
            </Popup>
          </CircleMarker>
        )}
        
        {/* Selected Location Marker */}
        {selectedLocation && (
          <CircleMarker
            center={selectedLocation}
            radius={10}
            pathOptions={{
              color: '#f59e0b',
              weight: 3,
              opacity: 1,
              fillColor: '#f59e0b',
              fillOpacity: 0.8,
            }}
          >
            <Popup>
              <div className="p-2">
                <h4 className="font-medium text-yellow-700">Selected Location</h4>
                <p className="text-sm text-gray-600">
                  {selectedLocation[0].toFixed(4)}, {selectedLocation[1].toFixed(4)}
                </p>
              </div>
            </Popup>
          </CircleMarker>
        )}
        
        {/* Field boundary */}
        <Polygon
          positions={fieldCoordinates}
          pathOptions={{
            color: getFieldColor(),
            weight: 3,
            opacity: 0.8,
            fillColor: getFieldColor(),
            fillOpacity: 0.1,
          }}
        >
          <Popup>
            <div className="p-3 min-w-48">
              <h3 className="font-semibold text-lg text-gray-800 mb-2">
                {summary?.field_info.name || 'Agricultural Field'}
              </h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Location:</span> 
                  {userLocation ? 'Your Area' : selectedLocation ? 'Selected Area' : 'Demo Area'}
                </p>
                <p><span className="font-medium">Crop:</span> {summary?.field_info.crop_type || 'Mixed Crops'}</p>
                <p><span className="font-medium">Area:</span> {summary?.field_info.area_hectares || '12.5'} hectares</p>
                {summary && (
                  <>
                    <p className="mt-2">
                      <span className="font-medium">Health:</span>
                      <span className={`ml-1 font-semibold ${
                        summary.crop_health.status.toLowerCase() === 'good' ? 'text-green-600' : 
                        summary.crop_health.status.toLowerCase() === 'warning' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {summary.crop_health.status}
                      </span>
                    </p>
                    <p><span className="font-medium">NDVI:</span> {summary.crop_health.ndvi.toFixed(3)}</p>
                    <p><span className="font-medium">Last Updated:</span> {new Date().toLocaleTimeString()}</p>
                  </>
                )}
                <p className="mt-2 text-xs text-gray-500">Real-time data updates every 10 minutes</p>
              </div>
            </div>
          </Popup>
        </Polygon>

        {/* NDVI Zones */}
        {showNDVIZones && ndviZones.map((zone) => (
          <Rectangle
            key={zone.id}
            bounds={zone.bounds}
            pathOptions={{
              color: zone.color,
              weight: 2,
              opacity: 0.8,
              fillColor: zone.color,
              fillOpacity: 0.3,
            }}
          >
            <Popup>
              <div className="p-2">
                <h4 className="font-medium text-gray-800">NDVI Zone</h4>
                <p className="text-sm">NDVI: {zone.ndvi.toFixed(3)}</p>
                <p className="text-sm">Health: <span className="font-medium" style={{color: zone.color}}>{zone.health}</span></p>
                <p className="text-xs text-gray-500 mt-1">Updated: {new Date().toLocaleTimeString()}</p>
              </div>
            </Popup>
          </Rectangle>
        ))}

        {/* Pest Risk Zones */}
        {showPestRisk && pestRiskZones.map((zone) => (
          <Rectangle
            key={zone.id}
            bounds={zone.bounds}
            pathOptions={{
              color: zone.color,
              weight: 2,
              opacity: 0.7,
              fillColor: zone.color,
              fillOpacity: zone.opacity,
              dashArray: '5, 5'
            }}
          >
            <Popup>
              <div className="p-2">
                <h4 className="font-medium text-gray-800">Pest Risk Zone</h4>
                <p className="text-sm">Risk Level: <span className="font-medium" style={{color: zone.color}}>{zone.risk}</span></p>
                <p className="text-sm">Detected Pests:</p>
                <ul className="text-xs ml-2">
                  {zone.pests.map((pest, idx) => (
                    <li key={idx}>• {pest}</li>
                  ))}
                </ul>
                <p className="text-xs text-gray-500 mt-1">Last scan: {new Date().toLocaleTimeString()}</p>
              </div>
            </Popup>
          </Rectangle>
        ))}

        {/* Sensor markers */}
        {showSensors && sensorLocations.map((sensor) => (
          <CircleMarker
            key={sensor.id}
            center={sensor.position}
            radius={8}
            pathOptions={{
              color: getSensorColor(sensor.status),
              weight: 2,
              opacity: 0.9,
              fillColor: getSensorColor(sensor.status),
              fillOpacity: 0.7,
            }}
          >
            <Popup>
              <div className="p-2 min-w-32">
                <h4 className="font-medium text-gray-800">Sensor {sensor.id}</h4>
                <div className="mt-1 space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium">Type:</span> {sensor.type.replace('_', ' ')}</p>
                  <p><span className="font-medium">Value:</span> {sensor.value.toFixed(1)}</p>
                  <p><span className="font-medium">NDVI:</span> {sensor.ndvi.toFixed(3)}</p>
                  <p>
                    <span className="font-medium">Status:</span>
                    <span className={`ml-1 font-semibold capitalize ${
                      sensor.status === 'optimal' || sensor.status === 'good' ? 'text-green-600' :
                      sensor.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {sensor.status}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500">Updated: {new Date().toLocaleTimeString()}</p>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
      
      {/* Layer Controls */}
      <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-soft z-10">
        <h4 className="text-sm font-semibold mb-3 flex items-center">
          <Layers className="w-4 h-4 mr-2" />
          Map Layers
        </h4>
        <div className="space-y-2">
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              checked={showNDVIZones}
              onChange={(e) => setShowNDVIZones(e.target.checked)}
              className="mr-2 form-checkbox h-3 w-3 text-green-600"
            />
            NDVI Zones
          </label>
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              checked={showPestRisk}
              onChange={(e) => setShowPestRisk(e.target.checked)}
              className="mr-2 form-checkbox h-3 w-3 text-red-500"
            />
            Pest Risk
          </label>
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              checked={showSensors}
              onChange={(e) => setShowSensors(e.target.checked)}
              className="mr-2 form-checkbox h-3 w-3 text-blue-500"
            />
            Sensors
          </label>
        </div>
      </div>
      
      {/* Enhanced Legend */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-soft z-10 max-w-xs">
        <h4 className="text-sm font-semibold mb-2">Legend</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {showNDVIZones && (
            <>
              <div className="col-span-2 font-medium text-gray-700 mb-1">NDVI Health:</div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-crop-excellent rounded mr-2"></div>
                <span>Excellent (&gt;0.8)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-crop-good rounded mr-2"></div>
                <span>Good (0.6-0.8)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-crop-fair rounded mr-2"></div>
                <span>Fair (0.3-0.6)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-crop-poor rounded mr-2"></div>
                <span>Poor (&lt;0.3)</span>
              </div>
            </>
          )}
          {showPestRisk && (
            <>
              <div className="col-span-2 font-medium text-gray-700 mb-1 mt-2">Pest Risk:</div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded mr-2 opacity-40"></div>
                <span>High Risk</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-500 rounded mr-2 opacity-30"></div>
                <span>Medium Risk</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
