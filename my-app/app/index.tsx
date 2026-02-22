import { StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocation } from '../hooks/useLocation';
import { usePlaces } from '../hooks/usePlaces';
import { useTargetedPlace } from '../hooks/useTargetedPlace';
import { AROverlay } from '../components/AROverlay';
import { PlaceInfoCard } from '../components/PlaceInfoCard';

  export default function App() {
    const [cameraPermission, requestCameraPermission] = useCameraPermissions(); // Camera permission
    const { coord, heading, permissionGranted: locationGranted } = useLocation(); // live GPS + Compass heading
    const places = usePlaces(coord); // takes GPS, returns nearby Wikipedia places
    const { targeted, isLoading } = useTargetedPlace(places, heading); // takes places + heading, returns the one we are pointing at, i.e. 'targeted'
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
    return (
      <View style={styles.container}>
        <CameraView style={styles.camera} facing="back" />
        <AROverlay targeted={targeted} isLoading={isLoading} />
        {targeted && <PlaceInfoCard place={targeted} />}
        {!coord && (
          <View style={styles.statusBanner}>
            <Text style={styles.statusText}>Getting your location...</Text>
          </View>
        )}
        {coord && places.length === 0 && !isLoading && (
          <View style={styles.statusBanner}>
            <Text style={styles.statusText}>No known places nearby</Text>
          </View>
        )}
        {coord && places.length > 0 && !targeted && !isLoading && (
          <View style={styles.statusBanner}>
            <Text style={styles.statusText}>Point at a building or landmark</Text>
          </View>
        )}
        <View style={styles.debug}>
          <Text style={styles.debugText}>
            {heading.toFixed(0)}° | {places.length} places
          </Text>
        </View>
      </View>
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
  });