import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Clock, Phone, User, RotateCcw, ExternalLink } from 'lucide-react';

const GoogleMapsEmbedTracker = ({
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [showRiderMap, setShowRiderMap] = useState(true);
  const [googleMaps, setGoogleMaps] = useState(null);
  const [map, setMap] = useState(null);
  const [riderMarker, setRiderMarker] = useState(null);
  const [destinationMarker, setDestinationMarker] = useState(null);
  const [directionsService, setDirectionsService] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);

  const mapRef = useRef(null);
  const API_KEY = "AIzaSyAgWdyebZ1v3HIjABI51w89Q30Z0mVF-PA";

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setGoogleMaps(window.google.maps);
        return;
      }

      // Check if script is already loading
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        const checkGoogle = setInterval(() => {
          if (window.google && window.google.maps) {
            setGoogleMaps(window.google.maps);
            clearInterval(checkGoogle);
          }
        }, 100);
        return;
      }

      // Load the script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=geometry,places`;
      script.async = true;
      script.onload = () => {
        if (window.google && window.google.maps) {
          setGoogleMaps(window.google.maps);
        }
      };
      script.onerror = () => {
        setError('Failed to load Google Maps API');
      };
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  // Initialize map when Google Maps is loaded
  useEffect(() => {
    if (googleMaps && mapRef.current) {
      const mapInstance = new googleMaps.Map(mapRef.current, {
        zoom: 13,
        center: { lat: 6.5244, lng: 3.3792 }, // Lagos, Nigeria default
        mapTypeId: googleMaps.MapTypeId.ROADMAP,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: true
      });

      setMap(mapInstance);
      setDirectionsService(new googleMaps.DirectionsService());
      setDirectionsRenderer(new googleMaps.DirectionsRenderer({
        draggable: false,
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#4285F4',
          strokeWeight: 5,
          strokeOpacity: 0.8
        }
      }));
    }
  }, [googleMaps]);

  // Get rider's current location from tracking data
  useEffect(() => {
    if (trackingData?.locations && trackingData.locations.length > 0) {
      const latestLocation = trackingData.locations[0];
      const newPosition = {
        lat: parseFloat(latestLocation.latitude),
        lng: parseFloat(latestLocation.longitude),
        accuracy: parseFloat(latestLocation.accuracy) || 10
      };
      setRiderPosition(newPosition);
      setLastUpdate(new Date(latestLocation.timestamp));
    }
  }, [trackingData]);

  // Get destination coordinates
  useEffect(() => {
    const getDestinationCoordinates = async () => {
      try {
        if (coordinates && coordinates.lat && coordinates.lng) {
          setDestinationPosition({
            lat: coordinates.lat,
            lng: coordinates.lng
          });
        } else if (address && googleMaps) {
          // Use Google Geocoding API
          const geocoder = new googleMaps.Geocoder();
          geocoder.geocode({ address: address }, (results, status) => {
            if (status === 'OK' && results[0]) {
              setDestinationPosition({
                lat: results[0].geometry.location.lat(),
                lng: results[0].geometry.location.lng()
              });
            } else {
              throw new Error('Address not found');
            }
          });
        }
      } catch (err) {
        console.error('Geocoding failed:', err);
        setError('Unable to locate destination address');
      } finally {
        setIsLoading(false);
      }
    };

    if (googleMaps) {
      getDestinationCoordinates();
    }
  }, [address, coordinates, googleMaps]);

  // Update markers and route when positions change
  useEffect(() => {
    if (!googleMaps || !map) return;

    // Clear existing markers
    if (riderMarker) riderMarker.setMap(null);
    if (destinationMarker) destinationMarker.setMap(null);
    if (directionsRenderer) directionsRenderer.setMap(null);

    if (riderPosition && destinationPosition) {
      // Create rider marker
      const newRiderMarker = new googleMaps.Marker({
        position: riderPosition,
        map: map,
        title: `Rider: ${riderInfo?.name || 'Unknown'}`,
        icon: {
          url: 'data:image/svg+xml;base64,' + btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#4285F4">
              <circle cx="12" cy="12" r="8" fill="#4285F4" stroke="white" stroke-width="2"/>
              <circle cx="12" cy="12" r="3" fill="white"/>
            </svg>
          `),
          scaledSize: new googleMaps.Size(32, 32),
          anchor: new googleMaps.Point(16, 16)
        }
      });

      // Create destination marker
      const newDestinationMarker = new googleMaps.Marker({
        position: destinationPosition,
        map: map,
        title: `Destination: ${customerName}`,
        icon: {
          url: 'data:image/svg+xml;base64,' + btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 24 24" fill="#EA4335">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          `),
          scaledSize: new googleMaps.Size(32, 40),
          anchor: new googleMaps.Point(16, 40)
        }
      });

      setRiderMarker(newRiderMarker);
      setDestinationMarker(newDestinationMarker);

      // Calculate and display route
      if (directionsService && directionsRenderer) {
        directionsService.route(
          {
            origin: riderPosition,
            destination: destinationPosition,
            travelMode: googleMaps.TravelMode.DRIVING,
            avoidHighways: false,
            avoidTolls: false
          },
          (response, status) => {
            if (status === 'OK') {
              directionsRenderer.setDirections(response);
              directionsRenderer.setMap(map);

              // Extract route information
              const route = response.routes[0];
              const leg = route.legs[0];
              setRouteInfo({
                distance: leg.distance.text,
                duration: leg.duration.text,
                durationValue: leg.duration.value
              });

              // Hide default markers since we have custom ones
              directionsRenderer.setOptions({
                suppressMarkers: true
              });
            } else {
              console.error('Directions request failed due to ' + status);
            }
          }
        );
      }

      // Fit map to show both points
      const bounds = new googleMaps.LatLngBounds();
      bounds.extend(riderPosition);
      bounds.extend(destinationPosition);
      map.fitBounds(bounds);

      // Add some padding
      setTimeout(() => {
        map.panToBounds(bounds);
      }, 100);

    } else if (showRiderMap && riderPosition) {
      // Show only rider position
      const newRiderMarker = new googleMaps.Marker({
        position: riderPosition,
        map: map,
        title: `Rider: ${riderInfo?.name || 'Unknown'}`,
        icon: {
          url: 'data:image/svg+xml;base64,' + btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#4285F4">
              <circle cx="12" cy="12" r="8" fill="#4285F4" stroke="white" stroke-width="2"/>
              <circle cx="12" cy="12" r="3" fill="white"/>
            </svg>
          `),
          scaledSize: new googleMaps.Size(32, 32),
          anchor: new googleMaps.Point(16, 16)
        }
      });
      setRiderMarker(newRiderMarker);
      map.setCenter(riderPosition);
      map.setZoom(15);

    } else if (!showRiderMap && destinationPosition) {
      // Show only destination
      const newDestinationMarker = new googleMaps.Marker({
        position: destinationPosition,
        map: map,
        title: `Destination: ${customerName}`,
        icon: {
          url: 'data:image/svg+xml;base64,' + btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 24 24" fill="#EA4335">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          `),
          scaledSize: new googleMaps.Size(32, 40),
          anchor: new googleMaps.Point(16, 40)
        }
      });
      setDestinationMarker(newDestinationMarker);
      map.setCenter(destinationPosition);
      map.setZoom(15);
    }
  }, [googleMaps, map, riderPosition, destinationPosition, showRiderMap, directionsService, directionsRenderer, riderInfo, customerName]);

  // Auto-refresh rider location every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (trackingData?.locations && trackingData.locations.length > 0) {
        const latestLocation = trackingData.locations[0];
        const newPosition = {
          lat: parseFloat(latestLocation.latitude),
          lng: parseFloat(latestLocation.longitude),
          accuracy: parseFloat(latestLocation.accuracy) || 10
        };
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

  const getDirectionsUrl = () => {
    if (!riderPosition || !destinationPosition) return '';
    return `https://www.google.com/maps/dir/${riderPosition.lat},${riderPosition.lng}/${destinationPosition.lat},${destinationPosition.lng}`;
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleViewToggle = (showRider) => {
    setShowRiderMap(showRider);
  };

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '400px',
        backgroundColor: '#fee',
        border: '1px solid #fcc',
        borderRadius: '8px',
        margin: '20px 0'
      }}>
        <MapPin size={48} color="#EF4444" />
        <h3 style={{ color: '#EF4444', margin: '10px 0' }}>Map Loading Error</h3>
        <p style={{ color: '#666', textAlign: 'center', margin: '0 20px' }}>{error}</p>
      </div>
    );
  }

  if (isLoading || !googleMaps || !riderPosition || !destinationPosition) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '400px',
        backgroundColor: '#f9f9f9',
        border: '1px solid #ddd',
        borderRadius: '8px',
        margin: '20px 0'
      }}>
        <div style={{ 
          border: '3px solid #f3f3f3',
          borderTop: '3px solid #3498db',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }} />
        <p style={{ color: '#666' }}>Loading map...</p>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Map Toggle Controls */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '15px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            style={{
              padding: '8px 16px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              backgroundColor: showRiderMap ? '#4285F4' : 'white',
              color: showRiderMap ? 'white' : '#333',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px'
            }}
            onClick={() => handleViewToggle(true)}
          >
            <User size={14} />
            Rider Location
          </button>
          <button
            style={{
              padding: '8px 16px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              backgroundColor: !showRiderMap ? '#4285F4' : 'white',
              color: !showRiderMap ? 'white' : '#333',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px'
            }}
            onClick={() => handleViewToggle(false)}
          >
            <MapPin size={14} />
            Destination
          </button>
        </div>
        
        <a
          href={getDirectionsUrl()}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: '8px 16px',
            backgroundColor: '#34A853',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px'
          }}
        >
          <ExternalLink size={14} />
          Get Directions
        </a>
      </div>

      {/* Map Container */}
      <div style={{ 
        height: '400px', 
        width: '100%', 
        borderRadius: '8px', 
        overflow: 'hidden',
        border: '1px solid #ddd',
        marginBottom: '20px'
      }}>
        <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
      </div>

      {/* Tracking Information Panel */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '15px',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '10px', 
              height: '10px', 
              borderRadius: '50%', 
              backgroundColor: getStatusColor() 
            }} />
            <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
              {status?.toUpperCase()}
            </span>
          </div>
          <span style={{ 
            fontSize: '14px', 
            color: '#666',
            fontFamily: 'monospace'
          }}>
            #{trackingNumber}
          </span>
        </div>

        {/* Route Information */}
        {routeInfo && (
          <div style={{ 
            display: 'flex', 
            gap: '20px', 
            marginBottom: '15px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Navigation size={16} color="#666" />
              <span>{routeInfo.distance}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={16} color="#666" />
              <span>{routeInfo.duration} (estimated)</span>
            </div>
          </div>
        )}

        {/* Rider Information */}
        {riderInfo && (
          <div style={{ 
            backgroundColor: 'white', 
            padding: '15px', 
            borderRadius: '6px',
            marginBottom: '15px',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              marginBottom: '10px'
            }}>
              <User size={16} color="#666" />
              <span style={{ fontWeight: 'bold' }}>Rider Information</span>
            </div>
            <div>
              <p style={{ margin: '5px 0', fontWeight: 'bold' }}>{riderInfo.name}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={14} color="#666" />
                <span>{riderInfo.phone}</span>
              </div>
            </div>
          </div>
        )}

        {/* Refresh Button and Last Update */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <button
            style={{
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px'
            }}
            onClick={handleRefresh}
            title="Refresh tracking data"
          >
            <RotateCcw size={14} />
            Refresh
          </button>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Last updated: {formatLastUpdate()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleMapsEmbedTracker;