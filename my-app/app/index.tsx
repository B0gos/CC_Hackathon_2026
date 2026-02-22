import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useState } from 'react';

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
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [locationStatus, requestLocationPermission] = Location.useForegroundPermissions();

  // The defined Functions 
  // Get location from device and return it as [lat, lon]
  let getLocation = function() {
    let locationData = Location.getCurrentPositionAsync({});
    if(locationData.length > 2)
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


  let searchLocation = function() {
    let location = getLocation();
    let places   = fetchWikiPlaces(location.lat, location.lon);
  }

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

  // Check location permissions
  let {locationPermission} = Location.requestForegroundPermissionsAsync();
  if (locationPermission != 'granted') {
    // Location permissions are not granted yet.
    requestLocationPermission();
  }

  // The UI stuff
  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing='back' />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={searchLocation}>
          <Text style={styles.text}>Button</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


// The style stuff
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
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
    bottom: 64,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    width: '100%',
    paddingHorizontal: 64,
  },
  button: {
    flex: 1,
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});

