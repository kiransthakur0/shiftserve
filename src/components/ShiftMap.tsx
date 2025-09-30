'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Shift } from "../contexts/ShiftContext";

// Custom location marker icon
const userLocationIcon = L.divIcon({
  className: 'custom-location-marker',
  html: `
    <div style="position: relative; width: 40px; height: 40px;">
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 20px;
        height: 20px;
        background: #3b82f6;
        border: 4px solid white;
        border-radius: 50%;
        box-shadow: 0 0 10px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3);
        animation: pulse 2s infinite;
      "></div>
      <style>
        @keyframes pulse {
          0% {
            box-shadow: 0 0 10px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3);
          }
          50% {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.8), 0 0 30px rgba(59, 130, 246, 0.5);
          }
          100% {
            box-shadow: 0 0 10px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3);
          }
        }
      </style>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// Shift marker icons
const availableShiftIcon = L.divIcon({
  className: 'available-shift-marker',
  html: `
    <div style="
      width: 24px;
      height: 24px;
      background: #10b981;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "></div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const urgentShiftIcon = L.divIcon({
  className: 'urgent-shift-marker',
  html: `
    <div style="
      width: 28px;
      height: 28px;
      background: #f59e0b;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      animation: urgentPulse 1.5s infinite;
    "></div>
    <style>
      @keyframes urgentPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }
    </style>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const selectedShiftIcon = L.divIcon({
  className: 'selected-shift-marker',
  html: `
    <div style="
      width: 32px;
      height: 32px;
      background: #ef4444;
      border: 4px solid white;
      border-radius: 50%;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    "></div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

interface LocationData {
  lat: number;
  lng: number;
  timestamp: number;
}

interface ShiftMapProps {
  shifts: Shift[];
  maxDistance: number;
  selectedShift?: Shift | null;
  onShiftSelect?: (shift: Shift) => void;
}

// Component to recenter map when location changes
function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

export default function ShiftMap({ shifts, maxDistance, selectedShift, onShiftSelect }: ShiftMapProps) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [tracking, setTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  // Get user's geolocation on component mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      setIsLoadingLocation(false);
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // Cache for 5 minutes
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: position.timestamp,
        });
        setError(null);
        setIsLoadingLocation(false);
      },
      (error) => {
        console.warn("Geolocation error:", error.message);
        let errorMessage = "Unable to get your location";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Using default location.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable. Using default location.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Using default location.";
            break;
        }

        setError(errorMessage);
        // Fall back to Providence, RI (center of New England)
        setLocation({ lat: 41.8240, lng: -71.4128, timestamp: Date.now() });
        setIsLoadingLocation(false);
      },
      options
    );
  }, []);

  // Live tracking effect
  useEffect(() => {
    if (!tracking || !location) return;

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: position.timestamp,
        });
        setError(null);
      },
      (error) => {
        setError(`Tracking error: ${error.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [tracking, location]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: position.timestamp,
        });
        setError(null);
        setIsLoadingLocation(false);
      },
      (error) => {
        setError(`Error: ${error.message}`);
        setIsLoadingLocation(false);
      }
    );
  };

  // Convert miles to meters for circle radius
  const radiusInMeters = maxDistance * 1609.34;

  // New England region center (Providence, RI area)
  const defaultCenter: [number, number] = [41.8240, -71.4128];
  const center: [number, number] = location ? [location.lat, location.lng] : defaultCenter;

  // Show loading state
  if (isLoadingLocation) {
    return (
      <div className="w-full h-full bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Getting your location...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Control Panel */}
      <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-4 space-y-2 max-w-xs">
        <button
          onClick={handleGetLocation}
          className="w-full px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
        >
          📍 Update Location
        </button>
        <button
          onClick={() => setTracking(!tracking)}
          className={`w-full px-3 py-2 text-sm rounded transition ${
            tracking
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          {tracking ? '⏹️ Stop Live Tracking' : '▶️ Start Live Tracking'}
        </button>

        {error && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-2 rounded">
            <p className="text-yellow-800 dark:text-yellow-200 text-xs">{error}</p>
          </div>
        )}

        {location && (
          <div className="text-xs text-gray-700 bg-gray-50 p-2 rounded">
            <p><strong>Your Location:</strong></p>
            <p>Lat: {location.lat.toFixed(4)}</p>
            <p>Lng: {location.lng.toFixed(4)}</p>
            <p><strong>Service Area:</strong> {maxDistance} miles</p>
            <p className="text-xs text-gray-500 mt-1">
              {tracking ? '🟢 Live tracking active' : '📍 Location captured'}
            </p>
          </div>
        )}
      </div>

      {/* Map Container */}
      <MapContainer
        center={center}
        zoom={location ? 11 : 8}
        style={{ height: '100%', width: '100%' }}
        className="z-0 rounded-lg"
      >
        {/* High quality map tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          maxZoom={20}
        />

        {location && (
          <>
            <RecenterMap lat={location.lat} lng={location.lng} />

            {/* User location marker */}
            <Marker position={[location.lat, location.lng]} icon={userLocationIcon}>
              <Popup>
                <div className="text-sm">
                  <strong className="text-blue-600">Your Active Location</strong>
                  <br />
                  <span className="text-gray-600">Lat:</span> {location.lat.toFixed(6)}
                  <br />
                  <span className="text-gray-600">Lng:</span> {location.lng.toFixed(6)}
                  <br />
                  <span className="text-xs text-gray-400">
                    {tracking ? '🟢 Live tracking active' : '📍 Location captured'}
                  </span>
                </div>
              </Popup>
            </Marker>

            {/* Service radius circle */}
            <Circle
              center={[location.lat, location.lng]}
              radius={radiusInMeters}
              pathOptions={{
                fillColor: '#3b82f6',
                fillOpacity: 0.1,
                color: '#3b82f6',
                weight: 2,
                opacity: 0.6,
              }}
            />
          </>
        )}

        {/* Shift markers */}
        {shifts.map((shift) => {
          if (!shift.location) return null;

          const isSelected = selectedShift?.id === shift.id;
          const isUrgent = shift.urgent;

          let icon = availableShiftIcon;
          if (isSelected) {
            icon = selectedShiftIcon;
          } else if (isUrgent) {
            icon = urgentShiftIcon;
          }

          return (
            <Marker
              key={shift.id}
              position={[shift.location.lat, shift.location.lng]}
              icon={icon}
              eventHandlers={{
                click: () => {
                  if (onShiftSelect) {
                    onShiftSelect(shift);
                  }
                },
              }}
            >
              <Popup>
                <div className="text-sm max-w-xs">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {shift.restaurantName}
                    </h3>
                    {shift.urgent && (
                      <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full ml-2">
                        Urgent
                      </span>
                    )}
                  </div>
                  <p className="text-blue-600 font-medium">{shift.role}</p>
                  <p className="text-gray-600">
                    ${shift.hourlyRate}/hr • {shift.duration}
                  </p>
                  {shift.distance && (
                    <p className="text-gray-500">{shift.distance} miles away</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    {shift.date} at {shift.startTime}
                  </p>
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-600">{shift.description}</p>
                  </div>
                  {shift.location?.address && (
                    <p className="text-xs text-gray-500 mt-1">
                      📍 {shift.location.address}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}