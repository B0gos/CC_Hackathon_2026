import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function FAQ() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Frequently Asked Questions</Text>

      <Text style={styles.question}>How does this app work?</Text>
      <Text style={styles.answer}>
        The app uses your GPS location and viewing direction to detect nearby
        monuments and display information when you arrive.
      </Text>

      <Text style={styles.question}>Does the camera record anything?</Text>
      <Text style={styles.answer}>
        No. The camera is only used for live viewing and interaction.
        No images or video are saved.
      </Text>

      <Text style={styles.question}>Do I need internet?</Text>
      <Text style={styles.answer}>
        An internet connection is required to load monument data and summaries.
      </Text>

      <TouchableOpacity
        style={styles.backButton}
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
  question: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  answer: {
    fontSize: 16,
    marginTop: 4,
    color: '#444',
  },
  backButton: {
    marginTop: 40,
    backgroundColor: '#000',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  backText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});