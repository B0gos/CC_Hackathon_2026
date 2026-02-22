import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';

export default function Index() {
  // ===== STATE =====
  const [permission, requestPermission] = useCameraPermissions();
  const [menuOpen, setMenuOpen] = useState(false);

  // ===== PERMISSION HANDLING =====
  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to use the camera
        </Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  // ===== MAIN UI =====
  return (
    <View style={styles.container}>
      {/* Camera background */}
      <CameraView style={styles.camera} facing="back" />

      {/* Hamburger Button */}
      <TouchableOpacity
        style={styles.hamburger}
        onPress={() => setMenuOpen(!menuOpen)}
      >
        <Text style={styles.hamburgerText}>☰</Text>
      </TouchableOpacity>

      {/* Hamburger Menu */}
      {menuOpen && (
        <View style={styles.menu}>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>FAQ</Text>
          </TouchableOpacity>          
        </View>
      )}

      {/* Bottom Button (placeholder) */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.text}>Button</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ===== STYLES =====
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
  // Bottom button
  buttonContainer: {
    position: 'absolute',
    bottom: 64,
    width: '100%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },

  
  // Hamburger menu
  hamburger: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },

  hamburgerText: {
    fontSize: 32,
    color: 'white',
  },

  menu: {
    position: 'absolute',
    top: 95,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderRadius: 8,
    padding: 12,
    zIndex: 9,
  },

  menuItem: {
    paddingVertical: 10,
  },

  menuText: {
    color: 'white',
    fontSize: 18,
  },
});