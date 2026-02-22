import { StyleSheet, Text, View, TouchableOpacity, Pressable, Switch } from 'react-native';
import { useState, useEffect } from 'react';
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
import { summarizePlace } from '../services/gemini';
import { HEADING_TOLERANCE, SEARCH_RADIUS } from '../constants/config';
import { PlaceDetail } from '../types';

export default function App() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [autoDetect, setAutoDetect] = useState(false);
  const { distance, gemini, tts } = useSettings();

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  useEffect(() => {
    if (cameraPermission && !cameraPermission.granted) {
      requestCameraPermission();
    }
  }, [cameraPermission]);

  // Hooks always run (React rule) — gated by what we pass in
  const { coord, heading, permissionGranted: locationGranted } = useLocation();
  const searchRadius = parseInt(distance) || SEARCH_RADIUS;
  const places = usePlaces(autoDetect ? coord : null, searchRadius);
  const { targeted, isLoading } = useTargetedPlace(
    autoDetect ? places : [],
    heading,
    gemini
  );

  // Manual-mode state
  const [manualResult, setManualResult] = useState<PlaceDetail | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const searchLocation = async () => {
    if (!coord) return;
    setIsSearching(true);
    try {
      const results = await fetchNearbyPlaces(coord, searchRadius);
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
        if (gemini) {
          try {
            detail.geminiSummary = await summarizePlace(detail.title, detail.extract);
          } catch {}
        }
        setManualResult(detail);
      } else {
        setManualResult(null);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  if (!cameraPermission?.granted) {
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

  return (
    <Pressable style={styles.container} onPress={() => setMenuOpen(false)}>
      <CameraView style={styles.camera} facing="back" />

      {/* ── Auto-detect mode ── */}
      {autoDetect && <AROverlay targeted={targeted} isLoading={isLoading} />}
      {autoDetect && targeted && <PlaceInfoCard place={targeted} tts={tts} />}

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
      {!autoDetect && manualResult && (
        <PlaceInfoCard place={manualResult} tts={tts} onClose={() => setManualResult(null)} />
      )}
      {!autoDetect && !manualResult && (
        <View style={styles.buttonContainer}>
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
      )}

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
    paddingHorizontal: 100,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#000016',
    borderRadius: 8,
  },
  buttonDisabled: {
    backgroundColor: '#888888',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  hamburgerContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    alignItems: 'flex-end',
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
