import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  usePlaceAnalyses,
  usePlaces,
  useTimeAnalyses,
  type Place,
} from "@/hooks/useApi";
import { Frown, Heart, MapPin, Navigation } from "lucide-react";
import React, { useEffect, useState } from "react";

// Transform Place data to include happiness score
const transformPlaceData = (places: Place[]) => {
  return places
    .map((place) => {
      // Calculate happiness score based on visit patterns
      // More visits and longer stays generally indicate happier places
      const visitScore = Math.min(place.visit_count / 10, 5); // Max 5 points for visits
      const timeScore = Math.min(place.average_time_per_visit / 60, 3); // Max 3 points for time (hours)

      // Base score of 5, add visit and time bonuses
      const score = Math.min(5 + visitScore + timeScore, 10);

      // Convert string coordinates to numbers
      const lat = Number(place.center_latitude);
      const lng = Number(place.center_longitude);

      // Validate coordinates
      if (isNaN(lat) || isNaN(lng)) {
        console.warn(`Invalid coordinates for place ${place.id}:`, {
          lat: place.center_latitude,
          lng: place.center_longitude,
        });
        return null;
      }

      return {
        id: place.id,
        name: place.name || `Location ${place.id}`,
        lat,
        lng,
        score: Number(score.toFixed(1)),
        city: place.address || "Unknown",
        visits: place.visit_count,
        totalTime: place.total_time_minutes,
        averageTime: place.average_time_per_visit,
        activities: place.activity_types,
        firstVisit: place.first_visit,
        lastVisit: place.last_visit,
      };
    })
    .filter((place): place is NonNullable<typeof place> => place !== null);
};

// Utility function to load Google Maps API only once
const loadGoogleMaps = (() => {
  let promise: Promise<typeof google> | null = null;

  return (): Promise<typeof google> => {
    if (promise) return promise;

    if (typeof google !== "undefined" && typeof google.maps !== "undefined") {
      return Promise.resolve(google);
    }

    promise = new Promise((resolve, reject) => {
      // Check if script is already being loaded
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        // Wait for existing script to load
        const checkLoaded = () => {
          if (
            typeof google !== "undefined" &&
            typeof google.maps !== "undefined"
          ) {
            resolve(google);
          } else {
            setTimeout(checkLoaded, 100);
          }
        };
        checkLoaded();
        return;
      }

      // Create unique callback name
      const callbackName = `initMap_${Date.now()}`;

      (window as unknown as Record<string, () => void>)[callbackName] = () => {
        delete (window as unknown as Record<string, () => void>)[callbackName];
        resolve(google);
      };

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAdCr3UAgIRirmMnfGy5Tuc0QwiHJbyEEM&callback=${callbackName}`;
      script.async = true;
      script.defer = true;
      script.onerror = reject;

      document.head.appendChild(script);
    });

    return promise;
  };
})();

type TransformedPlace = ReturnType<typeof transformPlaceData>[0];

const GoogleMapComponent: React.FC<{
  locations: TransformedPlace[];
  selectedLocation: TransformedPlace | null;
  onLocationSelect: (location: TransformedPlace) => void;
}> = ({ locations, selectedLocation, onLocationSelect }) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const getMarkerColor = (score: number) => {
    if (score >= 8) return "#10b981"; // green-500
    if (score >= 7) return "#4ade80"; // green-400
    if (score >= 6) return "#eab308"; // yellow-500
    if (score >= 5) return "#f97316"; // orange-500
    return "#ef4444"; // red-500
  };

  useEffect(() => {
    if (locations.length === 0) return;

    const initMap = async () => {
      try {
        await loadGoogleMaps();

        const mapElement = document.getElementById("google-map");
        if (!mapElement) return;

        // Calculate center from all locations
        const validLocations = locations.filter(
          (loc) =>
            !isNaN(loc.lat) &&
            !isNaN(loc.lng) &&
            isFinite(loc.lat) &&
            isFinite(loc.lng)
        );

        if (validLocations.length === 0) {
          console.warn("No valid locations with finite coordinates");
          return;
        }

        const avgLat =
          validLocations.reduce((sum, loc) => sum + loc.lat, 0) /
          validLocations.length;
        const avgLng =
          validLocations.reduce((sum, loc) => sum + loc.lng, 0) /
          validLocations.length;

        const newMap = new google.maps.Map(mapElement, {
          center: { lat: avgLat, lng: avgLng },
          zoom: 12,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
        });

        setMap(newMap);
        setIsMapLoaded(true);

        // Create markers
        const newMarkers = validLocations.map((location) => {
          const marker = new google.maps.Marker({
            position: { lat: location.lat, lng: location.lng },
            map: newMap,
            title: `${location.name} (Score: ${location.score}, Visits: ${location.visits})`,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: getMarkerColor(location.score),
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: "#ffffff",
              scale: Math.max(8, Math.min(location.visits / 2, 15)), // Scale marker size by visits
            },
          });

          marker.addListener("click", () => {
            onLocationSelect(location);
          });

          return marker;
        });

        setMarkers(newMarkers);
      } catch (error) {
        console.error("Failed to load Google Maps:", error);
      }
    };

    initMap();

    return () => {
      // Cleanup markers
      markers.forEach((marker) => marker.setMap(null));
    };
  }, [locations]);

  // Update selected marker
  useEffect(() => {
    if (selectedLocation && markers.length > 0) {
      markers.forEach((marker) => {
        const location = locations.find(
          (loc) =>
            marker.getPosition()?.lat() === loc.lat &&
            marker.getPosition()?.lng() === loc.lng
        );

        if (location?.id === selectedLocation.id) {
          marker.setIcon({
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: getMarkerColor(location.score),
            fillOpacity: 1,
            strokeWeight: 4,
            strokeColor: "#3b82f6",
            scale: Math.max(10, Math.min(location.visits / 2 + 2, 17)),
          });
        } else if (location) {
          marker.setIcon({
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: getMarkerColor(location.score),
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#ffffff",
            scale: Math.max(8, Math.min(location.visits / 2, 15)),
          });
        }
      });
    }
  }, [selectedLocation, markers, locations]);

  return (
    <div className="relative">
      <div id="google-map" className="w-full h-96 rounded-lg"></div>

      {/* Fallback message when Google Maps isn't available */}
      {!isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-green-100 rounded-lg">
          <div className="text-center p-8">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-2">Loading Interactive Map...</p>
            <p className="text-sm text-gray-500">
              Please wait while the map loads
            </p>
          </div>
        </div>
      )}

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <div className="text-sm font-semibold mb-2">Location Score</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>High Activity (8.0+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span>Active (7.0-7.9)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Moderate (6.0-6.9)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>Low Activity (5.0-5.9)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Rare Visits (0-4.9)</span>
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          Marker size indicates visit frequency
        </div>
      </div>
    </div>
  );
};

const getHappinessColor = (score: number) => {
  if (score >= 8) return "text-green-500 bg-green-100";
  if (score >= 7) return "text-green-400 bg-green-50";
  if (score >= 6) return "text-yellow-500 bg-yellow-100";
  if (score >= 5) return "text-orange-500 bg-orange-100";
  return "text-red-500 bg-red-100";
};

const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

export const MapView: React.FC = () => {
  const [selectedLocation, setSelectedLocation] =
    useState<TransformedPlace | null>(null);
  const [selectedTimeAnalysis, setSelectedTimeAnalysis] = useState<
    number | undefined
  >(undefined);

  // Fetch time analyses to get the most recent one
  const { data: timeAnalyses, loading: timeAnalysesLoading } =
    useTimeAnalyses();

  // Use the most recent completed time analysis
  useEffect(() => {
    if (timeAnalyses?.length > 0 && !selectedTimeAnalysis) {
      const completedAnalysis = timeAnalyses.find(
        (ta) => ta.status === "completed"
      );
      if (completedAnalysis) {
        setSelectedTimeAnalysis(completedAnalysis.id);
      }
    }
  }, [timeAnalyses, selectedTimeAnalysis]);

  // Fetch places for the selected time analysis
  const {
    data: places,
    loading: placesLoading,
    error: placesError,
  } = usePlaces({
    time_analysis: selectedTimeAnalysis,
  });

  // Fetch place analyses for happiness correlations
  const {
    data: placeAnalyses,
    loading: placeAnalysesLoading,
    error: placeAnalysesError,
  } = usePlaceAnalyses({
    time_analysis: selectedTimeAnalysis,
  });

  const locationData = transformPlaceData(places || []);

  // Sort locations by score
  const sortedByScore = [...locationData].sort((a, b) => b.score - a.score);
  const topPlaces = sortedByScore.slice(0, 5);
  const leastVisited = sortedByScore.slice(-3);

  // Get happiness-based rankings from place analyses
  const happyPlaces = (placeAnalyses || [])
    .filter((pa) => pa.correlation_coefficient > 0)
    .sort((a, b) => b.correlation_coefficient - a.correlation_coefficient)
    .slice(0, 3);

  const sadPlaces = (placeAnalyses || [])
    .filter((pa) => pa.correlation_coefficient < 0)
    .sort((a, b) => a.correlation_coefficient - b.correlation_coefficient)
    .slice(0, 3);

  if (timeAnalysesLoading || placesLoading || placeAnalysesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400 animate-pulse" />
          <p className="text-gray-600">Loading location data...</p>
        </div>
      </div>
    );
  }

  if (placesError || placeAnalysesError) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-red-400" />
          <p className="text-red-600">
            Error loading places: {placesError || placeAnalysesError}
          </p>
        </div>
      </div>
    );
  }

  if (locationData.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">No location data available</p>
          <p className="text-sm text-gray-500">
            Run a time analysis to see your places
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Map Visualization */}
      <div className="lg:col-span-2">
        <Card className="bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              Your Places Map
            </CardTitle>
            <CardDescription>
              Interactive map showing your most visited locations with activity
              scores
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
                  <h3 className="font-semibold text-lg">
                    {selectedLocation.name}
                  </h3>
                  <p className="text-gray-600">{selectedLocation.city}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    {selectedLocation.score}
                  </span>
                  <Badge className={getHappinessColor(selectedLocation.score)}>
                    {selectedLocation.score >= 8
                      ? "High Activity"
                      : selectedLocation.score >= 7
                      ? "Active"
                      : selectedLocation.score >= 6
                      ? "Moderate"
                      : selectedLocation.score >= 5
                      ? "Low Activity"
                      : "Rare Visits"}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Visits:</span>
                    <strong>{selectedLocation.visits}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Time:</span>
                    <strong>
                      {formatDuration(selectedLocation.totalTime)}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg. per Visit:</span>
                    <strong>
                      {formatDuration(selectedLocation.averageTime)}
                    </strong>
                  </div>
                  {Object.keys(selectedLocation.activities).length > 0 && (
                    <div className="pt-2">
                      <span className="text-xs font-medium text-gray-500">
                        Activities:
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.entries(selectedLocation.activities).map(
                          ([activity, count]) => (
                            <Badge
                              key={activity}
                              variant="outline"
                              className="text-xs"
                            >
                              {activity} ({count})
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  )}
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

        {/* Happiest Places */}
        {happyPlaces.length > 0 && (
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-green-600 flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Happiest Places
              </CardTitle>
              <CardDescription>
                Places that boost your mood the most
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {happyPlaces.map((placeAnalysis, index) => {
                  const matchingLocation = locationData.find(
                    (loc) => loc.id === placeAnalysis.location
                  );
                  return (
                    <div
                      key={placeAnalysis.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() =>
                        matchingLocation &&
                        setSelectedLocation(matchingLocation)
                      }
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-lg font-bold text-green-600">
                          #{index + 1}
                        </div>
                        <div>
                          <div className="font-medium">
                            {placeAnalysis.location_name || "Unknown Location"}
                          </div>
                          <div className="text-sm text-gray-500">
                            Present {placeAnalysis.days_present} days •{" "}
                            Correlation:{" "}
                            {placeAnalysis.correlation_coefficient.toFixed(3)}
                          </div>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-green-600">
                        +{placeAnalysis.correlation_coefficient.toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Saddest Places */}
        {sadPlaces.length > 0 && (
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <Frown className="h-5 w-5" />
                Least Happy Places
              </CardTitle>
              <CardDescription>
                Places that tend to lower your mood
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sadPlaces.map((placeAnalysis, index) => {
                  const matchingLocation = locationData.find(
                    (loc) => loc.id === placeAnalysis.location
                  );
                  return (
                    <div
                      key={placeAnalysis.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() =>
                        matchingLocation &&
                        setSelectedLocation(matchingLocation)
                      }
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-lg font-bold text-red-600">
                          #{index + 1}
                        </div>
                        <div>
                          <div className="font-medium">
                            {placeAnalysis.location_name || "Unknown Location"}
                          </div>
                          <div className="text-sm text-gray-500">
                            Present {placeAnalysis.days_present} days •{" "}
                            Correlation:{" "}
                            {placeAnalysis.correlation_coefficient.toFixed(3)}
                          </div>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-red-600">
                        {placeAnalysis.correlation_coefficient.toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
