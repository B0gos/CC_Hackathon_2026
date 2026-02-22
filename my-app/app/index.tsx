import { useState } from 'react';
import {
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Pressable,
} from 'react-native';

import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useSettings } from '../context/SettingsContext';
import MonumentInfoModal from '../components/MonumentInfoModal';

export default function Index() {
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [showModal, setShowModal] = useState(false);

  //  Global settings access
  const { distance, gemini, tts } = useSettings();

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to use the camera
        </Text>
        <Button onPress={requestPermission} title="Grant permission" />
      </View>
    );
  }

  return (
    <Pressable
      style={styles.container}
      onPress={() => setMenuOpen(false)}
    >
      <CameraView style={styles.camera} facing="back" />

      {/*  Monument Popup */}
      <MonumentInfoModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        title="Sample Monument"
        summary={
          gemini
            ? "This is where the Gemini AI summary will appear."
            : "This is where the static summary will appear."
        }
      />

      {/*  Temporary Test Button */}
      <TouchableOpacity
        style={styles.testButton}
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.testText}>Test Popup</Text>
      </TouchableOpacity>

      {/* Hamburger */}
      <View style={styles.hamburgerContainer}>
        <TouchableOpacity
          style={styles.hamburgerButton}
          onPress={() => setMenuOpen(!menuOpen)}
        >
          <Text style={styles.hamburgerText}>☰</Text>
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
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },

  //  Test Button
  testButton: {
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
  },
  testText: {
    fontWeight: 'bold',
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
  dropdownText: {
    color: 'white',
    fontSize: 16,
  },
});