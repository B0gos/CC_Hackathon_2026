import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';

export default function App() {
  // The Constants
  const [permission, requestPermission] = useCameraPermissions();

  // The Functions
  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to use the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  // The UI stuff
  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing='back' />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} /* onPress={ Code here } */>
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

