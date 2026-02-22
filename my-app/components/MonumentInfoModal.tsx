import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  summary?: string;
};

export default function MonumentInfoModal({
  visible,
  onClose,
  title = "Monument Name",
  summary = "Gemini or static summary text will appear here.",
}: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>

          {/* HEADER */}
          <Text style={styles.title}>{title}</Text>

          {/* SUMMARY AREA */}
          <ScrollView style={styles.summaryContainer}>
            <Text style={styles.summaryText}>
              {summary}
            </Text>
          </ScrollView>

          {/* CLOSE BUTTON */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxHeight: '70%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryContainer: {
    marginBottom: 20,
  },
  summaryText: {
    fontSize: 16,
    color: '#333',
  },
  closeButton: {
    backgroundColor: '#000',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});