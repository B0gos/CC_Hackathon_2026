import { StyleSheet, Text, View, TouchableOpacity, Pressable, Switch } from 'react-native';
import { useState } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useSettings } from '../context/SettingsContext';
import { useLocation } from '../hooks/useLocation';
import { usePlaces } from '../hooks/usePlaces';
import { useTargetedPlace } from '../hooks/useTargetedPlace';
import { AROverlay } from '../components/AROverlay';
import { PlaceInfoCard } from '../components/PlaceInfoCard';
import { fetchNearbyPlaces, fetchPlaceDetail } from '../utils/wiki';
import { angleDiff } from '../utils/geo';
import { HEADING_TOLERANCE } from '../constants/config';
import { PlaceDetail } from '../types';

export default function App() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [autoDetect, setAutoDetect] = useState(false);
  const { distance, gemini, tts } = useSettings();
  const [isSearchHidden, setIsSearchHidden] = useState(false);

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  // Hooks always run (React rule) — gated by what we pass in
  const { coord, heading, permissionGranted: locationGranted } = useLocation();
  const places = usePlaces(autoDetect ? coord : null);
  const { targeted, isLoading } = useTargetedPlace(
    autoDetect ? places : [],
    heading
  );

  // Manual-mode state
  const [manualResult, setManualResult] = useState<PlaceDetail | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Initialize magnetometer to get compass heading
  /*useEffect(() => {
    Magnetometer.setUpdateInterval(500);
    
    const subscription = Magnetometer.addListener(({ x, y, z }) => {
      // Calculate heading from magnetometer data
      const angle = Math.atan2(y, x) * (180 / Math.PI);
      // Normalize to 0-360 range
      const normalizedAngle = (angle + 360) % 360;
      setHeading(normalizedAngle);
    });

    return () => subscription.remove();
  }, []); */

  // Request location permissions on mount
  /*
  useEffect(() => {
    const requestPermissions = async () => {
      if (locationStatus?.status !== 'granted') {
        await Location.requestForegroundPermissionsAsync();
      }
    };
    requestPermissions();
  }, [locationStatus]); */

  // Helper function: Calculate bearing from point A to point B
  /*const calculateBearing = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
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
  }; */

  // Get location from device
  /*const getLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({accuracy: Location.Accuracy.High});
      return {
        lat: location.coords.latitude,
        lon: location.coords.longitude
      };
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    } };*/

  // Fetch places from Wikipedia geosearch API
  /* const fetchWikiPlaces = async (lat: number, lon: number): Promise<GeoSearchResult[]> => {
    try {
      let headers = new Headers({
        "Accept"       : "application/json",
        "Content-Type" : "application/json",
        "User-Agent"   : "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:146.0) Gecko/20100101 Firefox/146.0"
      });
      const response = await fetch( 
        `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${lat}|${lon}&gsradius=1000&format=json&origin=*`,
          {    
            method  : 'GET', 
            headers : headers
        });
      const data: WikiApiResponse = await response.json();
      return data.query.geosearch || [];
    } catch (error) {
      console.error('Error fetching wiki places: ', error);
      return [];
    }
  }; */

  // Main search function: Get location, heading, and find closest place in direction
  const searchLocation = async () => {
    if (!coord) return;
    setIsSearching(true);
    try {
      const results = await fetchNearbyPlaces(coord);
      let best = null;
      let bestDiff = Infinity;
      for (const place of results) {
        const diff = Math.abs(angleDiff(heading, place.bearing));
        if (diff < bestDiff && diff <= HEADING_TOLERANCE) {
          best = place;
          bestDiff = diff;
        }
      }
      if (best) {
        const detail = await fetchPlaceDetail(best);
        setManualResult(detail);
        setIsSearchHidden(true)
      } else {
        setManualResult(null);
        setIsSearchHidden(false)

      }


/*
      const places = await fetchWikiPlaces(location.lat, location.lon);
      const closestInDirection = filterResultsByDirection(places, location.lat, location.lon, heading);
      setShowModal(true); */
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false); 
    }
  };

  if (!cameraPermission) {
    return <View style={styles.container} />;
  }

  if (!cameraPermission.granted) {
    requestCameraPermission();
    return (
      <View style={styles.messageContainer}>
        <Text style={styles.message}>Camera permission is required</Text>
      </View>
    );

  }

  if (locationGranted === false) {
    return (
      <View style={styles.messageContainer}>
        <Text style={styles.message}>Location permission is required</Text>
      </View>
    );
  }

  // The UI stuff
      /*   Search button 
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, isSearching && styles.buttonDisabled]}
          onPress={searchLocation}
          disabled={isSearching}
        >
          <Text style={styles.text}>{isSearching ? 'Searching...' : 'Find Nearby'}</Text>
        </TouchableOpacity> */
  return (
    <Pressable style={styles.container} onPress={() => setMenuOpen(false)}>
      <CameraView style={styles.camera} facing="back" />

      {/* ── Auto-detect mode ── */}
      {autoDetect && <AROverlay targeted={targeted} isLoading={isLoading} />}
      {autoDetect && targeted && <PlaceInfoCard place={targeted} />}


      {autoDetect && !coord && (
        <View style={styles.statusBanner}>
          <Text style={styles.statusText}>Getting your location...</Text>
        </View>
      )}
      {autoDetect && coord && places.length === 0 && !isLoading && (
        <View style={styles.statusBanner}>
          <Text style={styles.statusText}>No known places nearby</Text>
        </View>
      )}
      {autoDetect && coord && places.length > 0 && !targeted && !isLoading && (
        <View style={styles.statusBanner}>
          <Text style={styles.statusText}>Point at a building or landmark</Text>
        </View>
      )}
      {autoDetect && (
        <View style={styles.debug}>
          <Text style={styles.debugText}>
            {heading.toFixed(0)}° | {places.length} places
          </Text>
        </View>
      )}

      {/* ── Manual mode ── */}
      {!autoDetect && manualResult && <PlaceInfoCard place={manualResult} />}
      {!autoDetect && !isSearchHidden && <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, isSearching && styles.buttonDisabled]}
            onPress={searchLocation}
            disabled={isSearching}
          >
            <Text style={styles.buttonText}>
              {isSearching ? 'Searching...' : 'Find Nearby'}
            </Text>
          </TouchableOpacity>
        </View>
      }


      {/*  Monument Popup 
      { showModal && (
          <MonumentInfoModal
            onClose={() => setShowModal(false)}
            title={searchResults.title}
          summary={
            gemini
              ? "This is where the Gemini AI summary will appear."
              : "This is where the static summary will appear."
          }
        />
      ) */}


      {/* ── Hamburger menu ── */}
      <View style={styles.hamburgerContainer}>
        <TouchableOpacity
          style={styles.hamburgerButton}
          onPress={() => setMenuOpen(!menuOpen)}
        >
          <Text style={styles.hamburgerText}>☰</Text>
        </TouchableOpacity>

        {menuOpen && (
          <View style={styles.dropdown}>
            <View style={styles.dropdownToggleRow}>
              <Text style={styles.dropdownText}>Auto Detect</Text>
              <Switch
                value={autoDetect}
                onValueChange={(val) => {
                  setAutoDetect(val);
                  if (val) setManualResult(null);
                }}
                trackColor={{ false: '#555', true: '#00ffaa' }}
                thumbColor="#fff"
              />
            </View>

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
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  message: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
  statusBanner: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
  },
  debug: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  debugText: {
    color: '#aaa',
    fontSize: 12,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 64,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    width: '100%',
    paddingHorizontal: 64,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#000016',
    borderRadius: 8,
  },
  buttonDisabled: {
    backgroundColor: '#888888',
  },
  buttonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  hamburgerContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    alignItems: 'flex-start',
  },
  hamburgerButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 12,
    borderRadius: 8,
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
  dropdownToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  dropdownText: {
    color: 'white',
    fontSize: 16,
  },
});
