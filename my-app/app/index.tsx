import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useState, useEffect } from 'react';

import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';

export default function App() {
  // Interfaces
  interface GeoSearchResult {
    pageid: number;
    title: string;
    lat: number;
    lon: number;
    dist: number;
  }

  interface WikiApiResponse {
    query: {
      geosearch: GeoSearchResult[];
    };
  }

  // The Constants
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [locationStatus, requestLocationPermission] = Location.useForegroundPermissions();
  const [heading, setHeading] = useState(0);
  const [searchResults, setSearchResults] = useState<GeoSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Initialize magnetometer to get compass heading
  useEffect(() => {
    Magnetometer.setUpdateInterval(500);
    
    const subscription = Magnetometer.addListener(({ x, y, z }) => {
      // Calculate heading from magnetometer data
      const angle = Math.atan2(y, x) * (180 / Math.PI);
      // Normalize to 0-360 range
      const normalizedAngle = (angle + 360) % 360;
      setHeading(normalizedAngle);
    });

    return () => subscription.remove();
  }, []);

  // Request location permissions on mount
  useEffect(() => {
    const requestPermissions = async () => {
      if (locationStatus?.status !== 'granted') {
        await Location.requestForegroundPermissionsAsync();
      }
    };
    requestPermissions();
  }, [locationStatus]);

  // Helper function: Calculate bearing from point A to point B
  const calculateBearing = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const dLon = lon2 - lon1;
    const y = Math.sin(dLon * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180);
    const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
              Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLon * Math.PI / 180);
    const bearing = Math.atan2(y, x) * (180 / Math.PI);
    return (bearing + 360) % 360;
  };

  // Helper function: Calculate angular distance between two angles (shortest path)
  const getAngularDistance = (angle1: number, angle2: number): number => {
    let diff = Math.abs(angle1 - angle2);
    if (diff > 180) {
      diff = 360 - diff;
    }
    return diff;
  };

  // Filter results: Find the closest result in the direction user is facing
  const filterResultsByDirection = (results: GeoSearchResult[], userLat: number, userLon: number, userHeading: number): GeoSearchResult | null => {
    if (results.length === 0) return null;

    // Calculate bearing to each result
    const resultsWithBearing = results.map(result => ({
      ...result,
      bearing: calculateBearing(userLat, userLon, result.lat, result.lon),
      angularDistance: getAngularDistance(userHeading, calculateBearing(userLat, userLon, result.lat, result.lon))
    }));

    // Sort by angular distance (closest to user's heading first)
    resultsWithBearing.sort((a, b) => a.angularDistance - b.angularDistance);

    // Return the closest result in the direction user is facing
    return resultsWithBearing[0];
  };

  // Get location from device
  const getLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      return {
        lat: location.coords.latitude,
        lon: location.coords.longitude
      };
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  };

  // Fetch places from Wikipedia geosearch API
  const fetchWikiPlaces = async (lat: number, lon: number): Promise<GeoSearchResult[]> => {
    try {
      const response = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${lat}|${lon}&gsradius=1000&format=json&origin=*`
      );
      const data: WikiApiResponse = await response.json();
      return data.query.geosearch || [];
    } catch (error) {
      console.error('Error fetching wiki places:', error);
      return [];
    }
  };

  // Main search function: Get location, heading, and find closest place in direction
  const searchLocation = async () => {
    setIsSearching(true);
    try {
      const location = await getLocation();
      if (!location) {
        console.error('Could not get location');
        setIsSearching(false);
        return;
      }

      const places = await fetchWikiPlaces(location.lat, location.lon);
      const closestInDirection = filterResultsByDirection(places, location.lat, location.lon, heading);
      setSearchResults(closestInDirection);
    } catch (error) {
      console.error('Error during search:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Permission checks
  if (!cameraPermission || !locationStatus) {
    // Camera permissions are still loading.
    return <View />;
  }

  // Check camera Permissions
  if (!cameraPermission.granted) {
    // Camera permissions are not granted yet.
    requestCameraPermission();
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing='back' />

      {/* Display search results */}
      {searchResults && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>{searchResults.title}</Text>
          <Text style={styles.resultDistance}>Distance: {Math.round(searchResults.dist)}m</Text>
        </View>
      )}

      {/* Search button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, isSearching && styles.buttonDisabled]}
          onPress={searchLocation}
          disabled={isSearching}
        >
          <Text style={styles.text}>{isSearching ? 'Searching...' : 'Find Nearby'}</Text>
        </TouchableOpacity>

        {menuOpen && (
          <View style={styles.dropdown}>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setMenuOpen(false);
                router.push('/faq');
              }}
            >
              <Text style={styles.dropdownText}>FAQ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setMenuOpen(false);
                router.push('/settings');
              }}
            >
              <Text style={styles.dropdownText}>Settings</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  headingDisplay: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 10,
    alignItems: 'center',
  },
  headingText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  resultContainer: {
    position: 'absolute',
    top: 120,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 10,
    padding: 15,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  resultTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  resultDistance: {
    color: '#4CAF50',
    fontSize: 14,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
  },
  buttonDisabled: {
    backgroundColor: '#888888',
  },
  hamburgerText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  dropdown: {
    marginTop: 8,
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  dropdownText: {
    color: 'white',
    fontSize: 16,
  },
});