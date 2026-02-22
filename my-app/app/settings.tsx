import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSettings } from '../context/SettingsContext';
export default function Settings() {
  const router = useRouter();

  // =========================
  // SETTINGS STATE
  // =========================

  

    const { distance, setDistance, gemini, setGemini, tts, setTts } = useSettings();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      {/* =========================
          DISTANCE SETTING
          ========================= */}
      <Text style={styles.label}>Detection Distance</Text>

      {/* 
        Team:
        - Read value from `distance`
        - Convert to number if needed
        - Use as radius for GPS monument detection
      */}
      <TextInput
        style={styles.input}
        placeholder="Enter distance in meters (e.g. 100 m)"
        keyboardType="numeric"
        value={distance}
        onChangeText={setDistance}
      />

      <Text style={styles.helperText}>
        (Used to control how close you must be to a monument)
      </Text>

      {/* =========================
          GEMINI TOGGLE
          ========================= */}
      <View style={styles.row}>
        <Text style={styles.label}>Gemini Summaries</Text>

        {/* 
          🔧 Team:
          - When `gemini === true`, generate AI summaries
          - When false, use static text
        */}
        <Switch value={gemini} onValueChange={setGemini} />
      </View>

      {/* =========================
          TEXT TO SPEECH TOGGLE
          ========================= */}
      <View style={styles.row}>
        <Text style={styles.label}>Text to Speech</Text>

        {/* 
          🔧 Team:
          - When `tts === true`, auto-play audio narration
          - When false, text-only descriptions
        */}
        <Switch value={tts} onValueChange={setTts} />
      </View>

      {/* =========================
          BACK BUTTON
          ========================= */}
      <TouchableOpacity
        style={styles.back}
        onPress={() => router.back()}
      >
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 80,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 32,
  },
  label: {
    fontSize: 18,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 24,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
    marginTop: 8,
  },
  back: {
    marginTop: 40,
    backgroundColor: '#000',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  backText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});