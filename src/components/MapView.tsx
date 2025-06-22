
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation } from 'lucide-react';

// Mock location data with happiness scores
const locationData = [
  { id: 1, name: 'Home', lat: 40.7128, lng: -74.0060, score: 8.5, city: 'New York', visits: 45 },
  { id: 2, name: 'Office', lat: 40.7589, lng: -73.9851, score: 6.8, city: 'New York', visits: 32 },
  { id: 3, name: 'Central Park', lat: 40.7829, lng: -73.9654, score: 9.2, city: 'New York', visits: 12 },
  { id: 4, name: 'Coffee Shop', lat: 40.7505, lng: -73.9934, score: 8.1, city: 'New York', visits: 28 },
  { id: 5, name: 'Gym', lat: 40.7282, lng: -74.0776, score: 7.9, city: 'New York', visits: 18 },
  { id: 6, name: 'Shopping Mall', lat: 40.7549, lng: -73.9840, score: 5.2, city: 'New York', visits: 8 },
  { id: 7, name: 'Restaurant District', lat: 40.7505, lng: -73.9865, score: 8.7, city: 'New York', visits: 15 },
  { id: 8, name: 'Library', lat: 40.7532, lng: -73.9822, score: 7.3, city: 'New York', visits: 9 },
];

const GoogleMapComponent: React.FC<{
  locations: typeof locationData;
  selectedLocation: typeof locationData[0] | null;
  onLocationSelect: (location: typeof locationData[0]) => void;
}> = ({ locations, selectedLocation, onLocationSelect }) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

  const getMarkerColor = (score: number) => {
    if (score >= 8) return '#10b981'; // green-500
    if (score >= 7) return '#4ade80'; // green-400
    if (score >= 6) return '#eab308'; // yellow-500
    if (score >= 5) return '#f97316'; // orange-500
    return '#ef4444'; // red-500
  };

  useEffect(() => {
    const initMap = () => {
      const mapElement = document.getElementById('google-map');
      if (!mapElement) return;

      const newMap = new google.maps.Map(mapElement, {
        center: { lat: 40.7589, lng: -73.9851 },
        zoom: 12,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      setMap(newMap);

      // Create markers
      const newMarkers = locations.map(location => {
        const marker = new google.maps.Marker({
          position: { lat: location.lat, lng: location.lng },
          map: newMap,
          title: `${location.name} (${location.score})`,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: getMarkerColor(location.score),
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: '#ffffff',
            scale: 10
          }
        });

        marker.addListener('click', () => {
          onLocationSelect(location);
        });

        return marker;
      });

      setMarkers(newMarkers);
    };

    // Load Google Maps API if not already loaded
    if (typeof google === 'undefined') {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap`;
      script.async = true;
      script.defer = true;
      
      // Set up callback
      (window as any).initMap = initMap;
      
      document.head.appendChild(script);
    } else {
      initMap();
    }

    return () => {
      // Cleanup markers
      markers.forEach(marker => marker.setMap(null));
    };
  }, []);

  // Update selected marker
  useEffect(() => {
    if (selectedLocation && markers.length > 0) {
      markers.forEach(marker => {
        const location = locations.find(loc => 
          marker.getPosition()?.lat() === loc.lat && 
          marker.getPosition()?.lng() === loc.lng
        );
        
        if (location?.id === selectedLocation.id) {
          marker.setIcon({
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: getMarkerColor(location.score),
            fillOpacity: 1,
            strokeWeight: 4,
            strokeColor: '#3b82f6',
            scale: 12
          });
        } else if (location) {
          marker.setIcon({
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: getMarkerColor(location.score),
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: '#ffffff',
            scale: 10
          });
        }
      });
    }
  }, [selectedLocation, markers]);

  return (
    <div className="relative">
      <div id="google-map" className="w-full h-96 rounded-lg"></div>
      
      {/* Fallback message when Google Maps isn't available */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-green-100 rounded-lg">
        <div className="text-center p-8">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 mb-2">Interactive Google Map</p>
          <p className="text-sm text-gray-500">
            Add your Google Maps API key to enable the interactive map
          </p>
        </div>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <div className="text-sm font-semibold mb-2">Happiness Scale</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Very Happy (8.0+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span>Happy (7.0-7.9)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Neutral (6.0-6.9)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>Somewhat Sad (5.0-5.9)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Sad (0-4.9)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const getHappinessColor = (score: number) => {
  if (score >= 8) return 'text-green-500 bg-green-100';
  if (score >= 7) return 'text-green-400 bg-green-50';
  if (score >= 6) return 'text-yellow-500 bg-yellow-100';
  if (score >= 5) return 'text-orange-500 bg-orange-100';
  return 'text-red-500 bg-red-100';
};

export const MapView: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<typeof locationData[0] | null>(null);

  // Sort locations by happiness score
  const sortedByHappiness = [...locationData].sort((a, b) => b.score - a.score);
  const happiest = sortedByHappiness.slice(0, 5);
  const leastHappy = sortedByHappiness.slice(-3);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Map Visualization */}
      <div className="lg:col-span-2">
        <Card className="bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              Location-Based Happiness Map
            </CardTitle>
            <CardDescription>
              Interactive Google Maps showing happiness levels across different locations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GoogleMapComponent 
              locations={locationData}
              selectedLocation={selectedLocation}
              onLocationSelect={setSelectedLocation}
            />
          </CardContent>
        </Card>
      </div>

      {/* Location Details and Rankings */}
      <div className="space-y-6">
        {/* Selected Location Details */}
        <Card className="bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Location Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedLocation ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedLocation.name}</h3>
                  <p className="text-gray-600">{selectedLocation.city}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{selectedLocation.score}</span>
                  <Badge className={getHappinessColor(selectedLocation.score)}>
                    {selectedLocation.score >= 8 ? 'Very Happy' : 
                     selectedLocation.score >= 7 ? 'Happy' :
                     selectedLocation.score >= 6 ? 'Neutral' :
                     selectedLocation.score >= 5 ? 'Somewhat Sad' : 'Sad'}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">
                  <strong>{selectedLocation.visits}</strong> visits recorded
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Click on a pin to view location details</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Locations */}
        <Card className="bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-green-600">Happiest Places</CardTitle>
            <CardDescription>Top 5 locations that bring you joy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {happiest.map((location, index) => (
                <div
                  key={location.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedLocation(location)}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-bold text-gray-400">#{index + 1}</div>
                    <div>
                      <div className="font-medium">{location.name}</div>
                      <div className="text-sm text-gray-500">{location.visits} visits</div>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-green-600">{location.score}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Least Happy Locations */}
        <Card className="bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-red-600">Challenging Places</CardTitle>
            <CardDescription>Locations that could use attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leastHappy.map((location, index) => (
                <div
                  key={location.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedLocation(location)}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-bold text-gray-400">#{index + 1}</div>
                    <div>
                      <div className="font-medium">{location.name}</div>
                      <div className="text-sm text-gray-500">{location.visits} visits</div>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-red-600">{location.score}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
