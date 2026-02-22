import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';

import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';

export default function App() {
  // Intefaces
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
  const router = useRouter();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [locationStatus, requestLocationPermission] = Location.useForegroundPermissions();
  const [menuOpen, setMenuOpen] = useState(false);

  // The defined Functions 
  // Get location from device and return it as [lat, lon]
  let getLocation = async function() {
    let locationData = await Location.getCurrentPositionAsync({});
    if(locationData)
      return {lat: locationData.coords.latitude,
              lon: locationData.coords.longitude};
    else 
      // Handle error here
      return {lat: 0.0,
              lon: 0.0};
  }

  let fetchWikiPlaces = async (lat: number, lon: number): Promise<GeoSearchResult[]> => {
    const response = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${lat}|${lon}&gsradius=500&format=json&origin=*`
    );

    const data: WikiApiResponse = await response.json();
    return data.query.geosearch;
  };


  let searchLocation = async function() {
    let location = await getLocation();
    let places   = await fetchWikiPlaces(location.lat, location.lon);
  }

  // Request location permissions on mount
  useEffect(() => {
    const requestPermissions = async () => {
      const {status: locationPermission} = await Location.requestForegroundPermissionsAsync();
      if (locationPermission != 'granted') {
        // Location permissions are not granted yet.
        requestLocationPermission();
      }
    };
    requestPermissions();
  }, []);

  // The functions
  if (!cameraPermission || !locationStatus) {
    // Camera permissions are still loading.
    return <View />;
  }

  // Check camera Permissions
  if (!cameraPermission.granted) {
    // Camera permissions are not granted yet.
    requestCameraPermission();
  }

  // The UI stuff
  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing='back' />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={searchLocation}>
          <Text style={styles.text}>Button</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
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
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
