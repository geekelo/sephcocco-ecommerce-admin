import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Clock, Phone, User, RotateCcw } from 'lucide-react';
import '../styles/LeafletMapTracker.css'
// Fix for default markers in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom rider icon
const riderIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="12" fill="#3B82F6" stroke="#ffffff" stroke-width="3"/>
      <circle cx="16" cy="16" r="4" fill="#ffffff"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

// Custom destination icon
const destinationIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.2 0 0 7.2 0 16C0 28 16 40 16 40S32 28 32 16C32 7.2 24.8 0 16 0Z" fill="#EA4335"/>
      <circle cx="16" cy="16" r="8" fill="#ffffff"/>
    </svg>
  `),
  iconSize: [32, 40],
  iconAnchor: [16, 40],
  popupAnchor: [0, -40],
});

// Component to handle map bounds and routing
const MapController = ({ riderPosition, destinationPosition, routePath, onRouteCalculated }) => {
  const map = useMap();

  useEffect(() => {
    if (riderPosition && destinationPosition) {
      // Fit bounds to show both markers
      const bounds = L.latLngBounds([riderPosition, destinationPosition]);
      map.fitBounds(bounds, { padding: [20, 20] });

      // Calculate route (simple straight line for demo - you can integrate with routing service)
      calculateRoute(riderPosition, destinationPosition, onRouteCalculated);
    }
  }, [riderPosition, destinationPosition, map, onRouteCalculated]);

  const calculateRoute = async (start, end, callback) => {
    try {
      // For demo purposes, we'll use a simple straight line
      // In production, you'd want to use a routing service like OpenRouteService, Mapbox, or GraphHopper
      const routeCoordinates = [start, end];
      
      // Calculate approximate distance and duration
      const distance = calculateDistance(start[0], start[1], end[0], end[1]);
      const estimatedDuration = Math.round((distance / 40) * 60); // Assuming 40 km/h average speed
      
      callback({
        coordinates: routeCoordinates,
        distance: `${distance.toFixed(1)} km`,
        duration: `${estimatedDuration} min`,
        durationValue: estimatedDuration * 60
      });
    } catch (error) {
      console.error('Route calculation failed:', error);
    }
  };

  // Haversine formula to calculate distance between two points
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  return null;
};

const LeafletMapTracker = ({
  coordinates,
  address,
  customerName,
  trackingNumber,
  status,
  riderInfo,
  trackingData
}) => {
  const [riderPosition, setRiderPosition] = useState(null);
  const [destinationPosition, setDestinationPosition] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [routePath, setRoutePath] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Get rider's current location from tracking data
  useEffect(() => {
    if (trackingData?.locations && trackingData.locations.length > 0) {
      const latestLocation = trackingData.locations[0];
      const newPosition = [
        parseFloat(latestLocation.latitude),
        parseFloat(latestLocation.longitude)
      ];
      setRiderPosition(newPosition);
      setLastUpdate(new Date(latestLocation.timestamp));
    }
  }, [trackingData]);

  // Geocode destination address or use provided coordinates
  useEffect(() => {
    const getDestinationCoordinates = async () => {
      try {
        if (coordinates && coordinates.lat && coordinates.lng) {
          // Use provided coordinates
          setDestinationPosition([coordinates.lat, coordinates.lng]);
        } else if (address) {
          // Geocode the address using Nominatim (OpenStreetMap's geocoding service)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
          );
          const data = await response.json();
          
          if (data && data.length > 0) {
            setDestinationPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
          } else {
            throw new Error('Address not found');
          }
        }
      } catch (err) {
        console.error('Geocoding failed:', err);
        setError('Unable to locate destination address');
      } finally {
        setIsLoading(false);
      }
    };

    getDestinationCoordinates();
  }, [address, coordinates]);

  // Handle route calculation
  const handleRouteCalculated = (route) => {
    setRouteInfo({
      distance: route.distance,
      duration: route.duration,
      durationValue: route.durationValue
    });
    setRoutePath(route.coordinates);
  };

  // Auto-refresh rider location every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (trackingData?.locations && trackingData.locations.length > 0) {
        const latestLocation = trackingData.locations[0];
        const newPosition = [
          parseFloat(latestLocation.latitude),
          parseFloat(latestLocation.longitude)
        ];
        setRiderPosition(newPosition);
        setLastUpdate(new Date(latestLocation.timestamp));
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [trackingData]);

  const getStatusColor = () => {
    switch (status?.toLowerCase()) {
      case 'delivered': return '#10B981';
      case 'in_transit': 
      case 'dispatched': return '#F59E0B';
      case 'processing': 
      case 'pending': return '#6B7280';
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const formatLastUpdate = () => {
    if (lastUpdate) {
      return lastUpdate.toLocaleString();
    }
    return 'Unknown';
  };

  if (error) {
    return (
      <div className="map-error">
        <div className="error-content">
          <MapPin size={48} color="#EF4444" />
          <h3>Map Loading Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading || !riderPosition || !destinationPosition) {
    return (
      <div className="map-loading-container">
        <div className="map-loading">
          <div className="loading-spinner" />
          <p>Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="leaflet-map-tracker">
      {/* Map Container */}
      <div className="map-container">
        <MapContainer
          center={riderPosition}
          zoom={13}
          style={{ height: '400px', width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Rider Marker */}
          <Marker position={riderPosition} icon={riderIcon}>
            <Popup>
              <div className="popup-content">
                <h4>{riderInfo?.name || 'Rider'}</h4>
                <p>📱 {riderInfo?.phone || 'N/A'}</p>
                <p>📍 Current Location</p>
                <p>🕒 {formatLastUpdate()}</p>
              </div>
            </Popup>
          </Marker>

          {/* Destination Marker */}
          <Marker position={destinationPosition} icon={destinationIcon}>
            <Popup>
              <div className="popup-content">
                <h4>{customerName}</h4>
                <p>📍 {address}</p>
                <p>📦 {trackingNumber}</p>
              </div>
            </Popup>
          </Marker>

          {/* Route Line */}
          {routePath.length > 0 && (
            <Polyline
              positions={routePath}
              color="#3B82F6"
              weight={4}
              opacity={0.8}
            />
          )}

          {/* Map Controller */}
          <MapController
            riderPosition={riderPosition}
            destinationPosition={destinationPosition}
            routePath={routePath}
            onRouteCalculated={handleRouteCalculated}
          />
        </MapContainer>
      </div>

      {/* Tracking Information Panel */}
      <div className="tracking-info-panel">
        <div className="tracking-header">
          <div className="status-indicator">
            <div 
              className="status-dot" 
              style={{ backgroundColor: getStatusColor() }}
            />
            <span className="status-text">{status?.toUpperCase()}</span>
          </div>
          <span className="tracking-number">#{trackingNumber}</span>
        </div>

        {/* Route Information */}
        {routeInfo && (
          <div className="route-info">
            <div className="route-item">
              <Navigation size={16} />
              <span>{routeInfo.distance}</span>
            </div>
            <div className="route-item">
              <Clock size={16} />
              <span>{routeInfo.duration} (estimated)</span>
            </div>
          </div>
        )}

        {/* Rider Information */}
        {riderInfo && (
          <div className="rider-panel">
            <div className="rider-header">
              <User size={16} />
              <span>Rider Information</span>
            </div>
            <div className="rider-details">
              <p><strong>{riderInfo.name}</strong></p>
              <div className="rider-contact">
                <Phone size={14} />
                <span>{riderInfo.phone}</span>
              </div>
            </div>
          </div>
        )}

        {/* Refresh Button and Last Update */}
        <div className="map-controls">
          <button 
            className="refresh-button"
            onClick={() => window.location.reload()}
            title="Refresh tracking data"
          >
            <RotateCcw size={14} />
            Refresh
          </button>
          <div className="last-update">
            <small>Last updated: {formatLastUpdate()}</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeafletMapTracker;