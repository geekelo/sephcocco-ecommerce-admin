import React from 'react';
import { MapPin } from 'lucide-react';

const GoogleMapTracker = ({ coordinates, address, customerName, trackingNumber, status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'status-completed';
      case 'In Transit': return 'status-delivering';
      case 'Processing': return 'status-processing';
      case 'Cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  return (
    <div className="google-map-tracker">
      <div className="map-header mb-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-lg font-semibold">Delivery Location</h4>
          <span className={`status-badge ${getStatusColor(status)}`}>
            {status}
          </span>
        </div>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Customer:</strong> {customerName}</p>
          <p><strong>Address:</strong> {address}</p>
          <p><strong>Tracking:</strong> {trackingNumber}</p>
        </div>
      </div>

      {/* Google Maps Placeholder */}
      <div className="map-container w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center border border-gray-300">
        <div className="text-center">
          <MapPin size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 mb-2 font-medium">Google Maps Integration</p>
          <p className="text-sm text-gray-500 mb-2">
            Coordinates: {coordinates?.lat}, {coordinates?.lng}
          </p>
          <p className="text-xs text-gray-400">
            (Add your Google Maps API key to enable full map functionality)
          </p>
          <div className="mt-4 p-3 bg-white rounded border">
            <p className="text-xs text-gray-500">
              In a real implementation, this would show:
            </p>
            <ul className="text-xs text-gray-500 mt-1 list-disc list-inside">
              <li>Interactive map with delivery location</li>
              <li>Real-time tracking updates</li>
              <li>Route optimization</li>
              <li>Estimated delivery time</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleMapTracker;